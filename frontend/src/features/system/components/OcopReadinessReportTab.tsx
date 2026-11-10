import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Star, FileText, CheckCircle2, Printer, ExternalLink, ShieldCheck } from 'lucide-react';
import { DashboardMetrics } from '@/services/reportApi';
import { openInteractivePrintWindow } from '@/utils/pdfExportUtils';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { Skeleton } from '@/components/ui/Skeleton';

interface OcopReadinessReportTabProps {
  metrics: DashboardMetrics | undefined;
  isLoading: boolean;
}

export const OcopReadinessReportTab: React.FC<OcopReadinessReportTabProps> = ({
  metrics,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { activeCooperative } = useTenantContextStore();
  const coopName = activeCooperative?.legal_name || 'Hợp tác xã Nông nghiệp';

  const totalProducts = metrics?.products?.total_products ?? metrics?.totalOcopProducts ?? 0;
  const statusCounts = metrics?.ocopApplications?.status_breakdown ?? metrics?.ocopStatusCounts ?? {};
  const totalApps = metrics?.ocopApplications?.total_applications ?? 0;

  const handlePrint = () => {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #1e293b;">
        <div style="border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #0f766e; font-size: 20px; text-transform: uppercase;">${coopName}</h2>
          <h1 style="margin: 6px 0 0 0; color: #0f172a; font-size: 16px;">BÁO CÁO TIẾN ĐỘ & PHÂN HẠNG SẢN PHẨM OCOP</h1>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Quyết định 148/QĐ-TTg & QĐ 1489/QĐ-TTg • Ngày trích xuất: ${new Date().toLocaleDateString('vi-VN')}</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Tổng sản phẩm OCOP</div>
            <div style="font-size: 18px; font-weight: bold; color: #0f766e;">${totalProducts} sản phẩm</div>
          </div>
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Hồ sơ đã nộp thẩm định</div>
            <div style="font-size: 18px; font-weight: bold; color: #0f172a;">${statusCounts['SUBMITTED'] || 0} hồ sơ</div>
          </div>
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Hồ sơ đang tự đánh giá</div>
            <div style="font-size: 18px; font-weight: bold; color: #2563eb;">${statusCounts['DRAFT'] || statusCounts['IN_PROGRESS'] || 0} hồ sơ</div>
          </div>
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Đã có QĐ công nhận</div>
            <div style="font-size: 18px; font-weight: bold; color: #16a34a;">${statusCounts['APPROVED'] || statusCounts['COUNCIL_REVIEW'] || 0} hồ sơ</div>
          </div>
        </div>

        <div style="margin-top: 25px; padding: 15px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #0f172a;">QUY CHUẨN ĐÁNH GIÁ PHÂN HẠNG SAO THEO BỘ TIÊU CHÍ QUỐC GIA:</h3>
          <ul style="font-size: 12px; line-height: 1.6; margin: 0; padding-left: 20px; color: #334155;">
            <li><strong>Sản phẩm OCOP 5 sao (90 - 100 điểm):</strong> Sản phẩm đặc trưng tiêu biểu, chất lượng cao, có tiềm năng xuất khẩu thương mại quốc tế. Thẩm quyền: Hội đồng OCOP Trung ương (Bộ Nông nghiệp & PTNT).</li>
            <li><strong>Sản phẩm OCOP 4 sao (70 - 89 điểm):</strong> Sản phẩm đạt tiêu chuẩn chất lượng cao, bao bì nhãn mác hoàn thiện, có năng lực vươn ra thị trường toàn quốc. Thẩm quyền: UBND Cấp Tỉnh / TP trực thuộc Trung ương.</li>
            <li><strong>Sản phẩm OCOP 3 sao (50 - 69 điểm):</strong> Sản phẩm mang bản sắc địa phương, hoàn thiện các quy định an toàn vệ sinh thực phẩm và truy xuất nguồn gốc. Thẩm quyền: UBND Cấp Huyện / TP thuộc Tỉnh.</li>
          </ul>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px;">
          <div style="text-align: center;">
            <strong>PHỤ TRÁCH HỒ SƠ OCOP</strong><br/><br/><br/>
            (Ký và ghi rõ họ tên)
          </div>
          <div style="text-align: center;">
            <strong>BAN KIỂM SOÁT HTX</strong><br/><br/><br/>
            (Ký và ghi rõ họ tên)
          </div>
          <div style="text-align: center;">
            <strong>GIÁM ĐỐC HTX</strong><br/><br/><br/>
            (Ký tên và đóng dấu)
          </div>
        </div>
      </div>
    `;

    openInteractivePrintWindow({
      title: `Báo Cáo Tiến Độ OCOP - ${coopName}`,
      filename: `bao_cao_tien_do_ocop_${new Date().toISOString().slice(0, 10)}.html`,
      contentHtml: html,
      orientation: 'landscape',
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng sản phẩm OCOP số hóa</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {totalProducts} <span className="text-xs font-bold text-slate-500">sản phẩm</span>
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Có hồ sơ số hóa trên hệ thống
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng số hồ sơ đánh giá</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-2" />
          ) : (
            <div className="text-2xl font-black text-blue-700 mt-1">
              {totalApps} <span className="text-xs font-bold text-slate-500">bộ hồ sơ</span>
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Theo Bộ tiêu chí QĐ 148 & 1489
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Đã nộp hội đồng thẩm định</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-2" />
          ) : (
            <div className="text-2xl font-black text-purple-700 mt-1">
              {statusCounts['SUBMITTED'] || 0} <span className="text-xs font-bold text-slate-500">hồ sơ</span>
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Đang chờ chấm điểm cấp Huyện/Tỉnh
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Cơ cấu phân hạng mục tiêu</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-sm font-black text-slate-900 mt-2 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-xs">4 Sao (Chủ lực)</span>
            <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-xs">3 Sao</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Phân hạng theo tiêu chuẩn QĐ 148
          </div>
        </div>
      </div>

      {/* Guidelines & Quick Action Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Quy chuẩn Pháp lý & Tiến trình Đánh giá Hồ sơ OCOP
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Áp dụng Quyết định số 148/QĐ-TTg ngày 24/02/2023 và Quyết định số 1489/QĐ-TTg ngày 06/07/2025 của Thủ tướng Chính phủ.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/ocop/reports')}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-emerald-600" />
              <span>Biểu đồ Radar & Doanh thu OCOP</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> In / Lưu PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/50 space-y-2">
            <div className="flex items-center gap-1.5 text-sky-800 font-extrabold text-xs">
              <Star className="w-4 h-4 fill-sky-600 text-sky-600" />
              <span>HẠNG 3 SAO (50 - 69 ĐIỂM)</span>
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed">
              Sản phẩm có bản sắc địa phương, hoàn thiện điều kiện cơ sở pháp lý, nguồn gốc nguyên liệu và an toàn thực phẩm.
            </p>
            <div className="text-[11px] font-bold text-sky-900 pt-1 border-t border-sky-200/60">
              Thẩm quyền: UBND Cấp Huyện
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs">
              <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>HẠNG 4 SAO (70 - 89 ĐIỂM)</span>
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed">
              Sản phẩm đạt chất lượng cao, bao bì truy xuất GS1 QR chuẩn hóa, thương hiệu ổn định và phân phối liên tỉnh.
            </p>
            <div className="text-[11px] font-bold text-emerald-900 pt-1 border-t border-emerald-200/60">
              Thẩm quyền: UBND Cấp Tỉnh
            </div>
          </div>

          <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50 space-y-2">
            <div className="flex items-center gap-1.5 text-purple-800 font-extrabold text-xs">
              <Star className="w-4 h-4 fill-purple-600 text-purple-600" />
              <span>HẠNG 5 SAO (90 - 100 ĐIỂM)</span>
            </div>
            <p className="text-[12px] text-slate-600 leading-relaxed">
              Sản phẩm tiêu biểu đặc sắc quốc gia, đạt các chứng nhận quốc tế (GlobalGAP, Organic, ISO), đủ tiêu chuẩn xuất khẩu.
            </p>
            <div className="text-[11px] font-bold text-purple-900 pt-1 border-t border-purple-200/60">
              Thẩm quyền: Hội đồng OCOP Quốc gia
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
