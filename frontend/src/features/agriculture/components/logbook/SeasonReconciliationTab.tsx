import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ShieldCheck,
  Save,
  FileCheck,
  Trash2,
  Info,
  Calendar,
  Sparkles,
  Printer
} from 'lucide-react';
import type { SeasonMaterialReconciliation } from '@/types/agriculture';
import type { CropSeason } from '@/services/cropSeasonApi';

interface SeasonReconciliationTabProps {
  season?: CropSeason;
  reconciliations: SeasonMaterialReconciliation[];
  onSaveReconciliation: (items: any[]) => Promise<void>;
  onFreezeLogbook: () => Promise<void>;
  isSaving?: boolean;
  isFreezing?: boolean;
}

export const SeasonReconciliationTab: React.FC<SeasonReconciliationTabProps> = ({
  season,
  reconciliations,
  onSaveReconciliation,
  onFreezeLogbook,
  isSaving = false,
  isFreezing = false,
}) => {
  const isFrozen = season?.logbook_status === 'FROZEN_ARCHIVED';
  const [items, setItems] = useState<SeasonMaterialReconciliation[]>(reconciliations);
  const [showFreezeModal, setShowFreezeModal] = useState(false);

  React.useEffect(() => {
    setItems(reconciliations);
  }, [reconciliations]);

  const handleItemChange = (index: number, field: keyof SeasonMaterialReconciliation, value: any) => {
    if (isFrozen) return;
    const updated = [...items];
    const current = { ...updated[index], [field]: value };

    // Tự động tính toán lại chênh lệch
    const opening = Number(current.opening_balance) || 0;
    const received = Number(current.received_from_coop) || 0;
    const used = Number(current.used_in_logbook) || 0;
    const actual = Number(current.actual_closing_balance) || 0;
    const calculated = opening + received - used;

    current.calculated_balance = calculated;
    current.variance = actual - calculated;
    updated[index] = current;
    setItems(updated);
  };

  const hasVariance = items.some((i) => Math.abs(i.variance) > 0.001);

  return (
    <div className="space-y-6">
      {/* Banner Khóa Sổ & Chuỗi Băm SHA-256 */}
      {isFrozen ? (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-200">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-amber-900">
                  Sổ Nhật Ký Canh Tác Đã Khóa Đóng Băng Bất Biến
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-800">
                  SHA-256 TAMPER-EVIDENT
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 font-mono break-all">
                Mã băm Merkle Root: {season?.logbook_final_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </p>
            </div>
          </div>

          <div className="text-xs text-amber-700 bg-amber-100/70 px-3 py-2 rounded-xl border border-amber-200 self-stretch md:self-auto text-right">
            <span>Thời điểm khóa: {season?.logbook_frozen_at || 'Đã hoàn tất'}</span>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-900">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                Biên Bản Cộng Sổ Cân Bằng Kho & Khóa Sổ Cuối Vụ
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Công thức: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">Tồn Cuối Vụ = Tồn Đầu Vụ + Nhận từ Kho HTX - Lượng Đã Ghi Trong Sổ</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => onSaveReconciliation(items)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition border border-slate-700 shadow-sm"
            >
              <Save className="w-4 h-4 text-slate-400" />
              {isSaving ? 'Đang lưu...' : 'Lưu Biên Bản Đối Soát'}
            </button>
            <button
              onClick={() => setShowFreezeModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition shadow-md shadow-emerald-900"
            >
              <Lock className="w-4 h-4" />
              Khóa Sổ Mùa Vụ
            </button>
          </div>
        </div>
      )}

      {/* Cảnh báo chênh lệch nếu có */}
      {hasVariance && !isFrozen && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Cảnh báo chênh lệch vật tư:</strong> Phát hiện chênh lệch giữa số lượng tính toán theo sổ và kiểm đếm thực tế. Vui lòng nhập ghi chú giải trình trước khi đóng sổ mùa vụ.
          </span>
        </div>
      )}

      {/* Bảng Đối Soát Cân Bằng Vật Tư */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-slate-800 text-sm">Bảng Đối Soát Chi Tiết Từng Loại Phân Bón & Thuốc BVTV</h4>
          </div>
          <span className="text-xs text-slate-500">100% vỏ bao bì chai lọ phải được kiểm đếm thu hồi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Tên vật tư nông nghiệp</th>
                <th className="py-3 px-4 text-center">ĐVT</th>
                <th className="py-3 px-4 text-right">Tồn đầu vụ (1)</th>
                <th className="py-3 px-4 text-right">Nhận từ kho (2)</th>
                <th className="py-3 px-4 text-right">Đã dùng (3)</th>
                <th className="py-3 px-4 text-right">Tồn sổ sách</th>
                <th className="py-3 px-4 text-right">Thực tế cuối vụ</th>
                <th className="py-3 px-4 text-center">Chênh lệch</th>
                <th className="py-3 px-4 text-center">Vỏ thu hồi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Scale className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-500">Chưa có dữ liệu vật tư để đối soát</p>
                    <p className="text-xs text-slate-400 mt-1">Hệ thống sẽ tự động tổng hợp khi có các lượt bón phân hoặc phun thuốc</p>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.material_name}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 font-mono">
                      {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isFrozen ? (
                        <span>{item.opening_balance}</span>
                      ) : (
                        <input
                          type="number"
                          value={item.opening_balance}
                          onChange={(e) => handleItemChange(idx, 'opening_balance', Number(e.target.value))}
                          className="w-16 px-1.5 py-1 text-right border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                        />
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      {item.received_from_coop}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-700">
                      {item.used_in_logbook}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      {item.calculated_balance}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isFrozen ? (
                        <span className="font-bold">{item.actual_closing_balance}</span>
                      ) : (
                        <input
                          type="number"
                          value={item.actual_closing_balance}
                          onChange={(e) => handleItemChange(idx, 'actual_closing_balance', Number(e.target.value))}
                          className="w-16 px-1.5 py-1 text-right border border-slate-200 rounded text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                        />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {Math.abs(item.variance) > 0.001 ? (
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {item.variance > 0 ? `+${item.variance}` : item.variance}
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          0 (Khớp)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isFrozen ? (
                        <span>{item.empty_packaging_returned} vỏ</span>
                      ) : (
                        <input
                          type="number"
                          value={item.empty_packaging_returned}
                          onChange={(e) => handleItemChange(idx, 'empty_packaging_returned', Number(e.target.value))}
                          className="w-14 px-1.5 py-1 text-center border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xác nhận Khóa Sổ Mùa Vụ */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Xác Nhận Khóa Sổ Mùa Vụ Bất Biến</h3>
              <p className="text-xs text-slate-500">
                Sau khi khóa sổ, toàn bộ dữ liệu nhật ký canh tác, phiếu cân thu hoạch và biên bản đối soát sẽ chuyển sang trạng thái <strong>Chỉ đọc (Read-only)</strong> và được ký chuỗi băm Merkle Root SHA-256 phục vụ thanh tra VietGAP.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-semibold">Lưu ý pháp lý:</p>
              <ul className="list-disc list-inside space-y-0.5 opacity-90">
                <li>Không thể chỉnh sửa hoặc xóa bất kỳ dòng nhật ký nào sau khi khóa.</li>
                <li>Hệ thống tự động lưu vết kiểm toán (Audit Trail) bất biến.</li>
                <li>Chỉ Trưởng Ban Kiểm Soát hoặc Giám Đốc HTX mới có thẩm quyền mở khóa trong trường hợp đặc biệt.</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFreezeModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onFreezeLogbook();
                  setShowFreezeModal(false);
                }}
                disabled={isFreezing}
                className="flex-1 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition"
              >
                {isFreezing ? 'Đang khóa...' : 'Xác Nhận Khóa Sổ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
