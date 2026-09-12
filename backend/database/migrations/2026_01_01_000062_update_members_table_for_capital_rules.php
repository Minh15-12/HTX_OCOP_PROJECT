<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->boolean('is_foreign_investor')->default(false)->after('member_type');
            $table->decimal('committed_capital', 18, 2)->default(0.00)->after('is_foreign_investor');
            $table->date('commitment_deadline')->nullable()->after('committed_capital');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn(['is_foreign_investor', 'committed_capital', 'commitment_deadline']);
        });
    }
};
