<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SystemReferenceSeeder::class,
            CouncilLevelSeeder::class,
            UserSeeder::class,
            MemberSeeder::class,
            OcopSweetPalermoCriteriaSeeder::class,
            HtxTanTienFullSystemSeeder::class,
            OcopEvidenceAndEvaluationSeeder::class,
            RichOperationalDatasetSeeder::class,
            VietGapLogbookOperationalSeeder::class,
            CropSeasonPlotAndBomSeeder::class,
            FarmingLogFieldOperationsSeeder::class,
            DurableToolAndInventorySeeder::class,
            OcopRealDossierAnalyticsSeeder::class,
        ]);
    }
}
