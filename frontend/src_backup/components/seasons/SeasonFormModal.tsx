import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Season, SeasonFormData } from '../../types/season';

interface Props {
  open: boolean;
  initialData?: Season | null;
  onClose: () => void;
  onSubmit: (data: SeasonFormData) => Promise<void>;
}

const emptyForm: SeasonFormData = {
  code: '',
  name: '',
  crop: '',
  variety: '',
  farming_method: '',
  area: 0,
  start_date: '',
  end_date: '',
  target_yield: 0,
  manager_name: '',
  notes: '',
};

export default function SeasonFormModal({ open, initialData, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<SeasonFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        code: initialData.code,
        name: initialData.name,
        vung_trong_id: initialData.vung_trong_id ?? undefined,
        crop: initialData.crop,
        variety: initialData.variety ?? '',
        farming_method: initialData.farming_method ?? '',
        area: initialData.area,
        start_date: initialData.start_date,
        end_date: initialData.end_date,
        target_yield: initialData.target_yield,
        manager_name: initialData.manager_name ?? '',
        notes: initialData.notes ?? '',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [initialData, open]);

  if (!open) return null;

  function update<K extends keyof SeasonFormData>(key: K, value: SeasonFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.code.trim()) next.code = 'Vui lòng nhập mã mùa vụ';
    if (!form.name.trim()) next.name = 'Vui lòng nhập tên mùa vụ';
    if (!form.crop.trim()) next.crop = 'Vui lòng nhập cây trồng chủ lực';
    if (!form.start_date) next.start_date = 'Vui lòng chọn ngày bắt đầu';
    if (!form.end_date) next.end_date = 'Vui lòng chọn ngày kết thúc';
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      next.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    if (form.area < 0) next.area = 'Diện tích không hợp lệ';
    if (form.target_yield < 0) next.target_yield = 'Sản lượng không hợp lệ';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? 'Chỉnh sửa mùa vụ' : 'Tạo mùa vụ mới'}
          </h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mã mùa vụ" error={errors.code} required>
              <input
                className="input"
                placeholder="VD: MV-2026-XUAN"
                value={form.code}
                onChange={(e) => update('code', e.target.value)}
                disabled={!!initialData}
              />
            </Field>
            <Field label="Tên mùa vụ" error={errors.name} required>
              <input
                className="input"
                placeholder="VD: Mùa Vụ Xuân Hè 2026"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Cây trồng chủ lực" error={errors.crop} required>
              <input
                className="input"
                placeholder="VD: Chè Shan Tuyết cổ thụ"
                value={form.crop}
                onChange={(e) => update('crop', e.target.value)}
              />
            </Field>
            <Field label="Giống">
              <input
                className="input"
                value={form.variety}
                onChange={(e) => update('variety', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Phương thức canh tác">
              <select
                className="input"
                value={form.farming_method}
                onChange={(e) => update('farming_method', e.target.value)}
              >
                <option value="">-- Chọn --</option>
                <option value="Hữu cơ">Hữu cơ</option>
                <option value="VietGAP">VietGAP</option>
                <option value="Thông thường">Thông thường</option>
              </select>
            </Field>
            <Field label="Diện tích (ha)" error={errors.area} required>
              <input
                type="number"
                min={0}
                step="0.1"
                className="input"
                value={form.area}
                onChange={(e) => update('area', Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Ngày bắt đầu" error={errors.start_date} required>
              <input
                type="date"
                className="input"
                value={form.start_date}
                onChange={(e) => update('start_date', e.target.value)}
              />
            </Field>
            <Field label="Ngày kết thúc" error={errors.end_date} required>
              <input
                type="date"
                className="input"
                value={form.end_date}
                onChange={(e) => update('end_date', e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Sản lượng mục tiêu (kg)" error={errors.target_yield} required>
              <input
                type="number"
                min={0}
                className="input"
                value={form.target_yield}
                onChange={(e) => update('target_yield', Number(e.target.value))}
              />
            </Field>
            <Field label="Người phụ trách">
              <input
                className="input"
                value={form.manager_name}
                onChange={(e) => update('manager_name', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Ghi chú">
            <textarea
              className="input min-h-[80px]"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </Field>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? 'Đang lưu...' : initialData ? 'Lưu thay đổi' : 'Tạo mùa vụ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
