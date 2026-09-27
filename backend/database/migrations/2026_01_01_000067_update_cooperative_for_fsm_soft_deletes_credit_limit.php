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
        Schema::table('members', function (Blueprint $table) {
            if (!Schema::hasColumn('members', 'credit_limit')) {
                $table->decimal('credit_limit', 15, 2)->default(0.00)->after('status');
            }
            if (!Schema::hasColumn('members', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('capital_contributions', function (Blueprint $table) {
            if (!Schema::hasColumn('capital_contributions', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (Schema::hasColumn('members', 'credit_limit')) {
                $table->dropColumn('credit_limit');
            }
            if (Schema::hasColumn('members', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        Schema::table('capital_contributions', function (Blueprint $table) {
            if (Schema::hasColumn('capital_contributions', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
