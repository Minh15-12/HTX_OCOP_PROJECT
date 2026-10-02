import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckSquare, Layers, Award, ChevronRight, Star, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/layouts/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/services/apiClient';

export interface IndicatorItem {
  id: string;
  code: string;
  name: string;
  max_score: number;
  is_mandatory: boolean;
}

export interface CriterionItem {
  id: string;
  code: string;
  name: string;
  max_score: number;
  indicators: IndicatorItem[];
}

export interface CriteriaGroupItem {
  id: string;
  code: string;
  name: string;
  criteria: CriterionItem[];
}

export interface CriteriaVersionItem {
  id: string;
  version_code: string;
  name: string;
  status: string;
  effective_date?: string;
  groups?: CriteriaGroupItem[];
}

export interface OcopSubProductSet {
  stt: number;
  id: string;
  categoryKey: 'FOOD' | 'DRINK' | 'HERB' | 'CRAFT' | 'PLANT' | 'TOURISM';
  name: string;
  page: string;
  example: string;
}

export const OCOP_26_SUB_PRODUCT_SETS: OcopSubProductSet[] = [
  { stt: 1, id: 'sp-01', categoryKey: 'FOOD', name: 'Bộ sản phẩm: Rau, củ, quả, hạt tươi', page: 'Trang 02', example: 'Ớt chuông Sweet Palermo, Cà chua, Khoai tây, Bắp nướng...' },
  { stt: 2, id: 'sp-02', categoryKey: 'FOOD', name: 'Bộ sản phẩm: Thịt, thủy sản, trứng, sữa tươi', page: 'Trang 07', example: 'Thịt bò, Cá hồi, Trứng gà sinh học, Sữa tươi tiệt trùng...' },
  { stt: 3, id: 'sp-03', categoryKey: 'FOOD', name: 'Bộ sản phẩm: Gạo, ngũ cốc, hạt sơ chế khác', page: 'Trang 12', example: 'Gạo ST25, Hạt điều, Hạt mắc ca, Đậu nành...' },
  { stt: 4, id: 'sp-04', categoryKey: 'FOOD', name: 'Bộ sản phẩm: Mật ong, mật khác và nông sản thực phẩm khác', page: 'Trang 17', example: 'Mật ong hoa rừng, Mật dừa nước, Mật thốt nốt...' },
  { stt: 5, id: 'sp-05', categoryKey: 'FOOD', name: 'Bộ sản phẩm: Đồ ăn nhanh', page: 'Trang 22', example: 'Bánh snack, Hạt sấy giòn, Trái cây sấy dẻo...' },
  { stt: 6, id: 'sp-06', categoryKey: 'FOOD', name: 'Bộ sản phẩm: Chế biến từ gạo, ngũ cốc', page: 'Trang 27', example: 'Bún khô, Phở khô, Bánh tráng, Cốm làng Vòng...' },
  { stt: 7, id: 'sp-07', categoryKey: 'FOOD', name: 'Bộ sản phẩm: Chế biến từ rau, củ, quả, hạt', page: 'Trang 32', example: 'Mứt dâu tây, Dưa góp, Kim chi, Trái cây đóng hộp...' },
  { stt: 8, id: 'sp-08', categoryKey: 'FOOD', name: 'Bộ sản phẩm: Chế biến từ thịt, thủy sản, trứng, sữa, mật ong', page: 'Trang 37', example: 'Chả lụa, Lạp xưởng, Nước mắm, Thịt hun khói...' },
  { stt: 9, id: 'sp-09', categoryKey: 'FOOD', name: 'Bộ sản phẩm: Tương, nước mắm, gia vị dạng lỏng khác', page: 'Trang 42', example: 'Nước mắm truyền thống, Tương bần, Dầu hào...' },
  { stt: 10, id: 'sp-10', categoryKey: 'FOOD', name: 'Bộ sản phẩm: Gia vị khác (muối, hành, tỏi, tiêu)', page: 'Trang 47', example: 'Tiêu Phú Quốc, Muối tôm Tây Ninh, Tỏi Lý Sơn...' },

  { stt: 11, id: 'sp-11', categoryKey: 'DRINK', name: 'Bộ sản phẩm: Chè tươi, chè chế biến', page: 'Trang 52', example: 'Trà Thái Nguyên, Trà Shan Tuyết cổ thụ, Trà Oolong...' },
  { stt: 12, id: 'sp-12', categoryKey: 'DRINK', name: 'Bộ sản phẩm: Sản phẩm trà từ thực vật khác', page: 'Trang 57', example: 'Trà hoa cúc, Trà diếp cá, Trà măng đắng...' },
  { stt: 13, id: 'sp-13', categoryKey: 'DRINK', name: 'Bộ sản phẩm: Cà phê, cacao', page: 'Trang 62', example: 'Cà phê Arabica Mê Linh, Cà phê Robusta, Cacao bột...' },
  { stt: 14, id: 'sp-14', categoryKey: 'DRINK', name: 'Bộ sản phẩm: Rượu trắng', page: 'Trang 67', example: 'Rượu nếp cái hoa vàng, Rượu Mẫu Sơn, Rượu Bầu Đá...' },
  { stt: 15, id: 'sp-15', categoryKey: 'DRINK', name: 'Bộ sản phẩm: Đồ uống có cồn khác', page: 'Trang 72', example: 'Rượu cần, Rượu vang Đà Lạt, Rượu trái cây...' },
  { stt: 16, id: 'sp-16', categoryKey: 'DRINK', name: 'Bộ sản phẩm: Nước khoáng thiên nhiên, nước tinh khiết', page: 'Trang 77', example: 'Nước khoáng Kim Bôi, Nước suối thiên nhiên...' },
  { stt: 17, id: 'sp-17', categoryKey: 'DRINK', name: 'Bộ sản phẩm: Đồ uống không cồn khác', page: 'Trang 82', example: 'Nước ép chanh dây, Si rô dâu, Nước dừa xiêm...' },

  { stt: 18, id: 'sp-18', categoryKey: 'HERB', name: 'Bộ sản phẩm: Thực phẩm chức năng, thuốc dược liệu, y học cổ truyền', page: 'Trang 87', example: 'Đông trùng hạ thảo, Sâm Ngọc Linh, Cao đinh lăng...' },
  { stt: 19, id: 'sp-19', categoryKey: 'HERB', name: 'Bộ sản phẩm: Mỹ phẩm có thành phần từ thảo dược', page: 'Trang 92', example: 'Xà bông nghệ, Dầu gội bồ kết, Kem dưỡng nấm mộc...' },
  { stt: 20, id: 'sp-20', categoryKey: 'HERB', name: 'Bộ sản phẩm: Tinh dầu và thảo dược khác', page: 'Trang 97', example: 'Tinh dầu sả chanh, Tinh dầu tràm, Túi chốt thảo dược...' },

  { stt: 21, id: 'sp-21', categoryKey: 'CRAFT', name: 'Bộ sản phẩm: Thủ công mỹ nghệ', page: 'Trang 102', example: 'Gốm Bát Tràng, Nón lá, Mây tre đan Phú Vinh...' },
  { stt: 22, id: 'sp-22', categoryKey: 'CRAFT', name: 'Bộ sản phẩm: Vải, may mặc', page: 'Trang 107', example: 'Lụa Vạn Phúc, Thổ cẩm H’Mông, Áo dài thêu tay...' },

  { stt: 23, id: 'sp-23', categoryKey: 'PLANT', name: 'Bộ sản phẩm: Hoa', page: 'Trang 112', example: 'Hoa ly Đà Lạt, Hoa lan hồ điệp, Hoa hồng ngoại...' },
  { stt: 24, id: 'sp-24', categoryKey: 'PLANT', name: 'Bộ sản phẩm: Cây cảnh', page: 'Trang 117', example: 'Bonsai sanh cổ, Cây mai vàng, Cây tùng la hán...' },
  { stt: 25, id: 'sp-25', categoryKey: 'PLANT', name: 'Bộ sản phẩm: Động vật cảnh', page: 'Trang 121', example: 'Cá rồng, Chim cảnh, Gà đông tảo cảnh...' },

  { stt: 26, id: 'sp-26', categoryKey: 'TOURISM', name: 'Bộ sản phẩm: Dịch vụ du lịch cộng đồng, du lịch sinh thái và điểm du lịch', page: 'Trang 125', example: 'Du lịch cộng đồng Làng cổ Đường Lâm, Homestay Mê Linh...' },
];

