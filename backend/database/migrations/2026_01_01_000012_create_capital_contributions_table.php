<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('capital_contributions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('member_id');
            $table->string('contribution_type', 30)->default('INITIAL'); // INITIAL, ADDITIONAL, LAND, ASSET
            $table->decimal('amount', 18, 2);
            $table->text('value_description')->nullable();
            $table->date('transaction_date')->nullable();
            $table->jsonb('evidence_reference')->nullable();
            $table->string('status', 30)->default('PAID');
            $table->timestamps();

            $table->foreign('member_id')->references('id')->on('members')->onDelete('restrict');
            $table->index(['member_id', 'transaction_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('capital_contributions');
    }
};
