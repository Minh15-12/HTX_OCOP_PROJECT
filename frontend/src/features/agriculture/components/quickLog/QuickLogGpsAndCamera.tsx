import React from 'react';
import { MapPin, CheckCircle, Camera, Trash2 } from 'lucide-react';
import { ActivityType } from '@/types/agriculture';

interface QuickLogGpsAndCameraProps {
  activityType: ActivityType;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  gpsAccuracy: number | null;
  gpsLoading: boolean;
  gpsError: string | null;
  handleGetGps: () => void;
  photos: string[];
  isCompressingPhoto: boolean;
  handlePhotoCapture: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemovePhoto: (index: number) => void;
}

export const QuickLogGpsAndCamera: React.FC<QuickLogGpsAndCameraProps> = ({
  activityType,
  gpsLatitude,
  gpsLongitude,
  gpsAccuracy,
  gpsLoading,
  gpsError,
  handleGetGps,
  photos,
  isCompressingPhoto,
  handlePhotoCapture,
  handleRemovePhoto,
}) => {
  return (
    <>
      {/* 1-Tap Geolocation Auto-Fill (Touch Target >= 48px) */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            5. Tọa độ GPS hiện trường{' '}
            {activityType === 'SPRAYING' && <span className="text-rose-500">* Bắt buộc</span>}
          </label>
          <button
            type="button"
            onClick={handleGetGps}
            disabled={gpsLoading}
            className="min-h-[48px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <MapPin className="w-4 h-4 animate-bounce" />
            {gpsLoading ? 'Đang định vị...' : '📍 Lấy GPS 1 chạm'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {gpsLatitude && gpsLongitude ? (
            <div className="flex items-center gap-2 w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-mono font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Vĩ độ: {gpsLatitude}° N • Kinh độ: {gpsLongitude}° E (Độ chính xác: ±
                {gpsAccuracy || 10}m)
              </span>
            </div>
          ) : (
            <div className="w-full p-2.5 bg-slate-100 rounded-xl text-slate-500 italic text-[11.5px]">
              Chưa lấy tọa độ. Bấm nút màu xanh phía trên để tự động nhận diện vị trí thửa đất qua
              GPS.
            </div>
          )}
        </div>
        {gpsError && <p className="text-[11px] text-amber-700">{gpsError}</p>}
      </div>

      {/* Camera / Real Evidence Photo */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-emerald-600" />
          6. Chụp ảnh / Tải minh chứng thực địa (Thông tư 02)
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <label className="min-h-[48px] px-4 py-2.5 rounded-xl border border-dashed border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition active:scale-95">
            {isCompressingPhoto ? (
              <>
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Đang nén &amp; tối ưu ảnh...</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Chụp / Chọn ảnh bằng chứng</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              disabled={isCompressingPhoto}
              onChange={handlePhotoCapture}
              className="hidden"
            />
          </label>

          {photos.map((src, idx) => (
            <div
              key={idx}
              className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-300 shadow-sm"
            >
              <img src={src} alt="Evidence preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemovePhoto(idx)}
                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-300" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
