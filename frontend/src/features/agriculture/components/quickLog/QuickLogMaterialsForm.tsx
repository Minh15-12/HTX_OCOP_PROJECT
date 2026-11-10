import React, { useState } from 'react';
import { Layers, ShieldAlert, CheckCircle, Sparkles } from 'lucide-react';
import { PREDEFINED_MATERIALS } from '../../data/predefinedMaterials';
import { PESTICIDE_PHI_DICTIONARY, suggestPhiDays } from '../../data/pesticidePhiDictionary';

interface QuickLogMaterialsFormProps {
  materialKey: string;
  onMaterialChange: (key: string) => void;
  materialSku: string;
  setMaterialSku: (val: string) => void;
  materialBatchNumber: string;
  setMaterialBatchNumber: (val: string) => void;
  quantityApplied: string;
  setQuantityApplied: (val: string) => void;
  unit: string;
  setUnit: (val: string) => void;
  phiDays: number;
  setPhiDays: (val: number) => void;
  safeHarvestDate: string;
}

export const QuickLogMaterialsForm: React.FC<QuickLogMaterialsFormProps> = ({
  materialKey,
  onMaterialChange,
  materialSku,
  setMaterialSku,
  materialBatchNumber,
  setMaterialBatchNumber,
  quantityApplied,
  setQuantityApplied,
  unit,
  setUnit,
  phiDays,
  setPhiDays,
  safeHarvestDate,
}) => {
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [suggestionNote, setSuggestionNote] = useState<string>('');

  const handleSelectIngredient = (ingredientName: string) => {
    setSelectedIngredient(ingredientName);
    const suggestion = suggestPhiDays(ingredientName);
    if (suggestion.isSuggested) {
      setPhiDays(suggestion.phiDays);
      setSuggestionNote(`Chuẩn VietGAP/Bộ NN&PTNT: Cách ly ${suggestion.phiDays} ngày (${suggestion.info?.category === 'BIO' ? 'Sinh học' : 'Hóa học'})`);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-600" />
          4. Chọn Vật Tư / Phân Bón / Chế Phẩm
        </span>
        <span className="text-[11px] text-slate-400">Tự động điền SKU &amp; Số Lô</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Danh mục vật tư kho HTX
          </label>
          <select
            value={materialKey}
            onChange={(e) => onMaterialChange(e.target.value)}
            className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
          >
            {PREDEFINED_MATERIALS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Mã SKU &amp; Số lô sản xuất
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={materialSku}
              onChange={(e) => setMaterialSku(e.target.value)}
              placeholder="Mã SKU"
              className="w-1/2 min-h-[48px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-mono text-slate-700 outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              value={materialBatchNumber}
              onChange={(e) => setMaterialBatchNumber(e.target.value)}
              placeholder="Số lô SX"
              className="w-1/2 min-h-[48px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-mono text-slate-700 outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Khối lượng / Liều lượng
          </label>
          <input
            type="number"
            step="0.1"
            value={quantityApplied}
            onChange={(e) => setQuantityApplied(e.target.value)}
            placeholder="2.5"
            className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Đơn vị</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
          >
            <option value="Lít">Lít (Dung dịch/Nước)</option>
            <option value="Kg">Kg (Dạng bột/Hạt)</option>
            <option value="Chai">Chai</option>
            <option value="Gói">Gói</option>
            <option value="Cuộn">Cuộn (Dây quấn)</option>
          </select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
            <span>Cách ly PHI (Ngày)</span>
            {suggestionNote && (
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Chuẩn VietGAP
              </span>
            )}
          </label>
          <input
            type="number"
            min="0"
            value={phiDays}
            onChange={(e) => {
              setPhiDays(parseInt(e.target.value) || 0);
              setSuggestionNote('');
            }}
            className={`w-full min-h-[48px] rounded-xl border px-3 py-2.5 text-xs font-bold outline-none focus:border-emerald-500 ${
              phiDays > 0
                ? 'border-rose-300 bg-rose-50/80 text-rose-900 font-extrabold'
                : 'border-slate-200 bg-white text-slate-800'
            }`}
          />
        </div>
      </div>

      {/* Tra cứu nhanh từ điển hoạt chất chuẩn VietGAP */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Tra cứu gợi ý số ngày PHI theo hoạt chất (Bộ NN&PTNT):
          </span>
          {suggestionNote && (
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {suggestionNote}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PESTICIDE_PHI_DICTIONARY.slice(0, 8).map((ing) => (
            <button
              key={ing.name}
              type="button"
              onClick={() => handleSelectIngredient(ing.name)}
              className={`px-2 py-1 text-[10.5px] rounded-lg font-bold border transition cursor-pointer ${
                selectedIngredient === ing.name
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200'
              }`}
            >
              {ing.name} ({ing.phiDays} ngày)
            </button>
          ))}
        </div>
      </div>

      {/* Live PHI Guard Indicator */}
      {phiDays > 0 ? (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Khóa PHI kích hoạt: <strong>Cách ly {phiDays} ngày</strong>
            </span>
          </div>
          <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
            Thu hoạch từ: {safeHarvestDate}
          </span>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Không có thời gian cách ly (An toàn PHI)</span>
        </div>
      )}
    </div>
  );
};
