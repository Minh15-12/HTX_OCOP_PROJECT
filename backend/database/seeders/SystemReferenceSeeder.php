<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Modules\Identity\Infrastructure\Persistence\Models\PermissionModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;

class SystemReferenceSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['code' => 'SYSTEM_ADMIN', 'name' => 'Quản trị viên kỹ thuật hệ thống', 'description' => 'Quản trị kỹ thuật, tài khoản, cấu hình, sao lưu.'],
            ['code' => 'HTX_OWNER', 'name' => 'Đại diện HTX / Chủ thể OCOP', 'description' => 'Quản lý HTX, lập hồ sơ OCOP, tự đánh giá, nộp hồ sơ.'],
            ['code' => 'HTX_STAFF', 'name' => 'Cán bộ HTX', 'description' => 'Cán bộ nghiệp vụ quản lý xã viên, mùa vụ, kho vật tư.'],
            ['code' => 'OCOP_PREPARER', 'name' => 'Chuyên viên số hóa OCOP', 'description' => 'Phụ trách số hóa hồ sơ OCOP, nhập liệu thuyết minh, gắn minh chứng.'],
            ['code' => 'RECEIVING_REVIEWER', 'name' => 'Cán bộ tiếp nhận/thẩm tra', 'description' => 'Kiểm tra tính đầy đủ hồ sơ OCOP, yêu cầu bổ sung.'],
            ['code' => 'EVIDENCE_REVIEWER', 'name' => 'Chuyên viên thẩm định minh chứng', 'description' => 'Thẩm định tính hợp lệ/pháp lý của minh chứng.'],
            ['code' => 'EVALUATOR', 'name' => 'Giám khảo OCOP', 'description' => 'Chấm điểm độc lập hồ sơ OCOP trên các chỉ tiêu.'],
            ['code' => 'COUNCIL_MEMBER', 'name' => 'Thành viên Hội đồng OCOP', 'description' => 'Thành viên hội đồng chấm điểm độc lập.'],
            ['code' => 'COUNCIL_SECRETARY', 'name' => 'Thư ký Hội đồng OCOP', 'description' => 'Tổng hợp điểm, kiểm tra độ lệch điểm, lập biên bản họp.'],
            ['code' => 'AUTHORITY', 'name' => 'Cấp có thẩm quyền', 'description' => 'Quyết định công nhận kết quả phân hạng OCOP chính thức.'],
            ['code' => 'CRITERIA_ADMIN', 'name' => 'Quản trị bộ tiêu chí OCOP', 'description' => 'Cấu hình tiêu chí, thang điểm, điều kiện khống chế.'],
            ['code' => 'AUDITOR', 'name' => 'Kiểm toán viên', 'description' => 'Tra cứu nhật ký kiểm toán và chuỗi truy vết dữ liệu.'],
            ['code' => 'REPORT_VIEWER', 'name' => 'Người xem báo cáo', 'description' => 'Xem Dashboard và các báo cáo thống kê.'],
        ];

        $roleModels = [];
        foreach ($roles as $r) {
            $roleModels[$r['code']] = RoleModel::firstOrCreate(
                ['code' => $r['code']],
                ['id' => (string) Str::uuid(), 'name' => $r['name'], 'description' => $r['description']]
            );
        }

        $permissions = [
            ['code' => 'USER.READ', 'name' => 'Xem danh sách & thông tin người dùng', 'module' => 'Identity'],
            ['code' => 'USER.CREATE', 'name' => 'Tạo mới người dùng', 'module' => 'Identity'],
            ['code' => 'USER.UPDATE', 'name' => 'Cập nhật người dùng', 'module' => 'Identity'],
            ['code' => 'USER.LOCK', 'name' => 'Khóa/mở khóa người dùng', 'module' => 'Identity'],
            ['code' => 'ROLE.MANAGE', 'name' => 'Quản lý vai trò & gán quyền', 'module' => 'Identity'],

            ['code' => 'COOPERATIVE.READ', 'name' => 'Xem thông tin Hợp tác xã', 'module' => 'Cooperative'],
            ['code' => 'COOPERATIVE.CREATE', 'name' => 'Khởi tạo Hợp tác xã', 'module' => 'Cooperative'],
            ['code' => 'COOPERATIVE.UPDATE', 'name' => 'Cập nhật thông tin Hợp tác xã', 'module' => 'Cooperative'],

            ['code' => 'MEMBER.READ', 'name' => 'Xem danh sách xã viên', 'module' => 'Member'],
            ['code' => 'MEMBER.CREATE', 'name' => 'Thêm mới xã viên', 'module' => 'Member'],
            ['code' => 'MEMBER.UPDATE', 'name' => 'Cập nhật thông tin xã viên', 'module' => 'Member'],
            ['code' => 'MEMBER.DELETE', 'name' => 'Xóa xã viên', 'module' => 'Member'],
            ['code' => 'CAPITAL.READ', 'name' => 'Xem thông tin vốn góp', 'module' => 'Capital'],
            ['code' => 'CAPITAL.MANAGE', 'name' => 'Ghi nhận và quản lý vốn góp', 'module' => 'Capital'],

            ['code' => 'AGRICULTURE.READ', 'name' => 'Xem dữ liệu nông nghiệp (vùng trồng, mùa vụ)', 'module' => 'Agriculture'],
            ['code' => 'AGRICULTURE.CREATE', 'name' => 'Tạo vùng trồng, nhật ký canh tác', 'module' => 'Agriculture'],
            ['code' => 'AGRICULTURE.UPDATE', 'name' => 'Cập nhật dữ liệu nông nghiệp', 'module' => 'Agriculture'],

            ['code' => 'INVENTORY.READ', 'name' => 'Xem kho & tồn kho vật tư', 'module' => 'Inventory'],
            ['code' => 'INVENTORY.RECEIPT.CREATE', 'name' => 'Tạo phiếu nhập kho', 'module' => 'Inventory'],
            ['code' => 'INVENTORY.ISSUE.CREATE', 'name' => 'Tạo phiếu xuất kho', 'module' => 'Inventory'],
            ['code' => 'INVENTORY.COUNT.CREATE', 'name' => 'Tạo phiếu kiểm kê kho', 'module' => 'Inventory'],

            ['code' => 'FINANCE.READ', 'name' => 'Xem sổ sách & giao dịch tài chính', 'module' => 'Finance'],
            ['code' => 'FINANCE.TRANSACTION.CREATE', 'name' => 'Lập phiếu thu / chi', 'module' => 'Finance'],
            ['code' => 'FINANCE.TRANSACTION.APPROVE', 'name' => 'Duyệt phiếu thu / chi', 'module' => 'Finance'],

            ['code' => 'OCOP_CRITERIA.READ', 'name' => 'Xem Bộ tiêu chí OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_CRITERIA.MANAGE', 'name' => 'Cấu hình phiên bản Bộ tiêu chí OCOP', 'module' => 'OCOP'],

            ['code' => 'OCOP_APPLICATION.READ', 'name' => 'Xem hồ sơ OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_APPLICATION.CREATE', 'name' => 'Tạo hồ sơ đăng ký OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_APPLICATION.UPDATE', 'name' => 'Sửa hồ sơ OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_APPLICATION.SUBMIT', 'name' => 'Nộp hồ sơ OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_APPLICATION.REVIEW', 'name' => 'Thẩm tra tính đầy đủ hồ sơ OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_APPLICATION.RETURN', 'name' => 'Yêu cầu bổ sung/chỉnh sửa hồ sơ OCOP', 'module' => 'OCOP'],

            ['code' => 'OCOP_EVIDENCE.READ', 'name' => 'Xem minh chứng OCOP', 'module' => 'Evidence'],
            ['code' => 'OCOP_EVIDENCE.UPLOAD', 'name' => 'Tải lên tệp minh chứng', 'module' => 'Evidence'],
            ['code' => 'OCOP_EVIDENCE.REPLACE', 'name' => 'Thay thế/cập nhật phiên bản minh chứng', 'module' => 'Evidence'],
            ['code' => 'OCOP_EVIDENCE.VERIFY', 'name' => 'Thẩm định/xác minh minh chứng', 'module' => 'Evidence'],

            ['code' => 'OCOP_EVALUATION.READ', 'name' => 'Xem phiên đánh giá OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_EVALUATION.SCORE', 'name' => 'Chấm điểm chỉ tiêu OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_EVALUATION.LOCK', 'name' => 'Khóa bảng điểm cá nhân', 'module' => 'OCOP'],
            ['code' => 'OCOP_EVALUATION.CONSOLIDATE', 'name' => 'Tổng hợp kết quả điểm Hội đồng', 'module' => 'OCOP'],

            ['code' => 'OCOP_DECISION.READ', 'name' => 'Xem kết quả & quyết định OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_DECISION.RECORD', 'name' => 'Ghi nhận đề xuất phân hạng OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_DECISION.APPROVE', 'name' => 'Phê duyệt Quyết định công nhận OCOP', 'module' => 'OCOP'],

            ['code' => 'REPORT.READ', 'name' => 'Xem báo cáo thống kê', 'module' => 'Reporting'],
            ['code' => 'REPORT.EXPORT', 'name' => 'Kết xuất báo cáo PDF/Excel', 'module' => 'Reporting'],

            ['code' => 'AUDIT.READ', 'name' => 'Xem nhật ký kiểm toán hệ thống', 'module' => 'Audit'],
            ['code' => 'SYSTEM.HEALTH.VIEW', 'name' => 'Xem trạng thái vận hành kỹ thuật', 'module' => 'System'],
        ];

        $permissionModels = [];
        foreach ($permissions as $p) {
            $permissionModels[$p['code']] = PermissionModel::firstOrCreate(
                ['code' => $p['code']],
                ['id' => (string) Str::uuid(), 'name' => $p['name'], 'module' => $p['module']]
            );
        }

        // Mapping role -> permissions strictly per Authorization Matrix Specification 15
        $rolePermissionMap = [
            'SYSTEM_ADMIN' => ['USER.READ', 'USER.CREATE', 'USER.UPDATE', 'USER.LOCK', 'ROLE.MANAGE', 'COOPERATIVE.READ', 'COOPERATIVE.CREATE', 'COOPERATIVE.UPDATE', 'SYSTEM.HEALTH.VIEW', 'AUDIT.READ'],
            'HTX_OWNER' => ['COOPERATIVE.READ', 'COOPERATIVE.UPDATE', 'MEMBER.READ', 'MEMBER.CREATE', 'MEMBER.UPDATE', 'MEMBER.DELETE', 'CAPITAL.READ', 'CAPITAL.MANAGE', 'USER.READ', 'USER.CREATE', 'USER.UPDATE', 'USER.LOCK', 'ROLE.MANAGE', 'AGRICULTURE.READ', 'AGRICULTURE.CREATE', 'AGRICULTURE.UPDATE', 'INVENTORY.READ', 'FINANCE.READ', 'OCOP_APPLICATION.READ', 'OCOP_APPLICATION.CREATE', 'OCOP_APPLICATION.UPDATE', 'OCOP_APPLICATION.SUBMIT', 'OCOP_EVIDENCE.READ', 'OCOP_EVIDENCE.UPLOAD', 'REPORT.READ'],
            'HTX_STAFF' => ['COOPERATIVE.READ', 'MEMBER.READ', 'MEMBER.CREATE', 'MEMBER.UPDATE', 'AGRICULTURE.READ', 'AGRICULTURE.CREATE', 'AGRICULTURE.UPDATE', 'INVENTORY.READ', 'INVENTORY.RECEIPT.CREATE', 'INVENTORY.ISSUE.CREATE', 'REPORT.READ'],
            'OCOP_PREPARER' => ['COOPERATIVE.READ', 'AGRICULTURE.READ', 'OCOP_APPLICATION.READ', 'OCOP_APPLICATION.CREATE', 'OCOP_APPLICATION.UPDATE', 'OCOP_APPLICATION.SUBMIT', 'OCOP_EVIDENCE.READ', 'OCOP_EVIDENCE.UPLOAD', 'OCOP_EVIDENCE.REPLACE'],
            'RECEIVING_REVIEWER' => ['OCOP_APPLICATION.READ', 'OCOP_APPLICATION.REVIEW', 'OCOP_APPLICATION.RETURN', 'OCOP_EVIDENCE.READ', 'OCOP_EVIDENCE.VERIFY'],
            'EVIDENCE_REVIEWER' => ['OCOP_APPLICATION.READ', 'OCOP_EVIDENCE.READ', 'OCOP_EVIDENCE.VERIFY'],
            'EVALUATOR' => ['OCOP_APPLICATION.READ', 'OCOP_EVIDENCE.READ', 'OCOP_EVALUATION.READ', 'OCOP_EVALUATION.SCORE', 'OCOP_EVALUATION.LOCK'],
            'COUNCIL_MEMBER' => ['OCOP_APPLICATION.READ', 'OCOP_EVIDENCE.READ', 'OCOP_EVALUATION.READ', 'OCOP_EVALUATION.SCORE', 'OCOP_EVALUATION.CONSOLIDATE'],
            'COUNCIL_SECRETARY' => ['OCOP_APPLICATION.READ', 'OCOP_EVIDENCE.READ', 'OCOP_EVALUATION.READ', 'OCOP_EVALUATION.CONSOLIDATE', 'OCOP_DECISION.READ', 'OCOP_DECISION.RECORD'],
            'AUTHORITY' => ['OCOP_APPLICATION.READ', 'OCOP_EVALUATION.READ', 'OCOP_DECISION.READ', 'OCOP_DECISION.RECORD', 'OCOP_DECISION.APPROVE'],
            'CRITERIA_ADMIN' => ['OCOP_CRITERIA.READ', 'OCOP_CRITERIA.MANAGE'],
            'AUDITOR' => ['AUDIT.READ', 'REPORT.READ', 'COOPERATIVE.READ', 'OCOP_APPLICATION.READ'],
            'REPORT_VIEWER' => ['REPORT.READ', 'REPORT.EXPORT'],
        ];

        foreach ($rolePermissionMap as $roleCode => $permCodes) {
            if (isset($roleModels[$roleCode])) {
                $permIds = [];
                foreach ($permCodes as $pCode) {
                    if (isset($permissionModels[$pCode])) {
                        $permIds[] = $permissionModels[$pCode]->id;
                    }
                }
                $roleModels[$roleCode]->permissions()->sync($permIds);
            }
        }
    }
}
