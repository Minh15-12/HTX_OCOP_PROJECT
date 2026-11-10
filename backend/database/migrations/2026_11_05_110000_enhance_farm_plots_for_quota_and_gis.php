<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mở rộng farm_plots cho ranh giới GeoJSON, tọa độ địa chính VN-2000, trần năng suất và hợp đồng đất
        Schema::table('farm_plots', function (Blueprint $table) {
            $table->jsonb('geometry_geojson')->nullable()->after('land_relation'); // Tọa độ đa giác thực địa GeoJSON
            $table->jsonb('vn2000_coordinates')->nullable()->after('geometry_geojson'); // Tọa độ địa chính VN-2000 từ Sổ đỏ
            $table->decimal('max_yield_rate_per_sqm', 6, 2)->default(5.00)->after('planting_density_per_sqm'); // Năng suất trần sinh học (kg/m2)
            $table->date('land_contract_expired_at')->nullable()->after('quarantine_until'); // Thời hạn hợp đồng góp đất (Luật Đất đai 2024)
        });

        // 2. Mở rộng harvests cho cơ chế chống gian lận tuồn hàng ngoài vùng (Phương án B: Cảnh báo vàng CẦN_ĐỐI_SOÁT)
        Schema::table('harvests', function (Blueprint $table) {
            $table->boolean('is_over_quota')->default(false)->after('rejection_weight_kg'); // Vượt trần sản lượng sinh học
            $table->decimal('quota_excess_kg', 12, 2)->default(0)->after('is_over_quota'); // Khối lượng vượt trần (kg)
            $table->string('quota_audit_status', 50)->default('NORMAL')->after('quota_excess_kg'); // NORMAL, NEEDS_RECONCILIATION, APPROVED_OVERRIDE
            $table->text('quota_audit_note')->nullable()->after('quota_audit_status'); // Ghi chú giải trình của Ban Kiểm soát
        });
    }

    public function down(): void
    {
        Schema::table('farm_plots', function (Blueprint $table) {
            $table->dropColumn([
                'geometry_geojson',
                'vn2000_coordinates',
                'max_yield_rate_per_sqm',
                'land_contract_expired_at',
            ]);
        });

        Schema::table('harvests', function (Blueprint $table) {
            $table->dropColumn([
                'is_over_quota',
                'quota_excess_kg',
                'quota_audit_status',
                'quota_audit_note',
            ]);
        });
    }
};
