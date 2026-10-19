<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class OcopEvidenceAndEvaluationSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $coopId = 'a60ccf85-7301-43f7-b6d3-b25f72c75b78'; // HTX Nông Nghiệp Tân Tiến

        // 1. Ensure Evaluator Users exist
        $defaultPassword = Hash::make('password123');
        $evaluatorRoleId = DB::table('roles')->where('name', 'Giám khảo OCOP')->value('id');

        $evaluators = [
            [
                'username' => 'danhgia01',
                'email' => 'danhgia@htxphuthinh.vn',
                'full_name' => 'Nguyễn Văn Giám Khảo',
                'phone' => '0987654327',
                'title' => 'Chuyên viên Chi cục Phát triển Nông thôn Lâm Đồng',
            ],
            [
                'username' => 'danhgia02',
                'email' => 'maiphuong.lacduong@lamdong.gov.vn',
                'full_name' => 'Trần Thị Mai Phương',
                'phone' => '0912389111',
                'title' => 'Phó Trưởng phòng NN&PTNT Huyện Lạc Dương',
            ],
            [
                'username' => 'danhgia03',
                'email' => 'hoangquan.ktht@lacduong.gov.vn',
                'full_name' => 'Lê Hoàng Quân',
                'phone' => '0938472999',
                'title' => 'Chuyên viên Phòng Kinh tế & Hạ tầng Huyện Lạc Dương',
            ],
        ];

        $evaluatorUserIds = [];
        foreach ($evaluators as $idx => $eData) {
            $user = DB::table('users')->where('username', $eData['username'])->first();
            if ($user) {
                $evaluatorUserIds[$idx] = $user->id;
            } else {
                $uId = (string) Str::uuid();
                DB::table('users')->insert([
                    'id' => $uId,
                    'username' => $eData['username'],
                    'email' => $eData['email'],
                    'password' => $defaultPassword,
                    'full_name' => $eData['full_name'],
                    'phone_number' => $eData['phone'],
                    'cooperative_id' => $coopId,
                    'status' => 'ACTIVE',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $evaluatorUserIds[$idx] = $uId;
            }

            if ($evaluatorRoleId) {
                $hasRole = DB::table('user_roles')
                    ->where('user_id', $evaluatorUserIds[$idx])
                    ->where('role_id', $evaluatorRoleId)
                    ->exists();
                if (!$hasRole) {
                    DB::table('user_roles')->insert([
                        'user_id' => $evaluatorUserIds[$idx],
                        'role_id' => $evaluatorRoleId,
                    ]);
                }
            }
        }

        // Get admin user for uploader/verifier
        $adminUserId = DB::table('users')->where('username', 'admin_htx')->value('id') 
            ?? DB::table('users')->where('username', 'admin')->value('id');

        // 2. Fetch OCOP Application (OCOP-2026-DALAT-001: Ớt chuông Sweet Palermo)
        $application = DB::table('ocop_applications')->where('application_number', 'OCOP-2026-DALAT-001')->first();
        if (!$application) {
            $this->command->error("Không tìm thấy hồ sơ OCOP-2026-DALAT-001. Vui lòng chạy HtxTanTienFullSystemSeeder trước.");
            return;
        }
        $appId = $application->id;

        // 3. Fetch Indicators Map
        $indicators = DB::table('indicators')->pluck('id', 'code')->toArray();

        // Clean existing evidence records for this application to avoid duplicates
        $oldEvIds = DB::table('evidences')->where('application_id', $appId)->pluck('id')->toArray();
        if (!empty($oldEvIds)) {
            DB::table('evidence_links')->whereIn('evidence_id', $oldEvIds)->delete();
            DB::table('evidence_versions')->whereIn('evidence_id', $oldEvIds)->delete();
            DB::table('evidences')->whereIn('id', $oldEvIds)->delete();
        }

        // 4. Seed 11 Authentic Evidences according to QĐ 148/QĐ-TTg
        $evidencesData = [
            [
                'indicator_code' => 'TC-A.1.1',
                'title' => 'Giấy xác nhận vùng nguyên liệu tập trung số 14/XN-NN-LD',
                'evidence_type' => 'LEGAL_DOCUMENT',
                'source_type' => 'SYSTEM_GENERATED',
                'file_name' => '14_XN_NN_LD_Xac_Nhan_Vung_Trong_Sweet_Palermo_12.5ha.pdf',
                'file_reference' => 'evidences/2026/01/14_XN_NN_LD_Xac_Nhan_Vung_Trong_Sweet_Palermo_12.5ha.pdf',
                'checksum' => 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                'mime_type' => 'application/pdf',
                'file_size' => 2415800,
                'note' => 'Xác nhận 100% diện tích 12.5 ha nhà màng của 31 xã viên nằm trên địa bàn xã Đạ Sar và Phường 12 Đà Lạt, tỉnh Lâm Đồng.',
            ],
            [
                'indicator_code' => 'TC-A.2.1',
                'title' => 'Danh sách trích ngang 31 xã viên & Hợp đồng lao động bản địa số 01-18/HĐLĐ-TT',
                'evidence_type' => 'LEGAL_DOCUMENT',
                'source_type' => 'SYSTEM_GENERATED',
                'file_name' => 'Danh_Sach_Xa_Vien_Hop_Dong_Lao_Dong_Ban_Dia_2026.pdf',
                'file_reference' => 'evidences/2026/01/Danh_Sach_Xa_Vien_Hop_Dong_Lao_Dong_Ban_Dia_2026.pdf',
                'checksum' => 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
                'mime_type' => 'application/pdf',
                'file_size' => 1845200,
                'note' => '100% xã viên là thường trú nhân tỉnh Lâm Đồng; 18 lao động thời vụ bản địa là đồng bào dân tộc K\'Ho được đóng bảo hiểm y tế và tai nạn lao động.',
            ],
            [
                'indicator_code' => 'TC-A.3.1',
                'title' => 'Hợp đồng liên kết bao tiêu nông sản 3 năm số 08/2025/HĐ-TT-COOP với Saigon Co.op',
                'evidence_type' => 'LEGAL_DOCUMENT',
                'source_type' => 'UPLOAD',
                'file_name' => '08_2025_HD_TT_COOP_Bao_Tieu_15_Tan_Thang.pdf',
                'file_reference' => 'evidences/2026/01/08_2025_HD_TT_COOP_Bao_Tieu_15_Tan_Thang.pdf',
                'checksum' => 'c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
                'mime_type' => 'application/pdf',
                'file_size' => 3120400,
                'note' => 'Cam kết sản lượng tiêu thụ tối thiểu 15 tấn/tháng cho chuỗi Co.opmart & Co.opXtra toàn quốc với mức giá sàn bảo hiểm cho xã viên.',
            ],
            [
                'indicator_code' => 'TC-A.4.1',
                'title' => 'Kế hoạch Bảo vệ Môi trường số 09/ĐA-STNMT & Biên bản thu gom vỏ bao gói BVTV',
                'evidence_type' => 'LEGAL_DOCUMENT',
                'source_type' => 'UPLOAD',
                'file_name' => '09_DA_STNMT_Ke_Hoach_BVMT_Bien_Ban_Thu_Gom_BVTV.pdf',
                'file_reference' => 'evidences/2026/01/09_DA_STNMT_Ke_Hoach_BVMT_Bien_Ban_Thu_Gom_BVTV.pdf',
                'checksum' => 'd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
                'mime_type' => 'application/pdf',
                'file_size' => 2200500,
                'note' => 'Quy trình thu gom vỏ chai thuốc BVTV vào bể chứa xi măng tiêu chuẩn; biên bản chuyển giao xử lý chất thải nguy hại với Công ty Môi trường Đô thị Đà Lạt.',
            ],
            [
                'indicator_code' => 'TC-B.1.1',
                'title' => 'Hóa đơn điện tử chuỗi WinMart & Chứng nhận Gian hàng OCOP sàn PostMart',
                'evidence_type' => 'PROCESS_PHOTO',
                'source_type' => 'UPLOAD',
                'file_name' => 'Kenh_Phan_Phoi_WinMart_PostMart_OCOP_Official.pdf',
                'file_reference' => 'evidences/2026/01/Kenh_Phan_Phoi_WinMart_PostMart_OCOP_Official.pdf',
                'checksum' => 'e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7',
                'mime_type' => 'application/pdf',
                'file_size' => 4180000,
                'note' => 'Phân phối tại 45 siêu thị WinMart miền Nam và gian hàng chính thức được Sở Công Thương Lâm Đồng bảo trợ trên sàn TMĐT PostMart.',
            ],
            [
                'indicator_code' => 'TC-B.1.2',
                'title' => 'Giấy cấp quyền mã số mã vạch GS1 Việt Nam số 893853123401 & Tem QR Truy xuất',
                'evidence_type' => 'CERTIFICATE',
                'source_type' => 'UPLOAD',
                'file_name' => 'GS1_893853123401_Quy_Chuan_Bao_Bi_Tem_QR.pdf',
                'file_reference' => 'evidences/2026/01/GS1_893853123401_Quy_Chuan_Bao_Bi_Tem_QR.pdf',
                'checksum' => 'f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8',
                'mime_type' => 'application/pdf',
                'file_size' => 1950300,
                'note' => 'Bao bì màng sinh học tự hủy đạt Nghị định 43/2017/NĐ-CP; gắn mã QR truy xuất trực tuyến tới từng lô thu hoạch, nhật ký bón phân và phun xịt.',
            ],
            [
                'indicator_code' => 'TC-B.2.1',
                'title' => 'Ấn phẩm câu chuyện sản phẩm "Sweet Palermo Tân Tiến - Giọt ngọt tinh túy Langbiang"',
                'evidence_type' => 'LEGAL_DOCUMENT',
                'source_type' => 'UPLOAD',
                'file_name' => 'Cau_Chuyen_San_Pham_Sweet_Palermo_Langbiang_Bilingual.pdf',
                'file_reference' => 'evidences/2026/01/Cau_Chuyen_San_Pham_Sweet_Palermo_Langbiang_Bilingual.pdf',
                'checksum' => 'a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
                'mime_type' => 'application/pdf',
                'file_size' => 5400200,
                'note' => 'Tài liệu song ngữ Việt - Anh kết hợp video clip phóng sự 3 phút về mô hình kinh tế tập thể nông nghiệp tuần hoàn của đồng bào dân tộc thiểu số bản địa.',
            ],
            [
                'indicator_code' => 'TC-C.1.1',
                'title' => 'Phiếu kết quả thử nghiệm QUATEST 3 số KT3-04921/2025/TN (Độ Brix 9.4°Bx, Vitamin C)',
                'evidence_type' => 'LAB_REPORT',
                'source_type' => 'UPLOAD',
                'file_name' => 'QUATEST3_KT3_04921_2025_Brix_VitaminC_HeavyMetals.pdf',
                'file_reference' => 'evidences/2026/01/QUATEST3_KT3_04921_2025_Brix_VitaminC_HeavyMetals.pdf',
                'checksum' => 'b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0',
                'mime_type' => 'application/pdf',
                'file_size' => 1650800,
                'note' => 'Trung tâm Kỹ thuật Tiêu chuẩn Đo lường Chất lượng 3 cấp: Độ ngọt Brix 9.4°Bx (chuẩn >= 8.0); Hàm lượng Vitamin C đạt 142mg/100g; Kim loại nặng Chì, Cadimi: Không phát hiện.',
            ],
            [
                'indicator_code' => 'TC-C.2.1',
                'title' => 'Giấy chứng nhận VietGAP Trồng trọt số VietGAP-TT-2025-0988/VNC (Vinacert cấp)',
                'evidence_type' => 'CERTIFICATE',
                'source_type' => 'UPLOAD',
                'file_name' => 'VietGAP_TT_2025_0988_Vinacert_Hieu_Luc_2028.pdf',
                'file_reference' => 'evidences/2026/01/VietGAP_TT_2025_0988_Vinacert_Hieu_Luc_2028.pdf',
                'checksum' => 'c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1',
                'mime_type' => 'application/pdf',
                'file_size' => 2870400,
                'note' => 'Chứng nhận chuẩn TCVN 11892-1:2017 cho toàn bộ 12.5 ha nhà màng HTX Tân Tiến, có giá trị hiệu lực 3 năm đến ngày 17/02/2028.',
            ],
            [
                'indicator_code' => 'TC-C.2.2',
                'title' => 'Phiếu phân tích dư lượng BVTV số PAST-LD-8821/2025 Viện Pasteur (45 Hoạt chất KPH)',
                'evidence_type' => 'LAB_REPORT',
                'source_type' => 'UPLOAD',
                'file_name' => 'Vien_Pasteur_PAST_LD_8821_2025_Du_Luong_BVTV_KPH.pdf',
                'file_reference' => 'evidences/2026/01/Vien_Pasteur_PAST_LD_8821_2025_Du_Luong_BVTV_KPH.pdf',
                'checksum' => 'd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2',
                'mime_type' => 'application/pdf',
                'file_size' => 1420100,
                'note' => 'Kiểm nghiệm 45 hoạt chất thuốc BVTV nhóm Lân hữu cơ, Cúc tổng hợp: 100% Không phát hiện (KPH), đạt tiêu chuẩn an toàn thực phẩm xuất khẩu QCVN 8-2:2011/BYT.',
            ],
            [
                'indicator_code' => 'TC-C.3.1',
                'title' => 'Quyết định số 42819/QĐ-SHTT chấp nhận đơn bảo hộ nhãn hiệu tập thể "Sweet Palermo Tân Tiến"',
                'evidence_type' => 'CERTIFICATE',
                'source_type' => 'UPLOAD',
                'file_name' => '42819_QD_SHTT_Bao_Ho_Nhan_Hieu_Tap_The_Palermo.pdf',
                'file_reference' => 'evidences/2026/01/42819_QD_SHTT_Bao_Ho_Nhan_Hieu_Tap_The_Palermo.pdf',
                'checksum' => 'e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3',
                'mime_type' => 'application/pdf',
                'file_size' => 2190000,
                'note' => 'Cục Sở hữu Trí tuệ ban hành quyết định bảo hộ nhãn hiệu tập thể; UBND Tỉnh Lâm Đồng cấp quyền sử dụng nhãn hiệu chứng nhận "Đà Lạt - Kết tinh kỳ diệu từ đất lành".',
            ],
        ];

        foreach ($evidencesData as $ev) {
            $evId = (string) Str::uuid();
            $verId = (string) Str::uuid();

            // Insert evidence
            DB::table('evidences')->insert([
                'id' => $evId,
                'application_id' => $appId,
                'title' => $ev['title'],
                'evidence_type' => $ev['evidence_type'],
                'source_type' => $ev['source_type'],
                'status' => 'VERIFIED',
                'current_version_id' => null, // will update after version insert
                'verified_by' => $adminUserId,
                'verified_at' => '2026-01-12 14:30:00',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Insert version
            DB::table('evidence_versions')->insert([
                'id' => $verId,
                'evidence_id' => $evId,
                'version_number' => 1,
                'file_reference' => $ev['file_reference'],
                'file_name' => $ev['file_name'],
                'checksum' => $ev['checksum'],
                'mime_type' => $ev['mime_type'],
                'file_size' => $ev['file_size'],
                'uploaded_by' => $adminUserId,
                'uploaded_at' => '2026-01-12 10:15:00',
                'replacement_reason' => null,
            ]);

            // Set current_version_id
            DB::table('evidences')->where('id', $evId)->update(['current_version_id' => $verId]);

            // Insert link to indicator
            if (isset($indicators[$ev['indicator_code']])) {
                DB::table('evidence_links')->insert([
                    'evidence_id' => $evId,
                    'indicator_id' => $indicators[$ev['indicator_code']],
                    'relevance' => 'HIGH',
                    'note' => $ev['note'],
                    'created_by' => $adminUserId,
                    'created_at' => $now,
                ]);
            }
        }

        // 5. Evaluation Session & Council Scoring
        // Clean existing sessions for this application
        $oldSessIds = DB::table('evaluation_sessions')->where('application_id', $appId)->pluck('id')->toArray();
        if (!empty($oldSessIds)) {
            $oldAssignIds = DB::table('evaluator_assignments')->whereIn('evaluation_session_id', $oldSessIds)->pluck('id')->toArray();
            DB::table('evaluator_scores')->whereIn('assignment_id', $oldAssignIds)->delete();
            DB::table('evaluator_assignments')->whereIn('evaluation_session_id', $oldSessIds)->delete();
            DB::table('evaluation_sessions')->whereIn('id', $oldSessIds)->delete();
        }

        // Find or create Council Level
        $councilLevelId = DB::table('council_levels')->where('code', 'DISTRICT')->value('id');
        if (!$councilLevelId) {
            $councilLevelId = DB::table('council_levels')->where('code', 'PROVINCE')->value('id');
        }
        if (!$councilLevelId) {
            $councilLevelId = (string) Str::uuid();
            DB::table('council_levels')->insert([
                'id' => $councilLevelId,
                'code' => 'DISTRICT',
                'name' => 'Hội đồng OCOP cấp Huyện Lạc Dương',
                'description' => 'Đánh giá, phân hạng sản phẩm OCOP 3 sao - 4 sao theo Quyết định 148/QĐ-TTg',
                'sort_order' => 1,
                'is_active' => true,
                'valid_from' => '2025-01-01',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Create Evaluation Session
        $sessionId = (string) Str::uuid();
        DB::table('evaluation_sessions')->insert([
            'id' => $sessionId,
            'application_id' => $appId,
            'council_level_id' => $councilLevelId,
            'status' => 'CONSOLIDATED',
            'started_at' => '2026-01-13 08:30:00',
            'completed_at' => '2026-01-14 16:45:00',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Create Evaluator Assignments for 3 Evaluators
        $assignmentRoles = ['CHAIRMAN', 'SECRETARY', 'MEMBER'];
        $assignmentIds = [];

        foreach ($evaluatorUserIds as $idx => $eUserId) {
            $assignId = (string) Str::uuid();
            DB::table('evaluator_assignments')->insert([
                'id' => $assignId,
                'evaluation_session_id' => $sessionId,
                'evaluator_id' => $eUserId,
                'role' => $assignmentRoles[$idx] ?? 'MEMBER',
                'status' => 'LOCKED',
                'assigned_at' => '2026-01-13 08:30:00',
                'completed_at' => '2026-01-14 16:30:00',
            ]);
            $assignmentIds[$idx] = $assignId;
        }

        // 6. Score breakdown for 11 indicators
        // Max scores:
        // TC-A.1.1: 10, TC-A.2.1: 5, TC-A.3.1: 10, TC-A.4.1: 15 (Total GA: 40)
        // TC-B.1.1: 8, TC-B.1.2: 7, TC-B.2.1: 10 (Total GB: 25)
        // TC-C.1.1: 10, TC-C.2.1: 10, TC-C.2.2: 5, TC-C.3.1: 10 (Total GC: 35)
        // Grand Total: 100
        $expertScores = [
            // Evaluator 0: Nguyễn Văn Giám Khảo (CHAIRMAN) - Total: 89.0 pts
            0 => [
                'TC-A.1.1' => [10.0, 'Vùng trồng 12.5ha tại Đạ Sar và P12 Đà Lạt đạt 100% diện tích nguyên liệu nội tỉnh, vượt trội.'],
                'TC-A.2.1' => [4.5, 'Sử dụng 18 lao động thời vụ người đồng bào K\'Ho có cam kết việc làm và BHYT đầy đủ.'],
                'TC-A.3.1' => [9.0, 'Hợp đồng 3 năm với Saigon Co.op 15 tấn/tháng rất bền vững, có cơ chế giá sàn bảo hiểm.'],
                'TC-A.4.1' => [14.0, 'Bể chứa bao gói thuốc BVTV đạt chuẩn; ủ phụ phẩm phân vi sinh tuần hoàn triệt để.'],
                'TC-B.1.1' => [7.0, 'Kênh phân phối WinMart và sàn TMĐT PostMart ổn định, doanh thu trên 600 triệu/năm.'],
                'TC-B.1.2' => [6.5, 'Bao bì màng sinh học in nhãn đầy đủ NĐ 43/2017, tem QR quét nhanh ra lô đất và nhật ký.'],
                'TC-B.2.1' => [8.5, 'Câu chuyện văn hóa nông nghiệp Langbiang sâu sắc, có video clip truyền thông chuyên nghiệp.'],
                'TC-C.1.1' => [9.5, 'QUATEST 3 kiểm nghiệm độ Brix đạt 9.4°Bx (chuẩn >= 8.0), Vitamin C 142mg/100g rất cao.'],
                'TC-C.2.1' => [10.0, 'Giấy chứng nhận VietGAP Vinacert cấp còn hiệu lực đến 2028, quy trình giám sát nghiêm ngặt.'],
                'TC-C.2.2' => [5.0, 'Phiếu xét nghiệm Pasteur 45 hoạt chất thuốc BVTV đều không phát hiện (KPH), PHI 14 ngày tuân thủ tuyệt đối.'],
                'TC-C.3.1' => [5.0, 'Đã có quyết định chấp nhận đơn hợp lệ của Cục SHTT và nhãn hiệu chứng nhận Đà Lạt.'],
            ],
            // Evaluator 1: Trần Thị Mai Phương (SECRETARY) - Total: 88.0 pts
            1 => [
                'TC-A.1.1' => [10.0, '100% giống Sweet Palermo gieo trồng trên địa bàn Huyện Lạc Dương và TP. Đà Lạt.'],
                'TC-A.2.1' => [4.5, '31 xã viên tham gia chuỗi liên kết có hợp đồng và biên bản họp HĐQT rõ ràng.'],
                'TC-A.3.1' => [8.5, 'Có bảo lãnh sản lượng và thanh toán định kỳ qua ngân hàng Agribank minh bạch.'],
                'TC-A.4.1' => [13.5, 'Biên bản nghiệm thu thu gom chất thải nguy hại với Cty Môi trường Đô thị Đà Lạt đầy đủ.'],
                'TC-B.1.1' => [7.0, 'Sản phẩm có mặt tại kệ rau sạch cao cấp, phản hồi người tiêu dùng rất tốt.'],
                'TC-B.1.2' => [6.5, 'Mã vạch GS1 hợp pháp, tem truy xuất nhật ký điện tử rõ ràng từng đợt bón phân.'],
                'TC-B.2.1' => [9.0, 'Ấn phẩm song ngữ thiết kế đẹp, thể hiện được bản sắc đồng bào K\'Ho Lạc Dương.'],
                'TC-C.1.1' => [9.0, 'Quả ngọt giòn, độ Brix 9.4°Bx, không lẫn vị hăng cay, đúng phẩm cấp Sweet Palermo.'],
                'TC-C.2.1' => [10.0, 'VietGAP do Vinacert chứng nhận số VietGAP-TT-2025-0988/VNC còn hạn dài.'],
                'TC-C.2.2' => [5.0, 'Hồ sơ lưu trữ KCS cổng trại và phiếu phân tích Viện Pasteur đồng nhất, PHI đảm bảo.'],
                'TC-C.3.1' => [5.0, 'Hồ sơ nhãn hiệu tập thể hợp lệ, kiến nghị hỗ trợ xúc tiến cấp văn bằng chính thức.'],
            ],
            // Evaluator 2: Lê Hoàng Quân (MEMBER) - Total: 88.5 pts
            2 => [
                'TC-A.1.1' => [10.0, 'Hồ sơ địa chính và hợp đồng thuê đất / giao đất canh tác của 31 xã viên rất chuẩn.'],
                'TC-A.2.1' => [4.0, 'Lao động địa phương chiếm tỷ trọng cao, mức thu nhập bình quân 7.5 - 9.0 triệu/tháng.'],
                'TC-A.3.1' => [9.0, 'Mô hình liên kết HTX - Doanh nghiệp bán lẻ tiêu biểu của huyện Lạc Dương.'],
                'TC-A.4.1' => [14.0, 'Kế hoạch bảo vệ môi trường thực thi nghiêm túc, không có tồn đọng rác thải thuốc BVTV.'],
                'TC-B.1.1' => [7.5, 'Thị trường tiêu thụ lớn tại TP.HCM, Hà Nội và Đà Nẵng, năng lực mở rộng tốt.'],
                'TC-B.1.2' => [6.5, 'Nhãn hàng hóa in rõ ngày đóng gói, hạn sử dụng và hướng dẫn bảo quản lạnh 8-10°C.'],
                'TC-B.2.1' => [8.5, 'Truyền thông ấn tượng, làm nổi bật công nghệ nhà kính Israel kết hợp khí hậu ôn đới.'],
                'TC-C.1.1' => [9.5, 'Chỉ tiêu cảm quan và dinh dưỡng vượt trội so với các giống ớt chuông thông thường.'],
                'TC-C.2.1' => [10.0, 'Hệ thống nhà màng khép kín đáp ứng nghiêm ngặt tiêu chuẩn VietGAP trồng trọt.'],
                'TC-C.2.2' => [5.0, 'Tuân thủ thời gian cách ly PHI, áp dụng chế phẩm sinh học đối kháng Bio-Grow an toàn.'],
                'TC-C.3.1' => [5.0, 'Đã được cấp chứng nhận quyền sử dụng địa danh Đà Lạt cho sản phẩm OCOP tiêu biểu.'],
            ],
        ];

        foreach ($expertScores as $evalIdx => $indScores) {
            $assignId = $assignmentIds[$evalIdx];
            foreach ($indScores as $indCode => $scoreData) {
                if (isset($indicators[$indCode])) {
                    DB::table('evaluator_scores')->insert([
                        'id' => (string) Str::uuid(),
                        'assignment_id' => $assignId,
                        'indicator_id' => $indicators[$indCode],
                        'score' => $scoreData[0],
                        'comment' => $scoreData[1],
                        'submitted_at' => '2026-01-14 16:00:00',
                        'locked_at' => '2026-01-14 16:30:00',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }

        // Auto-consolidate the session results to compute average score and proposed star level
        $consolidationService = app(\Modules\Ocop\Evaluation\Application\Services\EvaluationConsolidationService::class);
        $consolidationService->consolidate($sessionId);

        // 7. Surplus Distribution Plan & Allocation for 31 Members (Phân Phối Thặng Dư & Trích Quỹ 2025)
        // Clean existing plans
        $oldPlanIds = DB::table('surplus_distribution_plans')->where('cooperative_id', $coopId)->pluck('id')->toArray();
        if (!empty($oldPlanIds)) {
            DB::table('surplus_distribution_allocations')->whereIn('plan_id', $oldPlanIds)->delete();
            DB::table('surplus_distribution_plans')->whereIn('id', $oldPlanIds)->delete();
        }

        $accountantId = DB::table('users')->where('username', 'ketoan01')->value('id') ?? $adminUserId;
        $planId = (string) Str::uuid();

        // Financial figures for HTX Tân Tiến FY2025:
        // Total surplus: 1,250,000,000 VND
        // Internal service surplus: 850,000,000 VND
        // External service surplus: 400,000,000 VND
        // Unallocated Common Fund (15%): 187,500,000 VND
        // Distributable surplus: 420,000,000 VND
        // Capital weight: 40% (168,000,000 VND)
        // Service usage weight: 60% (252,000,000 VND)
        DB::table('surplus_distribution_plans')->insert([
            'id' => $planId,
            'cooperative_id' => $coopId,
            'plan_code' => 'KH-PPTD-2025-01',
            'fiscal_period' => 'FY2025',
            'financial_year' => 2025,
            'total_surplus' => 1250000000.00,
            'internal_service_surplus' => 850000000.00,
            'external_service_surplus' => 400000000.00,
            'unallocated_common_fund_amount' => 187500000.00,
            'distributable_surplus' => 420000000.00,
            'capital_weight' => 40.00,
            'service_usage_weight' => 60.00,
            'patronage_distribution_rate' => 60.00,
            'total_amount' => 420000000.00,
            'status' => 'APPROVED',
            'approval_status' => 'APPROVED',
            'rule_version_reference' => 'LUAT-HTX-2023-DIEU-64',
            'source_result_reference' => json_encode([
                'audit_report_code' => 'KT-BCTC-2025-LDO',
                'resolution_number' => 'NQ-DHDCD-2026-01',
                'resolution_date' => '2026-01-10',
                'total_revenue' => 8450000000,
                'reserve_fund_rate' => 10,
                'development_fund_rate' => 15,
                'common_fund_rate' => 15,
            ]),
            'created_by' => $accountantId,
            'approved_by' => $adminUserId,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Allocations for all 31 members
        $members = DB::table('members')->where('cooperative_id', $coopId)->get();
        $totalCapital = $members->sum(fn($m) => (float) ($m->committed_capital ?? 30000000)) ?: 1400000000;
        $totalProduce = 2450000000; // Total internal service usage value across HTX

        $capitalPool = 168000000.00; // 40% of 420M
        $servicePool = 252000000.00; // 60% of 420M

        foreach ($members as $m) {
            $capContrib = (float) ($m->committed_capital ?? 30000000);
            if ($capContrib <= 0) $capContrib = 20000000.00;
            // Estimated service usage based on plots or realistic farming volume (80M - 150M)
            $serviceUsage = $capContrib * 1.75; 

            $capShare = round(($capContrib / $totalCapital) * $capitalPool, 0);
            $servShare = round(($serviceUsage / $totalProduce) * $servicePool, 0);
            $totalAlloc = $capShare + $servShare;

            // Small debt deduction if member TV001
            $debtDeduct = ($m->member_code === 'TV001') ? 500000.00 : 0.00;
            $netPayout = $totalAlloc - $debtDeduct;

            DB::table('surplus_distribution_allocations')->insert([
                'id' => (string) Str::uuid(),
                'plan_id' => $planId,
                'member_id' => $m->id,
                'capital_contribution_snapshot' => $capContrib,
                'service_usage_snapshot' => $serviceUsage,
                'internal_service_usage_value' => $serviceUsage,
                'capital_share_amount' => $capShare,
                'service_share_amount' => $servShare,
                'total_allocated_amount' => $totalAlloc,
                'debt_deduction' => $debtDeduct,
                'net_payout_amount' => $netPayout,
                'reinvest_as_capital' => false,
                'basis_value' => $capContrib + $serviceUsage,
                'allocation_amount' => $totalAlloc,
                'rule_reference' => json_encode([
                    'capital_weight' => '40%',
                    'service_weight' => '60%',
                    'compliance' => 'Luật HTX 2023 Điều 64'
                ]),
                'created_at' => $now,
            ]);
        }
    }
}
