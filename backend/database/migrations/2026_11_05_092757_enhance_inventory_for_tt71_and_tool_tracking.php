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
        // 1. Enhance materials with TT71 account codes and durable tool flag
        Schema::table('materials', function (Blueprint $table) {
            if (!Schema::hasColumn('materials', 'account_code')) {
                $table->string('account_code', 20)->default('1521')->after('category');
            }
            if (!Schema::hasColumn('materials', 'is_durable_tool')) {
                $table->boolean('is_durable_tool')->default(false)->after('account_code');
            }
        });

        // 2. Enhance stock_issues with hazardous packaging return tracking (TTLT 05/2016)
        Schema::table('stock_issues', function (Blueprint $table) {
            if (!Schema::hasColumn('stock_issues', 'packaging_returned_status')) {
                $table->string('packaging_returned_status', 30)->default('NOT_REQUIRED')->after('status');
            }
            if (!Schema::hasColumn('stock_issues', 'empty_bottles_expected')) {
                $table->integer('empty_bottles_expected')->default(0)->after('packaging_returned_status');
            }
            if (!Schema::hasColumn('stock_issues', 'empty_bottles_returned')) {
                $table->integer('empty_bottles_returned')->default(0)->after('empty_bottles_expected');
            }
            if (!Schema::hasColumn('stock_issues', 'packaging_proof_url')) {
                $table->string('packaging_proof_url', 1000)->nullable()->after('empty_bottles_returned');
            }
            if (!Schema::hasColumn('stock_issues', 'packaging_returned_at')) {
                $table->timestamp('packaging_returned_at')->nullable()->after('packaging_proof_url');
            }
            if (!Schema::hasColumn('stock_issues', 'packaging_returned_by')) {
                $table->uuid('packaging_returned_by')->nullable()->after('packaging_returned_at');
                $table->foreign('packaging_returned_by')->references('id')->on('users')->nullOnDelete();
            }
        });

        // 3. Create member_tool_trackings table for off-balance Account 005 (TK 005)
        if (!Schema::hasTable('member_tool_trackings')) {
            Schema::create('member_tool_trackings', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('cooperative_id');
                $table->uuid('member_id');
                $table->uuid('farm_plot_id')->nullable();
                $table->uuid('material_id');
                $table->string('serial_number', 100)->nullable();
                $table->integer('quantity')->default(1);
                $table->string('status', 30)->default('IN_USE'); // IN_USE, MAINTENANCE, DAMAGED_RETURNED, LOST
                $table->date('assigned_date');
                $table->date('returned_date')->nullable();
                $table->text('note')->nullable();
                $table->uuid('created_by')->nullable();
                $table->timestamps();

                $table->foreign('cooperative_id')->references('id')->on('cooperatives')->cascadeOnDelete();
                $table->foreign('member_id')->references('id')->on('members')->cascadeOnDelete();
                $table->foreign('farm_plot_id')->references('id')->on('farm_plots')->nullOnDelete();
                $table->foreign('material_id')->references('id')->on('materials')->cascadeOnDelete();
                $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();

                $table->index(['cooperative_id', 'status']);
                $table->index(['member_id', 'status']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_tool_trackings');

        Schema::table('stock_issues', function (Blueprint $table) {
            $table->dropForeign(['packaging_returned_by']);
            $table->dropColumn([
                'packaging_returned_status',
                'empty_bottles_expected',
                'empty_bottles_returned',
                'packaging_proof_url',
                'packaging_returned_at',
                'packaging_returned_by',
            ]);
        });

        Schema::table('materials', function (Blueprint $table) {
            $table->dropColumn(['account_code', 'is_durable_tool']);
        });
    }
};
