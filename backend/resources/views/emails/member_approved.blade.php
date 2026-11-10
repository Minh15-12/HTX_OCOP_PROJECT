@extends('emails.layouts.master')

@section('content')
    <h2>CHÚC MỪNG XÃ VIÊN MỚI GIA NHẬP HTX</h2>
    
    <p>Kính gửi Ông/Bà <strong>{{ $memberName }}</strong>,</p>

    <p>Hội đồng Quản trị Hợp tác xã Nông nghiệp Tân Tiến trân trọng thông báo: Hồ sơ đăng ký gia nhập HTX của Ông/Bà đã được thẩm định và <strong>chính thức phê duyệt kết nạp</strong> theo Nghị quyết của Đại hội thành viên.</p>

    <div class="card">
        <span class="card-title">THÔNG TIN XÃ VIÊN & VỐN GÓP ĐIỀU LỆ</span>
        <table class="info-table">
            <tr>
                <td class="info-label">Mã số xã viên:</td>
                <td class="info-value"><span style="font-family: monospace; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px;">{{ $memberCode }}</span></td>
            </tr>
            <tr>
                <td class="info-label">Họ và tên:</td>
                <td class="info-value">{{ $memberName }}</td>
            </tr>
            <tr>
                <td class="info-label">Phân loại thành viên:</td>
                <td class="info-value">{{ $memberType ?? 'Xã viên chính thức' }}</td>
            </tr>
            <tr>
                <td class="info-label">Ngày gia nhập:</td>
                <td class="info-value">{{ $joinDate ?? date('d/m/Y') }}</td>
            </tr>
            <tr>
                <td class="info-label">Vốn góp đã hoàn thành:</td>
                <td class="info-value" style="color: #047857; font-size: 15px;">{{ number_format($contributedCapital ?? 50000000, 0, ',', '.') }} ₫</td>
            </tr>
            <tr>
                <td class="info-label">Tỷ lệ sở hữu vốn:</td>
                <td class="info-value">{{ $ownershipPercentage ?? '4.65' }}%</td>
            </tr>
            <tr>
                <td class="info-label">Hạn mức nợ vật tư đầu vụ:</td>
                <td class="info-value" style="color: #b45309;">{{ number_format($creditLimit ?? 15000000, 0, ',', '.') }} ₫</td>
            </tr>
            <tr>
                <td class="info-label">Quyền biểu quyết:</td>
                <td class="info-value"><span style="color: #0d6b46; font-weight: 800;">1 Phiếu ngang nhau (Điều 19 Luật HTX)</span></td>
            </tr>
        </table>
    </div>

    <p>Kể từ ngày hôm nay, Ông/Bà được hưởng toàn bộ quyền lợi về:</p>
    <ul style="padding-left: 20px; font-size: 13.5px; color: #334155;">
        <li>Ưu đãi nhận ứng trước giống, phân bón sinh học và thuốc BVTV trả chậm đầu vụ.</li>
        <li>Bao tiêu sản phẩm nông sản theo hợp đồng liên kết chuỗi giá trị OCOP 4 sao.</li>
        <li>Hưởng phân phối thặng dư cuối năm (tối thiểu 51% theo doanh số dịch vụ).</li>
        <li>Tham gia biểu quyết tại Đại hội thành viên thường niên.</li>
    </ul>

    <div class="btn-container">
        <a href="{{ $portalUrl ?? 'http://localhost:3000/members' }}" class="btn">Truy Cập Cổng Quản Trị HTX</a>
    </div>

    <p style="font-size: 12.5px; color: #64748b; margin-top: 24px;">
        * Giấy chứng nhận vốn góp điện tử có tích hợp mã QR xác thực đã được lưu trữ an toàn trong hồ sơ cá nhân của Ông/Bà.
    </p>
@endsection
