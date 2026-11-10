import React from 'react';
import { Member, MemberType, CapitalForm } from '@/types/memberTypes';
import { Wallet, Coins, Calculator, ArrowDownRight, Sparkles } from 'lucide-react';
import { getSuggestedCreditLimitApi } from '@/services/memberService';

interface EditSectionCapitalProps {
  editingMember: Member;
  setEditingMember: React.Dispatch<React.SetStateAction<Member | null>>;
}

export const EditSectionCapital: React.FC<EditSectionCapitalProps> = ({
  editingMember,
  setEditingMember,
}) => {
  const [suggestedData, setSuggestedData] = React.useState<{
    suggested_limit: number;
    area_ha: number;
    isLoading: boolean;
  }>({
    suggested_limit: 15000000,
    area_ha: 1.0,
    isLoading: false,
  });

  React.useEffect(() => {
    if (editingMember.id && !editingMember.id.startsWith('temp-')) {
      setSuggestedData((prev) => ({ ...prev, isLoading: true }));
      getSuggestedCreditLimitApi(editingMember.id)
        .then((res) => {
          setSuggestedData({
            suggested_limit: res.suggested_credit_limit || 15000000,
            area_ha: res.total_area_ha || 1.0,
            isLoading: false,
          });
        })
        .catch(() => {
          setSuggestedData((prev) => ({ ...prev, isLoading: false }));
        });
    }
  }, [editingMember.id]);

  const handleApplySuggestion = () => {
    setEditingMember({
      ...editingMember,
      credit_limit: suggestedData.suggested_limit,
    });
  };

  return (
    <div className="space-y-5">
      {/* SECTION HEADER 3 */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
        <Wallet className="w-4 h-4 text-amber-600" />
        <h4 className="text-[13px] font-extrabold uppercase text-slate-700 tracking-wider">
          Phân loại thành viên &amp; Vốn góp điều lệ
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            Loại thành viên <span className="text-rose-500">*</span>
          </label>
          <select
            value={editingMember.member_type}
            onChange={(e) =>
              setEditingMember({ ...editingMember, member_type: e.target.value as MemberType })
            }
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-semibold text-sm text-slate-800"
          >
            <option value="CHINH_THUC">Chính thức (Bắt buộc dùng dịch vụ HTX)</option>
            <option value="LIEN_KET_GOP_VON">Liên kết góp vốn</option>
            <option value="LIEN_KET_KHONG_GOP_VON">Liên kết không góp vốn</option>
          </select>
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            Hình thức vốn <span className="text-rose-500">*</span>
          </label>
          <select
            value={editingMember.capital_form}
            onChange={(e) =>
              setEditingMember({ ...editingMember, capital_form: e.target.value as CapitalForm })
            }
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm text-slate-700 font-medium"
          >
            <option value="TIEN_MAT">Tiền mặt / Chuyển khoản ngân hàng</option>
            <option value="HIEN_VAT">Hiện vật / Quyền sử dụng đất</option>
          </select>
        </div>
      </div>

      {/* SUB-SECTION: TIỀN VỐN */}
      <div className="pt-3 border-t border-slate-100 space-y-4">
        <div className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-slate-500" />
          <h5 className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">
            Chi tiết số tiền vốn góp
          </h5>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
              Vốn cam kết (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              value={editingMember.committed_capital}
              onChange={(e) =>
                setEditingMember({
                  ...editingMember,
                  committed_capital: Number(e.target.value),
                })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-bold text-blue-900 text-base"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
              Đã thực góp (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              value={editingMember.total_capital_contributed}
              onChange={(e) =>
                setEditingMember({
                  ...editingMember,
                  contributed_capital: Number(e.target.value),
                  total_capital_contributed: Number(e.target.value),
                })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg font-bold text-emerald-700 text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Số tiền bằng chữ</label>
            <input
              type="text"
              value={editingMember.capital_in_words || ''}
              onChange={(e) =>
                setEditingMember({ ...editingMember, capital_in_words: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm text-slate-700 italic font-medium"
              placeholder="Ví dụ: Mười triệu đồng"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
              Ngày ghi nhận góp vốn <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={editingMember.contribution_date || editingMember.join_date}
              onChange={(e) =>
                setEditingMember({ ...editingMember, contribution_date: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm text-slate-700 font-medium"
            />
          </div>
        </div>
      </div>

      {/* SUB-SECTION: HẠN MỨC TÍN DỤNG VẬT TƯ NÔNG NGHIỆP TRẢ CHẬM */}
      <div className="pt-3 border-t border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <h5 className="text-[12px] font-extrabold uppercase text-slate-700 tracking-wider">
              Hạn mức tín dụng cấp phát vật tư trả chậm
            </h5>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Quy chế HTX: 15.000.000 ₫ / ha
          </span>
        </div>

        <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Hạn mức gợi ý theo diện tích canh tác:
            </div>
            <div className="text-emerald-800 font-medium mt-0.5">
              Diện tích: <strong className="font-mono">{suggestedData.area_ha} ha</strong> &times; 15.000.000 ₫ ={' '}
              <strong className="text-emerald-900 font-mono text-sm">
                {suggestedData.suggested_limit.toLocaleString('vi-VN')} ₫
              </strong>
            </div>
          </div>
          <button
            type="button"
            onClick={handleApplySuggestion}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            Áp dụng gợi ý
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
              Hạn mức áp dụng thực tế (VNĐ) <span className="text-slate-400 font-normal">(Ghi đè thủ công)</span>
            </label>
            <input
              type="number"
              min={0}
              step={1000000}
              value={editingMember.credit_limit ?? 0}
              onChange={(e) =>
                setEditingMember({
                  ...editingMember,
                  credit_limit: Number(e.target.value),
                })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg font-mono font-bold text-emerald-900 text-base"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Thủ kho sẽ căn cứ hạn mức này để duyệt phiếu xuất kho trả chậm vật tư đầu vụ.
            </p>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
              Dư nợ vật tư hiện tại
            </label>
            <div className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-700 text-base">
              {(editingMember.current_debt ?? 0).toLocaleString('vi-VN')} ₫
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Tự động cập nhật từ sổ chi tiết công nợ và biên bản KCS thu mua.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
