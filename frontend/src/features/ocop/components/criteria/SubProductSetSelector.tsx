import React from 'react';
import { Layers } from 'lucide-react';
import { OcopSubProductSet, OCOP_26_SUB_PRODUCT_SETS } from '../../data/criteriaCatalogData';

interface SubProductSetSelectorProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSubSetId: string;
  setSelectedSubSetId: (subId: string) => void;
  activeSubSet?: OcopSubProductSet;
}

export const SubProductSetSelector: React.FC<SubProductSetSelectorProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedSubSetId,
  setSelectedSubSetId,
  activeSubSet,
}) => {
  const categoryTabs = [
    { id: 'FOOD', label: '🌾 Thực phẩm', count: '10 Bộ SP' },
    { id: 'DRINK', label: '🍵 Đồ uống', count: '7 Bộ SP' },
    { id: 'HERB', label: '🌿 Thảo dược', count: '3 Bộ SP' },
    { id: 'CRAFT', label: '🏺 Thủ công', count: '2 Bộ SP' },
    { id: 'PLANT', label: '👘 SV Cảnh & May', count: '3 Bộ SP' },
    { id: 'TOURISM', label: '🏡 Du lịch', count: '1 Bộ SP' },
  ];

  return (
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
        {categoryTabs.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                const firstSub = OCOP_26_SUB_PRODUCT_SETS.find((s) => s.categoryKey === cat.id);
                if (firstSub) setSelectedSubSetId(firstSub.id);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-emerald-900 text-white border-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/30'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
              }`}
            >
              <div className="text-xs font-black">{cat.label}</div>
              <div
                className={`text-[10px] mt-0.5 ${
                  isSelected ? 'text-emerald-200' : 'text-slate-400'
                }`}
              >
                {cat.count}
              </div>
            </button>
          );
        })}
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
              const found = OCOP_26_SUB_PRODUCT_SETS.find((s) => s.id === subId);
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
                Đang xem: {activeSubSet.stt < 10 ? `0${activeSubSet.stt}` : activeSubSet.stt}.{' '}
                {activeSubSet.name}
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
  );
};
