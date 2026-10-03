import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Award, 
  Download, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Star,
  Printer
} from 'lucide-react';
import { PageHeader } from '@/layouts/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { apiClient } from '@/services/apiClient';
import { formatDate } from '@/utils/formatters';
import { useToast } from '@/components/ui/ToastNotification';

export interface OCOPDecision {
  id: string;
  decision_number: string;
  application_id: string;
  application_code: string;
  product_name: string;
  cooperative_name: string;
  council_level: 'PROVINCIAL' | 'CENTRAL';
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

  // Queries
  const { data: decisionsData, isLoading } = useQuery({
    queryKey: ['ocop-decisions'],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/ocop/decisions');
        return res.data || res;
      } catch {
        return {
          data: [
            {
              id: 'dec-01',
              decision_number: 'QĐ-UBND-2026-089',
              application_id: 'app-01',
              application_code: 'OCOP-2026-0089',
              product_name: 'Gạo Nếp Nương Đặc Sản',
              cooperative_name: 'HTX Nông Nghiệp Dịch Vụ Tây Bắc',
              council_level: 'PROVINCIAL',
              star_rating: 4,
              status: 'APPROVED',
              effective_date: '2026-08-20T00:00:00Z',
              expiration_date: '2029-08-20T00:00:00Z', // +36 months
              signer_name: 'Nguyễn Văn C',
              signer_title: 'Phó Chủ tịch UBND Tỉnh',
            },
            {
              id: 'dec-02',
              decision_number: 'QĐ-UBND-2026-092',
              application_id: 'app-02',
              application_code: 'OCOP-2026-0092',
              product_name: 'Trà Oolong Thượng Hạng',
              cooperative_name: 'HTX Chè Mộc Sương',
              council_level: 'PROVINCIAL',
              star_rating: 3,
              status: 'PENDING_APPROVAL',
              effective_date: '2026-09-01T00:00:00Z',
              expiration_date: '2029-09-01T00:00:00Z',
              signer_name: 'Nguyễn Văn C',
              signer_title: 'Phó Chủ tịch UBND Tỉnh',
            },
          ],
        };
      }
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
      showToast(err.message || 'Phê duyệt quyết định thất bại.', 'error');
    },
  });

  // Reject Decision Mutation
  const rejectMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      return apiClient.post(`/ocop/applications/${applicationId}/reject`, {
        reason: 'Chưa đáp ứng điều kiện vệ sinh an toàn thực phẩm.',
      });
    },
    onSuccess: () => {
      showToast('Đã từ chối cấp Quyết định Công nhận OCOP.', 'success');
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
      if (data?.download_url) {
        window.open(data.download_url, '_blank');
      }
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
      showToast('Kết xuất Giấy Chứng Nhận OCOP 4 Sao thành công!', 'success');
      if (data?.download_url) {
        window.open(data.download_url, '_blank');
      }
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
          <span className="text-xs font-bold ml-1">{item.star_rating} Sao</span>
        </div>
      ),
    },
    {
      key: 'expiration_date',
      header: 'Thời Hạn Hiệu Lực',
      render: (item: OCOPDecision) => (
        <div>
          <div className="text-xs font-medium text-gray-900">36 tháng (Đến {formatDate(item.expiration_date)})</div>
          <div className="text-xs text-gray-500">Từ ngày: {formatDate(item.effective_date)}</div>
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
            item.status === 'APPROVED' ? 'Đã Phê Duyệt' :
            item.status === 'REJECTED' ? 'Từ Chối' : 'Chờ Ban Hành'
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
            Chi Tiết
          </Button>
          <Button
            size="sm"
            variant="primary"
            disabled={generateCertificatePdfMutation.isPending}
            onClick={() => generateCertificatePdfMutation.mutate(item.application_id)}
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Tải Cert
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
      />

      <Card title="Danh Sách Quyết Định Phân Hạng OCOP">
        <DataTable
          data={decisionsData?.data || []}
          columns={columns}
          isLoading={isLoading}
        />
      </Card>

      {/* DETAIL & ACTION MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi Tiết Quyết Định Công Nhận OCOP"
        size="lg"
      >
        {selectedDecision && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Số Quyết Định chính thức</span>
                <div className="text-xl font-black text-emerald-900 font-mono">{selectedDecision.decision_number}</div>
              </div>
              <div className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= selectedDecision.star_rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                    }`}
                  />
                ))}
                <span className="text-sm font-bold ml-1">{selectedDecision.star_rating} SAO</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Sản phẩm chứng nhận:</span>
                <div className="font-semibold text-gray-900">{selectedDecision.product_name}</div>
              </div>
              <div>
                <span className="text-gray-500">Chủ thể HTX:</span>
                <div className="font-semibold text-gray-900">{selectedDecision.cooperative_name}</div>
              </div>
              <div>
                <span className="text-gray-500">Ngày hiệu lực:</span>
                <div className="font-semibold text-gray-900">{formatDate(selectedDecision.effective_date)}</div>
              </div>
              <div>
                <span className="text-gray-500">Thời hạn hết hiệu lực (36 tháng):</span>
                <div className="font-semibold text-emerald-800">{formatDate(selectedDecision.expiration_date)}</div>
              </div>
              <div>
                <span className="text-gray-500">Người ký quyết định:</span>
                <div className="font-semibold text-gray-900">{selectedDecision.signer_name} - {selectedDecision.signer_title}</div>
              </div>
              <div>
                <span className="text-gray-500">Cấp phân hạng:</span>
                <div className="font-semibold text-gray-900">
                  {selectedDecision.council_level === 'PROVINCIAL' ? 'Hội đồng Cấp Tỉnh' : 'Hội đồng Cấp Trung Ương'}
                </div>
              </div>
            </div>

            {/* DOCUMENT GENERATION SECTION */}
            <div className="p-4 bg-gray-50 border rounded-xl space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm flex items-center">
                <FileText className="w-4 h-4 mr-2 text-emerald-700" />
                Kết Xuất Tài Liệu & Giấy Chứng Nhận Số (SCR-DOC-001)
              </h4>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={generateDossierPdfMutation.isPending}
                  onClick={() => generateDossierPdfMutation.mutate(selectedDecision.application_id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Xuất Bộ Hồ Sơ OCOP (PDF)
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={generateCertificatePdfMutation.isPending}
                  onClick={() => generateCertificatePdfMutation.mutate(selectedDecision.application_id)}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Xuất Bằng Giấy Chứng Nhận (PDF)
                </Button>
              </div>
            </div>

            {/* AUTHORIZATION APPROVE / REJECT BUTTONS */}
            {selectedDecision.status === 'PENDING_APPROVAL' && (
              <div className="pt-4 border-t flex justify-end space-x-3">
                <Button
                  variant="danger"
                  disabled={rejectMutation.isPending}
                  onClick={() => rejectMutation.mutate(selectedDecision.application_id)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Từ Chối Công Nhận
                </Button>
                <Button
                  variant="primary"
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate(selectedDecision.application_id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Phê Duyệt & Ban Hành Quyết Định
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
