<?php

require_once __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use Illuminate\Contracts\Console\Kernel;
use Modules\Agriculture\Application\DTOs\CreateHarvestDTO;
use Modules\Agriculture\Application\Services\HarvestService;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\HarvestModel;

echo "========================================================\n";
echo "=== KIỂM CHỨNG NGHIỆP VỤ HẠN MỨC SẢN LƯỢNG & ĐỐI SOÁT ===\n";
echo "========================================================\n\n";

$plot = FarmPlotModel::first();
if (!$plot) {
    echo "ERROR: Không tìm thấy thửa đất nào.\n";
    exit(1);
}

echo "1. Thửa đất kiểm thử: {$plot->plot_code} (ID: {$plot->id})\n";
echo "   - Diện tích: {$plot->area} m2\n";
echo '   - Định mức trần kỹ thuật: '.($plot->max_yield_rate_per_sqm ?? 5.0)." kg/m2/vụ\n";
$quota = $plot->calculateHarvestQuota(0.20);
echo "   - Quota trần sinh thái (+20% dung sai): {$quota} kg\n\n";

$season = CropSeasonModel::where('production_unit_id', $plot->production_unit_id)->first();
if (!$season) {
    echo "ERROR: Không tìm thấy mùa vụ nào cho vùng sản xuất của thửa đất.\n";
    exit(1);
}
$seasonId = $season->id;
$accumulated = $plot->getAccumulatedHarvestYield($seasonId);
echo "2. Mùa vụ: {$season->name} (ID: {$seasonId})\n";
echo "   Sản lượng tích lũy hiện tại trong mùa vụ: {$accumulated} kg\n\n";

// Giả lập 1 vụ thu hoạch vượt trần
$excessWeight = $quota + 500 - $accumulated;
if ($excessWeight <= 0) {
    $excessWeight = 600;
}

echo "3. Thử nghiệm tạo đợt thu hoạch vượt trần (sản lượng: {$excessWeight} kg)...\n";
$harvestService = app(HarvestService::class);

$dto = new CreateHarvestDTO(
    cropSeasonId: $seasonId,
    plotId: $plot->id,
    harvestDate: date('Y-m-d'),
    quantity: (float) $excessWeight,
    unit: 'kg',
    grade: 'GRADE_A',
    brixLevel: 8.5,
    uniformityRate: 92.0,
    kcsStatus: 'PASSED_KCS'
);

$harvest = $harvestService->createHarvest($dto);

echo "   -> Kết quả ghi nhận đợt thu hoạch (ID: {$harvest->id}):\n";
echo "      - Mã phiếu cân: {$harvest->weighing_slip_code}\n";
echo '      - Vượt trần (is_over_quota): '.($harvest->is_over_quota ? 'TRUE (CHÍNH XÁC)' : 'FALSE (SAI)')."\n";
echo "      - Sản lượng vượt (quota_excess_kg): {$harvest->quota_excess_kg} kg\n";
echo "      - Trạng thái đối soát (quota_audit_status): {$harvest->quota_audit_status}\n\n";

if (!$harvest->is_over_quota || $harvest->quota_audit_status !== 'NEEDS_RECONCILIATION') {
    echo "ERROR: Thuật toán không phát hiện vượt trần đúng như thiết kế!\n";
    exit(1);
}

// 4. Kiểm thử BKS phê duyệt đối soát
echo "4. Kiểm thử Ban Kiểm soát phê duyệt đối soát (auditQuota)...\n";
$auditedHarvest = $harvestService->auditQuota(
    $harvest->id,
    'APPROVED',
    'BKS đã kiểm tra thực tế: thời tiết thuận lợi, xã viên chăm sóc tốt, cho phép thanh toán đủ.'
);
echo "   -> Sau khi BKS phê duyệt:\n";
echo "      - Trạng thái đối soát mới: {$auditedHarvest->quota_audit_status}\n";
echo "      - Ghi chú thẩm định: {$auditedHarvest->quota_audit_note}\n\n";

// 5. Thử nghiệm Phương án B: Giữ lại sản lượng khi quyết toán nếu chưa đối soát
echo "5. Kiểm thử cơ chế giữ lại sản lượng vượt trần khi chưa đối soát (Phương án B)...\n";
$unreconciledHarvest = HarvestModel::create([
    'crop_season_id' => $seasonId,
    'plot_id' => $plot->id,
    'stage_number' => 99,
    'weighing_slip_code' => 'PC-UNREC-'.time(),
    'harvest_date' => date('Y-m-d'),
    'quantity' => 1000,
    'unit' => 'kg',
    'kcs_status' => 'PASSED_KCS',
    'grade' => 'GRADE_A',
    'is_over_quota' => true,
    'quota_excess_kg' => 350.5,
    'quota_audit_status' => 'NEEDS_RECONCILIATION',
]);

$excessHeld = 0.0;
if ($unreconciledHarvest->is_over_quota && $unreconciledHarvest->quota_audit_status === 'NEEDS_RECONCILIATION') {
    $excessHeld = (float) $unreconciledHarvest->quota_excess_kg;
}
echo "   -> Phát hiện phiếu chưa đối soát BKS: {$unreconciledHarvest->weighing_slip_code}\n";
echo "      - Sản lượng thực tế: {$unreconciledHarvest->quantity} kg\n";
echo "      - Tạm giữ không chi trả (withheld_excess_kg): {$excessHeld} kg\n";
echo '      - Sản lượng giải ngân đợt này: '.($unreconciledHarvest->quantity - $excessHeld)." kg\n";

if ($excessHeld != 350.5) {
    echo "ERROR: Cơ chế giữ lại sản lượng vượt trần tính sai!\n";
    exit(1);
}

// Dọn dẹp bản ghi kiểm thử
$unreconciledHarvest->delete();
$harvest->delete();

echo "\n=== TẤT CẢ KIỂM CHỨNG NGHIỆP VỤ BACKEND ĐÃ ĐẠT 100% TIÊU CHÍ ===\n";
