<?php

namespace App\Services;

class LuminaAIService
{
    /**
     * Generate AI-powered response to a prompt
     *
     * @param string $prompt The user prompt
     * @param string|null $context Optional context identifier
     * @return array With 'content' key containing the response
     */
    public function quickAsk(string $prompt, ?string $context = null): array
    {
        // Return a generic response without actual AI call
        return [
            'content' => 'Review lead details manually for actionable insights.',
            'success' => true,
        ];
    }
}
