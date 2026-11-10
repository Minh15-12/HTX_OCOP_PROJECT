<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class HarvestSettlementMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public array $settlementData
    ) {}

    public function envelope(): Envelope
    {
        $voucher = $this->settlementData['voucher_number'] ?? 'PC-2026-QT01';

        return new Envelope(
            subject: "Thông Báo Quyết Toán Mùa Vụ & Cấn Trừ Nợ Nông Sản ({$voucher}) - HTX Tân Tiến"
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.harvest_settlement',
            with: [
                'memberName' => $this->settlementData['member_name'] ?? 'Xã viên HTX',
                'voucherNumber' => $this->settlementData['voucher_number'] ?? 'PC-2026-QT01',
                'seasonName' => $this->settlementData['season_name'] ?? 'Đông Xuân 2025–2026',
                'productName' => $this->settlementData['product_name'] ?? 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
                'gradeAKg' => $this->settlementData['grade_a_kg'] ?? 1250,
                'gradeBKg' => $this->settlementData['grade_b_kg'] ?? 0,
                'totalHarvestValue' => $this->settlementData['total_harvest_value'] ?? 43750000,
                'debtDeduction' => $this->settlementData['debt_deduction'] ?? 7500000,
                'coopFee' => $this->settlementData['coop_fee'] ?? 1093750,
                'netPayout' => $this->settlementData['net_payout'] ?? 35156250,
                'portalUrl' => config('app.url', 'http://localhost:3000').'/finance',
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
