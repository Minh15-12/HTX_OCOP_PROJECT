import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Users,
  Building,
  History,
  Database,
  Lock,
  Save,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastNotification';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { tokenStorage } from '@/services/tokenStorage';
import {
  systemService,
  SystemSettings,
  Role,
  PermissionGroup,
  UserItem,
} from '@/services/systemService';
import { SystemInfoCard } from '../components/SystemInfoCard';
import { RoleManagementCard } from '../components/RoleManagementCard';
import { RolePermissionMatrixCard } from '../components/RolePermissionMatrixCard';
import { UserManagementCard } from '../components/UserManagementCard';
import { SystemAuditLogCard } from '../components/SystemAuditLogCard';
import { BackupRestoreCard } from '../components/BackupRestoreCard';
import { SecuritySettingsCard } from '../components/SecuritySettingsCard';
import { UserModal } from '../components/UserModal';
import { BusinessSettingsCard } from '../components/BusinessSettingsCard';
import { TenantManagementCard } from '../components/TenantManagementCard';

type TabKey = 'overview' | 'permissions' | 'users' | 'roles' | 'config' | 'business' | 'audit' | 'backup' | 'tenants';


const MOCK_PERMISSION_GROUPS: PermissionGroup[] = [
  {
    module: 'Quản lý Xã viên',
    permissions: [
      { id: 'p1', code: 'MEMBER.READ', name: 'Xem danh sách xã viên', module: 'Xã viên' },
      { id: 'p2', code: 'MEMBER.CREATE', name: 'Tạo hồ sơ xã viên', module: 'Xã viên' },
      { id: 'p3', code: 'MEMBER.APPROVE', name: 'Phê duyệt kết nạp', module: 'Xã viên' },
      { id: 'p4', code: 'MEMBER.UPDATE', name: 'Cập nhật thông tin', module: 'Xã viên' },
      { id: 'p5', code: 'MEMBER.APPROVE_LEGAL_CHANGE', name: 'Duyệt thay đổi pháp lý', module: 'Xã viên' },
      { id: 'p6', code: 'MEMBER.SUSPEND', name: 'Đình chỉ tư cách', module: 'Xã viên' },
      { id: 'p7', code: 'MEMBER.TERMINATE', name: 'Chấm dứt tư cách', module: 'Xã viên' },
      { id: 'p8', code: 'MEMBER.READ_OWN', name: 'Xem hồ sơ cá nhân', module: 'Xã viên' },
    ],
  },
  {
    module: 'Quản lý Vốn góp',
    permissions: [
      { id: 'p9', code: 'CAPITAL.MANAGE', name: 'Ghi nhận vốn góp', module: 'Vốn góp' },
      { id: 'p10', code: 'CAPITAL.APPROVE', name: 'Phê duyệt vốn góp', module: 'Vốn góp' },
    ],
  },
];

