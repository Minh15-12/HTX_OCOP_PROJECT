<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Str;
use Modules\Agriculture\Infrastructure\Persistence\Models\CropSeasonModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel;
use Modules\Inventory\Infrastructure\Persistence\Models\MemberToolTrackingModel;
use Modules\Inventory\Infrastructure\Persistence\Models\StockIssueModel;

echo '=== SEEDING DỮ LIỆU NÂNG CẤP VẬT TƯ HTX ==='.PHP_EOL;

$coop = CooperativeModel::first();
$coopId = $coop ? $coop->id : '00000000-0000-0000-0000-000000000001';
$memberA = MemberModel::first();
$plot = FarmPlotModel::first();
$season = CropSeasonModel::where('name', 'LIKE', '%Sweet Palermo%')->first() ?: CropSeasonModel::first();

// 1. Tạo/Cập nhật các nông cụ CCDC lâu bền theo dõi TK 005
$toolsData = [
    [
        'sku' => 'TOOL-FELCO-02',
        'name' => 'Kéo tỉa cành trợ lực chuyên dụng Felco 2 (Thụy Sĩ)',
        'category' => 'TOOL',
        'account_code' => '1525',
        'is_durable_tool' => true,
        'unit' => 'cái',
        'current_stock' => 25,
        'min_safety_stock' => 5,
        'unit_price' => 1250000,
        'status' => 'ACTIVE',
    ],
    [
        'sku' => 'TOOL-OSHIMA-16L',
        'name' => 'Bình phun điện ắc quy Oshima OS-16L (Công nghệ Nhật)',
        'category' => 'TOOL',
        'account_code' => '1525',
        'is_durable_tool' => true,
        'unit' => 'bộ',
        'current_stock' => 12,
        'min_safety_stock' => 3,
        'unit_price' => 1850000,
        'status' => 'ACTIVE',
    ],
    [
        'sku' => 'TOOL-HANNA-ECPH',
        'name' => 'Bút đo độ dẫn điện EC & pH dung dịch tưới Hanna HI98129',
        'category' => 'TOOL',
        'account_code' => '1525',
        'is_durable_tool' => true,
        'unit' => 'cái',
        'current_stock' => 8,
        'min_safety_stock' => 2,
        'unit_price' => 3450000,
        'status' => 'ACTIVE',
    ],
];

$createdToolIds = [];
foreach ($toolsData as $td) {
    $mat = MaterialModel::updateOrCreate(
        ['cooperative_id' => $coopId, 'sku' => $td['sku']],
        array_merge($td, ['id' => Str::uuid()->toString()])
    );
    $createdToolIds[] = $mat->id;
    echo "  - Cập nhật nông cụ: {$mat->name} [TK {$mat->account_code}]".PHP_EOL;
}

// 2. Giao nông cụ lâu bền cho Xã viên (Theo dõi ngoài bảng TK 005)
if ($memberA && count($createdToolIds) >= 2) {
    MemberToolTrackingModel::updateOrCreate(
        [
            'cooperative_id' => $coopId,
            'serial_number' => 'FELCO-2026-0089',
        ],
        [
            'member_id' => $memberA->id,
            'material_id' => $createdToolIds[0],
            'farm_plot_id' => $plot?->id,
            'quantity' => 1,
            'assigned_date' => '2026-01-10',
            'status' => 'IN_USE',
            'note' => 'Kéo bấm tỉa cành định hình thân chính Sweet Palermo, có khắc laser mã số HTX-089',
        ]
    );

    MemberToolTrackingModel::updateOrCreate(
        [
            'cooperative_id' => $coopId,
            'serial_number' => 'HANNA-EC-0042',
        ],
        [
            'member_id' => $memberA->id,
            'material_id' => $createdToolIds[2] ?? $createdToolIds[1],
            'farm_plot_id' => $plot?->id,
            'quantity' => 1,
            'assigned_date' => '2026-02-15',
            'status' => 'IN_USE',
            'note' => 'Bút đo kiểm soát EC bồn pha dinh dưỡng A/B tự động',
        ]
    );

    MemberToolTrackingModel::updateOrCreate(
        [
            'cooperative_id' => $coopId,
            'serial_number' => 'FELCO-2025-0012',
        ],
        [
            'member_id' => $memberA->id,
            'material_id' => $createdToolIds[0],
            'farm_plot_id' => $plot?->id,
            'quantity' => 1,
            'assigned_date' => '2025-06-15',
            'status' => 'REPLACED',
            'note' => 'Đã đổi mới 1:1 sang chiếc FELCO-2026-0089 do mòn lưỡi cắt',
        ]
    );
    echo "  - Đã seed 3 bản ghi Nông cụ ngoài bảng TK 005 cho xã viên {$memberA->identity_information['full_name']}.".PHP_EOL;
}

// 3. Cập nhật phiếu xuất kho để có Thu hồi vỏ chai thuốc BVTV (TTLT 05/2016)
$pesticideIssue = StockIssueModel::where('cooperative_id', $coopId)->first();
if ($pesticideIssue) {
    $pesticideIssue->update([
        'is_credit' => true,
        'empty_bottles_expected' => 10,
        'empty_bottles_returned' => 8,
        'packaging_returned_status' => 'PARTIALLY_RETURNED',
        'packaging_proof_url' => 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
        'packaging_returned_at' => now()->subDays(2),
        'purpose' => "Cấp ứng nợ đầu vụ phân bón & thuốc BVTV sinh học vụ mùa {$season?->name}",
    ]);
    echo "  - Đã cập nhật Phiếu xuất kho {$pesticideIssue->issue_code}: Yêu cầu thu 10 vỏ, đã thu 8 vỏ (súc rửa 3 lần).".PHP_EOL;
}

echo '=== SEEDING HOÀN TẤT THÀNH CÔNG ==='.PHP_EOL;
