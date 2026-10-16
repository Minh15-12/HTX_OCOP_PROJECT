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
  CheckSquare,
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
        title: 'Bàn làm việc tổng quan',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    groupTitle: 'QUẢN TRỊ HTX',
    items: [
      {
        title: 'Hồ sơ pháp lý HTX',
        path: '/cooperative',
        icon: Building2,
      },
      {
        title: 'Xã viên HTX',
        path: '/members',
        icon: Users,
      },
      {
        title: 'Sổ vốn điều lệ',
        path: '/capital',
        icon: Wallet,
      },
      {
        title: 'Phân phối thặng dư',
        path: '/profit-distribution',
        icon: TrendingUp,
      },
    ],
  },
  {
    groupTitle: 'SẢN XUẤT NÔNG NGHIỆP',
    items: [
      {
        title: 'Vùng trồng & Thửa đất',
        path: '/agriculture/plots',
        icon: Sprout,
      },
      {
        title: 'Kế hoạch Mùa vụ',
        path: '/agriculture/seasons',
        icon: Calendar,
      },
      {
        title: 'Nhật ký canh tác điện tử',
        path: '/agriculture/logs',
        icon: BookOpen,
      },
      {
        title: 'Thu hoạch & Lô tem GS1',
        path: '/agriculture/harvests',
        icon: Wheat,
      },
    ],
  },
  {
    groupTitle: 'KHO VẬT TƯ & SẢN PHẨM',
    items: [
      {
        title: 'Vật tư & Nông cụ',
        path: '/inventory/materials',
        icon: Warehouse,
      },
      {
        title: 'Sản phẩm OCOP',
        path: '/inventory/products',
        icon: Package,
      },
    ],
  },
  {
    groupTitle: 'HỒ SƠ & ĐÁNH GIÁ OCOP (QĐ 148)',
    items: [
      {
        title: 'Bộ Tiêu chí OCOP',
        path: '/ocop/criteria',
        icon: CheckSquare,
      },
      {
        title: 'Hồ sơ & Tự đánh giá',
        path: '/ocop/dossiers',
        icon: Award,
        badge: { text: '1', color: 'green' },
      },
      {
        title: 'Kho Minh chứng số',
        path: '/ocop/evidences',
        icon: FileCheck,
      },
      {
        title: 'Hội đồng thẩm định',
        path: '/ocop/evaluation',
        icon: ClipboardCheck,
        roles: ['ADMIN', 'COUNCIL_EVALUATOR', 'HTX_MANAGER', 'CHAIRMAN'],
      },
      {
        title: 'Quyết định & Cấp sao',
        path: '/ocop/decisions',
        icon: ShieldCheck,
      },
      {
        title: 'Báo cáo sẵn sàng OCOP',
        path: '/ocop/reports',
        icon: BarChart3,
      },
    ],
  },
  {
    groupTitle: 'TÀI CHÍNH & HỆ THỐNG',
    items: [
      {
        title: 'Sổ quỹ & Quyết toán',
        path: '/finance',
        icon: Coins,
      },
      {
        title: 'Báo cáo tổng hợp',
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

