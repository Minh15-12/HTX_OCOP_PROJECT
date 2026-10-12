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
        ]);
    }
}
