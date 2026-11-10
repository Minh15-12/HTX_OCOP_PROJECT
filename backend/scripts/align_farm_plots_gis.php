<?php

require_once __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

use Illuminate\Contracts\Console\Kernel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\ProductionUnitModel;

echo "=== CẬP NHẬT TỌA ĐỘ VÀ RANH GIỚI GIS CHUẨN ĐÀ LẠT CHO CÁC THỬA ĐẤT ===\n";

// 1. Cập nhật tọa độ chuẩn cho Vùng trồng VT-DALAT-01
$unit = ProductionUnitModel::where('unit_code', 'VT-DALAT-01')->first();
if ($unit) {
    $loc = $unit->location ?? [];
    $loc['latitude'] = 11.9540;
    $loc['longitude'] = 108.4620;
    $loc['address'] = 'Khu nông nghiệp công nghệ cao Hòn Bồ, Phường 12, TP. Đà Lạt, Lâm Đồng';
    $unit->location = $loc;
    $unit->save();
    echo "1. Đã cập nhật tọa độ tâm trạm VT-DALAT-01: 11.9540°N, 108.4620°E\n";
}

// 2. Chuyển đổi ngược WGS-84 sang VN-2000
function wgs84ToVn2000($latDeg, $lngDeg, $centralMeridian = 107.75)
{
    $a = 6378137.0;
    $f = 1 / 298.257223563;
    $e2 = 2 * $f - $f * $f;
    $ePrime2 = $e2 / (1 - $e2);
    $k0 = 0.9999;
    $falseEasting = 500000.0;
    $L0 = $centralMeridian * (M_PI / 180);

    $phi = ($latDeg * M_PI) / 180;
    $lambda = ($lngDeg * M_PI) / 180;
    $deltaLambda = $lambda - $L0;

    $sinPhi = sin($phi);
    $cosPhi = cos($phi);
    $tanPhi = tan($phi);

    $N = $a / sqrt(1 - $e2 * $sinPhi * $sinPhi);
    $T = $tanPhi * $tanPhi;
    $C = $ePrime2 * $cosPhi * $cosPhi;
    $A = $cosPhi * $deltaLambda;

    $M = $a * (
        (1 - $e2 / 4 - 3 * pow($e2, 2) / 64 - 5 * pow($e2, 3) / 256) * $phi -
        (3 * $e2 / 8 + 3 * pow($e2, 2) / 32 + 45 * pow($e2, 3) / 1024) * sin(2 * $phi) +
        (15 * pow($e2, 2) / 256 + 45 * pow($e2, 3) / 1024) * sin(4 * $phi) -
        (35 * pow($e2, 3) / 3072) * sin(6 * $phi)
    );

    $x = $k0 * (
        $M + $N * $tanPhi * (
            pow($A, 2) / 2 +
            (5 - $T + 9 * $C + 4 * pow($C, 2)) * pow($A, 4) / 24 +
            (61 - 58 * $T + pow($T, 2) + 600 * $C - 330 * $ePrime2) * pow($A, 6) / 720
        )
    );

    $y = $falseEasting + $k0 * $N * (
        $A +
        (1 - $T + $C) * pow($A, 3) / 6 +
        (5 - 18 * $T + pow($T, 2) + 72 * $C - 58 * $ePrime2) * pow($A, 5) / 120
    );

    return ['x' => round($x, 2), 'y' => round($y, 2)];
}

// 3. Phân bổ các thửa đất theo ma trận nhà màng công nghệ cao tại thung lũng Đà Lạt
// Mỗi thửa cách nhau khoảng 10-15m đường nội đồng
$baseLat = 11.9525;
$baseLng = 108.4600;
$plotWidthDeg = 0.00065; // ~70 mét kinh độ
$plotHeightDeg = 0.00055; // ~60 mét vĩ độ
$gapLngDeg = 0.00015; // ~16 mét lối đi
$gapLatDeg = 0.00012; // ~13 mét lối đi

$plots = FarmPlotModel::orderBy('plot_code')->get();
$cols = 4;

foreach ($plots as $idx => $plot) {
    $row = floor($idx / $cols);
    $col = $idx % $cols;

    $pMinLat = $baseLat + $row * ($plotHeightDeg + $gapLatDeg);
    $pMaxLat = $pMinLat + $plotHeightDeg;
    $pMinLng = $baseLng + $col * ($plotWidthDeg + $gapLngDeg);
    $pMaxLng = $pMinLng + $plotWidthDeg;

    // Đa giác khép kín WGS-84 GeoJSON [lng, lat]
    $ring = [
        [$pMinLng, $pMinLat],
        [$pMaxLng, $pMinLat],
        [$pMaxLng, $pMaxLat],
        [$pMinLng, $pMaxLat],
        [$pMinLng, $pMinLat],
    ];

    // Tọa độ Sổ đỏ VN-2000 4 đỉnh
    $vn1 = wgs84ToVn2000($pMinLat, $pMinLng);
    $vn2 = wgs84ToVn2000($pMinLat, $pMaxLng);
    $vn3 = wgs84ToVn2000($pMaxLat, $pMaxLng);
    $vn4 = wgs84ToVn2000($pMaxLat, $pMinLng);

    $vnPoints = [
        ['point_number' => 1, 'x' => $vn1['x'], 'y' => $vn1['y']],
        ['point_number' => 2, 'x' => $vn2['x'], 'y' => $vn2['y']],
        ['point_number' => 3, 'x' => $vn3['x'], 'y' => $vn3['y']],
        ['point_number' => 4, 'x' => $vn4['x'], 'y' => $vn4['y']],
    ];

    // Chuẩn hóa diện tích: nếu diện tích < 100, nhân 1000 để phản ánh diện tích thực tế m2
    $currentArea = (float) $plot->area;
    $nominalArea = ($currentArea < 100 && $currentArea > 0) ? ($currentArea * 1000) : $currentArea;
    if ($nominalArea <= 0) {
        $nominalArea = 3500;
    }

    $plot->geometry_geojson = [
        'type' => 'Polygon',
        'coordinates' => [$ring],
    ];
    $plot->vn2000_coordinates = $vnPoints;
    $plot->area = $nominalArea;
    $plot->max_yield_rate_per_sqm = $plot->max_yield_rate_per_sqm ?: 5.0;

    // Gán thông tin canh tác và vị trí
    $rel = $plot->land_relation ?? [];
    $rel['gps_latitude'] = ($pMinLat + $pMaxLat) / 2;
    $rel['gps_longitude'] = ($pMinLng + $pMaxLng) / 2;
    $plot->land_relation = $rel;

    $plot->save();

    echo " -> [Thửa #{$idx}] {$plot->plot_code}: Diện tích {$nominalArea} m² | Ranh giới: [{$pMinLat}, {$pMinLng}] -> [{$pMaxLat}, {$pMaxLng}]\n";
}

echo "\n=== ĐÃ HOÀN TẤT ĐỒNG BỘ 100% RANH GIỚI VÀ TỌA ĐỘ THỬA ĐẤT TẠI ĐÀ LẠT ===\n";
