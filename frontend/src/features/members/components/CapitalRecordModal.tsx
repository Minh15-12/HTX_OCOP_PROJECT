import React, { useState, useRef } from 'react';
import { Wallet, Building, MapPin, X } from 'lucide-react';
import { Member } from '@/types/memberTypes';
import { CapitalStep2Valuation } from './capitalModal/CapitalStep2Valuation';
import { CapitalStep3Review } from './capitalModal/CapitalStep3Review';

export interface CapitalFormData {
  member_id: string;
  contribution_type: 'TIEN_MAT' | 'CHUYEN_KHOAN' | 'LAND' | 'HIEN_VAT';
  amount: number;
  contribution_date: string;
  receipt_number: string;
  content: string;
  approval_mode: 'DIRECT_APPROVE' | 'SUBMIT_PENDING';
  notes: string;
  land_certificate_no?: string;
  plot_number?: string;
  map_sheet_number?: string;
  land_area_sqm?: number;
  land_use_type?: string;
  cadastral_status?: 'PENDING' | 'NOTARIZED' | 'REGISTERED_CHANGE';
  appraised_unit_price?: number;
  uploaded_file?: { name: string; size: string; url?: string } | null;
}

interface CapitalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  totalContributedCapital: number;
  initialMemberId?: string;
  initialContributionType?: 'TIEN_MAT' | 'CHUYEN_KHOAN' | 'LAND' | 'HIEN_VAT';
  onSubmit: (formData: CapitalFormData) => Promise<void> | void;
}

