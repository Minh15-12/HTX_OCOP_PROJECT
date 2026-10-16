<?php

require __DIR__ . '/../../../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../../../backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Modules\Ocop\Criteria\Infrastructure\Persistence\Models\CriteriaVersionModel;

$version = CriteriaVersionModel::where('version_code', 'OCOP-QD148-2023-FRESH')
    ->with(['groups.criteria.indicators', 'scoringRules', 'mandatoryConditions'])
    ->first();

if (!$version) {
    echo "ERROR: Version not found!\n";
    exit(1);
}

echo "Version Code: {$version->version_code}\n";
echo "Version Status: {$version->status}\n";
echo "Groups Count: " . $version->groups->count() . "\n";

$grandTotal = 0.0;
$indicatorCount = 0;
foreach ($version->groups as $grp) {
    $grpTotal = 0.0;
    echo "--- Group: {$grp->code} - {$grp->name} ---\n";
    foreach ($grp->criteria as $crit) {
        echo "  Criterion: {$crit->code} ({$crit->max_score}đ) - Mandatory: " . ($crit->mandatory ? 'YES' : 'NO') . "\n";
        foreach ($crit->indicators as $ind) {
            $grpTotal += (float) $ind->max_score;
            $indicatorCount++;
            echo "    Indicator: {$ind->code} ({$ind->max_score}đ) - Mandatory: " . ($ind->mandatory ? 'YES' : 'NO') . "\n";
        }
    }
    echo "  Group Total: {$grpTotal}đ\n";
    $grandTotal += $grpTotal;
}

echo "Total Indicators: {$indicatorCount}\n";
echo "Grand Total Score: {$grandTotal}đ\n";
echo "Total Scoring Rules: " . $version->scoringRules->count() . "\n";
echo "Total Mandatory Conditions: " . $version->mandatoryConditions->count() . "\n";

foreach ($version->mandatoryConditions as $mc) {
    echo "  Condition: {$mc->condition_code} | Type: {$mc->condition_type} | Blocking: " . ($mc->blocking ? 'YES' : 'NO') . "\n";
}
