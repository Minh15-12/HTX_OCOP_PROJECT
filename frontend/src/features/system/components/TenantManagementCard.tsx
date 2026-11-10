import React, { useState } from 'react';
import {
  Building2,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRightLeft,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useTenantContextStore } from '@/stores/tenantContextStore';

interface TenantItem {
  id: string;
  cooperative_code: string;
  legal_name: string;
  province: string;
  tax_code: string;
  representative_name: string;
  members_count: number;
  plots_count: number;
  dossiers_count: number;
  status: 'ACTIVE' | 'PENDING_REVIEW' | 'SUSPENDED';
  org_model: 'HTX Cơ sở' | 'Chi nhánh trực thuộc' | 'Đơn vị liên kết';
}

export const TenantManagementCard: React.FC = () => {
  const { activeCooperative, setCooperative } = useTenantContextStore();

  const [tenants, setTenants] = useState<TenantItem[]>(() => {
    if (activeCooperative) {
      return [{
        id: activeCooperative.id,
        cooperative_code: activeCooperative.cooperative_code || 'HTX-TANTIEN-01',
        legal_name: activeCooperative.legal_name,
        province: (activeCooperative as any).province || 'Lâm Đồng',
        tax_code: (activeCooperative as any).tax_code || '5801456789',
        representative_name: (activeCooperative as any).representative_name || 'Mai Văn Tân',
        members_count: 30,
        plots_count: 15,
        dossiers_count: 2,
        status: (activeCooperative.status as any) || 'ACTIVE',
        org_model: 'HTX Cơ sở',
      }];
    }
    return [];
  });
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<TenantItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCoopName, setNewCoopName] = useState('');
  const [newCoopCode, setNewCoopCode] = useState('');
  const [newProvince, setNewProvince] = useState('Lâm Đồng');
  const [newOrgModel, setNewOrgModel] = useState<'HTX Cơ sở' | 'Chi nhánh trực thuộc' | 'Đơn vị liên kết'>('Chi nhánh trực thuộc');

  const filteredTenants = tenants.filter(
    (t) =>
      t.legal_name.toLowerCase().includes(search.toLowerCase()) ||
      t.cooperative_code.toLowerCase().includes(search.toLowerCase()) ||
      t.province.toLowerCase().includes(search.toLowerCase())
  );

  const handleSwitchTenant = (tenant: TenantItem) => {
    setCooperative({
      id: tenant.id,
      cooperative_code: tenant.cooperative_code,
      legal_name: tenant.legal_name,
      status: tenant.status,
    });
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoopName || !newCoopCode) return;

    const newTenant: TenantItem = {
      id: `coop-${Date.now()}`,
      cooperative_code: newCoopCode.toUpperCase(),
      legal_name: newCoopName,
      province: newProvince,
      tax_code: `580${Math.floor(1000000 + Math.random() * 9000000)}`,
      representative_name: 'Chưa chỉ định',
      members_count: 0,
      plots_count: 0,
      dossiers_count: 0,
      status: 'ACTIVE',
      org_model: newOrgModel,
    };

    setTenants([newTenant, ...tenants]);
    setIsAddModalOpen(false);
    setNewCoopName('');
    setNewCoopCode('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <Building2 className="w-4 h-4 text-emerald-600" /> Quản trị Chi nhánh & Đơn vị Thành viên (Mô hình Liên hiệp HTX)
          </div>
          <h3 className="text-lg font-black text-slate-900 mt-0.5">
            Danh sách Chi nhánh & Đơn vị Sản xuất trong Liên minh
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị mở rộng theo Luật HTX 17/2023/QH15, duy trì cô lập cơ sở dữ liệu và dữ liệu nghiệp vụ theo từng đơn vị (Tenant Isolation).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm Đơn vị / Chi nhánh
        </button>
      </div>

      {/* Current Tenant Banner */}
      <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
            HTX
          </div>
          <div>
            <div className="text-[11px] text-emerald-800 font-bold uppercase">Ngữ cảnh Tenant đang hoạt động:</div>
            <div className="text-sm font-extrabold text-slate-900">
              {activeCooperative?.legal_name || 'Hợp tác xã Nông nghiệp Tân Tiến'}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Mã HTX: {activeCooperative?.cooperative_code || 'HTX-TANTIEN-01'} • UUID: {activeCooperative?.id || 'coop-01'}
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          Bảo mật cô lập RLS Active
        </span>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Tìm theo tên HTX, mã hoặc tỉnh thành..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Tenants Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Mã &amp; Tên Đơn vị HTX</th>
              <th className="py-3 px-4">Địa bàn / MST</th>
              <th className="py-3 px-4">Quy mô</th>
              <th className="py-3 px-4">Mô hình đơn vị</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredTenants.map((t) => {
              const isCurrent = (activeCooperative?.id || 'coop-01') === t.id;
              return (
                <tr key={t.id} className={`hover:bg-slate-50/80 transition-colors ${isCurrent ? 'bg-emerald-50/40' : ''}`}>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{t.legal_name}</div>
                    <div className="font-mono text-[11px] text-emerald-700">{t.cooperative_code}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3 h-3 text-slate-400" /> {t.province}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">MST: {t.tax_code}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-semibold">{t.members_count} xã viên</div>
                    <div className="text-[11px] text-slate-400">
                      {t.plots_count} vùng trồng • {t.dossiers_count} hồ sơ OCOP
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {t.org_model}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                        t.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status === 'ACTIVE' ? 'Đang hoạt động' : 'Chờ thẩm định'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isCurrent ? (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đang dùng
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSwitchTenant(t)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg border border-emerald-300 transition cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        Chuyển ngữ cảnh
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Add Tenant */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-scale-in">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" /> Đăng ký Hợp tác xã Mới
              </h4>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTenant} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Pháp nhân Hợp tác xã *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: HTX Nông nghiệp Công nghệ cao Cầu Đất"
                  value={newCoopName}
                  onChange={(e) => setNewCoopName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã định danh HTX (Cooperative Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: HTX-CAUDAT-04"
                  value={newCoopCode}
                  onChange={(e) => setNewCoopCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô hình tổ chức *</label>
                <select
                  value={newOrgModel}
                  onChange={(e) => setNewOrgModel(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="HTX Cơ sở">HTX Cơ sở (Độc lập)</option>
                  <option value="Chi nhánh trực thuộc">Chi nhánh trực thuộc</option>
                  <option value="Đơn vị liên kết">Đơn vị liên kết (Tổ hợp tác)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tỉnh / Thành phố trực thuộc</label>
                <select
                  value={newProvince}
                  onChange={(e) => setNewProvince(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="Lâm Đồng">Lâm Đồng</option>
                  <option value="Sơn La">Sơn La</option>
                  <option value="Đồng Tháp">Đồng Tháp</option>
                  <option value="Bắc Kạn">Bắc Kạn</option>
                  <option value="Gia Lai">Gia Lai</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Thêm đơn vị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
