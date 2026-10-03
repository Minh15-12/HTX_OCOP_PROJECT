import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, Lock, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/layouts/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { apiClient } from '@/services/apiClient';
import { formatDate, formatNumber } from '@/utils/formatters';
import { useToast } from '@/components/ui/ToastNotification';

export interface CropSeasonItem {
  id: string;
  season_code: string;
  name: string;
  start_date: string;
  end_date?: string;
  main_crop: string;
  target_yield_kg: number;
  status: string; // ACTIVE, CLOSED
}

export const CropSeasonsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [seasonForm, setSeasonForm] = useState({
    season_code: '',
    name: '',
    start_date: '2026-03-01',
    end_date: '2026-07-30',
    main_crop: 'Chè Shan Tuyết cổ thụ',
    target_yield_kg: '5000',
  });

  // Query Crop Seasons
  const { data: seasonsData, isLoading } = useQuery({
    queryKey: ['crop-seasons'],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/crop-seasons');
        return res.data || res;
      } catch {
        return {
          data: [
            {
              id: 'season-01',
              season_code: 'MV-2026-XUAN',
              name: 'Mùa Vụ Xuân Hè 2026',
              start_date: '2026-02-15',
              end_date: '2026-06-30',
              main_crop: 'Chè Shan Tuyết cổ thụ',
              target_yield_kg: 12000,
              status: 'ACTIVE',
            },
            {
              id: 'season-02',
              season_code: 'MV-2025-DONG',
              name: 'Mùa Vụ Đông Xuân 2025',
              start_date: '2025-10-01',
              end_date: '2026-01-20',
              main_crop: 'Gạo Nếp Nương OCOP',
              target_yield_kg: 25000,
              status: 'CLOSED',
            },
          ],
        };
      }
    },
  });

  // Create Season Mutation
  const createSeasonMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post('/crop-seasons', payload);
    },
    onSuccess: () => {
      showToast('Khởi tạo mùa vụ sản xuất mới thành công!', 'success');
      setIsAddModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['crop-seasons'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Tạo mùa vụ thất bại.', 'error');
    },
  });

  // Close Season Mutation
  const closeSeasonMutation = useMutation({
    mutationFn: async (seasonId: string) => {
      return apiClient.post(`/crop-seasons/${seasonId}/close`);
    },
    onSuccess: () => {
      showToast('Đóng kết thúc mùa vụ thành công!', 'success');
      queryClient.invalidateQueries({ queryKey: ['crop-seasons'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Đóng mùa vụ thất bại.', 'error');
    },
  });

  const seasonList: CropSeasonItem[] = seasonsData?.data || [];

  const columns: Column<CropSeasonItem>[] = [
    {
      key: 'season_code',
      header: 'Mã Mùa Vụ',
      render: (item) => <span className="font-bold text-cop-700">{item.season_code}</span>,
    },
    {
      key: 'name',
      header: 'Tên Mùa Vụ',
      render: (item) => <span className="font-semibold text-slate-800">{item.name}</span>,
    },
    {
      key: 'main_crop',
      header: 'Cây Trồng Chủ Lực',
      render: (item) => <span className="text-xs font-semibold text-slate-700">{item.main_crop}</span>,
    },
    {
      key: 'dates',
      header: 'Thời Gian Canh Tác',
      render: (item) => (
        <span className="text-xs text-slate-600">
          {formatDate(item.start_date)} &rarr; {formatDate(item.end_date)}
        </span>
      ),
    },
    {
      key: 'target_yield_kg',
      header: 'Sản Lượng Mục Tiêu',
      render: (item) => <span className="font-bold text-slate-900">{formatNumber(item.target_yield_kg)} kg</span>,
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      render: (item) => (
        item.status === 'ACTIVE' ? (
          <Button
            variant="outline"
            size="sm"
            isLoading={closeSeasonMutation.isPending}
            onClick={() => closeSeasonMutation.mutate(item.id)}
            leftIcon={<Lock className="w-3.5 h-3.5 text-amber-600" />}
          >
            Đóng Vụ
          </Button>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Đã đóng vụ</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Mùa Vụ Sản Xuất"
        subtitle="Khởi tạo chu kỳ sản xuất nông nghiệp, lập kế hoạch sản lượng và theo dõi đóng vụ"
        action={
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tạo Mùa Vụ Mới
          </Button>
        }
      />

      <DataTable columns={columns} data={seasonList} isLoading={isLoading} />

      {/* Modal Add Season */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Khởi Tạo Mùa Vụ Sản Xuất Mới"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              isLoading={createSeasonMutation.isPending}
              onClick={() => {
                if (!seasonForm.season_code || !seasonForm.name) {
                  showToast('Vui lòng điền mã và tên mùa vụ', 'warning');
                  return;
                }
                createSeasonMutation.mutate({
                  ...seasonForm,
                  target_yield_kg: parseFloat(seasonForm.target_yield_kg) || 0,
                });
              }}
            >
              Khởi Tạo Mùa Vụ
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Mã Mùa Vụ"
            requiredAsterisk
            placeholder="MV-2026-THU"
            value={seasonForm.season_code}
            onChange={(e) => setSeasonForm({ ...seasonForm, season_code: e.target.value })}
          />
          <Input
            label="Tên Mùa Vụ"
            requiredAsterisk
            placeholder="Mùa Vụ Thu Đông 2026"
            value={seasonForm.name}
            onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
          />
          <Input
            label="Cây Trồng Chủ Lực"
            requiredAsterisk
            placeholder="Chè Shan Tuyết / Lúa Nếp Nương"
            value={seasonForm.main_crop}
            onChange={(e) => setSeasonForm({ ...seasonForm, main_crop: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ngày Bắt Đầu"
              type="date"
              value={seasonForm.start_date}
              onChange={(e) => setSeasonForm({ ...seasonForm, start_date: e.target.value })}
            />
            <Input
              label="Ngày Dự Kiến Kết Thúc"
              type="date"
              value={seasonForm.end_date}
              onChange={(e) => setSeasonForm({ ...seasonForm, end_date: e.target.value })}
            />
          </div>
          <Input
            label="Sản Lượng Mục Tiêu (Kg)"
            type="number"
            value={seasonForm.target_yield_kg}
            onChange={(e) => setSeasonForm({ ...seasonForm, target_yield_kg: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
};
