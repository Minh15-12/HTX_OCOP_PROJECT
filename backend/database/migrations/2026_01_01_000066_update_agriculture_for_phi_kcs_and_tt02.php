<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('farming_logs', function (Blueprint $table) {
            $table->uuid('material_id')->nullable()->after('activity_type');
            $table->string('material_batch_number', 100)->nullable()->after('material_id');
            $table->decimal('quantity_applied', 18, 4)->nullable()->after('material_batch_number');
            $table->string('unit', 30)->nullable()->after('quantity_applied');
            $table->integer('phi_days')->nullable()->after('unit');
            $table->decimal('gps_latitude', 10, 8)->nullable()->after('phi_days');
            $table->decimal('gps_longitude', 11, 8)->nullable()->after('gps_latitude');

            $table->foreign('material_id')->references('id')->on('materials')->onDelete('set null');
        });

        Schema::table('harvests', function (Blueprint $table) {
            $table->string('kcs_status', 30)->default('PENDING_KCS')->after('unit');
            $table->jsonb('kcs_gate_check')->nullable()->after('kcs_status');
            $table->jsonb('kcs_quick_lab')->nullable()->after('kcs_gate_check');
            $table->string('grade', 20)->default('GRADE_B')->after('kcs_quick_lab');
            $table->decimal('brix_level', 5, 2)->nullable()->after('grade');
            $table->decimal('uniformity_rate', 5, 2)->nullable()->after('brix_level');
        });
    }

    public function down(): void
    {
        Schema::table('harvests', function (Blueprint $table) {
            $table->dropColumn([
                'kcs_status',
                'kcs_gate_check',
                'kcs_quick_lab',
                'grade',
                'brix_level',
                'uniformity_rate',
            ]);
        });

        Schema::table('farming_logs', function (Blueprint $table) {
            $table->dropForeign(['material_id']);
            $table->dropColumn([
                'material_id',
                'material_batch_number',
                'quantity_applied',
                'unit',
                'phi_days',
                'gps_latitude',
                'gps_longitude',
            ]);
        });
    }
};
