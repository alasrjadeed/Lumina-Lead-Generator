<?php

namespace App\Providers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class MailServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->booted(function () {
            if (!DB::getSchemaBuilder()->hasTable('settings')) {
                return;
            }

            $settings = DB::table('settings')->pluck('value', 'key')->toArray();

            $driver = $settings['mail_driver'] ?? 'smtp';
            config(['mail.default' => $driver]);

            if ($driver === 'smtp') {
                config([
                    'mail.mailers.smtp.host' => $settings['smtp_host'] ?? 'smtp.gmail.com',
                    'mail.mailers.smtp.port' => (int) ($settings['smtp_port'] ?? 587),
                    'mail.mailers.smtp.encryption' => $settings['smtp_encryption'] ?? 'tls',
                    'mail.mailers.smtp.username' => $settings['smtp_username'] ?? '',
                    'mail.mailers.smtp.password' => $settings['smtp_password'] ?? '',
                ]);
            }

            if (!empty($settings['mail_from_address'])) {
                config(['mail.from.address' => $settings['mail_from_address']]);
            }
            if (!empty($settings['mail_from_name'])) {
                config(['mail.from.name' => $settings['mail_from_name']]);
            }
        });
    }
}
