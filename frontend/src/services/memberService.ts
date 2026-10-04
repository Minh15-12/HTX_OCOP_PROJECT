import { Member, CapitalTransaction, SurplusDistributionPlan, SurplusDistributionItem } from '@/types/memberTypes';
import { apiClient } from './apiClient';
import {
  getStoredMembers,
  saveMembersToStorage,
  addMemberToStorage,
  updateMemberInStorage,
  deduplicateMembers,
  getStoredCapitalTransactions,
  saveCapitalTransactionsToStorage,
} from './dbStorage';
import { numberToVietnameseWords } from '@/utils/formatters';

export const mockMembersList: Member[] = [
  {
    id: 'mem-001',
    cooperative_id: 'coop-01',
    member_code: 'TV001',
    full_name: 'Nguyễn Văn A',
    gender: 'Nam',
    dob: '1985-04-12',
    cccd: '049085001234',
    cccd_issue_date: '2021-05-10',
    cccd_issue_place: 'Cục Cảnh sát QLHC về trật tự xã hội',
    education_level: 'Đại học',
    occupation: 'Kỹ sư Nông nghiệp',
    province: 'Lâm Đồng',
    district: 'Huyện Lâm Hà',
    ward: 'Xã Mê Linh',
    detail_address: 'Thôn 2',
    address: 'Thôn 2, Xã Mê Linh, Huyện Lâm Hà, Lâm Đồng',
    phone: '0987654321',
    email: 'nguyenvana@htx.vn',
    zalo: '0987654321',
    facebook: 'facebook.com/nguyenvana',
    capital_form: 'TIEN_MAT',
    contribution_date: '2024-01-10',
    contribution_method: 'Góp một lần',
    member_type: 'CHINH_THUC',
    committed_capital: 30000000,
    contributed_capital: 30000000,
    remaining_capital: 0,
    total_capital_contributed: 30000000,
    capital_in_words: 'Ba mươi triệu đồng',
    total_shares_held: 300,
    ownership_percentage: 2.85,
    capital_status: 'DU_VON',
    profit_share_rate: 2.85,
    payout_method: 'BANK_TRANSFER',
    bank_account: '1234567890',
    bank_name: 'Ngân hàng TMCP Ngoại thương Việt Nam (VCB)',
    account_holder: 'Nguyễn Văn A',
    notes: 'Xã viên luôn chấp hành tốt nghĩa vụ góp vốn, tích cực tham gia hoạt động HTX.',
    status: 'ACTIVE',
    join_date: '2024-01-10',
    current_debt: 0,
    annual_product_output_kg: 12500,
  },
  {
    id: 'mem-002',
    cooperative_id: 'coop-01',
    member_code: 'TV002',
    full_name: 'Trần Thị B',
    gender: 'Nữ',
    dob: '1990-08-20',
    cccd: '049190005678',
    cccd_issue_date: '2020-11-15',
    cccd_issue_place: 'Cục Cảnh sát QLHC về trật tự xã hội',
    education_level: 'Cao đẳng',
    occupation: 'Nông dân sản xuất giỏi',
    province: 'Lâm Đồng',
    district: 'Huyện Lâm Hà',
    ward: 'Xã Tân Hà',
    detail_address: 'Thôn 1',
    address: 'Thôn 1, Xã Tân Hà, Huyện Lâm Hà, Lâm Đồng',
    phone: '0976543210',
    email: 'tranthib@htx.vn',
    zalo: '0976543210',
    facebook: '',
    capital_form: 'TIEN_MAT',
    contribution_date: '2024-02-15',
    contribution_method: 'Theo đợt',
    member_type: 'CHINH_THUC',
    committed_capital: 50000000,
    contributed_capital: 40000000,
    remaining_capital: 10000000,
    total_capital_contributed: 40000000,
    capital_in_words: 'Năm mươi triệu đồng',
    total_shares_held: 400,
    ownership_percentage: 3.80,
    capital_status: 'CHUA_DU',
    profit_share_rate: 3.80,
    payout_method: 'CASH',
    bank_account: '9876543210',
    bank_name: 'Agribank - CN Lâm Hà',
    account_holder: 'Trần Thị B',
    notes: 'Đã góp 2 đợt, đợt cuối cam kết góp trước 30/09/2026.',
    status: 'ACTIVE',
    join_date: '2024-02-15',
    current_debt: 0,
    annual_product_output_kg: 9800,
  },
  {
    id: 'mem-003',
    cooperative_id: 'coop-01',
    member_code: 'TV003',
    full_name: 'Lê Văn C',
    gender: 'Nam',
    dob: '1982-11-05',
    cccd: '049082009988',
    cccd_issue_date: '2021-02-18',
    cccd_issue_place: 'Cục Cảnh sát QLHC về trật tự xã hội',
    education_level: 'THPT',
    occupation: 'Trồng trọt & Chăn nuôi',
    province: 'Lâm Đồng',
    district: 'Huyện Lâm Hà',
    ward: 'Xã Đinh Văn',
    detail_address: 'Thôn 4',
    address: 'Thôn 4, Xã Đinh Văn, Huyện Lâm Hà, Lâm Đồng',
    phone: '0912345678',
    email: 'levanc@htx.vn',
    zalo: '0912345678',
    facebook: '',
    capital_form: 'HIEN_VAT',
    contribution_date: '2024-03-20',
    contribution_method: 'Góp một lần',
    member_type: 'CHINH_THUC',
    committed_capital: 20000000,
    contributed_capital: 20000000,
    remaining_capital: 0,
    total_capital_contributed: 20000000,
    capital_in_words: 'Hai mươi triệu đồng',
    total_shares_held: 200,
    ownership_percentage: 1.90,
    capital_status: 'DU_VON',
    profit_share_rate: 1.90,
    payout_method: 'BANK_TRANSFER',
    bank_account: '5544332211',
    bank_name: 'BIDV - CN Lâm Đồng',
    account_holder: 'Lê Văn C',
    notes: 'Góp vốn bằng thiết bị máy cày phục vụ vùng trồng.',
    status: 'ACTIVE',
    join_date: '2024-03-20',
    current_debt: 0,
    annual_product_output_kg: 6200,
  },
  {
    id: 'mem-004',
    cooperative_id: 'coop-01',
    member_code: 'TV004',
    full_name: 'Phạm Thị D',
    gender: 'Nữ',
    dob: '1995-02-14',
    cccd: '049195003344',
    cccd_issue_date: '2022-09-01',
    cccd_issue_place: 'Cục Cảnh sát QLHC về trật tự xã hội',
    education_level: 'Đại học',
    occupation: 'Kinh doanh Nông sản',
    province: 'Lâm Đồng',
    district: 'Huyện Lâm Hà',
    ward: 'Xã Liên Hà',
    detail_address: 'Thôn 3',
    address: 'Thôn 3, Xã Liên Hà, Huyện Lâm Hà, Lâm Đồng',
    phone: '0933445566',
    email: 'phamthid@htx.vn',
    zalo: '0933445566',
    facebook: '',
    capital_form: 'TIEN_MAT',
    contribution_date: '2024-04-05',
    contribution_method: 'Theo đợt',
    member_type: 'LIEN_KET_GOP_VON',
    committed_capital: 40000000,
    contributed_capital: 25000000,
    remaining_capital: 15000000,
    total_capital_contributed: 25000000,
    capital_in_words: 'Bốn mươi triệu đồng',
    total_shares_held: 250,
    ownership_percentage: 2.38,
    capital_status: 'CHUA_DU',
    profit_share_rate: 2.38,
    payout_method: 'BANK_TRANSFER',
    bank_account: '1122334455',
    bank_name: 'MBBank - CN Lâm Hà',
    account_holder: 'Phạm Thị D',
    notes: 'Thành viên liên kết góp vốn hợp tác tiêu thụ cà phê.',
    status: 'ACTIVE',
    join_date: '2024-04-05',
    current_debt: 0,
    annual_product_output_kg: 8500,
  },
  {
    id: 'mem-005',
    cooperative_id: 'coop-01',
    member_code: 'TV005',
    full_name: 'Hoàng Văn E',
    gender: 'Nam',
    dob: '1988-07-30',
    cccd: '049088007766',
    cccd_issue_date: '2021-08-12',
    cccd_issue_place: 'Cục Cảnh sát QLHC về trật tự xã hội',
    education_level: 'Đại học',
    occupation: 'Chủ trang trại',
    province: 'Lâm Đồng',
    district: 'Huyện Lâm Hà',
    ward: 'Xã Mê Linh',
    detail_address: 'Thôn 1',
    address: 'Thôn 1, Xã Mê Linh, Huyện Lâm Hà, Lâm Đồng',
    phone: '0944556677',
    email: 'hoangvane@htx.vn',
    zalo: '0944556677',
    facebook: '',
    capital_form: 'TIEN_MAT',
    contribution_date: '2024-05-12',
    contribution_method: 'Góp một lần',
    member_type: 'CHINH_THUC',
    committed_capital: 30000000,
    contributed_capital: 30000000,
    remaining_capital: 0,
    total_capital_contributed: 30000000,
    capital_in_words: 'Ba mươi triệu đồng',
    total_shares_held: 300,
    ownership_percentage: 2.85,
    capital_status: 'DU_VON',
    profit_share_rate: 2.85,
    payout_method: 'BANK_TRANSFER',
    bank_account: '7788990011',
    bank_name: 'VietinBank - CN Lâm Đồng',
    account_holder: 'Hoàng Văn E',
    notes: 'Đã hoàn thành góp vốn 100%.',
    status: 'ACTIVE',
    join_date: '2024-05-12',
    current_debt: 0,
    annual_product_output_kg: 11000,
  },
  {
    id: 'mem-006',
    cooperative_id: 'coop-01',
    member_code: 'TV006',
    full_name: 'Đỗ Thị F',
    gender: 'Nữ',
    dob: '1992-03-25',
    cccd: '049192004455',
    cccd_issue_date: '2022-04-10',
    cccd_issue_place: 'Cục Cảnh sát QLHC về trật tự xã hội',
    education_level: 'Cao đẳng',
    occupation: 'Kinh doanh dịch vụ vật tư',
    province: 'Lâm Đồng',
    district: 'Huyện Lâm Hà',
    ward: 'Xã Đinh Văn',
    detail_address: 'Thôn 2',
    address: 'Thôn 2, Xã Đinh Văn, Huyện Lâm Hà, Lâm Đồng',
    phone: '0955667788',
    email: 'dothif@htx.vn',
    zalo: '0955667788',
    facebook: '',
    capital_form: 'TIEN_MAT',
    contribution_date: '2024-06-01',
    contribution_method: 'Góp một lần',
    member_type: 'LIEN_KET_KHONG_GOP_VON',
    committed_capital: 15000000,
    contributed_capital: 15000000,
    remaining_capital: 0,
    total_capital_contributed: 15000000,
    capital_in_words: 'Mười lăm triệu đồng',
    total_shares_held: 150,
    ownership_percentage: 1.43,
    capital_status: 'DU_VON',
    profit_share_rate: 1.43,
    payout_method: 'CASH',
    bank_account: '',
    bank_name: '',
    account_holder: '',
    notes: 'Thành viên liên kết không góp vốn điều lệ.',
    status: 'ACTIVE',
    join_date: '2024-06-01',
    current_debt: 0,
    annual_product_output_kg: 4200,
  },
  {
    id: 'mem-007',
    cooperative_id: 'coop-01',
    member_code: 'TV007',
    full_name: 'Nguyễn Thành Minh',
    gender: 'Nam',
    dob: '1992-06-15',
    cccd: '049092008899',
    cccd_issue_date: '2021-01-10',
    cccd_issue_place: 'Cục Cảnh sát QLHC về trật tự xã hội',
    education_level: 'Chưa xác định',
    occupation: 'Trồng cà phê',
    province: 'Lâm Đồng',
    district: 'Huyện Lâm Hà',
    ward: 'Xã Mê Linh',
    detail_address: 'Thôn 3',
    address: 'Thôn 3, Xã Mê Linh, Huyện Lâm Hà, Lâm Đồng',
    phone: '03732937532',
    email: 'thanhminh@gmail.com',
    zalo: '03732937532',
    facebook: '',
    capital_form: 'TIEN_MAT',
    contribution_date: '2026-09-08',
    contribution_method: 'Góp một lần',
    member_type: 'CHINH_THUC',
    committed_capital: 50000000,
    contributed_capital: 10000000,
    remaining_capital: 40000000,
    total_capital_contributed: 10000000,
    capital_in_words: 'Năm mươi triệu đồng',
    total_shares_held: 100,
    ownership_percentage: 0.95,
    capital_status: 'CHUA_DU',
    profit_share_rate: 2.50,
    payout_method: 'CASH',
    bank_account: '',
    bank_name: '',
    account_holder: '',
    notes: 'Hồ sơ đăng ký mới thông qua Form Thêm xã viên 5 bước. Cần Chủ tịch duyệt.',
    status: 'PENDING',
    join_date: '2026-09-08',
    current_debt: 0,
    annual_product_output_kg: 5000,
  },
  {
    id: 'mem-008',
    cooperative_id: 'coop-01',
    member_code: 'TV008',
    full_name: 'Võ Văn G',
    gender: 'Nam',
    dob: '1987-10-18',
    cccd: '049087001122',
    cccd_issue_date: '2020-05-20',
    cccd_issue_place: 'Cục Cảnh sát QLHC về trật tự xã hội',
    education_level: 'THPT',
    occupation: 'Chăn nuôi bò sữa',
    province: 'Lâm Đồng',
    district: 'Huyện Lâm Hà',
    ward: 'Xã Tân Hà',
    detail_address: 'Thôn 2',
    address: 'Thôn 2, Xã Tân Hà, Huyện Lâm Hà, Lâm Đồng',
    phone: '0966778899',
    email: 'vovang@htx.vn',
    zalo: '0966778899',
    facebook: '',
    capital_form: 'TIEN_MAT',
    contribution_date: '2026-09-09',
    contribution_method: 'Theo đợt',
    member_type: 'LIEN_KET_GOP_VON',
    committed_capital: 20000000,
    contributed_capital: 10000000,
    remaining_capital: 10000000,
    total_capital_contributed: 10000000,
    capital_in_words: 'Hai mươi triệu đồng',
    total_shares_held: 100,
    ownership_percentage: 0.95,
    capital_status: 'CHUA_DU',
    profit_share_rate: 1.50,
    payout_method: 'BANK_TRANSFER',
    bank_account: '9988776655',
    bank_name: 'Agribank - CN Lâm Hà',
    account_holder: 'Võ Văn G',
    notes: 'Đăng ký tham gia thành viên liên kết góp vốn. Chờ HĐQT xét duyệt.',
    status: 'PENDING',
    join_date: '2026-09-09',
    current_debt: 0,
    annual_product_output_kg: 7500,
  },
  {
    id: 'mem-009',
    cooperative_id: 'coop-01',
    member_code: 'TV009',
    full_name: 'Bùi Văn Nợ',
    gender: 'Nam',
    dob: '1980-05-15',
    cccd: '049080009911',
    cccd_issue_date: '2021-03-12',
    cccd_issue_place: 'Cục Cảnh sát QLHC về trật tự xã hội',
    education_level: 'THPT',
    occupation: 'Trồng rau OCOP',
    province: 'Lâm Đồng',
    district: 'Huyện Lâm Hà',
    ward: 'Xã Đinh Văn',
    detail_address: 'Thôn 5',
    address: 'Thôn 5, Xã Đinh Văn, Huyện Lâm Hà, Lâm Đồng',
    phone: '0911223344',
    email: 'buivanno@htx.vn',
    zalo: '0911223344',
    facebook: '',
    capital_form: 'TIEN_MAT',
    contribution_date: '2024-02-10',
    contribution_method: 'Góp một lần',
    member_type: 'CHINH_THUC',
    committed_capital: 20000000,
    contributed_capital: 20000000,
    remaining_capital: 0,
    total_capital_contributed: 20000000,
    capital_in_words: 'Hai mươi triệu đồng',
    total_shares_held: 200,
    ownership_percentage: 1.90,
    capital_status: 'DU_VON',
    profit_share_rate: 1.90,
    payout_method: 'BANK_TRANSFER',
    bank_account: '9900112233',
    bank_name: 'Agribank - CN Lâm Hà',
    account_holder: 'Bùi Văn Nợ',
    notes: '⚠️ DƯ NỢ CÔNG NỢ: Nợ tiền phân bón & vật tư nông nghiệp vụ 2025-2026 chưa hoàn trả (15.500.000 ₫).',
    status: 'ACTIVE',
    join_date: '2024-02-10',
    current_debt: 15500000,
    annual_product_output_kg: 8000,
  },
  {
    id: 'mem-010',
    cooperative_id: 'coop-01',
    member_code: 'TV010',
    full_name: 'Nguyễn Hoàng Nam',
    gender: 'Nam',
    dob: '1988-11-20',
    cccd: '049088001199',
    cccd_issue_date: '2020-07-15',
    cccd_issue_place: 'Cục Cảnh sát QLHC về trật tự xã hội',
    education_level: 'Đại học',
    occupation: 'Trồng cà phê xuất khẩu',
    province: 'Lâm Đồng',
    district: 'Huyện Lâm Hà',
    ward: 'Xã Mê Linh',
    detail_address: 'Thôn 4',
    address: 'Thôn 4, Xã Mê Linh, Huyện Lâm Hà, Lâm Đồng',
    phone: '0988112233',
    email: 'hoangnam@htx.vn',
    zalo: '0988112233',
    facebook: '',
    capital_form: 'TIEN_MAT',
    contribution_date: '2024-03-01',
    contribution_method: 'Góp một lần',
    member_type: 'CHINH_THUC',
    committed_capital: 35000000,
    contributed_capital: 35000000,
    remaining_capital: 0,
    total_capital_contributed: 35000000,
    capital_in_words: 'Ba mươi lăm triệu đồng',
    total_shares_held: 350,
    ownership_percentage: 3.33,
    capital_status: 'DU_VON',
    profit_share_rate: 3.33,
    payout_method: 'BANK_TRANSFER',
    bank_account: '8877665544',
    bank_name: 'Vietcombank - CN Lâm Đồng',
    account_holder: 'Nguyễn Hoàng Nam',
    notes: '⚠️ DƯ NỢ CÔNG NỢ: Nợ ứng trước tiền thu mua cà phê chưa bù trừ hết (28.000.000 ₫).',
    status: 'ACTIVE',
    join_date: '2024-03-01',
    current_debt: 28000000,
    annual_product_output_kg: 14000,
  },
];

