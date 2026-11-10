import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  X,
  MapPin,
  Maximize2,
  Minimize2,
  Globe,
  Satellite,
  Compass,
  Undo2,
  Trash2,
  CheckCircle2,
  Navigation,
  Layers,
  Info,
} from 'lucide-react';
import { calculatePolygonAreaM2, calculatePolygonCentroid } from '../utils/geoUtils';

export interface GisPickerResult {
  lat?: number;
  lng?: number;
  polygon?: [number, number][]; // [lat, lng][]
  areaM2?: number;
  areaHa?: number;
}

interface GisLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (result: GisPickerResult) => void;
  title?: string;
  initialCoordinates?: { lat: number; lng: number } | null;
  initialPolygon?: [number, number][];
  parentPolygon?: [number, number][];
  mode?: 'point' | 'polygon' | 'both';
  unitName?: string;
}

export const GisLocationPickerModal: React.FC<GisLocationPickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Bản Đồ WebGIS: Định Vị & Vẽ Ranh Giới',
  initialCoordinates,
  initialPolygon = [],
  parentPolygon = [],
  mode = 'both',
  unitName,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layersGroupRef = useRef<L.FeatureGroup | null>(null);

  const [mapLayer, setMapLayer] = useState<'GOOGLE_SATELLITE' | 'ESRI_SATELLITE' | 'OSM'>('GOOGLE_SATELLITE');
  const [activeTool, setActiveTool] = useState<'PIN' | 'POLYGON'>('POLYGON');
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [centerPin, setCenterPin] = useState<{ lat: number; lng: number } | null>(
    initialCoordinates || null
  );
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>(
    initialPolygon.length >= 3 ? initialPolygon : []
  );
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mặc định trọng tâm tại Hòn Bồ / Phường 12, Đà Lạt nếu chưa có tọa độ
  const defaultCenterLat = initialCoordinates?.lat || (initialPolygon[0]?.[0]) || 11.9540;
  const defaultCenterLng = initialCoordinates?.lng || (initialPolygon[0]?.[1]) || 108.4620;

  // Đồng bộ lại dữ liệu khi modal được mở
  useEffect(() => {
    if (isOpen) {
      setPolygonPoints(initialPolygon && initialPolygon.length >= 3 ? initialPolygon : []);
      setCenterPin(initialCoordinates || null);
      setActiveTool('POLYGON');
    }
  }, [isOpen, initialPolygon, initialCoordinates]);

  // Tính toán diện tích theo thời gian thực
  const liveAreaM2 = polygonPoints.length >= 3 ? calculatePolygonAreaM2(polygonPoints) : 0;
  const liveAreaHa = parseFloat((liveAreaM2 / 10000).toFixed(4));

  // 1. Khởi tạo Leaflet Map khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [defaultCenterLat, defaultCenterLng],
        zoom: 17,
        minZoom: 12,
        maxZoom: 20,
        zoomControl: false,
        attributionControl: false,
      });

      mapRef.current = map;
      layersGroupRef.current = L.featureGroup().addTo(map);

      // Add zoom control góc trên bên phải
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Thêm lớp Tile Layer đầu tiên
      const tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      tileLayerRef.current = L.tileLayer(tileUrl, {
        maxZoom: 20,
        maxNativeZoom: 20,
      }).addTo(map);

      // Fit bounds nếu đã có sẵn polygon hoặc parentPolygon
      if (initialPolygon.length >= 3) {
        map.fitBounds(L.latLngBounds(initialPolygon), { padding: [50, 50] });
      } else if (parentPolygon.length >= 3) {
        map.fitBounds(L.latLngBounds(parentPolygon), { padding: [50, 50] });
      }

      map.invalidateSize();
      setMapInstance(map);
    }, 150);

    return () => {
      clearTimeout(timer);
      setMapInstance(null);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layersGroupRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, [isOpen]);

  // Cập nhật lại kích thước map khi thay đổi fullscreen
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 200);
    }
  }, [isFullscreen]);

  // 2. Chuyển đổi loại bản đồ vệ tinh / vector
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    let url = '';
    let maxNativeZoom = 20;

    if (mapLayer === 'GOOGLE_SATELLITE') {
      url = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      maxNativeZoom = 20;
    } else if (mapLayer === 'ESRI_SATELLITE') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxNativeZoom = 17;
    } else {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      maxNativeZoom = 19;
    }

    tileLayerRef.current = L.tileLayer(url, {
      maxZoom: 20,
      maxNativeZoom,
    }).addTo(mapRef.current);
    tileLayerRef.current.bringToBack();
  }, [mapLayer]);

  // 3. Xử lý click trên bản đồ theo công cụ được chọn (PIN hoặc POLYGON)
  useEffect(() => {
    if (!mapInstance) return;
    const map = mapInstance;
    const container = map.getContainer();
    container.style.cursor = 'crosshair';

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const lat = parseFloat(e.latlng.lat.toFixed(7));
      const lng = parseFloat(e.latlng.lng.toFixed(7));

      if (activeTool === 'PIN') {
        setCenterPin({ lat, lng });
      } else if (activeTool === 'POLYGON') {
        setPolygonPoints((prev) => {
          const next = [...prev, [lat, lng] as [number, number]];
          // Tự động tính trọng tâm nếu chưa có centerPin
          if (!centerPin && next.length >= 3) {
            const centroid = calculatePolygonCentroid(next);
            setCenterPin({ lat: centroid[0], lng: centroid[1] });
          }
          return next;
        });
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
      container.style.cursor = '';
    };
  }, [mapInstance, activeTool, centerPin]);

  // 4. Vẽ các lớp hình học (Parent Polygon, Active Polygon, Pin Marker) lên bản đồ
  useEffect(() => {
    if (!mapRef.current || !layersGroupRef.current) return;
    const group = layersGroupRef.current;
    group.clearLayers();

    // 4.1. Vẽ ranh giới Vùng trồng cha (nếu có)
    if (parentPolygon && parentPolygon.length >= 3) {
      const parentPoly = L.polygon(parentPolygon, {
        color: '#f59e0b',
        weight: 3,
        dashArray: '8, 6',
        fillColor: '#f59e0b',
        fillOpacity: 0.08,
      }).addTo(group);

      parentPoly.bindTooltip(
        `<div style="font-family:sans-serif;font-size:11px;font-weight:bold;color:#b45309;">
          📍 Khung ranh giới Vùng trồng: ${unitName || 'Vùng cha'}
        </div>`,
        { sticky: true }
      );
    }

    // 4.2. Vẽ Đa giác đang vẽ (Active Polygon)
    if (polygonPoints.length > 0) {
      // Vẽ từng đỉnh góc
      polygonPoints.forEach((pt, idx) => {
        const isFirst = idx === 0;
        const vertexIcon = L.divIcon({
          className: 'polygon-vertex-pin',
          html: `<div style="width:${isFirst ? 18 : 14}px;height:${isFirst ? 18 : 14}px;border-radius:50%;background:${isFirst ? '#f59e0b' : '#10b981'};border:2px solid #ffffff;box-shadow:0 0 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:#ffffff;font-size:9px;font-weight:bold;">${idx + 1}</div>`,
          iconSize: [isFirst ? 18 : 14, isFirst ? 18 : 14],
          iconAnchor: [isFirst ? 9 : 7, isFirst ? 9 : 7],
        });

        const marker = L.marker(pt, { icon: vertexIcon }).addTo(group);
        marker.bindTooltip(`Đỉnh #${idx + 1}${isFirst ? ' (Điểm mốc đầu)' : ''}`, { sticky: true });
      });

      // Vẽ đường đa giác
      if (polygonPoints.length >= 3) {
        const poly = L.polygon(polygonPoints, {
          color: '#10b981',
          weight: 3.5,
          fillColor: '#34d399',
          fillOpacity: 0.38,
        }).addTo(group);

        poly.bindTooltip(
          `<div style="font-family:sans-serif;font-size:12px;font-weight:bold;color:#047857;">
            📐 Diện tích đo đạc: ${liveAreaM2.toLocaleString('vi-VN')} m² (${liveAreaHa} ha)
          </div>`,
          { sticky: true }
        );
      } else if (polygonPoints.length === 2) {
        L.polyline(polygonPoints, {
          color: '#10b981',
          weight: 3,
          dashArray: '5, 5',
        }).addTo(group);
      }
    }

    // 4.3. Vẽ Ghim tọa độ tâm (Center Pin)
    if (centerPin) {
      const pinIcon = L.divIcon({
        className: 'center-pin-marker',
        html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-100%);">
          <div style="background:#ef4444;color:#ffffff;padding:2px 8px;border-radius:12px;font-size:10.5px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:1.5px solid #ffffff;display:flex;align-items:center;gap:3px;">
            <span>📍 Tọa độ tâm</span>
          </div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid #ef4444;"></div>
        </div>`,
        iconSize: [80, 30],
        iconAnchor: [40, 30],
      });

      const pinMarker = L.marker([centerPin.lat, centerPin.lng], { icon: pinIcon }).addTo(group);
      pinMarker.bindTooltip(
        `<div style="font-family:sans-serif;font-size:11px;">
          <strong>Tọa độ tâm WGS-84:</strong><br/>
          Vĩ độ (Lat): ${centerPin.lat.toFixed(6)}°<br/>
          Kinh độ (Lng): ${centerPin.lng.toFixed(6)}°
        </div>`,
        { sticky: true }
      );
    }
  }, [polygonPoints, centerPin, parentPolygon, unitName, liveAreaM2, liveAreaHa]);

  // Lấy vị trí GPS hiện tại của thiết bị (HTML5 Geolocation)
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ Geolocation.');
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGettingGps(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(7));
        const lng = parseFloat(pos.coords.longitude.toFixed(7));
        setCenterPin({ lat, lng });
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 18, { animate: true, duration: 1.2 });
        }
      },
      (err) => {
        setIsGettingGps(false);
        console.warn('Geolocation error:', err);
        alert('Không thể lấy tọa độ GPS từ thiết bị. Vui lòng cấp quyền truy cập vị trí trên trình duyệt.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Hoàn tác đỉnh cuối
  const handleUndoPoint = () => {
    setPolygonPoints((prev) => prev.slice(0, prev.length - 1));
  };

  // Xóa toàn bộ đa giác
  const handleClearPolygon = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ các điểm ranh giới đã vẽ?')) {
      setPolygonPoints([]);
    }
  };

  // Xác nhận áp dụng tọa độ & ranh giới vào biểu mẫu
  const handleConfirm = () => {
    // Nếu có đa giác >= 3 đỉnh nhưng chưa có tâm -> Tự tính tâm từ đa giác
    let finalPin = centerPin;
    if (!finalPin && polygonPoints.length >= 3) {
      const centroid = calculatePolygonCentroid(polygonPoints);
      finalPin = { lat: centroid[0], lng: centroid[1] };
    }

    if (mode === 'point' && !finalPin) {
      alert('Vui lòng chọn tọa độ tâm trên bản đồ!');
      return;
    }

    onConfirm({
      lat: finalPin?.lat,
      lng: finalPin?.lng,
      polygon: polygonPoints.length >= 3 ? polygonPoints : undefined,
      areaM2: liveAreaM2 > 0 ? liveAreaM2 : undefined,
      areaHa: liveAreaHa > 0 ? liveAreaHa : undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-xs animate-fade-in text-[13px]">
      <div
        className={`relative flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[88vh]'
        }`}
      >
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                {title}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  WGS-84 WebGIS
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {parentPolygon.length >= 3 ? (
                  <span>
                    Đang vẽ thửa đất con trong ranh giới: <strong className="text-amber-400">{unitName || 'Vùng cha'}</strong>
                  </span>
                ) : (
                  <span>Click trên bản đồ để chọn tọa độ tâm GPS hoặc chấm các đỉnh vẽ ranh giới đa giác.</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Lựa chọn lớp bản đồ */}
            <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 p-0.5">
              <button
                type="button"
                onClick={() => setMapLayer('GOOGLE_SATELLITE')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  mapLayer === 'GOOGLE_SATELLITE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Ảnh Vệ Tinh Google Siêu Nét (Zoom 20)"
              >
                <Globe className="w-3.5 h-3.5" /> Google HD
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('ESRI_SATELLITE')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  mapLayer === 'ESRI_SATELLITE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Ảnh Vệ Tinh Esri World Imagery"
              >
                <Satellite className="w-3.5 h-3.5" /> Esri
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('OSM')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  mapLayer === 'OSM'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Bản Đồ Địa Chính Đường Bộ OpenStreetMap"
              >
                <Layers className="w-3.5 h-3.5" /> Vector
              </button>
            </div>

            {/* Phóng to toàn màn hình */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
              title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Nút đóng */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Tools Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-400">Công cụ:</span>

            {mode !== 'point' && (
              <button
                type="button"
                onClick={() => setActiveTool('POLYGON')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  activeTool === 'POLYGON'
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Vẽ Đa Giác Ranh Giới ({polygonPoints.length} đỉnh)</span>
              </button>
            )}

            {mode !== 'polygon' && (
              <button
                type="button"
                onClick={() => setActiveTool('PIN')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  activeTool === 'PIN'
                    ? 'bg-rose-600 text-white ring-2 ring-rose-400/50'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-300" />
                <span>Chọn Ghim Tọa Độ Tâm</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isGettingGps}
              className="px-3 py-1.5 rounded-xl font-bold bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 border border-blue-500/40 transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              title="Lấy tọa độ GPS thiết bị thực tế của cán bộ đang đứng tại vườn"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>{isGettingGps ? 'Đang định vị...' : 'Lấy GPS Thiết Bị'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {polygonPoints.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleUndoPoint}
                  className="px-2.5 py-1.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                  title="Hoàn tác điểm vừa chấm"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Hoàn tác đỉnh</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearPolygon}
                  className="px-2.5 py-1.5 rounded-xl font-bold bg-slate-800 text-rose-400 hover:bg-rose-950/50 border border-rose-900/50 transition flex items-center gap-1 cursor-pointer"
                  title="Xóa toàn bộ đỉnh đã vẽ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa vẽ lại</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bản đồ Leaflet Container */}
        <div className="relative flex-1 w-full bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Hộp hướng dẫn nhỏ góc trên bên trái */}
          <div className="absolute top-3 left-3 z-[400] pointer-events-none max-w-xs">
            <div className="p-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl text-white text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Info className="w-3.5 h-3.5" />
                <span>Hướng dẫn vẽ ranh giới:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {activeTool === 'POLYGON' ? (
                  <span>
                    Click chuột lên ảnh vệ tinh tại các góc bờ ruộng/nhà màng để tạo đỉnh ranh giới. Chấm từ <strong>3 đỉnh trở lên</strong> để khép kín đa giác.
                  </span>
                ) : (
                  <span>Click chuột vào vị trí bất kỳ trên bản đồ để cắm ghim tọa độ tâm trung tâm.</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer: Hiển thị số liệu đo đạc & Nút xác nhận */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-slate-900 border-t border-slate-800 text-white shrink-0">
          <div className="flex items-center gap-3 flex-wrap text-xs">
            {/* Tọa độ tâm */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-slate-400">Tọa độ tâm:</span>
              {centerPin ? (
                <strong className="text-white font-mono">
                  {centerPin.lat.toFixed(6)}, {centerPin.lng.toFixed(6)}
                </strong>
              ) : (
                <span className="text-slate-400 italic">Chưa chọn</span>
              )}
            </div>

            {/* Số đỉnh ranh giới & Diện tích */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400">Ranh giới:</span>
              {polygonPoints.length >= 3 ? (
                <span className="text-emerald-400 font-bold">
                  {polygonPoints.length} đỉnh &bull;{' '}
                  <strong className="text-white font-mono">
                    {liveAreaM2.toLocaleString('vi-VN')} m² ({liveAreaHa} ha)
                  </strong>
                </span>
              ) : (
                <span className="text-slate-400 italic">
                  {polygonPoints.length === 0 ? 'Chưa vẽ' : `Đang chấm ${polygonPoints.length} đỉnh (cần ≥ 3)`}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow-lg transition flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Áp Dụng Vào Biểu Mẫu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
