<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class AiContentService
{
    /**
     * Generate AI content based on a prompt
     *
     * @param string $prompt The content generation prompt
     * @param string $context Optional context for caching/routing
     * @param int $maxTokens Maximum tokens to generate
     * @return array With success, content, and error keys
     */
    public function generate(string $prompt, string $context = '', int $maxTokens = 250): array
    {
        // Return a generic template response
        Log::info('AiContentService STUB: Generating content for prompt: ' . substr($prompt, 0, 100));
        
        return [
            'success' => true,
            'content' => 'This is a sample AI-generated message. Please customize it before sending.',
            'error' => null,
        ];
    }
}
