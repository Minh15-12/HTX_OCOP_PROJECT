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
        // 1. Create or get default Cooperative
        $cooperative = CooperativeModel::firstOrCreate(
            ['cooperative_code' => 'HTX-PHUTHINH-01'],
            [
                'id' => (string) Str::uuid(),
                'legal_name' => 'HTX Nông nghiệp Xanh Phú Thịnh',
                'display_name' => 'HTX Phú Thịnh',
                'status' => 'ACTIVE',
            ]
        );

        // 2. Fetch Roles
        $adminRole = RoleModel::where('code', 'HTX_OWNER')->first() 
            ?? RoleModel::where('code', 'SYSTEM_ADMIN')->first();
        $staffRole = RoleModel::where('code', 'HTX_STAFF')->first();
        $evaluatorRole = RoleModel::where('code', 'EVALUATOR')->first();

        $defaultPassword = Hash::make('password123');

        // 3. User List matching Mockup Image & Specs
        $usersData = [
            [
                'username' => 'admin',
                'email' => 'admin@htxphuthinh.vn',
                'full_name' => 'Nguyễn Văn A',
                'phone_number' => '0987654321',
                'role_code' => 'HTX_OWNER',
            ],
            [
                'username' => 'admin_htx',
                'email' => 'admin_htx@htxphuthinh.vn',
                'full_name' => 'Quản Trị Viên HTX',
                'phone_number' => '0987654322',
                'role_code' => 'HTX_OWNER',
            ],
            [
                'username' => 'ketoan01',
                'email' => 'ketoan@htxphuthinh.vn',
                'full_name' => 'Trần Thị B',
                'phone_number' => '0987654323',
                'role_code' => 'HTX_STAFF',
            ],
            [
                'username' => 'nvhtx01',
                'email' => 'nvhtx@htxphuthinh.vn',
                'full_name' => 'Lê Văn C',
                'phone_number' => '0987654324',
                'role_code' => 'HTX_STAFF',
            ],
            [
                'username' => 'truongnhom01',
                'email' => 'truongnhom@htxphuthinh.vn',
                'full_name' => 'Phạm Thị D',
                'phone_number' => '0987654325',
                'role_code' => 'HTX_STAFF',
            ],
            [
                'username' => 'thanhvien01',
                'email' => 'thanhvien@htxphuthinh.vn',
                'full_name' => 'Hoàng Văn E',
                'phone_number' => '0987654326',
                'role_code' => 'HTX_STAFF',
            ],
            [
                'username' => 'danhgia01',
                'email' => 'danhgia@htxphuthinh.vn',
                'full_name' => 'Nguyễn Văn Giám Khảo',
                'phone_number' => '0987654327',
                'role_code' => 'EVALUATOR',
            ],
        ];

        foreach ($usersData as $uData) {
            $user = UserModel::firstOrCreate(
                ['username' => $uData['username']],
                [
                    'id' => (string) Str::uuid(),
                    'email' => $uData['email'],
                    'password' => $defaultPassword,
                    'full_name' => $uData['full_name'],
                    'phone_number' => $uData['phone_number'],
                    'cooperative_id' => $cooperative->id,
                    'status' => 'ACTIVE',
                ]
            );

            $role = RoleModel::where('code', $uData['role_code'])->first() ?? $adminRole;
            if ($role) {
                $user->roles()->sync([$role->id]);
            }
        }
    }
}