export const mockCapitalTransactions: CapitalTransaction[] = [
  {
    id: 'CC-001',
    member_id: 'mem-001',
    member_code: 'TV001',
    member_name: 'Nguyễn Văn A',
    transaction_code: 'PT000125',
    amount: 10000000,
    share_quantity: 100,
    contribution_date: '15/05/2025',
    payment_method: 'CASH',
    receipt_number: 'PT000125',
    content: 'Góp vốn lần 3',
    notes: 'Xã viên nộp tiền mặt tại văn phòng HTX',
    status: 'APPROVED',
    recorded_by: 'Nguyễn Văn A (Kế toán)',
    recorded_date: '15/05/2025',
  },
  {
    id: 'CC-002',
    member_id: 'mem-001',
    member_code: 'TV001',
    member_name: 'Nguyễn Văn A',
    transaction_code: 'UNC00067',
    amount: 10000000,
    share_quantity: 100,
    contribution_date: '15/02/2025',
    payment_method: 'BANK_TRANSFER',
    receipt_number: 'UNC00067',
    content: 'Góp vốn đợt 2 qua VCB',
    notes: 'Chuyển khoản thành công',
    status: 'APPROVED',
    recorded_by: 'Nguyễn Văn A (Kế toán)',
    recorded_date: '15/02/2025',
  },
  {
    id: 'CC-003',
    member_id: 'mem-001',
    member_code: 'TV001',
    member_name: 'Nguyễn Văn A',
    transaction_code: 'PT00001',
    amount: 10000000,
    share_quantity: 100,
    contribution_date: '10/01/2024',
    payment_method: 'CASH',
    receipt_number: 'PT00001',
    content: 'Góp vốn thành lập HTX lần 1',
    notes: 'Tiền mặt nhập quỹ',
    status: 'APPROVED',
    recorded_by: 'Nguyễn Văn A (Kế toán)',
    recorded_date: '10/01/2024',
  },
  {
    id: 'CC-004',
    member_id: 'mem-002',
    member_code: 'TV002',
    member_name: 'Trần Thị B',
    transaction_code: 'UNC00099',
    amount: 10000000,
    share_quantity: 100,
    contribution_date: '10/09/2026',
    payment_method: 'BANK_TRANSFER',
    receipt_number: 'UNC00099',
    content: 'Chuyển khoản nộp bổ sung vốn đợt 3 qua VCB',
    notes: 'Kế toán chưa đối soát sao kê ngân hàng',
    status: 'PENDING',
    recorded_by: 'Trần Thị B',
    recorded_date: '10/09/2026',
    receipt_file_name: 'unc_vcb_10M.png',
  },
  {
    id: 'CC-005',
    member_id: 'mem-004',
    member_code: 'TV004',
    member_name: 'Phạm Thị D',
    transaction_code: 'PT000128',
    amount: 15000000,
    share_quantity: 150,
    contribution_date: '09/09/2026',
    payment_method: 'CASH',
    receipt_number: 'PT000128',
    content: 'Nộp tiền mặt bổ sung vốn đợt 2',
    notes: 'Đã nộp tiền tại thủ quỹ, chờ xác nhận quỹ',
    status: 'PENDING',
    recorded_by: 'Phạm Thị D',
    recorded_date: '09/09/2026',
    receipt_file_name: 'phieu_thu_128.pdf',
  },
  {
    id: 'CC-006',
    member_id: 'mem-008',
    member_code: 'TV008',
    member_name: 'Võ Văn G',
    transaction_code: 'UNC00102',
    amount: 10000000,
    share_quantity: 100,
    contribution_date: '09/09/2026',
    payment_method: 'BANK_TRANSFER',
    receipt_number: 'UNC00102',
    content: 'Góp vốn liên kết qua Agribank Lâm Hà',
    notes: 'Chờ HĐQT phê duyệt thành viên & vốn',
    status: 'PENDING',
    recorded_by: 'Võ Văn G',
    recorded_date: '09/09/2026',
    receipt_file_name: 'agribank_unc.png',
  },
  {
    id: 'CC-007',
    member_id: 'mem-007',
    member_code: 'TV007',
    member_name: 'Nguyễn Thành Minh',
    transaction_code: 'PT000130',
    amount: 10000000,
    share_quantity: 100,
    contribution_date: '08/09/2026',
    payment_method: 'CASH',
    receipt_number: 'PT000130',
    content: 'Góp vốn điều lệ ban đầu',
    notes: 'Đính kèm hồ sơ đăng ký thành viên mới 5 bước',
    status: 'PENDING',
    recorded_by: 'Nguyễn Thành Minh',
    recorded_date: '08/09/2026',
    receipt_file_name: 'bien_lai_gop_von_130.pdf',
  },
  {
    id: 'CC-008',
    member_id: 'mem-003',
    member_code: 'TV003',
    member_name: 'Lê Văn C',
    transaction_code: 'PT000131',
    amount: 5000000,
    share_quantity: 50,
    contribution_date: '07/09/2026',
    payment_method: 'CASH',
    receipt_number: 'PT000131',
    content: 'Nộp tiền nâng tỷ lệ cổ phần',
    notes: 'Tiền mặt nộp tại văn phòng HTX',
    status: 'PENDING',
    recorded_by: 'Lê Văn C',
    recorded_date: '07/09/2026',
    receipt_file_name: 'phieu_thu_131.pdf',
  },
];

