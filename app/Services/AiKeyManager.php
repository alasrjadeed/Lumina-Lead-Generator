<?php

namespace App\Services;

use App\Traits\DecryptsSettings;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiKeyManager
{
    use DecryptsSettings;

    protected array $settings = [];
    protected array $providerKeys = [];
    protected array $exhausted = [];

    public function __construct()
    {
        $this->settings = $this->getDecryptedSettings();
        $this->loadProviderKeys();
    }

    protected function loadProviderKeys(): void
    {
        $this->providerKeys = [
            'cloudflare' => array_filter([
                $this->settings['cloudflare_api_token'] ?? '',
            ]),
            'deepseek' => array_filter([
                $this->settings['deepseek_api_key'] ?? '',
            ]),
            'openai' => array_filter([
                $this->settings['openai_api_key'] ?? '',
                $this->settings['openai_api_key_2'] ?? '',
            ]),
            'openrouter' => array_filter([
                $this->settings['openrouter_api_key'] ?? '',
            ]),
            'groq' => array_filter([
                $this->settings['groq_api_key'] ?? '',
            ]),
            'mistral' => array_filter([
                $this->settings['mistral_api_key'] ?? '',
            ]),
            'gemini' => array_filter([
                $this->settings['google_gemini_api_key'] ?? '',
            ]),
            'nvidia' => array_filter([
                $this->settings['nvidia_api_key'] ?? '',
            ]),
            'zai' => array_filter([
                $this->settings['zai_api_key'] ?? '',
            ]),
        ];
    }

    public function getAvailableProviders(): array
    {
        return array_keys(array_filter($this->providerKeys, fn($keys) => !empty($keys)));
    }

    public function hasAnyKey(): bool
    {
        return !empty($this->getAvailableProviders());
    }

    protected function getKeysForProvider(string $provider): array
    {
        return $this->providerKeys[$provider] ?? [];
    }

    protected function isRateLimitOrQuota(int $httpCode, string $response): bool
    {
        if (in_array($httpCode, [429, 402, 403, 503])) return true;
        $lower = strtolower($response);
        return str_contains($lower, 'rate limit')
            || str_contains($lower, 'quota')
            || str_contains($lower, 'credit')
            || str_contains($lower, 'billing')
            || str_contains($lower, 'too many requests')
            || str_contains($lower, 'maximum usage')
            || str_contains($lower, 'insufficient_quota')
            || str_contains($lower, 'exceeded');
    }

    protected function keyPreview(string $key): string
    {
        return strlen($key) > 8 ? substr($key, 0, 4) . '...' . substr($key, -4) : '(short)';
    }

    /**
     * Call an AI provider with automatic key fallback.
     * Returns ['content' => string, 'provider' => string] or null.
     */
    public function call(string $provider, string $url, array $headers, array $body, string $contentPath = 'result.response'): ?array
    {
        $keys = $this->getKeysForProvider($provider);
        $exhausted = $this->exhausted[$provider] ?? [];

        $availableKeys = array_values(array_diff($keys, $exhausted));
        if (empty($availableKeys)) {
            $this->exhausted[$provider] = [];
            $availableKeys = $keys;
        }
        if (empty($availableKeys)) return null;

        foreach ($availableKeys as $key) {
            $result = $this->doRequest($url, array_merge($headers, ['Authorization' => "Bearer {$key}"]), $body, $contentPath, $key, $provider);
            if ($result !== null) return $result;

            if (!isset($this->exhausted[$provider])) $this->exhausted[$provider] = [];
            $this->exhausted[$provider][] = $key;
        }

        return null;
    }

    /**
     * Call Cloudflare AI specifically (uses accountId in URL, not Bearer auth).
     */
    public function callCloudflare(string $accountId, string $model, array $body): ?array
    {
        $keys = $this->getKeysForProvider('cloudflare');
        $exhausted = $this->exhausted['cloudflare'] ?? [];

        $availableKeys = array_values(array_diff($keys, $exhausted));
        if (empty($availableKeys)) {
            $this->exhausted['cloudflare'] = [];
            $availableKeys = $keys;
        }
        if (empty($availableKeys)) return null;

        $encodedModel = str_replace('@', '%40', $model);
        $url = "https://api.cloudflare.com/client/v4/accounts/{$accountId}/ai/run/{$encodedModel}";

        foreach ($availableKeys as $key) {
            $result = $this->doRequest($url, [
                'Authorization' => "Bearer {$key}",
                'Content-Type' => 'application/json',
            ], $body, 'result.response', $key, 'cloudflare');
            if ($result !== null) return $result;

            if (!isset($this->exhausted['cloudflare'])) $this->exhausted['cloudflare'] = [];
            $this->exhausted['cloudflare'][] = $key;
        }

        return null;
    }

    /**
     * Call a standard OpenAI-compatible API (OpenAI, OpenRouter, DeepSeek, etc.)
     */
    public function callOpenAICompatible(string $provider, string $baseUrl, array $body): ?array
    {
        $keys = $this->getKeysForProvider($provider);
        $exhausted = $this->exhausted[$provider] ?? [];

        $availableKeys = array_values(array_diff($keys, $exhausted));
        if (empty($availableKeys)) {
            $this->exhausted[$provider] = [];
            $availableKeys = $keys;
        }
        if (empty($availableKeys)) return null;

        foreach ($availableKeys as $key) {
            $result = $this->doRequest($baseUrl, [
                'Authorization' => "Bearer {$key}",
                'Content-Type' => 'application/json',
            ], $body, 'choices.0.message.content', $key, $provider);
            if ($result !== null) return $result;

            if (!isset($this->exhausted[$provider])) $this->exhausted[$provider] = [];
            $this->exhausted[$provider][] = $key;
        }

        return null;
    }

    /**
     * Call Gemini API (uses API key in query param).
     */
    public function callGemini(string $model, array $body): ?array
    {
        $keys = $this->getKeysForProvider('gemini');
        $exhausted = $this->exhausted['gemini'] ?? [];

        $availableKeys = array_values(array_diff($keys, $exhausted));
        if (empty($availableKeys)) {
            $this->exhausted['gemini'] = [];
            $availableKeys = $keys;
        }
        if (empty($availableKeys)) return null;

        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

        foreach ($availableKeys as $key) {
            $fullUrl = "{$url}?key={$key}";
            $result = $this->doRequest($fullUrl, ['Content-Type' => 'application/json'], $body, 'candidates.0.content.parts.0.text', $key, 'gemini');
            if ($result !== null) return $result;

            if (!isset($this->exhausted['gemini'])) $this->exhausted['gemini'] = [];
            $this->exhausted['gemini'][] = $key;
        }

        return null;
    }

    protected function doRequest(string $url, array $headers, array $body, string $contentPath, string $key, string $provider): ?string
    {
        try {
            $response = Http::timeout(30)->withoutVerifying()
                ->withHeaders($headers)
                ->post($url, $body);

            $httpCode = $response->status();
            $responseBody = $response->body();

            if ($this->isRateLimitOrQuota($httpCode, $responseBody)) {
                Log::warning("AiKeyManager: {$provider} rate limit/quota [{$this->keyPreview($key)}] HTTP {$httpCode}");
                return null;
            }

            if ($response->successful()) {
                $content = data_get($response->json(), $contentPath);
                if (is_string($content) && !empty($content)) {
                    Log::info("AiKeyManager: {$provider} success [{$this->keyPreview($key)}]");
                    return $content;
                }
                if (is_array($content)) {
                    Log::info("AiKeyManager: {$provider} success (array) [{$this->keyPreview($key)}]");
                    return json_encode($content);
                }
            }

            Log::warning("AiKeyManager: {$provider} failed [{$this->keyPreview($key)}] HTTP {$httpCode}");
            return null;
        } catch (\Exception $e) {
            Log::warning("AiKeyManager: {$provider} error [{$this->keyPreview($key)}]: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Try all providers in priority order. Returns parsed JSON array or [].
     */
    public function generateWithFallback(string $prompt, array $providerConfig = []): array
    {
        $defaults = [
            'max_tokens' => 4096,
        ];
        $config = array_merge($defaults, $providerConfig);

        $settings = $this->settings;

        // 1. Cloudflare (fastest)
        $accountId = $settings['cloudflare_account_id'] ?? '';
        $model = $settings['cloudflare_model'] ?? '@cf/meta/llama-3.1-8b-instruct';
        if (!empty($accountId)) {
            $models = array_unique([$model, '@cf/meta/llama-3.1-8b-instruct', '@cf/meta/llama-3-8b-instruct']);
            foreach ($models as $m) {
                $result = $this->callCloudflare($accountId, $m, [
                    'messages' => [['role' => 'user', 'content' => $prompt]],
                    'max_tokens' => $config['max_tokens'],
                ]);
                if ($result && ($parsed = $this->parseJsonResponse($result))) return $parsed;
            }
        }

        // 2. DeepSeek
        $deepseekModel = $settings['deepseek_model'] ?? 'deepseek-chat';
        $result = $this->callOpenAICompatible('deepseek', 'https://api.deepseek.com/v1/chat/completions', [
            'model' => $deepseekModel,
            'messages' => [['role' => 'user', 'content' => $prompt]],
            'max_tokens' => $config['max_tokens'],
        ]);
        if ($result && ($parsed = $this->parseJsonResponse($result))) return $parsed;

        // 3. OpenAI
        $openaiModel = $settings['openai_model'] ?? 'gpt-4o-mini';
        $result = $this->callOpenAICompatible('openai', 'https://api.openai.com/v1/chat/completions', [
            'model' => $openaiModel,
            'messages' => [['role' => 'user', 'content' => $prompt]],
            'max_tokens' => $config['max_tokens'],
        ]);
        if ($result && ($parsed = $this->parseJsonResponse($result))) return $parsed;

        // 4. GROQ
        $groqModel = $settings['groq_model'] ?? 'llama-3.1-70b-versatile';
        $result = $this->callOpenAICompatible('groq', 'https://api.groq.com/openai/v1/chat/completions', [
            'model' => $groqModel,
            'messages' => [['role' => 'user', 'content' => $prompt]],
            'max_tokens' => $config['max_tokens'],
        ]);
        if ($result && ($parsed = $this->parseJsonResponse($result))) return $parsed;

        // 5. Mistral
        $mistralModel = $settings['mistral_model'] ?? 'mistral-large-latest';
        $result = $this->callOpenAICompatible('mistral', 'https://api.mistral.ai/v1/chat/completions', [
            'model' => $mistralModel,
            'messages' => [['role' => 'user', 'content' => $prompt]],
            'max_tokens' => $config['max_tokens'],
        ]);
        if ($result && ($parsed = $this->parseJsonResponse($result))) return $parsed;

        // 6. OpenRouter
        $orModel = $settings['openrouter_model'] ?? 'meta-llama/llama-3.1-70b-instruct';
        $result = $this->callOpenAICompatible('openrouter', 'https://openrouter.ai/api/v1/chat/completions', [
            'model' => $orModel,
            'messages' => [['role' => 'user', 'content' => $prompt]],
            'max_tokens' => $config['max_tokens'],
        ]);
        if ($result && ($parsed = $this->parseJsonResponse($result))) return $parsed;

        // 7. Gemini
        $geminiModel = $settings['google_gemini_model'] ?? 'gemini-1.5-flash';
        $result = $this->callGemini($geminiModel, [
            'contents' => [['parts' => [['text' => $prompt]]]],
            'generationConfig' => ['maxOutputTokens' => $config['max_tokens']],
        ]);
        if ($result && ($parsed = $this->parseJsonResponse($result))) return $parsed;

        // 8. NVIDIA
        $nvidiaModel = $settings['nvidia_model'] ?? 'meta/llama-3.1-70b-instruct';
        $result = $this->callOpenAICompatible('nvidia', 'https://integrate.api.nvidia.com/v1/chat/completions', [
            'model' => $nvidiaModel,
            'messages' => [['role' => 'user', 'content' => $prompt]],
            'max_tokens' => $config['max_tokens'],
        ]);
        if ($result && ($parsed = $this->parseJsonResponse($result))) return $parsed;

        // 9. Z.AI
        $zaiModel = $settings['zai_model'] ?? 'glm-4';
        $result = $this->callOpenAICompatible('zai', 'https://open.bigmodel.cn/api/paas/v4/chat/completions', [
            'model' => $zaiModel,
            'messages' => [['role' => 'user', 'content' => $prompt]],
            'max_tokens' => $config['max_tokens'],
        ]);
        if ($result && ($parsed = $this->parseJsonResponse($result))) return $parsed;

        Log::error('AiKeyManager: All AI providers exhausted');
        return [];
    }

    protected function parseJsonResponse(string $content): array
    {
        $content = trim($content);
        if (strpos($content, '```') === 0) {
            $content = preg_replace('/^```(?:json)?\s*/i', '', $content);
            $content = preg_replace('/\s*```$/', '', $content);
        }
        $leads = json_decode(trim($content), true);
        return is_array($leads) ? $leads : [];
    }
}
