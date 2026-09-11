<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('surplus_distribution_allocations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('plan_id');
            $table->uuid('member_id');
            $table->decimal('capital_contribution_snapshot', 18, 2)->default(0.00);
            $table->decimal('service_usage_snapshot', 18, 2)->default(0.00);
            $table->decimal('capital_share_amount', 18, 2)->default(0.00);
            $table->decimal('service_share_amount', 18, 2)->default(0.00);
            $table->decimal('total_allocated_amount', 18, 2)->default(0.00);
            $table->decimal('basis_value', 18, 2)->nullable();
            $table->decimal('allocation_amount', 18, 2)->nullable();
            $table->jsonb('rule_reference')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('plan_id')->references('id')->on('surplus_distribution_plans')->onDelete('cascade');
            $table->foreign('member_id')->references('id')->on('members')->onDelete('restrict');
            $table->index(['plan_id', 'member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surplus_distribution_allocations');
    }
};