export const mockSurplusPlan: SurplusDistributionPlan = {
  id: 'SDP-2024',
  fiscal_year: 2024,
  plan_name: 'Phương án Phân chia Lợi nhuận năm 2024 theo Nghị quyết HĐQT số 01/NQ-HĐQT',
  internal_service_surplus: 850000000, // 850.000.000 đ (TK 512 - Miễn thuế TNDN)
  external_service_surplus: 400000000, // 400.000.000 đ (TK 511 - Nộp thuế 20%)
  total_net_profit: 1250000000, // 1.250.000.000 đ
  unallocated_common_fund_rate: 5, // Trích Quỹ chung không chia 5% từ thu nhập bên ngoài (miễn thuế)
  unallocated_common_fund_amount: 20000000, // 20.000.000 đ
  reserve_fund_rate: 10,
  reserve_fund_amount: 125000000, // 125.000.000 đ
  patronage_rebate_rate: 55, // Tỷ lệ chia theo mức độ sử dụng dịch vụ nội bộ (min 51%)
  member_share_rate: 85,
  member_share_amount: 1042500000, // 1.042.500.000 đ
  welfare_fund_rate: 5,
  welfare_fund_amount: 62500000, // 62.500.000 đ
  planned_payout_date: '15/03/2025',
  resolution_number: '01/NQ-HĐQT',
  notes: 'Phân chia lợi nhuận năm 2024 theo Luật HTX 2023 & Thông tư 71/2024/TT-BTC',
  status: 'APPROVED',
};

