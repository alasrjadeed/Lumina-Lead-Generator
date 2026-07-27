<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = DB::table('settings')->pluck('value', 'key')->toArray();

        $groups = [
            'website' => [
                'label' => 'Website',
                'icon' => 'fa-globe',
                'description' => 'Your website and business information',
                'settings' => [
                    ['key' => 'site_name', 'label' => 'Site Name', 'type' => 'text', 'placeholder' => 'Your Company Name'],
                    ['key' => 'site_url', 'label' => 'Website URL', 'type' => 'text', 'placeholder' => 'https://yourcompany.com'],
                    ['key' => 'site_email', 'label' => 'Business Email', 'type' => 'text', 'placeholder' => 'info@yourcompany.com'],
                    ['key' => 'site_phone', 'label' => 'Business Phone', 'type' => 'text', 'placeholder' => '+1 234 567 890'],
                    ['key' => 'site_address', 'label' => 'Business Address', 'type' => 'text', 'placeholder' => '123 Business St, City, Country'],
                ],
            ],
            'email_server' => [
                'label' => 'Email Server (SMTP)',
                'icon' => 'fa-envelope',
                'description' => 'Configure email sending. Use Gmail, Yahoo, Hotmail, or custom SMTP.',
                'type' => 'email_config',
                'settings' => [
                    ['key' => 'mail_driver', 'label' => 'Mail Driver', 'type' => 'select', 'options' => ['smtp' => 'SMTP', 'log' => 'Log Only (Debug)'], 'description' => 'Set to Log Only to test without sending real emails'],
                    ['key' => 'smtp_provider', 'label' => 'Email Provider', 'type' => 'select', 'options' => [
                        'gmail' => 'Gmail (smtp.gmail.com:587)',
                        'yahoo' => 'Yahoo (smtp.mail.yahoo.com:587)',
                        'outlook' => 'Outlook/Hotmail (smtp.office365.com:587)',
                        'custom' => 'Custom SMTP Server',
                    ], 'description' => 'Select provider to auto-fill host/port settings'],
                    ['key' => 'smtp_host', 'label' => 'SMTP Host', 'type' => 'text', 'placeholder' => 'smtp.gmail.com'],
                    ['key' => 'smtp_port', 'label' => 'SMTP Port', 'type' => 'text', 'placeholder' => '587'],
                    ['key' => 'smtp_encryption', 'label' => 'Encryption', 'type' => 'select', 'options' => ['tls' => 'TLS', 'ssl' => 'SSL', 'none' => 'None']],
                    ['key' => 'smtp_username', 'label' => 'SMTP Username (Email)', 'type' => 'text', 'placeholder' => 'your-email@gmail.com'],
                    ['key' => 'smtp_password', 'label' => 'SMTP Password / App Password', 'type' => 'password', 'description' => 'Gmail: use App Password (not regular password). Generate at myaccount.google.com/apppasswords'],
                    ['key' => 'mail_from_address', 'label' => 'From Email Address', 'type' => 'text', 'placeholder' => 'info@yourcompany.com'],
                    ['key' => 'mail_from_name', 'label' => 'From Name', 'type' => 'text', 'placeholder' => 'Your Company Name'],
                ],
            ],
            'ai_models' => [
                'label' => 'AI Models',
                'icon' => 'fa-brain',
                'description' => 'AI providers for content generation and lead scoring',
                'settings' => [
                    ['key' => 'cloudflare_account_id', 'label' => 'Cloudflare Account ID', 'type' => 'text'],
                    ['key' => 'cloudflare_api_token', 'label' => 'Cloudflare API Token', 'type' => 'password'],
                    ['key' => 'cloudflare_model', 'label' => 'Cloudflare Model', 'type' => 'text', 'placeholder' => '@cf/meta/llama-3.1-8b-instruct'],
                    ['key' => 'deepseek_api_key', 'label' => 'DeepSeek API Key', 'type' => 'password'],
                    ['key' => 'deepseek_model', 'label' => 'DeepSeek Model', 'type' => 'text', 'placeholder' => 'deepseek-chat'],
                    ['key' => 'openai_api_key', 'label' => 'OpenAI API Key', 'type' => 'password'],
                    ['key' => 'openai_api_key_2', 'label' => 'OpenAI API Key 2', 'type' => 'password'],
                    ['key' => 'openrouter_api_key', 'label' => 'OpenRouter API Key', 'type' => 'password'],
                    ['key' => 'groq_api_key', 'label' => 'GROQ API Key', 'type' => 'password'],
                    ['key' => 'mistral_api_key', 'label' => 'Mistral API Key', 'type' => 'password'],
                    ['key' => 'google_gemini_api_key', 'label' => 'Google Gemini API Key', 'type' => 'password'],
                    ['key' => 'google_gemini_project', 'label' => 'Gemini Project', 'type' => 'text'],
                    ['key' => 'nvidia_api_key', 'label' => 'NVIDIA API Key', 'type' => 'password'],
                    ['key' => 'huggingface_token', 'label' => 'HuggingFace Token', 'type' => 'password'],
                    ['key' => 'zai_api_key', 'label' => 'Z.AI API Key', 'type' => 'password'],
                ],
            ],
            'scraping' => [
                'label' => 'Scraping & Data',
                'icon' => 'fa-spider',
                'description' => 'Apify and web scraping configuration',
                'settings' => [
                    ['key' => 'apify_api_token', 'label' => 'Apify API Token', 'type' => 'password'],
                    ['key' => 'apify_api_token_2', 'label' => 'Apify API Token 2 (Fallback)', 'type' => 'password', 'description' => 'Auto-used when Token 1 hits rate limit or quota'],
                    ['key' => 'apify_user_id', 'label' => 'Apify User ID', 'type' => 'text'],
                    ['key' => 'serpapi_key', 'label' => 'SerpAPI Key', 'type' => 'password'],
                    ['key' => '9route_api_key', 'label' => '9Route API Key', 'type' => 'password'],
                ],
            ],
            'whatsapp' => [
                'label' => 'WhatsApp',
                'icon' => 'fa-whatsapp',
                'description' => 'WhatsApp messaging and Cloud API',
                'settings' => [
                    ['key' => 'whatsapp_cloud_token', 'label' => 'WhatsApp Cloud Access Token', 'type' => 'password'],
                    ['key' => 'whatsapp_cloud_phone_id', 'label' => 'WhatsApp Cloud Phone ID', 'type' => 'text'],
                    ['key' => 'whapi_api_token', 'label' => 'WHAPI Token', 'type' => 'password'],
                    ['key' => 'whapi_phone_number', 'label' => 'WHAPI Phone Number', 'type' => 'text'],
                ],
            ],
            'google' => [
                'label' => 'Google Services',
                'icon' => 'fa-google',
                'description' => 'Google Business, Analytics, and APIs',
                'settings' => [
                    ['key' => 'google_api_key', 'label' => 'Google API Key', 'type' => 'password'],
                    ['key' => 'google_my_business_api_key', 'label' => 'My Business API Key', 'type' => 'password'],
                    ['key' => 'gb_account_id', 'label' => 'Business Profile Account ID', 'type' => 'text'],
                    ['key' => 'gb_location_id', 'label' => 'Business Location ID', 'type' => 'text'],
                    ['key' => 'ga1_stream_id', 'label' => 'Analytics Stream ID', 'type' => 'text'],
                    ['key' => 'ga1_measurement_id', 'label' => 'Analytics Measurement ID', 'type' => 'text'],
                ],
            ],
            'social' => [
                'label' => 'Social & Content',
                'icon' => 'fa-share-nodes',
                'description' => 'Social media APIs and content tools',
                'settings' => [
                    ['key' => 'facebook_business_id', 'label' => 'Facebook Business ID', 'type' => 'text'],
                    ['key' => 'facebook_system_user_id', 'label' => 'Facebook System User ID', 'type' => 'text'],
                    ['key' => 'nvidia_repost_id', 'label' => 'NVIDIA Repost ID', 'type' => 'text'],
                    ['key' => 'elevenlabs_api_key', 'label' => 'ElevenLabs API Key', 'type' => 'password'],
                ],
            ],
            'infra' => [
                'label' => 'Infrastructure',
                'icon' => 'fa-server',
                'description' => 'Hosting, deployment, and build tools',
                'settings' => [
                    ['key' => 'render_api_key', 'label' => 'Render API Key', 'type' => 'password'],
                    ['key' => 'runninghub_api_key', 'label' => 'RunningHub API Key', 'type' => 'password'],
                    ['key' => 'comfyui_api_key', 'label' => 'ComfyUI API Key', 'type' => 'password'],
                    ['key' => 'blogger_blog_id', 'label' => 'Blogger Blog ID', 'type' => 'text'],
                ],
            ],
        ];

        return view('admin.settings.index', compact('settings', 'groups'));
    }

    public function update(Request $request)
    {
        $data = $request->except('_token');
        $updated = 0;

        foreach ($data as $key => $value) {
            $existing = DB::table('settings')->where('key', $key)->first();
            if ($existing) {
                DB::table('settings')->where('key', $key)->update([
                    'value' => $value,
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('settings')->insert([
                    'key' => $key,
                    'value' => $value,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $updated++;
        }

        Log::info("Settings updated: {$updated} keys");

        if ($request->ajax()) {
            return response()->json(['success' => true, 'message' => "Saved {$updated} settings"]);
        }

        return redirect()->route('admin.settings')->with('success', "Saved {$updated} settings");
    }
}
