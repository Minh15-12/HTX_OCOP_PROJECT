<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mở rộng farming_logs cho Offline Sync, Geofencing, Khóa lùi ngày & Duyệt 2 cấp ICS
        Schema::table('farming_logs', function (Blueprint $table) {
            $table->string('client_uuid', 100)->nullable()->index()->after('id');
            $table->string('status', 30)->default('VERIFIED')->after('application_equipment'); // SUBMITTED, VERIFIED, REJECTED
            $table->boolean('is_backdated')->default(false)->after('status');
            $table->uuid('verified_by')->nullable()->after('is_backdated');
            $table->timestamp('verified_at')->nullable()->after('verified_by');
            $table->text('rejection_reason')->nullable()->after('verified_at');
            $table->string('hash_sha256', 64)->nullable()->after('rejection_reason');
            $table->string('prev_hash', 64)->nullable()->after('hash_sha256');
            $table->decimal('gps_distance_to_edge_meters', 8, 2)->nullable()->after('gps_longitude');
            $table->boolean('is_gps_verified')->default(true)->after('gps_distance_to_edge_meters');
            $table->text('voice_raw_text')->nullable()->after('description');

            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['status', 'activity_date']);
        });

        // 2. Tạo bảng farming_log_items hỗ trợ phối trộn Tank-Mix (thuốc sâu + bệnh + phân bón lá)
        Schema::create('farming_log_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('farming_log_id');
            $table->uuid('material_id')->nullable();
            $table->string('material_name', 255);
            $table->string('item_type', 50)->default('PESTICIDE'); // PESTICIDE, FERTILIZER, BIOCONTROL, OTHER
            $table->string('active_ingredient', 255)->nullable();
            $table->string('resistance_group', 50)->nullable();
            $table->decimal('quantity_applied', 12, 4);
            $table->string('unit', 50);
            $table->integer('phi_days')->default(0);
            $table->string('material_lot_number', 100)->nullable();
            $table->string('material_export_slip_code', 100)->nullable();
            $table->timestamps();

            $table->foreign('farming_log_id')->references('id')->on('farming_logs')->onDelete('cascade');
            $table->foreign('material_id')->references('id')->on('materials')->onDelete('set null');
            $table->index(['farming_log_id', 'material_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farming_log_items');

        Schema::table('farming_logs', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropIndex(['client_uuid']);
            $table->dropIndex(['status', 'activity_date']);
            $table->dropColumn([
                'client_uuid',
                'status',
                'is_backdated',
                'verified_by',
                'verified_at',
                'rejection_reason',
                'hash_sha256',
                'prev_hash',
                'gps_distance_to_edge_meters',
                'is_gps_verified',
                'voice_raw_text',
            ]);
        });
    }
};