export const mockSurplusItems: SurplusDistributionItem[] = [
  {
    id: 'sdi-001',
    plan_id: 'SDP-2024',
    member_id: 'mem-001',
    member_code: 'TV001',
    member_name: 'Nguyễn Văn A',
    member_type: 'CHINH_THUC',
    shares_held: 300,
    capital_contributed: 30000000,
    share_percentage: 2.85,
    capital_share_amount: 30375000,
    service_usage_output_kg: 12500,
    service_share_amount: 0,
    total_payout_amount: 30375000,
    payout_method: 'BANK_TRANSFER',
    payout_status: 'DA_NHAN',
    payout_date: '15/03/2025',
    transaction_code: 'LN2025-001',
    bank_name: 'Ngân hàng TMCP Ngoại thương Việt Nam (VCB)',
    bank_account: '1234567890',
    account_holder: 'Nguyễn Văn A',
    documents: [
      { name: 'Quyết định phân chia lợi nhuận.pdf', size: '1.2 MB', type: 'pdf' },
      { name: 'Danh sách xã viên nhận lợi nhuận.xlsx', size: '856 KB', type: 'excel' },
    ],
    audit_trail: [
      { date: '15/03/2025 10:30', action: 'Đã chi trả lợi nhuận', actor: 'Nguyễn Văn A (Kế toán)', status: 'Đã duyệt' },
      { date: '12/03/2025 14:15', action: 'Tạo giao dịch phân chia', actor: 'Nguyễn Văn A (Kế toán)', status: 'Đã duyệt' },
      { date: '10/03/2025 09:20', action: 'Phê duyệt kế hoạch phân chia', actor: 'Lê Thị B (Chủ tịch HĐQT)', status: 'Đã duyệt' },
    ],
  },
  {
    id: 'sdi-002',
    plan_id: 'SDP-2024',
    member_id: 'mem-002',
    member_code: 'TV002',
    member_name: 'Trần Thị B',
    member_type: 'CHINH_THUC',
    shares_held: 400,
    capital_contributed: 40000000,
    share_percentage: 3.80,
    capital_share_amount: 40500000,
    service_usage_output_kg: 9800,
    service_share_amount: 0,
    total_payout_amount: 40500000,
    payout_method: 'CASH',
    payout_status: 'DA_NHAN',
    payout_date: '15/03/2025',
    transaction_code: 'LN2025-002',
    bank_name: 'Agribank - CN Lâm Hà',
    bank_account: '9876543210',
    account_holder: 'Trần Thị B',
    documents: [
      { name: 'Quyết định phân chia lợi nhuận.pdf', size: '1.2 MB', type: 'pdf' },
    ],
    audit_trail: [
      { date: '15/03/2025 11:00', action: 'Đã chi trả lợi nhuận', actor: 'Nguyễn Văn A (Kế toán)', status: 'Đã duyệt' },
    ],
  },
  {
    id: 'sdi-003',
    plan_id: 'SDP-2024',
    member_id: 'mem-003',
    member_code: 'TV003',
    member_name: 'Lê Văn C',
    member_type: 'CHINH_THUC',
    shares_held: 200,
    capital_contributed: 20000000,
    share_percentage: 1.90,
    capital_share_amount: 20250000,
    service_usage_output_kg: 6200,
    service_share_amount: 0,
    total_payout_amount: 20250000,
    payout_method: 'BANK_TRANSFER',
    payout_status: 'DA_NHAN',
    payout_date: '15/03/2025',
    transaction_code: 'LN2025-003',
    bank_name: 'BIDV - CN Lâm Đồng',
    bank_account: '5544332211',
    account_holder: 'Lê Văn C',
    documents: [
      { name: 'Quyết định phân chia lợi nhuận.pdf', size: '1.2 MB', type: 'pdf' },
    ],
    audit_trail: [
      { date: '15/03/2025 11:15', action: 'Đã chi trả lợi nhuận', actor: 'Nguyễn Văn A (Kế toán)', status: 'Đã duyệt' },
    ],
  },
  {
    id: 'sdi-004',
    plan_id: 'SDP-2024',
    member_id: 'mem-004',
    member_code: 'TV004',
    member_name: 'Phạm Thị D',
    member_type: 'LIEN_KET_GOP_VON',
    shares_held: 250,
    capital_contributed: 25000000,
    share_percentage: 2.38,
    capital_share_amount: 25312500,
    service_usage_output_kg: 8500,
    service_share_amount: 0,
    total_payout_amount: 25312500,
    payout_method: 'BANK_TRANSFER',
    payout_status: 'CHUA_NHAN',
    payout_date: '',
    transaction_code: 'LN2025-004',
    bank_name: 'MBBank - CN Lâm Hà',
    bank_account: '1122334455',
    account_holder: 'Phạm Thị D',
    documents: [
      { name: 'Quyết định phân chia lợi nhuận.pdf', size: '1.2 MB', type: 'pdf' },
    ],
    audit_trail: [
      { date: '12/03/2025 14:15', action: 'Tạo giao dịch phân chia', actor: 'Nguyễn Văn A (Kế toán)', status: 'Đã duyệt' },
    ],
  },
  {
    id: 'sdi-005',
    plan_id: 'SDP-2024',
    member_id: 'mem-005',
    member_code: 'TV005',
    member_name: 'Hoàng Văn E',
    member_type: 'CHINH_THUC',
    shares_held: 300,
    capital_contributed: 30000000,
    share_percentage: 2.85,
    capital_share_amount: 30375000,
    service_usage_output_kg: 11000,
    service_share_amount: 0,
    total_payout_amount: 30375000,
    payout_method: 'BANK_TRANSFER',
    payout_status: 'DA_NHAN',
    payout_date: '15/03/2025',
    transaction_code: 'LN2025-005',
    bank_name: 'VietinBank - CN Lâm Đồng',
    bank_account: '7788990011',
    account_holder: 'Hoàng Văn E',
    documents: [
      { name: 'Quyết định phân chia lợi nhuận.pdf', size: '1.2 MB', type: 'pdf' },
    ],
    audit_trail: [
      { date: '15/03/2025 11:30', action: 'Đã chi trả lợi nhuận', actor: 'Nguyễn Văn A (Kế toán)', status: 'Đã duyệt' },
    ],
  },
  {
    id: 'sdi-006',
    plan_id: 'SDP-2024',
    member_id: 'mem-006',
    member_code: 'TV006',
    member_name: 'Đỗ Thị F',
    member_type: 'LIEN_KET_KHONG_GOP_VON',
    shares_held: 150,
    capital_contributed: 15000000,
    share_percentage: 1.43,
    capital_share_amount: 15187500,
    service_usage_output_kg: 4200,
    service_share_amount: 0,
    total_payout_amount: 15187500,
    payout_method: 'CASH',
    payout_status: 'CHUA_NHAN',
    payout_date: '',
    transaction_code: 'LN2025-006',
    bank_name: '',
    bank_account: '',
    account_holder: '',
    documents: [
      { name: 'Quyết định phân chia lợi nhuận.pdf', size: '1.2 MB', type: 'pdf' },
    ],
    audit_trail: [
      { date: '12/03/2025 14:15', action: 'Tạo giao dịch phân chia', actor: 'Nguyễn Văn A (Kế toán)', status: 'Đã duyệt' },
    ],
  },
];