export const SystemSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const { activeCooperative, setCooperative } = useTenantContextStore();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const [settings, setSettings] = useState<SystemSettings>({
    system_name: activeCooperative?.legal_name || 'Hệ thống Quản lý HTX-OCOP',
    managing_unit: activeCooperative?.legal_name || 'Hợp tác xã Nông nghiệp',
    default_language: 'Tiếng Việt',
    timezone: '(GMT+07:00) Asia/Ho_Chi_Minh',
    address: 'Trụ sở chính HTX',
    date_format: 'dd/mm/yyyy',
    support_email: 'hotro@htx-ocop.vn',
    support_phone: '1900 1234',
    system_version: 'v1.0.0',
    logo_url: null,
    enable_2fa: false,
    limit_failed_login: true,
    auto_logout_idle: true,
    idle_timeout_minutes: 30,
  });

  const [roles, setRoles] = useState<Role[]>([
    { id: 'r1', code: 'HTX_OWNER', name: 'Ban Giám Đốc HTX', description: 'Toàn quyền tại HTX', user_count: 3, status: 'Hoạt động', permissions: ['MEMBER.READ', 'MEMBER.CREATE', 'FINANCE.READ', 'FINANCE.TRANSACTION.APPROVE'] },
    { id: 'r2', code: 'ACCOUNTANT', name: 'Kế toán HTX', description: 'Quản lý tài chính, vốn góp', user_count: 2, status: 'Hoạt động', permissions: ['MEMBER.READ', 'FINANCE.READ', 'FINANCE.TRANSACTION.CREATE'] },
    { id: 'r3', code: 'STOREKEEPER', name: 'Thủ kho', description: 'Quản lý xuất nhập tồn', user_count: 3, status: 'Hoạt động', permissions: ['INVENTORY.READ', 'INVENTORY.CREATE', 'INVENTORY.UPDATE'] },
    { id: 'r4', code: 'AGRICULTURE_OFFICER', name: 'Cán bộ Nông nghiệp', description: 'Quản lý vùng trồng, mùa vụ', user_count: 5, status: 'Hoạt động', permissions: ['AGRICULTURE.READ', 'AGRICULTURE.CREATE', 'AGRICULTURE.UPDATE'] },
    { id: 'r5', code: 'OCOP_PREPARER', name: 'Cán bộ OCOP', description: 'Lập hồ sơ OCOP', user_count: 2, status: 'Hoạt động', permissions: ['OCOP_APPLICATION.READ', 'OCOP_APPLICATION.CREATE', 'OCOP_APPLICATION.SUBMIT', 'OCOP_EVIDENCE.UPLOAD'] },
    { id: 'r6', code: 'COUNCIL_MEMBER', name: 'Hội đồng OCOP', description: 'Thẩm định hồ sơ OCOP', user_count: 15, status: 'Hoạt động', permissions: ['OCOP_EVALUATION.READ', 'OCOP_EVALUATION.SCORE'] },
    { id: 'r7', code: 'SYSTEM_ADMIN', name: 'Quản trị hệ thống', description: 'Cấu hình kỹ thuật', user_count: 1, status: 'Hoạt động', permissions: ['USER.CREATE', 'ROLE.MANAGE'] },
  ]);

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>('r2');
  const [permissionsGrouped, setPermissionsGrouped] = useState<PermissionGroup[]>(MOCK_PERMISSION_GROUPS);
  const [users, setUsers] = useState<UserItem[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // User modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserItem | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [settingRes, roleRes, userRes, permRes] = await Promise.allSettled([
        systemService.getSettings(),
        systemService.getRoles(),
        systemService.getUsers(),
        systemService.getPermissions(),
      ]);

      if (settingRes.status === 'fulfilled' && settingRes.value) {
        setSettings(prev => ({ ...prev, ...settingRes.value }));
      }
      if (roleRes.status === 'fulfilled' && Array.isArray(roleRes.value) && roleRes.value.length > 0) {
        setRoles(roleRes.value);
        if (!selectedRoleId) setSelectedRoleId(roleRes.value[0].id);
      }
      if (userRes.status === 'fulfilled' && Array.isArray(userRes.value)) {
        setUsers(userRes.value);
      }
      if (permRes.status === 'fulfilled' && permRes.value?.grouped) {
        setPermissionsGrouped(permRes.value.grouped);
      }
    } catch (err) {
      console.warn('API error, using default state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const merged = await systemService.updateSettings(settings);
      const newName = merged.system_name || merged.managing_unit;
      if (newName) {
        const currentCoop = tokenStorage.getCooperative();
        setCooperative({
          id: currentCoop?.id || '',
          cooperative_code: currentCoop?.cooperative_code || '',
          legal_name: newName,
          status: 'ACTIVE',
        });
      }
      showToast('Cập nhật cài đặt hệ thống thành công!', 'success');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Không thể lưu cài đặt hệ thống. Vui lòng thử lại!';
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRolePermissions = async (roleId: string, permissions: string[]) => {
    setIsSaving(true);
    try {
      await systemService.updateRolePermissions(roleId, permissions);
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions } : r));
      showToast('Cập nhật ma trận phân quyền thành công!', 'success');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Không thể lưu phân quyền vai trò. Vui lòng thử lại!';
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUser = async (formData: any) => {
    setIsSaving(true);
    try {
      if (userToEdit) {
        const updated = await systemService.updateUser(userToEdit.id, formData);
        setUsers(prev => prev.map(u => u.id === userToEdit.id ? { ...u, ...formData, ...updated } : u));
        showToast('Cập nhật người dùng thành công!', 'success');
      } else {
        const created = await systemService.createUser(formData);
        setUsers(prev => [created, ...prev]);
        showToast('Thêm mới người dùng thành công!', 'success');
      }
      setIsUserModalOpen(false);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Không thể lưu thông tin người dùng. Vui lòng kiểm tra lại!';
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const updated = await systemService.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: updated?.status || (u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE') } : u));
      showToast('Đã đổi trạng thái tài khoản thành công!', 'success');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Không thể thay đổi trạng thái tài khoản!';
      showToast(errorMsg, 'error');
    }
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0] || null;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-800">Cài đặt hệ thống</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý cấu hình hệ thống, phân quyền, người dùng và các thiết lập chung của Hợp tác xã
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchInitialData}>
            Làm mới
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveSettings} isLoading={isSaving}>
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* Navigation Tabs (Identical to mockup image) */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-3 pt-2 shadow-xs">
        <nav className="flex space-x-2 overflow-x-auto scrollbar-none" aria-label="Tabs">
          {[
            { key: 'overview', label: 'Tổng quan', icon: Building },
            { key: 'tenants', label: 'Mô hình Liên hiệp / Chi nhánh', icon: Building },
            { key: 'config', label: 'Cấu hình nghiệp vụ', icon: Settings },
            { key: 'roles', label: 'Vai trò & Phân quyền', icon: ShieldCheck },
            { key: 'users', label: 'Người dùng', icon: Users },
            { key: 'audit', label: 'Nhật ký hệ thống', icon: History },
            { key: 'backup', label: 'Sao lưu & Phục hồi', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 font-bold rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="p-6 bg-slate-50/50">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <SystemInfoCard settings={settings} onChange={handleSettingChange} onSave={handleSaveSettings} isSaving={isSaving} />
            <SecuritySettingsCard settings={settings} onChange={handleSettingChange} onSave={handleSaveSettings} isSaving={isSaving} />
          </div>
        )}

        {/* TAB: TENANTS */}
        {activeTab === 'tenants' && (
          <div className="animate-fade-in">
            <TenantManagementCard />
          </div>
        )}

        {/* TAB 2: CONFIG / BUSINESS SETTINGS */}
        {activeTab === 'config' && (
          <div className="animate-fade-in">
            <BusinessSettingsCard settings={settings} onChange={handleSettingChange} onSave={handleSaveSettings} isSaving={isSaving} />
          </div>
        )}

        {/* TAB 3: ROLES & PERMISSIONS */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            <div className="lg:col-span-5">
              <RoleManagementCard roles={roles} selectedRoleId={selectedRoleId} onSelectRole={(id) => setSelectedRoleId(id)} onAddRole={() => {}} />
            </div>
            <div className="lg:col-span-7">
              <RolePermissionMatrixCard role={selectedRole} permissionGroups={permissionsGrouped} onSavePermissions={handleSaveRolePermissions} isSaving={isSaving} />
            </div>
          </div>
        )}

        {/* TAB 4: USERS */}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <UserManagementCard
              users={users}
              onAddUser={() => {
                setUserToEdit(null);
                setIsUserModalOpen(true);
              }}
              onEditUser={(u) => {
                setUserToEdit(u);
                setIsUserModalOpen(true);
              }}
              onToggleStatus={handleToggleUserStatus}
            />
          </div>
        )}

        {/* TAB 5: AUDIT */}
        {activeTab === 'audit' && (
          <div className="animate-fade-in">
            <SystemAuditLogCard />
          </div>
        )}

        {/* TAB 6: BACKUP */}
        {activeTab === 'backup' && (
          <div className="animate-fade-in">
            <BackupRestoreCard />
          </div>
        )}
      </div>

      {/* Add / Edit User Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        roles={roles}
        userToEdit={userToEdit}
        isLoading={isSaving}
      />
    </div>
  );
};
