@extends('emails.layouts.master')

@section('content')
    <h2 style="color: #b45309;">CẢNH BÁO: CHỨNG NHẬN OCOP SẮP HẾT HẠN</h2>
    
    <p>Kính gửi Ban Giám đốc & Bộ phận Quản trị OCOP,</p>

    <p>Hệ thống tự động phát hiện sản phẩm OCOP sau đây sắp kết thúc thời hạn hiệu lực công nhận phân hạng theo <strong>Quyết định 148/QĐ-TTg</strong>:</p>

    <div class="card" style="border-left: 4px solid #f59e0b;">
        <span class="card-title" style="color: #b45309;">THÔNG TIN HỒ SƠ & SẢN PHẨM OCOP</span>
        <table class="info-table">
            <tr>
                <td class="info-label">Tên sản phẩm:</td>
                <td class="info-value">{{ $productName ?? 'Ớt chuông Sweet Palermo Đỏ Đà Lạt' }}</td>
            </tr>
            <tr>
                <td class="info-label">Mã số hồ sơ OCOP:</td>
                <td class="info-value"><span style="font-family: monospace; font-weight: bold;">{{ $applicationNumber ?? 'OCOP-2026-DALAT-001' }}</span></td>
            </tr>
            <tr>
                <td class="info-label">Phân hạng hiện tại:</td>
                <td class="info-value" style="color: #047857;">{{ $starRating ?? 4 }} Sao OCOP Cấp Tỉnh</td>
            </tr>
            <tr>
                <td class="info-label">Quyết định công nhận:</td>
                <td class="info-value">{{ $decisionNumber ?? 'QĐ 842/QĐ-UBND Lâm Đồng' }}</td>
            </tr>
            <tr>
                <td class="info-label">Ngày hết hạn công nhận:</td>
                <td class="info-value" style="color: #dc2626; font-weight: 800;">{{ $expiryDate ?? '15/01/2027' }}</td>
            </tr>
            <tr>
                <td class="info-label">Thời gian còn lại:</td>
                <td class="info-value" style="color: #dc2626; font-weight: 800;">{{ $daysRemaining ?? '85' }} ngày</td>
            </tr>
        </table>
    </div>

    <p><strong>Khuyến nghị từ Hội đồng Đánh giá:</strong></p>
    <ul style="padding-left: 20px; font-size: 13.5px; color: #334155;">
        <li>Kiểm tra và cập nhật lại Phiếu kiểm nghiệm chỉ tiêu an toàn vi sinh & kim loại nặng (hạn dưới 6 tháng).</li>
        <li>Rà soát nhật ký canh tác điện tử và chứng nhận VietGAP mới nhất.</li>
        <li>Tạo đợt hồ sơ tái đánh giá trên Cổng thông tin OCOP để không bị gián đoạn hiệu lực tem nhãn trên thị trường.</li>
    </ul>

    <div class="btn-container">
        <a href="{{ $portalUrl ?? 'http://localhost:3000/ocop/dossiers' }}" class="btn">Mở Hồ Sơ & Nộp Tái Đánh Giá</a>
    </div>
@endsection
