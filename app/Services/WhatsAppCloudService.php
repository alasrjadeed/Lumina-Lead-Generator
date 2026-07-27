<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class WhatsAppCloudService
{
    protected ?string $token;
    protected ?string $phoneId;

    /**
     * @param string|null $token WhatsApp Cloud API access token
     * @param string|null $phoneId WhatsApp Business phone number ID
     */
    public function __construct(?string $token, ?string $phoneId)
    {
        $this->token = $token;
        $this->phoneId = $phoneId;
    }

    /**
     * Check if WhatsApp Cloud API is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->token) && !empty($this->phoneId);
    }

    /**
     * Send a WhatsApp message
     *
     * @param string $to Recipient phone number (without +)
     * @param string $message Message text
     * @return bool True if message was sent successfully (or logged in stub mode)
     */
    public function sendMessage(string $to, string $message): bool
    {
        if (!$this->isConfigured()) {
            Log::warning("WhatsAppCloudService: Not configured - cannot send message to {$to}");
            return false;
        }

        // Log the message instead of sending (stub mode)
        Log::info("WhatsAppCloudService STUB: Would send to {$to}: " . substr($message, 0, 200));
        
        return true; // Return true to indicate "success" in stub mode
    }

    /**
     * Send a WhatsApp template message
     *
     * @param string $to Recipient phone number
     * @param string $templateName Template name
     * @param array $parameters Template parameters
     * @return bool
     */
    public function sendTemplate(string $to, string $templateName, array $parameters = []): bool
    {
        if (!$this->isConfigured()) {
            return false;
        }

        Log::info("WhatsAppCloudService STUB: Would send template {$templateName} to {$to}");
        return true;
    }
}
