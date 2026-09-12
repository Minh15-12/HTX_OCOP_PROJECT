<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('capital_contributions', function (Blueprint $table) {
            $table->decimal('committed_amount', 18, 2)->nullable()->after('amount');
            $table->decimal('actual_amount', 18, 2)->nullable()->after('committed_amount');
            $table->decimal('ownership_ratio', 5, 2)->default(0.00)->after('actual_amount');
            $table->string('certificate_code', 50)->nullable()->unique()->after('status');
            $table->date('certificate_issue_date')->nullable()->after('certificate_code');
            $table->integer('issue_count')->default(1)->after('certificate_issue_date');
            $table->string('valuation_ref_doc', 255)->nullable()->after('issue_count');
            $table->text('qr_code_url')->nullable()->after('valuation_ref_doc');
        });
    }

    public function down(): void
    {
        Schema::table('capital_contributions', function (Blueprint $table) {
            $table->dropColumn([
                'committed_amount',
                'actual_amount',
                'ownership_ratio',
                'certificate_code',
                'certificate_issue_date',
                'issue_count',
                'valuation_ref_doc',
                'qr_code_url',
            ]);
        });
    }
};
