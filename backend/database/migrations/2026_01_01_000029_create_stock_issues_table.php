<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_issues', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cooperative_id');
            $table->uuid('warehouse_id')->nullable();
            $table->string('issue_number', 100);
            $table->date('issue_date');
            $table->uuid('member_id')->nullable();
            $table->string('purpose', 255)->nullable();
            $table->string('status', 30)->default('DRAFT'); // DRAFT, SUBMITTED, APPROVED, CANCELLED
            $table->decimal('total_amount', 18, 2)->default(0.00);
            $table->uuid('created_by')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->timestamps();

            $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('restrict');
            $table->foreign('warehouse_id')->references('id')->on('warehouses')->onDelete('restrict');
            $table->foreign('member_id')->references('id')->on('members')->onDelete('restrict');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('restrict');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('restrict');
            $table->unique(['cooperative_id', 'issue_number']);
            $table->index(['cooperative_id', 'issue_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_issues');
    }
};