export const CapitalRecordModal: React.FC<CapitalRecordModalProps> = ({
  isOpen,
  onClose,
  members,
  totalContributedCapital,
  initialMemberId,
  initialContributionType,
  onSubmit,
}) => {
  const [recordStep, setRecordStep] = useState<1 | 2 | 3>(1);
  const [capitalForm, setCapitalForm] = useState<CapitalFormData>({
    member_id: initialMemberId || members[0]?.id || '',
    contribution_type: initialContributionType || 'TIEN_MAT',
    amount: 0,
    contribution_date: new Date().toISOString().split('T')[0],
    receipt_number: `PT${Math.floor(100000 + Math.random() * 900000)}`,
    content: '',
    approval_mode: 'DIRECT_APPROVE',
    notes: '',
    land_certificate_no: '',
    plot_number: '',
    map_sheet_number: '',
    land_area_sqm: 0,
    land_use_type: '',
    cadastral_status: 'REGISTERED_CHANGE',
    appraised_unit_price: 0,
    uploaded_file: null,
  });

  React.useEffect(() => {
    if (isOpen) {
      setCapitalForm({
        member_id: initialMemberId || members[0]?.id || '',
        contribution_type: initialContributionType || 'TIEN_MAT',
        amount: 0,
        contribution_date: new Date().toISOString().split('T')[0],
        receipt_number: `PT${Math.floor(100000 + Math.random() * 900000)}`,
        content: '',
        approval_mode: 'DIRECT_APPROVE',
        notes: '',
        land_certificate_no: '',
        plot_number: '',
        map_sheet_number: '',
        land_area_sqm: 0,
        land_use_type: '',
        cadastral_status: 'REGISTERED_CHANGE',
        appraised_unit_price: 0,
        uploaded_file: null,
      });
      setRecordStep(1);
    }
  }, [isOpen, initialMemberId, initialContributionType, members]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setCapitalForm((prev) => ({
        ...prev,
        uploaded_file: { name: file.name, size: `${sizeMb} MB`, url: URL.createObjectURL(file) },
      }));
    }
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setCapitalForm((prev) => ({
        ...prev,
        uploaded_file: { name: file.name, size: `${sizeMb} MB`, url: URL.createObjectURL(file) },
      }));
    }
  };

  const selectedMember = members.find((m) => m.id === capitalForm.member_id) || members[0];
  const effectiveAmount =
    capitalForm.contribution_type === 'LAND'
      ? (capitalForm.land_area_sqm || 0) * (capitalForm.appraised_unit_price || 0)
      : capitalForm.amount;

  const currentMemberContributed = selectedMember ? selectedMember.contributed_capital || 0 : 0;
  const newMemberTotal = currentMemberContributed + effectiveAmount;
  const newCoopTotal = totalContributedCapital + effectiveAmount;
  const projectedOwnershipPct = newCoopTotal > 0 ? (newMemberTotal / newCoopTotal) * 100 : 0;
  const isCeilingBreach =
    selectedMember?.member_type === 'CHINH_THUC' && projectedOwnershipPct > 30.0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCeilingBreach) {
      alert(
        `CẢNH BÁO VI PHẠM: Tỷ lệ sở hữu dự kiến ${projectedOwnershipPct.toFixed(
          2
        )}% vượt trần 30% theo Luật HTX 2023!`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ ...capitalForm, amount: effectiveAmount });
      onClose();
      setRecordStep(1);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi ghi nhận vốn góp');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-modal overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
              {recordStep}
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {recordStep === 1 && 'Bước 1: Chọn Xã viên & Hình thức tài sản'}
              {recordStep === 2 && 'Bước 2: Định giá & Thông tin tài sản góp'}
              {recordStep === 3 && 'Bước 3: Xác nhận & Kiểm tra ranh giới Luật 2023'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-[12.8px]">
          {recordStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn Thành viên HTX *
                </label>
                <select
                  value={capitalForm.member_id}
                  onChange={(e) => setCapitalForm({ ...capitalForm, member_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.member_code}) -{' '}
                      {m.member_type === 'CHINH_THUC' ? 'Chính thức' : 'Liên kết'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Hình thức tài sản đóng góp *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() =>
                      setCapitalForm({ ...capitalForm, contribution_type: 'TIEN_MAT' })
                    }
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-2.5 transition-all ${
                      capitalForm.contribution_type === 'TIEN_MAT'
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-extrabold text-slate-800">Tiền mặt</div>
                      <div className="text-[10.5px] text-slate-400">Nộp tiền trực tiếp tại quỹ</div>
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      setCapitalForm({ ...capitalForm, contribution_type: 'CHUYEN_KHOAN' })
                    }
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-2.5 transition-all ${
                      capitalForm.contribution_type === 'CHUYEN_KHOAN'
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-extrabold text-slate-800">Chuyển khoản</div>
                      <div className="text-[10.5px] text-slate-400">
                        Qua tài khoản ngân hàng HTX
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setCapitalForm({ ...capitalForm, contribution_type: 'LAND' })}
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-2.5 col-span-2 transition-all ${
                      capitalForm.contribution_type === 'LAND'
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="font-extrabold text-slate-800">
                        Quyền sử dụng đất (QSDĐ)
                      </div>
                      <div className="text-[10.5px] text-slate-400">
                        Định giá ruộng đất tích tụ canh tác sang tên HTX (Miễn 100% lệ phí trước bạ
                        theo Luật HTX 2023)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRecordStep(2)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Tiếp theo &rarr;
                </button>
              </div>
            </div>
          )}

          {recordStep === 2 && (
            <CapitalStep2Valuation
              capitalForm={capitalForm}
              setCapitalForm={setCapitalForm}
              fileInputRef={fileInputRef}
              handleFileSelect={handleFileSelect}
              handleDropFile={handleDropFile}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              onBack={() => setRecordStep(1)}
              onNext={() => setRecordStep(3)}
            />
          )}

          {recordStep === 3 && (
            <CapitalStep3Review
              capitalForm={capitalForm}
              setCapitalForm={setCapitalForm}
              selectedMember={selectedMember}
              effectiveAmount={effectiveAmount}
              projectedOwnershipPct={projectedOwnershipPct}
              isCeilingBreach={isCeilingBreach}
              isSubmitting={isSubmitting}
              onBack={() => setRecordStep(2)}
            />
          )}
        </form>
      </div>
    </div>
  );
};
