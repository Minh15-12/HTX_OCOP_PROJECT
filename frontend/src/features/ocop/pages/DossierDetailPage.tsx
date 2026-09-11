import React, { useState } from 'react';
import { ArrowLeft, Star, FileText, CheckSquare, Upload, Award, FileCheck, Save, Send, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const DossierDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'scoring' | 'evidences' | 'council' | 'certificate'>('scoring');

  // Interactive Scoring state
  const [scores, setScores] = useState<Record<string, number>>({
    c1_1: 8,
    c1_2: 12,
    c2_1: 15,
    c2_2: 8,
    c3_1: 22,
    c3_2: 18,
  });

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const getStarGrade = (score: number) => {
    if (score >= 90) return '5 SAO (Cấp Quốc gia)';
    if (score >= 70) return '4 SAO (Cấp Tỉnh)';
    if (score >= 50) return '3 SAO (Cấp Huyện)';
    return 'Chưa đạt 3 sao';
  };

  return (
    <div className="space-y-4 pb-16 animate-fade-in">
      {/* Back button & Page Title Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/ocop/dossiers')}
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-mono font-bold text-slate-400">DOS-2026-001</span>
            <span className="pill-badge pill-blue">Đang chấm điểm Hội đồng</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Hồ sơ OCOP: Trà Oolong Cầu Đất Thượng Hạng
          </h1>
        </div>
      </div>

      {/* Dynamic Tabs Navigation Header */}
      <div className="flex flex-wrap border-b border-[#e7e9ec] bg-white rounded-t-xl px-4 pt-2 gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 px-3.5 text-[12.8px] font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> 1. Tổng quan & Tiến độ
        </button>
        <button
          onClick={() => setActiveTab('scoring')}
          className={`py-2.5 px-3.5 text-[12.8px] font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'scoring'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> 2. Chấm điểm Tiêu chí ({totalScore}/100)
        </button>
        <button
          onClick={() => setActiveTab('evidences')}
          className={`py-2.5 px-3.5 text-[12.8px] font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'evidences'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-4 h-4" /> 3. Minh chứng số (5 file)
        </button>
        <button
          onClick={() => setActiveTab('council')}
          className={`py-2.5 px-3.5 text-[12.8px] font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'council'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" /> 4. Đánh giá Hội đồng
        </button>
        <button
          onClick={() => setActiveTab('certificate')}
          className={`py-2.5 px-3.5 text-[12.8px] font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'certificate'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" /> 5. Quyết định & Chứng nhận
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="bg-white border border-[#e7e9ec] rounded-b-xl p-6 shadow-subtle space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Thông tin chung Hồ sơ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
            <div className="p-3 bg-slate-50 rounded-lg space-y-2">
              <p><strong>Tên chủ thể:</strong> HTX Nông nghiệp Xanh Phú Thịnh</p>
              <p><strong>Địa chỉ sản xuất:</strong> Thôn 2, Xã Liên Hà, Lâm Hà, Lâm Đồng</p>
              <p><strong>Nhóm sản phẩm:</strong> Thực phẩm - Trà & Đồ uống</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg space-y-2">
              <p><strong>Hạng sao đăng ký đánh giá:</strong> 4 Sao</p>
              <p><strong>Năm đánh giá:</strong> Đợt 1 - 2026</p>
              <p><strong>Cán bộ phụ trách:</strong> Nguyễn Văn An</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CRITERIA SCORING MATRIX */}
      {activeTab === 'scoring' && (
        <div className="space-y-4">
          {/* Total Score Summary Box */}
          <div className="p-4 bg-emerald-900 text-white rounded-xl shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[12px] text-emerald-300 font-bold uppercase tracking-wider">Tổng điểm tự đánh giá OCOP</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black">{totalScore}</span>
                <span className="text-emerald-300 text-sm font-semibold">/ 100 điểm</span>
              </div>
            </div>

            <div className="bg-emerald-800/80 border border-emerald-700/80 rounded-lg px-4 py-2 flex items-center gap-3">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400 shrink-0" />
              <div>
                <div className="text-[11px] text-emerald-200">Dự kiến đạt phân hạng:</div>
                <div className="text-base font-extrabold text-amber-300">{getStarGrade(totalScore)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 font-bold text-[12.5px] rounded-lg transition-colors inline-flex items-center gap-1.5">
                <Save className="w-4 h-4" /> Lưu bản nháp
              </button>
              <button className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[12.5px] rounded-lg transition-colors inline-flex items-center gap-1.5">
                <Send className="w-4 h-4" /> Gửi Hội đồng chấm
              </button>
            </div>
          </div>

          {/* Criteria Groups */}
          <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden divide-y divide-slate-100">
            {/* Nhóm 1 */}
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                <h4 className="font-extrabold text-slate-900 text-[13.5px]">
                  NHÓM 1: MỨC ĐỘ THUỘC TÍNH SẢN PHẨM & SỨC MẠNH CỘNG ĐỒNG (Tối đa 35 điểm)
                </h4>
                <span className="font-bold text-emerald-700 text-sm">{scores.c1_1 + scores.c1_2} / 35 điểm</span>
              </div>

              <div className="space-y-2 pl-2">
                <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 text-[12.8px]">
                  <div>
                    <p className="font-bold text-slate-800">1.1. Sử dụng nguyên liệu địa phương</p>
                    <p className="text-[11.5px] text-slate-500">Sử dụng 100% búp trà tươi từ vùng trồng HTX tại Lâm Đồng.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={scores.c1_1}
                      onChange={(e) => setScores({ ...scores, c1_1: Number(e.target.value) })}
                      className="px-2.5 py-1 border border-slate-200 rounded-lg text-sm font-bold bg-white focus:outline-none"
                    >
                      <option value={10}>10 điểm (Tối đa)</option>
                      <option value={8}>8 điểm (Khá)</option>
                      <option value={5}>5 điểm (Trung bình)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 text-[12.8px]">
                  <div>
                    <p className="font-bold text-slate-800">1.2. Tạo việc làm & Thu nhập cho lao động nông thôn</p>
                    <p className="text-[11.5px] text-slate-500">Tạo việc làm thường xuyên cho 45 lao động xã viên địa phương.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={scores.c1_2}
                      onChange={(e) => setScores({ ...scores, c1_2: Number(e.target.value) })}
                      className="px-2.5 py-1 border border-slate-200 rounded-lg text-sm font-bold bg-white focus:outline-none"
                    >
                      <option value={15}>15 điểm (Tối đa)</option>
                      <option value={12}>12 điểm (Tốt)</option>
                      <option value={8}>8 điểm (Khá)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Nhóm 2 */}
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                <h4 className="font-extrabold text-slate-900 text-[13.5px]">
                  NHÓM 2: KHẢ NĂNG MARKETING & BẢO HỘ THƯƠNG HIỆU (Tối đa 25 điểm)
                </h4>
                <span className="font-bold text-emerald-700 text-sm">{scores.c2_1 + scores.c2_2} / 25 điểm</span>
              </div>

              <div className="space-y-2 pl-2">
                <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 text-[12.8px]">
                  <div>
                    <p className="font-bold text-slate-800">2.1. Nhãn hiệu & Bao bì đóng gói OCOP</p>
                    <p className="text-[11.5px] text-slate-500">Bao bì túi nhôm tráng thiếc có mã QR code truy xuất nguồn gốc.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={scores.c2_1}
                      onChange={(e) => setScores({ ...scores, c2_1: Number(e.target.value) })}
                      className="px-2.5 py-1 border border-slate-200 rounded-lg text-sm font-bold bg-white focus:outline-none"
                    >
                      <option value={15}>15 điểm (Tối đa)</option>
                      <option value={10}>10 điểm (Khá)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Nhóm 3 */}
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                <h4 className="font-extrabold text-slate-900 text-[13.5px]">
                  NHÓM 3: CHẤT LƯỢNG SẢN PHẨM & AN TOÀN THỰC PHẨM (Tối đa 40 điểm)
                </h4>
                <span className="font-bold text-emerald-700 text-sm">{scores.c3_1 + scores.c3_2} / 40 điểm</span>
              </div>

              <div className="space-y-2 pl-2">
                <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 text-[12.8px]">
                  <div>
                    <p className="font-bold text-slate-800">3.1. Chứng nhận Tiêu chuẩn Chất lượng (VietGAP / ISO / HACCP)</p>
                    <p className="text-[11.5px] text-slate-500">Có Giấy chứng nhận VietGAP còn hiệu lực đến năm 2027.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={scores.c3_1}
                      onChange={(e) => setScores({ ...scores, c3_1: Number(e.target.value) })}
                      className="px-2.5 py-1 border border-slate-200 rounded-lg text-sm font-bold bg-white focus:outline-none"
                    >
                      <option value={22}>22 điểm (Tối đa VietGAP)</option>
                      <option value={15}>15 điểm (Cơ bản)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DIGITAL EVIDENCES */}
      {activeTab === 'evidences' && (
        <div className="bg-white border border-[#e7e9ec] rounded-b-xl p-6 shadow-subtle space-y-4">
          <div className="flex justify-between items-center border-b border-[#e7e9ec] pb-3">
            <h3 className="font-extrabold text-slate-900 text-base">Danh mục Minh chứng Số đã nộp</h3>
            <button className="px-3.5 py-1.5 bg-emerald-600 text-white font-bold text-[12.5px] rounded-lg">
              + Tải lên minh chứng mới
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[12.8px]">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-bold text-slate-900">Giay_Chung_Nhan_VietGAP_Tra_Oolong.pdf</p>
                  <p className="text-[11.2px] text-slate-500">Cấp ngày 10/05/2024 &bull; Dung lượng 2.4 MB</p>
                </div>
              </div>
              <span className="pill-badge pill-green">Đã xác minh</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[12.8px]">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-bold text-slate-900">Phieu_Kiem_Nhiem_ATVSTP_Trung_Tam_1.pdf</p>
                  <p className="text-[11.2px] text-slate-500">Cấp ngày 02/08/2026 &bull; Dung lượng 1.8 MB</p>
                </div>
              </div>
              <span className="pill-badge pill-green">Đã xác minh</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COUNCIL EVALUATION */}
      {activeTab === 'council' && (
        <div className="bg-white border border-[#e7e9ec] rounded-b-xl p-6 shadow-subtle space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Điểm chấm từ Hội đồng Phân hạng OCOP</h3>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[13px]">
            Hội đồng đánh giá gồm 5 thành viên đã hoàn thành chấm điểm. Điểm trung bình cộng chính thức: <strong>86.4 / 100 điểm</strong> (Đạt OCOP 4 sao).
          </div>
        </div>
      )}

      {/* TAB 5: CERTIFICATE PREVIEW */}
      {activeTab === 'certificate' && (
        <div className="bg-white border border-[#e7e9ec] rounded-b-xl p-6 shadow-subtle space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Xem trước Quyết định & Giấy chứng nhận OCOP</h3>
          <div className="p-8 border-4 border-double border-amber-300 rounded-2xl bg-amber-50/30 text-center space-y-4">
            <Award className="w-16 h-16 text-amber-500 mx-auto" />
            <h2 className="text-xl font-black text-amber-900 uppercase">GIẤY CHỨNG NHẬN SẢN PHẨM OCOP</h2>
            <p className="text-base font-extrabold text-slate-900">TRÀ OOLONG CẦU ĐẤT THƯỢNG HẠNG</p>
            <p className="text-sm font-bold text-amber-800">ĐẠT CHỨNG NHẬN OCOP 4 SAO</p>
          </div>
        </div>
      )}
    </div>
  );
};
