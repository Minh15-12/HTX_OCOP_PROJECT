<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('stock_issues') && !Schema::hasColumn('stock_issues', 'crop_season_id')) {
            Schema::table('stock_issues', function (Blueprint $table) {
                $table->uuid('crop_season_id')->nullable()->index()->after('member_id');
                $table->foreign('crop_season_id')->references('id')->on('crop_seasons')->nullOnDelete();
            });
        }

        if (Schema::hasTable('receivable_payables') && !Schema::hasColumn('receivable_payables', 'crop_season_id')) {
            Schema::table('receivable_payables', function (Blueprint $table) {
                $table->uuid('crop_season_id')->nullable()->index()->after('source_transaction_id');
                $table->foreign('crop_season_id')->references('id')->on('crop_seasons')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('stock_issues') && Schema::hasColumn('stock_issues', 'crop_season_id')) {
            Schema::table('stock_issues', function (Blueprint $table) {
                $table->dropForeign(['crop_season_id']);
                $table->dropColumn('crop_season_id');
            });
        }

        if (Schema::hasTable('receivable_payables') && Schema::hasColumn('receivable_payables', 'crop_season_id')) {
            Schema::table('receivable_payables', function (Blueprint $table) {
                $table->dropForeign(['crop_season_id']);
                $table->dropColumn('crop_season_id');
            });
        }
    }
};
