import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  TrendingUp,
  Sprout,
  Calendar,
  BookOpen,
  Wheat,
  Package,
  Warehouse,
  Receipt,
  Award,
  FileCheck,
  ClipboardCheck,
  BarChart3,
  History,
  ShieldCheck,
  Coins,
  Settings,
} from 'lucide-react';

export interface NavItem {
  title: string;
  path: string;
  icon?: any;
  badge?: {
    text: string | number;
    color: 'green' | 'amber' | 'red' | 'blue';
  };
  roles?: string[];
}

export interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const navigationConfig: NavGroup[] = [
  {
    groupTitle: 'TỔNG QUAN',
    items: [
      {
        title: 'Tổng quan',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    groupTitle: 'QUẢN LÝ HTX',
    items: [
      {
        title: 'Hồ sơ HTX',
        path: '/cooperative',
        icon: Building2,
      },
      {
        title: 'Xã viên',
        path: '/members',
        icon: Users,
      },
      {
        title: 'Vốn góp',
        path: '/capital',
        icon: Wallet,
      },
      {
        title: 'Phân chia lợi nhuận',
        path: '/profit-distribution',
        icon: TrendingUp,
      },
    ],
  },
  {
    groupTitle: 'QUẢN LÝ NGHIỆP VỤ',
    items: [
      {
        title: 'Vùng trồng',
        path: '/agriculture/plots',
        icon: Sprout,
      },
      {
        title: 'Mùa vụ',
        path: '/agriculture/seasons',
        icon: Calendar,
      },
      {
        title: 'Sản xuất & Nhật ký',
        path: '/agriculture/logs',
        icon: BookOpen,
      },
      {
        title: 'Thu hoạch & Truy xuất',
        path: '/agriculture/harvests',
        icon: Wheat,
      },
    ],
  },
  {
    groupTitle: 'KHO & SẢN PHẨM',
    items: [
      {
        title: 'Vật tư - Nông cụ',
        path: '/inventory/materials',
        icon: Warehouse,
        badge: { text: '2', color: 'red' }, // 2 ít tồn
      },
      {
        title: 'Sản phẩm OCOP',
        path: '/inventory/products',
        icon: Package,
      },
    ],
  },
  {
    groupTitle: 'HỒ SƠ & ĐÁNH GIÁ OCOP',
    items: [
      {
        title: 'Bộ tiêu chí OCOP',
        path: '/ocop/criteria',
        icon: ShieldCheck,
      },
      {
        title: 'Hồ sơ OCOP',
        path: '/ocop/dossiers',
        icon: Award,
        badge: { text: '4', color: 'green' }, // 4 hồ sơ active
      },
      {
        title: 'Minh chứng số',
        path: '/ocop/evidences',
        icon: FileCheck,
      },
      {
        title: 'Đánh giá Hội đồng',
        path: '/ocop/evaluation',
        icon: ClipboardCheck,
      },
      {
        title: 'Quyết định & Giấy chứng nhận',
        path: '/ocop/decisions',
        icon: Award,
      },
    ],
  },
  {
    groupTitle: 'TÀI CHÍNH & HỆ THỐNG',
    items: [
      {
        title: 'Nhật ký giao dịch',
        path: '/finance',
        icon: Coins,
        badge: { text: '1', color: 'amber' }, // 1 chờ duyệt
      },
      {
        title: 'Báo cáo - Thống kê',
        path: '/reports',
        icon: BarChart3,
      },
      {
        title: 'Nhật ký kiểm toán',
        path: '/audit',
        icon: History,
      },
      {
        title: 'Cài đặt hệ thống',
        path: '/system/settings',
        icon: Settings,
      },
    ],
  },
];