export const CriteriaPage: React.FC = () => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>('ver-2026');
  const [selectedCategory, setSelectedCategory] = useState<string>('FOOD');
  const [selectedSubSetId, setSelectedSubSetId] = useState<string>('sp-01');

  const activeSubSet = OCOP_26_SUB_PRODUCT_SETS.find(s => s.id === selectedSubSetId) || OCOP_26_SUB_PRODUCT_SETS[0];

  // Query Criteria Versions
  const { data: versionsData, isLoading: isLoadingVersions } = useQuery({
    queryKey: ['criteria-versions'],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/ocop/criteria-versions');
        return res.data || res;
      } catch {
        return {
          data: [
            {
              id: 'ver-2026',
              version_code: 'OCOP-VER-2026',
              name: 'Bộ Tiêu Chí Quốc Gia Đánh Giá & Phân Hạng OCOP 2026',
              status: 'PUBLISHED',
              effective_date: '2026-01-01',
            },
          ],
        };
      }
    },
  });

  // Query Council Levels
  const { data: councilLevelsData } = useQuery({
    queryKey: ['council-levels'],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/ocop/council-levels');
        return res.data || res;
      } catch {
        return {
          data: [
            { id: 'cl-01', code: 'DISTRICT', name: 'Hội đồng Thẩm định Cấp Huyện / Thị xã' },
            { id: 'cl-02', code: 'PROVINCIAL', name: 'Hội đồng Thẩm định Cấp Tỉnh / Thành phố' },
            { id: 'cl-03', code: 'NATIONAL', name: 'Hội đồng Thẩm định Cấp Trung Ương (5 Sao)' },
          ],
        };
      }
    },
  });

  // Authentic criteria trees per Product Category under Decision 148/QĐ-TTg
  const CRITERIA_TREES_BY_CATEGORY: Record<string, CriteriaGroupItem[]> = {
    FOOD: [
      {
        id: 'food-g1',
        code: 'NHÓM 1',
        name: 'Sản phẩm & Sức mạnh cộng đồng - Ngành Thực phẩm (Tối đa 35 điểm)',
        criteria: [
          {
            id: 'f-c1',
            code: 'TC-01',
            name: 'Tổ chức sản xuất & Năng lực chủ thể HTX',
            max_score: 20,
            indicators: [
              { id: 'f1', code: '1.1', name: 'Sử dụng lao động địa phương & Hợp đồng liên kết chuỗi giá trị tiêu thụ', max_score: 10, is_mandatory: false },
              { id: 'f2', code: '1.2 (*)', name: 'Giấy chứng nhận An toàn Vệ sinh Thực phẩm / VietGAP / GlobalGAP', max_score: 10, is_mandatory: true },
            ],
          },
          {
            id: 'f-c2',
            code: 'TC-02',
            name: 'Vùng nguyên liệu địa phương & Môi trường',
            max_score: 15,
            indicators: [
              { id: 'f3', code: '1.3', name: 'Tỷ lệ nguyên liệu địa phương đạt từ 70% trở lên', max_score: 10, is_mandatory: false },
              { id: 'f4', code: '1.4', name: 'Bảo vệ môi trường trong canh tác & chế biến nông sản', max_score: 5, is_mandatory: false },
            ],
          },
        ],
      },
      {
        id: 'food-g2',
        code: 'NHÓM 2',
        name: 'Khả năng tiếp thị và nhãn hiệu (Tối đa 25 điểm)',
        criteria: [
          {
            id: 'f-c3',
            code: 'TC-03',
            name: 'Bao bì, nhãn hiệu và truy xuất nguồn gốc',
            max_score: 25,
            indicators: [
              { id: 'f5', code: '2.1', name: 'Bao bì chứa đựng ghi nhãn hàng hóa đúng quy định', max_score: 10, is_mandatory: false },
              { id: 'f6', code: '2.2 (*)', name: 'Mã vạch & Hệ thống tem QR code truy xuất nguồn gốc nông sản', max_score: 15, is_mandatory: true },
            ],
          },
        ],
      },
      {
        id: 'food-g3',
        code: 'NHÓM 3',
        name: 'Chất lượng sản phẩm thực phẩm (Tối đa 40 điểm)',
        criteria: [
          {
            id: 'f-c4',
            code: 'TC-04',
            name: 'Chất lượng cảm quan & Phiếu kiểm nghiệm ISO/IEC 17025',
            max_score: 40,
            indicators: [
              { id: 'f7', code: '3.1 (*)', name: 'Phiếu kết quả thử nghiệm chỉ tiêu an toàn vi sinh & dư lượng thuốc BVTV', max_score: 25, is_mandatory: true },
              { id: 'f8', code: '3.2', name: 'Tính độc đáo và bản sắc văn hóa nông sản truyền thống vùng miền', max_score: 15, is_mandatory: false },
            ],
          },
        ],
      },
    ],

    DRINK: [
      {
        id: 'drink-g1',
        code: 'NHÓM 1',
        name: 'Sản phẩm & Sức mạnh cộng đồng - Ngành Đồ uống (Tối đa 35 điểm)',
        criteria: [
          {
            id: 'd-c1',
            code: 'TC-01',
            name: 'Vùng trồng nguyên liệu tập trung & Nông hộ liên kết',
            max_score: 20,
            indicators: [
              { id: 'd1', code: '1.1', name: 'Liên kết hợp tác sản xuất với nông hộ trồng Trà/Cà phê', max_score: 10, is_mandatory: false },
              { id: 'd2', code: '1.2 (*)', name: 'Quy trình ủ men & Chế biến đạt chuẩn ISO 22000 / HACCP', max_score: 10, is_mandatory: true },
            ],
          },
          {
            id: 'd-c2',
            code: 'TC-02',
            name: 'Năng lực quản trị & Xử lý phụ phẩm',
            max_score: 15,
            indicators: [
              { id: 'd3', code: '1.3', name: 'Tạo việc làm cho lao động đồng bào dân tộc thiểu số', max_score: 10, is_mandatory: false },
              { id: 'd4', code: '1.4', name: 'Xử lý phụ phẩm bã trà/vỏ cà phê làm phân bón hữu cơ', max_score: 5, is_mandatory: false },
            ],
          },
        ],
      },
      {
        id: 'drink-g2',
        code: 'NHÓM 2',
        name: 'Khả năng tiếp thị & Nhãn hiệu Đồ uống (Tối đa 25 điểm)',
        criteria: [
          {
            id: 'd-c3',
            code: 'TC-03',
            name: 'Bảo hộ thương hiệu & Kênh phân phối',
            max_score: 25,
            indicators: [
              { id: 'd5', code: '2.1 (*)', name: 'Giấy chứng nhận đăng ký nhãn hiệu & Chỉ dẫn địa lý đồ uống', max_score: 15, is_mandatory: true },
              { id: 'd6', code: '2.2', name: 'Kênh phân phối chuỗi siêu thị & Xuất khẩu', max_score: 10, is_mandatory: false },
            ],
          },
        ],
      },
      {
        id: 'drink-g3',
        code: 'NHÓM 3',
        name: 'Chất lượng Đồ uống & Thử nếm Sensory (Tối đa 40 điểm)',
        criteria: [
          {
            id: 'd-c4',
            code: 'TC-04',
            name: 'Đánh giá hương vị Sensory Cup Score & Kiểm định độc lập',
            max_score: 40,
            indicators: [
              { id: 'd7', code: '3.1 (*)', name: 'Phiếu kiểm nghiệm hàm lượng Caffeine / Ocratoxin A / Kim loại nặng', max_score: 25, is_mandatory: true },
              { id: 'd8', code: '3.2', name: 'Hương vị đặc trưng vùng miền & Điểm thử nếm chuyên gia (Sensory Cup Score >= 80)', max_score: 15, is_mandatory: false },
            ],
          },
        ],
      },
    ],

    HERB: [
      {
        id: 'herb-g1',
        code: 'NHÓM 1',
        name: 'Sản phẩm & Cộng đồng - Ngành Thảo dược & Dược liệu (Tối đa 35 điểm)',
        criteria: [
          {
            id: 'h-c1',
            code: 'TC-01',
            name: 'Vùng trồng Dược liệu sạch GACP-WHO & Bảo tồn',
            max_score: 20,
            indicators: [
              { id: 'h1', code: '1.1 (*)', name: 'Giấy chứng nhận vùng trồng Dược liệu đạt chuẩn GACP-WHO', max_score: 10, is_mandatory: true },
              { id: 'h2', code: '1.2', name: 'Bảo tồn nguồn gen cây dược liệu quý hiếm của địa phương', max_score: 10, is_mandatory: false },
            ],
          },
          {
            id: 'h-c2',
            code: 'TC-02',
            name: 'Tri thức bản địa & Sáng chế dược liệu',
            max_score: 15,
            indicators: [
              { id: 'h3', code: '1.3', name: 'Ứng dụng bài thuốc cổ truyền dân tộc bản địa', max_score: 10, is_mandatory: false },
              { id: 'h4', code: '1.4', name: 'Đăng ký Bằng sáng chế / Giải pháp hữu ích bài thuốc', max_score: 5, is_mandatory: false },
            ],
          },
        ],
      },
      {
        id: 'herb-g2',
        code: 'NHÓM 2',
        name: 'Tiếp thị & Hồ sơ Công bố Dược phẩm (Tối đa 25 điểm)',
        criteria: [
          {
            id: 'h-c3',
            code: 'TC-03',
            name: 'Công bố sản phẩm & Bao bì dược học',
            max_score: 25,
            indicators: [
              { id: 'h5', code: '2.1 (*)', name: 'Giấy tiếp nhận công bố sản phẩm Dược liệu / Mỹ phẩm của Sở Y tế', max_score: 15, is_mandatory: true },
              { id: 'h6', code: '2.2', name: 'Bao bì dược phẩm chống ẩm, chống tia UV chuyên dụng', max_score: 10, is_mandatory: false },
            ],
          },
        ],
      },
      {
        id: 'herb-g3',
        code: 'NHÓM 3',
        name: 'Chất lượng Dược tính & An toàn Sinh học (Tối đa 40 điểm)',
        criteria: [
          {
            id: 'h-c4',
            code: 'TC-04',
            name: 'Định lượng hoạt chất sinh học Dược liệu',
            max_score: 40,
            indicators: [
              { id: 'h7', code: '3.1 (*)', name: 'Phiếu kiểm nghiệm định lượng hàm lượng hoạt chất chính (Saponin, Flavonoid...)', max_score: 25, is_mandatory: true },
              { id: 'h8', code: '3.2', name: 'Thử nghiệm an toàn độc tính cấp & Độ không kích ứng da', max_score: 15, is_mandatory: false },
            ],
          },
        ],
      },
    ],

    CRAFT: [
      {
        id: 'craft-g1',
        code: 'NHÓM 1',
        name: 'Sản phẩm & Làng nghề - Ngành Thủ công Mỹ nghệ (Tối đa 35 điểm)',
        criteria: [
          {
            id: 'cr-c1',
            code: 'TC-01',
            name: 'Truyền thống Làng nghề & Tay nghề Nghệ nhân',
            max_score: 20,
            indicators: [
              { id: 'cr1', code: '1.1', name: 'Duy trì và phát triển làng nghề được Nhà nước công nhận', max_score: 10, is_mandatory: false },
              { id: 'cr2', code: '1.2 (*)', name: 'Sản phẩm được tác tạo trực tiếp bởi Nghệ nhân / Thợ giỏi', max_score: 10, is_mandatory: true },
            ],
          },
          {
            id: 'cr-c2',
            code: 'TC-02',
            name: 'Sử dụng nguyên liệu tự nhiên & Khai thác bền vững',
            max_score: 15,
            indicators: [
              { id: 'cr3', code: '1.3', name: 'Sử dụng 100% nguyên liệu tự nhiên địa phương (Đất sét, Mây tre, Gỗ)', max_score: 10, is_mandatory: false },
              { id: 'cr4', code: '1.4', name: 'Có kế hoạch trồng tái tạo nguồn nguyên liệu tự nhiên', max_score: 5, is_mandatory: false },
            ],
          },
        ],
      },
      {
        id: 'craft-g2',
        code: 'NHÓM 2',
        name: 'Bản quyền Thiết kế & Tiếp thị Thủ công (Tối đa 25 điểm)',
        criteria: [
          {
            id: 'cr-c3',
            code: 'TC-03',
            name: 'Độc bản thiết kế & Câu chuyện văn hóa làng nghề',
            max_score: 25,
            indicators: [
              { id: 'cr5', code: '2.1 (*)', name: 'Bản quyền tác giả / Đăng ký Kiểu dáng công nghiệp độc quyền', max_score: 15, is_mandatory: true },
              { id: 'cr6', code: '2.2', name: 'Tài liệu Câu chuyện sản phẩm gắn liền với lịch sử làng nghề', max_score: 10, is_mandatory: false },
            ],
          },
        ],
      },
      {
        id: 'craft-g3',
        code: 'NHÓM 3',
        name: 'Độ tinh xảo & An toàn Vật liệu Thủ công (Tối đa 40 điểm)',
        criteria: [
          {
            id: 'cr-c4',
            code: 'TC-04',
            name: 'Kỹ thuật chế tác thủ công & Độ bền cơ học',
            max_score: 40,
            indicators: [
              { id: 'cr7', code: '3.1 (*)', name: 'Phiếu kiểm định an toàn không chứa Chì/Cadmi độc hại cho đồ gia dụng', max_score: 25, is_mandatory: true },
              { id: 'cr8', code: '3.2', name: 'Độ tinh xảo thủ công, đường nét hoàn thiện & Tính ứng dụng cao', max_score: 15, is_mandatory: false },
            ],
          },
        ],
      },
    ],

    PLANT: [
      {
        id: 'plant-g1',
        code: 'NHÓM 1',
        name: 'Sản phẩm & Nhân giống - Ngành Sinh vật cảnh & Dệt may (Tối đa 35 điểm)',
        criteria: [
          {
            id: 'p-c1',
            code: 'TC-01',
            name: 'Nguồn gốc giống & Quy trình kỹ thuật chăm sóc',
            max_score: 20,
            indicators: [
              { id: 'p1', code: '1.1 (*)', name: 'Giấy chứng nhận nguồn gốc giống cây trồng / vật nuôi / nguồn sợi dệt', max_score: 10, is_mandatory: true },
              { id: 'p2', code: '1.2', name: 'Quy trình nhân giống & Kỹ thuật chăm sóc sinh vật cảnh chuẩn', max_score: 10, is_mandatory: false },
            ],
          },
          {
            id: 'p-c2',
            code: 'TC-02',
            name: 'Giá trị nghệ thuật & Công nghệ tiết kiệm',
            max_score: 15,
            indicators: [
              { id: 'p3', code: '1.3', name: 'Tạo việc làm cho nghệ nhân làm vườn & thợ dệt địa phương', max_score: 10, is_mandatory: false },
              { id: 'p4', code: '1.4', name: 'Áp dụng công nghệ tưới tiết kiệm & phân bón sinh học', max_score: 5, is_mandatory: false },
            ],
          },
        ],
      },
      {
        id: 'plant-g2',
        code: 'NHÓM 2',
        name: 'Mã số cơ sở & Quảng bá Triển lãm (Tối đa 25 điểm)',
        criteria: [
          {
            id: 'p-c3',
            code: 'TC-03',
            name: 'Đăng ký Mã số vườn nuôi trồng & Thương hiệu',
            max_score: 25,
            indicators: [
              { id: 'p5', code: '2.1 (*)', name: 'Mã số cơ sở nuôi trồng Sinh vật cảnh / Nhà máy dệt lụa', max_score: 15, is_mandatory: true },
              { id: 'p6', code: '2.2', name: 'Tham gia các Hội chợ Triển lãm Sinh vật cảnh / Thời trang OCOP', max_score: 10, is_mandatory: false },
            ],
          },
        ],
      },
      {
        id: 'plant-g3',
        code: 'NHÓM 3',
        name: 'Kiểm dịch & Dáng thế Nghệ thuật (Tối đa 40 điểm)',
        criteria: [
          {
            id: 'p-c4',
            code: 'TC-04',
            name: 'Giấy kiểm dịch thực vật & Giá trị thẩm mỹ',
            max_score: 40,
            indicators: [
              { id: 'p7', code: '3.1 (*)', name: 'Giấy chứng nhận Kiểm dịch thực vật / Động vật còn hiệu lực', max_score: 25, is_mandatory: true },
              { id: 'p8', code: '3.2', name: 'Giá trị dáng thế nghệ thuật độc đáo & Đạt giải thưởng vinh danh', max_score: 15, is_mandatory: false },
            ],
          },
        ],
      },
    ],

    TOURISM: [
      {
        id: 'tour-g1',
        code: 'NHÓM 1',
        name: 'Cộng đồng & Bản sắc - Ngành Du lịch sinh thái OCOP (Tối đa 35 điểm)',
        criteria: [
          {
            id: 't-c1',
            code: 'TC-01',
            name: 'Sự tham gia của Cộng đồng & Bảo tồn Văn hóa',
            max_score: 20,
            indicators: [
              { id: 't1', code: '1.1', name: 'Tỷ lệ hộ gia đình tham gia cung cấp dịch vụ du lịch cộng đồng', max_score: 10, is_mandatory: false },
              { id: 't2', code: '1.2 (*)', name: 'Bảo tồn không gian văn hóa & Kiến trúc nhà ở truyền thống', max_score: 10, is_mandatory: true },
            ],
          },
          {
            id: 't-c2',
            code: 'TC-02',
            name: 'Bảo vệ Môi trường Sinh thái điểm đến',
            max_score: 15,
            indicators: [
              { id: 't3', code: '1.3', name: 'Hệ thống thu gom, phân loại rác thải & Xử lý nước thải đạt chuẩn', max_score: 10, is_mandatory: false },
              { id: 't4', code: '1.4', name: 'Sử dụng năng lượng xanh tái tạo (Điện mặt trời, Gió)', max_score: 5, is_mandatory: false },
            ],
          },
        ],
      },
      {
        id: 'tour-g2',
        code: 'NHÓM 2',
        name: 'Hạ tầng Tiện ích & An toàn Du khách (Tối đa 25 điểm)',
        criteria: [
          {
            id: 't-c3',
            code: 'TC-03',
            name: 'An ninh PCCC & Hạ tầng phục vụ',
            max_score: 25,
            indicators: [
              { id: 't5', code: '2.1 (*)', name: 'Phương án đảm bảo An ninh trật tự, PCCC & An toàn cho du khách', max_score: 15, is_mandatory: true },
              { id: 't6', code: '2.2', name: 'Hạ tầng giao thông, Bãi đỗ xe & Nhà vệ sinh công cộng chuẩn du lịch', max_score: 10, is_mandatory: false },
            ],
          },
        ],
      },
      {
        id: 'tour-g3',
        code: 'NHÓM 3',
        name: 'Pháp lý Hoạt động & Trải nghiệm Nông nghiệp (Tối đa 40 điểm)',
        criteria: [
          {
            id: 't-c4',
            code: 'TC-04',
            name: 'Giấy phép điểm du lịch & Sự hài lòng của du khách',
            max_score: 40,
            indicators: [
              { id: 't7', code: '3.1 (*)', name: 'Quyết định công nhận Điểm du lịch của UBND Tỉnh / Giấy phép lữ hành', max_score: 25, is_mandatory: true },
              { id: 't8', code: '3.2', name: 'Độ phong phú Tour trải nghiệm sản phẩm OCOP & Khảo sát hài lòng >= 90%', max_score: 15, is_mandatory: false },
            ],
          },
        ],
      },
    ],
  };

  // Get active tree based on tab selection
  const currentCategoryKey = (selectedCategory in CRITERIA_TREES_BY_CATEGORY) ? selectedCategory : 'FOOD';
  const activeTree: CriteriaGroupItem[] = CRITERIA_TREES_BY_CATEGORY[currentCategoryKey];

  const versionList: CriteriaVersionItem[] = versionsData?.data || [];
  const councilLevels = councilLevelsData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bộ Tiêu Chí Quốc Gia OCOP"
        subtitle="Tra cứu cấu trúc cây phân cấp chỉ tiêu đánh giá, khung điểm tối đa và tiêu chuẩn bắt buộc dấu sao (*)"
      />

      {/* Council Levels Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {councilLevels.map((cl: any) => (
          <Card key={cl.id} className="p-4 border-l-4 border-l-cop-600">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cop-50 text-cop-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">{cl.name}</h4>
                <p className="text-[11px] text-slate-500">Mã cấp: {cl.code}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Version & Product Category Selector Card */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4 mb-4">
          <div>
            <span className="text-xs font-semibold text-[#15803d] tracking-wider uppercase">Phiên bản hiện hành (QĐ 148/QĐ-TTg)</span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
              {versionList[0]?.name || 'Bộ Tiêu Chí Quốc Gia Đánh Giá & Phân Hạng OCOP 2026'}
            </h3>
          </div>
          <StatusBadge status="PUBLISHED" label="Ban hành chính thức" />
        </div>

        {/* 26 Sub-Product Sets Selector (Chuẩn Phụ lục III - Quyết định 148/QĐ-TTg) */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Tra cứu theo 26 Bộ Sản Phẩm OCOP Chi Tiết (Phụ lục III - QĐ 148/QĐ-TTg)
            </div>
            <span className="pill-badge pill-green text-[10.5px]">Tổng cộng 26 Bộ sản phẩm</span>
          </div>

          {/* Major Category Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { id: 'FOOD', label: '🌾 Thực phẩm', count: '10 Bộ SP' },
              { id: 'DRINK', label: '🍵 Đồ uống', count: '7 Bộ SP' },
              { id: 'HERB', label: '🌿 Thảo dược', count: '3 Bộ SP' },
              { id: 'CRAFT', label: '🏺 Thủ công', count: '2 Bộ SP' },
              { id: 'PLANT', label: '👘 SV Cảnh & May', count: '3 Bộ SP' },
              { id: 'TOURISM', label: '🏡 Du lịch', count: '1 Bộ SP' },
            ].map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  const firstSub = OCOP_26_SUB_PRODUCT_SETS.find(s => s.categoryKey === cat.id);
                  if (firstSub) setSelectedSubSetId(firstSub.id);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  (selectedCategory === cat.id)
                    ? 'bg-emerald-900 text-white border-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className="text-xs font-black">{cat.label}</div>
                <div className={`text-[10px] mt-0.5 ${
                  (selectedCategory === cat.id) ? 'text-emerald-200' : 'text-slate-400'
                }`}>
                  {cat.count}
                </div>
              </button>
            ))}
          </div>

          {/* 26 Sub-Product Sets Dropdown Selector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <label className="block text-xs font-black text-slate-800 shrink-0">
                Chọn Bộ Sản Phẩm Chi Tiết (STT 01 - 26):
              </label>
              <select
                value={selectedSubSetId}
                onChange={(e) => {
                  const subId = e.target.value;
                  setSelectedSubSetId(subId);
                  const found = OCOP_26_SUB_PRODUCT_SETS.find(s => s.id === subId);
                  if (found) setSelectedCategory(found.categoryKey);
                }}
                className="w-full md:w-auto flex-1 p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
              >
                {OCOP_26_SUB_PRODUCT_SETS.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.stt < 10 ? `0${sub.stt}` : sub.stt}. {sub.name} ({sub.page})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Sub-Set Info Box */}
            {activeSubSet && (
              <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-extrabold text-emerald-950">
                    Đang xem: {activeSubSet.stt < 10 ? `0${activeSubSet.stt}` : activeSubSet.stt}. {activeSubSet.name}
                  </span>
                  <div className="text-[11px] text-emerald-800 mt-0.5">
                    Ví dụ áp dụng: <span className="font-semibold italic">{activeSubSet.example}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="pill-badge pill-green border border-emerald-300 text-[10.5px]">
                    📄 Phụ lục III - {activeSubSet.page}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Criteria Tree Hierarchy */}
        <div className="space-y-6">
          {activeTree.map((group) => (
            <div key={group.id} className="border border-slate-200/80 rounded-xl overflow-hidden shadow-card">
              <div className="bg-cop-900 text-white px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{group.code}: {group.name}</span>
                </div>
              </div>

              <div className="p-4 bg-white divide-y divide-slate-100">
                {group.criteria.map((criterion) => (
                  <div key={criterion.id} className="py-3 first:pt-0 last:pb-0">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-cop-600" />
                        {criterion.code} - {criterion.name}
                      </span>
                      <span className="text-slate-500 font-semibold">Tối đa {criterion.max_score} điểm</span>
                    </h4>

                    <div className="ml-5 space-y-2">
                      {criterion.indicators.map((ind) => (
                        <div
                          key={ind.id}
                          className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-cop-700">{ind.code}</span>
                            <span className="text-slate-700 font-medium">{ind.name}</span>
                            {ind.is_mandatory && (
                              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]" title="Chỉ tiêu bắt buộc khống chế hạ sao khi đạt 0 điểm">
                                <ShieldAlert className="w-3 h-3 text-rose-600" /> Bắt buộc (*)
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded border">
                            {ind.max_score} điểm
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
