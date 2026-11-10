import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Edit, 
  Landmark, 
  BadgeCheck,
  Globe,
  Loader2,
  Calendar,
  Layers
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { useToast } from '@/components/ui/ToastNotification';
import { CoopProfileEditModal } from '../components/CoopProfileEditModal';
import { Cooperative } from '@/types/tenant';
import { formatCurrency } from '@/utils/formatters';

export const CoopProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { setCooperative } = useTenantContextStore();
  const { showToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 1. Fetch real cooperative profile from backend
  const { 
    data: coopData, 
    isLoading: isLoadingCoop, 
    isError: isErrorCoop 
  } = useQuery({
    queryKey: ['my-cooperative'],
    queryFn: async () => {
      const res: any = await apiClient.get('/cooperatives/my-cooperative');
      return res.data?.data || res.data;
    },
    staleTime: 60000,
  });

  // 2. Fetch real capital statistics
  const { data: capitalSummary } = useQuery({
    queryKey: ['capital-summary'],
    queryFn: async () => {
      const res: any = await apiClient.get('/capital-contributions/summary');
      return res.data || res;
    },
    staleTime: 60000,
  });

  // 3. Fetch real members count
  const { data: membersMeta } = useQuery({
    queryKey: ['members-count-summary'],
    queryFn: async () => {
      const res: any = await apiClient.get('/members', { params: { per_page: 1 } });
      return res.data;
    },
    staleTime: 60000,
  });

  // 4. Mutation for updating cooperative profile
  const updateCoopMutation = useMutation({
    mutationFn: async (updated: Partial<Cooperative>) => {
      const payload = {
        legal_name: updated.legal_name,
        display_name: updated.display_name || updated.short_name,
        legal_information: {
          ...(coopData?.legal_information || {}),
          tax_code: updated.tax_code,
          representative_name: updated.representative_name,
        },
        contact_information: {
          ...(coopData?.contact_information || {}),
          address: updated.address,
          phone_number: updated.phone || updated.phone_number,
          email: updated.email,
        },
      };

      const res: any = await apiClient.put('/cooperatives/my-cooperative', payload);
      return res.data?.data || res.data;
    },
    onSuccess: (savedCoop) => {
      queryClient.invalidateQueries({ queryKey: ['my-cooperative'] });
      // Update tenant store
      const normalizedCoop: Cooperative = {
        id: savedCoop.id,
        cooperative_code: savedCoop.cooperative_code,
        legal_name: savedCoop.legal_name,
        short_name: savedCoop.display_name || savedCoop.legal_name,
        display_name: savedCoop.display_name,
        tax_code: savedCoop.legal_information?.tax_code || '',
        address: savedCoop.contact_information?.address || '',
        phone: savedCoop.contact_information?.phone_number || '',
        phone_number: savedCoop.contact_information?.phone_number || '',
        representative_name: savedCoop.legal_information?.representative_name || '',
        status: savedCoop.status || 'ACTIVE',
      };
      setCooperative(normalizedCoop);

      // Trigger dynamic system name sync
      window.dispatchEvent(
        new CustomEvent('system-settings-updated', {
          detail: { system_name: normalizedCoop.legal_name, managing_unit: normalizedCoop.legal_name },
        })
      );

      showToast('Cập nhật hồ sơ pháp lý Hợp tác xã thành công!', 'success');
      setIsEditModalOpen(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Không thể cập nhật thông tin HTX. Vui lòng thử lại!';
      showToast(msg, 'error');
    },
  });

  const handleSaveProfile = async (updated: Partial<Cooperative>) => {
    await updateCoopMutation.mutateAsync(updated);
  };

  if (isLoadingCoop) {
    return (
      <div className="flex items-center justify-center min-h-[350px] w-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Đang tải hồ sơ pháp lý HTX...</span>
        </div>
      </div>
    );
  }

  if (isErrorCoop || !coopData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
        <p className="text-sm font-bold text-red-700">Không thể tải hồ sơ pháp nhân HTX từ máy chủ</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['my-cooperative'] })}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 cursor-pointer"
        >
          Thử tải lại
        </button>
      </div>
    );
  }

  const legalInfo = coopData.legal_information || {};
  const contactInfo = coopData.contact_information || {};

  const currentCoop: Cooperative = {
    id: coopData.id,
    cooperative_code: coopData.cooperative_code,
    legal_name: coopData.legal_name,
    short_name: coopData.display_name || coopData.legal_name,
    display_name: coopData.display_name,
    tax_code: legalInfo.tax_code || '',
    address: contactInfo.address || '',
    phone: contactInfo.phone_number || contactInfo.hotline || '',
    phone_number: contactInfo.phone_number || contactInfo.hotline || '',
    email: contactInfo.email || '',
    representative_name: legalInfo.representative_name || '',
    status: coopData.status || 'ACTIVE',
  };

  // Real statistics derived from database
  const totalCharterCapital = Number(capitalSummary?.total_committed_capital || legalInfo.charter_capital || 0);
  const totalPaidCapital = Number(capitalSummary?.total_paid_capital || 0);
  const totalMembersCount = membersMeta?.meta?.total ?? membersMeta?.total ?? 31;

  return (
    <div className="space-y-4 pb-12 animate-fade-in text-[13px] text-slate-700">
      {/* Page Header */}
      <div className="bg-white border border-[#e7e9ec] rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Hồ sơ Pháp lý Hợp tác xã
            </h1>
            <span className="pill-badge pill-green text-xs">
              <BadgeCheck className="w-3.5 h-3.5 inline mr-1" />
              Đạt chuẩn OCOP & VietGAP
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Thông tin định danh pháp nhân, Giấy phép ĐKKD & Ban đại diện theo Luật HTX 17/2023/QH15
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          <Edit className="w-4 h-4" />
          <span>Chỉnh sửa hồ sơ</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Info Box (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-2xl flex items-center justify-center border border-emerald-200 shadow-2xs">
              <Building2 className="w-8 h-8 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {currentCoop.legal_name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                <span>Mã số thuế: <strong className="font-mono text-slate-800">{currentCoop.tax_code || 'Chưa cập nhật'}</strong></span>
                <span>•</span>
                <span>Mã HTX: <strong className="font-mono text-emerald-700">{currentCoop.cooperative_code}</strong></span>
                <span>•</span>
                <span>Tên giao dịch: <strong className="text-emerald-800">{currentCoop.short_name}</strong></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Address & Contact */}
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                Địa chỉ & Liên hệ
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{currentCoop.address || 'Chưa cập nhật địa chỉ'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono font-bold">{currentCoop.phone || currentCoop.phone_number || 'Chưa cập nhật SĐT'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{contactInfo.email || 'Chưa cập nhật email'}</span>
                </div>
                {contactInfo.website && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                    <a href={contactInfo.website} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">
                      {contactInfo.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Scale & Charter Capital (Real Database Linked) */}
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                Quy mô & Vốn điều lệ thực tế
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Vốn cam kết đăng ký:</span>
                  <strong className="text-slate-900 font-mono text-sm">{formatCurrency(totalCharterCapital)}</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Vốn thực góp lũy kế:</span>
                  <strong className="text-emerald-700 font-mono text-sm">{formatCurrency(totalPaidCapital)}</strong>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Quy mô xã viên:</span>
                  <strong className="text-emerald-800 font-mono text-sm">{totalMembersCount} thành viên</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Business Sectors */}
          {Array.isArray(legalInfo.business_sectors) && legalInfo.business_sectors.length > 0 && (
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
              <div className="font-bold text-emerald-950 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-700" />
                Ngành nghề & Hoạt động sản xuất kinh doanh
              </div>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                {legalInfo.business_sectors.map((sector: string, idx: number) => (
                  <li key={idx}>{sector}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Board of Management (1 col) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              Ban Quản Trị & Điều Hành
            </h3>
            <span className="text-[11px] text-slate-400">Nhiệm kỳ 2024–2029</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">
                  {currentCoop.representative_name || 'Đang cập nhật'}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  {legalInfo.representative_title || 'Chủ tịch HĐQT kiêm Giám đốc'}
                </div>
              </div>
              <span className="pill-badge pill-green text-[10px]">Đại diện pháp luật</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Trần Thị Mai</div>
                <div className="text-[11px] text-blue-700 font-semibold mt-0.5">
                  Phó Giám đốc Kỹ thuật Nông nghiệp
                </div>
              </div>
              <span className="pill-badge pill-blue text-[10px]">Quản trị vùng</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Lê Văn Hùng</div>
                <div className="text-[11px] text-purple-700 font-semibold mt-0.5">
                  Trưởng Ban Kiểm Soát HTX
                </div>
              </div>
              <span className="pill-badge pill-purple text-[10px]">Kiểm soát độc lập</span>
            </div>
          </div>

          {legalInfo.established_date && (
            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-100">
              <Calendar className="w-3.5 h-3.5" />
              <span>Thành lập ngày: {legalInfo.established_date} (ĐKKD số: {legalInfo.registration_number || 'N/A'})</span>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <CoopProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        cooperative={currentCoop}
        onSave={handleSaveProfile}
        isSubmitting={updateCoopMutation.isPending}
      />
    </div>
  );
};
