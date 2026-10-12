// Master Dataset and Logic for OCOP QĐ 148/QĐ-TTg (Fresh Produce - Ớt chuông Sweet Palermo Đỏ Đà Lạt)

export interface ScoringOption {
  score: number;
  label: string;
  description: string;
  farmerNote: string;
}

export interface CriterionIndicator {
  code: string; // e.g. TC-A.1.1
  criterionCode: string; // TC-A.1
  criterionName: string;
  name: string;
  groupCode: 'GA' | 'GB' | 'GC';
  groupName: string;
  maxScore: number;
  isMandatory: boolean;
  mandatoryReason?: string;
  options: ScoringOption[];
  plainExplanation: {
    term: string;
    explanation: string;
    farmerAdvice: string;
    exampleEvidence: string;
  };
  smartSuggestion: {
    suggestedScore: number;
    reason: string;
    dataSource: string;
    evidenceTitle: string;
  };
}

export interface CriteriaGroup {
  code: 'GA' | 'GB' | 'GC';
  name: string;
  fullName: string;
  maxScore: number;
  indicators: CriterionIndicator[];
}

export const OCOP_QD148_CRITERIA_DATA: CriteriaGroup[] = [
  {
    code: 'GA',
    name: 'Phần A',
    fullName: 'Sản phẩm và sức mạnh cộng đồng',
    maxScore: 40.0,
    indicators: [
      {
        code: 'TC-A.1.1',
        criterionCode: 'TC-A.1',
        criterionName: 'Nguồn nguyên liệu địa phương',
        name: 'Tỷ lệ sử dụng nguyên liệu địa phương trong tỉnh',
        groupCode: 'GA',
        groupName: 'Sản phẩm và sức mạnh cộng đồng',
        maxScore: 10.0,
        isMandatory: true,
        mandatoryReason: 'Bắt buộc đạt tối thiểu 5.0đ (>=50% nguyên liệu địa phương) đối với 3 sao và 7.0đ (>=70%) đối với 4 sao.',
        options: [
          { score: 10.0, label: '100% nguyên liệu địa phương', description: 'Toàn bộ ớt chuông trồng tại vùng canh tác địa phương (Lâm Đồng)', farmerNote: 'Toàn bộ ớt thu hoạch từ 280 ha nhà kính của xã viên tại Đà Lạt & Lạc Dương' },
          { score: 7.0, label: 'Từ 70% đến dưới 100%', description: 'Nguyên liệu thu mua nội tỉnh đạt trên 70%', farmerNote: 'Phần lớn từ vùng trồng của HTX, có mua thêm một phần nhỏ ngoài tỉnh' },
          { score: 5.0, label: 'Từ 50% đến dưới 70%', description: 'Nguyên liệu nội tỉnh đạt từ 50% trở lên', farmerNote: 'Khoảng một nửa ớt từ địa phương' },
          { score: 1.0, label: 'Dưới 50% nguyên liệu', description: 'Chủ yếu nhập từ vùng khác ngoài tỉnh', farmerNote: 'Chỉ có ít ớt trồng tại địa phương' },
          { score: 0.0, label: 'Không sử dụng nguyên liệu địa phương', description: '100% nhập khẩu hoặc tỉnh khác', farmerNote: 'Không có diện tích trồng tại Lâm Đồng' },
        ],
        plainExplanation: {
          term: 'Nguyên liệu địa phương (Vùng trồng)',
          explanation: 'Là diện tích đất và sản lượng nông sản được thu hoạch trực tiếp tại các xã/huyện thuộc tỉnh Lâm Đồng do các hộ xã viên HTX canh tác.',
          farmerAdvice: 'Bà con chỉ cần đính kèm Bản đồ số hóa vùng trồng và Danh sách 165 hộ xã viên giao khoán diện tích.',
          exampleEvidence: 'Trích lục bản đồ vùng trồng 280 ha & Danh sách hộ xã viên HTX Tân Tiến',
        },
        smartSuggestion: {
          suggestedScore: 10.0,
          reason: 'Hệ thống đối soát 100% diện tích (280 ha) thuộc Tổ Hòn Bồ (Đà Lạt) và Đạ Sar (Lạc Dương), sản lượng 4.720 tấn/năm hoàn toàn nội tỉnh.',
          dataSource: 'Module Vùng trồng (FarmPlots) & Xã viên (Members)',
          evidenceTitle: 'Trích lục bản đồ số hóa 280 ha vùng trồng HTX Tân Tiến',
        },
      },
      {
        code: 'TC-A.2.1',
        criterionCode: 'TC-A.2',
        criterionName: 'Sử dụng lao động tại chỗ',
        name: 'Tỷ lệ lao động địa phương có việc làm và thu nhập ổn định',
        groupCode: 'GA',
        groupName: 'Sản phẩm và sức mạnh cộng đồng',
        maxScore: 5.0,
        isMandatory: false,
        options: [
          { score: 5.0, label: 'Từ 80% trở lên là lao động địa phương', description: 'Đa số lao động thường trú tại địa phương có hợp đồng và bảo hiểm', farmerNote: '165 hộ thành viên và 48 công nhân đóng gói đều là bà con sinh sống tại địa phương' },
          { score: 3.0, label: 'Từ 50% đến dưới 80%', description: 'Từ một nửa đến dưới 80% là người dân địa phương', farmerNote: 'Có thuê thêm nhân công thời vụ từ các tỉnh khác' },
          { score: 1.0, label: 'Dưới 50% lao động địa phương', description: 'Chủ yếu thuê lao động ngoại tỉnh', farmerNote: 'Ít lao động thường trú' },
          { score: 0.0, label: 'Không có lao động địa phương', description: 'Toàn bộ nhân công từ nơi khác', farmerNote: 'Chưa tạo việc làm cho bà con tại chỗ' },
        ],
        plainExplanation: {
          term: 'Lao động địa phương',
          explanation: 'Bà con nông dân, xã viên có hộ khẩu thường trú hoặc tạm trú dài hạn trên địa bàn, trực tiếp làm việc tại vườn hoặc xưởng đóng gói.',
          farmerAdvice: 'HTX đã có sẵn bảng lương và danh sách thành viên trong hệ thống quản trị, chỉ cần 1 cú click là trích xuất được.',
          exampleEvidence: 'Danh sách 165 xã viên & Bảng chi trả tiền thu mua nông sản',
        },
        smartSuggestion: {
          suggestedScore: 5.0,
          reason: '165/165 hộ xã viên và 48 công nhân sơ chế thường trú 100% tại Phường 12 Đà Lạt và Đạ Sar, thu nhập bình quân 12.5 triệu đồng/tháng.',
          dataSource: 'Module Thành viên HTX (Members) & Quản lý Nhân sự',
          evidenceTitle: 'Danh sách 165 thành viên có xác nhận của UBND địa phương',
        },
      },
      {
        code: 'TC-A.3.1',
        criterionCode: 'TC-A.3',
        criterionName: 'Tổ chức sản xuất & liên kết chuỗi',
        name: 'Năng lực liên kết chuỗi giá trị tiêu thụ nông sản ổn định',
        groupCode: 'GA',
        groupName: 'Sản phẩm và sức mạnh cộng đồng',
        maxScore: 10.0,
        isMandatory: false,
        options: [
          { score: 10.0, label: 'Hợp đồng liên kết bao tiêu ổn định >= 50% sản lượng', description: 'Có hợp đồng dài hạn với chuỗi siêu thị/đối tác lớn bao tiêu ổn định', farmerNote: 'Có hợp đồng bao tiêu toàn diện với WinMart, Co.opmart sản lượng 4.720 tấn/năm' },
          { score: 7.0, label: 'Hợp đồng liên kết bao tiêu từng vụ', description: 'Ký kết theo từng vụ mùa thu hoạch', farmerNote: 'Bao tiêu theo mùa vụ, giá biến động theo thị trường' },
          { score: 3.0, label: 'Liên kết lỏng lẻo qua thương lái', description: 'Thỏa thuận miệng hoặc thu mua nhỏ lẻ', farmerNote: 'Bán qua đầu nậu, chưa có hợp đồng kinh tế chặt chẽ' },
          { score: 0.0, label: 'Tự sản tự tiêu, không có liên kết', description: 'Chưa có đầu ra ổn định', farmerNote: 'Chưa có hợp đồng phân phối' },
        ],
        plainExplanation: {
          term: 'Liên kết chuỗi giá trị (Hợp đồng bao tiêu)',
          explanation: 'Là văn bản ký kết giữa HTX với hệ thống bán lẻ/siêu thị cam kết thu mua ớt chuông với khối lượng và tiêu chuẩn chất lượng ổn định.',
          farmerAdvice: 'Hợp đồng này chứng minh quả ớt của bà con có đầu ra vững chắc, không lo cảnh được mùa mất giá.',
          exampleEvidence: 'Hợp đồng cung ứng nông sản với WinCommerce & Saigon Co.op',
        },
        smartSuggestion: {
          suggestedScore: 10.0,
          reason: 'HTX có hợp đồng thương mại dài hạn 3 năm với WinMart và Co.opmart bao tiêu 4.720 tấn/năm, giá sàn bảo hiểm cho xã viên.',
          dataSource: 'Module Thu mua (Purchases) & Hợp đồng Thương mại',
          evidenceTitle: 'Hợp đồng bao tiêu ớt chuông với WinCommerce & Saigon Co.op',
        },
      },
      {
        code: 'TC-A.4.1',
        criterionCode: 'TC-A.4',
        criterionName: 'Bảo vệ môi trường trong sản xuất',
        name: 'Cam kết BVMT & Quy trình xử lý, tái chế phụ phẩm hữu cơ',
        groupCode: 'GA',
        groupName: 'Sản phẩm và sức mạnh cộng đồng',
        maxScore: 15.0,
        isMandatory: true,
        mandatoryReason: 'Bắt buộc đạt tối thiểu 8.0đ và có văn bản cam kết bảo vệ môi trường được cấp thẩm quyền xác nhận.',
        options: [
          { score: 15.0, label: 'Quy trình xử lý hoàn chỉnh, khép kín, đạt chuẩn BVMT', description: 'Có bể thu gom bao gói thuốc BVTV, ủ phân hữu cơ vi sinh từ phụ phẩm cây ớt', farmerNote: 'Nhà kính có bể gom rác BVTV riêng, thân lá ớt sau vụ được ủ thành phân vi sinh bón lại đất' },
          { score: 12.0, label: 'Đạt yêu cầu BVMT, có thu gom phụ phẩm', description: 'Có ký cam kết BVMT và xử lý rác thải đúng quy định', farmerNote: 'Có bể rác đạt chuẩn, phụ phẩm được thu gom định kỳ' },
          { score: 8.0, label: 'Có cam kết BVMT cơ bản', description: 'Có thực hiện các biện pháp vệ sinh đồng ruộng', farmerNote: 'Có dọn dẹp vườn, rác thải chuyển cho đơn vị vệ sinh' },
          { score: 0.0, label: 'Chưa có biện pháp BVMT', description: 'Xả thải trực tiếp ra môi trường', farmerNote: 'Chưa xử lý vỏ thuốc và tàn dư cây trồng' },
        ],
        plainExplanation: {
          term: 'Bảo vệ môi trường & Xử lý phụ phẩm',
          explanation: 'Các biện pháp thu gom vỏ chai thuốc BVTV vào bể chứa xi măng an toàn và tận dụng thân cây ớt thải loại để ủ phân compost hữu cơ vi sinh.',
          farmerAdvice: 'Bà con chỉ cần chụp ảnh bể chứa bao gói BVTV tại vườn và quy trình ủ bã ớt hữu cơ của HTX.',
          exampleEvidence: 'Biên bản cam kết BVMT UBND Phường 12 & Ảnh thực tế bể gom rác BVTV',
        },
        smartSuggestion: {
          suggestedScore: 15.0,
          reason: 'HTX đã hoàn tất Đề án BVMT được cấp phép, có 12 bể bê tông thu gom bao bì BVTV và dây chuyền ủ phân Trichoderma khép kín.',
          dataSource: 'Hồ sơ pháp lý môi trường & Nhật ký xử lý phụ phẩm nông nghiệp',
          evidenceTitle: 'Kế hoạch bảo vệ môi trường số 14/KH-UBND và quy trình ủ phân vi sinh',
        },
      },
    ],
  },
  {
    code: 'GB',
    name: 'Phần B',
    fullName: 'Khả năng tiếp thị',
    maxScore: 25.0,
    indicators: [
      {
        code: 'TC-B.1.1',
        criterionCode: 'TC-B.1',
        criterionName: 'Tiếp thị & Quảng bá sản phẩm',
        name: 'Hệ thống kênh phân phối và thị trường tiêu thụ sản phẩm',
        groupCode: 'GB',
        groupName: 'Khả năng tiếp thị',
        maxScore: 8.0,
        isMandatory: false,
        options: [
          { score: 8.0, label: 'Phân phối chuỗi siêu thị toàn quốc & sàn TMĐT OCOP', description: 'Sản phẩm có mặt tại hệ thống bán lẻ hiện đại đa tỉnh thành và sàn số', farmerNote: 'Ớt chuông Sweet Palermo có mặt tại hơn 150 siêu thị WinMart, Bách Hóa Xanh và sàn PostMart' },
          { score: 5.0, label: 'Phân phối cấp vùng/tỉnh', description: 'Bán tại các cửa hàng nông sản sạch nội tỉnh và lân cận', farmerNote: 'Bán tại Đà Lạt, TP.HCM và các tỉnh Đông Nam Bộ' },
          { score: 2.0, label: 'Kênh bán lẻ truyền thống tại địa phương', description: 'Chợ đầu mối, sạp rau địa phương', farmerNote: 'Bán lẻ tại chợ Đà Lạt và các điểm du lịch' },
          { score: 0.0, label: 'Chưa có kênh phân phối ổn định', description: 'Chưa đưa hàng vào hệ thống bán lẻ', farmerNote: 'Bán tự do khi có khách hỏi mua' },
        ],
        plainExplanation: {
          term: 'Hệ thống phân phối thương mại',
          explanation: 'Là mạng lưới các cửa hàng, chuỗi siêu thị, sàn thương mại điện tử đưa sản phẩm ớt chuông của HTX đến tận tay người tiêu dùng cả nước.',
          farmerAdvice: 'Các hóa đơn xuất bán cho siêu thị và ảnh quầy kệ trưng bày sản phẩm là minh chứng tốt nhất.',
          exampleEvidence: 'Hóa đơn GTGT cung ứng chuỗi siêu thị & Gian hàng OCOP số',
        },
        smartSuggestion: {
          suggestedScore: 8.0,
          reason: 'Phân phối toàn quốc qua chuỗi WinMart, Bách Hóa Xanh, Co.opmart và sàn thương mại OCOP Lâm Đồng với doanh số 48.5 tỷ đồng/năm.',
          dataSource: 'Module Bán hàng (Sales) & Hóa đơn điện tử VAT',
          evidenceTitle: 'Bộ hóa đơn xuất bán siêu thị & Hợp đồng niêm yết sàn TMĐT OCOP',
        },
      },
      {
        code: 'TC-B.1.2',
        criterionCode: 'TC-B.1',
        criterionName: 'Tiếp thị & Quảng bá sản phẩm',
        name: 'Bao bì đóng gói & Tem nhãn truy xuất nguồn gốc QR Code',
        groupCode: 'GB',
        groupName: 'Khả năng tiếp thị',
        maxScore: 7.0,
        isMandatory: true,
        mandatoryReason: 'Bắt buộc phải có tem nhãn kèm mã QR liên kết mã lô (lot_id) truy xuất nguồn gốc trên hệ thống số.',
        options: [
          { score: 7.0, label: 'Bao bì chuẩn NĐ 43/2017 & TT 02/2024, có tem QR mã lô GS1', description: 'Bao bì thân thiện môi trường, đầy đủ thông tin bắt buộc, quét QR ra nhật ký lô', farmerNote: 'Đóng khay giấy tự hủy 500g, dán tem QR GS1 quét ra ngay vườn nào trồng, ngày thu hoạch' },
          { score: 5.0, label: 'Bao bì có tem QR cơ bản', description: 'Bao bì in đẹp, có tem QR liên kết website HTX', farmerNote: 'Có tem nhãn và mã QR giới thiệu HTX' },
          { score: 2.0, label: 'Chỉ có nhãn mác giấy thông thường', description: 'Nhãn in thông tin cơ bản, chưa có mã QR truy xuất', farmerNote: 'Chỉ dán decal tên HTX và số điện thoại' },
          { score: 0.0, label: 'Bao bì trơn, không có nhãn mác', description: 'Đóng thùng carton/sọt không tem nhãn', farmerNote: 'Chưa có bao bì thương hiệu' },
        ],
        plainExplanation: {
          term: 'Tem QR truy xuất nguồn gốc (Mã lô GS1)',
          explanation: 'Con tem dán trên túi ớt, người mua dùng điện thoại quét vào sẽ thấy tên xã viên, thửa đất trồng, ngày bón phân, ngày thu hoạch và kết quả kiểm nghiệm.',
          farmerAdvice: 'Hệ thống đã tự động sinh tem QR cho từng lô thu mua của bà con, chỉ cần tải tệp thiết kế bao bì lên.',
          exampleEvidence: 'Bản thiết kế bao bì khay giấy & File mẫu tem QR truy xuất nguồn gốc',
        },
        smartSuggestion: {
          suggestedScore: 7.0,
          reason: 'Bao bì khay giấy tự hủy 500g đạt chuẩn Nghị định 43/2017, tích hợp tem QR GS1 động liên kết trực tiếp mã lô truy xuất 10 trường dữ liệu.',
          dataSource: 'Module Truy xuất nguồn gốc (Traceability) & Thiết kế bao bì',
          evidenceTitle: 'Mẫu tem QR GS1 và hình ảnh bao bì thương phẩm Ớt Sweet Palermo',
        },
      },
      {
        code: 'TC-B.2.1',
        criterionCode: 'TC-B.2',
        criterionName: 'Câu chuyện về sản phẩm',
        name: 'Nội dung và hình thức thể hiện Câu chuyện sản phẩm OCOP',
        groupCode: 'GB',
        groupName: 'Khả năng tiếp thị',
        maxScore: 10.0,
        isMandatory: false,
        options: [
          { score: 10.0, label: 'Câu chuyện độc đáo, có tư liệu ảnh/video truyền thông', description: 'Khắc họa di sản rau Đà Lạt, sự kỳ công chăm sóc giống Sweet Palermo', farmerNote: 'Câu chuyện "Vị ngọt từ sương sớm Đà Lạt" kèm video phóng sự VTV và ảnh chuyên nghiệp' },
          { score: 8.0, label: 'Câu chuyện hay, đầy đủ ý nghĩa địa phương', description: 'Bài viết thuyết minh xúc động về hành trình canh tác của nông dân', farmerNote: 'Bài viết 3 trang kể về quá trình bà con chuyển đổi từ rau truyền thống sang ớt hoa quả' },
          { score: 5.0, label: 'Câu chuyện đơn giản', description: 'Mô tả nguồn gốc giống và quy trình trồng cơ bản', farmerNote: 'Giới thiệu ngắn gọn về giống ớt và công dụng' },
          { score: 1.0, label: 'Sơ sài, chỉ có vài dòng', description: 'Chưa làm nổi bật được giá trị sản phẩm', farmerNote: 'Chỉ có mô tả ngắn vài câu' },
        ],
        plainExplanation: {
          term: 'Câu chuyện sản phẩm (Storytelling)',
          explanation: 'Là bài viết và hình ảnh kể lại hành trình tâm huyết của người nông dân Tân Tiến đưa giống ớt ngọt châu Âu về thích nghi với thổ nhưỡng sương mù Đà Lạt.',
          farmerAdvice: 'Đây là linh hồn của hồ sơ OCOP, giúp sản phẩm có giá trị cảm xúc và chạm đến trái tim người tiêu dùng.',
          exampleEvidence: 'Bản thuyết minh Câu chuyện sản phẩm & Video phóng sự nông sản',
        },
        smartSuggestion: {
          suggestedScore: 8.5,
          reason: 'Có bản thuyết minh hoàn chỉnh "Hương vị ngọt thanh từ vùng đất sương mù Hòn Bồ" kèm phóng sự truyền hình VTV9 và bộ ảnh chuyên đề nông sản.',
          dataSource: 'Tài liệu tiếp thị OCOP & Video phóng sự truyền thông',
          evidenceTitle: 'Tập bài viết Thuyết minh Câu chuyện sản phẩm ớt Sweet Palermo Đỏ',
        },
      },
    ],
  },
  {
    code: 'GC',
    name: 'Phần C',
    fullName: 'Chất lượng sản phẩm',
    maxScore: 35.0,
    indicators: [
      {
        code: 'TC-C.1.1',
        criterionCode: 'TC-C.1',
        criterionName: 'Chỉ tiêu cảm quan, dinh dưỡng & độc đáo',
        name: 'Chỉ tiêu cảm quan, độ ngọt Brix & phiếu kiểm nghiệm dinh dưỡng',
        groupCode: 'GC',
        groupName: 'Chất lượng sản phẩm',
        maxScore: 10.0,
        isMandatory: false,
        options: [
          { score: 10.0, label: 'Độ ngọt Brix >= 8, giàu Vitamin C, kiểm nghiệm ISO 17025', description: 'Chỉ tiêu dinh dưỡng vượt trội, có phiếu kiểm nghiệm phòng lab chuẩn quốc tế', farmerNote: 'Độ Brix đạt 9.2, trái đỏ mọng bóng bẩy, phiếu kiểm nghiệm Quatest 3 chứng nhận hàm lượng Vitamin C cao gấp 3 lần cam' },
          { score: 8.0, label: 'Đạt chỉ tiêu dinh dưỡng và cảm quan tốt', description: 'Độ Brix từ 7 đến dưới 8, trái giòn ngọt đặc trưng', farmerNote: 'Ớt giòn ngọt, hình thức đẹp, có phiếu kiểm nghiệm dinh dưỡng hợp lệ' },
          { score: 5.0, label: 'Chất lượng trung bình', description: 'Độ Brix từ 6 đến dưới 7, vị ngọt nhẹ', farmerNote: 'Chất lượng đồng đều nhưng độ ngọt ở mức vừa phải' },
          { score: 0.0, label: 'Chưa kiểm nghiệm dinh dưỡng', description: 'Chưa gửi mẫu phân tích phòng thí nghiệm', farmerNote: 'Chưa có phiếu phân tích thành phần' },
        ],
        plainExplanation: {
          term: 'Độ Brix & Phiếu kiểm nghiệm ISO 17025',
          explanation: 'Độ Brix là thước đo độ ngọt tự nhiên của quả ớt (ớt Palermo ngọt như trái cây). Phiếu kiểm nghiệm do trung tâm uy tín cấp chứng minh dinh dưỡng an toàn.',
          farmerAdvice: 'Bà con không cần lo lắng, HTX đã đem mẫu ớt đi kiểm nghiệm tại Quatest 3 và lưu sẵn kết quả trên hệ thống.',
          exampleEvidence: 'Phiếu kết quả thử nghiệm Quatest 3 / Eurofins số KT3-04128/2025',
        },
        smartSuggestion: {
          suggestedScore: 10.0,
          reason: 'Độ ngọt Brix trung bình đạt 9.2 (yêu cầu >=8.0), kiểm nghiệm Quatest 3 xác nhận Vitamin C 185mg/100g, màu đỏ tự nhiên đồng đều 98%.',
          dataSource: 'Module Quản lý Chất lượng (KCS) & Phiếu kiểm nghiệm Quatest 3',
          evidenceTitle: 'Phiếu kiểm nghiệm thành phần dinh dưỡng Quatest 3 số KT3-04128',
        },
      },
      {
        code: 'TC-C.2.1',
        criterionCode: 'TC-C.2',
        criterionName: 'Tiêu chuẩn chất lượng & ATTP',
        name: 'Chứng nhận tiêu chuẩn chất lượng VietGAP / GlobalGAP',
        groupCode: 'GC',
        groupName: 'Chất lượng sản phẩm',
        maxScore: 10.0,
        isMandatory: true,
        mandatoryReason: 'Điều kiện khống chế cứng: Bắt buộc phải có Giấy chứng nhận VietGAP còn hiệu lực để đạt OCOP 4 sao.',
        options: [
          { score: 10.0, label: 'Có Giấy chứng nhận VietGAP còn hiệu lực (đến 2027)', description: 'Toàn bộ vùng trồng và sơ chế đạt chuẩn VietGAP đánh giá định kỳ', farmerNote: 'Giấy chứng nhận VietGAP số VICB-2024-GAP-0128 còn hạn đến năm 2027 cho toàn bộ 280 ha' },
          { score: 5.0, label: 'Giấy chứng nhận đang trong thời gian tái đánh giá', description: 'Đã nộp hồ sơ gia hạn hoặc đánh giá mở rộng', farmerNote: 'Đang làm thủ tục tái cấp chứng nhận VietGAP' },
          { score: 0.0, label: 'Chưa có chứng nhận VietGAP', description: 'Không đủ điều kiện xét 4 sao OCOP', farmerNote: 'Chưa được cấp chứng nhận an toàn' },
        ],
        plainExplanation: {
          term: 'Chứng nhận VietGAP (Nông nghiệp tốt)',
          explanation: 'Là chứng chỉ do tổ chức độc lập cấp xác nhận HTX tuân thủ nghiêm ngặt quy trình bón phân, phun thuốc, nước tưới sạch và vệ sinh nhà kính.',
          farmerAdvice: 'Đây là "giấy thông hành" quan trọng nhất để hồ sơ đạt 4 sao OCOP.',
          exampleEvidence: 'Bản scan Giấy chứng nhận VietGAP số VICB-2024-GAP-0128',
        },
        smartSuggestion: {
          suggestedScore: 10.0,
          reason: 'Giấy chứng nhận VietGAP số VICB-2024-GAP-0128 do Tổ chức VICB cấp cho HTX Tân Tiến còn hiệu lực đến ngày 25/11/2027.',
          dataSource: 'Module Kho Chứng chỉ (Certificates) & Hồ sơ pháp lý',
          evidenceTitle: 'Giấy chứng nhận VietGAP VICB-2024-GAP-0128 (hiệu lực 2024-2027)',
        },
      },
      {
        code: 'TC-C.2.2',
        criterionCode: 'TC-C.2',
        criterionName: 'Tiêu chuẩn chất lượng & ATTP',
        name: 'Kiểm soát tồn dư thuốc BVTV & Tuân thủ thời gian cách ly PHI',
        groupCode: 'GC',
        groupName: 'Chất lượng sản phẩm',
        maxScore: 5.0,
        isMandatory: true,
        mandatoryReason: 'Bắt buộc 100% lô xuất kho phải tuân thủ thời gian cách ly PHI, không được có dư lượng chất cấm.',
        options: [
          { score: 5.0, label: 'Tuân thủ 100% thời gian cách ly PHI, âm tính chất cấm', description: 'Nhật ký điện tử ghi nhận cách ly đủ ngày, kiểm nghiệm không tồn dư BVTV', farmerNote: '100% xã viên ghi nhật ký trên ứng dụng, hệ thống cảnh báo đủ ngày cách ly mới cho hái' },
          { score: 3.0, label: 'Đạt ngưỡng an toàn nhưng sổ nhật ký còn thiếu sót', description: 'Kết quả kiểm tra an toàn nhưng nhật ký chưa ghi chép đầy đủ', farmerNote: 'Nông sản an toàn nhưng bà con có lúc quên ghi chép sổ xịt thuốc' },
          { score: 0.0, label: 'Vi phạm thời gian cách ly hoặc có tồn dư BVTV', description: 'Bị cảnh báo vi phạm an toàn thực phẩm', farmerNote: 'Không tuân thủ thời gian cách ly PHI' },
        ],
        plainExplanation: {
          term: 'Thời gian cách ly PHI (Pre-Harvest Interval)',
          explanation: 'Là khoảng thời gian bắt buộc tính từ lần phun thuốc BVTV sinh học cuối cùng cho đến ngày hái quả (thường 7-14 ngày) để thuốc phân hủy hết.',
          farmerAdvice: 'Bà con bấm nút theo dõi PHI trên điện thoại, máy báo màu xanh an toàn thì mới được ra vườn thu hoạch.',
          exampleEvidence: 'Nhật ký phun xịt & Phiếu kiểm tra dư lượng thuốc BVTV trước thu hoạch',
        },
        smartSuggestion: {
          suggestedScore: 5.0,
          reason: '100% nhật ký canh tác ghi chép điện tử, thuật toán tự động kiểm tra khoảng cách ngày cách ly PHI đạt tỷ lệ tuân thủ 100%, 0 vi phạm.',
          dataSource: 'Module Nhật ký canh tác (FarmingLogs) & Tính toán PHI (PhiCalculator)',
          evidenceTitle: 'Báo cáo trích xuất kiểm soát thời gian cách ly PHI và xét nghiệm dư lượng',
        },
      },
      {
        code: 'TC-C.3.1',
        criterionCode: 'TC-C.3',
        criterionName: 'Sở hữu trí tuệ & Nhãn hiệu bảo hộ',
        name: 'Quyền sử dụng Nhãn hiệu chứng nhận / Văn bằng bảo hộ sở hữu trí tuệ',
        groupCode: 'GC',
        groupName: 'Chất lượng sản phẩm',
        maxScore: 10.0,
        isMandatory: false,
        options: [
          { score: 10.0, label: 'Được cấp quyền sử dụng nhãn hiệu chứng nhận "Rau Đà Lạt"', description: 'Có quyết định cho phép sử dụng nhãn hiệu địa phương uy tín hoặc nhãn riêng', farmerNote: 'Được UBND TP. Đà Lạt cấp quyền sử dụng thương hiệu "Đà Lạt - Kết tinh kỳ diệu từ đất lành" và nhãn hiệu "Rau Đà Lạt"' },
          { score: 6.0, label: 'Đã nộp đơn hợp lệ chờ cấp văn bằng', description: 'Đã có chấp nhận đơn hợp lệ từ Cục Sở hữu Trí tuệ', farmerNote: 'Đã nộp đơn bảo hộ nhãn hiệu riêng, đang chờ cấp bằng' },
          { score: 0.0, label: 'Chưa đăng ký sở hữu trí tuệ', description: 'Chưa nộp đơn bảo hộ nhãn hiệu', farmerNote: 'Chưa có văn bằng bảo hộ nhãn hiệu' },
        ],
        plainExplanation: {
          term: 'Nhãn hiệu chứng nhận "Rau Đà Lạt"',
          explanation: 'Là thương hiệu danh giá do chính quyền địa phương quản lý, chỉ trao cho các chủ thể đáp ứng các tiêu chuẩn chất lượng khắt khe nhất.',
          farmerAdvice: 'Sản phẩm có logo nhãn hiệu chứng nhận sẽ tạo niềm tin tuyệt đối với người tiêu dùng và hội đồng thẩm định.',
          exampleEvidence: 'Giấy chứng nhận quyền sử dụng nhãn hiệu chứng nhận "Rau Đà Lạt"',
        },
        smartSuggestion: {
          suggestedScore: 10.0,
          reason: 'HTX Tân Tiến được cấp Giấy chứng nhận quyền sử dụng nhãn hiệu chứng nhận "Rau Đà Lạt" số 245/QĐ-SHTT do Sở KH&CN Lâm Đồng cấp.',
          dataSource: 'Module Sở hữu trí tuệ & Văn bằng chứng nhận',
          evidenceTitle: 'Giấy chứng nhận quyền sử dụng nhãn hiệu chứng nhận "Rau Đà Lạt"',
        },
      },
    ],
  },
];

