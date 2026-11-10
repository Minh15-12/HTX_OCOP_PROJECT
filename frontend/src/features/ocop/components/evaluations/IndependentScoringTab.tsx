import React from 'react';
import { Award, Lock, FileText, Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface IndependentScoringTabProps {
  evaluatorScores: Record<string, number>;
  setEvaluatorScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  evaluatorComments: Record<string, string>;
  setEvaluatorComments: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isScoreSheetLocked: boolean;
  isLockPending: boolean;
  onLockScoreSheet: () => void;
  totalEvaluatorScore: number;
}

export const IndependentScoringTab: React.FC<IndependentScoringTabProps> = ({
  evaluatorScores,
  setEvaluatorScores,
  evaluatorComments,
  setEvaluatorComments,
  isScoreSheetLocked,
  isLockPending,
  onLockScoreSheet,
  totalEvaluatorScore,
}) => {
  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="bg-emerald-900 text-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Phiếu Chấm Điểm Độc Lập Giám Khảo
          </span>
          <h2 className="text-lg font-bold">Hồ sơ: Gạo Nếp Nương Đặc Sản (OCOP-2026-0089)</h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Giám khảo: Nguyễn Văn A (Ủy viên Hội đồng OCOP Cấp Tỉnh)
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-800/80 px-4 py-2 rounded-lg border border-emerald-700 text-right">
            <div className="text-xs text-emerald-200">Tổng điểm cá nhân</div>
            <div className="text-2xl font-black text-amber-400">
              {totalEvaluatorScore.toFixed(1)} / 100.0
            </div>
          </div>
          <Button
            variant={isScoreSheetLocked ? 'secondary' : 'primary'}
            disabled={isScoreSheetLocked || isLockPending}
            onClick={onLockScoreSheet}
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
                    <div className="text-sm font-medium text-gray-900">
                      Giấy Chứng Nhận VietGAP 2026
                    </div>
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
                    <div className="text-sm font-medium text-gray-900">
                      Kết Quả Kiểm Nghiệm An Toàn Thực Phẩm ISO 17025
                    </div>
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
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Chỉ tiêu 1.1
                    </span>
                    <h4 className="font-semibold text-gray-900 mt-1">
                      Nguồn gốc nguyên liệu nông sản vùng trồng (*)
                    </h4>
                    <p className="text-xs text-gray-500">
                      Nguyên liệu được sản xuất 100% tại địa phương có chứng nhận.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded">
                    Max: 10.0 điểm
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-4">
                    <label className="text-xs font-medium text-gray-700">Điểm chấm (0 - 10.0)</label>
                    <Input
                      type="number"
                      disabled={isScoreSheetLocked}
                      value={evaluatorScores['i1'] || ''}
                      onChange={(e) =>
                        setEvaluatorScores({
                          ...evaluatorScores,
                          i1: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="sm:col-span-8">
                    <label className="text-xs font-medium text-gray-700">
                      Nhận xét / Nhận định của Giám khảo
                    </label>
                    <Input
                      disabled={isScoreSheetLocked}
                      value={evaluatorComments['i1'] || ''}
                      onChange={(e) =>
                        setEvaluatorComments({ ...evaluatorComments, i1: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Indicator item 2 */}
              <div className="p-4 border rounded-xl bg-white space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Chỉ tiêu 2.1
                    </span>
                    <h4 className="font-semibold text-gray-900 mt-1">
                      Phiếu kết quả kiểm nghiệm ATTP &amp; Chất lượng (*)
                    </h4>
                    <p className="text-xs text-gray-500">
                      Kiểm nghiệm đầy đủ các chỉ tiêu vi sinh, kim loại nặng.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded">
                    Max: 15.0 điểm
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-4">
                    <label className="text-xs font-medium text-gray-700">Điểm chấm (0 - 15.0)</label>
                    <Input
                      type="number"
                      disabled={isScoreSheetLocked}
                      value={evaluatorScores['i2'] || ''}
                      onChange={(e) =>
                        setEvaluatorScores({
                          ...evaluatorScores,
                          i2: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="sm:col-span-8">
                    <label className="text-xs font-medium text-gray-700">
                      Nhận xét / Nhận định của Giám khảo
                    </label>
                    <Input
                      disabled={isScoreSheetLocked}
                      value={evaluatorComments['i2'] || ''}
                      onChange={(e) =>
                        setEvaluatorComments({ ...evaluatorComments, i2: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
