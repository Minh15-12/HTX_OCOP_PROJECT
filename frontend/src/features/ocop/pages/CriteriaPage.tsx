import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award } from 'lucide-react';
import { PageHeader } from '@/layouts/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { apiClient } from '@/services/apiClient';
import {
  CriteriaGroupItem,
  CriteriaVersionItem,
  OCOP_26_SUB_PRODUCT_SETS,
  CRITERIA_TREES_BY_CATEGORY,
} from '../data/criteriaCatalogData';
import { SubProductSetSelector } from '../components/criteria/SubProductSetSelector';
import { CriteriaGroupCard } from '../components/criteria/CriteriaGroupCard';

export const CriteriaPage: React.FC = () => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>('ver-2026');
  const [selectedCategory, setSelectedCategory] = useState<string>('FOOD');
  const [selectedSubSetId, setSelectedSubSetId] = useState<string>('sp-01');

  const activeSubSet =
    OCOP_26_SUB_PRODUCT_SETS.find((s) => s.id === selectedSubSetId) ||
    OCOP_26_SUB_PRODUCT_SETS[0];

  // Query Criteria Versions
  const { data: versionsData } = useQuery({
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

  // Get active tree based on tab selection
  const currentCategoryKey =
    selectedCategory in CRITERIA_TREES_BY_CATEGORY ? selectedCategory : 'FOOD';
  const activeTree: CriteriaGroupItem[] = CRITERIA_TREES_BY_CATEGORY[currentCategoryKey];

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

      {/* Version & Product Category Selector Card */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4 mb-4">
          <div>
            <span className="text-xs font-semibold text-[#15803d] tracking-wider uppercase">
              Phiên bản hiện hành (QĐ 148/QĐ-TTg)
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
              {versionList[0]?.name || 'Bộ Tiêu Chí Quốc Gia Đánh Giá & Phân Hạng OCOP 2026'}
            </h3>
          </div>
          <StatusBadge status="PUBLISHED" label="Ban hành chính thức" />
        </div>

        {/* 26 Sub-Product Sets Selector */}
        <SubProductSetSelector
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSubSetId={selectedSubSetId}
          setSelectedSubSetId={setSelectedSubSetId}
          activeSubSet={activeSubSet}
        />

        {/* Criteria Tree Hierarchy */}
        <div className="space-y-6">
          {activeTree.map((group) => (
            <CriteriaGroupCard key={group.id} group={group} />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CriteriaPage;