// Helper function to map API Response resource to Member frontend interface
export const mapApiMemberToFrontend = (item: any): Member => {
  const info = item.identity_information || {};

  const committed = typeof item.committed_capital === 'number'
    ? item.committed_capital
    : (info.committed_capital !== undefined ? Number(info.committed_capital) : 30000000);

  const contributed = typeof item.contributed_capital === 'number'
    ? item.contributed_capital
    : (info.contributed_capital !== undefined ? Number(info.contributed_capital) : committed);

  const remaining = Math.max(0, committed - contributed);
  const status = contributed >= committed && committed > 0 ? 'DU_VON' : 'CHUA_DU';

  return {
    id: String(item.id),
    cooperative_id: item.cooperative_id || 'coop-01',
    member_code: item.member_code,
    full_name: info.full_name || 'Xã viên ' + item.member_code,
    gender: info.gender || 'Nam',
    dob: info.dob || '1990-01-01',
    cccd: info.citizen_id || info.cccd || '049090000000',
    cccd_issue_date: info.cccd_issue_date || '2021-01-01',
    cccd_issue_place: info.cccd_issue_place || 'Cục Cảnh sát QLHC',
    education_level: info.education_level || 'THPT',
    occupation: info.occupation || 'Nông dân',
    province: info.province || 'Lâm Đồng',
    district: info.district || 'Huyện Lâm Hà',
    ward: info.ward || 'Xã Mê Linh',
    detail_address: info.detail_address || '',
    address: info.address || `${info.detail_address || ''}, ${info.ward || ''}, ${info.district || ''}, ${info.province || ''}`,
    phone: info.phone_number || info.phone || '0987654321',
    email: info.email || '',
    zalo: info.zalo || '',
    facebook: info.facebook || '',
    capital_form: info.capital_form || 'TIEN_MAT',
    contribution_date: item.admission_date || '2024-01-01',
    contribution_method: 'Góp một lần',
    member_type: item.member_type || 'CHINH_THUC',
    is_foreign_investor: item.is_foreign_investor || false,
    committed_capital: committed,
    contributed_capital: contributed,
    remaining_capital: remaining,
    total_capital_contributed: contributed,
    capital_in_words: item.capital_in_words || `${numberToVietnameseWords(committed)}`,
    total_shares_held: Math.floor(contributed / 100000),
    ownership_percentage: item.ownership_percentage,
    capital_status: status,
    profit_share_rate: item.ownership_percentage || 1.0,
    payout_method: info.payout_method || 'BANK_TRANSFER',
    bank_account: info.bank_account || '',
    bank_name: info.bank_name || '',
    account_holder: info.account_holder || info.full_name || '',
    notes: info.notes || '',
    status: item.status || 'ACTIVE',
    join_date: item.admission_date || '2024-01-01',
    current_debt: item.current_debt || 0,
    annual_product_output_kg: item.annual_product_output_kg || 5000,
  };
};

