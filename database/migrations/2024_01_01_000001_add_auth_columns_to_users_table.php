<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $table = Schema::connection('sqlite')->getColumnListing('users');

        if (!in_array('remember_token', $table)) {
            Schema::table('users', function (Blueprint $table) {
                $table->rememberToken();
            });
        }
        if (!in_array('email_verified_at', $table)) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('email_verified_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['remember_token', 'email_verified_at']);
        });
    }
};
