<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_lead_categories', function (Blueprint $table) {
            $table->id();
            $table->string('category_name');
            $table->text('keywords')->nullable();
            $table->string('location')->nullable();
            $table->string('platforms')->default('["google_maps","instagram"]');
            $table->integer('max_leads')->default(50);
            $table->integer('priority')->default(5);
            $table->boolean('auto_enrich')->default(false);
            $table->integer('min_score_threshold')->default(0);
            $table->text('target_audience')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('seo_leads', function (Blueprint $table) {
            $table->id();
            $table->string('source')->nullable()->index();
            $table->string('business_name')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->string('category')->nullable();
            $table->string('social_instagram')->nullable();
            $table->string('social_facebook')->nullable();
            $table->decimal('rating', 3, 2)->nullable();
            $table->integer('reviews_count')->default(0);
            $table->integer('lead_score')->default(0);
            $table->string('status')->default('new')->index();
            $table->text('notes')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('seo_lead_categories')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('seo_lead_outreach', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('seo_leads')->cascadeOnDelete();
            $table->string('outreach_type')->nullable();
            $table->text('message_template')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->boolean('response_received')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_lead_outreach');
        Schema::dropIfExists('seo_leads');
        Schema::dropIfExists('seo_lead_categories');
    }
};