export const getMembersFromApi = async (filters?: { search?: string; status?: string; member_type?: string }): Promise<Member[]> => {
  let apiMembers: Member[] = [];
  try {
    const res: any = await apiClient.get('/members', { params: filters });
    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      apiMembers = res.data.map(mapApiMemberToFrontend);
    }
  } catch (error) {
    console.warn('Backend API connection warning, using local DB store:', error);
  }

  const stored = getStoredMembers();
  if (!stored || stored.length === 0) {
    const initialList = deduplicateMembers(apiMembers.length > 0 ? apiMembers : mockMembersList);
    saveMembersToStorage(initialList);
    return initialList;
  }

  const getKey = (m: Member) =>
    m.member_code && m.member_code.trim()
      ? m.member_code.trim().toUpperCase()
      : m.cccd && m.cccd.trim()
      ? m.cccd.trim()
      : String(m.id).trim();

  // Merge API members and stored members, giving priority to user's updated local DB store
  const mergedMap = new Map<string, Member>();
  // 1. Add mock items first to ensure sample debt test data is present
  mockMembersList.forEach((m) => mergedMap.set(getKey(m), m));
  // 2. Overlay API items
  apiMembers.forEach((m) => mergedMap.set(getKey(m), m));
  // 3. Add stored items last so user's updates in localStorage take highest priority
  stored.forEach((m) => mergedMap.set(getKey(m), m));

  const mergedList = deduplicateMembers(Array.from(mergedMap.values()));
  saveMembersToStorage(mergedList);
  return mergedList;
};