// Helper to flatten all 11 indicators
export const ALL_INDICATORS: CriterionIndicator[] = OCOP_QD148_CRITERIA_DATA.flatMap(g => g.indicators);

// Default self scores for Sweet Palermo (Matches exemplary 4-star benchmark = 98.5 / 100)
export const DEFAULT_SUGGESTED_SCORES: Record<string, number> = {
  'TC-A.1.1': 10.0,
  'TC-A.2.1': 5.0,
  'TC-A.3.1': 10.0,
  'TC-A.4.1': 15.0,
  'TC-B.1.1': 8.0,
  'TC-B.1.2': 7.0,
  'TC-B.2.1': 8.5,
  'TC-C.1.1': 10.0,
  'TC-C.2.1': 10.0,
  'TC-C.2.2': 5.0,
  'TC-C.3.1': 10.0,
};

// Initial scores for a new draft dossier
export const INITIAL_DRAFT_SCORES: Record<string, number> = {
  'TC-A.1.1': 10.0,
  'TC-A.2.1': 5.0,
  'TC-A.3.1': 7.0,
  'TC-A.4.1': 12.0,
  'TC-B.1.1': 5.0,
  'TC-B.1.2': 7.0,
  'TC-B.2.1': 5.0,
  'TC-C.1.1': 8.0,
  'TC-C.2.1': 10.0,
  'TC-C.2.2': 5.0,
  'TC-C.3.1': 6.0,
};

