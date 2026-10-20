import { useState, useEffect } from 'react';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SNOOZED';
export type TaskCategory = 'FINANCE' | 'MEMBER' | 'INVENTORY' | 'OCOP' | 'AGRICULTURE';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  categoryLabel: string;
  priority: TaskPriority;
  priorityLabel: string;
  status: TaskStatus;
  dueLabel: string;
  isOverdue?: boolean;
  timeAgo: string;
  link: string;
  actionType: 'REFUND_CAPITAL' | 'APPROVE_MEMBER' | 'RESTOCK_INVENTORY' | 'DISPATCH_BIOLOGICAL' | 'UPLOAD_EVIDENCE';
  actionLabel: string;
  quickAction?: boolean;
  meta?: {
    memberName?: string;
    memberCode?: string;
    amount?: number;
    materialName?: string;
    materialCode?: string;
    dossierCode?: string;
    dossierName?: string;
    expiryDate?: string;
  };
  completedAt?: string;
  resolutionNote?: string;
}

const STORAGE_KEY = 'htx_ocop_actionable_tasks';
const EVENT_NAME = 'htx_tasks_updated';

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'TASK-001',
    title: 'Hoàn tiền vốn nộp lại cho xã viên Võ Văn G (TV008)',
    description: 'Hồ sơ bị từ chối kết nạp do không đạt tiêu chí diện tích tối thiểu. Kế toán cần lập Phiếu Chi hoàn trả số tiền tạm thu: 10.000.000 ₫.',
    category: 'FINANCE',
    categoryLabel: 'Quản lý Xã viên & Vốn',
    priority: 'CRITICAL',
    priorityLabel: 'Cần chi trả',
    status: 'PENDING',
    dueLabel: 'Hạn chót: 17:00 hôm nay',
    isOverdue: false,
    timeAgo: '10 phút trước',
    link: '/members',
    actionType: 'REFUND_CAPITAL',
    actionLabel: 'Lập phiếu chi hoàn tiền',
    quickAction: true,
    meta: {
      memberName: 'Võ Văn G',
      memberCode: 'TV008',
      amount: 10000000,
    },
  },
  {
    id: 'TASK-002',
    title: 'Duyệt đơn gia nhập xã viên Nguyễn Thành Đạt (TV007)',
    description: 'Đã hoàn thành thẩm tra hồ sơ đăng ký chính thức & cam kết nộp 10.000.000 ₫ tiền vốn điều lệ vào tài khoản HTX.',
    category: 'MEMBER',
    categoryLabel: 'Ban Giám đốc / HĐQT',
    priority: 'HIGH',
    priorityLabel: 'Chờ duyệt',
    status: 'PENDING',
    dueLabel: 'Trong ngày hôm nay',
    isOverdue: false,
    timeAgo: 'Hôm nay',
    link: '/members',
    actionType: 'APPROVE_MEMBER',
    actionLabel: 'Xem & Phê duyệt',
    quickAction: true,
    meta: {
      memberName: 'Nguyễn Thành Đạt',
      memberCode: 'TV007',
      amount: 10000000,
    },
  },
  {
    id: 'TASK-003',
    title: 'Phân bón NPK 16-16-8 dưới ngưỡng tồn kho an toàn',
    description: 'Tồn kho hiện tại còn 150 kg (ngưỡng an toàn tối thiểu là 300 kg). Cần lập phiếu mua bổ sung cho mùa vụ Đông Xuân.',
    category: 'INVENTORY',
    categoryLabel: 'Quản lý Kho vật tư',
    priority: 'MEDIUM',
    priorityLabel: 'Cảnh báo kho',
    status: 'PENDING',
    dueLabel: 'Trước ngày 25/10/2026',
    isOverdue: false,
    timeAgo: 'Hôm qua',
    link: '/inventory/materials',
    actionType: 'RESTOCK_INVENTORY',
    actionLabel: 'Tạo phiếu nhập kho',
    quickAction: false,
    meta: {
      materialName: 'Phân bón NPK 16-16-8 Đầu Trâu',
      materialCode: 'VT001',
    },
  },
  {
    id: 'TASK-004',
    title: 'Chế phẩm Trichoderma Bio-VT sắp hết hạn (15/10/2026)',
    description: 'Còn 45 chai Trichoderma Bio-VT có HSD đến tháng 10/2026. Ưu tiên tạo phiếu xuất cấp cho Vụ Đông Xuân để xử lý rơm rạ & khử nấm đất.',
    category: 'INVENTORY',
    categoryLabel: 'Kho Vật tư & Mùa vụ',
    priority: 'CRITICAL',
    priorityLabel: 'Cảnh báo HSD',
    status: 'PENDING',
    dueLabel: 'Hạn dùng: 15/10/2026',
    isOverdue: true,
    timeAgo: 'Mới phát hiện',
    link: '/inventory/materials',
    actionType: 'DISPATCH_BIOLOGICAL',
    actionLabel: 'Cấp phát mùa vụ',
    quickAction: false,
    meta: {
      materialName: 'Chế phẩm sinh học Trichoderma Bio-VT',
      materialCode: 'VT002',
      expiryDate: '15/10/2026',
    },
  },
  {
    id: 'TASK-005',
    title: 'Bổ sung minh chứng OCOP Trà Oolong Mê Linh',
    description: 'Hội đồng thẩm định yêu cầu tải bổ sung Giấy chứng nhận ATVSTP & Phiếu xét nghiệm mẫu nước trước ngày 15/11/2026.',
    category: 'OCOP',
    categoryLabel: 'Quản lý Hồ sơ OCOP',
    priority: 'HIGH',
    priorityLabel: 'Hồ sơ OCOP',
    status: 'PENDING',
    dueLabel: 'Hạn chót: 15/11/2026',
    isOverdue: false,
    timeAgo: '2 ngày trước',
    link: '/ocop/dossiers',
    actionType: 'UPLOAD_EVIDENCE',
    actionLabel: 'Tải lên minh chứng',
    quickAction: false,
    meta: {
      dossierCode: 'DOS-2026-001',
      dossierName: 'Trà Oolong Mê Linh Thượng Hạng',
    },
  },
];

function getStoredTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored tasks:', e);
  }
  return DEFAULT_TASKS;
}

function saveTasks(tasks: TaskItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: tasks }));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

export function useTaskNotificationStore() {
  const [tasks, setTasks] = useState<TaskItem[]>(getStoredTasks);

  useEffect(() => {
    const handleUpdate = () => {
      setTasks(getStoredTasks());
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const pendingTasks = tasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const snoozedTasks = tasks.filter((t) => t.status === 'SNOOZED');
  const criticalTasks = pendingTasks.filter((t) => t.priority === 'CRITICAL');

  const pendingCount = pendingTasks.length;
  const totalCount = tasks.length;
  const completedPercent = totalCount > 0 ? Math.round((completedTasks.length / totalCount) * 100) : 100;

  const completeTask = (taskId: string, resolutionNote?: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'COMPLETED' as TaskStatus,
          completedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay',
          resolutionNote: resolutionNote || 'Đã xử lý dứt điểm thành công.',
        };
      }
      return t;
    });
    saveTasks(updated);
    setTasks(updated);
  };

  const snoozeTask = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'SNOOZED' as TaskStatus,
          dueLabel: 'Nhắc lại vào ngày mai',
        };
      }
      return t;
    });
    saveTasks(updated);
    setTasks(updated);
  };

  const dismissTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    saveTasks(updated);
    setTasks(updated);
  };

  const markAllAsRead = () => {
    const updated = tasks.map((t) => ({
      ...t,
      status: 'COMPLETED' as TaskStatus,
      completedAt: 'Vừa xong',
      resolutionNote: 'Đánh dấu hoàn thành toàn bộ hàng loạt.',
    }));
    saveTasks(updated);
    setTasks(updated);
  };

  const resetDefaultTasks = () => {
    saveTasks(DEFAULT_TASKS);
    setTasks(DEFAULT_TASKS);
  };

  return {
    tasks,
    pendingTasks,
    completedTasks,
    snoozedTasks,
    criticalTasks,
    pendingCount,
    totalCount,
    completedPercent,
    completeTask,
    snoozeTask,
    dismissTask,
    markAllAsRead,
    resetDefaultTasks,
  };
}
