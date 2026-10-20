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
        roles: ['ADMIN', 'SYSTEM_ADMIN', 'HTX_OWNER', 'HTX_DIRECTOR', 'HTX_BOARD_MEMBER'],
      },
      {
        title: 'Xã viên HTX',
        path: '/members',
        icon: Users,
        roles: ['ADMIN', 'SYSTEM_ADMIN', 'HTX_OWNER', 'HTX_DIRECTOR', 'HTX_STAFF', 'ACCOUNTANT'],
      },
      {
        title: 'Sổ vốn điều lệ',
        path: '/capital',
        icon: Wallet,
        roles: ['ADMIN', 'SYSTEM_ADMIN', 'HTX_OWNER', 'HTX_DIRECTOR', 'ACCOUNTANT'],
      },
      {
        title: 'Phân phối thặng dư',
        path: '/profit-distribution',
        icon: TrendingUp,
        roles: ['ADMIN', 'SYSTEM_ADMIN', 'HTX_OWNER', 'HTX_DIRECTOR', 'ACCOUNTANT'],
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
        roles: ['ADMIN', 'SYSTEM_ADMIN', 'HTX_OWNER', 'HTX_STAFF', 'AGRICULTURE_OFFICER'],
      },
      {
        title: 'Kế hoạch Mùa vụ',
        path: '/agriculture/seasons',
        icon: Calendar,
        roles: ['ADMIN', 'SYSTEM_ADMIN', 'HTX_OWNER', 'HTX_STAFF', 'AGRICULTURE_OFFICER'],
      },
      {
        title: 'Nhật ký canh tác điện tử',
        path: '/agriculture/logs',
        icon: BookOpen,
        roles: ['ADMIN', 'SYSTEM_ADMIN', 'HTX_OWNER', 'HTX_STAFF', 'AGRICULTURE_OFFICER'],
      },
      {
        title: 'Thu hoạch & Lô tem GS1',
        path: '/agriculture/harvests',
        icon: Wheat,
        roles: ['ADMIN', 'SYSTEM_ADMIN', 'HTX_OWNER', 'HTX_STAFF', 'AGRICULTURE_OFFICER'],
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
        roles: ['ADMIN', 'SYSTEM_ADMIN', 'HTX_OWNER', 'HTX_STAFF', 'STOREKEEPER'],
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
        roles: ['ADMIN', 'SYSTEM_ADMIN', 'HTX_OWNER', 'CHAIRMAN', 'COUNCIL_CHAIR', 'COUNCIL_MEMBER', 'EVALUATOR'],
      },
      {
        title: 'Quyết định & Cấp sao',
        path: '/ocop/decisions',
        icon: ShieldCheck,
        roles: ['ADMIN', 'SYSTEM_ADMIN', 'HTX_OWNER', 'CHAIRMAN', 'COUNCIL_CHAIR', 'COUNCIL_MEMBER', 'EVALUATOR'],
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
        roles: ['ADMIN', 'SYSTEM_ADMIN', 'HTX_OWNER', 'HTX_DIRECTOR', 'ACCOUNTANT'],
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
        roles: ['ADMIN', 'SYSTEM_ADMIN', 'HTX_OWNER', 'HTX_SUPERVISOR', 'AUDITOR'],
      },
      {
        title: 'Cài đặt hệ thống',
        path: '/system/settings',
        icon: Settings,
        roles: ['ADMIN', 'SYSTEM_ADMIN', 'HTX_OWNER'],
      },
    ],
  },
];

