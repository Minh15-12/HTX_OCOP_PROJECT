import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QrCode, Plus, ExternalLink, Unlink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ProductItem, productApi } from '@/services/productApi';
import { QrCodeSvg } from '@/features/agriculture/components/QrCodeSvg';

interface ProductTabLotsProps {
  product: ProductItem;
  onOpenAttachLot?: (productId: string) => void;
}

export const ProductTabLots: React.FC<ProductTabLotsProps> = ({
  product,
  onOpenAttachLot,
}) => {
  const queryClient = useQueryClient();
  const [detachingLotId, setDetachingLotId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch product lots
  const { data: apiLots = [], isLoading } = useQuery<any[]>({
    queryKey: ['productLots', product.id],
    queryFn: () => productApi.getProductLots(product.id),
  });

  // Combine lots from product object or API without silent fallback mock
  const lots = apiLots.length > 0 ? apiLots : (product.lots || []);

  const detachMutation = useMutation({
    mutationFn: (lotId: string) => productApi.detachLotFromProduct(product.id, lotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productLots', product.id] });
      setDetachingLotId(null);
      setMessage({ text: 'Đã gỡ liên kết lô thu hoạch thành công!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ text: err?.message || 'Có lỗi khi gỡ liên kết lô', type: 'error' });
      setDetachingLotId(null);
    },
  });

  const handleDetachLot = (lotId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn gỡ liên kết lô hàng GS1 này khỏi sản phẩm OCOP?')) {
      setDetachingLotId(lotId);
      detachMutation.mutate(lotId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          {message.text}
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-extrabold text-slate-800">
            Lô thu hoạch GS1 liên kết ({lots.length})
          </h4>
          <p className="text-[11px] text-slate-400">
            Mỗi lô sản phẩm được truy xuất nguồn gốc chuỗi cung ứng minh bạch đến tận thửa đất.
          </p>
        </div>

        {onOpenAttachLot && (
          <button
            type="button"
            onClick={() => onOpenAttachLot(product.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Gán lô mới
          </button>
        )}
      </div>

      {/* Lots List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            Đang tải danh sách lô liên kết...
          </div>
        ) : lots.length > 0 ? (
          lots.map((lot: any, idx: number) => {
            const lotId = lot.id || lot.lot_id || `lot-${idx}`;
            const lotCode = lot.lot_code || lot.harvest_code || lot.code || `LOT-${lotId.slice(-6)}`;
            const quantity = lot.quantity || lot.pivot?.quantity || 0;
            const traceUrl = `https://trace.ocop.gov.vn/verify/${lotCode}`;
            const isDetaching = detachingLotId === lotId || detachingLotId === lotCode;

            return (
              <div
                key={lotId}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-900">
                          {lotCode}
                        </span>
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {lot.status || 'Đã kiểm định KCS'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Sản lượng liên kết:{' '}
                        <strong className="text-slate-800 font-mono">
                          {quantity > 0 ? quantity.toLocaleString('vi-VN') : 'Theo vụ thu hoạch'} {product.unit || 'Kg'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-lg p-1 flex items-center justify-center shrink-0">
                    <QrCodeSvg value={traceUrl} size={40} />
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <div className="flex items-center gap-3">
                    <a
                      href={traceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      Tra cứu GS1 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDetachLot(lotId)}
                    disabled={isDetaching}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition cursor-pointer disabled:opacity-50"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    {isDetaching ? 'Đang gỡ...' : 'Gỡ lô'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <QrCode className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Chưa liên kết Lô thu hoạch GS1</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Sản phẩm OCOP cần được gán ít nhất một Lô thu hoạch từ đồng ruộng để hình thành chuỗi truy xuất nguồn gốc QR quốc gia.
            </p>
            {onOpenAttachLot && (
              <button
                type="button"
                onClick={() => onOpenAttachLot(product.id)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Liên kết Lô thu hoạch ngay
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
