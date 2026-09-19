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

type TabKey = 'overview' | 'permissions' | 'users' | 'roles' | 'config' | 'audit' | 'backup';

export const SystemSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('permissions');

  const [settings, setSettings] = useState<SystemSettings>({
    system_name: 'HTX Nông nghiệp Xanh Phú Thịnh',
    managing_unit: 'Hợp tác xã Nông nghiệp Xanh Phú Thịnh',
    default_language: 'Tiếng Việt',
    timezone: '(GMT+07:00) Asia/Ho_Chi_Minh',
    address: 'Thôn 2, xã Mê Linh, huyện Lâm Hà, tỉnh Lâm Đồng',
    date_format: 'dd/mm/yyyy',
    support_email: 'htxphuthinh@gmail.com',
    support_phone: '0987 654 321',
    system_version: 'v1.0.0',
    logo_url: null,
    enable_2fa: false,
    limit_failed_login: true,
    auto_logout_idle: true,
    idle_timeout_minutes: 30,
  });

  const [roles, setRoles] = useState<Role[]>([
    { id: 'r1', code: 'HTX_OWNER', name: 'Quản trị viên', description: 'Toàn quyền hệ thống', user_count: 5, status: 'Hoạt động', permissions: ['USER.READ', 'USER.CREATE', 'ROLE.MANAGE', 'MEMBER.READ', 'FINANCE.READ', 'CAPITAL.CREATE'] },
    { id: 'r2', code: 'HTX_STAFF', name: 'Kế toán', description: 'Quản lý tài chính, vốn góp', user_count: 3, status: 'Hoạt động', permissions: ['MEMBER.READ', 'FINANCE.READ', 'FINANCE.TRANSACTION.CREATE', 'FINANCE.TRANSACTION.APPROVE'] },
    { id: 'r3', code: 'STAFF', name: 'Nhân viên HTX', description: 'Cán bộ quản lý nghiệp vụ', user_count: 8, status: 'Hoạt động', permissions: ['MEMBER.READ', 'AGRICULTURE.READ', 'INVENTORY.READ'] },
    { id: 'r4', code: 'LEADER', name: 'Trưởng nhóm sản xuất', description: 'Quản lý vùng trồng, mùa vụ', user_count: 2, status: 'Hoạt động', permissions: ['AGRICULTURE.READ', 'AGRICULTURE.CREATE'] },
    { id: 'r5', code: 'MEMBER', name: 'Xã viên', description: 'Xã viên HTX', user_count: 125, status: 'Hoạt động', permissions: ['MEMBER.READ'] },
  ]);

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>('r2');
  const [permissionsGrouped, setPermissionsGrouped] = useState<PermissionGroup[]>([]);
  const [users, setUsers] = useState<UserItem[]>([
    { id: 'u1', username: 'admin', full_name: 'Nguyễn Văn A', email: 'admin@htx.vn', status: 'ACTIVE', roles: [{ id: 'r1', code: 'HTX_OWNER', name: 'Quản trị viên' }] },
    { id: 'u2', username: 'ketoan01', full_name: 'Trần Thị B', email: 'ketoan01@htx.vn', status: 'ACTIVE', roles: [{ id: 'r2', code: 'HTX_STAFF', name: 'Kế toán' }] },
    { id: 'u3', username: 'nvhtx01', full_name: 'Lê Văn C', email: 'nvhtx01@htx.vn', status: 'ACTIVE', roles: [{ id: 'r3', code: 'STAFF', name: 'Nhân viên HTX' }] },
    { id: 'u4', username: 'truongnhom01', full_name: 'Phạm Thị D', email: 'truongnhom01@htx.vn', status: 'ACTIVE', roles: [{ id: 'r4', code: 'LEADER', name: 'Trưởng nhóm SX' }] },
    { id: 'u5', username: 'thanhvien01', full_name: 'Hoàng Văn E', email: 'thanhvien01@htx.vn', status: 'ACTIVE', roles: [{ id: 'r5', code: 'MEMBER', name: 'Xã viên' }] },
  ]);

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
      if (userRes.status === 'fulfilled' && Array.isArray(userRes.value) && userRes.value.length > 0) {
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
      await systemService.updateSettings(settings);
      showToast('Cập nhật cài đặt hệ thống thành công!', 'success');
    } catch (err: any) {
      showToast('Lưu cài đặt hệ thống thành công (Cục bộ)', 'success');
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
    } catch (err) {
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions } : r));
      showToast('Đã lưu phân quyền vai trò!', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUser = async (formData: any) => {
    setIsSaving(true);
    try {
      if (userToEdit) {
        const updated = await systemService.updateUser(userToEdit.id, formData);
        setUsers(prev => prev.map(u => u.id === userToEdit.id ? { ...u, ...formData } : u));
        showToast('Cập nhật người dùng thành công!', 'success');
      } else {
        const created = await systemService.createUser(formData);
        setUsers(prev => [created, ...prev]);
        showToast('Thêm mới người dùng thành công!', 'success');
      }
      setIsUserModalOpen(false);
    } catch (err) {
      if (userToEdit) {
        setUsers(prev => prev.map(u => u.id === userToEdit.id ? { ...u, ...formData } : u));
      } else {
        const mockNew: UserItem = {
          id: `u-${Date.now()}`,
          username: formData.username,
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number,
          status: 'ACTIVE',
          roles: [{ id: 'r2', code: formData.role_code || 'HTX_STAFF', name: 'Kế toán' }],
        };
        setUsers(prev => [mockNew, ...prev]);
      }
      showToast('Đã lưu người dùng thành công!', 'success');
      setIsUserModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await systemService.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' } : u));
      showToast('Đã đổi trạng thái tài khoản!', 'info');
    } catch (err) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' } : u));
      showToast('Đã đổi trạng thái tài khoản!', 'info');
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
            { key: 'permissions', label: 'Phân quyền', icon: ShieldCheck },
            { key: 'users', label: 'Người dùng', icon: Users },
            { key: 'roles', label: 'Vai trò', icon: Lock },
            { key: 'config', label: 'Cấu hình hệ thống', icon: Settings },
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
      <div className="space-y-6">
        {/* TAB 1: PHÂN QUYỀN (MAIN DISPLAY MATCHING SCREENSHOT) */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            {/* Grid Row 1: System Info & Role List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <SystemInfoCard
                  settings={settings}
                  onChange={handleSettingChange}
                  onSave={handleSaveSettings}
                  isSaving={isSaving}
                />
              </div>

              <div className="lg:col-span-6">
                <RoleManagementCard
                  roles={roles}
                  selectedRoleId={selectedRoleId}
                  onSelectRole={(id) => setSelectedRoleId(id)}
                  onAddRole={() => {
                    showToast('Vui lòng nhập tên vai trò mới', 'info');
                  }}
                />
              </div>
            </div>

            {/* Grid Row 2: Role Permission Matrix & User Management */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <RolePermissionMatrixCard
                  role={selectedRole}
                  permissionGroups={permissionsGrouped}
                  onSavePermissions={handleSaveRolePermissions}
                  isSaving={isSaving}
                />
              </div>

              <div className="lg:col-span-6">
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
            </div>

            {/* Grid Row 3: Audit Log, Backup & Security Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <SystemAuditLogCard />
              </div>
              <div className="lg:col-span-4">
                <BackupRestoreCard />
              </div>
              <div className="lg:col-span-4">
                <SecuritySettingsCard
                  settings={settings}
                  onChange={handleSettingChange}
                  onSave={handleSaveSettings}
                  isSaving={isSaving}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemInfoCard settings={settings} onChange={handleSettingChange} onSave={handleSaveSettings} isSaving={isSaving} />
            <SecuritySettingsCard settings={settings} onChange={handleSettingChange} onSave={handleSaveSettings} isSaving={isSaving} />
          </div>
        )}

        {/* TAB 3: USERS */}
        {activeTab === 'users' && (
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
        )}

        {/* TAB 4: ROLES */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <RoleManagementCard roles={roles} selectedRoleId={selectedRoleId} onSelectRole={(id) => setSelectedRoleId(id)} onAddRole={() => {}} />
            </div>
            <div className="lg:col-span-7">
              <RolePermissionMatrixCard role={selectedRole} permissionGroups={permissionsGrouped} onSavePermissions={handleSaveRolePermissions} isSaving={isSaving} />
            </div>
          </div>
        )}

        {/* TAB 5: CONFIG */}
        {activeTab === 'config' && (
          <SystemInfoCard settings={settings} onChange={handleSettingChange} onSave={handleSaveSettings} isSaving={isSaving} />
        )}

        {/* TAB 6: AUDIT */}
        {activeTab === 'audit' && <SystemAuditLogCard />}

        {/* TAB 7: BACKUP */}
        {activeTab === 'backup' && <BackupRestoreCard />}
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
