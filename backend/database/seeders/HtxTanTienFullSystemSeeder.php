<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class HtxTanTienFullSystemSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // 1. Get or Ensure Cooperative
        $coop = DB::table('cooperatives')->where('id', 'a60ccf85-7301-43f7-b6d3-b25f72c75b78')->first();
        if ($coop) {
            DB::table('cooperatives')->where('id', $coop->id)->update([
                'cooperative_code' => 'HTX-TANTIEN-01',
                'legal_name' => 'Hợp tác xã Nông nghiệp Tân Tiến',
                'display_name' => 'HTX Nông nghiệp Tân Tiến',
                'status' => 'ACTIVE',
                'updated_at' => $now,
            ]);
            $coopId = $coop->id;
        } else {
            $coopId = 'a60ccf85-7301-43f7-b6d3-b25f72c75b78';
            DB::table('cooperatives')->insert([
                'id' => $coopId,
                'cooperative_code' => 'HTX-TANTIEN-01',
                'legal_name' => 'Hợp tác xã Nông nghiệp Tân Tiến',
                'display_name' => 'HTX Nông nghiệp Tân Tiến',
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 2. Members mapping
        $memberA = DB::table('members')->where('member_code', 'TV001')->first();
        $memberB = DB::table('members')->where('member_code', 'TV002')->first();
        $memberC = DB::table('members')->where('member_code', 'TV003')->first();

        $memberAId = $memberA ? $memberA->id : (string) Str::uuid();
        $memberBId = $memberB ? $memberB->id : (string) Str::uuid();
        $memberCId = $memberC ? $memberC->id : (string) Str::uuid();

        // Update credit limits for members
        if ($memberA) {
            DB::table('members')->where('id', $memberAId)->update(['credit_limit' => 20000000]);
        }
        if ($memberB) {
            DB::table('members')->where('id', $memberBId)->update(['credit_limit' => 15000000]);
        }
        if ($memberC) {
            DB::table('members')->where('id', $memberCId)->update(['credit_limit' => 10000000]);
        }

        // Clean tear-down in reverse foreign-key order for idempotency
        DB::table('product_lots')->delete();
        DB::table('final_decisions')->delete();
        DB::table('evaluation_sessions')->delete();
        DB::table('ocop_applications')->delete();
        DB::table('lots')->delete();
        DB::table('harvests')->delete();
        DB::table('farming_logs')->delete();
        DB::table('stock_issue_lines')->delete();
        DB::table('stock_issues')->delete();
        DB::table('stock_receipt_lines')->delete();
        DB::table('stock_receipts')->delete();
        DB::table('receivable_payables')->where('cooperative_id', $coopId)->delete();
        DB::table('cash_transactions')->where('cooperative_id', $coopId)->delete();
        DB::table('materials')->where('cooperative_id', $coopId)->delete();
        DB::table('products')->where('cooperative_id', $coopId)->delete();
        DB::table('member_plot_assignments')->delete();
        DB::table('crop_seasons')->delete();
        DB::table('farm_plots')->delete();
        DB::table('production_units')->where('cooperative_id', $coopId)->delete();
        DB::table('warehouses')->where('cooperative_id', $coopId)->delete();

        // 3. Production Units (Vùng sản xuất)
        $unit1Id = (string) Str::uuid();
        $unit2Id = (string) Str::uuid();

        DB::table('production_units')->insert([
            [
                'id' => $unit1Id,
                'cooperative_id' => $coopId,
                'unit_code' => 'VT-DALAT-01',
                'name' => 'Vùng trồng Ớt Chuông Sweet Palermo Hòn Bồ (Phường 12 - Đà Lạt)',
                'crop' => 'Ớt chuông Sweet Palermo Đỏ',
                'area' => 15.0,
                'location' => json_encode([
                    'latitude' => 11.9501,
                    'longitude' => 108.4712,
                    'address' => 'Khu Hòn Bồ, Phường 12, TP. Đà Lạt, Tỉnh Lâm Đồng'
                ]),
                'status' => 'ACTIVE',
                'registration_information' => json_encode([
                    'puc_code' => 'PUC-49-015-9923',
                    'puc_status' => 'ACTIVE',
                    'certified_date' => '2024-01-15',
                    'standard' => 'VietGAP'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $unit2Id,
                'cooperative_id' => $coopId,
                'unit_code' => 'VT-DASAR-02',
                'name' => 'Vùng trồng Liên Kết Đạ Sar - Lạc Dương (HTX Tân Tiến)',
                'crop' => 'Ớt chuông Sweet Palermo Đỏ & Vàng',
                'area' => 12.5,
                'location' => json_encode([
                    'latitude' => 11.9404,
                    'longitude' => 108.4583,
                    'address' => 'Xã Đạ Sar, Huyện Lạc Dương, Tỉnh Lâm Đồng'
                ]),
                'status' => 'ACTIVE',
                'registration_information' => json_encode([
                    'puc_code' => 'PUC-49-015-9924',
                    'puc_status' => 'ACTIVE',
                    'certified_date' => '2024-03-20',
                    'standard' => 'VietGAP'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 4. Farm Plots (Thửa đất canh tác)
        $plot1Id = (string) Str::uuid();
        $plot2Id = (string) Str::uuid();
        $plot3Id = (string) Str::uuid();

        DB::table('farm_plots')->insert([
            [
                'id' => $plot1Id,
                'production_unit_id' => $unit1Id,
                'plot_code' => 'PLOT-TT-XV001-01',
                'area' => 4.5,
                'status' => 'ACTIVE',
                'land_relation' => json_encode([
                    'gps_latitude' => 11.9501,
                    'gps_longitude' => 108.4712,
                    'puc_code' => 'PUC-49-015-9923',
                    'soil_type' => 'Đất đỏ bazan',
                    'irrigation' => 'Nhỏ giọt Israel bù áp'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $plot2Id,
                'production_unit_id' => $unit1Id,
                'plot_code' => 'PLOT-TT-XV001-02',
                'area' => 4.0,
                'status' => 'ACTIVE',
                'land_relation' => json_encode([
                    'gps_latitude' => 11.9510,
                    'gps_longitude' => 108.4720,
                    'puc_code' => 'PUC-49-015-9923',
                    'soil_type' => 'Đất đỏ bazan',
                    'irrigation' => 'Tưới nhỏ giọt'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $plot3Id,
                'production_unit_id' => $unit2Id,
                'plot_code' => 'PLOT-TT-XV002-01',
                'area' => 6.5,
                'status' => 'ACTIVE',
                'land_relation' => json_encode([
                    'gps_latitude' => 11.9525,
                    'gps_longitude' => 108.4735,
                    'puc_code' => 'PUC-49-015-9924',
                    'soil_type' => 'Đất phù sa cổ',
                    'irrigation' => 'Tưới phun sương & nhỏ giọt'
                ]),
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 5. Member Plot Assignments
        DB::table('member_plot_assignments')->insert([
            [
                'id' => (string) Str::uuid(),
                'member_id' => $memberAId,
                'plot_id' => $plot1Id,
                'assignment_type' => 'OWNER',
                'start_date' => '2025-01-01',
                'end_date' => null,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'member_id' => $memberAId,
                'plot_id' => $plot2Id,
                'assignment_type' => 'CO_FARMER',
                'start_date' => '2025-01-01',
                'end_date' => null,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'member_id' => $memberBId,
                'plot_id' => $plot3Id,
                'assignment_type' => 'OWNER',
                'start_date' => '2025-01-01',
                'end_date' => null,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 6. Crop Season
        $seasonId = (string) Str::uuid();
        DB::table('crop_seasons')->insert([
            'id' => $seasonId,
            'production_unit_id' => $unit1Id,
            'name' => 'Vụ Đông Xuân 2025 - 2026',
            'crop' => 'Ớt chuông Sweet Palermo Đỏ',
            'start_date' => '2025-11-01',
            'expected_end_date' => '2026-03-31',
            'actual_end_date' => null,
            'status' => 'IN_PROGRESS',
            'plan_information' => json_encode([
                'target_yield_kg' => 45000,
                'budget' => 350000000,
                'certification_standard' => 'VietGAP',
                'puc_code' => 'PUC-49-015-9923'
            ]),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 7. Warehouse
        $warehouseId = (string) Str::uuid();
        DB::table('warehouses')->insert([
            'id' => $warehouseId,
            'cooperative_id' => $coopId,
            'warehouse_code' => 'KHO-TT-01',
            'name' => 'Kho Vật Tư & Nông Sản Trung Tâm Đà Lạt',
            'location' => 'Phường 12, TP. Đà Lạt',
            'manager_id' => null,
            'status' => 'ACTIVE',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 8. Materials (Vật tư nông nghiệp)
        $mat1Id = (string) Str::uuid();
        $mat2Id = (string) Str::uuid();
        $mat3Id = (string) Str::uuid();

        DB::table('materials')->insert([
            [
                'id' => $mat1Id,
                'cooperative_id' => $coopId,
                'sku' => 'MAT-PHAN-01',
                'name' => 'Phân trùn quế hữu cơ Bio-Grow (25kg)',
                'category' => 'FERTILIZER',
                'unit' => 'bao_25kg',
                'safety_information' => json_encode([
                    'phi_days' => 0,
                    'dosage' => '100-150 kg/1000m²',
                    'manufacturer' => 'Công ty Bio-Grow'
                ]),
                'reorder_threshold' => 20,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $mat2Id,
                'cooperative_id' => $coopId,
                'sku' => 'MAT-BVTV-02',
                'name' => 'Thuốc BVTV Sinh học Neem Oil 1L',
                'category' => 'PESTICIDE',
                'unit' => 'chai_1L',
                'safety_information' => json_encode([
                    'phi_days' => 3,
                    'active_ingredient' => 'Azadirachtin 0.3%',
                    'dosage' => '20ml / bình 16L nước'
                ]),
                'reorder_threshold' => 10,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => $mat3Id,
                'cooperative_id' => $coopId,
                'sku' => 'MAT-GIONG-03',
                'name' => 'Hạt giống Ớt chuông Sweet Palermo Đỏ F1 (Rijk Zwaan)',
                'category' => 'SEED',
                'unit' => 'goi_1000hat',
                'safety_information' => json_encode([
                    'germination_rate' => '98%',
                    'origin' => 'Hà Lan'
                ]),
                'reorder_threshold' => 5,
                'status' => 'ACTIVE',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 9. Stock Receipt (Phiếu Nhập Kho KCS)
        $receiptId = (string) Str::uuid();
        DB::table('stock_receipts')->insert([
            'id' => $receiptId,
            'cooperative_id' => $coopId,
            'warehouse_id' => $warehouseId,
            'receipt_number' => 'PNK-2025-001',
            'supplier_information' => json_encode([
                'supplier_name' => 'Công ty TNHH Phân Bón Sinh Học Bio-Grow',
                'phone' => '02633888999',
                'address' => 'Đức Trọng, Lâm Đồng'
            ]),
            'receipt_date' => '2025-10-25',
            'status' => 'APPROVED',
            'total_amount' => 50000000,
            'evidence_reference' => json_encode([
                'coa_url' => 'https://example.com/coa/bio-grow.pdf',
                'invoice_no' => 'HD-00912'
            ]),
            'kcs_inspection' => json_encode([
                'passed' => true,
                'inspector' => 'KCS_TRAN_KHO',
                'checked_date' => '2025-10-25'
            ]),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('stock_receipt_lines')->insert([
            [
                'id' => (string) Str::uuid(),
                'stock_receipt_id' => $receiptId,
                'material_id' => $mat1Id,
                'quantity' => 100,
                'unit_price' => 350000,
                'batch_code' => 'BATCH-BG-2025-01',
                'expiry_date' => '2027-10-25',
                'line_amount' => 35000000,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'stock_receipt_id' => $receiptId,
                'material_id' => $mat2Id,
                'quantity' => 60,
                'unit_price' => 250000,
                'batch_code' => 'BATCH-NO-2025-02',
                'expiry_date' => '2027-04-30',
                'line_amount' => 15000000,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 10. Stock Issue (Phiếu Xuất Nợ Đầu Vụ cho xã viên)
        $issueId = (string) Str::uuid();
        DB::table('stock_issues')->insert([
            'id' => $issueId,
            'cooperative_id' => $coopId,
            'warehouse_id' => $warehouseId,
            'issue_number' => 'PXK-2025-001',
            'issue_date' => '2025-11-05',
            'member_id' => $memberAId,
            'purpose' => 'Xuất nợ phân bón đầu vụ cho xã viên Nguyễn Văn A',
            'is_credit' => true,
            'status' => 'APPROVED',
            'total_amount' => 7500000,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('stock_issue_lines')->insert([
            'id' => (string) Str::uuid(),
            'stock_issue_id' => $issueId,
            'material_id' => $mat1Id,
            'quantity' => 15,
            'unit_price' => 500000,
            'batch_code' => 'BATCH-BG-2025-01',
            'line_amount' => 7500000,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 11. Receivable Payables (Công nợ phải thu xã viên)
        DB::table('receivable_payables')->insert([
            [
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'debt_code' => 'CN-VT-2025-001',
                'counterparty_type' => 'MEMBER',
                'counterparty_id' => $memberAId,
                'counterparty_name' => 'Nguyễn Văn A',
                'member_id' => $memberAId,
                'debt_type' => 'RECEIVABLE',
                'original_amount' => 7500000,
                'outstanding_amount' => 7500000,
                'due_date' => '2026-03-31',
                'description' => 'Nợ vật tư 15 bao phân Bio-Grow đầu vụ Đông Xuân 2025-2026 (Phiếu xuất PXK-2025-001)',
                'status' => 'OPEN',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'debt_code' => 'CN-VT-2025-002',
                'counterparty_type' => 'MEMBER',
                'counterparty_id' => $memberBId,
                'counterparty_name' => 'Trần Thị B',
                'member_id' => $memberBId,
                'debt_type' => 'RECEIVABLE',
                'original_amount' => 5000000,
                'outstanding_amount' => 5000000,
                'due_date' => '2026-03-31',
                'description' => 'Nợ vật tư 10 bao phân Bio-Grow đầu vụ',
                'status' => 'OPEN',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        $adminUser = DB::table('users')->where('username', 'admin')->first();
        $adminUserId = $adminUser ? $adminUser->id : null;

        // 12. Farming Logs (Nhật ký canh tác chuẩn 10 trường)
        DB::table('farming_logs')->insert([
            [
                'id' => (string) Str::uuid(),
                'crop_season_id' => $seasonId,
                'plot_id' => $plot1Id,
                'activity_type' => 'FERTILIZATION',
                'activity_date' => '2025-11-10',
                'description' => 'Bón lót đáy luống nhà kính Hòn Bồ trước khi trồng cây giống ớt chuông F1',
                'performed_by' => $adminUserId,
                'attachment_reference' => json_encode([
                    'photo_url' => 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80'
                ]),
                'material_id' => $mat1Id,
                'material_batch_number' => 'BATCH-BG-2025-01',
                'quantity_applied' => 15,
                'unit' => 'bao_25kg',
                'phi_days' => 0,
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'crop_season_id' => $seasonId,
                'plot_id' => $plot1Id,
                'activity_type' => 'PEST_CONTROL',
                'activity_date' => '2025-12-20',
                'description' => 'Phun phòng trừ bọ trĩ và rệp muội bằng chế phẩm Neem Oil sinh học',
                'performed_by' => $adminUserId,
                'attachment_reference' => json_encode([
                    'photo_url' => 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'
                ]),
                'material_id' => $mat2Id,
                'material_batch_number' => 'BATCH-NO-2025-02',
                'quantity_applied' => 2,
                'unit' => 'chai_1L',
                'phi_days' => 3,
                'gps_latitude' => 11.9501,
                'gps_longitude' => 108.4712,
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 13. Product (Sản phẩm OCOP 4 sao)
        $productId = (string) Str::uuid();

        DB::table('products')->insert([
            'id' => $productId,
            'cooperative_id' => $coopId,
            'product_code' => 'PRD-PALERMO-RED',
            'product_name' => 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
            'category' => 'Rau, củ, quả, hạt tươi',
            'brand' => 'HTX Nông Nghiệp Tân Tiến Đà Lạt',
            'specification' => json_encode([
                'net_weight' => '5kg/thùng',
                'packaging' => 'Thùng carton 5 lớp có túi đục lỗ thoáng khí',
                'shelf_life' => '21 ngày ở 8-10°C'
            ]),
            'quality_information' => json_encode([
                'certification' => 'VietGAP TCVN 11892-1:2017',
                'cert_no' => 'VG-49-2024-0089',
                'cert_date' => '2024-06-15',
                'brix_level' => '≥ 8.5',
                'ocop_stars' => 4,
                'target_market' => 'Siêu thị cao cấp & Xuất khẩu'
            ]),
            'status' => 'ACTIVE',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 14. Harvest & Lot (Thu hoạch và Lô GS1)
        $harvestId = (string) Str::uuid();
        $lotId = (string) Str::uuid();

        DB::table('harvests')->insert([
            'id' => $harvestId,
            'crop_season_id' => $seasonId,
            'plot_id' => $plot1Id,
            'harvest_date' => '2026-01-10',
            'quantity' => 1500,
            'unit' => 'kg',
            'grade' => 'GRADE_A',
            'brix_level' => 8.8,
            'uniformity_rate' => 95.5,
            'kcs_status' => 'PASSED',
            'kcs_gate_check' => json_encode([
                'phi_passed' => true,
                'phi_days' => 3,
                'visual_inspection' => 'Quả đỏ bóng, thuôn dài 20-25cm, không dập gãy',
                'inspector' => 'KCS_LE_TRONG'
            ]),
            'kcs_quick_lab' => json_encode([
                'pesticide_ppm' => 0.002,
                'max_allowed_ppm' => 0.05,
                'heavy_metals' => 'UNDETECTED',
                'lab_code' => 'TEST-2026-089'
            ]),
            'quality_information' => json_encode([
                'grade_a_kg' => 1250,
                'grade_b_kg' => 200,
                'reject_kg' => 50,
                'is_settled' => false
            ]),
            'lot_id' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('lots')->insert([
            'id' => $lotId,
            'lot_code' => 'LOT-TT-2026-001',
            'harvest_id' => $harvestId,
            'quantity' => 1250,
            'unit' => 'kg',
            'status' => 'PACKAGED',
            'source_information' => json_encode([
                'cooperative' => 'HTX Nông Nghiệp Tân Tiến',
                'plot_code' => 'PLOT-TT-XV001-01',
                'puc_code' => 'PUC-49-015-9923',
                'crop' => 'Ớt chuông Sweet Palermo Đỏ',
                'packaging_date' => '2026-01-11',
                'qr_url' => 'https://trace.ocop.gov.vn/lot/LOT-TT-2026-001'
            ]),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Update circular FK in harvests
        DB::table('harvests')->where('id', $harvestId)->update(['lot_id' => $lotId]);

        // Link Lot to Product
        DB::table('product_lots')->insert([
            'product_id' => $productId,
            'lot_id' => $lotId,
            'quantity' => 1250,
            'created_at' => $now,
        ]);

        // 15. Ocop Application (Hồ sơ OCOP đã tự chấm 92 điểm)
        $criteriaVersion = DB::table('criteria_versions')->where('status', 'PUBLISHED')->first();
        $cvId = $criteriaVersion ? $criteriaVersion->id : '3ebdcd43-f84f-4309-8642-1f1e563deed7';

        $appId = (string) Str::uuid();
        DB::table('ocop_applications')->insert([
            'id' => $appId,
            'cooperative_id' => $coopId,
            'product_id' => $productId,
            'criteria_version_id' => $cvId,
            'application_number' => 'OCOP-2026-DALAT-001',
            'application_type' => 'NEW_EVALUATION',
            'status' => 'SUBMITTED',
            'submitted_at' => '2026-01-12 09:00:00',
            'completed_at' => null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 16. Final Decision (Quyết định công nhận OCOP 4 sao)
        DB::table('final_decisions')->insert([
            'id' => (string) Str::uuid(),
            'application_id' => $appId,
            'decision_number' => 'QĐ-UBND-2026-089',
            'decision_date' => '2026-01-15',
            'final_classification' => 'FOUR_STAR',
            'effective_date' => '2026-01-15',
            'authority_reference' => json_encode([
                'issuer' => 'UBND Tỉnh Lâm Đồng',
                'level' => 'PROVINCIAL',
                'signer_name' => 'Nguyễn Minh Tuấn',
                'signer_title' => 'Phó Chủ tịch UBND Tỉnh'
            ]),
            'document_reference' => json_encode([
                'doc_url' => 'https://lamdong.gov.vn/van-ban/qd-2026-089.pdf',
                'file_name' => 'Quyet_Dinh_Cong_Nhan_OCOP_4_Sao_Ot_Palermo.pdf'
            ]),
            'status' => 'ISSUED',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 17. Cash Transactions (Sổ quỹ tiền mặt HTX)
        DB::table('cash_transactions')->insert([
            [
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'voucher_number' => 'PT-2025-001',
                'transaction_number' => 'TXN-2025-001',
                'transaction_type' => 'INCOME',
                'amount' => 50000000,
                'transaction_date' => '2025-10-01',
                'category' => 'GOP_VON',
                'description' => 'Thu tiền góp vốn điều lệ đợt 1 từ xã viên Nguyễn Văn A',
                'payer_payee' => 'Nguyễn Văn A',
                'member_id' => $memberAId,
                'status' => 'POSTED',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'voucher_number' => 'PC-2025-002',
                'transaction_number' => 'TXN-2025-002',
                'transaction_type' => 'EXPENSE',
                'amount' => 25000000,
                'transaction_date' => '2025-10-25',
                'category' => 'MUA_VAT_TU',
                'description' => 'Thanh toán tạm ứng 50% tiền phân bón Bio-Grow cho nhà cung cấp',
                'payer_payee' => 'Công ty TNHH Bio-Grow',
                'member_id' => null,
                'status' => 'POSTED',
                'created_at' => $now,
                'updated_at' => $now,
            ]
        ]);

        // 18. Evaluation Session (Phiên thẩm định Hội đồng OCOP)
        $councilLevel = DB::table('council_levels')->where('code', 'PROVINCE')->first();
        if ($councilLevel) {
            DB::table('evaluation_sessions')->insert([
                'id' => (string) Str::uuid(),
                'application_id' => $appId,
                'council_level_id' => $councilLevel->id,
                'status' => 'CONSOLIDATED',
                'started_at' => '2026-01-14 08:30:00',
                'completed_at' => '2026-01-14 17:00:00',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
}
