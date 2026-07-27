<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $checks = [
            'leads' => [
                ['score', 'float', 'default', 0, 'service_interest'],
                ['last_contacted_at', 'timestamp', 'nullable', null, 'metadata'],
            ],
            'lead_scores' => [
                ['reason', 'string', 'nullable', null, 'score'],
                ['signals', 'json', 'nullable', null, 'reason'],
            ],
            'lead_conversations' => [
                ['ai_reply', 'text', 'nullable', null, 'status'],
                ['sentiment_score', 'float', 'nullable', null, 'ai_reply'],
            ],
            'followups' => [
                ['sent_at', 'timestamp', 'nullable', null, 'scheduled_at'],
            ],
        ];

        foreach ($checks as $table => $columns) {
            foreach ($columns as $col) {
                [$name, $type, $modifier, $modVal, $after] = $col;
                if (Schema::hasColumn($table, $name)) continue;

                Schema::table($table, function (Blueprint $t) use ($name, $type, $modifier, $modVal, $after, $table) {
                    $c = match ($type) {
                        'float' => $t->float($name),
                        'text' => $t->text($name),
                        'json' => $t->json($name),
                        'timestamp' => $t->timestamp($name),
                        default => $t->string($name),
                    };
                    if ($modifier === 'nullable') $c->nullable();
                    if ($modifier === 'default') $c->default($modVal);
                    if (Schema::hasColumn($table, $after)) $c->after($after);
                });
            }
        }
    }

    public function down(): void
    {
        Schema::table('leads', fn(Blueprint $t) => $t->dropColumn(['score', 'last_contacted_at']));
        Schema::table('lead_scores', fn(Blueprint $t) => $t->dropColumn(['reason', 'signals']));
        Schema::table('lead_conversations', fn(Blueprint $t) => $t->dropColumn(['ai_reply', 'sentiment_score']));
        Schema::table('followups', fn(Blueprint $t) => $t->dropColumn(['sent_at']));
    }
};
