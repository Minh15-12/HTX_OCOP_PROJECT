import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, Sprout, Package, Award, ArrowRight, CornerDownLeft, FileText } from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  category: 'XÃ VIÊN' | 'VÙNG TRỒNG' | 'SẢN PHẨM' | 'HỒ SƠ OCOP' | 'CHỨC NĂNG';
  subtitle: string;
  path: string;
  icon: React.ReactNode;
}

const SEARCH_DIRECTORY: SearchItem[] = [
  {
    id: 'nav-members',
    title: 'Danh sách Xã viên HTX',
    category: 'CHỨC NĂNG',
    subtitle: 'Quản lý hồ sơ, duyệt thành viên, biến động tư cách xã viên',
    path: '/members',
    icon: <Users className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: 'nav-capital',
    title: 'Sổ vốn điều lệ & Giấy chứng nhận',
    category: 'CHỨC NĂNG',
    subtitle: 'Theo dõi vốn góp bằng tiền mặt, chuyển khoản, đất đai',
    path: '/capital',
    icon: <FileText className="w-4 h-4 text-blue-600" />,
  },
  {
    id: 'nav-plots',
    title: 'Vùng trồng & Thửa đất canh tác',
    category: 'CHỨC NĂNG',
    subtitle: 'Bản đồ số hóa, mã số vùng trồng PUC, thửa ruộng thành viên',
    path: '/agriculture/plots',
    icon: <Sprout className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: 'nav-logs',
    title: 'Nhật ký canh tác điện tử & Cảnh báo PHI',
    category: 'CHỨC NĂNG',
    subtitle: 'Theo dõi 10 trường Thông tư 02, cách ly thuốc BVTV',
    path: '/agriculture/logs',
    icon: <Sprout className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: 'nav-harvests',
    title: 'Thu hoạch & Lô hàng GS1',
    category: 'CHỨC NĂNG',
    subtitle: 'Cấp mã QR truy xuất nguồn gốc, phân loại KCS 3 cấp',
    path: '/agriculture/harvests',
    icon: <Package className="w-4 h-4 text-amber-600" />,
  },
  {
    id: 'nav-ocop-dossiers',
    title: 'Hồ sơ OCOP Quyết định 148',
    category: 'HỒ SƠ OCOP',
    subtitle: 'Ớt chuông Sweet Palermo Đỏ Đà Lạt (Mục tiêu 4 sao)',
    path: '/ocop/dossiers',
    icon: <Award className="w-4 h-4 text-amber-600" />,
  },
  {
    id: 'nav-ocop-criteria',
    title: 'Bộ Tiêu chí OCOP 100 điểm',
    category: 'HỒ SƠ OCOP',
    subtitle: 'Xem cấu trúc Phần A (40đ), Phần B (25đ), Phần C (35đ)',
    path: '/ocop/criteria',
    icon: <Award className="w-4 h-4 text-amber-600" />,
  },
  {
    id: 'nav-products',
    title: 'Sản phẩm OCOP chủ lực',
    category: 'SẢN PHẨM',
    subtitle: 'Ớt chuông Sweet Palermo túi 500g tiêu chuẩn',
    path: '/inventory/products',
    icon: <Package className="w-4 h-4 text-blue-600" />,
  },
];

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered from parent or event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalized = searchTerm.trim().toLowerCase();
  const filtered = SEARCH_DIRECTORY.filter(
    (item) =>
      item.title.toLowerCase().includes(normalized) ||
      item.subtitle.toLowerCase().includes(normalized) ||
      item.category.toLowerCase().includes(normalized)
  );

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm nhanh chức năng, xã viên, vùng trồng, OCOP..."
            className="flex-1 bg-transparent text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-bold text-slate-500 bg-white border border-slate-200 rounded-md shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-1">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Không tìm thấy kết quả phù hợp</p>
              <p className="text-[11px] text-slate-400">Thử tìm theo từ khóa: "Xã viên", "Vùng trồng", "OCOP", "Vốn"</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.path)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center shrink-0 transition-colors">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[13px] text-slate-800 group-hover:text-emerald-900 transition-colors truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500 group-hover:bg-emerald-200/60 group-hover:text-emerald-800">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 truncate">{item.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-700 transition-colors shrink-0 ml-2">
                  <span className="text-[11px] font-medium hidden sm:inline">Mở</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>Mẹo: Nhấn</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded shadow-2xs text-slate-600">
              Ctrl + K
            </kbd>
            <span>để mở nhanh từ mọi nơi</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
