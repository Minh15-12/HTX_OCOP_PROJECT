import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckSquare, Layers, Award, ChevronRight, Star, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/layouts/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiClient } from '@/services/apiClient';

export interface IndicatorItem {
  id: string;
  code: string;
  name: string;
  max_score: number;
  is_mandatory: boolean;
}

export interface CriterionItem {
  id: string;
  code: string;
  name: string;
  max_score: number;
  indicators: IndicatorItem[];
}

export interface CriteriaGroupItem {
  id: string;
  code: string;
  name: string;
  criteria: CriterionItem[];
}

export interface CriteriaVersionItem {
  id: string;
  version_code: string;
  name: string;
  status: string;
  effective_date?: string;
  groups?: CriteriaGroupItem[];
}

export const CriteriaPage: React.FC = () => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>('ver-2026');

  // Query Criteria Versions
  const { data: versionsData, isLoading: isLoadingVersions } = useQuery({
    queryKey: ['criteria-versions'],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/ocop/criteria-versions');
        return res.data || res;
      } catch {
        return {
          data: [
            {
              id: 'ver-2026',
              version_code: 'OCOP-VER-2026',
              name: 'Bộ Tiêu Chí Quốc Gia Đánh Giá & Phân Hạng OCOP 2026',
              status: 'PUBLISHED',
              effective_date: '2026-01-01',
            },
          ],
        };
      }
    },
  });

  // Query Council Levels
  const { data: councilLevelsData } = useQuery({
    queryKey: ['council-levels'],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/ocop/council-levels');
        return res.data || res;
      } catch {
        return {
          data: [
            { id: 'cl-01', code: 'DISTRICT', name: 'Hội đồng Thẩm định Cấp Huyện / Thị xã' },
            { id: 'cl-02', code: 'PROVINCIAL', name: 'Hội đồng Thẩm định Cấp Tỉnh / Thành phố' },
            { id: 'cl-03', code: 'NATIONAL', name: 'Hội đồng Thẩm định Cấp Trung Ương (5 Sao)' },
          ],
        };
      }
    },
  });

  // Dummy mock criteria tree if backend API returns standard version detail
  const dummyTree: CriteriaGroupItem[] = [
    {
      id: 'g1',
      code: 'NHÓM 1',
      name: 'Sản phẩm và sức mạnh cộng đồng (Tối đa 35 điểm)',
      criteria: [
        {
          id: 'c1',
          code: 'TC-01',
          name: 'Tổ chức sản xuất & Năng lực chủ thể HTX',
          max_score: 20,
          indicators: [
            { id: 'i1', code: '1.1', name: 'Sử dụng lao động địa phương & Hợp đồng liên kết', max_score: 10, is_mandatory: false },
            { id: 'i2', code: '1.2 (*)', name: 'Giấy chứng nhận An toàn Vệ sinh Thực phẩm / VietGAP', max_score: 10, is_mandatory: true },
          ],
        },
      ],
    },
    {
      id: 'g2',
      code: 'NHÓM 2',
      name: 'Khả năng tiếp thị và nhãn hiệu (Tối đa 25 điểm)',
      criteria: [
        {
          id: 'c2',
          code: 'TC-02',
          name: 'Bao bì, nhãn hiệu và truy xuất nguồn gốc',
          max_score: 25,
          indicators: [
            { id: 'i3', code: '2.1', name: 'Bao bì chứa đựng ghi nhãn hàng hóa đúng quy định', max_score: 10, is_mandatory: false },
            { id: 'i4', code: '2.2 (*)', name: 'Mã vạch & Hệ thống tem QR code truy xuất nguồn gốc', max_score: 15, is_mandatory: true },
          ],
        },
      ],
    },
    {
      id: 'g3',
      code: 'NHÓM 3',
      name: 'Chất lượng sản phẩm (Tối đa 40 điểm)',
      criteria: [
        {
          id: 'c3',
          code: 'TC-03',
          name: 'Chất lượng cảm quan & Phiếu kiểm nghiệm ISO/IEC 17025',
          max_score: 40,
          indicators: [
            { id: 'i5', code: '3.1 (*)', name: 'Phiếu kết quả thử nghiệm chỉ tiêu an toàn vi sinh & kim loại nặng', max_score: 25, is_mandatory: true },
            { id: 'i6', code: '3.2', name: 'Tính độc đáo và bản sắc văn hóa truyền thống của sản phẩm', max_score: 15, is_mandatory: false },
          ],
        },
      ],
    },
  ];

  const versionList: CriteriaVersionItem[] = versionsData?.data || [];
  const councilLevels = councilLevelsData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bộ Tiêu Chí Quốc Gia OCOP"
        subtitle="Tra cứu cấu trúc cây phân cấp chỉ tiêu đánh giá, khung điểm tối đa và tiêu chuẩn bắt buộc dấu sao (*)"
      />

      {/* Council Levels Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {councilLevels.map((cl: any) => (
          <Card key={cl.id} className="p-4 border-l-4 border-l-cop-600">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cop-50 text-cop-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">{cl.name}</h4>
                <p className="text-[11px] text-slate-500">Mã cấp: {cl.code}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Version Selector Card */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4 mb-4">
          <div>
            <span className="text-xs font-semibold text-cop-600 tracking-wider uppercase">Phiên bản hiện hành</span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
              {versionList[0]?.name || 'Bộ Tiêu Chí Quốc Gia Đánh Giá & Phân Hạng OCOP 2026'}
            </h3>
          </div>
          <StatusBadge status="PUBLISHED" label="Ban hành chính thức" />
        </div>

        {/* Criteria Tree Hierarchy */}
        <div className="space-y-6">
          {dummyTree.map((group) => (
            <div key={group.id} className="border border-slate-200/80 rounded-xl overflow-hidden shadow-card">
              <div className="bg-cop-900 text-white px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{group.code}: {group.name}</span>
                </div>
              </div>

              <div className="p-4 bg-white divide-y divide-slate-100">
                {group.criteria.map((criterion) => (
                  <div key={criterion.id} className="py-3 first:pt-0 last:pb-0">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-cop-600" />
                        {criterion.code} - {criterion.name}
                      </span>
                      <span className="text-slate-500 font-semibold">Tối đa {criterion.max_score} điểm</span>
                    </h4>

                    <div className="ml-5 space-y-2">
                      {criterion.indicators.map((ind) => (
                        <div
                          key={ind.id}
                          className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-cop-700">{ind.code}</span>
                            <span className="text-slate-700 font-medium">{ind.name}</span>
                            {ind.is_mandatory && (
                              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]" title="Chỉ tiêu bắt buộc khống chế hạ sao khi đạt 0 điểm">
                                <ShieldAlert className="w-3 h-3 text-rose-600" /> Bắt buộc (*)
                              </span>
                            )}
                          </div>
                          <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded border">
                            {ind.max_score} điểm
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
