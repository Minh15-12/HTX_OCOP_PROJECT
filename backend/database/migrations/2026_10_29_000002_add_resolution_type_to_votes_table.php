<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('votes') && !Schema::hasColumn('votes', 'resolution_type')) {
            Schema::table('votes', function (Blueprint $table) {
                $table->string('resolution_type', 30)->default('REGULAR')->after('resolution_code');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('votes') && Schema::hasColumn('votes', 'resolution_type')) {
            Schema::table('votes', function (Blueprint $table) {
                $table->dropColumn('resolution_type');
            });
        }
    }
};
