<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('seo_leads', function (Blueprint $table) {
            $table->string('lead_type')->default('unknown')->after('lead_score');
            $table->index('lead_type');
        });
    }

    public function down(): void
    {
        Schema::table('seo_leads', function (Blueprint $table) {
            $table->dropColumn('lead_type');
        });
    }
};
