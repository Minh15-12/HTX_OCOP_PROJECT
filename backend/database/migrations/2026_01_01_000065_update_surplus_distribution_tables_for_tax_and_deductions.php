<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('surplus_distribution_plans', function (Blueprint $table) {
            $table->decimal('internal_service_surplus', 18, 2)->default(0.00)->after('total_surplus');
            $table->decimal('external_service_surplus', 18, 2)->default(0.00)->after('internal_service_surplus');
            $table->decimal('unallocated_common_fund_amount', 18, 2)->default(0.00)->after('external_service_surplus');
            $table->decimal('patronage_distribution_rate', 5, 2)->default(51.00)->after('service_usage_weight');
        });

        Schema::table('surplus_distribution_allocations', function (Blueprint $table) {
            $table->decimal('internal_service_usage_value', 18, 2)->default(0.00)->after('service_usage_snapshot');
            $table->decimal('debt_deduction', 18, 2)->default(0.00)->after('total_allocated_amount');
            $table->decimal('net_payout_amount', 18, 2)->default(0.00)->after('debt_deduction');
            $table->boolean('reinvest_as_capital')->default(false)->after('net_payout_amount');
        });
    }

    public function down(): void
    {
        Schema::table('surplus_distribution_plans', function (Blueprint $table) {
            $table->dropColumn([
                'internal_service_surplus',
                'external_service_surplus',
                'unallocated_common_fund_amount',
                'patronage_distribution_rate',
            ]);
        });

        Schema::table('surplus_distribution_allocations', function (Blueprint $table) {
            $table->dropColumn([
                'internal_service_usage_value',
                'debt_deduction',
                'net_payout_amount',
                'reinvest_as_capital',
            ]);
        });
    }
};
