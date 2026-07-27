<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Only create tables if they don't exist (safe for existing installs)
        if (!Schema::hasTable('leads')) {
            Schema::create('leads', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->nullable();
                $table->string('phone')->nullable();
                $table->string('company')->nullable();
                $table->string('source')->nullable();
                $table->string('status')->default('new');
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('lead_scores')) {
            Schema::create('lead_scores', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lead_id')->constrained()->onDelete('cascade');
                $table->integer('score')->default(0);
                $table->string('criteria')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('lead_conversations')) {
            Schema::create('lead_conversations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lead_id')->constrained()->onDelete('cascade');
                $table->string('channel');
                $table->text('message');
                $table->string('direction')->default('outbound');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('followups')) {
            Schema::create('followups', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lead_id')->constrained()->onDelete('cascade');
                $table->string('type');
                $table->timestamp('scheduled_at');
                $table->boolean('completed')->default(false);
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('settings')) {
            Schema::create('settings', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->text('value')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('whatsapp_import_histories')) {
            Schema::create('whatsapp_import_histories', function (Blueprint $table) {
                $table->id();
                $table->string('group_name');
                $table->integer('members_imported')->default(0);
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // Ensure seo_leads has all required columns
        if (Schema::hasTable('seo_leads')) {
            $columns = Schema::getColumnListing('seo_leads');
            $addIfMissing = function ($col, $type) use ($columns) {
                if (!in_array($col, $columns)) {
                    Schema::table('seo_leads', fn ($t) => $type($t));
                }
            };
            $addIfMissing('source_url', fn ($t) => $t->string('source_url', 500)->nullable());
            $addIfMissing('tags', fn ($t) => $t->json('tags')->nullable());
            $addIfMissing('gm_data', fn ($t) => $t->json('gm_data')->nullable());
            $addIfMissing('gm_categories', fn ($t) => $t->json('gm_categories')->nullable());
            $addIfMissing('social_links', fn ($t) => $t->json('social_links')->nullable());
            $addIfMissing('additional_info', fn ($t) => $t->json('additional_info')->nullable());
            $addIfMissing('enriched_data', fn ($t) => $t->json('enriched_data')->nullable());
            $addIfMissing('whatsapp_phone', fn ($t) => $t->string('whatsapp_phone', 50)->nullable());
            $addIfMissing('last_contacted_at', fn ($t) => $t->timestamp('last_contacted_at')->nullable());
            $addIfMissing('category_name', fn ($t) => $t->string('category_name', 255)->nullable());
            $addIfMissing('location_coords', fn ($t) => $t->json('location_coords')->nullable());
            $addIfMissing('map_url', fn ($t) => $t->string('map_url', 500)->nullable());
            $addIfMissing('opening_hours', fn ($t) => $t->json('opening_hours')->nullable());
            $addIfMissing('platform_profile_name', fn ($t) => $t->string('platform_profile_name', 255)->nullable());
            $addIfMissing('followers_count', fn ($t) => $t->integer('followers_count')->nullable());
            $addIfMissing('engagement_count', fn ($t) => $t->integer('engagement_count')->nullable());
            $addIfMissing('last_post_content', fn ($t) => $t->text('last_post_content')->nullable());
        }

        // Ensure seo_lead_categories has all required columns
        if (Schema::hasTable('seo_lead_categories')) {
            $columns = Schema::getColumnListing('seo_lead_categories');
            $addIfMissing = function ($col, $type) use ($columns) {
                if (!in_array($col, $columns)) {
                    Schema::table('seo_lead_categories', fn ($t) => $type($t));
                }
            };
            $addIfMissing('progress', fn ($t) => $t->integer('progress')->default(0));
            $addIfMissing('leads_generated', fn ($t) => $t->integer('leads_generated')->default(0));
            $addIfMissing('leads_qualified', fn ($t) => $t->integer('leads_qualified')->default(0));
            $addIfMissing('last_generated_at', fn ($t) => $t->timestamp('last_generated_at')->nullable());
        }
    }

    public function down(): void
    {
        // Irreversible — this is a fix migration
    }
};
