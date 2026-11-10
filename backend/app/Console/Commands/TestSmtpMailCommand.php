<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Mail\MemberApprovedMail;
use App\Mail\HarvestSettlementMail;
use App\Mail\OcopExpiringMail;

class TestSmtpMailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:test 
                            {recipient : Địa chỉ email người nhận kiểm thử} 
                            {--type=settlement : Loại email: member (kết nạp xã viên), settlement (quyết toán mùa vụ), expiring (OCOP sắp hết hạn)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kiểm thử kết nối SMTP và gửi email thông báo mẫu chuẩn HTX OCOP';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $recipient = $this->argument('recipient');
        $type = strtolower($this->option('type') ?? 'settlement');

        $this->info("==========================================================================");
        $this->info(" KIỂM THỬ KẾT NỐI SMTP & HỆ THỐNG EMAIL THÔNG BÁO HTX TÂN TIẾN OCOP");
        $this->info("==========================================================================");

        $mailer = config('mail.default');
        $host = config("mail.mailers.{$mailer}.host");
        $port = config("mail.mailers.{$mailer}.port");
        $encryption = config("mail.mailers.{$mailer}.encryption");
        $from = config('mail.from.address');
        $fromName = config('mail.from.name');

        $this->line("• Mail Driver   : <fg=yellow>{$mailer}</>");
        $this->line("• SMTP Host     : <fg=yellow>{$host}:{$port}</>");
        $this->line("• Encryption    : <fg=yellow>{$encryption}</>");
        $this->line("• From Address  : <fg=yellow>{$fromName} <{$from}></>");
        $this->line("• Recipient     : <fg=green>{$recipient}</>");
        $this->line("• Email Type    : <fg=cyan>{$type}</>");
        $this->newLine();

        $mailable = match ($type) {
            'member' => new MemberApprovedMail([
                'member_code' => 'TV031',
                'full_name' => 'HOÀNG MINH TRÍ',
                'member_type_label' => 'Xã viên chính thức',
                'join_date' => date('d/m/Y'),
                'contributed_capital' => 50000000,
                'ownership_percentage' => 4.65,
                'credit_limit' => 15000000,
            ]),
            'expiring' => new OcopExpiringMail([
                'product_name' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
                'application_number' => 'OCOP-2026-DALAT-001',
                'star_rating' => 4,
                'decision_number' => 'QĐ 842/QĐ-UBND Tỉnh Lâm Đồng',
                'expiryDate' => date('d/m/Y', strtotime('+85 days')),
                'daysRemaining' => 85,
            ]),
            default => new HarvestSettlementMail([
                'member_name' => 'Nguyễn Văn A',
                'voucher_number' => 'PC-2026-QT01',
                'season_name' => 'Vụ Đông Xuân 2025–2026',
                'product_name' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt (Chuẩn VietGAP)',
                'grade_a_kg' => 1250,
                'grade_b_kg' => 150,
                'total_harvest_value' => 47500000,
                'debt_deduction' => 7500000,
                'coop_fee' => 1187500,
                'net_payout' => 38812500,
            ]),
        };

        $this->info(">>> Đang gửi email kiểm thử tới: {$recipient}...");

        try {
            Mail::to($recipient)->send($mailable);
            $this->info("==========================================================================");
            $this->info(" GỬI EMAIL THÀNH CÔNG! (250 OK / Message Queued or Sent)");
            $this->info("==========================================================================");
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error(">>> LỖI GỬI EMAIL: " . $e->getMessage());
            $this->warn("Gợi ý khắc phục:");
            $this->line("1. Nếu sử dụng Gmail SMTP, hãy đảm bảo đã tạo Mật khẩu ứng dụng (App Password) 16 ký tự tại: https://myaccount.google.com/apppasswords");
            $this->line("2. Kiểm tra lại thông số MAIL_USERNAME và MAIL_PASSWORD trong file .env");
            $this->line("3. Đảm bảo cổng 587 (TLS) hoặc 465 (SSL) không bị chặn tường lửa (Firewall).");
            return Command::FAILURE;
        }
    }
}
