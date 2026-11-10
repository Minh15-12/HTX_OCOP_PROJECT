@extends('emails.layouts.master')

@section('content')
    <h2>THÔNG BÁO QUYẾT TOÁN MÙA VỤ & CẤN TRỪ CÔNG NỢ</h2>
    
    <p>Kính gửi Xã viên <strong>{{ $memberName }}</strong>,</p>

    <p>Ban Tài chính - Kế toán HTX Nông nghiệp Tân Tiến trân trọng thông báo bảng quyết toán thu mua nông sản mùa vụ và cấn trừ nghĩa vụ tài chính vật tư trả chậm của Ông/Bà như sau:</p>

    <div class="card">
        <span class="card-title">BẢNG KÊ QUYẾT TOÁN CHI TIẾT (MÃ PHIẾU: {{ $voucherNumber ?? 'PC-2026-QT01' }})</span>
        <table class="info-table">
            <tr>
                <td class="info-label">Mùa vụ sản xuất:</td>
                <td class="info-value">{{ $seasonName ?? 'Đông Xuân 2025–2026' }}</td>
            </tr>
            <tr>
                <td class="info-label">Nông sản thu mua:</td>
                <td class="info-value">{{ $productName ?? 'Ớt chuông Sweet Palermo Đỏ Đà Lạt' }}</td>
            </tr>
            <tr>
                <td class="info-label">Sản lượng đạt KCS:</td>
                <td class="info-value">
                    <strong>{{ number_format($gradeAKg ?? 1250, 0, ',', '.') }} kg</strong> (Grade A)
                    @if(!empty($gradeBKg))
                        + <strong>{{ number_format($gradeBKg, 0, ',', '.') }} kg</strong> (Grade B)
                    @endif
                </td>
            </tr>
            <tr>
                <td class="info-label">Tổng giá trị nông sản:</td>
                <td class="info-value" style="color: #047857; font-size: 14.5px;">+{{ number_format($totalHarvestValue ?? 43750000, 0, ',', '.') }} ₫</td>
            </tr>
            <tr>
                <td class="info-label">Khấu trừ nợ vật tư đầu vụ:</td>
                <td class="info-value" style="color: #b91c1c;">-{{ number_format($debtDeduction ?? 7500000, 0, ',', '.') }} ₫</td>
            </tr>
            <tr>
                <td class="info-label">Phí dịch vụ HTX (2.5%):</td>
                <td class="info-value" style="color: #64748b;">-{{ number_format($coopFee ?? 1093750, 0, ',', '.') }} ₫</td>
            </tr>
            <tr style="background-color: #ecfdf5; border-radius: 8px;">
                <td class="info-label" style="padding: 10px 8px; color: #065f46; font-weight: 800; font-size: 14px;">THỰC NHẬN CHUYỂN KHOẢN:</td>
                <td class="info-value" style="padding: 10px 8px; color: #047857; font-weight: 900; font-size: 16px;">
                    {{ number_format($netPayout ?? 35156250, 0, ',', '.') }} ₫
                </td>
            </tr>
        </table>
    </div>

    <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px; margin: 16px 0; font-size: 13px; color: #92400e;">
        <strong>Trạng thái công nợ:</strong> Khoản nợ vật tư trả chậm đầu vụ đã được hệ thống <strong>tất toán tự động 100%</strong>. Số tiền thực nhận đã được lệnh chuyển vào tài khoản ngân hàng của Ông/Bà.
    </div>

    <div class="btn-container">
        <a href="{{ $portalUrl ?? 'http://localhost:3000/finance' }}" class="btn">Xem Sổ Quỹ & In Phiếu Quyết Toán</a>
    </div>
@endsection
