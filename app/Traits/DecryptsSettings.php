<?php

namespace App\Traits;

use Illuminate\Support\Facades\DB;

trait DecryptsSettings
{
    protected ?array $decryptedSettings = null;

    protected function getDecryptedSettings(): array
    {
        if ($this->decryptedSettings !== null) {
            return $this->decryptedSettings;
        }

        $raw = DB::table('settings')->pluck('value', 'key')->toArray();
        $this->decryptedSettings = [];
        foreach ($raw as $k => $v) {
            try {
                $this->decryptedSettings[$k] = decrypt($v);
            } catch (\Exception $e) {
                $this->decryptedSettings[$k] = $v;
            }
        }
        return $this->decryptedSettings;
    }

    protected function invalidateSettingsCache(): void
    {
        $this->decryptedSettings = null;
    }
}
