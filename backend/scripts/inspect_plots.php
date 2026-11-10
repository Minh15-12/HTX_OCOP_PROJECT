<?php

require_once __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

use Illuminate\Contracts\Console\Kernel;
use Modules\Agriculture\Infrastructure\Persistence\Models\FarmPlotModel;
use Modules\Agriculture\Infrastructure\Persistence\Models\ProductionUnitModel;

echo "=== PRODUCTION UNITS ===\n";
foreach (ProductionUnitModel::all() as $u) {
    echo "Unit: {$u->unit_code} - {$u->name} | GPS: {$u->gps_latitude}, {$u->gps_longitude}\n";
}

echo "\n=== FARM PLOTS ===\n";
foreach (FarmPlotModel::all() as $p) {
    $geo = $p->geometry_geojson;
    $firstPt = $geo['coordinates'][0][0] ?? null;
    $ptStr = $firstPt ? json_encode($firstPt) : 'none';
    $vn2000 = $p->vn2000_coordinates ? 'has_vn2000('.count($p->vn2000_coordinates).')' : 'none';
    echo "Plot: {$p->plot_code} | Area: {$p->area} | Geo: {$ptStr} | VN2000: {$vn2000}\n";
}
