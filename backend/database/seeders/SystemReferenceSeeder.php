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
        // 1. Role Catalog strictly matching 15_AUTHORIZATION_MATRIX.md (Section 7)
        $roles = [
            ['code' => 'SYSTEM_ADMIN', 'name' => 'Quản trị viên kỹ thuật hệ thống', 'description' => 'Quản trị kỹ thuật, tài khoản, cấu hình, sao lưu.'],
            ['code' => 'HTX_OWNER', 'name' => 'Đại diện HTX / Chủ thể OCOP', 'description' => 'Toàn quyền điều hành HTX, lập hồ sơ OCOP, tự đánh giá, nộp hồ sơ.'],
            ['code' => 'ACCOUNTANT', 'name' => 'Kế toán HTX', 'description' => 'Quản lý thu chi, công nợ, giao dịch vốn góp, phân chia lợi nhuận và sổ sách tài chính.'],
            ['code' => 'STOREKEEPER', 'name' => 'Thủ kho HTX', 'description' => 'Quản lý xuất nhập tồn vật tư nông nghiệp, kiểm kê kho và lô hàng.'],
            ['code' => 'AGRICULTURE_OFFICER', 'name' => 'Cán bộ Kỹ thuật Nông nghiệp', 'description' => 'Quản lý vùng trồng, thửa đất, nhật ký canh tác điện tử và mùa vụ.'],
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

        // 2. Permission Catalog strictly matching 15_AUTHORIZATION_MATRIX.md
        $permissions = [
            // Module Identity & User
            ['code' => 'USER.READ', 'name' => 'Xem danh sách & thông tin người dùng', 'module' => 'Identity'],
            ['code' => 'USER.CREATE', 'name' => 'Tạo mới người dùng', 'module' => 'Identity'],
            ['code' => 'USER.UPDATE', 'name' => 'Cập nhật người dùng', 'module' => 'Identity'],
            ['code' => 'USER.LOCK', 'name' => 'Khóa/mở khóa người dùng', 'module' => 'Identity'],
            ['code' => 'USER.DELETE', 'name' => 'Xóa tài khoản người dùng', 'module' => 'Identity'],
            ['code' => 'ROLE.READ', 'name' => 'Xem danh sách vai trò', 'module' => 'Identity'],
            ['code' => 'ROLE.MANAGE', 'name' => 'Quản lý vai trò & gán quyền', 'module' => 'Identity'],

            // Module Cooperative
            ['code' => 'COOPERATIVE.READ', 'name' => 'Xem thông tin Hợp tác xã', 'module' => 'Cooperative'],
            ['code' => 'COOPERATIVE.CREATE', 'name' => 'Khởi tạo Hợp tác xã', 'module' => 'Cooperative'],
            ['code' => 'COOPERATIVE.UPDATE', 'name' => 'Cập nhật thông tin Hợp tác xã', 'module' => 'Cooperative'],
            ['code' => 'COOP.READ', 'name' => 'Xem thông tin Hợp tác xã (alias)', 'module' => 'Cooperative'],
            ['code' => 'COOP.CREATE', 'name' => 'Khởi tạo Hợp tác xã (alias)', 'module' => 'Cooperative'],
            ['code' => 'COOP.UPDATE', 'name' => 'Cập nhật thông tin Hợp tác xã (alias)', 'module' => 'Cooperative'],

            // Module Member & Capital
            ['code' => 'MEMBER.READ', 'name' => 'Xem danh sách xã viên', 'module' => 'Member'],
            ['code' => 'MEMBER.CREATE', 'name' => 'Thêm mới xã viên', 'module' => 'Member'],
            ['code' => 'MEMBER.UPDATE', 'name' => 'Cập nhật thông tin xã viên', 'module' => 'Member'],
            ['code' => 'MEMBER.DELETE', 'name' => 'Xóa xã viên', 'module' => 'Member'],
            ['code' => 'MEMBER.APPROVE', 'name' => 'Phê duyệt kết nạp xã viên', 'module' => 'Member'],
            ['code' => 'CAPITAL.READ', 'name' => 'Xem thông tin vốn góp', 'module' => 'Capital'],
            ['code' => 'CAPITAL.MANAGE', 'name' => 'Ghi nhận và quản lý vốn góp', 'module' => 'Capital'],
            ['code' => 'CAPITAL.CREATE', 'name' => 'Lập phiếu nộp vốn góp', 'module' => 'Capital'],
            ['code' => 'CAPITAL.APPROVE', 'name' => 'Phê duyệt vốn góp', 'module' => 'Capital'],

            // Module Agriculture & Production
            ['code' => 'AGRICULTURE.READ', 'name' => 'Xem dữ liệu nông nghiệp (vùng trồng, mùa vụ)', 'module' => 'Agriculture'],
            ['code' => 'AGRICULTURE.CREATE', 'name' => 'Tạo vùng trồng, nhật ký canh tác', 'module' => 'Agriculture'],
            ['code' => 'AGRICULTURE.UPDATE', 'name' => 'Cập nhật dữ liệu nông nghiệp', 'module' => 'Agriculture'],
            ['code' => 'AGRICULTURE.DELETE', 'name' => 'Xóa dữ liệu nông nghiệp', 'module' => 'Agriculture'],
            ['code' => 'FARMING_LOG.READ', 'name' => 'Xem nhật ký canh tác điện tử', 'module' => 'Agriculture'],
            ['code' => 'FARMING_LOG.CREATE', 'name' => 'Ghi nhật ký canh tác', 'module' => 'Agriculture'],
            ['code' => 'FARMING_LOG.UPDATE', 'name' => 'Sửa nhật ký canh tác', 'module' => 'Agriculture'],
            ['code' => 'HARVEST.READ', 'name' => 'Xem thu hoạch & lô hàng', 'module' => 'Agriculture'],
            ['code' => 'HARVEST.CREATE', 'name' => 'Tạo phiếu thu hoạch & phân lô', 'module' => 'Agriculture'],
            ['code' => 'HARVEST.UPDATE', 'name' => 'Cập nhật thu hoạch', 'module' => 'Agriculture'],

            // Module Product & Catalog
            ['code' => 'PRODUCT.READ', 'name' => 'Xem danh mục sản phẩm', 'module' => 'Product'],
            ['code' => 'PRODUCT.CREATE', 'name' => 'Tạo mới sản phẩm', 'module' => 'Product'],
            ['code' => 'PRODUCT.UPDATE', 'name' => 'Cập nhật sản phẩm', 'module' => 'Product'],
            ['code' => 'PRODUCT.DELETE', 'name' => 'Xóa sản phẩm', 'module' => 'Product'],

            // Module Inventory & Warehouse
            ['code' => 'INVENTORY.READ', 'name' => 'Xem kho & tồn kho vật tư', 'module' => 'Inventory'],
            ['code' => 'INVENTORY.CREATE', 'name' => 'Tạo vật tư mới', 'module' => 'Inventory'],
            ['code' => 'INVENTORY.UPDATE', 'name' => 'Cập nhật vật tư', 'module' => 'Inventory'],
            ['code' => 'INVENTORY.RECEIPT.CREATE', 'name' => 'Tạo phiếu nhập kho', 'module' => 'Inventory'],
            ['code' => 'INVENTORY.ISSUE.CREATE', 'name' => 'Tạo phiếu xuất kho', 'module' => 'Inventory'],
            ['code' => 'INVENTORY.COUNT.CREATE', 'name' => 'Tạo phiếu kiểm kê kho', 'module' => 'Inventory'],
            ['code' => 'STOCK.READ', 'name' => 'Xem phiếu nhập/xuất kho', 'module' => 'Inventory'],
            ['code' => 'STOCK.CREATE', 'name' => 'Tạo phiếu nhập/xuất kho', 'module' => 'Inventory'],
            ['code' => 'STOCK.UPDATE', 'name' => 'Sửa phiếu kho', 'module' => 'Inventory'],
            ['code' => 'STOCK.APPROVE', 'name' => 'Duyệt phiếu kho', 'module' => 'Inventory'],

            // Module Finance & Profit
            ['code' => 'FINANCE.READ', 'name' => 'Xem sổ sách & giao dịch tài chính', 'module' => 'Finance'],
            ['code' => 'FINANCE.CREATE', 'name' => 'Tạo giao dịch thu / chi', 'module' => 'Finance'],
            ['code' => 'FINANCE.UPDATE', 'name' => 'Sửa giao dịch thu / chi', 'module' => 'Finance'],
            ['code' => 'FINANCE.TRANSACTION.CREATE', 'name' => 'Lập phiếu thu / chi', 'module' => 'Finance'],
            ['code' => 'FINANCE.TRANSACTION.UPDATE', 'name' => 'Cập nhật phiếu thu / chi', 'module' => 'Finance'],
            ['code' => 'FINANCE.TRANSACTION.APPROVE', 'name' => 'Duyệt phiếu thu / chi', 'module' => 'Finance'],

            // Module OCOP Criteria
            ['code' => 'OCOP_CRITERIA.READ', 'name' => 'Xem Bộ tiêu chí OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_CRITERIA.MANAGE', 'name' => 'Cấu hình phiên bản Bộ tiêu chí OCOP', 'module' => 'OCOP'],

            // Module OCOP Application & Dossier
            ['code' => 'OCOP_APPLICATION.READ', 'name' => 'Xem hồ sơ OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_APPLICATION.CREATE', 'name' => 'Tạo hồ sơ đăng ký OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_APPLICATION.UPDATE', 'name' => 'Sửa hồ sơ OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_APPLICATION.SUBMIT', 'name' => 'Nộp hồ sơ OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_APPLICATION.REVIEW', 'name' => 'Thẩm tra tính đầy đủ hồ sơ OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_APPLICATION.RETURN', 'name' => 'Yêu cầu bổ sung/chỉnh sửa hồ sơ OCOP', 'module' => 'OCOP'],

            // Module OCOP Evidence
            ['code' => 'OCOP_EVIDENCE.READ', 'name' => 'Xem minh chứng OCOP', 'module' => 'Evidence'],
            ['code' => 'OCOP_EVIDENCE.UPLOAD', 'name' => 'Tải lên tệp minh chứng', 'module' => 'Evidence'],
            ['code' => 'OCOP_EVIDENCE.REPLACE', 'name' => 'Thay thế/cập nhật phiên bản minh chứng', 'module' => 'Evidence'],
            ['code' => 'OCOP_EVIDENCE.VERIFY', 'name' => 'Thẩm định/xác minh minh chứng', 'module' => 'Evidence'],
            ['code' => 'OCOP_EVIDENCE.DOWNLOAD', 'name' => 'Tải xuống tệp minh chứng', 'module' => 'Evidence'],

            // Module OCOP Evaluation & Decision
            ['code' => 'OCOP_EVALUATION.READ', 'name' => 'Xem phiên đánh giá OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_EVALUATION.SCORE', 'name' => 'Chấm điểm chỉ tiêu OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_EVALUATION.LOCK', 'name' => 'Khóa bảng điểm cá nhân', 'module' => 'OCOP'],
            ['code' => 'OCOP_EVALUATION.CONSOLIDATE', 'name' => 'Tổng hợp kết quả điểm Hội đồng', 'module' => 'OCOP'],
            ['code' => 'OCOP_DECISION.READ', 'name' => 'Xem kết quả & quyết định OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_DECISION.RECORD', 'name' => 'Ghi nhận đề xuất phân hạng OCOP', 'module' => 'OCOP'],
            ['code' => 'OCOP_DECISION.APPROVE', 'name' => 'Phê duyệt Quyết định công nhận OCOP', 'module' => 'OCOP'],

            // Module Reporting & Audit
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

        // 3. Mapping Role -> Permissions strictly per 15_AUTHORIZATION_MATRIX.md
        $rolePermissionMap = [
            // SYSTEM_ADMIN: Technical CRUD, no automatic business approvals (SoD Rule)
            'SYSTEM_ADMIN' => [
                'USER.READ', 'USER.CREATE', 'USER.UPDATE', 'USER.LOCK', 'USER.DELETE',
                'ROLE.READ', 'ROLE.MANAGE',
                'COOPERATIVE.READ', 'COOPERATIVE.CREATE', 'COOPERATIVE.UPDATE', 'COOP.READ', 'COOP.CREATE', 'COOP.UPDATE',
                'SYSTEM.HEALTH.VIEW', 'AUDIT.READ',
            ],

            // HTX_OWNER: Full operational control inside cooperative
            'HTX_OWNER' => [
                'COOPERATIVE.READ', 'COOPERATIVE.UPDATE', 'COOP.READ', 'COOP.UPDATE',
                'MEMBER.READ', 'MEMBER.CREATE', 'MEMBER.UPDATE', 'MEMBER.DELETE', 'MEMBER.APPROVE',
                'CAPITAL.READ', 'CAPITAL.MANAGE', 'CAPITAL.CREATE', 'CAPITAL.APPROVE',
                'USER.READ', 'USER.CREATE', 'USER.UPDATE', 'USER.LOCK', 'ROLE.READ',
                'AGRICULTURE.READ', 'AGRICULTURE.CREATE', 'AGRICULTURE.UPDATE', 'AGRICULTURE.DELETE',
                'FARMING_LOG.READ', 'FARMING_LOG.CREATE', 'FARMING_LOG.UPDATE',
                'HARVEST.READ', 'HARVEST.CREATE', 'HARVEST.UPDATE',
                'PRODUCT.READ', 'PRODUCT.CREATE', 'PRODUCT.UPDATE', 'PRODUCT.DELETE',
                'INVENTORY.READ', 'INVENTORY.CREATE', 'INVENTORY.UPDATE',
                'STOCK.READ', 'STOCK.CREATE', 'STOCK.UPDATE', 'STOCK.APPROVE',
                'FINANCE.READ', 'FINANCE.CREATE', 'FINANCE.UPDATE', 'FINANCE.TRANSACTION.CREATE', 'FINANCE.TRANSACTION.APPROVE',
                'OCOP_APPLICATION.READ', 'OCOP_APPLICATION.CREATE', 'OCOP_APPLICATION.UPDATE', 'OCOP_APPLICATION.SUBMIT',
                'OCOP_EVIDENCE.READ', 'OCOP_EVIDENCE.UPLOAD', 'OCOP_EVIDENCE.REPLACE', 'OCOP_EVIDENCE.DOWNLOAD',
                'OCOP_CRITERIA.READ', 'REPORT.READ', 'REPORT.EXPORT',
            ],

            // ACCOUNTANT: Financial accounting & capital ledger (No self-approval for expenses - SoD)
            'ACCOUNTANT' => [
                'COOPERATIVE.READ', 'COOP.READ',
                'MEMBER.READ',
                'CAPITAL.READ', 'CAPITAL.MANAGE', 'CAPITAL.CREATE',
                'FINANCE.READ', 'FINANCE.CREATE', 'FINANCE.UPDATE', 'FINANCE.TRANSACTION.CREATE', 'FINANCE.TRANSACTION.UPDATE',
                'INVENTORY.READ', 'STOCK.READ',
                'REPORT.READ', 'REPORT.EXPORT',
            ],

            // STOREKEEPER: Warehouse, material stock receipts/issues and stocktaking
            'STOREKEEPER' => [
                'COOPERATIVE.READ', 'COOP.READ',
                'PRODUCT.READ',
                'INVENTORY.READ', 'INVENTORY.CREATE', 'INVENTORY.UPDATE',
                'INVENTORY.RECEIPT.CREATE', 'INVENTORY.ISSUE.CREATE', 'INVENTORY.COUNT.CREATE',
                'STOCK.READ', 'STOCK.CREATE', 'STOCK.UPDATE', 'STOCK.APPROVE',
            ],

            // AGRICULTURE_OFFICER: Field plots, seasons, and farming logs
            'AGRICULTURE_OFFICER' => [
                'COOPERATIVE.READ', 'COOP.READ',
                'MEMBER.READ',
                'AGRICULTURE.READ', 'AGRICULTURE.CREATE', 'AGRICULTURE.UPDATE', 'AGRICULTURE.DELETE',
                'FARMING_LOG.READ', 'FARMING_LOG.CREATE', 'FARMING_LOG.UPDATE',
                'HARVEST.READ', 'HARVEST.CREATE', 'HARVEST.UPDATE',
                'PRODUCT.READ',
                'INVENTORY.READ', 'STOCK.READ',
            ],

            // HTX_STAFF: General support staff
            'HTX_STAFF' => [
                'COOPERATIVE.READ', 'COOP.READ',
                'MEMBER.READ', 'MEMBER.CREATE', 'MEMBER.UPDATE',
                'AGRICULTURE.READ', 'AGRICULTURE.CREATE',
                'INVENTORY.READ', 'INVENTORY.RECEIPT.CREATE', 'INVENTORY.ISSUE.CREATE',
                'REPORT.READ',
            ],

            // OCOP_PREPARER: Digitizing application & uploading evidence
            'OCOP_PREPARER' => [
                'COOPERATIVE.READ', 'COOP.READ',
                'PRODUCT.READ',
                'AGRICULTURE.READ', 'FARMING_LOG.READ', 'HARVEST.READ',
                'OCOP_CRITERIA.READ',
                'OCOP_APPLICATION.READ', 'OCOP_APPLICATION.CREATE', 'OCOP_APPLICATION.UPDATE', 'OCOP_APPLICATION.SUBMIT',
                'OCOP_EVIDENCE.READ', 'OCOP_EVIDENCE.UPLOAD', 'OCOP_EVIDENCE.REPLACE', 'OCOP_EVIDENCE.DOWNLOAD',
            ],

            // RECEIVING_REVIEWER: Review completeness & return dossier
            'RECEIVING_REVIEWER' => [
                'OCOP_CRITERIA.READ',
                'OCOP_APPLICATION.READ', 'OCOP_APPLICATION.REVIEW', 'OCOP_APPLICATION.RETURN',
                'OCOP_EVIDENCE.READ', 'OCOP_EVIDENCE.VERIFY', 'OCOP_EVIDENCE.DOWNLOAD',
            ],

            // EVIDENCE_REVIEWER: Verify evidence validity & compliance
            'EVIDENCE_REVIEWER' => [
                'OCOP_CRITERIA.READ',
                'OCOP_APPLICATION.READ',
                'OCOP_EVIDENCE.READ', 'OCOP_EVIDENCE.VERIFY', 'OCOP_EVIDENCE.DOWNLOAD',
            ],

            // EVALUATOR: Independent scoring & locking score sheets
            'EVALUATOR' => [
                'OCOP_CRITERIA.READ',
                'OCOP_APPLICATION.READ',
                'OCOP_EVIDENCE.READ', 'OCOP_EVIDENCE.DOWNLOAD',
                'OCOP_EVALUATION.READ', 'OCOP_EVALUATION.SCORE', 'OCOP_EVALUATION.LOCK',
            ],

            // COUNCIL_MEMBER: Council members scoring & consolidating
            'COUNCIL_MEMBER' => [
                'OCOP_CRITERIA.READ',
                'OCOP_APPLICATION.READ',
                'OCOP_EVIDENCE.READ', 'OCOP_EVIDENCE.DOWNLOAD',
                'OCOP_EVALUATION.READ', 'OCOP_EVALUATION.SCORE', 'OCOP_EVALUATION.LOCK', 'OCOP_EVALUATION.CONSOLIDATE',
            ],

            // COUNCIL_SECRETARY: Consolidating scores & preparing records
            'COUNCIL_SECRETARY' => [
                'OCOP_CRITERIA.READ',
                'OCOP_APPLICATION.READ',
                'OCOP_EVIDENCE.READ', 'OCOP_EVIDENCE.DOWNLOAD',
                'OCOP_EVALUATION.READ', 'OCOP_EVALUATION.CONSOLIDATE',
                'OCOP_DECISION.READ', 'OCOP_DECISION.RECORD',
                'REPORT.READ', 'REPORT.EXPORT',
            ],

            // AUTHORITY: Issuing final OCOP certification decision (UBND)
            'AUTHORITY' => [
                'OCOP_CRITERIA.READ',
                'OCOP_APPLICATION.READ',
                'OCOP_EVALUATION.READ',
                'OCOP_DECISION.READ', 'OCOP_DECISION.RECORD', 'OCOP_DECISION.APPROVE',
                'REPORT.READ', 'REPORT.EXPORT',
            ],

            // CRITERIA_ADMIN: Managing OCOP criteria versions & threshold rules
            'CRITERIA_ADMIN' => [
                'OCOP_CRITERIA.READ', 'OCOP_CRITERIA.MANAGE',
                'REPORT.READ',
            ],

            // AUDITOR: Independent inspection & compliance trace
            'AUDITOR' => [
                'AUDIT.READ', 'REPORT.READ', 'COOPERATIVE.READ', 'MEMBER.READ',
                'FINANCE.READ', 'INVENTORY.READ', 'OCOP_APPLICATION.READ',
            ],

            // REPORT_VIEWER: Read-only dashboards and exports
            'REPORT_VIEWER' => [
                'REPORT.READ', 'REPORT.EXPORT',
            ],
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
