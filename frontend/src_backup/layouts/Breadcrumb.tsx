import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const pathNameMap: Record<string, string> = {
  dashboard: 'Tổng quan',
  cooperative: 'Hợp tác xã',
  members: 'Thành viên',
  agriculture: 'Sản xuất nông nghiệp',
  plots: 'Đơn vị & Vùng trồng',
  seasons: 'Mùa vụ',
  logs: 'Nhật ký canh tác',
  harvests: 'Thu hoạch & Lô',
  inventory: 'Kho & Sản phẩm',
  products: 'Sản phẩm',
  materials: 'Vật tư & Kho',
  finance: 'Tài chính HTX',
  transactions: 'Giao dịch',
  debts: 'Công nợ',
  ocop: 'OCOP',
  criteria: 'Bộ tiêu chí',
  dossier: 'Hồ sơ',
  evidences: 'Minh chứng số',
  evaluation: 'Đánh giá Hội đồng',
  reports: 'Báo cáo tổng hợp',
  audit: 'Nhật ký kiểm toán',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center text-xs text-slate-500 gap-1.5 py-2 px-1">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-cop-600 transition-colors font-medium"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Trang chủ</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = pathNameMap[value] || value;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800 capitalize">{displayName}</span>
            ) : (
              <Link to={to} className="hover:text-cop-600 transition-colors font-medium capitalize">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
