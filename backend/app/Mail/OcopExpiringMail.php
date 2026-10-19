<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OcopExpiringMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public array $ocopData
    ) {}

    public function envelope(): Envelope
    {
        $product = $this->ocopData['product_name'] ?? 'Sản phẩm OCOP';
        return new Envelope(
            subject: "CẢNH BÁO: Chứng Nhận OCOP Sản Phẩm [{$product}] Sắp Hết Hạn Hiệu Lực"
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ocop_expiring',
            with: [
                'productName' => $this->ocopData['product_name'] ?? 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
                'applicationNumber' => $this->ocopData['application_number'] ?? 'OCOP-2026-DALAT-001',
                'starRating' => $this->ocopData['star_rating'] ?? 4,
                'decisionNumber' => $this->ocopData['decision_number'] ?? 'QĐ 842/QĐ-UBND Lâm Đồng',
                'expiryDate' => $this->ocopData['expiry_date'] ?? '15/01/2027',
                'daysRemaining' => $this->ocopData['days_remaining'] ?? 85,
                'portalUrl' => config('app.url', 'http://localhost:3000') . '/ocop/dossiers',
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
