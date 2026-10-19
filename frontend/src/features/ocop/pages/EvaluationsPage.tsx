import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Award, 
  Users, 
  Lock, 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Star, 
  Eye, 
  ShieldAlert
} from 'lucide-react';
import { PageHeader } from '@/layouts/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { apiClient } from '@/services/apiClient';
import { useToast } from '@/components/ui/ToastNotification';

export interface EvaluationSession {
  id: string;
  session_code: string;
  session_name: string;
  council_level: 'PROVINCIAL' | 'CENTRAL';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'CONSOLIDATED' | 'COMPLETED';
  created_at: string;
  application_count: number;
}

export const EvaluationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'SESSIONS' | 'INDEPENDENT_SCORING' | 'CONSOLIDATION'>('SESSIONS');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('sess-01');
  const [selectedApplicationId] = useState<string>('app-01');

  // Evaluator scoring state
  const [evaluatorScores, setEvaluatorScores] = useState<Record<string, number>>({
    'i1': 8.5,
    'i2': 14.0,
    'i3': 18.0,
    'i4': 9.0,
  });
  const [evaluatorComments, setEvaluatorComments] = useState<Record<string, string>>({
    'i1': 'Hồ sơ minh chứng đầy đủ, quy trình VietGAP đạt chuẩn.',
    'i2': 'Có kết quả kiểm nghiệm ISO 17025 hợp lệ.',
  });
  const [isScoreSheetLocked, setIsScoreSheetLocked] = useState(false);

  // Queries
  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['ocop-evaluation-sessions'],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/ocop/evaluation-sessions');
        return res.data || res;
      } catch {
        return {
          data: [
            {
              id: 'sess-01',
              session_code: 'HD-TN-2026-01',
              session_name: 'Hội đồng Đánh giá & Phân hạng OCOP Cấp Tỉnh Đợt 1 - 2026',
              council_level: 'PROVINCIAL',
              status: 'IN_PROGRESS',
              created_at: '2026-08-15T09:00:00Z',
              application_count: 3,
            },
            {
              id: 'sess-02',
              session_code: 'HD-TW-2026-01',
              session_name: 'Hội đồng Đánh giá Phân hạng OCOP Cấp Trung Trung Ương 5 Sao',
              council_level: 'CENTRAL',
              status: 'SCHEDULED',
              created_at: '2026-09-01T08:30:00Z',
              application_count: 1,
            },
          ],
        };
      }
    },
  });

  const { data: consolidationData } = useQuery({
    queryKey: ['ocop-consolidation', selectedSessionId, selectedApplicationId],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get(`/ocop/evaluation-sessions/${selectedSessionId}/consolidation?application_id=${selectedApplicationId}`);
        return res.data || res;
      } catch {
        return {
          application_code: 'OCOP-2026-0089',
          product_name: 'Gạo Nếp Nương Đặc Sản',
          cooperative_name: 'HTX Nông Nghiệp Dịch Vụ Tây Bắc',
          evaluators: [
            { name: 'Nguyễn Văn A', role: 'Chủ tịch Hội đồng', total_score: 87.5, status: 'LOCKED' },
            { name: 'Trần Thị B', role: 'Ủy viên Phản biện', total_score: 85.0, status: 'LOCKED' },
            { name: 'Lê Văn C', role: 'Thư ký Hội đồng', total_score: 72.0, status: 'LOCKED' },
          ],
          score_gap: 15.5,
          has_score_discrepancy: true,
          average_score: 81.5,
          proposed_stars: 4,
          is_downgraded_by_mandatory: true,
          downgrade_reason: 'Thiếu minh chứng bắt buộc (*) về Tiêu chuẩn Đóng gói An toàn sinh học.',
          status: 'READY_FOR_DECISION',
        };
      }
    },
  });

  // Lock Score Sheet Mutation
  const lockScoreSheetMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/ocop/evaluation-scores/${selectedApplicationId}/lock`, {
        scores: evaluatorScores,
        comments: evaluatorComments,
      });
    },
    onSuccess: () => {
      showToast('Đã khóa phiếu chấm điểm thành công! Kết quả không thể chỉnh sửa.', 'success');
      setIsScoreSheetLocked(true);
      queryClient.invalidateQueries({ queryKey: ['ocop-consolidation'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Khóa phiếu chấm điểm thất bại.', 'error');
    },
  });

  // Consolidate Session Scores Mutation (Chairman / Secretary)
  const consolidateMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/ocop/evaluation-sessions/${selectedSessionId}/consolidate`, {
        application_id: selectedApplicationId,
      });
    },
    onSuccess: () => {
      showToast('Tính tổng hợp điểm trung bình & Khống chế sao thành công!', 'success');
      queryClient.invalidateQueries({ queryKey: ['ocop-consolidation'] });
      queryClient.invalidateQueries({ queryKey: ['ocop-evaluation-sessions'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Tổng hợp điểm thất bại.', 'error');
    },
  });

  // Calculate local total evaluator score
  const totalEvaluatorScore = Object.values(evaluatorScores).reduce((sum, s) => sum + (Number(s) || 0), 0);

  const sessionColumns: Column<EvaluationSession>[] = [
    {
      key: 'session_code',
      header: 'Mã Phiên',
      render: (item: EvaluationSession) => <span className="font-mono font-semibold text-emerald-800">{item.session_code}</span>,
    },
    {
      key: 'session_name',
      header: 'Tên Phiên Đánh Giá',
      render: (item: any) => (
        <div>
          <div className="font-medium text-gray-900">{item.session_name}</div>
          <div className="text-xs text-gray-500">Cấp đánh giá: {typeof item.council_level === 'object' ? item.council_level?.name : (item.council_level === 'CENTRAL' ? 'Cấp Trung Ương' : 'Cấp Tỉnh')}</div>
        </div>
      ),
    },
    {
      key: 'application_count',
      header: 'Số Hồ Sơ',
      render: (item: EvaluationSession) => <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">{item.application_count} Hồ sơ</span>,
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      render: (item: EvaluationSession) => (
        <StatusBadge 
          status={item.status} 
          label={
            item.status === 'IN_PROGRESS' ? 'Đang Đánh Giá' :
            item.status === 'CONSOLIDATED' ? 'Đã Tổng Hợp' :
            item.status === 'COMPLETED' ? 'Hoàn Tất' : 'Lên Kế Hoạch'
          }
        />
      ),
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      render: (item: EvaluationSession) => (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setSelectedSessionId(item.id);
              setActiveTab('INDEPENDENT_SCORING');
            }}
          >
            <Award className="w-3.5 h-3.5 mr-1" />
            Chấm Điểm
          </Button>
          <Button 
            size="sm" 
            variant="primary"
            onClick={() => {
              setSelectedSessionId(item.id);
              setActiveTab('CONSOLIDATION');
            }}
          >
            <Calculator className="w-3.5 h-3.5 mr-1" />
            Tổng Hợp
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hội Đồng Đánh Giá & Phân Hạng OCOP"
        subtitle="Giao diện dành cho Giám khảo chấm điểm độc lập & Chủ tịch/Thư ký Hội đồng tổng hợp điểm khống chế sao."
        action={
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'SESSIONS' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('SESSIONS')}
            >
              <Users className="w-4 h-4 mr-2" />
              Phiên Đánh Giá
            </Button>
            <Button
              variant={activeTab === 'INDEPENDENT_SCORING' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('INDEPENDENT_SCORING')}
            >
              <Award className="w-4 h-4 mr-2" />
              Chấm Điểm Độc Lập
            </Button>
            <Button
              variant={activeTab === 'CONSOLIDATION' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('CONSOLIDATION')}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Tổng Hợp & Hạ Sao
            </Button>
          </div>
        }
      />

      {/* TAB 1: SESSIONS LIST */}
      {activeTab === 'SESSIONS' && (
        <Card title="Danh Sách Các Phiên Đánh Giá Hội Đồng OCOP">
          <DataTable
            data={Array.isArray(sessionsData) ? sessionsData : (sessionsData?.data || [])}
            columns={sessionColumns}
            isLoading={isLoadingSessions}
          />
        </Card>
      )}

      {/* TAB 2: INDEPENDENT EVALUATOR SCORING */}
      {activeTab === 'INDEPENDENT_SCORING' && (
        <div className="space-y-6">
          {/* Header info */}
          <div className="bg-emerald-900 text-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Phiếu Chấm Điểm Độc Lập Giám Khảo</span>
              <h2 className="text-lg font-bold">Hồ sơ: Gạo Nếp Nương Đặc Sản (OCOP-2026-0089)</h2>
              <p className="text-xs text-emerald-100 mt-0.5">Giám khảo: Nguyễn Văn A (Ủy viên Hội đồng OCOP Cấp Tỉnh)</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-800/80 px-4 py-2 rounded-lg border border-emerald-700 text-right">
                <div className="text-xs text-emerald-200">Tổng điểm cá nhân</div>
                <div className="text-2xl font-black text-amber-400">{totalEvaluatorScore.toFixed(1)} / 100.0</div>
              </div>
              <Button
                variant={isScoreSheetLocked ? 'secondary' : 'primary'}
                disabled={isScoreSheetLocked || lockScoreSheetMutation.isPending}
                onClick={() => lockScoreSheetMutation.mutate()}
              >
                <Lock className="w-4 h-4 mr-2" />
                {isScoreSheetLocked ? 'Đã Khóa Phiếu Chấm' : 'Khóa Phiếu Chấm'}
              </Button>
            </div>
          </div>

          {/* Split Screen: Left Evidence List, Right Indicators Scoring */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Evidence Reference Panel */}
            <div className="lg:col-span-5 space-y-4">
              <Card title="Minh Chứng Hồ Sơ Đi Kèm">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 border rounded-lg hover:border-emerald-500 transition-colors cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Giấy Chứng Nhận VietGAP 2026</div>
                        <div className="text-xs text-gray-500">Mã băm: 8f4a9b...5d6e7f</div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4 text-emerald-600" />
                    </Button>
                  </div>

                  <div className="p-3 bg-gray-50 border rounded-lg hover:border-emerald-500 transition-colors cursor-pointer flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-emerald-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Kết Quả Kiểm Nghiệm An Toàn Thực Phẩm ISO 17025</div>
                        <div className="text-xs text-gray-500">Mã băm: 1a2b3c...8d9e0f</div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4 text-emerald-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right: Scoring Table */}
            <div className="lg:col-span-7 space-y-4">
              <Card title="Bảng Nhập Điểm Chỉ Tiêu Đánh Giá OCOP">
                <div className="space-y-4">
                  {/* Indicator item 1 */}
                  <div className="p-4 border rounded-xl bg-white space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Chỉ tiêu 1.1</span>
                        <h4 className="font-semibold text-gray-900 mt-1">Nguồn gốc nguyên liệu nông sản vùng trồng (*)</h4>
                        <p className="text-xs text-gray-500">Nguyên liệu được sản xuất 100% tại địa phương có chứng nhận.</p>
                      </div>
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded">Max: 10.0 điểm</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-4">
                        <label className="text-xs font-medium text-gray-700">Điểm chấm (0 - 10.0)</label>
                        <Input
                          type="number"
                          disabled={isScoreSheetLocked}
                          value={evaluatorScores['i1'] || ''}
                          onChange={(e) => setEvaluatorScores({ ...evaluatorScores, 'i1': parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="sm:col-span-8">
                        <label className="text-xs font-medium text-gray-700">Nhận xét / Nhận định của Giám khảo</label>
                        <Input
                          disabled={isScoreSheetLocked}
                          value={evaluatorComments['i1'] || ''}
                          onChange={(e) => setEvaluatorComments({ ...evaluatorComments, 'i1': e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Indicator item 2 */}
                  <div className="p-4 border rounded-xl bg-white space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Chỉ tiêu 2.1</span>
                        <h4 className="font-semibold text-gray-900 mt-1">Phiếu kết quả kiểm nghiệm ATTP & Chất lượng (*)</h4>
                        <p className="text-xs text-gray-500">Kiểm nghiệm đầy đủ các chỉ tiêu vi sinh, kim loại nặng.</p>
                      </div>
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded">Max: 15.0 điểm</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-4">
                        <label className="text-xs font-medium text-gray-700">Điểm chấm (0 - 15.0)</label>
                        <Input
                          type="number"
                          disabled={isScoreSheetLocked}
                          value={evaluatorScores['i2'] || ''}
                          onChange={(e) => setEvaluatorScores({ ...evaluatorScores, 'i2': parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="sm:col-span-8">
                        <label className="text-xs font-medium text-gray-700">Nhận xét / Nhận định của Giám khảo</label>
                        <Input
                          disabled={isScoreSheetLocked}
                          value={evaluatorComments['i2'] || ''}
                          onChange={(e) => setEvaluatorComments({ ...evaluatorComments, 'i2': e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONSOLIDATION & DOWNSCALING */}
      {activeTab === 'CONSOLIDATION' && (
        <div className="space-y-6">
          {/* Action header */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Tổng Hợp Đánh Giá Hội Đồng OCOP</span>
              <h2 className="text-xl font-bold text-gray-900">Sản phẩm: {consolidationData?.product_name}</h2>
              <p className="text-xs text-gray-500 mt-1">Đơn vị: {consolidationData?.cooperative_name} | Mã hồ sơ: {consolidationData?.application_code}</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              disabled={consolidateMutation.isPending}
              onClick={() => consolidateMutation.mutate()}
            >
              <Calculator className="w-5 h-5 mr-2" />
              Tổng Hợp Điểm Trung Bình & Khống Chế Sao
            </Button>
          </div>

          {/* Discrepancy Warning Flag (> 10.00 points) */}
          {consolidationData?.has_score_discrepancy && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl text-amber-900 space-y-1">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>CẢNH BÁO LỆCH ĐIỂM GIỮA CÁC GIÁM KHẢO (&gt; 10.00 ĐIỂM)</span>
              </div>
              <p className="text-xs text-amber-800 pl-7">
                Khoảng lệch điểm lớn nhất giữa các Giám khảo là <strong className="font-semibold">{consolidationData.score_gap.toFixed(2)} điểm</strong> (vượt ngưỡng cho phép 10.00 điểm theo BR-CALC-003). Chủ tịch Hội đồng cần tổ chức thảo luận lại để đối chiếu trước khi chốt điểm.
              </p>
            </div>
          )}

          {/* Table of evaluators scores */}
          <Card title="Kết Quả Chấm Điểm Cá Nhân Từ Các Giám Khảo">
            <div className="divide-y divide-gray-200">
              {consolidationData?.evaluators.map((ev: any, idx: number) => (
                <div key={idx} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900">{ev.name}</div>
                    <div className="text-xs text-gray-500">{ev.role}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-emerald-800">{ev.total_score.toFixed(1)} điểm</span>
                    <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full flex items-center">
                      <Lock className="w-3 h-3 mr-1" /> Đã Khóa
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Proposed Classification result */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl shadow-lg space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Điểm Trung Bình Hội Đồng</span>
              <div className="text-4xl font-black text-amber-400">{consolidationData?.average_score.toFixed(2)} / 100.0</div>
              <div className="text-xs text-emerald-100">Giá trị trung bình cộng điểm số từ 3 giám khảo độc lập.</div>
            </div>

            <div className="p-6 bg-white border border-emerald-200 rounded-2xl shadow-lg space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Phân Hạng Sao Đề Xuất (Proposed Star Classification)</span>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 ${
                      star <= (consolidationData?.proposed_stars || 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-2xl font-bold text-gray-900 ml-2">{consolidationData?.proposed_stars} SAO</span>
              </div>

              {consolidationData?.is_downgraded_by_mandatory && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
                  <div className="font-bold flex items-center text-red-900">
                    <ShieldAlert className="w-4 h-4 mr-1 text-red-600" />
                    Áp dụng quy tắc Khống chế Hạ sao (BR-OCOP-012)
                  </div>
                  <div>{consolidationData.downgrade_reason}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
