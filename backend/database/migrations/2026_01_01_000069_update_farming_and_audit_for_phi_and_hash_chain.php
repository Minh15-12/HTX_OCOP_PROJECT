<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('farm_plots') && !Schema::hasColumn('farm_plots', 'quarantine_until')) {
            Schema::table('farm_plots', function (Blueprint $table) {
                $table->date('quarantine_until')->nullable()->after('status');
            });
        }

        if (Schema::hasTable('audit_events') && !Schema::hasColumn('audit_events', 'current_hash')) {
            Schema::table('audit_events', function (Blueprint $table) {
                $table->string('prev_hash', 64)->nullable()->after('request_id');
                $table->string('current_hash', 64)->nullable()->after('prev_hash');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('audit_events', 'current_hash')) {
            Schema::table('audit_events', function (Blueprint $table) {
                $table->dropColumn(['prev_hash', 'current_hash']);
            });
        }

        if (Schema::hasColumn('farm_plots', 'quarantine_until')) {
            Schema::table('farm_plots', function (Blueprint $table) {
                $table->dropColumn('quarantine_until');
            });
        }
    }
};
