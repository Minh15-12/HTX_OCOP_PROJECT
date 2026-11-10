<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Modules\Cooperative\Infrastructure\Persistence\Models\CapitalContributionModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\CooperativeModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\LandContributionModel;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        $coop = CooperativeModel::firstOrCreate(
            ['cooperative_code' => 'HTX-PHUTHINH-01'],
            [
                'id' => (string) Str::uuid(),
                'legal_name' => 'HTX Nông nghiệp Xanh Phú Thịnh',
                'display_name' => 'HTX Phú Thịnh',
                'status' => 'ACTIVE',
            ]
        );

        $membersData = [
            [
                'member_code' => 'TV001',
                'member_type' => 'OFFICIAL',
                'committed_capital' => 50000000,
                'admission_date' => '2024-01-10',
                'status' => 'ACTIVE',
                'identity' => [
                    'full_name' => 'Nguyễn Văn A',
                    'gender' => 'Nam',
                    'dob' => '1985-04-12',
                    'citizen_id' => '049085001234',
                    'cccd_issue_date' => '2021-05-10',
                    'cccd_issue_place' => 'Cục Cảnh sát QLHC về trật tự xã hội',
                    'phone_number' => '0987654321',
                    'email' => 'nguyenvana@htxphuthinh.vn',
                    'province' => 'Lâm Đồng',
                    'district' => 'Huyện Lâm Hà',
                    'ward' => 'Xã Mê Linh',
                    'detail_address' => 'Thôn 2',
                    'address' => 'Thôn 2, Xã Mê Linh, Huyện Lâm Hà, Tỉnh Lâm Đồng',
                    'bank_account' => '1012345678',
                    'bank_name' => 'Vietcombank - CN Lâm Đồng',
                    'account_holder' => 'NGUYEN VAN A',
                ],
                'contribution' => [
                    'type' => 'TIEN_MAT',
                    'amount' => 50000000,
                    'date' => '2024-01-15',
                    'note' => 'Góp vốn điều lệ đợt 1 bằng tiền mặt',
                ],
            ],
            [
                'member_code' => 'TV002',
                'member_type' => 'OFFICIAL',
                'committed_capital' => 50000000,
                'admission_date' => '2024-02-15',
                'status' => 'ACTIVE',
                'identity' => [
                    'full_name' => 'Trần Thị B',
                    'gender' => 'Nữ',
                    'dob' => '1990-08-20',
                    'citizen_id' => '049190005678',
                    'cccd_issue_date' => '2020-11-15',
                    'cccd_issue_place' => 'Cục Cảnh sát QLHC về trật tự xã hội',
                    'phone_number' => '0976543210',
                    'email' => 'tranthib@htxphuthinh.vn',
                    'province' => 'Lâm Đồng',
                    'district' => 'Huyện Lâm Hà',
                    'ward' => 'Xã Tân Hà',
                    'detail_address' => 'Thôn 1',
                    'address' => 'Thôn 1, Xã Tân Hà, Huyện Lâm Hà, Tỉnh Lâm Đồng',
                    'bank_account' => '5600205123456',
                    'bank_name' => 'Agribank - CN Lâm Hà',
                    'account_holder' => 'TRAN THI B',
                ],
                'contribution' => [
                    'type' => 'CHUYEN_KHOAN',
                    'amount' => 40000000,
                    'date' => '2024-02-20',
                    'note' => 'Chuyển khoản góp vốn đợt 1 (còn thiếu 10.000.000 đ)',
                ],
            ],
            [
                'member_code' => 'TV003',
                'member_type' => 'OFFICIAL',
                'committed_capital' => 100000000,
                'admission_date' => '2024-03-01',
                'status' => 'ACTIVE',
                'identity' => [
                    'full_name' => 'Lê Văn C',
                    'gender' => 'Nam',
                    'dob' => '1982-11-05',
                    'citizen_id' => '049082009876',
                    'cccd_issue_date' => '2021-08-12',
                    'cccd_issue_place' => 'Cục Cảnh sát QLHC về trật tự xã hội',
                    'phone_number' => '0912345678',
                    'email' => 'levanc@htxphuthinh.vn',
                    'province' => 'Lâm Đồng',
                    'district' => 'Huyện Lâm Hà',
                    'ward' => 'Xã Mê Linh',
                    'detail_address' => 'Thôn 4',
                    'address' => 'Thôn 4, Xã Mê Linh, Huyện Lâm Hà, Tỉnh Lâm Đồng',
                    'bank_account' => '0491000123987',
                    'bank_name' => 'Vietcombank - CN Lâm Đồng',
                    'account_holder' => 'LE VAN C',
                ],
                'contribution' => [
                    'type' => 'LAND',
                    'amount' => 100000000,
                    'date' => '2024-03-05',
                    'note' => 'Góp vốn bằng quyền sử dụng đất nông nghiệp 1.500m2',
                    'land' => [
                        'land_certificate_no' => 'GCN-BD-982341',
                        'plot_number' => '102',
                        'map_sheet_number' => '24',
                        'land_area_sqm' => 1500,
                        'land_use_type' => 'Đất trồng cây lâu năm',
                        'appraised_unit_price' => 66666.67,
                        'total_land_value' => 100000000,
                        'cadastral_status' => 'REGISTERED_CHANGE',
                    ],
                ],
            ],
            [
                'member_code' => 'TV004',
                'member_type' => 'ASSOCIATED',
                'committed_capital' => 20000000,
                'admission_date' => '2024-04-10',
                'status' => 'ACTIVE',
                'identity' => [
                    'full_name' => 'Phạm Thị D',
                    'gender' => 'Nữ',
                    'dob' => '1992-06-18',
                    'citizen_id' => '049192003456',
                    'cccd_issue_date' => '2022-01-20',
                    'cccd_issue_place' => 'Cục Cảnh sát QLHC về trật tự xã hội',
                    'phone_number' => '0934567890',
                    'email' => 'phamthid@htxphuthinh.vn',
                    'province' => 'Lâm Đồng',
                    'district' => 'Huyện Lâm Hà',
                    'ward' => 'Xã Gia Lâm',
                    'detail_address' => 'Thôn 3',
                    'address' => 'Thôn 3, Xã Gia Lâm, Huyện Lâm Hà, Tỉnh Lâm Đồng',
                    'bank_account' => '1903456789012',
                    'bank_name' => 'Techcombank - CN Đà Lạt',
                    'account_holder' => 'PHAM THI D',
                ],
                'contribution' => [
                    'type' => 'CHUYEN_KHOAN',
                    'amount' => 20000000,
                    'date' => '2024-04-12',
                    'note' => 'Góp vốn thành viên liên kết đợt 1',
                ],
            ],
            [
                'member_code' => 'TV005',
                'member_type' => 'OFFICIAL',
                'committed_capital' => 30000000,
                'admission_date' => '2024-05-02',
                'status' => 'ACTIVE',
                'identity' => [
                    'full_name' => 'Hoàng Văn E',
                    'gender' => 'Nam',
                    'dob' => '1988-09-25',
                    'citizen_id' => '049088007890',
                    'cccd_issue_date' => '2021-03-15',
                    'cccd_issue_place' => 'Cục Cảnh sát QLHC về trật tự xã hội',
                    'phone_number' => '0945678901',
                    'email' => 'hoangvane@htxphuthinh.vn',
                    'province' => 'Lâm Đồng',
                    'district' => 'Huyện Lâm Hà',
                    'ward' => 'Xã Tân Văn',
                    'detail_address' => 'Thôn 5',
                    'address' => 'Thôn 5, Xã Tân Văn, Huyện Lâm Hà, Tỉnh Lâm Đồng',
                    'bank_account' => '0491000987654',
                    'bank_name' => 'Vietcombank - CN Lâm Đồng',
                    'account_holder' => 'HOANG VAN E',
                ],
                'contribution' => [
                    'type' => 'TIEN_MAT',
                    'amount' => 15000000,
                    'date' => '2024-05-05',
                    'note' => 'Nộp tiền mặt đợt 1 (còn thiếu 15.000.000 đ)',
                ],
            ],
        ];

        foreach ($membersData as $m) {
            $member = MemberModel::firstOrCreate(
                [
                    'cooperative_id' => $coop->id,
                    'member_code' => $m['member_code'],
                ],
                [
                    'id' => (string) Str::uuid(),
                    'identity_information' => $m['identity'],
                    'member_type' => $m['member_type'],
                    'committed_capital' => $m['committed_capital'],
                    'admission_date' => $m['admission_date'],
                    'status' => $m['status'],
                    'credit_limit' => 50000000,
                ]
            );

            if (!empty($m['contribution'])) {
                $c = $m['contribution'];
                $certCode = 'GCN-'.date('Y').'-'.strtoupper(Str::random(6));

                $contrib = CapitalContributionModel::firstOrCreate(
                    [
                        'member_id' => $member->id,
                        'transaction_date' => $c['date'],
                    ],
                    [
                        'id' => (string) Str::uuid(),
                        'contribution_type' => $c['type'],
                        'amount' => $c['amount'],
                        'committed_amount' => $m['committed_capital'],
                        'actual_amount' => $c['amount'],
                        'ownership_ratio' => round(($c['amount'] / 250000000) * 100, 2),
                        'value_description' => $c['note'],
                        'status' => 'PAID',
                        'certificate_code' => $certCode,
                        'certificate_issue_date' => $c['date'],
                        'issue_count' => 1,
                        'qr_code_url' => 'https://htx.ocop.gov.vn/verify-certificate?code='.$certCode,
                    ]
                );

                if (!empty($c['land']) && !LandContributionModel::where('contribution_id', $contrib->id)->exists()) {
                    LandContributionModel::create(array_merge($c['land'], [
                        'id' => (string) Str::uuid(),
                        'contribution_id' => $contrib->id,
                    ]));
                }
            }
        }
    }
}
