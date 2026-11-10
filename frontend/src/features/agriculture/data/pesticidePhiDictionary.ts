/**
 * BỘ TỪ ĐIỂN HOẠT CHẤT BẢO VỆ THỰC VẬT & THỜI GIAN CÁCH LY (PHI) CHUẨN HÓA
 * Căn cứ:
 * - Thông tư số 75/2025/TT-BNNMT & Danh mục thuốc BVTV được phép sử dụng tại Việt Nam (Bộ NN&PTNT)
 * - Tiêu chuẩn Nông nghiệp tốt VietGAP TCVN 11892-1:2017
 */

export interface PesticideIngredientInfo {
  name: string;
  aliases: string[];
  phiDays: number;
  category: 'BIO' | 'CHEMICAL' | 'MINERAL';
  targetPests: string;
  recommendedDose: string;
  safetyNote: string;
}

export const PESTICIDE_PHI_DICTIONARY: PesticideIngredientInfo[] = [
  {
    name: 'Matrine',
    aliases: ['kho sam', 'thuoc thao moc', 'matrine 0.5%', 'matrine 0.36%', 'matrine 0.5 sl'],
    phiDays: 3,
    category: 'BIO',
    targetPests: 'Rệp muội, bọ trĩ, sâu tơ, nhện đỏ',
    recommendedDose: '350 - 450 ml/ha',
    safetyNote: 'Thuốc sinh học chiết xuất thảo mộc, an toàn cao, cách ly tối thiểu 3 ngày theo VietGAP.',
  },
  {
    name: 'Abamectin',
    aliases: ['abamectin', 'aba', 'abamectin 1.8 ec', 'abamectin 3.6 ec', 'abamectin 5.4 ec'],
    phiDays: 7,
    category: 'BIO',
    targetPests: 'Sâu vẽ bùa, bọ trĩ, nhện đỏ, sâu đục quả',
    recommendedDose: '200 - 300 ml/ha',
    safetyNote: 'Kháng sinh nguồn gốc xạ khuẩn, cách ly nghiêm ngặt tối thiểu 7 ngày trước thu hoạch.',
  },
  {
    name: 'Bacillus thuringiensis',
    aliases: ['bt', 'bacillus', 'vi sinh bt', 'delfin', 'thuricide'],
    phiDays: 1,
    category: 'BIO',
    targetPests: 'Sâu tơ, sâu xanh bướm trắng, sâu khoang',
    recommendedDose: '1.0 - 1.5 kg/ha',
    safetyNote: 'Vi khuẩn sinh học phân giải tinh thể protein diệt ấu trùng, an toàn cao, cách ly 1 ngày.',
  },
  {
    name: 'Trichoderma harzianum',
    aliases: ['trichoderma', 'nam doi khang', 'tricho', 'vi sinh trichoderma'],
    phiDays: 0,
    category: 'BIO',
    targetPests: 'Nấm rễ Phytophthora, Fusarium, Rhizoctonia lở cổ rễ',
    recommendedDose: '2.0 - 3.0 kg/ha',
    safetyNote: 'Nấm vi sinh có ích bảo vệ rễ, không độc hại, thời gian cách ly 0 ngày.',
  },
  {
    name: 'Beauveria bassiana & Metarhizium',
    aliases: ['nam trang nam xanh', 'beauveria', 'metarhizium', 'nam ba mau'],
    phiDays: 0,
    category: 'BIO',
    targetPests: 'Rầy nâu, bọ trĩ, bọ xít muỗi, bọ phấn trắng',
    recommendedDose: '1.5 - 2.0 kg/ha',
    safetyNote: 'Nấm ký sinh diệt côn trùng theo cơ chế bào tử, cách ly 0 ngày.',
  },
  {
    name: 'Azadirachtin (Neem)',
    aliases: ['neem', 'tinh dau neem', 'neem oil', 'azadirachtin'],
    phiDays: 3,
    category: 'BIO',
    targetPests: 'Côn trùng chích hút, bọ nhảy, rệp sáp',
    recommendedDose: '1.0 - 1.5 lít/ha',
    safetyNote: 'Hoạt chất từ hạt xoan Ấn Độ (Neem), gây ức chế lột xác, cách ly 3 ngày.',
  },
  {
    name: 'Azoxystrobin',
    aliases: ['azoxystrobin', 'amistar', 'azoxy', 'azoxystrobin 250 sc'],
    phiDays: 7,
    category: 'CHEMICAL',
    targetPests: 'Thán thư, sương mai, phấn trắng',
    recommendedDose: '300 - 400 ml/ha',
    safetyNote: 'Thuốc trừ nấm nhóm Strobilurin nội hấp, cách ly tối thiểu 7 ngày theo quy định.',
  },
  {
    name: 'Dầu khoáng nông nghiệp (Petroleum Oil)',
    aliases: ['dau khoang', 'sk enspray', 'petroleum oil', 'citrole'],
    phiDays: 2,
    category: 'MINERAL',
    targetPests: 'Rệp sáp, nhện đỏ, bọ phấn, bồ hóng',
    recommendedDose: '2.0 - 3.0 lít/ha',
    safetyNote: 'Cơ chế bịt lỗ thở vật lý, ít tích lũy độc chất, cách ly 2 ngày trước thu hoạch.',
  },
  {
    name: 'Emamectin benzoate',
    aliases: ['emamectin', 'ema', 'emamectin benzoate 5 wdg', 'promclaim'],
    phiDays: 5,
    category: 'BIO',
    targetPests: 'Sâu cuốn lá, sâu đục thân, sâu đục quả ớt',
    recommendedDose: '100 - 150 g/ha',
    safetyNote: 'Bán tổng hợp từ Abamectin, hiệu lực diệt sâu cao, cách ly 5 ngày.',
  },
  {
    name: 'Validamycin A',
    aliases: ['validamycin', 'valida', 'validacin'],
    phiDays: 7,
    category: 'BIO',
    targetPests: 'Bệnh khô vằn, lở cổ rễ rau củ quả',
    recommendedDose: '1.0 - 1.5 lít/ha',
    safetyNote: 'Kháng sinh thực vật đối kháng nấm Rhizoctonia solani, cách ly 7 ngày.',
  },
  {
    name: 'Kasugamycin',
    aliases: ['kasugamycin', 'kasumin'],
    phiDays: 7,
    category: 'BIO',
    targetPests: 'Bệnh đạo ôn, thối vi khuẩn, đốm lá',
    recommendedDose: '1.0 - 1.5 lít/ha',
    safetyNote: 'Kháng sinh nguồn gốc xạ khuẩn Streptomyces kasugaensis, cách ly 7 ngày.',
  },
  {
    name: 'Spinosad',
    aliases: ['spinosad', 'success', 'radiant'],
    phiDays: 3,
    category: 'BIO',
    targetPests: 'Bọ trĩ, sâu vẽ bùa, sâu xanh hại quả',
    recommendedDose: '200 - 300 ml/ha',
    safetyNote: 'Nguồn gốc xạ khuẩn đất Saccharopolyspora spinosa, cách ly 3 ngày.',
  },
  {
    name: 'Mancozeb',
    aliases: ['mancozeb', 'dithane', 'manozeb 80 wp'],
    phiDays: 14,
    category: 'CHEMICAL',
    targetPests: 'Đốm lá, thán thư, mốc sương',
    recommendedDose: '1.5 - 2.0 kg/ha',
    safetyNote: 'Thuốc trừ nấm tiếp xúc phổ rộng dithiocarbamate, cách ly nghiêm ngặt 14 ngày.',
  },
  {
    name: 'Metalaxyl',
    aliases: ['metalaxyl', 'ridomil'],
    phiDays: 14,
    category: 'CHEMICAL',
    targetPests: 'Xì mủ, thối rễ, nấm sương mai',
    recommendedDose: '1.0 - 1.5 kg/ha',
    safetyNote: 'Nội hấp lưu dẫn mạnh nhóm Acylalanine, cách ly nghiêm ngặt 14 ngày.',
  },
  {
    name: 'Chitosan (Oligochitosan)',
    aliases: ['chitosan', 'oli', 'nano chitosan'],
    phiDays: 0,
    category: 'BIO',
    targetPests: 'Tăng kháng virus, vi khuẩn, kích kháng sinh học',
    recommendedDose: '500 ml/ha',
    safetyNote: 'Hợp chất polymer hữu cơ từ vỏ tôm cua, an toàn tuyệt đối, cách ly 0 ngày.',
  },
];

/**
 * Tra cứu thông tin hoạt chất và số ngày PHI chuẩn
 */
export function lookupPesticideIngredient(query: string): PesticideIngredientInfo | null {
  if (!query || typeof query !== 'string') return null;
  const clean = query.trim().toLowerCase();

  for (const item of PESTICIDE_PHI_DICTIONARY) {
    if (item.name.toLowerCase() === clean) {
      return item;
    }
    if (clean.includes(item.name.toLowerCase())) {
      return item;
    }
    for (const alias of item.aliases) {
      if (clean.includes(alias.toLowerCase())) {
        return item;
      }
    }
  }

  return null;
}

/**
 * Gợi ý số ngày PHI tự động dựa trên tên hoạt chất hoặc tên vật tư
 */
export function suggestPhiDays(query: string, fallback: number = 0): { phiDays: number; isSuggested: boolean; info?: PesticideIngredientInfo } {
  const match = lookupPesticideIngredient(query);
  if (match) {
    return {
      phiDays: match.phiDays,
      isSuggested: true,
      info: match,
    };
  }
  return {
    phiDays: fallback,
    isSuggested: false,
  };
}
