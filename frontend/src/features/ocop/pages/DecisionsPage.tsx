import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Award, 
  Download, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Star,
  Printer,
  Plus
} from 'lucide-react';
import { PageHeader } from '@/layouts/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { apiClient } from '@/services/apiClient';
import { formatDate } from '@/utils/formatters';
import { useToast } from '@/components/ui/ToastNotification';
import { IssueDecisionModal } from '../components/IssueDecisionModal';
import { DecisionDetailModal } from '../components/DecisionDetailModal';

export interface OCOPDecision {
  id: string;
  decision_number: string;
  application_id: string;
  application_code: string;
  product_name: string;
  cooperative_name: string;
  council_level: 'DISTRICT' | 'PROVINCIAL' | 'CENTRAL';
  star_rating: number;
  status: 'APPROVED' | 'REJECTED' | 'PENDING_APPROVAL';
  effective_date: string;
  expiration_date: string; // 36 months validity
  signer_name?: string;
  signer_title?: string;
}

export const DecisionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [selectedDecision, setSelectedDecision] = useState<OCOPDecision | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // Queries
  const { data: decisionsData, isLoading } = useQuery({
    queryKey: ['ocop-decisions'],
    queryFn: async () => {
      const res: any = await apiClient.get('/ocop/decisions');
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.data?.data)) return res.data.data;
      return [];
    },
  });

  // Issue New Decision Mutation
  const issueDecisionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/ocop/decisions', payload);
      return res.data || res;
    },
    onSuccess: (data: any) => {
      showToast(`Đã ban hành Quyết định [${data.decision_number}] thành công!`, 'success');
      setIsIssueModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['ocop-decisions'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Ban hành Quyết định thất bại', 'error');
    },
  });

  // Approve Decision Mutation
  const approveMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      return apiClient.post(`/ocop/applications/${applicationId}/approve`, {
        effective_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      showToast('Đã ban hành Quyết định Công nhận OCOP chính thức thành công!', 'success');
      queryClient.invalidateQueries({ queryKey: ['ocop-decisions'] });
      setIsDetailModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.message || 'Phê duyệt thất bại.', 'error');
    },
  });

  // Reject Decision Mutation
  const rejectMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      return apiClient.post(`/ocop/applications/${applicationId}/reject`, {
        reason: 'Chưa đáp ứng đủ tiêu chuẩn cứng khống chế sao hoặc minh chứng không hợp lệ.',
      });
    },
    onSuccess: () => {
      showToast('Đã từ chối công nhận hồ sơ OCOP.', 'warning');
      queryClient.invalidateQueries({ queryKey: ['ocop-decisions'] });
      setIsDetailModalOpen(false);
    },
    onError: (err: any) => {
      showToast(err.message || 'Từ chối thất bại.', 'error');
    },
  });

  // Document Generation Mutations
  const generateDossierPdfMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const res: any = await apiClient.post(`/documents/generate/ocop-dossier/${applicationId}`, {});
      return res.data || res;
    },
    onSuccess: (data: any) => {
      showToast('Sinh bộ Hồ sơ OCOP PDF thành công!', 'success');
      if (data?.download_url) window.open(data.download_url, '_blank');
    },
    onError: (err: any) => {
      showToast(err.message || 'Sinh bộ Hồ sơ OCOP PDF thất bại.', 'error');
    },
  });

  const generateCertificatePdfMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const res: any = await apiClient.post(`/documents/generate/certificate/${applicationId}`, {});
      return res.data || res;
    },
    onSuccess: (data: any) => {
      showToast('Kết xuất Giấy Chứng Nhận OCOP thành công!', 'success');
      if (data?.download_url) window.open(data.download_url, '_blank');
    },
    onError: (err: any) => {
      showToast(err.message || 'Kết xuất Giấy Chứng Nhận thất bại.', 'error');
    },
  });

  const columns: Column<OCOPDecision>[] = [
    {
      key: 'decision_number',
      header: 'Số Quyết Định',
      render: (item: OCOPDecision) => <span className="font-mono font-semibold text-emerald-800">{item.decision_number}</span>,
    },
    {
      key: 'product_name',
      header: 'Sản Phẩm & HTX',
      render: (item: OCOPDecision) => (
        <div>
          <div className="font-medium text-gray-900">{item.product_name}</div>
          <div className="text-xs text-gray-500">{item.cooperative_name} ({item.application_code})</div>
        </div>
      ),
    },
    {
      key: 'star_rating',
      header: 'Hạng Sao Đạt Được',
      render: (item: OCOPDecision) => (
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= item.star_rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
              }`}
            />
          ))}
          <span className="text-xs font-bold text-gray-700 ml-1">({item.star_rating} Sao)</span>
        </div>
      ),
    },
    {
      key: 'expiration_date',
      header: 'Thời Hạn Hiệu Lực',
      render: (item: OCOPDecision) => (
        <div className="text-xs">
          <div>Từ: {formatDate(item.effective_date)}</div>
          <div className="text-gray-500">Đến: {formatDate(item.expiration_date)} (36T)</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      render: (item: OCOPDecision) => (
        <StatusBadge
          status={item.status}
          label={
            item.status === 'APPROVED'
              ? 'Đã Ban Hành'
              : item.status === 'REJECTED'
              ? 'Bị Từ Chối'
              : 'Chờ Ký Duyệt'
          }
        />
      ),
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      render: (item: OCOPDecision) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedDecision(item);
              setIsDetailModalOpen(true);
            }}
          >
            Chi Tiết & Ký
          </Button>
          <Button
            size="sm"
            variant="ghost"
            title="In Quyết Định"
            onClick={() => generateCertificatePdfMutation.mutate(item.application_id)}
          >
            <Printer className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quyết Định Công Nhận & Giấy Chứng Nhận OCOP"
        subtitle="Quản lý ban hành Quyết định công nhận phân hạng OCOP chính thức và kết xuất tài liệu PDF/Giấy chứng nhận."
        action={
          <Button variant="primary" onClick={() => setIsIssueModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ban hành Quyết định mới
          </Button>
        }
      />

      <Card title="Danh Sách Quyết Định Phân Hạng OCOP">
        <DataTable
          data={Array.isArray(decisionsData) ? decisionsData : (decisionsData?.data || [])}
          columns={columns}
          isLoading={isLoading}
        />
      </Card>

      {/* DETAIL & ACTION MODAL */}
      <DecisionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        decision={selectedDecision}
        onApprove={(appId) => approveMutation.mutate(appId)}
        onReject={(appId) => rejectMutation.mutate(appId)}
        onGenerateDossierPdf={(appId) => generateDossierPdfMutation.mutate(appId)}
        onGenerateCertificatePdf={(appId) => generateCertificatePdfMutation.mutate(appId)}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
        isGeneratingDossier={generateDossierPdfMutation.isPending}
        isGeneratingCertificate={generateCertificatePdfMutation.isPending}
      />

      {/* ISSUE NEW DECISION MODAL */}
      <IssueDecisionModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSubmit={(data) => issueDecisionMutation.mutate(data)}
        isSubmitting={issueDecisionMutation.isPending}
      />
    </div>
  );
};

export default DecisionsPage;