export interface ScoreCalculationResult {
  partAScore: number;
  partBScore: number;
  partCScore: number;
  totalScore: number;
  starRating: 3 | 4 | 5 | 0;
  starLabel: string;
  isPassingMandatory: boolean;
  mandatoryIssues: string[];
  completionPercentage: number;
  scoredCriteriaCount: number;
  validEvidenceCount: number;
  totalIndicatorsCount: number;
}

export function calculateOcopScores(
  scores: Record<string, number>,
  evidencesCountMap: Record<string, number> = {}
): ScoreCalculationResult {
  let partAScore = 0;
  let partBScore = 0;
  let partCScore = 0;
  let scoredCount = 0;
  let validEvidenceCount = 0;
  const mandatoryIssues: string[] = [];

  ALL_INDICATORS.forEach(ind => {
    const val = scores[ind.code] ?? 0;
    if (scores[ind.code] !== undefined && scores[ind.code] !== null) {
      scoredCount += 1;
    }

    if (ind.groupCode === 'GA') partAScore += val;
    else if (ind.groupCode === 'GB') partBScore += val;
    else if (ind.groupCode === 'GC') partCScore += val;

    const hasEv = (evidencesCountMap[ind.code] ?? 1) > 0;
    if (hasEv) validEvidenceCount += 1;

    // Check mandatory constraints
    if (ind.isMandatory) {
      if (val === 0) {
        mandatoryIssues.push(`Chỉ tiêu bắt buộc ${ind.code} (${ind.criterionName}) chưa có điểm.`);
      }
      if (!hasEv) {
        mandatoryIssues.push(`Chỉ tiêu bắt buộc ${ind.code} (${ind.criterionName}) chưa có minh chứng hợp lệ.`);
      }
    }
  });

  // Cap scores to group max
  partAScore = Math.min(partAScore, 40.0);
  partBScore = Math.min(partBScore, 25.0);
  partCScore = Math.min(partCScore, 35.0);

  const totalScore = Math.round((partAScore + partBScore + partCScore) * 10) / 10;
  const isPassingMandatory = mandatoryIssues.length === 0;

  // Star Rating Prediction
  let starRating: 3 | 4 | 5 | 0 = 0;
  let starLabel = 'Chưa đạt chuẩn sao OCOP';

  if (totalScore >= 90.0) {
    if (isPassingMandatory) {
      starRating = 5;
      starLabel = '5 SAO OCOP (Tiềm năng Quốc gia)';
    } else {
      starRating = 4;
      starLabel = '4 SAO OCOP (Hạ từ 5 sao do thiếu điều kiện khống chế)';
    }
  } else if (totalScore >= 70.0) {
    if (isPassingMandatory && (scores['TC-C.2.1'] ?? 0) >= 10.0) {
      starRating = 4;
      starLabel = '4 SAO OCOP (Cấp Tỉnh)';
    } else {
      starRating = 3;
      starLabel = '3 SAO OCOP (Hạ từ 4 sao do chưa đạt VietGAP/điều kiện khống chế)';
    }
  } else if (totalScore >= 50.0) {
    starRating = 3;
    starLabel = '3 SAO OCOP (Cấp Tỉnh)';
  }

  // Reactive Completion Percentage (50% scoring + 50% evidences)
  const totalCount = ALL_INDICATORS.length;
  const scoringRatio = scoredCount / totalCount;
  const evidenceRatio = Math.min(validEvidenceCount / totalCount, 1.0);
  const completionPercentage = Math.round((scoringRatio * 50 + evidenceRatio * 50));

  return {
    partAScore: Math.round(partAScore * 10) / 10,
    partBScore: Math.round(partBScore * 10) / 10,
    partCScore: Math.round(partCScore * 10) / 10,
    totalScore,
    starRating,
    starLabel,
    isPassingMandatory,
    mandatoryIssues,
    completionPercentage,
    scoredCriteriaCount: scoredCount,
    validEvidenceCount,
    totalIndicatorsCount: totalCount,
  };
}

export type CriterionBadgeStatus = 'GREEN' | 'YELLOW' | 'RED';

export function getCriterionBadgeStatus(
  indicator: CriterionIndicator,
  score: number | undefined,
  hasEvidence: boolean = true
): { status: CriterionBadgeStatus; label: string; description: string } {
  const isScored = score !== undefined && score !== null && score > 0;

  if (indicator.isMandatory) {
    if (!isScored || score === 0 || !hasEvidence) {
      return {
        status: 'RED',
        label: 'Chưa đạt / Thiếu minh chứng bắt buộc',
        description: 'Tiêu chí có dấu sao (*) bắt buộc nhưng đạt 0 điểm hoặc chưa có tệp minh chứng.',
      };
    }
  }

  if (isScored && hasEvidence) {
    return {
      status: 'GREEN',
      label: 'Hoàn thành',
      description: 'Đã tự chấm điểm và có minh chứng số hóa hợp lệ.',
    };
  }

  return {
    status: 'YELLOW',
    label: 'Cần bổ sung',
    description: 'Đã chọn điểm nhưng cần bổ sung thêm minh chứng hoặc căn cứ giải trình.',
  };
}
