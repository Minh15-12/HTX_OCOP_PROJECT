<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DurableToolAndInventorySeeder extends Seeder
{
    public function run(): void
    {
        $coop = DB::table('cooperatives')->where('cooperative_code', 'HTX-TANTIEN-01')->first()
            ?? DB::table('cooperatives')->first();

        if (!$coop) {
            $this->command->error('Không tìm thấy Hợp tác xã trong hệ thống.');

            return;
        }

        $coopId = $coop->id;
        $now = now()->toDateTimeString();

        // 1. Lấy Warehouse chính
        $warehouse = DB::table('warehouses')->where('cooperative_id', $coopId)->first();
        $warehouseId = $warehouse?->id;
        $warehouseName = $warehouse?->name ?? 'Kho Vật Tư & Nông Sản Trung Tâm Đà Lạt';

        // 2. Lấy User thủ kho & giám đốc
        $thuKho = DB::table('users')->where('username', 'thukho01')->first()
            ?? DB::table('users')->where('email', 'like', '%thukho%')->first()
            ?? DB::table('users')->first();
        $thuKhoId = $thuKho?->id;

        $giamDoc = DB::table('users')->where('username', 'giamdoc01')->first()
            ?? DB::table('users')->where('email', 'like', '%giamdoc%')->first()
            ?? DB::table('users')->first();
        $giamDocId = $giamDoc?->id;

        // 3. Cập nhật thông tin chi tiết (đơn giá, NCC, kho, HSD) cho 14 vật tư hiện hữu
        $materialsConfig = [
            'MAT-PHAN-01' => [
                'unit_price' => 350000,
                'supplier_name' => 'Công ty CP Phân bón Hữu cơ Bio-Grow',
                'description' => 'Phân trùn quế hữu cơ Bio-Grow (25kg) - Liều lượng: 100-150 kg/1000m²',
                'expiry_date' => '2027-10-25',
                'category' => 'FERTILIZER',
                'reorder_threshold' => 20,
            ],
            'MAT-PHAN-02' => [
                'unit_price' => 550000,
                'supplier_name' => 'Haifa Chemicals Ltd. (Israel) - CN Đà Lạt',
                'description' => 'Phân bón vi lượng Haifa Cal-Mag Israel (25kg) - 25kg / 1000L bồn dinh dưỡng',
                'expiry_date' => '2028-11-01',
                'category' => 'FERTILIZER',
                'reorder_threshold' => 15,
            ],
            'MAT-PHAN-03' => [
                'unit_price' => 480000,
                'supplier_name' => 'Seasol International Pty Ltd (Úc)',
                'description' => 'Phân bón hữu cơ sinh học rong biển Seasol Australia (Can 5L) - 100ml / bình 25L tưới kích rễ',
                'expiry_date' => '2027-08-15',
                'category' => 'FERTILIZER',
                'reorder_threshold' => 10,
            ],
            'MAT-PHAN-04' => [
                'unit_price' => 320000,
                'supplier_name' => 'Công ty Phân hữu cơ Sinh học Khánh Hòa',
                'description' => 'Phân dơi hữu cơ nguyên chất tự nhiên tạo ngọt Brix (Bao 10kg) - 50kg / 1000m² bón thúc tạo ngọt',
                'expiry_date' => '2027-12-30',
                'category' => 'FERTILIZER',
                'reorder_threshold' => 15,
            ],
            'MAT-PHAN-05' => [
                'unit_price' => 890000,
                'supplier_name' => 'Haifa Chemicals Ltd. (Israel) - CN Đà Lạt',
                'description' => 'Phân bón NPK hòa tan Haifa Multi-K 13-0-46 Kali Nitrate Israel (25kg) - Bổ sung kali giai đoạn trái lớn',
                'expiry_date' => '2028-06-20',
                'category' => 'FERTILIZER',
                'reorder_threshold' => 10,
            ],
            'MAT-BVTV-01' => [
                'unit_price' => 250000,
                'supplier_name' => 'Công ty CP Chế phẩm Sinh học Bionanotech',
                'description' => 'Thuốc BVTV Sinh học Neem Oil 1000EC 1L (Azadirachtin) - Pha 25ml / bình 20L phun phòng sâu trĩ',
                'expiry_date' => '2027-04-30',
                'category' => 'PESTICIDE',
                'reorder_threshold' => 10,
            ],
            'MAT-BVTV-02' => [
                'unit_price' => 120000,
                'supplier_name' => 'Viện Sinh học Nông nghiệp Lâm Đồng',
                'description' => 'Chế phẩm vi sinh đối kháng Trichoderma Bio-VT (1kg) - Rải gốc phòng nấm rễ Phytophthora',
                'expiry_date' => '2026-12-31',
                'category' => 'PESTICIDE',
                'reorder_threshold' => 12,
            ],
            'MAT-BVTV-03' => [
                'unit_price' => 145000,
                'supplier_name' => 'Viện Sinh học Nông nghiệp Lâm Đồng',
                'description' => 'Nấm ba màu sinh học Metarhizium phòng sâu tơ rầy mềm (1kg) - Pha nước phun ẩm nhà màng',
                'expiry_date' => '2026-11-20',
                'category' => 'PESTICIDE',
                'reorder_threshold' => 10,
            ],
            'MAT-BVTV-04' => [
                'unit_price' => 380000,
                'supplier_name' => 'Trung tâm Nghiên cứu Thiên địch Sinh học Đà Lạt',
                'description' => 'Bọ xít bắt mồi Orius sauteri thiên địch diệt bọ trĩ (Hộp 500 cá thể) - Thả 1-2 cá thể / m² nhà kính',
                'expiry_date' => '2026-04-15',
                'category' => 'PESTICIDE',
                'reorder_threshold' => 5,
            ],
            'MAT-GIONG-01' => [
                'unit_price' => 900000,
                'supplier_name' => 'Rijk Zwaan Vietnam LLC',
                'description' => 'Hạt giống Ớt chuông Sweet Palermo Đỏ F1 (Gói 1000 hạt) - Độ ngọt Brix 9-11',
                'expiry_date' => '2026-11-01',
                'category' => 'SEED',
                'reorder_threshold' => 5,
            ],
            'MAT-GIONG-02' => [
                'unit_price' => 920000,
                'supplier_name' => 'Rijk Zwaan Vietnam LLC',
                'description' => 'Hạt giống Ớt chuông Sweet Palermo Vàng F1 (Gói 1000 hạt) - Độ ngọt Brix 9-10',
                'expiry_date' => '2026-11-01',
                'category' => 'SEED',
                'reorder_threshold' => 5,
            ],
            'MAT-GIONG-03' => [
                'unit_price' => 950000,
                'supplier_name' => 'Rijk Zwaan Vietnam LLC',
                'description' => 'Hạt giống Ớt chuông Sweet Palermo Cam F1 (Gói 1000 hạt) - Độ ngọt Brix 9-10.5',
                'expiry_date' => '2026-11-01',
                'category' => 'SEED',
                'reorder_threshold' => 5,
            ],
            'MAT-BAOBI-01' => [
                'unit_price' => 14000,
                'supplier_name' => 'Công ty Bao bì Giấy Xuất khẩu Lâm Đồng',
                'description' => 'Thùng carton xuất khẩu 5 lớp có màng thở OCOP (Thùng 5kg) - In chuẩn GS1 & OCOP 4 sao',
                'expiry_date' => '2029-01-01',
                'category' => 'OTHER',
                'reorder_threshold' => 100,
            ],
            'MAT-BAOBI-02' => [
                'unit_price' => 450000,
                'supplier_name' => 'Công ty Bao bì Sinh học Tự phân hủy EcoPackaging',
                'description' => 'Khay bã mía sinh học 2 trái có màng bọc đục lỗ thoáng khí (Thùng 500 khay) - Chuẩn xuất khẩu siêu thị',
                'expiry_date' => '2028-12-31',
                'category' => 'OTHER',
                'reorder_threshold' => 25,
            ],
        ];

        foreach ($materialsConfig as $sku => $cfg) {
            $existing = DB::table('materials')->where('cooperative_id', $coopId)->where('sku', $sku)->first();
            if ($existing) {
                $safety = json_decode($existing->safety_information ?: '[]', true);
                $safety['unit_price'] = $cfg['unit_price'];
                $safety['supplier_name'] = $cfg['supplier_name'];
                $safety['warehouse_name'] = $warehouseName;
                $safety['description'] = $cfg['description'];
                $safety['expiry_date'] = $cfg['expiry_date'];

                DB::table('materials')->where('id', $existing->id)->update([
                    'reorder_threshold' => $cfg['reorder_threshold'],
                    'safety_information' => json_encode($safety),
                    'account_code' => '1521',
                    'is_durable_tool' => false,
                    'updated_at' => $now,
                ]);
            }
        }

        // 4. Khởi tạo 6 Nông cụ chuyên dụng lâu bền (TK 1525 & TK 005)
        $durableTools = [
            [
                'sku' => 'TOOL-KEOTIA-01',
                'name' => 'Kéo tỉa cành định danh chống lây nhiễm virus Saboten Nhật Bản',
                'category' => 'TOOL',
                'unit' => 'cai',
                'unit_price' => 350000,
                'reorder_threshold' => 5,
                'supplier_name' => 'Saboten Industrial Tools Japan (Nhập khẩu chính ngạch)',
                'description' => 'Lưỡi thép carbon phủ Teflon chống dính mủ cây, đánh số laser serial định danh chống lây lan virus cơ học PepMV, ToMV trong nhà màng.',
            ],
            [
                'sku' => 'TOOL-BUTDO-01',
                'name' => 'Bút đo pH/EC/Nhiệt độ điện tử cầm tay Hanna GroLine HI9813-61',
                'category' => 'TOOL',
                'unit' => 'cai',
                'unit_price' => 2850000,
                'reorder_threshold' => 3,
                'supplier_name' => 'Hanna Instruments Vietnam',
                'description' => 'Thiết bị chuyên dụng đo pH và EC dung dịch dinh dưỡng tưới nhỏ giọt bán thủy canh xơ dừa chuẩn VietGAP.',
            ],
            [
                'sku' => 'TOOL-BINHPHUN-01',
                'name' => 'Bình phun điện đeo vai áp lực cao kiểm soát béc sương mịn Oshima 20L',
                'category' => 'TOOL',
                'unit' => 'binh',
                'unit_price' => 1450000,
                'reorder_threshold' => 4,
                'supplier_name' => 'Oshima Japan Machinery Co.',
                'description' => 'Áp suất 0.15 - 0.4 MPa, béc phun sương mịn 4 lỗ kiểm soát liều lượng chế phẩm sinh học phủ đều tán lá.',
            ],
            [
                'sku' => 'TOOL-KHAYUOM-01',
                'name' => 'Khay xốp ươm cây giống chuyên dụng 84 lỗ',
                'category' => 'TOOL',
                'unit' => 'khay',
                'unit_price' => 25000,
                'reorder_threshold' => 50,
                'supplier_name' => 'Công ty Nhựa & Xốp Nông nghiệp Lâm Đồng',
                'description' => 'Khay xốp EPS tỷ trọng cao 84 lỗ thoát nước đáy hình nón chống bó rễ cây giống Ớt chuông F1.',
            ],
            [
                'sku' => 'TOOL-SOTTH-01',
                'name' => 'Sọt nhựa thu hoạch chuyên dụng chuẩn VietGAP vật liệu trơ HDPE 50L',
                'category' => 'TOOL',
                'unit' => 'sot',
                'unit_price' => 120000,
                'reorder_threshold' => 20,
                'supplier_name' => 'Công ty Nhựa Hiệp Thành - CN Đà Lạt',
                'description' => 'Nhựa HDPE nguyên sinh trơ an toàn thực phẩm, nan thông khí chống đọng sương dập cuống ớt.',
            ],
            [
                'sku' => 'TOOL-PPE-01',
                'name' => 'Bộ bảo hộ lao động PPE tiêu chuẩn VietGAP (Mặt nạ than hoạt tính 3M, ủng cao su, kính che mặt)',
                'category' => 'TOOL',
                'unit' => 'bo',
                'unit_price' => 450000,
                'reorder_threshold' => 5,
                'supplier_name' => '3M Vietnam Safety Solutions',
                'description' => 'Trang thiết bị bảo hộ an toàn sinh học đạt chuẩn TCVN 11892-1:2017 cho xã viên làm việc tại nhà kính.',
            ],
        ];

        $toolIds = [];
        foreach ($durableTools as $tool) {
            $existing = DB::table('materials')->where('cooperative_id', $coopId)->where('sku', $tool['sku'])->first();
            $mId = $existing?->id ?? (string) Str::uuid();
            $toolIds[$tool['sku']] = $mId;

            $safetyInfo = [
                'unit_price' => $tool['unit_price'],
                'supplier_name' => $tool['supplier_name'],
                'warehouse_name' => $warehouseName,
                'description' => $tool['description'],
                'is_durable' => true,
            ];

            if ($existing) {
                DB::table('materials')->where('id', $existing->id)->update([
                    'name' => $tool['name'],
                    'category' => 'TOOL',
                    'unit' => $tool['unit'],
                    'account_code' => '1525',
                    'is_durable_tool' => true,
                    'reorder_threshold' => $tool['reorder_threshold'],
                    'safety_information' => json_encode($safetyInfo),
                    'status' => 'ACTIVE',
                    'updated_at' => $now,
                ]);
            } else {
                DB::table('materials')->insert([
                    'id' => $mId,
                    'cooperative_id' => $coopId,
                    'sku' => $tool['sku'],
                    'name' => $tool['name'],
                    'category' => 'TOOL',
                    'unit' => $tool['unit'],
                    'account_code' => '1525',
                    'is_durable_tool' => true,
                    'reorder_threshold' => $tool['reorder_threshold'],
                    'safety_information' => json_encode($safetyInfo),
                    'status' => 'ACTIVE',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // 5. Tạo Phiếu Nhập Kho bổ sung cho các mặt hàng chưa có stock receipt
        $receiptNumber = 'PNK-2026-TOOL-01';
        $receipt = DB::table('stock_receipts')->where('cooperative_id', $coopId)->where('receipt_number', $receiptNumber)->first();
        $receiptId = $receipt?->id ?? (string) Str::uuid();

        if (!$receipt) {
            DB::table('stock_receipts')->insert([
                'id' => $receiptId,
                'cooperative_id' => $coopId,
                'warehouse_id' => $warehouseId,
                'receipt_number' => $receiptNumber,
                'supplier_information' => json_encode([
                    'supplier_name' => 'Tổng kho CCDC Nông nghiệp & Vật tư Đà Lạt',
                    'phone' => '0263.3822999',
                    'address' => 'Số 45 Hùng Vương, TP. Đà Lạt',
                ]),
                'receipt_date' => '2026-01-10',
                'status' => 'APPROVED',
                'total_amount' => 145000000,
                'evidence_reference' => json_encode(['invoice_no' => 'HD-VAT-88910', 'type' => 'ELECTRONIC_INVOICE']),
                'created_by' => $thuKhoId,
                'approved_by' => $giamDocId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Bổ sung stock_receipt_lines cho Nông cụ lâu bền
        $durableLines = [
            ['sku' => 'TOOL-KEOTIA-01', 'qty' => 35, 'price' => 350000, 'batch' => 'BATCH-SABO-2026'],
            ['sku' => 'TOOL-BUTDO-01', 'qty' => 18, 'price' => 2850000, 'batch' => 'BATCH-HANNA-2026'],
            ['sku' => 'TOOL-BINHPHUN-01', 'qty' => 22, 'price' => 1450000, 'batch' => 'BATCH-OSHIMA-2026'],
            ['sku' => 'TOOL-KHAYUOM-01', 'qty' => 400, 'price' => 25000, 'batch' => 'BATCH-KHAY-2026'],
            ['sku' => 'TOOL-SOTTH-01', 'qty' => 150, 'price' => 120000, 'batch' => 'BATCH-SOT-2026'],
            ['sku' => 'TOOL-PPE-01', 'qty' => 25, 'price' => 450000, 'batch' => 'BATCH-PPE-2026'],
        ];

        foreach ($durableLines as $line) {
            $mId = $toolIds[$line['sku']] ?? null;
            if (!$mId) {
                continue;
            }

            $hasLine = DB::table('stock_receipt_lines')->where('material_id', $mId)->exists();
            if (!$hasLine) {
                DB::table('stock_receipt_lines')->insert([
                    'id' => (string) Str::uuid(),
                    'stock_receipt_id' => $receiptId,
                    'material_id' => $mId,
                    'quantity' => $line['qty'],
                    'unit_price' => $line['price'],
                    'batch_code' => $line['batch'],
                    'expiry_date' => null,
                    'line_amount' => $line['qty'] * $line['price'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // Bổ sung stock_receipt_lines cho các vật tư tiêu hao còn lại để có tồn kho > 0
        $consumableLines = [
            ['sku' => 'MAT-PHAN-03', 'qty' => 40, 'price' => 480000, 'batch' => 'BATCH-SEA-2026-01', 'exp' => '2027-08-15'],
            ['sku' => 'MAT-PHAN-04', 'qty' => 60, 'price' => 320000, 'batch' => 'BATCH-BAT-2026-01', 'exp' => '2027-12-30'],
            ['sku' => 'MAT-PHAN-05', 'qty' => 50, 'price' => 890000, 'batch' => 'BATCH-MK-2026-01', 'exp' => '2028-06-20'],
            ['sku' => 'MAT-BVTV-02', 'qty' => 80, 'price' => 120000, 'batch' => 'BATCH-TRI-2026-01', 'exp' => '2026-12-31'],
            ['sku' => 'MAT-BVTV-03', 'qty' => 70, 'price' => 145000, 'batch' => 'BATCH-MET-2026-01', 'exp' => '2026-11-20'],
            ['sku' => 'MAT-BVTV-04', 'qty' => 30, 'price' => 380000, 'batch' => 'BATCH-ORI-2026-01', 'exp' => '2026-04-15'],
            ['sku' => 'MAT-GIONG-02', 'qty' => 20, 'price' => 920000, 'batch' => 'BATCH-GY-2026-01', 'exp' => '2026-11-01'],
            ['sku' => 'MAT-GIONG-03', 'qty' => 20, 'price' => 950000, 'batch' => 'BATCH-GO-2026-01', 'exp' => '2026-11-01'],
            ['sku' => 'MAT-BAOBI-02', 'qty' => 100, 'price' => 450000, 'batch' => 'BATCH-BM-2026-01', 'exp' => '2028-12-31'],
        ];

        $receipt2Number = 'PNK-2026-SUPPLY-02';
        $receipt2 = DB::table('stock_receipts')->where('cooperative_id', $coopId)->where('receipt_number', $receipt2Number)->first();
        $receipt2Id = $receipt2?->id ?? (string) Str::uuid();

        if (!$receipt2) {
            DB::table('stock_receipts')->insert([
                'id' => $receipt2Id,
                'cooperative_id' => $coopId,
                'warehouse_id' => $warehouseId,
                'receipt_number' => $receipt2Number,
                'supplier_information' => json_encode([
                    'supplier_name' => 'Trung Tâm Cung Ứng Vật Tư Sinh Học Đà Lạt',
                    'phone' => '0263.3855666',
                    'address' => 'Khu Công nghệ Nông nghiệp Đà Lạt',
                ]),
                'receipt_date' => '2026-01-15',
                'status' => 'APPROVED',
                'total_amount' => 189500000,
                'evidence_reference' => json_encode(['invoice_no' => 'HD-VAT-89012', 'type' => 'ELECTRONIC_INVOICE']),
                'created_by' => $thuKhoId,
                'approved_by' => $giamDocId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        foreach ($consumableLines as $line) {
            $mat = DB::table('materials')->where('cooperative_id', $coopId)->where('sku', $line['sku'])->first();
            if (!$mat) {
                continue;
            }

            $hasLine = DB::table('stock_receipt_lines')->where('material_id', $mat->id)->exists();
            if (!$hasLine) {
                $lineId = (string) Str::uuid();
                DB::table('stock_receipt_lines')->insert([
                    'id' => $lineId,
                    'stock_receipt_id' => $receipt2Id,
                    'material_id' => $mat->id,
                    'quantity' => $line['qty'],
                    'unit_price' => $line['price'],
                    'batch_code' => $line['batch'],
                    'expiry_date' => $line['exp'],
                    'line_amount' => $line['qty'] * $line['price'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                // Tạo Lô hàng FEFO
                DB::table('material_batches')->insert([
                    'id' => (string) Str::uuid(),
                    'cooperative_id' => $coopId,
                    'material_id' => $mat->id,
                    'stock_receipt_line_id' => $lineId,
                    'batch_number' => $line['batch'],
                    'quantity' => $line['qty'],
                    'initial_quantity' => $line['qty'],
                    'manufactured_at' => '2026-01-05',
                    'expired_at' => $line['exp'],
                    'status' => (strtotime($line['exp']) - time() <= 30 * 86400) ? 'NEAR_EXPIRY' : 'ACTIVE',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // 6. Tạo dữ liệu Cấp phát Nông cụ theo dõi TK 005 (member_tool_trackings)
        // Lấy danh sách thành viên thực tế
        $members = DB::table('members')->where('cooperative_id', $coopId)->get()->keyBy('member_code');
        // Lấy danh sách thửa đất thực tế
        $plots = DB::table('farm_plots')->get()->keyBy('plot_code');

        $toolAssignments = [
            // Xã viên TV001 - Nguyễn Văn A (Nhà màng PLOT-TT-XV004-01)
            [
                'member_code' => 'TV001',
                'plot_code' => 'PLOT-TT-XV004-01',
                'tool_sku' => 'TOOL-KEOTIA-01',
                'serial' => 'SN-SABOTEN-2026-001',
                'qty' => 1,
                'status' => 'IN_USE',
                'assigned_date' => '2026-01-12',
                'note' => 'Giao kèm phụ kiện đá mài mịn và dầu tra lưỡi chống gỉ',
            ],
            [
                'member_code' => 'TV001',
                'plot_code' => 'PLOT-TT-XV004-01',
                'tool_sku' => 'TOOL-BUTDO-01',
                'serial' => 'SN-HANNA-EC-001',
                'qty' => 1,
                'status' => 'IN_USE',
                'assigned_date' => '2026-01-12',
                'note' => 'Đã hiệu chuẩn dung dịch chuẩn pH 7.01 và EC 1413 µS/cm trước khi bàn giao',
            ],
            [
                'member_code' => 'TV001',
                'plot_code' => 'PLOT-TT-XV004-01',
                'tool_sku' => 'TOOL-BINHPHUN-01',
                'serial' => 'SN-OSHIMA-20L-001',
                'qty' => 1,
                'status' => 'IN_USE',
                'assigned_date' => '2026-01-12',
                'note' => 'Kèm bộ sạc pin lithium 12V và 2 béc phun dự phòng',
            ],
            [
                'member_code' => 'TV001',
                'plot_code' => 'PLOT-TT-XV004-01',
                'tool_sku' => 'TOOL-PPE-01',
                'serial' => 'SN-PPE-3M-001',
                'qty' => 1,
                'status' => 'IN_USE',
                'assigned_date' => '2026-01-12',
                'note' => 'Bộ mặt nạ 3M 6200 kèm phin lọc hữu cơ 6001, ủng chống trượt',
            ],

            // Xã viên TV002 - Trần Thị B (Nhà màng PLOT-TT-XV005-01)
            [
                'member_code' => 'TV002',
                'plot_code' => 'PLOT-TT-XV005-01',
                'tool_sku' => 'TOOL-KEOTIA-01',
                'serial' => 'SN-SABOTEN-2026-002',
                'qty' => 1,
                'status' => 'IN_USE',
                'assigned_date' => '2026-01-14',
                'note' => 'Bàn giao kéo tỉa nhánh phụ cây Ớt chuông Sweet Palermo',
            ],
            [
                'member_code' => 'TV002',
                'plot_code' => 'PLOT-TT-XV005-01',
                'tool_sku' => 'TOOL-PPE-01',
                'serial' => 'SN-PPE-3M-002',
                'qty' => 1,
                'status' => 'IN_USE',
                'assigned_date' => '2026-01-14',
                'note' => 'Bảo hộ lao động phun phòng chế phẩm sinh học',
            ],

            // Xã viên TV003 - Lê Văn C (Đang bảo dưỡng mài lưỡi khử trùng)
            [
                'member_code' => 'TV003',
                'plot_code' => 'PLOT-TT-XV007-01',
                'tool_sku' => 'TOOL-KEOTIA-01',
                'serial' => 'SN-SABOTEN-2026-003',
                'qty' => 1,
                'status' => 'MAINTENANCE',
                'assigned_date' => '2026-01-15',
                'note' => 'Đang mài lưỡi, tra mỡ lò xo và khử trùng nhiệt chống virus ToMV tại xưởng HTX',
            ],

            // Xã viên TV004 - Phạm Thị D (Đã đổi mới 1:1 do mẻ lưỡi cắt gốc già)
            [
                'member_code' => 'TV004',
                'plot_code' => 'PLOT-TT-XV004-01',
                'tool_sku' => 'TOOL-KEOTIA-01',
                'serial' => 'SN-SABOTEN-REPLACE-004',
                'qty' => 1,
                'status' => 'REPLACED',
                'assigned_date' => '2026-02-01',
                'note' => 'Đã đổi mới 1:1 theo biên bản thu hồi xác cũ mẻ lưỡi. Xác cũ đã lưu kho thanh lý.',
            ],
            [
                'member_code' => 'TV004',
                'plot_code' => 'PLOT-TT-XV004-01',
                'tool_sku' => 'TOOL-BINHPHUN-01',
                'serial' => 'SN-OSHIMA-20L-002',
                'qty' => 1,
                'status' => 'IN_USE',
                'assigned_date' => '2026-01-15',
                'note' => 'Áp suất phun chuẩn béc sương mịn',
            ],

            // Xã viên TV005 - Hoàng Văn E (Hỏng đã thu hồi xác về kho)
            [
                'member_code' => 'TV005',
                'plot_code' => 'PLOT-TT-XV005-01',
                'tool_sku' => 'TOOL-KEOTIA-01',
                'serial' => 'SN-SABOTEN-2026-005',
                'qty' => 1,
                'status' => 'DAMAGED_RETURNED',
                'assigned_date' => '2026-01-10',
                'note' => 'Lưỡi gãy do bấm nhầm cọc thép nhà màng. Đã thu hồi xác hỏng về kho lập biên bản.',
            ],

            // Xã viên TV006 - Đặng Thị Mai (Bút đo pH/EC khu nhà màng 14)
            [
                'member_code' => 'TV006',
                'plot_code' => 'PLOT-TT-XV014-01',
                'tool_sku' => 'TOOL-BUTDO-01',
                'serial' => 'SN-HANNA-EC-002',
                'qty' => 1,
                'status' => 'IN_USE',
                'assigned_date' => '2026-01-18',
                'note' => 'Bàn giao phục vụ kiểm tra dinh dưỡng phân bón hòa tan hàng ngày',
            ],

            // Xã viên TV007 - Vũ Đình Trọng (Bút đo đang hiệu chuẩn định kỳ)
            [
                'member_code' => 'TV007',
                'plot_code' => 'PLOT-TT-XV007-01',
                'tool_sku' => 'TOOL-BUTDO-01',
                'serial' => 'SN-HANNA-EC-003',
                'qty' => 1,
                'status' => 'MAINTENANCE',
                'assigned_date' => '2026-01-20',
                'note' => 'Đang ngâm dung dịch bảo quản điện cực HI70300L và hiệu chuẩn lại sai số EC',
            ],

            // Xã viên TV011 - Đỗ Quốc Tuấn (Bình phun điện)
            [
                'member_code' => 'TV011',
                'plot_code' => 'PLOT-TT-XV015-01',
                'tool_sku' => 'TOOL-BINHPHUN-01',
                'serial' => 'SN-OSHIMA-20L-003',
                'qty' => 1,
                'status' => 'IN_USE',
                'assigned_date' => '2026-01-22',
                'note' => 'Cấp phát phục vụ phun nấm ba màu Metarhizium',
            ],
        ];

        // Xóa các bản ghi cũ của cooperative_id nếu có để nạp mới chuẩn xác
        DB::table('member_tool_trackings')->where('cooperative_id', $coopId)->delete();

        foreach ($toolAssignments as $assign) {
            $member = $members[$assign['member_code']] ?? null;
            $plot = $plots[$assign['plot_code']] ?? $plots->first();
            $matId = $toolIds[$assign['tool_sku']] ?? null;

            if (!$member || !$matId) {
                continue;
            }

            DB::table('member_tool_trackings')->insert([
                'id' => (string) Str::uuid(),
                'cooperative_id' => $coopId,
                'member_id' => $member->id,
                'farm_plot_id' => $plot?->id,
                'material_id' => $matId,
                'serial_number' => $assign['serial'],
                'quantity' => $assign['qty'],
                'status' => $assign['status'],
                'assigned_date' => $assign['assigned_date'],
                'returned_date' => in_array($assign['status'], ['DAMAGED_RETURNED', 'LOST'], true) ? '2026-02-15' : null,
                'note' => $assign['note'],
                'created_by' => $thuKhoId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 7. Tạo Phiếu Kiểm kê kho định kỳ quý I/2026 (stock_counts & stock_count_lines)
        $countNumber = 'KK-2026-Q1';
        $stockCount = DB::table('stock_counts')->where('cooperative_id', $coopId)->where('count_number', $countNumber)->first();
        $stockCountId = $stockCount?->id ?? (string) Str::uuid();

        if (!$stockCount) {
            DB::table('stock_counts')->insert([
                'id' => $stockCountId,
                'cooperative_id' => $coopId,
                'count_number' => $countNumber,
                'count_date' => '2026-03-31',
                'scope' => json_encode(['warehouse_id' => $warehouseId, 'categories' => ['FERTILIZER', 'PESTICIDE', 'TOOL']]),
                'status' => 'COMPLETED',
                'reason' => 'Kiểm kê định kỳ cuối quý I/2026 đối soát tồn thực tế với thẻ kho Mẫu 02-VT theo Thông tư 71/2024/TT-BTC',
                'created_by' => $thuKhoId,
                'approved_by' => $giamDocId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // Thêm các dòng kiểm kê thực tế
            $countLinesData = [
                ['sku' => 'MAT-PHAN-01', 'expected' => 85, 'actual' => 85, 'diff' => 0, 'reason' => 'Khớp đúng thẻ kho'],
                ['sku' => 'MAT-BVTV-01', 'expected' => 50, 'actual' => 50, 'diff' => 0, 'reason' => 'Khớp đúng thẻ kho'],
                ['sku' => 'TOOL-KEOTIA-01', 'expected' => 35, 'actual' => 35, 'diff' => 0, 'reason' => 'Đã đối soát 5 chiếc giao xã viên theo dõi TK 005'],
                ['sku' => 'TOOL-BUTDO-01', 'expected' => 18, 'actual' => 18, 'diff' => 0, 'reason' => 'Đã đối soát 3 chiếc giao xã viên theo dõi TK 005'],
                ['sku' => 'TOOL-BINHPHUN-01', 'expected' => 22, 'actual' => 22, 'diff' => 0, 'reason' => 'Đã đối soát 3 chiếc giao xã viên theo dõi TK 005'],
                ['sku' => 'MAT-BAOBI-01', 'expected' => 2000, 'actual' => 1995, 'diff' => -5, 'reason' => 'Hao hụt rách 5 thùng trong quá trình bốc dỡ xếp kho'],
            ];

            foreach ($countLinesData as $cd) {
                $mat = DB::table('materials')->where('cooperative_id', $coopId)->where('sku', $cd['sku'])->first();
                if (!$mat) {
                    continue;
                }

                DB::table('stock_count_lines')->insert([
                    'id' => (string) Str::uuid(),
                    'stock_count_id' => $stockCountId,
                    'material_id' => $mat->id,
                    'expected_quantity' => $cd['expected'],
                    'actual_quantity' => $cd['actual'],
                    'difference' => $cd['diff'],
                    'reason' => $cd['reason'],
                ]);
            }
        }

        $this->command->info('DurableToolAndInventorySeeder hoàn tất thành công! Đã nạp danh mục Nông cụ TK 1525, Cấp phát TK 005 và Kiểm kê kho.');
    }
}