export const createMemberApi = async (memberData: Partial<Member>): Promise<Member> => {
  let createdMember: Member | null = null;
  try {
    const payload = {
      member_code: memberData.member_code,
      member_type: memberData.member_type || 'CHINH_THUC',
      admission_date: memberData.join_date || new Date().toISOString().split('T')[0],
      identity_information: {
        full_name: memberData.full_name,
        gender: memberData.gender,
        dob: memberData.dob,
        citizen_id: memberData.cccd,
        cccd_issue_date: memberData.cccd_issue_date,
        cccd_issue_place: memberData.cccd_issue_place,
        phone_number: memberData.phone,
        email: memberData.email,
        province: memberData.province,
        district: memberData.district,
        ward: memberData.ward,
        detail_address: memberData.detail_address,
        address: memberData.address,
        bank_name: memberData.bank_name,
        bank_account: memberData.bank_account,
        account_holder: memberData.account_holder,
      },
    };
    const res: any = await apiClient.post('/members', payload);
    if (res && res.data) {
      createdMember = mapApiMemberToFrontend(res.data);
    }
  } catch (error) {
    console.warn('API create notice, creating local persistent DB entry:', error);
  }

  if (!createdMember) {
    createdMember = {
      ...mockMembersList[0],
      id: `mem-${Date.now()}`,
      member_code: memberData.member_code || `TV${Math.floor(100 + Math.random() * 900)}`,
      full_name: memberData.full_name || 'Xã viên mới',
      gender: memberData.gender || 'Nam',
      phone: memberData.phone || '',
      cccd: memberData.cccd || '',
      address: memberData.address || '',
      member_type: memberData.member_type || 'CHINH_THUC',
      status: 'PENDING',
      join_date: memberData.join_date || new Date().toISOString().split('T')[0],
      committed_capital: memberData.committed_capital || 10000000,
      contributed_capital: memberData.contributed_capital || 10000000,
      remaining_capital: 0,
      capital_status: 'DU_VON',
    };
  }

  // SAVE PERMANENTLY TO LOCAL DB STORAGE
  addMemberToStorage(createdMember);
  return createdMember;
};

export const updateMemberApi = async (id: string, memberData: Partial<Member>): Promise<Member> => {
  let updatedMember: Member | null = null;
  try {
    const payload = {
      member_type: memberData.member_type,
      admission_date: memberData.join_date,
      committed_capital: memberData.committed_capital,
      credit_limit: (memberData as any).credit_limit,
      identity_information: {
        full_name: memberData.full_name,
        gender: memberData.gender,
        dob: memberData.dob,
        citizen_id: memberData.cccd,
        cccd_issue_date: memberData.cccd_issue_date,
        cccd_issue_place: memberData.cccd_issue_place,
        phone_number: memberData.phone,
        email: memberData.email,
        province: memberData.province,
        district: memberData.district,
        ward: memberData.ward,
        detail_address: memberData.detail_address,
        address: memberData.address,
        bank_name: memberData.bank_name,
        bank_account: memberData.bank_account,
        account_holder: memberData.account_holder,
      },
    };
    const res: any = await apiClient.patch(`/members/${id}`, payload);
    if (res && res.data) {
      updatedMember = mapApiMemberToFrontend(res.data);
    }
  } catch (error) {
    console.warn('API update member notice:', error);
  }

  const stored = getStoredMembers();
  if (stored) {
    const nextList = stored.map((m) =>
      m.id === id ? { ...m, ...memberData, ...(updatedMember || {}) } : m
    );
    saveMembersToStorage(nextList);
    const target = nextList.find((m) => m.id === id);
    if (target) return target;
  }

  return updatedMember || (memberData as Member);
};

