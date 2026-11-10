import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Smartphone,
  Layers,
  Sprout,
  CheckCircle2,
  Clock,
  History,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { FieldPlotSelectorCard, FieldPlotItem } from '../components/field/FieldPlotSelectorCard';
import { FieldLogQuickForm } from '../components/field/FieldLogQuickForm';
import { fetchAllPlots, FarmPlot } from '@/services/farmPlotApi';
import { fetchCropSeasons, CropSeason } from '@/services/cropSeasonApi';
import { fetchFarmingLogs, createFarmingLog } from '@/services/farmingLogApi';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/ToastNotification';
import type { FarmingLog, FarmingLogPayload } from '@/types/agriculture';
import { ACTIVITY_TYPES_META } from '@/types/agriculture';
import { getOfflineQueue, syncOfflineQueue } from '../utils/offlineLogStorage';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const FieldLogEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [selectedPlot, setSelectedPlot] = useState<FieldPlotItem | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [offlineCount, setOfflineCount] = useState<number>(0);
  const [isSyncingOffline, setIsSyncingOffline] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Monitor network status & offline queue
  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
      setOfflineCount(getOfflineQueue().length);
    };
    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    const interval = setInterval(updateStatus, 3000);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(interval);
    };
  }, []);

  const handleSyncOffline = async () => {
    if (!navigator.onLine) {
      showToast('Thiết bị đang ngoại tuyến. Vui lòng kết nối Internet/4G trước khi đồng bộ!', 'warning');
      return;
    }
    setIsSyncingOffline(true);
    try {
      const count = await syncOfflineQueue();
      setOfflineCount(getOfflineQueue().length);
      showToast(`Đồng bộ thành công ${count} bản ghi nhật ký ngoại tuyến lên máy chủ HTX!`, 'success');
      queryClient.invalidateQueries({ queryKey: ['farming-logs'] });
      refetchLogs();
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi đồng bộ hàng đợi ngoại tuyến!', 'error');
    } finally {
      setIsSyncingOffline(false);
    }
  };

  // Role-based scoping: determine if user is a Farmer or Manager/Officer
  const userRoles = useMemo(() => {
    if (!user?.roles) return [];
    return user.roles.map((r: any) => (typeof r === 'string' ? r : r.code || r.name));
  }, [user]);

  const isFarmer = useMemo(() => {
    const hasAdminRole = userRoles.some((r) =>
      ['SYSTEM_ADMIN', 'HTX_OWNER', 'AGRICULTURE_OFFICER', 'HTX_STAFF', 'STOREKEEPER', 'ACCOUNTANT'].includes(r)
    );
    if (hasAdminRole) return false;
    return userRoles.includes('HTX_MEMBER') || userRoles.includes('MEMBER') || !!user?.member_id;
  }, [userRoles, user]);

  const isManagerOrOfficer = !isFarmer;
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('ALL');

  // Fetch real plots from backend API (scoped if farmer)
  const { data: rawPlots = [] } = useQuery<FarmPlot[]>({
    queryKey: ['farmPlots', isFarmer ? user?.member_id || 'member' : 'all'],
    queryFn: () =>
      isFarmer && user?.member_id
        ? fetchAllPlots({ member_id: user.member_id, per_page: 50 })
        : fetchAllPlots({ per_page: 100 }),
  });

  // Fetch real crop seasons
  const { data: seasons = [] } = useQuery<CropSeason[]>({
    queryKey: ['cropSeasons'],
    queryFn: () => fetchCropSeasons(),
  });

  // Fetch real farming logs
  const { data: allLogs = [], refetch: refetchLogs } = useQuery<FarmingLog[]>({
    queryKey: ['farming-logs'],
    queryFn: () => fetchFarmingLogs(),
  });

  // Extract unique assigned members for manager dropdown filter
  const assignedMembersList = useMemo(() => {
    const map = new Map<string, { id: string; code: string; name: string }>();
    rawPlots.forEach((p) => {
      p.assignments?.forEach((a) => {
        if (a.member_id && !map.has(a.member_id)) {
          map.set(a.member_id, {
            id: a.member_id,
            code: a.member_code || '',
            name: a.member_name || a.member_code || 'Xã viên',
          });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [rawPlots]);

  // Map plots dynamically from real database data with role scoping
  const plots: FieldPlotItem[] = useMemo(() => {
    let sourcePlots = rawPlots;

    // Strict defense-in-depth: if farmer, strictly filter by member_id or member_code
    if (isFarmer && (user?.member_id || user?.member_code)) {
      sourcePlots = rawPlots.filter((p) =>
        p.assignments?.some(
          (a) =>
            (user?.member_id && a.member_id === user.member_id) ||
            (user?.member_code && a.member_code === user.member_code)
        )
      );
    } else if (selectedMemberFilter !== 'ALL') {
      sourcePlots = rawPlots.filter((p) =>
        p.assignments?.some((a) => a.member_id === selectedMemberFilter)
      );
    }

    return sourcePlots.map((p) => {
      const isQuarantine = p.status === 'IN_QUARANTINE';
      let phiRemaining = 0;
      const safeHarvestDate = p.safe_harvest_date || (p as any).quarantine_until || (p as any).land_relation?.safe_harvest_date;
      if (isQuarantine && safeHarvestDate) {
        const diffMs = new Date(safeHarvestDate).getTime() - Date.now();
        phiRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }
      const firstAssignment = p.assignments?.[0];
      const areaNum = p.area ? Number(p.area) : 0;
      const areaHa = areaNum < 100 ? areaNum : areaNum / 10000;
      const areaM2 = areaNum < 100 ? areaNum * 10000 : areaNum;

      return {
        id: p.id,
        plot_code: p.plot_code,
        name: `${p.plot_code}${p.unit_name ? ` - ${p.unit_name}` : ''}`,
        crop_name: p.unit_code ? `Cây trồng vùng ${p.unit_code}` : 'Cây trồng HTX',
        area_m2: areaM2,
        area_ha: areaHa,
        assigned_member_name: firstAssignment?.member_name,
        assigned_member_code: firstAssignment?.member_code,
        is_in_quarantine: isQuarantine,
        phi_days_remaining: phiRemaining,
        safe_harvest_date: safeHarvestDate || undefined,
      };
    });
  }, [rawPlots, isFarmer, user, selectedMemberFilter]);

  useEffect(() => {
    if (plots.length > 0 && (!selectedPlot || !plots.some((p) => p.id === selectedPlot.id))) {
      setSelectedPlot(plots[0]);
    }
  }, [plots, selectedPlot]);

  useEffect(() => {
    if (seasons.length > 0 && !selectedSeasonId) {
      const activeSeason = seasons.find((s) => s.status === 'ACTIVE') || seasons[0];
      setSelectedSeasonId(activeSeason.id);
    }
  }, [seasons, selectedSeasonId]);

  // Active selected raw plot
  const activeRawPlot = useMemo(() => {
    return rawPlots.find((p) => p.id === selectedPlot?.id) || null;
  }, [rawPlots, selectedPlot]);

  // Active selected crop season
  const activeSeason = useMemo(() => {
    return seasons.find((s) => s.id === selectedSeasonId) || null;
  }, [seasons, selectedSeasonId]);

  // Extract GPS centroid & Boundary from activeRawPlot
  const { plotGpsLat, plotGpsLng, plotBoundary } = useMemo(() => {
    let lat: number | undefined;
    let lng: number | undefined;
    let boundary: any[] | undefined;

    if (activeRawPlot) {
      if (activeRawPlot.geometry_geojson) {
        const geo = activeRawPlot.geometry_geojson;
        const coords = geo.coordinates || geo.geometry?.coordinates;
        if (Array.isArray(coords)) {
          const ring = Array.isArray(coords[0]) && Array.isArray(coords[0][0]) ? coords[0] : coords;
          if (Array.isArray(ring) && ring.length > 0) {
            boundary = ring;
            let sumLat = 0;
            let sumLng = 0;
            let count = 0;
            for (const pt of ring) {
              if (Array.isArray(pt) && pt.length >= 2) {
                sumLng += Number(pt[0]);
                sumLat += Number(pt[1]);
                count++;
              }
            }
            if (count > 0) {
              lat = sumLat / count;
              lng = sumLng / count;
            }
          }
        }
      }

      if ((!lat || !lng) && activeRawPlot.gps_coordinates) {
        const parts = activeRawPlot.gps_coordinates.split(',').map((s) => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          lat = parts[0];
          lng = parts[1];
        }
      }
    }

    return { plotGpsLat: lat, plotGpsLng: lng, plotBoundary: boundary };
  }, [activeRawPlot]);

  // Filter recent logs for selected plot
  const recentLogs = useMemo(() => {
    if (!selectedPlot) return allLogs.slice(0, 5);
    const filtered = allLogs.filter((l) => l.plot_id === selectedPlot.id || l.plot_code === selectedPlot.plot_code);
    return filtered.length > 0 ? filtered.slice(0, 5) : allLogs.slice(0, 5);
  }, [allLogs, selectedPlot]);

  const handleFormSubmit = async (payload: FarmingLogPayload) => {
    setIsSubmitting(true);
    try {
      await createFarmingLog(payload);
      showToast('Ghi nhận nhật ký canh tác thực địa thành công!', 'success');
      queryClient.invalidateQueries({ queryKey: ['farming-logs'] });
      refetchLogs();
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi lưu nhật ký!', 'error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-fade-in text-slate-800">
      {/* 1. Header with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 border border-emerald-200">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Chế độ Tác nghiệp Hiện trường (Field Mobile Mode)</span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            Nhật Ký Canh Tác Ngoài Đồng
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">
            Dành cho xã viên thao tác nhanh tại thửa đất • Tiêu chuẩn VietGAP TCVN 11892-1:2017 &amp; TCVN 12850:2019
          </p>
        </div>

        {/* Mode Switcher to Supervisory Desk (Only for managers / officers) */}
        {isManagerOrOfficer ? (
          <button
            type="button"
            onClick={() => navigate('/agriculture/logs')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer active:scale-95 shrink-0"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Sang Bàn Hậu Kiểm HTX</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-2xs shrink-0">
            <span>👤 Xã viên: {user?.member_code ? `[${user.member_code}] ` : ''}{user?.full_name}</span>
          </div>
        )}
      </div>

      {/* Offline Queue Status Bar */}
      {offlineCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-2">
                <span>Hàng đợi nhật ký ngoại tuyến ({offlineCount} bản ghi)</span>
                {!isOnline && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                    Mất sóng ruộng
                  </span>
                )}
              </h4>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                Các bản ghi được lưu cục bộ an toàn trên máy. Nhấn đồng bộ khi có kết nối 4G/Wifi.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSyncOffline}
            disabled={isSyncingOffline}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isSyncingOffline ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Đồng bộ ngay ({offlineCount})</span>
          </button>
        </div>
      )}

      {/* 2. Thửa đất canh tác (Assigned Plots) */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              {isFarmer ? 'Thửa đất được phân công cho bạn' : 'Thửa đất đang canh tác'} ({plots.length})
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {isManagerOrOfficer && assignedMembersList.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Lọc xã viên:</span>
                <select
                  value={selectedMemberFilter}
                  onChange={(e) => setSelectedMemberFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                >
                  <option value="ALL">Tất cả Xã viên ({rawPlots.length} thửa)</option>
                  {assignedMembersList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code ? `[${m.code}] ` : ''}{m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Chạm để chọn thửa</span>
          </div>
        </div>

        {plots.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
            {isFarmer
              ? 'Tài khoản xã viên của bạn hiện chưa được phân công thửa đất canh tác nào. Vui lòng liên hệ Cán bộ Kỹ thuật HTX để được phân công thửa.'
              : 'Không tìm thấy thửa đất nào phù hợp với bộ lọc xã viên đã chọn.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {plots.map((plot) => (
              <FieldPlotSelectorCard
                key={plot.id}
                plot={plot}
                isSelected={selectedPlot?.id === plot.id}
                onSelect={(p) => setSelectedPlot(p)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Form Ghi nhật ký nhanh (Form tác nghiệp) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>Ghi nhận công việc hôm nay</span>
              {selectedPlot && (
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {selectedPlot.plot_code}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống tự động kích hoạt chốt chặn an toàn PHI Guard khi phun thuốc BVTV
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {selectedPlot ? (
          <FieldLogQuickForm
            selectedPlotId={selectedPlot.id}
            selectedPlotCode={selectedPlot.plot_code}
            selectedSeasonId={selectedSeasonId}
            plotGpsLat={plotGpsLat}
            plotGpsLng={plotGpsLng}
            plotBoundary={plotBoundary}
            expectedHarvestStart={(activeSeason as any)?.expected_harvest_start || activeSeason?.start_date}
            onSuccess={() => refetchLogs()}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 font-medium">
            Vui lòng chọn thửa đất ở trên để bắt đầu ghi nhật ký canh tác.
          </div>
        )}
      </section>

      {/* 4. Dòng thời gian các lần ghi gần đây của thửa (Recent Log Timeline) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Lịch sử ghi chép gần nhất {selectedPlot ? `(Thửa ${selectedPlot.plot_code})` : ''}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">5 lần gần nhất</span>
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-medium">
            Chưa có lượt ghi nhật ký nào cho thửa đất này.
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => {
              const meta = ACTIVITY_TYPES_META[log.activity_type] || {
                label: log.activity_type,
                badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
              };

              return (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-lg shadow-2xs">
                      {log.activity_type === 'LAND_PREPARATION' && '🚜'}
                      {log.activity_type === 'FERTILIZATION' && '🌱'}
                      {log.activity_type === 'SPRAYING' && '🛡️'}
                      {log.activity_type === 'CARE' && '✂️'}
                      {log.activity_type === 'HARVEST' && '🧺'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-black border ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {log.plot_code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-1">
                        {log.description || log.material_name || 'Không có ghi chú thêm'}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{log.activity_date}</span>
                        </span>
                        {log.gps_latitude && log.gps_longitude && (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <MapPin className="w-3 h-3" />
                            <span>GPS: {log.gps_latitude.toFixed(3)}, {log.gps_longitude.toFixed(3)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PHI status badge */}
                  {log.phi_days && log.phi_days > 0 ? (
                    <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      <span>Cách ly {log.phi_days} ngày (đến {log.safe_harvest_date})</span>
                    </div>
                  ) : (
                    <div className="shrink-0 flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>An toàn thu hoạch</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
