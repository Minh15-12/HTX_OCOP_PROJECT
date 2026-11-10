import React from 'react';
import { Award, Calculator, Users, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';

export interface EvaluationSession {
  id: string;
  session_code: string;
  session_name: string;
  council_level: 'DISTRICT' | 'PROVINCIAL' | 'CENTRAL';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'CONSOLIDATED' | 'COMPLETED';
  created_at: string;
  application_count: number;
}

interface EvaluationSessionsTabProps {
  sessionsData: any;
  isLoadingSessions: boolean;
  onSelectScoring: (sessionId: string) => void;
  onSelectConsolidation: (sessionId: string) => void;
  onCreateSession?: () => void;
  onAssignEvaluators?: (session: EvaluationSession) => void;
}

export const EvaluationSessionsTab: React.FC<EvaluationSessionsTabProps> = ({
  sessionsData,
  isLoadingSessions,
  onSelectScoring,
  onSelectConsolidation,
  onCreateSession,
  onAssignEvaluators,
}) => {
  const sessionColumns: Column<EvaluationSession>[] = [
    {
      key: 'session_code',
      header: 'Mã Phiên',
      render: (item: EvaluationSession) => (
        <span className="font-mono font-semibold text-emerald-800">{item.session_code}</span>
      ),
    },
    {
      key: 'session_name',
      header: 'Tên Phiên Đánh Giá',
      render: (item: any) => (
        <div>
          <div className="font-medium text-gray-900">{item.session_name}</div>
          <div className="text-xs text-gray-500">
            Cấp đánh giá:{' '}
            {typeof item.council_level === 'object'
              ? item.council_level?.name
              : item.council_level === 'CENTRAL'
              ? 'Cấp Trung Ương (5 sao)'
              : item.council_level === 'DISTRICT'
              ? 'Cấp Huyện (3 sao)'
              : 'Cấp Tỉnh (4 sao)'}
          </div>
        </div>
      ),
    },
    {
      key: 'application_count',
      header: 'Số Hồ Sơ',
      render: (item: EvaluationSession) => (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">
          {item.application_count} Hồ sơ
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      render: (item: EvaluationSession) => (
        <StatusBadge
          status={item.status}
          label={
            item.status === 'IN_PROGRESS'
              ? 'Đang Đánh Giá'
              : item.status === 'CONSOLIDATED'
              ? 'Đã Tổng Hợp'
              : item.status === 'COMPLETED'
              ? 'Hoàn Tất'
              : 'Lên Kế Hoạch'
          }
        />
      ),
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      render: (item: EvaluationSession) => (
        <div className="flex space-x-1.5">
          {onAssignEvaluators && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAssignEvaluators(item)}
              title="Phân công giám khảo"
            >
              <Users className="w-3.5 h-3.5 mr-1" />
              Phân Công
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectScoring(item.id)}
          >
            <Award className="w-3.5 h-3.5 mr-1" />
            Chấm Điểm
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => onSelectConsolidation(item.id)}
          >
            <Calculator className="w-3.5 h-3.5 mr-1" />
            Tổng Hợp
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Danh Sách Các Phiên Đánh Giá Hội Đồng OCOP</h3>
          <p className="text-xs text-slate-500 mt-0.5">Theo dõi lịch họp, phân công giám khảo và tiến độ chấm điểm</p>
        </div>
        {onCreateSession && (
          <Button size="sm" variant="primary" onClick={onCreateSession}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Khởi tạo phiên mới
          </Button>
        )}
      </div>
      <DataTable
        data={Array.isArray(sessionsData) ? sessionsData : sessionsData?.data || []}
        columns={sessionColumns}
        isLoading={isLoadingSessions}
      />
    </Card>
  );
};
