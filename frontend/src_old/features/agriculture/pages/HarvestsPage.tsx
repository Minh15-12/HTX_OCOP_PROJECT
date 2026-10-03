import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wheat, Plus, ShieldAlert, ShieldCheck, GitBranch, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/layouts/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { apiClient } from '@/services/apiClient';
import { formatDate, formatNumber } from '@/utils/formatters';
import { useToast } from '@/components/ui/ToastNotification';

export interface HarvestItem {
  id: string;
  harvest_code: string;
  lot_code: string;
  harvest_date: string;
  plot_name: string;
  quantity_kg: number;
  quality_grade: string;
  is_phi_cleared: boolean;
  status: string;
}

export const HarvestsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [harvestForm, setHarvestForm] = useState({
    harvest_date: '2026-03-06',
    plot_id: 'plot-01',
    season_id: 'season-01',
    quantity_kg: '1500',
    quality_grade: 'GRADE_A',
  });

  // Query Harvests
  const { data: harvestsData, isLoading } = useQuery({
    queryKey: ['harvests'],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/harvests');
        return res.data || res;
      } catch {
        return {
          data: [
            {
              id: 'harvest-01',
              harvest_code: 'TH-2026-001',
              lot_code: 'LOT-SHAN-20260306-01',
              harvest_date: '2026-03-06',
              plot_name: 'Thửa Đất Chè Shan Tuyết A1',
              quantity_kg: 1200,
              quality_grade: 'GRADE_A',
              is_phi_cleared: true,
              status: 'COMPLETED',
            },
            {
              id: 'harvest-02',
              harvest_code: 'TH-2026-002',
              lot_code: 'LOT-NEP-20260301-02',
              harvest_date: '2026-03-01',
              plot_name: 'Thửa Đất Lúa Nếp Nương B2',
              quantity_kg: 3500,
              quality_grade: 'GRADE_A',
              is_phi_cleared: true,
              status: 'COMPLETED',
            },
          ],
        };
      }
    },
  });

  // Create Harvest Mutation
  const createHarvestMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/harvests', payload);
    },
    onSuccess: (res: any) => {
      showToast('Ghi nhận thu hoạch sản lượng & tự động tạo Lô hàng mới thành công!', 'success');
      setIsAddModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Ghi nhận thu hoạch thất bại.', 'error');
    },
  });

  const harvestList: HarvestItem[] = harvestsData?.data || [];

  const columns: Column<HarvestItem>[] = [
    {
      key: 'harvest_code',
      header: 'Mã Đợt Thu Hoạch',
      render: (item) => <span className="font-bold text-cop-700">{item.harvest_code}</span>,
    },
    {
      key: 'lot_code',
      header: 'Mã Lô Hàng Sơ Chế (Lot Code)',
      render: (item) => (
        <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 text-slate-800 rounded border">
          {item.lot_code}
        </span>
      ),
    },
    {
      key: 'plot_name',
      header: 'Vùng Trồng / Thửa Đất',
      render: (item) => <span className="text-xs font-semibold text-slate-700">{item.plot_name}</span>,
    },
    {
      key: 'harvest_date',
      header: 'Ngày Thu Hoạch',
      render: (item) => formatDate(item.harvest_date),
    },
    {
      key: 'quantity_kg',
      header: 'Sản Lượng',
      render: (item) => <span className="font-bold text-slate-900">{formatNumber(item.quantity_kg)} kg</span>,
    },
    {
      key: 'phi_status',
      header: 'Khóa An Toàn PHI',
      render: (item) => (
        item.is_phi_cleared ? (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Đạt cách ly PHI
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            <ShieldAlert className="w-3.5 h-3.5" /> Cảnh báo chưa hết PHI
          </span>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Truy Xuất Nguồn Gốc',
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/agriculture/lots/${item.id}/traceability`)}
          leftIcon={<GitBranch className="w-3.5 h-3.5 text-cop-600" />}
        >
          Cây Truy Xuất
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Thu Hoạch & Sinh Lô Hàng (Lot)"
        subtitle="Ghi nhận sản lượng thu hoạch, tự động kiểm tra khóa an toàn PHI và tạo mã lô hàng truy xuất"
        action={
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Ghi Nhận Thu Hoạch
          </Button>
        }
      />

      <DataTable columns={columns} data={harvestList} isLoading={isLoading} />

      {/* Modal Add Harvest */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ghi Nhận Thu Hoạch & Đóng Lô Hàng Mới"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              isLoading={createHarvestMutation.isPending}
              onClick={() => {
                createHarvestMutation.mutate({
                  ...harvestForm,
                  quantity_kg: parseFloat(harvestForm.quantity_kg) || 0,
                });
              }}
            >
              Xác Nhận Thu Hoạch
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Hệ thống sẽ tự động kiểm tra nhật ký phun thuốc bảo vệ thực vật để đảm bảo không vi phạm thời gian cách ly PHI.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Chọn Thửa Đất Canh Tác"
              requiredAsterisk
              value={harvestForm.plot_id}
              onChange={(e) => setHarvestForm({ ...harvestForm, plot_id: e.target.value })}
              options={[
                { value: 'plot-01', label: 'Thửa Chè Shan Tuyết A1' },
                { value: 'plot-02', label: 'Thửa Lúa Nếp Nương B2' },
              ]}
            />
            <Input
              label="Ngày Thu Hoạch"
              type="date"
              requiredAsterisk
              value={harvestForm.harvest_date}
              onChange={(e) => setHarvestForm({ ...harvestForm, harvest_date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Sản Lượng Thu Hoạch (Kg)"
              type="number"
              requiredAsterisk
              value={harvestForm.quantity_kg}
              onChange={(e) => setHarvestForm({ ...harvestForm, quantity_kg: e.target.value })}
            />
            <Select
              label="Phân Loại Phẩm Cấp"
              value={harvestForm.quality_grade}
              onChange={(e) => setHarvestForm({ ...harvestForm, quality_grade: e.target.value })}
              options={[
                { value: 'GRADE_A', label: 'Loại 1 (Thượng hạng / Đạt OCOP)' },
                { value: 'GRADE_B', label: 'Loại 2 (Chuẩn tiêu dùng)' },
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
