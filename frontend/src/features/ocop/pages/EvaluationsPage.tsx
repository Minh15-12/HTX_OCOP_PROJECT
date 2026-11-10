import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Award, Calculator } from 'lucide-react';
import { PageHeader } from '@/layouts/PageHeader';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/services/apiClient';
import { useToast } from '@/components/ui/ToastNotification';
import { EvaluationSessionsTab, EvaluationSession } from '../components/evaluations/EvaluationSessionsTab';
import { IndependentScoringTab } from '../components/evaluations/IndependentScoringTab';
import { EvaluationConsolidationTab } from '../components/evaluations/EvaluationConsolidationTab';
import { CreateEvaluationSessionModal } from '../components/CreateEvaluationSessionModal';
import { AssignEvaluatorsModal } from '../components/AssignEvaluatorsModal';

export const EvaluationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'SESSIONS' | 'INDEPENDENT_SCORING' | 'CONSOLIDATION'>(
    'SESSIONS'
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string>('sess-01');
  const [selectedApplicationId] = useState<string>('app-01');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [sessionForAssign, setSessionForAssign] = useState<EvaluationSession | null>(null);

  // Evaluator scoring state
  const [evaluatorScores, setEvaluatorScores] = useState<Record<string, number>>({
    i1: 8.5,
    i2: 14.0,
    i3: 18.0,
    i4: 9.0,
  });
  const [evaluatorComments, setEvaluatorComments] = useState<Record<string, string>>({
    i1: 'Hồ sơ minh chứng đầy đủ, quy trình VietGAP đạt chuẩn.',
    i2: 'Có kết quả kiểm nghiệm ISO 17025 hợp lệ.',
  });
  const [isScoreSheetLocked, setIsScoreSheetLocked] = useState(false);

  // Queries
  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['ocop-evaluation-sessions'],
    queryFn: async () => {
      const res: any = await apiClient.get('/ocop/evaluation-sessions');
      return res.data || res;
    },
  });

  const { data: consolidationData } = useQuery({
    queryKey: ['ocop-consolidation', selectedSessionId, selectedApplicationId],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get(
          `/ocop/evaluation-sessions/${selectedSessionId}/consolidation?application_id=${selectedApplicationId}`
        );
        return res.data?.data || res.data || res;
      } catch {
        return null;
      }
    },
    enabled: !!selectedSessionId,
  });

  // Create Evaluation Session Mutation
  const createSessionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/ocop/evaluation-sessions', payload);
      return res.data || res;
    },
    onSuccess: (data: any) => {
      showToast(`Đã khởi tạo phiên đánh giá [${data.session_code || 'Mới'}] thành công!`, 'success');
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['ocop-evaluation-sessions'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Khởi tạo phiên đánh giá thất bại', 'error');
    },
  });

  // Assign Evaluators Mutation
  const assignEvaluatorsMutation = useMutation({
    mutationFn: async ({ sessionId, selectedEvaluatorIds }: { sessionId: string; selectedEvaluatorIds: string[] }) => {
      const res = await apiClient.post(`/ocop/evaluation-sessions/${sessionId}/evaluators`, {
        evaluator_ids: selectedEvaluatorIds,
      });
      return res.data || res;
    },
    onSuccess: () => {
      showToast('Đã phân công ban giám khảo cho Hội đồng OCOP thành công!', 'success');
      setIsAssignModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['ocop-evaluation-sessions'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Phân công giám khảo thất bại', 'error');
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

  // Consolidate Session Scores Mutation
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
  const totalEvaluatorScore = Object.values(evaluatorScores).reduce(
    (sum, s) => sum + (Number(s) || 0),
    0
  );

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
        <EvaluationSessionsTab
          sessionsData={sessionsData}
          isLoadingSessions={isLoadingSessions}
          onSelectScoring={(sessionId) => {
            setSelectedSessionId(sessionId);
            setActiveTab('INDEPENDENT_SCORING');
          }}
          onSelectConsolidation={(sessionId) => {
            setSelectedSessionId(sessionId);
            setActiveTab('CONSOLIDATION');
          }}
          onCreateSession={() => setIsCreateModalOpen(true)}
          onAssignEvaluators={(session) => {
            setSessionForAssign(session);
            setIsAssignModalOpen(true);
          }}
        />
      )}

      {/* TAB 2: INDEPENDENT EVALUATOR SCORING */}
      {activeTab === 'INDEPENDENT_SCORING' && (
        <IndependentScoringTab
          evaluatorScores={evaluatorScores}
          setEvaluatorScores={setEvaluatorScores}
          evaluatorComments={evaluatorComments}
          setEvaluatorComments={setEvaluatorComments}
          isScoreSheetLocked={isScoreSheetLocked}
          isLockPending={lockScoreSheetMutation.isPending}
          onLockScoreSheet={() => lockScoreSheetMutation.mutate()}
          totalEvaluatorScore={totalEvaluatorScore}
        />
      )}

      {/* TAB 3: CONSOLIDATION & DOWNSCALING */}
      {activeTab === 'CONSOLIDATION' && (
        <EvaluationConsolidationTab
          consolidationData={consolidationData}
          isConsolidatePending={consolidateMutation.isPending}
          onConsolidate={() => consolidateMutation.mutate()}
        />
      )}

      {/* Modals */}
      <CreateEvaluationSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => createSessionMutation.mutate(data)}
        isSubmitting={createSessionMutation.isPending}
      />

      <AssignEvaluatorsModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        sessionId={sessionForAssign?.id || 'sess-01'}
        sessionName={sessionForAssign?.session_name || 'Phiên Đánh Giá Hội Đồng'}
        onSubmit={(data) => assignEvaluatorsMutation.mutate(data)}
      />
    </div>
  );
};

export default EvaluationsPage;
