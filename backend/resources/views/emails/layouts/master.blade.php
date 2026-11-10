<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'Thông báo từ HTX Nông Nghiệp Tân Tiến' }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.6;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f1f5f9;
            padding: 30px 10px;
        }
        .main-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: linear-gradient(135deg, #053725 0%, #0d6b46 100%);
            padding: 32px 24px;
            text-align: center;
            color: #ffffff;
        }
        .header-logo-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 50px;
            padding: 6px 16px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 12px;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 900;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 6px 0 0 0;
            font-size: 13px;
            color: #a7f3d0;
            font-weight: 500;
        }
        .content {
            padding: 32px 28px;
        }
        .content h2 {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 16px;
        }
        .card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        .card-title {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #059669;
            margin-bottom: 12px;
            display: block;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13.5px;
        }
        .info-table td {
            padding: 8px 0;
            border-bottom: 1px dashed #e2e8f0;
        }
        .info-table tr:last-child td {
            border-bottom: none;
        }
        .info-label {
            color: #64748b;
            font-weight: 500;
            width: 45%;
        }
        .info-value {
            color: #0f172a;
            font-weight: 700;
            text-align: right;
        }
        .btn-container {
            text-align: center;
            margin: 28px 0 16px 0;
        }
        .btn {
            display: inline-block;
            background-color: #0d6b46;
            color: #ffffff !important;
            font-weight: 800;
            font-size: 14px;
            padding: 12px 28px;
            border-radius: 10px;
            text-decoration: none;
            box-shadow: 0 2px 4px rgba(13, 107, 70, 0.25);
        }
        .footer {
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            padding: 24px 28px;
            font-size: 12px;
            color: #64748b;
            text-align: center;
            line-height: 1.6;
        }
        .footer strong {
            color: #1e293b;
        }
        .footer-links {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main-container">
            <!-- Header Banner -->
            <div class="header">
                <div class="header-logo-badge">Hệ Thống Quản Trị HTX & OCOP 148</div>
                <h1>HTX NÔNG NGHIỆP TÂN TIẾN</h1>
                <p>Nông sản Đà Lạt - Chuẩn VietGAP & OCOP 4 Sao</p>
            </div>

            <!-- Email Body Content -->
            <div class="content">
                @yield('content')
            </div>

            <!-- Legal Footer -->
            <div class="footer">
                <p><strong>HỢP TÁC XÃ NÔNG NGHIỆP TÂN TIẾN</strong></p>
                <p>Thôn Đạ Sar, Xã Đạ Sar, Huyện Lạc Dương, Tỉnh Lâm Đồng</p>
                <p>Mã số HTX: 5801458923 | Hotline: 0263 382 9999 | Email: contact@htxtantien.vn</p>
                <div class="footer-links">
                    <span>Hệ thống chuyển đổi số HTX Nông nghiệp theo Luật HTX 2023 & Quyết định 148/QĐ-TTg</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