export const deleteMemberApi = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/members/${id}`);
  } catch (error) {
    console.warn('API delete member notice:', error);
  }

  const stored = getStoredMembers();
  if (stored) {
    const nextList = stored.filter((m) => m.id !== id);
    saveMembersToStorage(nextList);
  }
  return true;
};

export const approveMemberApi = async (id: string): Promise<boolean> => {
  try {
    await apiClient.post(`/members/${id}/approve`);
  } catch (error) {
    console.warn('API approve notice:', error);
  }

  const stored = getStoredMembers();
  if (stored) {
    const updated = stored.map(m => (m.id === id ? { ...m, status: 'ACTIVE' as const } : m));
    saveMembersToStorage(updated);
  }
  return true;
};

export const getCapitalSummaryApi = async (): Promise<any> => {
  try {
    const res: any = await apiClient.get('/capital-contributions/summary');
    return res.data || res;
  } catch (error) {
    console.warn('API capital summary notice:', error);
    return null;
  }
};

export const getCapitalContributionsApi = async (filters?: any): Promise<CapitalTransaction[]> => {
  try {
    const res: any = await apiClient.get('/capital-contributions', { params: filters });
    const items = res?.data || [];
    if (Array.isArray(items) && items.length > 0) {
      return items.map((item: any) => {
        const methodMap: Record<string, 'CASH' | 'BANK_TRANSFER' | 'LAND' | 'ASSET'> = {
          TIEN_MAT: 'CASH',
          CHUYEN_KHOAN: 'BANK_TRANSFER',
          LAND: 'LAND',
          QUYEN_SU_DUNG_DAT: 'LAND',
          HIEN_VAT: 'ASSET',
          ASSET: 'ASSET',
        };

        const paymentMethod = methodMap[item.contribution_type] || 'CASH';
        const statusMap: Record<string, 'APPROVED' | 'PENDING' | 'REJECTED'> = {
          PAID: 'APPROVED',
          APPROVED: 'APPROVED',
          COMPLETED: 'APPROVED',
          PENDING: 'PENDING',
          REJECTED: 'REJECTED',
        };
        const status = statusMap[item.status] || 'APPROVED';

        return {
          id: item.id,
          member_id: item.member_id,
          member_code: item.member?.member_code || '',
          member_name: item.member?.full_name || '',
          transaction_code: item.certificate_code || `PT${item.id?.substring(0, 6) || '000001'}`,
          amount: Number(item.amount || 0),
          share_quantity: Math.floor(Number(item.amount || 0) / 100000),
          contribution_date: item.transaction_date || item.created_at?.split('T')[0] || '',
          payment_method: paymentMethod,
          receipt_number: item.certificate_code || `PT${item.id?.substring(0, 6) || '000001'}`,
          content: item.value_description || 'Góp vốn điều lệ HTX',
          notes: item.value_description || '',
          status,
          recorded_by: 'Kế toán HTX',
          recorded_date: item.transaction_date || item.created_at?.split('T')[0] || '',
          certificate_code: item.certificate_code,
          land_details: item.land_contribution ? {
            id: item.land_contribution.id,
            land_certificate_no: item.land_contribution.land_certificate_no,
            plot_number: String(item.land_contribution.plot_number || ''),
            map_sheet_number: String(item.land_contribution.map_sheet_number || ''),
            land_area_sqm: Number(item.land_contribution.land_area_sqm || 0),
            land_use_type: item.land_contribution.land_use_type || 'Đất nông nghiệp',
            appraised_unit_price: Number(item.land_contribution.appraised_unit_price || 0),
            total_land_value: Number(item.land_contribution.total_land_value || 0),
            cadastral_status: item.land_contribution.cadastral_status || 'REGISTERED_CHANGE',
          } : undefined,
        };
      });
    }
  } catch (error) {
    console.warn('API capital contributions notice:', error);
  }

  const stored = getStoredCapitalTransactions();
  return stored && stored.length > 0 ? stored : mockCapitalTransactions;
};

export const createCapitalContributionApi = async (memberId: string, data: any): Promise<CapitalTransaction | null> => {
  try {
    const payload = {
      contribution_type: data.form || data.contribution_type || 'TIEN_MAT',
      amount: Number(data.amount),
      transaction_date: data.date || data.contribution_date || new Date().toISOString().split('T')[0],
      value_description: data.notes || data.content || '',
      land_certificate_no: data.land_certificate_no,
      plot_number: data.plot_number,
      map_sheet_number: data.map_sheet_number,
      land_area_sqm: data.land_area_sqm,
      land_use_type: data.land_use_type,
      appraised_unit_price: data.appraised_unit_price,
    };
    const res: any = await apiClient.post(`/members/${memberId}/capital-contributions`, payload);
    const item = res?.data;
    if (item) {
      const methodMap: Record<string, 'CASH' | 'BANK_TRANSFER' | 'LAND' | 'ASSET'> = {
        TIEN_MAT: 'CASH',
        CHUYEN_KHOAN: 'BANK_TRANSFER',
        LAND: 'LAND',
        QUYEN_SU_DUNG_DAT: 'LAND',
        HIEN_VAT: 'ASSET',
        ASSET: 'ASSET',
      };
      const createdTx: CapitalTransaction = {
        id: item.id,
        member_id: item.member_id,
        member_code: item.member?.member_code || data.member_code || '',
        member_name: item.member?.full_name || data.member_name || '',
        transaction_code: item.certificate_code || `PT${item.id?.substring(0, 6) || '000001'}`,
        amount: Number(item.amount),
        share_quantity: Math.floor(Number(item.amount) / 100000),
        contribution_date: item.transaction_date || payload.transaction_date,
        payment_method: methodMap[item.contribution_type] || 'CASH',
        receipt_number: item.certificate_code || `PT${item.id?.substring(0, 6) || '000001'}`,
        content: item.value_description || 'Góp vốn điều lệ',
        notes: item.value_description || '',
        status: item.status === 'PENDING' ? 'PENDING' : 'APPROVED',
        certificate_code: item.certificate_code,
        land_details: item.land_contribution ? {
          id: item.land_contribution.id,
          land_certificate_no: item.land_contribution.land_certificate_no,
          plot_number: String(item.land_contribution.plot_number || ''),
          map_sheet_number: String(item.land_contribution.map_sheet_number || ''),
          land_area_sqm: Number(item.land_contribution.land_area_sqm || 0),
          land_use_type: item.land_contribution.land_use_type || 'Đất nông nghiệp',
          appraised_unit_price: Number(item.land_contribution.appraised_unit_price || 0),
          total_land_value: Number(item.land_contribution.total_land_value || 0),
          cadastral_status: item.land_contribution.cadastral_status || 'REGISTERED_CHANGE',
        } : undefined,
      };

      const stored = getStoredCapitalTransactions() || [];
      saveCapitalTransactionsToStorage([createdTx, ...stored]);
      return createdTx;
    }
  } catch (error) {
    console.warn('API create capital contribution notice:', error);
  }

  // Fallback to local storage if API unreachable
  const fallbackTx: CapitalTransaction = {
    id: `TX-${Date.now()}`,
    member_id: memberId,
    member_code: data.member_code || 'TV001',
    member_name: data.member_name || 'Xã viên',
    transaction_code: data.receipt_number || `PT${Date.now().toString().slice(-6)}`,
    amount: Number(data.amount || 0),
    share_quantity: Math.floor(Number(data.amount || 0) / 100000),
    contribution_date: data.date || data.contribution_date || new Date().toISOString().split('T')[0],
    payment_method: data.payment_method || 'CASH',
    receipt_number: data.receipt_number || `PT${Date.now().toString().slice(-6)}`,
    content: data.content || 'Góp vốn HTX',
    notes: data.notes || '',
    status: 'APPROVED',
    certificate_code: `GCN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  };
  const stored = getStoredCapitalTransactions() || [];
  saveCapitalTransactionsToStorage([fallbackTx, ...stored]);
  return fallbackTx;
};

/** API Client methods for Surplus Distribution Plans (Modules\Finance) */
export const fetchSurplusPlansApi = async (params?: any) => {
  try {
    const response = await apiClient.get('/surplus-distribution-plans', { params });
    return response.data;
  } catch (error) {
    console.warn('API fetchSurplusPlans failed:', error);
    return { data: [mockSurplusPlan] };
  }
};

export const fetchSurplusPlanByIdApi = async (id: string) => {
  try {
    const response = await apiClient.get(`/surplus-distribution-plans/${id}`);
    return response.data;
  } catch (error) {
    console.warn(`API fetchSurplusPlanById failed for ${id}:`, error);
    return { data: mockSurplusPlan };
  }
};

export const createSurplusPlanApi = async (payload: {
  financial_year: number;
  total_surplus: number;
  distributable_surplus: number;
  capital_weight?: number;
  service_usage_weight?: number;
  custom_plan_code?: string;
}) => {
  const response = await apiClient.post('/surplus-distribution-plans', payload);
  return response.data;
};

export const submitSurplusPlanApi = async (id: string) => {
  const response = await apiClient.post(`/surplus-distribution-plans/${id}/submit`);
  return response.data;
};

export const approveSurplusPlanApi = async (id: string) => {
  const response = await apiClient.post(`/surplus-distribution-plans/${id}/approve`);
  return response.data;
};


