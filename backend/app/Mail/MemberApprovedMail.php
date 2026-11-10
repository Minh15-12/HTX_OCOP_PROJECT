<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MemberApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public array $memberData
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Chúc Mừng Kết Nạp Xã Viên Chính Thức - HTX Nông Nghiệp Tân Tiến'
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.member_approved',
            with: [
                'memberCode' => $this->memberData['member_code'] ?? 'TV001',
                'memberName' => $this->memberData['full_name'] ?? 'Xã viên HTX',
                'memberType' => $this->memberData['member_type_label'] ?? 'Xã viên chính thức',
                'joinDate' => $this->memberData['join_date'] ?? date('d/m/Y'),
                'contributedCapital' => $this->memberData['contributed_capital'] ?? 50000000,
                'ownershipPercentage' => $this->memberData['ownership_percentage'] ?? 4.65,
                'creditLimit' => $this->memberData['credit_limit'] ?? 15000000,
                'portalUrl' => config('app.url', 'http://localhost:3000').'/members',
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
