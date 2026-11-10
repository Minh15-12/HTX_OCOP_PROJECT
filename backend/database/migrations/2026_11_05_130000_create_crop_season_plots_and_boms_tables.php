<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Bảng phân bổ Thửa đất & Xã viên cho Mùa vụ (Hỗ trợ điều phối rải vụ Staggered Planting)
        Schema::create('crop_season_plots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('crop_season_id');
            $table->uuid('plot_id');
            $table->uuid('member_id')->nullable();
            $table->decimal('allocated_area', 10, 2); // Diện tích tham gia vụ (m2)
            $table->string('crop_variety', 100)->nullable(); // Giống cây (vd: Sweet Palermo Đỏ F1)
            $table->date('planting_date'); // Ngày xuống giống của thửa (rải vụ lệch nhau 10-15 ngày)
            $table->date('expected_harvest_start'); // Ngày bắt đầu thu bói dự kiến
            $table->date('expected_harvest_end'); // Ngày kết thúc thu hoạch dự kiến
            $table->decimal('target_yield_kg', 12, 2)->default(0); // Sản lượng cam kết giao nộp (kg)
            $table->decimal('actual_harvested_kg', 12, 2)->default(0); // Lũy kế đã thu hoạch thực tế (kg)
            $table->string('status', 30)->default('PLANNED'); // PLANNED, PLANTED, GROWING, HARVESTING, COMPLETED, CANCELLED
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('crop_season_id')->references('id')->on('crop_seasons')->onDelete('cascade');
            $table->foreign('plot_id')->references('id')->on('farm_plots')->onDelete('restrict');
            $table->foreign('member_id')->references('id')->on('members')->onDelete('set null');
            $table->unique(['crop_season_id', 'plot_id'], 'uk_season_plot');
            $table->index(['crop_season_id', 'status']);
            $table->index(['member_id', 'status']);
        });

        // 2. Bảng Dự toán Định mức Vật tư Đầu vào (BOM - Bill of Materials) & Ngân sách Mùa vụ
        Schema::create('crop_season_boms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('crop_season_id');
            $table->uuid('material_id');
            $table->string('stage_phase', 50)->nullable(); // SEEDLING, VEGETATIVE, FLOWERING, FRUITING, GENERAL
            $table->decimal('standard_rate_per_sqm', 10, 4)->default(0); // Định mức trên m2
            $table->decimal('planned_quantity', 12, 4); // Tổng số lượng kế hoạch cần dùng
            $table->decimal('issued_quantity', 12, 4)->default(0); // Số lượng kho đã xuất thực tế
            $table->decimal('estimated_unit_price', 15, 2)->default(0); // Đơn giá dự toán (VNĐ)
            $table->decimal('estimated_total_cost', 15, 2)->default(0); // Thành tiền dự toán (VNĐ)
            $table->string('notes', 255)->nullable();
            $table->timestamps();

            $table->foreign('crop_season_id')->references('id')->on('crop_seasons')->onDelete('cascade');
            $table->foreign('material_id')->references('id')->on('materials')->onDelete('restrict');
            $table->index(['crop_season_id', 'material_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crop_season_boms');
        Schema::dropIfExists('crop_season_plots');
    }
};
