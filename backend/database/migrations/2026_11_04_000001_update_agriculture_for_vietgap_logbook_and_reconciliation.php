<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mở rộng farming_logs cho Fertigation công nghệ cao, IPM, thiên địch, hoạt chất và số lô bao bì
        Schema::table('farming_logs', function (Blueprint $table) {
            $table->string('fertigation_method', 50)->nullable()->after('activity_type'); // DRIP_EMITTER, DRENCH, FOLIAR
            $table->decimal('ec_solution', 5, 2)->nullable()->after('fertigation_method'); // EC dung dịch tưới vào (mS/cm)
            $table->decimal('ec_drain', 5, 2)->nullable()->after('ec_solution'); // EC nước thoát / Vùng rễ (mS/cm)
            $table->decimal('ph_solution', 4, 2)->nullable()->after('ec_drain'); // pH dung dịch tưới (5.5 - 6.5)
            $table->jsonb('tank_composition')->nullable()->after('ph_solution'); // Chi tiết Thùng A, Thùng B
            $table->string('pest_target', 255)->nullable()->after('tank_composition'); // Tên sâu/bệnh hại điều tra
            $table->string('pest_density', 100)->nullable()->after('pest_target'); // Mật độ hại hoặc 'KHÔNG_PHÁT_HIỆN' (VietGAP)
            $table->string('active_ingredient', 255)->nullable()->after('pest_density'); // Tên hoạt chất thuốc BVTV
            $table->string('resistance_group', 50)->nullable()->after('active_ingredient'); // Mã nhóm IRAC / FRAC chống kháng
            $table->string('material_lot_number', 100)->nullable()->after('resistance_group'); // Số lô bao bì (Lot/LSX)
            $table->string('material_export_slip_code', 100)->nullable()->after('material_lot_number'); // Mã phiếu xuất kho HTX
            $table->string('biocontrol_agent_name', 100)->nullable()->after('material_export_slip_code'); // Tên thiên địch sinh học
            $table->string('biocontrol_release_rate', 100)->nullable()->after('biocontrol_agent_name'); // Mật độ thả thiên địch
            $table->decimal('water_volume_liters', 10, 2)->nullable()->after('biocontrol_release_rate'); // Lượng nước pha (L)
            $table->string('application_equipment', 100)->nullable()->after('water_volume_liters'); // Thiết bị phun/tưới
            $table->boolean('is_phi_cleared')->default(false)->after('phi_days'); // Đã an toàn PHI
        });

        // 2. Mở rộng farm_plots cho thông tin định danh đất đai 2024, nhà màng & giá thể
        Schema::table('farm_plots', function (Blueprint $table) {
            $table->string('national_cadastral_code', 100)->nullable()->after('soil_type'); // Mã CSDL đất đai quốc gia 2024
            $table->string('land_sheet_number', 50)->nullable()->after('national_cadastral_code'); // Số tờ bản đồ
            $table->string('land_parcel_number', 50)->nullable()->after('land_sheet_number'); // Số thửa đất Sổ đỏ
            $table->integer('substrate_bag_count')->nullable()->after('land_parcel_number'); // Số lượng túi giá thể
            $table->decimal('planting_density_per_sqm', 6, 2)->nullable()->after('substrate_bag_count'); // Mật độ cây/m2
            $table->string('greenhouse_type', 50)->nullable()->after('planting_density_per_sqm'); // HIGH_TECH_GREENHOUSE, NET_HOUSE, OPEN_FIELD
        });

        // 3. Mở rộng crop_seasons cho hồ sơ giống, tiêu chuẩn cây con, hạn mức PUC Quota và Khóa sổ
        Schema::table('crop_seasons', function (Blueprint $table) {
            $table->string('seed_supplier', 255)->nullable()->after('crop'); // Hãng hạt giống / Cơ sở ươm tạo
            $table->jsonb('seedling_standard_checklist')->nullable()->after('seed_supplier'); // Tiêu chuẩn cây giống xuất vườn
            $table->jsonb('buyer_contract_info')->nullable()->after('seedling_standard_checklist'); // Đơn vị thu mua / Mã PHC
            $table->decimal('puc_quota_kg', 14, 2)->nullable()->after('buyer_contract_info'); // Hạn mức sản lượng tối đa PUC Quota
            $table->string('logbook_status', 50)->default('ACTIVE')->after('status'); // ACTIVE, FROZEN_ARCHIVED
            $table->timestamp('logbook_frozen_at')->nullable()->after('logbook_status'); // Thời điểm khóa sổ
            $table->string('logbook_final_hash', 64)->nullable()->after('logbook_frozen_at'); // Mã băm SHA-256 Merkle root
        });

        // 4. Mở rộng harvests cho thu hoạch rải vụ, đối chiếu PHI và phiếu cân sân kho
        Schema::table('harvests', function (Blueprint $table) {
            $table->integer('stage_number')->default(1)->after('crop_season_id'); // Đợt hái (1, 2, 3...)
            $table->date('last_spray_date')->nullable()->after('harvest_date'); // Ngày phun thuốc cuối
            $table->string('last_active_ingredient', 255)->nullable()->after('last_spray_date'); // Hoạt chất phun gần nhất
            $table->integer('days_since_last_spray')->nullable()->after('last_active_ingredient'); // Số ngày đã cách ly thực tế
            $table->string('weighing_slip_code', 100)->nullable()->after('batch_code'); // Số phiếu cân sân kho
            $table->decimal('rejection_weight_kg', 12, 2)->default(0)->after('actual_quantity'); // Sản lượng loại bỏ/lỗi (kg)
        });

        // 5. Tạo bảng season_material_reconciliations (Cộng sổ cân bằng kho vật tư cuối vụ)
        Schema::create('season_material_reconciliations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cooperative_id');
            $table->uuid('crop_season_id');
            $table->uuid('material_id');
            $table->string('material_name', 255);
            $table->string('unit', 30);
            $table->decimal('opening_balance', 14, 4)->default(0); // Tồn đầu vụ tại hộ
            $table->decimal('received_from_coop', 14, 4)->default(0); // Nhận từ kho HTX
            $table->decimal('used_in_logbook', 14, 4)->default(0); // Đã ghi bón/phun trong sổ
            $table->decimal('actual_closing_balance', 14, 4)->default(0); // Tồn thực tế kiểm đếm cuối vụ
            $table->decimal('variance', 14, 4)->default(0); // Chênh lệch = Thực tế - Sổ sách
            $table->integer('empty_packaging_returned')->default(0); // Vỏ bao bì/chai lọ đã thu gom
            $table->string('waste_disposal_slip_code', 100)->nullable(); // Mã phiếu tiêu hủy rác nguy hại
            $table->text('reconciliation_notes')->nullable(); // Ghi chú giải trình chênh lệch
            $table->string('status', 30)->default('DRAFT'); // DRAFT, CONFIRMED, AUDITED
            $table->uuid('reconciled_by')->nullable();
            $table->timestamps();

            $table->foreign('cooperative_id')->references('id')->on('cooperatives')->onDelete('cascade');
            $table->foreign('crop_season_id')->references('id')->on('crop_seasons')->onDelete('cascade');
            $table->foreign('material_id')->references('id')->on('materials')->onDelete('cascade');

            $table->index(['cooperative_id', 'crop_season_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('season_material_reconciliations');

        Schema::table('harvests', function (Blueprint $table) {
            $table->dropColumn([
                'stage_number',
                'last_spray_date',
                'last_active_ingredient',
                'days_since_last_spray',
                'weighing_slip_code',
                'rejection_weight_kg',
            ]);
        });

        Schema::table('crop_seasons', function (Blueprint $table) {
            $table->dropColumn([
                'seed_supplier',
                'seedling_standard_checklist',
                'buyer_contract_info',
                'puc_quota_kg',
                'logbook_status',
                'logbook_frozen_at',
                'logbook_final_hash',
            ]);
        });

        Schema::table('farm_plots', function (Blueprint $table) {
            $table->dropColumn([
                'national_cadastral_code',
                'land_sheet_number',
                'land_parcel_number',
                'substrate_bag_count',
                'planting_density_per_sqm',
                'greenhouse_type',
            ]);
        });

        Schema::table('farming_logs', function (Blueprint $table) {
            $table->dropColumn([
                'fertigation_method',
                'ec_solution',
                'ec_drain',
                'ph_solution',
                'tank_composition',
                'pest_target',
                'pest_density',
                'active_ingredient',
                'resistance_group',
                'material_lot_number',
                'material_export_slip_code',
                'biocontrol_agent_name',
                'biocontrol_release_rate',
                'water_volume_liters',
                'application_equipment',
                'is_phi_cleared',
            ]);
        });
    }
};
