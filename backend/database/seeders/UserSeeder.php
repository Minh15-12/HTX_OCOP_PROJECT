<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Identity\Infrastructure\Persistence\Models\RoleModel;
use Modules\Identity\Infrastructure\Persistence\Models\UserModel;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create or get default Cooperative (Canonical ID with full agricultural and OCOP dataset)
        $canonicalCoopId = 'a60ccf85-7301-43f7-b6d3-b25f72c75b78';
        $cooperative = CooperativeModel::where('id', $canonicalCoopId)
            ->orWhere('cooperative_code', 'HTX-PHUTHINH-01')
            ->first() ?? CooperativeModel::create([
                'id' => $canonicalCoopId,
                'cooperative_code' => 'HTX-PHUTHINH-01',
                'legal_name' => 'Hợp tác xã Nông nghiệp Xanh Phú Thịnh',
                'display_name' => 'HTX Nông nghiệp Xanh Phú Thịnh',
                'status' => 'ACTIVE',
            ]);

        $defaultPassword = Hash::make('password123');

        // 2. Persona Users covering realistic operational and SoD roles
        $usersData = [
            // Quản trị viên hệ thống (Technical Admin - SoD: No business auto-approval)
            [
                'username' => 'sys_admin',
                'email' => 'sysadmin@ocopvietnam.gov.vn',
                'full_name' => 'Hệ Thống - Quản Trị Viên Cấp Cao',
                'phone_number' => '0901000001',
                'role_code' => 'SYSTEM_ADMIN',
            ],
            // Chủ tịch / Đại diện pháp luật HTX (Full HTX Management)
            [
                'username' => 'admin_htx',
                'email' => 'admin_htx@htxphuthinh.vn',
                'full_name' => 'Nguyễn Văn Phú (Chủ tịch HTX)',
                'phone_number' => '0987654321',
                'role_code' => 'HTX_OWNER',
            ],
            [
                'username' => 'admin',
                'email' => 'admin@htxphuthinh.vn',
                'full_name' => 'Quản Trị Viên Phú Thịnh',
                'phone_number' => '0987654322',
                'role_code' => 'HTX_OWNER',
            ],
            // Giám đốc điều hành HTX
            [
                'username' => 'giamdoc01',
                'email' => 'giamdoc@htxphuthinh.vn',
                'full_name' => 'Trần Văn Giám Đốc',
                'phone_number' => '0987654328',
                'role_code' => 'HTX_DIRECTOR',
            ],
            // Ban kiểm soát HTX (Audit & Supervisor)
            [
                'username' => 'kiemsoat01',
                'email' => 'kiemsoat@htxphuthinh.vn',
                'full_name' => 'Vũ Thị Thanh Tra',
                'phone_number' => '0987654329',
                'role_code' => 'HTX_SUPERVISOR',
            ],
            // Kế toán HTX (Finance Creator - SoD: Cannot score OCOP or alter system configs)
            [
                'username' => 'ketoan01',
                'email' => 'ketoan@htxphuthinh.vn',
                'full_name' => 'Trần Thị Thu Cúc (Kế Toán Trưởng)',
                'phone_number' => '0987654323',
                'role_code' => 'ACCOUNTANT',
            ],
            // Thủ kho HTX (Inventory & Stock - SoD: Cannot create financial disbursements)
            [
                'username' => 'thukho01',
                'email' => 'thukho@htxphuthinh.vn',
                'full_name' => 'Đặng Văn Kho (Thủ Kho Vật Tư)',
                'phone_number' => '0987654330',
                'role_code' => 'STOREKEEPER',
            ],
            // Cán bộ Kỹ thuật Nông nghiệp (Farming plots, crops, logs)
            [
                'username' => 'canbo_nongnghiep01',
                'email' => 'kythuat@htxphuthinh.vn',
                'full_name' => 'Lê Kỹ Thuật (Kỹ Sư Canh Tác)',
                'phone_number' => '0987654331',
                'role_code' => 'AGRICULTURE_OFFICER',
            ],
            // Chuyên viên Hồ sơ OCOP (OCOP Dossier Preparer - SoD: Cannot score own dossier)
            [
                'username' => 'chuyenvien_ocop01',
                'email' => 'ocop_hoso@htxphuthinh.vn',
                'full_name' => 'Hoàng Ocop (Chuyên Viên Hồ Sơ)',
                'phone_number' => '0987654332',
                'role_code' => 'OCOP_PREPARER',
            ],
            // Giám khảo Hội đồng Đánh giá OCOP (Evaluator - SoD: Cannot alter cooperative files)
            [
                'username' => 'danhgia01',
                'email' => 'danhgia@htxphuthinh.vn',
                'full_name' => 'Nguyễn Văn Giám Khảo (Hội Đồng Đánh Giá)',
                'phone_number' => '0987654327',
                'role_code' => 'EVALUATOR',
            ],
            // Chủ tịch Hội đồng OCOP (Council Chair)
            [
                'username' => 'chutich_hoidong01',
                'email' => 'hoidong_ocop@nongnghiep.gov.vn',
                'full_name' => 'Phạm Văn Chủ Tịch Hội Đồng',
                'phone_number' => '0987654333',
                'role_code' => 'COUNCIL_CHAIR',
            ],
            // Xã viên HTX (Member)
            [
                'username' => 'xavien01',
                'email' => 'xavien@htxphuthinh.vn',
                'full_name' => 'Bác Ba Nông Dân',
                'phone_number' => '0987654334',
                'role_code' => 'HTX_MEMBER',
            ],
            [
                'username' => 'thanhvien01',
                'email' => 'thanhvien@htxphuthinh.vn',
                'full_name' => 'Hoàng Văn Em',
                'phone_number' => '0987654326',
                'role_code' => 'HTX_MEMBER',
            ],
            // Nhân viên chung HTX
            [
                'username' => 'nvhtx01',
                'email' => 'nvhtx@htxphuthinh.vn',
                'full_name' => 'Lê Văn Chung',
                'phone_number' => '0987654324',
                'role_code' => 'HTX_STAFF',
            ],
        ];

        foreach ($usersData as $uData) {
            $user = UserModel::updateOrCreate(
                ['username' => $uData['username']],
                [
                    'email' => $uData['email'],
                    'password' => $defaultPassword,
                    'full_name' => $uData['full_name'],
                    'phone_number' => $uData['phone_number'],
                    'cooperative_id' => $cooperative->id,
                    'status' => 'ACTIVE',
                ]
            );

            $role = RoleModel::where('code', $uData['role_code'])->first();
            if ($role) {
                $user->roles()->sync([$role->id]);
            }
        }
    }
}
