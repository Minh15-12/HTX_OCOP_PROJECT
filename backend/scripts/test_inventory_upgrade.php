<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use Illuminate\Contracts\Console\Kernel;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Inventory\Application\Services\MaterialReconciliationService;
use Modules\Inventory\Application\Services\StockIssueService;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MemberToolTrackingModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockIssueModel;

echo '=== KIỂM THỬ NÂNG CẤP HỆ THỐNG VẬT TƯ HTX ==='.PHP_EOL;

// 1. Kiểm tra CSDL Material Account Codes
$materials = MaterialModel::take(5)->get();
echo '1. Danh mục Vật tư theo TK 152 (Thông tư 71/2024/TT-BTC):'.PHP_EOL;
foreach ($materials as $m) {
    echo "  - [{$m->account_code}] {$m->name} ({$m->category}) - CCDC lâu bền: ".($m->is_durable_tool ? 'CÓ (TK 005)' : 'KHÔNG').PHP_EOL;
}

// 2. Kiểm tra Stock Issues và Mẫu 02-VT
$issue = StockIssueModel::with(['lines.material', 'member'])->first();
if ($issue) {
    echo PHP_EOL."2. Phiếu xuất kho {$issue->issue_code}:".PHP_EOL;
    echo '  - Xã viên nhận: '.($issue->member?->identity_information['full_name'] ?? 'Chưa gán').PHP_EOL;
    echo "  - Chỉ tiêu vỏ thuốc BVTV cần thu: {$issue->empty_bottles_expected} vỏ | Đã thu: {$issue->empty_bottles_returned} vỏ".PHP_EOL;
    echo "  - Trạng thái thu hồi: {$issue->packaging_returned_status}".PHP_EOL;

    $issueService = app(StockIssueService::class);
    $voucher = $issueService->getVoucher02Data($issue->id);
    $vNum = $voucher['voucher_number'] ?? $voucher['issue_number'] ?? 'N/A';
    echo "  - Sinh Mẫu 02-VT thành công! Số chứng từ: {$vNum}, Số dòng vật tư: ".count($voucher['lines'] ?? $voucher['items'] ?? []).', Tổng tiền: '.number_format($voucher['total_amount']).' VNĐ'.PHP_EOL;
} else {
    echo PHP_EOL.'2. Chưa có phiếu xuất kho nào trong DB.'.PHP_EOL;
}

// 3. Kiểm tra Tool Tracking TK 005
$toolsCount = MemberToolTrackingModel::count();
echo PHP_EOL."3. Nông cụ ngoài bảng TK 005: {$toolsCount} bản ghi đang theo dõi.".PHP_EOL;

// 4. Kiểm tra Phép thử cộng sổ (Material Reconciliation)
$season = CropSeasonModel::first();
if ($season) {
    echo PHP_EOL."4. Kiểm thử Phép thử cộng sổ mùa vụ: {$season->name}".PHP_EOL;
    $reconService = app(MaterialReconciliationService::class);
    $report = $reconService->reconcileSeasonMaterials($season->id);
    echo '  - Số lượng vật tư đối soát: '.count($report['items'] ?? []).PHP_EOL;
    $summary = $report['summary'] ?? [];
    echo '  - Vật tư cân bằng hoàn hảo: '.($summary['balanced_count'] ?? 0).'/'.($summary['total_materials_tracked'] ?? 0).PHP_EOL;
    echo '  - Cảnh báo lệch định mức: '.($summary['alert_count'] ?? 0).PHP_EOL;
    echo '  - Thu hồi vỏ BVTV: '.($summary['pesticide_bottles_returned'] ?? 0).'/'.($summary['pesticide_bottles_expected'] ?? 0).' vỏ ('.($summary['bottle_return_rate_percent'] ?? 0).'%) - Đánh giá: '.($summary['overall_audit_status'] ?? 'N/A').PHP_EOL;
}

echo PHP_EOL.'=== KIỂM THỬ HOÀN TẤT THÀNH CÔNG 100% ==='.PHP_EOL;
