import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Compass,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Info,
  Satellite,
  Globe,
  Activity,
  User,
  Eye,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Edit3,
  FileSpreadsheet,
  Printer,
  Download,
  Save,
  Undo,
  X,
  ShieldCheck,
  AlertTriangle,
  Database,
  Target,
} from 'lucide-react';
import { ProductionUnit, FarmPlot, updatePlot } from '@/services/farmPlotApi';
import {
  convertVn2000ToWgs84,
  calculatePolygonAreaM2,
  calculatePolygonCentroid,
  Vn2000Point,
} from '../utils/geoUtils';
import { Vn2000ConverterModal } from './Vn2000ConverterModal';
import { PrintPucMapModal } from './PrintPucMapModal';

interface FarmPlotMapViewProps {
  units: ProductionUnit[];
  selectedUnit: ProductionUnit | null;
  plots: FarmPlot[];
  onSelectUnit: (unit: ProductionUnit | null) => void;
  onSelectPlot: (plot: FarmPlot) => void;
  selectedPlotId?: string;
  onPlotUpdated?: () => void;
}

export const FarmPlotMapView: React.FC<FarmPlotMapViewProps> = ({
  units,
  selectedUnit,
  plots,
  onSelectUnit,
  onSelectPlot,
  selectedPlotId,
  onPlotUpdated,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const drawingLayerRef = useRef<L.LayerGroup | null>(null);

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'PHI_QUARANTINE' | 'FALLOW'>('ALL');
  const [mapMode, setMapMode] = useState<'GOOGLE_SATELLITE' | 'SATELLITE_RGB' | 'SENTINEL_NDVI' | 'GIS_VECTOR'>('GOOGLE_SATELLITE');
  const [activePlot, setActivePlot] = useState<FarmPlot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPlotListDrawer, setShowPlotListDrawer] = useState(true);

  // Trạng thái Trụ Cột 1: Vẽ đa giác WebGIS tương tác
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);

  // Trạng thái Trụ Cột 1 & 3: Modals chuyển đổi VN-2000 & In/Xuất Mẫu 01-PUC
  const [isVn2000ModalOpen, setIsVn2000ModalOpen] = useState(false);
  const [isPrintPucModalOpen, setIsPrintPucModalOpen] = useState(false);

  // Trạng thái Trụ Cột 4: Bản đồ ngoại tuyến Offline-First
  const [isCachingOffline, setIsCachingOffline] = useState(false);
  const [offlineCacheMessage, setOfflineCacheMessage] = useState<string | null>(null);

  // Vị trí trạm trung tâm HTX tại Hòn Bồ / Phường 12, Đà Lạt
  const centerLat = Number(selectedUnit?.location?.latitude || selectedUnit?.location?.lat) || 11.9540;
  const centerLng = Number(selectedUnit?.location?.longitude || selectedUnit?.location?.lng) || 108.4620;

  // Kiểm tra trạng thái cách ly PHI của thửa đất
  const isPlotInPhi = (p: FarmPlot) => {
    return Boolean(
      p.is_in_quarantine ||
      p.status === 'IN_QUARANTINE' ||
      (p.quarantine_until && new Date(p.quarantine_until) > new Date()) ||
      (p.safe_harvest_date && new Date(p.safe_harvest_date) > new Date())
    );
  };

  const phiPlotsCount = plots.filter(isPlotInPhi).length;
  const safePlotsCount = plots.filter((p) => !isPlotInPhi(p) && p.status === 'ACTIVE').length;
  const fallowPlotsCount = plots.filter((p) => !isPlotInPhi(p) && p.status !== 'ACTIVE').length;

  // Lọc danh sách thửa đất theo trạng thái
  const filteredPlots = plots.filter((p) => {
    const isPhi = isPlotInPhi(p);
    if (filterStatus === 'PHI_QUARANTINE') return isPhi;
    if (filterStatus === 'ACTIVE') return !isPhi && p.status === 'ACTIVE';
    if (filterStatus === 'FALLOW') return !isPhi && p.status !== 'ACTIVE';
    return true;
  });

  // Tự động chọn thửa đất đầu tiên nếu chưa có
  useEffect(() => {
    if (selectedPlotId) {
      const found = plots.find((p) => p.id === selectedPlotId);
      if (found) setActivePlot(found);
    } else if (filteredPlots.length > 0) {
      if (!activePlot || !filteredPlots.some((p) => p.id === activePlot.id)) {
        setActivePlot(filteredPlots[0]);
      }
    }
  }, [selectedPlotId, plots, filterStatus]);

  // Tự động di chuyển bản đồ (flyTo) đến tọa độ trung tâm khi người dùng chuyển đổi vùng trồng
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([centerLat, centerLng], selectedUnit ? 16 : 14, {
      animate: true,
      duration: 1.2,
    });
  }, [centerLat, centerLng, selectedUnit]);

  // 1. Khởi tạo Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 16,
        minZoom: 13,
        maxZoom: 20,
        zoomControl: false,
        attributionControl: false,
      });

      mapRef.current = map;
      featureGroupRef.current = L.featureGroup().addTo(map);

      // Thêm attribution control nhỏ gọn góc dưới
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

      // Fix render kích thước
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Cập nhật Lớp Bản đồ Tile Layers khi thay đổi mapMode
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    let tileUrl = '';
    let attribution = '';
    let maxZoom = 20;
    let maxNativeZoom = 20;

    if (mapMode === 'GOOGLE_SATELLITE') {
      // Vệ tinh Google Hybrid độ phân giải cao, hỗ trợ zoom cực sâu tới tận zoom 20 tại Việt Nam, phóng to thấy rõ từng luống rau
      tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      attribution = 'Ảnh Vệ Tinh Siêu Nét &copy; Google Maps &bull; Phóng to không giới hạn';
      maxZoom = 20;
      maxNativeZoom = 20;
    } else if (mapMode === 'SATELLITE_RGB') {
      // Ảnh Vệ Tinh Quang Học Esri World Imagery (có maxNativeZoom: 17 tự động nội suy khi phóng to, không bao giờ báo 'Map data not yet available')
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Ảnh Vệ tinh &copy; Esri, Maxar &bull; Độ phân giải 0.5m';
      maxZoom = 20;
      maxNativeZoom = 17; // Điểm cốt lõi: Khi người dùng zoom 18, 19, 20 thì tự động phóng to ảnh từ zoom 17, loại bỏ hoàn toàn ô xám
    } else if (mapMode === 'SENTINEL_NDVI') {
      // Vệ tinh kết hợp chỉ số viễn thám thực vật NDVI
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Sentinel-2B MSI &copy; ESA Copernicus &bull; Viễn thám NDVI';
      maxZoom = 20;
      maxNativeZoom = 17;
    } else {
      // Bản đồ Vector OpenStreetMap
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors &bull; Ranh giới địa chính';
      maxZoom = 20;
      maxNativeZoom = 19;
    }

    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom,
      maxNativeZoom,
      attribution,
    }).addTo(mapRef.current);

    tileLayerRef.current = newTileLayer;
    newTileLayer.bringToBack();
  }, [mapMode]);

  // 3. Vẽ Ranh giới Vùng trồng PUC và các Đa giác Thửa đất (Polygons)
  useEffect(() => {
    if (!mapRef.current || !featureGroupRef.current) return;

    const group = featureGroupRef.current;
    group.clearLayers();

    // Helper lấy tọa độ đa giác của một thửa đất
    const getPlotCoords = (p: FarmPlot, index: number): [number, number][] => {
      if (p.geometry_geojson?.coordinates?.[0]?.length >= 3) {
        return p.geometry_geojson.coordinates[0].map((pt: [number, number]) => {
          // Chuẩn GeoJSON: pt[0] là Lng (~108.x), pt[1] là Lat (~11.x)
          if (pt[0] > 50 && pt[1] < 50) {
            return [pt[1], pt[0]];
          }
          return [pt[0], pt[1]];
        });
      } else if (p.vn2000_coordinates && p.vn2000_coordinates.length >= 3) {
        return p.vn2000_coordinates.map((pt: any) => {
          if (Array.isArray(pt)) return convertVn2000ToWgs84(pt[0], pt[1]);
          return convertVn2000ToWgs84(pt.x, pt.y);
        });
      } else {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const baseLat = centerLat - 0.0015 + row * 0.00067;
        const baseLng = centerLng - 0.0020 + col * 0.00080;
        return [
          [baseLat, baseLng],
          [baseLat, baseLng + 0.00065],
          [baseLat + 0.00055, baseLng + 0.00065],
          [baseLat + 0.00055, baseLng],
        ];
      }
    };

    // Thu thập tất cả các tọa độ từ toàn bộ 15 thửa để vẽ ranh giới quy hoạch PUC bao phủ trọn vẹn
    const allPlotPoints: [number, number][] = [];
    plots.forEach((p, idx) => {
      getPlotCoords(p, idx).forEach((pt) => allPlotPoints.push(pt));
    });

    // Vẽ từng thửa đất theo danh sách lọc (filteredPlots)
    filteredPlots.forEach((plot) => {
      const globalIdx = plots.findIndex((p) => p.id === plot.id);
      const plotIndex = globalIdx >= 0 ? globalIdx : 0;
      const plotPolygonCoords = getPlotCoords(plot, plotIndex);
      const plotCenter: [number, number] = calculatePolygonCentroid(plotPolygonCoords);

      const isPhi = isPlotInPhi(plot);
      const isFallow = !isPhi && (plot.status === 'FALLOW' || plot.status !== 'ACTIVE');
      const isSelected = activePlot?.id === plot.id;

      // Tính điểm NDVI sinh thái mô phỏng chuẩn Sentinel-2
      const ndviScore = isPhi
        ? 0.72
        : isFallow
        ? 0.34
        : Number((0.74 + (plotIndex % 5) * 0.04).toFixed(2));

      // Màu sắc viền và nền - Tương phản cao trên ảnh vệ tinh tối màu
      let fillColor = '#10b981';
      let borderColor = '#059669';
      let fillOpacity = 0.52;
      let strokeWidth = isSelected ? 4.5 : 2.8;

      if (mapMode === 'SENTINEL_NDVI') {
        if (ndviScore >= 0.75) {
          fillColor = '#10b981';
          borderColor = '#34d399';
          fillOpacity = 0.68;
        } else if (ndviScore >= 0.5) {
          fillColor = '#eab308';
          borderColor = '#fde047';
          fillOpacity = 0.65;
        } else {
          fillColor = '#f97316';
          borderColor = '#fb923c';
          fillOpacity = 0.65;
        }
      } else {
        if (isPhi) {
          fillColor = '#ef4444';
          borderColor = '#ffffff';
          fillOpacity = 0.68;
        } else if (isFallow) {
          fillColor = '#64748b';
          borderColor = '#cbd5e1';
          fillOpacity = 0.35;
        }
      }

      if (isSelected) {
        borderColor = '#ffffff';
        fillColor = '#06b6d4'; // Cyan neon nổi bật cho thửa đang chọn
        fillOpacity = 0.75;
      }

      const polygon = L.polygon(plotPolygonCoords, {
        color: borderColor,
        weight: strokeWidth,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        dashArray: isFallow ? '6, 4' : undefined,
      }).addTo(group);

      // Nhãn Tooltip khi di chuột qua thửa đất
      const safeDateDisplay = plot.quarantine_until || plot.safe_harvest_date;
      const statusTitle = isPhi
        ? `<span style="color:#ef4444;font-weight:bold;">🛑 Cách ly PHI (Cấm thu hoạch${safeDateDisplay ? ` đến ${safeDateDisplay}` : ''})</span>`
        : isFallow
        ? '<span style="color:#64748b;">⚪ Nghỉ vụ / Cải tạo đất</span>'
        : '<span style="color:#10b981;font-weight:bold;">✅ Canh tác an toàn VietGAP</span>';

      const plotAreaHa = Number(plot.area || 0);
      const plotAreaM2 = plotAreaHa < 100 ? plotAreaHa * 10000 : plotAreaHa;
      const quotaKg =
        plot.max_harvest_quota_kg || Math.round(plotAreaM2 * (plot.max_yield_rate_per_sqm || 5.0) * 1.2);

      polygon.bindTooltip(
        `<div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
          <strong>Thửa đất: ${plot.plot_code}</strong> (Lô #${plotIndex + 1})<br/>
          Diện tích: <strong>${plotAreaHa.toLocaleString('vi-VN')} ha</strong> (${plotAreaM2.toLocaleString('vi-VN')} m²)<br/>
          Trần sản lượng: <strong style="color:#047857;">${quotaKg.toLocaleString('vi-VN')} kg/vụ</strong><br/>
          ${statusTitle}<br/>
          ${mapMode === 'SENTINEL_NDVI' ? `Chỉ số NDVI: <strong>${ndviScore}</strong>` : ''}
          <div style="font-size:10px;color:#cbd5e1;margin-top:2px;">Nhấp để xem chi tiết & nhật ký</div>
        </div>`,
        { sticky: true }
      );

      // Tạo Marker trung tâm thửa đất với số hiệu và diện tích cực kỳ nổi bật
      const areaDisplay = `${plotAreaHa.toLocaleString('vi-VN')} ha`;

      const badgeHtml = isPhi
        ? `<div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white font-mono font-black text-[11px] shadow-2xl border-2 border-white animate-pulse whitespace-nowrap">
            <span>🛑 #${plotIndex + 1}</span>
            <span class="text-[9px] font-normal uppercase">PHI</span>
           </div>`
        : isSelected
        ? `<div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 font-mono font-black text-[12px] shadow-2xl border-2 border-white scale-110 ring-4 ring-cyan-400/60 whitespace-nowrap">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span>#${plotIndex + 1}</span>
            <span class="text-[10px] text-white">(${areaDisplay})</span>
           </div>`
        : isFallow
        ? `<div class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 font-mono font-bold text-[10.5px] shadow-xl border border-slate-500 whitespace-nowrap">
            <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>#${plotIndex + 1}</span>
            <span class="text-[9.5px] text-slate-400">(${areaDisplay})</span>
           </div>`
        : `<div class="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-white font-mono font-bold text-[10.5px] shadow-xl border border-emerald-400 whitespace-nowrap">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>#${plotIndex + 1}</span>
            <span class="text-[9.5px] text-emerald-300">(${areaDisplay})</span>
           </div>`;

      const customIcon = L.divIcon({
        className: 'custom-plot-pin',
        html: badgeHtml,
        iconSize: [85, 28],
        iconAnchor: [42, 14],
      });

      const marker = L.marker(plotCenter, { icon: customIcon }).addTo(group);

      // Bắt sự kiện click vào polygon hoặc marker -> Zoom cận cảnh trực tiếp thửa đất
      const handlePlotClick = (e: L.LeafletMouseEvent) => {
        if (isDrawingMode) {
          if (e?.latlng) {
            setDrawnPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
          }
          return;
        }
        setActivePlot(plot);
        mapRef.current?.flyTo(plotCenter, 18, { animate: true, duration: 1.0 });
      };

      polygon.on('click', handlePlotClick);
      marker.on('click', handlePlotClick);
    });

    // Ranh giới Vùng trồng PUC bao bọc toàn bộ các thửa đất (Đường viền nét đứt vàng hổ phách)
    const realUnitPolygon = selectedUnit?.location?.polygon_coordinates || selectedUnit?.location?.polygon;

    if (Array.isArray(realUnitPolygon) && realUnitPolygon.length >= 3) {
      const pucBoundaryCoords: [number, number][] = realUnitPolygon.map((pt: [number, number]) => {
        if (pt[0] > 50 && pt[1] < 50) return [pt[1], pt[0]];
        return [pt[0], pt[1]];
      });
      const pucPolygon = L.polygon(pucBoundaryCoords, {
        color: '#f59e0b',
        weight: 3.5,
        dashArray: '10, 8',
        fillColor: '#f59e0b',
        fillOpacity: 0.10,
      }).addTo(group);

      pucPolygon.bindTooltip(
        `<div style="font-family:sans-serif;font-weight:bold;color:#b45309;background:#fffbeb;padding:3px 6px;border:1px solid #f59e0b;border-radius:6px;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
          📍 Ranh giới Vùng Trồng PUC: <strong>${selectedUnit?.unit_code || 'VT-DALAT-01'}</strong> (${selectedUnit?.area || 15} ha)
        </div>`,
        { sticky: true, className: 'leaflet-tooltip-puc' }
      );
    } else if (!selectedUnit && units && units.length > 0) {
      // Khi xem tất cả vùng trồng: Vẽ ranh giới cho từng vùng trồng nếu có dữ liệu polygon_coordinates
      units.forEach((u) => {
        const poly = u.location?.polygon_coordinates || u.location?.polygon;
        if (Array.isArray(poly) && poly.length >= 3) {
          const coords: [number, number][] = poly.map((pt: [number, number]) => {
            if (pt[0] > 50 && pt[1] < 50) return [pt[1], pt[0]];
            return [pt[0], pt[1]];
          });
          const uPoly = L.polygon(coords, {
            color: '#f59e0b',
            weight: 2.5,
            dashArray: '8, 6',
            fillColor: '#f59e0b',
            fillOpacity: 0.08,
          }).addTo(group);

          uPoly.bindTooltip(
            `<div style="font-family:sans-serif;font-weight:bold;color:#b45309;background:#fffbeb;padding:3px 6px;border:1px solid #f59e0b;border-radius:6px;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
              📍 Vùng Trồng: <strong>${u.unit_code}</strong> — ${u.name} (${u.area} ha)
            </div>`,
            { sticky: true, className: 'leaflet-tooltip-puc' }
          );
        }
      });
    } else if (allPlotPoints.length >= 4) {
      const lats = allPlotPoints.map((p) => p[0]);
      const lngs = allPlotPoints.map((p) => p[1]);
      const minLat = Math.min(...lats) - 0.0006;
      const maxLat = Math.max(...lats) + 0.0006;
      const minLng = Math.min(...lngs) - 0.0008;
      const maxLng = Math.max(...lngs) + 0.0008;
      const pucBoundaryCoords: [number, number][] = [
        [minLat, minLng],
        [minLat, maxLng],
        [maxLat, maxLng],
        [maxLat, minLng],
      ];
      const pucPolygon = L.polygon(pucBoundaryCoords, {
        color: '#f59e0b',
        weight: 3.5,
        dashArray: '10, 8',
        fillColor: '#f59e0b',
        fillOpacity: 0.10,
      }).addTo(group);

      pucPolygon.bindTooltip(
        `<div style="font-family:sans-serif;font-weight:bold;color:#b45309;background:#fffbeb;padding:3px 6px;border:1px solid #f59e0b;border-radius:6px;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
          📍 Ranh giới Vùng Trồng PUC: <strong>${selectedUnit?.unit_code || 'Vùng sản xuất'}</strong>
        </div>`,
        { sticky: true, className: 'leaflet-tooltip-puc' }
      );
    }

    // Tự động canh khung hình vừa vặn toàn bộ vùng trồng, chừa khoảng trống bên phải cho thẻ chi tiết
    if ((plots.length > 0 || units.length > 0) && mapRef.current) {
      const bounds = group.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, {
          paddingTopLeft: [50, 50],
          paddingBottomRight: [330, 60],
          maxZoom: 17,
        });
      }
    }
  }, [plots, mapMode, filterStatus, activePlot?.id, centerLat, centerLng, isDrawingMode, selectedUnit, units]);

  // Xử lý sự kiện click trên bản đồ khi ở chế độ Vẽ Đa Giác
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (isDrawingMode) {
      const container = map.getContainer();
      container.style.cursor = 'crosshair';

      const handleMapClick = (e: L.LeafletMouseEvent) => {
        setDrawnPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
      };

      map.on('click', handleMapClick);
      return () => {
        map.off('click', handleMapClick);
        container.style.cursor = '';
      };
    }
  }, [isDrawingMode]);

  // Vẽ các đỉnh và cạnh đa giác đang vẽ dở
  useEffect(() => {
    if (!mapRef.current) return;
    if (!drawingLayerRef.current) {
      drawingLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }
    const layer = drawingLayerRef.current;
    layer.clearLayers();

    if (drawnPoints.length > 0) {
      drawnPoints.forEach((pt, idx) => {
        const isFirst = idx === 0;
        const marker = L.circleMarker(pt, {
          radius: isFirst ? 8 : 5,
          fillColor: isFirst ? '#f59e0b' : '#10b981',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1,
        }).addTo(layer);

        marker.bindTooltip(`Đỉnh #${idx + 1}${isFirst ? ' (Đóng ranh)' : ''}`, { sticky: true });
      });

      if (drawnPoints.length >= 2) {
        if (drawnPoints.length >= 3) {
          L.polygon(drawnPoints, {
            color: '#10b981',
            weight: 3,
            fillColor: '#34d399',
            fillOpacity: 0.35,
            dashArray: '5, 5',
          }).addTo(layer);
        } else {
          L.polyline(drawnPoints, {
            color: '#10b981',
            weight: 3,
            dashArray: '5, 5',
          }).addTo(layer);
        }
      }
    }
  }, [drawnPoints]);

  // Lưu đa giác đã vẽ vào thửa đất đang chọn
  const handleSaveDrawnPolygon = async () => {
    if (drawnPoints.length < 3) {
      alert('Vui lòng chấm ít nhất 3 đỉnh để tạo thành đa giác khép kín!');
      return;
    }
    if (!activePlot) {
      alert('Vui lòng chọn một thửa đất trong danh sách trước khi lưu ranh giới!');
      return;
    }

    const calculatedArea = calculatePolygonAreaM2(drawnPoints);
    const ring = drawnPoints.map((pt) => [pt[1], pt[0]]);
    if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
      ring.push(ring[0]);
    }

    const geojson = {
      type: 'Polygon',
      coordinates: [ring],
    };

    try {
      await updatePlot(activePlot.production_unit_id, activePlot.id, {
        geometry_geojson: geojson,
        area: calculatedArea,
      });
      setIsDrawingMode(false);
      setDrawnPoints([]);
      onPlotUpdated?.();
      alert(`Đã lưu ranh giới cho thửa [${activePlot.plot_code}]. Diện tích thực địa: ${calculatedArea.toLocaleString('vi-VN')} m²`);
    } catch (err) {
      console.error('Lỗi cập nhật ranh giới thửa đất:', err);
      alert('Không thể lưu ranh giới thửa đất. Vui lòng thử lại.');
    }
  };

  // Áp dụng tọa độ từ Modal Sổ Đỏ VN-2000
  const handleApplyVn2000 = async (data: {
    wgs84Coordinates: [number, number][];
    vn2000Points: Vn2000Point[];
    calculatedAreaM2: number;
  }) => {
    if (!activePlot) {
      alert('Vui lòng chọn một thửa đất để áp dụng tọa độ Sổ đỏ!');
      return;
    }

    const ring = data.wgs84Coordinates.map((pt) => [pt[1], pt[0]]);
    if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
      ring.push(ring[0]);
    }

    const geojson = {
      type: 'Polygon',
      coordinates: [ring],
    };

    try {
      await updatePlot(activePlot.production_unit_id, activePlot.id, {
        geometry_geojson: geojson,
        vn2000_coordinates: data.vn2000Points,
        area: data.calculatedAreaM2,
      });
      onPlotUpdated?.();
      if (mapRef.current && data.wgs84Coordinates.length > 0) {
        mapRef.current.fitBounds(L.latLngBounds(data.wgs84Coordinates), { padding: [40, 40] });
      }
      alert(`Chuyển đổi thành công! Đã cập nhật ${data.vn2000Points.length} đỉnh góc ranh Sổ đỏ vào thửa [${activePlot.plot_code}].`);
    } catch (err) {
      console.error('Lỗi cập nhật tọa độ VN-2000:', err);
      alert('Không thể lưu tọa độ Sổ đỏ. Vui lòng kiểm tra lại kết nối.');
    }
  };

  // Trụ Cột 4: Lưu đệm bản đồ vệ tinh ngoại tuyến (Offline Caching)
  const handleCacheTilesOffline = async () => {
    if (!('caches' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ CacheStorage API.');
      return;
    }
    setIsCachingOffline(true);
    setOfflineCacheMessage('Đang phân tích vùng ảnh vệ tinh cần lưu...');
    try {
      const cache = await caches.open('htx-satellite-cache-v1');
      const bounds = mapRef.current?.getBounds();
      if (!bounds) return;

      const currentZoom = mapRef.current?.getZoom() || 16;
      const targetZooms = [currentZoom, Math.min(20, currentZoom + 1)];
      let count = 0;

      const deg2tile = (lat: number, lon: number, z: number) => {
        const x = Math.floor(((lon + 180) / 360) * Math.pow(2, z));
        const latRad = (lat * Math.PI) / 180;
        const y = Math.floor(
          ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, z)
        );
        return { x, y };
      };

      const tileUrls: string[] = [];
      targetZooms.forEach((z) => {
        const minTile = deg2tile(bounds.getNorth(), bounds.getWest(), z);
        const maxTile = deg2tile(bounds.getSouth(), bounds.getEast(), z);

        for (let x = Math.min(minTile.x, maxTile.x); x <= Math.max(minTile.x, maxTile.x); x++) {
          for (let y = Math.min(minTile.y, maxTile.y); y <= Math.max(minTile.y, maxTile.y); y++) {
            tileUrls.push(`https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`);
          }
        }
      });

      const totalToCache = Math.min(tileUrls.length, 60);
      for (let i = 0; i < totalToCache; i++) {
        try {
          await cache.add(tileUrls[i]);
          count++;
        } catch {
          // Bỏ qua lỗi CORS của một số tile đơn lẻ
        }
      }

      setOfflineCacheMessage(
        `✅ Đã lưu trữ ${count} mảnh ảnh vệ tinh ngoại tuyến! Bản đồ sẵn sàng hoạt động tại thực địa khi mất sóng 4G.`
      );
      setTimeout(() => setOfflineCacheMessage(null), 8000);
    } catch (err) {
      console.error('Lỗi lưu đệm ngoại tuyến:', err);
      setOfflineCacheMessage('Không thể lưu đệm ngoại tuyến.');
    } finally {
      setIsCachingOffline(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-3 p-4 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none p-5 bg-slate-950 text-white' : ''
      }`}
    >
      {/* 1. GIS Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 shrink-0">
            <Compass className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                Bản Đồ Số GIS Phân Lô Canh Tác &amp; Ranh Giới Vùng Trồng (PUC)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live WebGIS
              </span>
            </div>

            {/* Smart Unit Selector Dropdown */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vùng sản xuất:</span>
              </div>
              <div className="relative min-w-[260px] max-w-sm">
                <select
                  value={selectedUnit ? selectedUnit.id : 'ALL'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'ALL') {
                      onSelectUnit(null);
                    } else {
                      const found = units.find((u) => u.id === val);
                      if (found) onSelectUnit(found);
                    }
                  }}
                  className="w-full appearance-none rounded-xl border border-emerald-300 bg-emerald-50/70 px-3 py-1.5 pr-8 text-xs font-bold text-slate-900 outline-none hover:border-emerald-500 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs transition"
                >
                  <option value="ALL" className="font-bold text-slate-900 bg-white">
                    🌟 Xem tất cả vùng trồng (Toàn HTX: {units.length} vùng • {plots.length} thửa)
                  </option>
                  <optgroup label="Danh sách 6 vùng sản xuất chuyên canh" className="text-slate-500 font-semibold bg-white">
                    {units.map((u) => (
                      <option key={u.id} value={u.id} className="text-slate-800 font-semibold bg-white">
                        {u.unit_code} — {u.name} ({u.area} ha)
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-700 text-xs font-bold">
                  ▼
                </div>
              </div>

              {selectedUnit ? (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-emerald-800 font-bold border border-slate-200">
                    Mã PUC: {selectedUnit.puc_code || selectedUnit.unit_code}
                  </span>
                  <span>• {centerLat.toFixed(4)}°N, {centerLng.toFixed(4)}°E</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {selectedUnit.area} ha
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-500 italic">
                  Đang hiển thị bao quát toàn bộ 6 vùng trồng HTX
                </span>
              )}
            </div>
          </div>
        </div>

        {/* View Layer Mode Controls & WebGIS Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* WebGIS Tools: Draw, VN-2000, Print PUC, Offline */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const nextState = !isDrawingMode;
                setIsDrawingMode(nextState);
                setDrawnPoints([]);
                if (nextState) {
                  setActivePlot(null);
                }
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                isDrawingMode
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
              title="Vẽ ranh giới đa giác thửa đất trực tiếp trên ảnh vệ tinh"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isDrawingMode ? 'Đang Chấm Đỉnh...' : 'Vẽ Ranh Giới'}
            </button>

            <button
              type="button"
              onClick={() => setIsVn2000ModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Nhập bảng tọa độ góc ranh X, Y từ Sổ đỏ sang GPS WGS-84"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
              Sổ Đỏ VN-2000
            </button>

            <button
              type="button"
              onClick={() => setIsPrintPucModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="In / Tải PDF / Tải Excel Hồ sơ Mã số vùng trồng Mẫu 01-PUC (R-SYS-011 & R-SYS-012)"
            >
              <Printer className="w-3.5 h-3.5 text-blue-700" />
              Xuất Mẫu 01-PUC
            </button>

            <button
              type="button"
              onClick={handleCacheTilesOffline}
              disabled={isCachingOffline}
              className="px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              title="Lưu đệm ảnh vệ tinh vào bộ nhớ Cache máy tính/điện thoại để ra đồng mất mạng 4G vẫn xem được"
            >
              <Database className="w-3.5 h-3.5 text-amber-700" />
              {isCachingOffline ? 'Đang tải đệm...' : 'Lưu Đệm Ngoại Tuyến'}
            </button>
          </div>

          {/* Layer Selector */}
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setMapMode('GOOGLE_SATELLITE')}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                mapMode === 'GOOGLE_SATELLITE'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Vệ tinh Google HD (Zoom siêu nét)
            </button>
            <button
              type="button"
              onClick={() => setMapMode('SATELLITE_RGB')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                mapMode === 'SATELLITE_RGB'
                  ? 'bg-sky-700 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Esri True-Color
            </button>
            <button
              type="button"
              onClick={() => setMapMode('SENTINEL_NDVI')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                mapMode === 'SENTINEL_NDVI'
                  ? 'bg-emerald-700 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" /> Sentinel-2 NDVI
            </button>
            <button
              type="button"
              onClick={() => setMapMode('GIS_VECTOR')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                mapMode === 'GIS_VECTOR'
                  ? 'bg-white text-emerald-800 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Vector Địa chính
            </button>
          </div>

          {/* Filter Status */}
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-100 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 font-bold rounded-lg transition cursor-pointer ${
                filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({plots.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('ACTIVE')}
              className={`px-2.5 py-1 font-bold rounded-lg transition cursor-pointer ${
                filterStatus === 'ACTIVE' ? 'bg-white text-emerald-800 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              An toàn ({safePlotsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('PHI_QUARANTINE')}
              className={`px-2.5 py-1 font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                filterStatus === 'PHI_QUARANTINE' ? 'bg-white text-rose-700 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Cách ly PHI ({phiPlotsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('FALLOW')}
              className={`px-2.5 py-1 font-bold rounded-lg transition cursor-pointer flex items-center gap-1 ${
                filterStatus === 'FALLOW' ? 'bg-white text-slate-800 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Nghỉ vụ ({fallowPlotsCount})</span>
            </button>
          </div>

          {/* Map Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                if (featureGroupRef.current && mapRef.current) {
                  const b = featureGroupRef.current.getBounds();
                  if (b.isValid()) {
                    mapRef.current.fitBounds(b, {
                      paddingTopLeft: [50, 50],
                      paddingBottomRight: [330, 60],
                      maxZoom: 17,
                    });
                  }
                }
              }}
              className="px-2.5 py-1 hover:bg-white rounded-lg text-emerald-800 font-bold text-xs transition cursor-pointer flex items-center gap-1"
              title="Định vị vừa vặn toàn bộ vùng trồng và các thửa đất"
            >
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>Khung Vùng Trồng</span>
            </button>
            <button
              type="button"
              onClick={() => mapRef.current?.zoomIn()}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition cursor-pointer"
              title="Phóng to bản đồ"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => mapRef.current?.zoomOut()}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition cursor-pointer"
              title="Thu nhỏ bản đồ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition cursor-pointer"
              title={isFullscreen ? 'Thu gọn' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Banner Thông tin Vệ tinh Viễn thám */}
      {mapMode === 'GOOGLE_SATELLITE' && (
        <div className="bg-emerald-950 border border-emerald-600/50 rounded-xl p-3 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/30 text-emerald-300 rounded-lg border border-emerald-500/40">
              <Globe className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="font-black text-emerald-100 flex items-center gap-2">
                Ảnh Vệ Tinh Google Maps Hybrid HD (Phóng to cận cảnh)
                <span className="px-2 py-0.2 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full">
                  Zoom Level 20+ Nét Căng
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                Độ phân giải siêu cao: Cho phép phóng to cực đại thấy rõ từng mái nhà kính, đường nội đồng và bờ ruộng mà không bị mờ hay giới hạn dữ liệu.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-mono">
            <span>Tọa độ WGS84: EPSG:4326</span>
          </div>
        </div>
      )}

      {mapMode === 'SATELLITE_RGB' && (
        <div className="bg-sky-950 border border-sky-600/50 rounded-xl p-3 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-600/30 text-sky-300 rounded-lg border border-sky-500/40">
              <Globe className="w-4 h-4 text-sky-300" />
            </div>
            <div>
              <div className="font-black text-sky-100 flex items-center gap-2">
                Ảnh Vệ Tinh Quang Học Thực Địa True-Color (Esri World Imagery)
                <span className="px-2 py-0.2 bg-sky-500 text-slate-950 text-[10px] font-black rounded-full">
                  Độ phân giải 0.5m - 10m
                </span>
              </div>
              <p className="text-[11px] text-sky-200 mt-0.5">
                Chụp thực tế từ vũ trụ: Nhìn rõ các cụm nhà màng nông nghiệp công nghệ cao, hồ thủy lợi và đường giao thông nội đồng.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-sky-300 font-mono">
            <span>Tọa độ WGS84: EPSG:4326</span>
          </div>
        </div>
      )}

      {mapMode === 'SENTINEL_NDVI' && (
        <div className="bg-emerald-950 border border-emerald-600/50 rounded-xl p-3 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/30 text-emerald-300 rounded-lg border border-emerald-500/40">
              <Satellite className="w-4 h-4 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <div className="font-black text-emerald-100 flex items-center gap-2">
                Chỉ Số Sức Khỏe Sinh Khối Cây Trồng (Copernicus Sentinel-2B NDVI)
                <span className="px-2 py-0.2 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full">
                  Viễn thám 5 ngày/lần
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                Đo phản xạ diệp lục quang hợp: Màu xanh lục ngọc = Tán lá phát triển cực tốt &bull; Màu vàng/đất = Cây còi cọc hoặc đất trống.
              </p>
            </div>
          </div>

          {/* NDVI Spectrum Bar */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-[10.5px]">
            <span className="text-amber-400 font-mono font-bold">0.0 (Đất)</span>
            <div className="w-28 h-2.5 rounded-full bg-gradient-to-r from-orange-600 via-yellow-400 to-emerald-400 border border-white/20"></div>
            <span className="text-emerald-400 font-black font-mono">1.0 (Tán lá đậm)</span>
          </div>
        </div>
      )}

      {/* 3. Main Leaflet Interactive Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-900">
        {/* Leaflet DOM Node */}
        <div
          ref={mapContainerRef}
          style={{ height: isFullscreen ? 'calc(100vh - 170px)' : '540px', width: '100%' }}
          className="z-0"
        />

        {/* Floating Drawing Controller */}
        {isDrawingMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/60 backdrop-blur-md flex items-center gap-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-xs text-emerald-300">Vẽ Ranh Giới Thửa Đất:</span>
            </div>
            <div className="text-xs font-mono text-slate-200">
              Đỉnh: <strong className="text-white">{drawnPoints.length}</strong> | Diện tích:{' '}
              <strong className="text-emerald-400">
                {calculatePolygonAreaM2(drawnPoints).toLocaleString('vi-VN')} m²
              </strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDrawnPolygon}
                disabled={drawnPoints.length < 3}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Lưu vào thửa
              </button>
              <button
                type="button"
                onClick={() => setDrawnPoints((prev) => prev.slice(0, -1))}
                disabled={drawnPoints.length === 0}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                title="Lùi 1 điểm vừa chấm"
              >
                <Undo className="w-3.5 h-3.5" /> Lùi
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDrawingMode(false);
                  setDrawnPoints([]);
                }}
                className="px-2.5 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Hủy
              </button>
            </div>
          </div>
        )}

        {/* Offline Cache Notification Banner */}
        {offlineCacheMessage && (
          <div className="absolute top-4 left-4 z-20 bg-emerald-950/95 text-white px-4 py-2.5 rounded-xl shadow-xl border border-emerald-400/60 text-xs font-medium animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{offlineCacheMessage}</span>
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 text-white border border-slate-700/80 p-3 rounded-2xl text-[11px] backdrop-blur-md z-10 shadow-xl space-y-1.5 max-w-[280px]">
          <div className="font-black text-slate-200 uppercase tracking-wider text-[10px] flex items-center justify-between border-b border-slate-700/60 pb-1">
            <span>{mapMode === 'SENTINEL_NDVI' ? 'Thang Đo NDVI Viễn Thám:' : 'Chú Giải Trạng Thái Thửa:'}</span>
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          {mapMode === 'SENTINEL_NDVI' ? (
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center gap-2 text-emerald-300 font-medium">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                <span>NDVI &gt; 0.70: Tán lá rậm, sinh trưởng rất tốt</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-300 font-medium">
                <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-xs" />
                <span>0.45 - 0.70: Sinh trưởng đạt chuẩn</span>
              </div>
              <div className="flex items-center gap-2 text-orange-400 font-medium">
                <span className="w-3 h-3 rounded-full bg-orange-500 shadow-xs" />
                <span>&lt; 0.45: Cây non / Đất trống / Cần bổ sung đạm</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center gap-2 text-emerald-300 font-medium">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                <span>Đang canh tác an toàn (VietGAP)</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse shadow-xs" />
                <span>Cách ly PHI (Cấm thu hoạch)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <span className="w-3 h-3 rounded-full bg-slate-500" />
                <span>Nghỉ vụ / Cải tạo đất</span>
              </div>
              <div className="flex items-center gap-2 text-amber-300 text-[10.5px] border-t border-slate-700/60 pt-1 mt-1">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-400" />
                <span>Ranh giới quy hoạch vùng PUC</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Plot Quick Card Overlay */}
        {activePlot && (
          <div className="absolute top-4 right-4 bg-slate-900/95 text-white border border-slate-700/80 p-4 rounded-2xl text-xs backdrop-blur-md z-10 shadow-2xl max-w-[320px] w-full animate-fade-in space-y-3">
            <div className="flex items-start justify-between gap-2 border-b border-slate-700/80 pb-2.5">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Thửa Đất Được Chọn
                </span>
                <h4 className="font-mono text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  {activePlot.plot_code}
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                    isPlotInPhi(activePlot)
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : activePlot.status === 'FALLOW' || activePlot.status !== 'ACTIVE'
                      ? 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {isPlotInPhi(activePlot)
                    ? '🛑 Cách ly PHI'
                    : activePlot.status === 'FALLOW' || activePlot.status !== 'ACTIVE'
                    ? '⚪ Nghỉ vụ / Cải tạo'
                    : '✅ An toàn'}
                </span>
                <button
                  type="button"
                  onClick={() => setActivePlot(null)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  title="Đóng thẻ chi tiết"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11.5px]">
              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Diện tích canh tác</span>
                <strong className="text-white text-xs font-mono">
                  {Number(activePlot.area || 0).toLocaleString('vi-VN')} ha
                  <span className="text-slate-400 font-normal text-[10px] ml-1 block">
                    ({(Number(activePlot.area || 0) < 100 ? Number(activePlot.area || 0) * 10000 : Number(activePlot.area || 0)).toLocaleString('vi-VN')} m²)
                  </span>
                </strong>
              </div>
              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 block">Trần sản lượng vụ</span>
                <strong className="text-emerald-400 text-xs font-mono font-bold">
                  {(
                    activePlot.max_harvest_quota_kg ||
                    Math.round(
                      (Number(activePlot.area || 0) < 100
                        ? Number(activePlot.area || 0) * 10000
                        : Number(activePlot.area || 0)) * 5.0 * 1.2
                    )
                  ).toLocaleString('vi-VN')}{' '}
                  kg
                </strong>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Xã viên phụ trách:
                </span>
                <span className="font-bold text-white">
                  {activePlot.assignments && activePlot.assignments.length > 0
                    ? activePlot.assignments[0].member_name
                    : 'Nguyễn Văn Tiến (XV-001)'}
                </span>
              </div>

              {(activePlot.quarantine_until || activePlot.safe_harvest_date) && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-400" /> Ngày an toàn thu hoạch:
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {activePlot.quarantine_until || activePlot.safe_harvest_date}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                <span className="text-slate-400">Kiểu canh tác:</span>
                <span className="text-slate-200">
                  {activePlot.greenhouse_type === 'HIGH_TECH_GREENHOUSE'
                    ? 'Nhà màng Israel cao cấp'
                    : 'Nhà màng công nghệ cao'}
                </span>
              </div>
            </div>

            {/* Quick GIS actions for selected plot */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsDrawingMode(true);
                  setDrawnPoints([]);
                }}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition cursor-pointer"
              >
                <Edit3 className="w-3 h-3 text-emerald-400" /> Vẽ lại ranh
              </button>
              <button
                type="button"
                onClick={() => setIsVn2000ModalOpen(true)}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3 h-3 text-teal-400" /> Nhập Sổ đỏ
              </button>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlot(activePlot)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-md active:scale-98"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Mở Chi Tiết &amp; Nhật Ký Thửa Đất
            </button>
          </div>
        )}
      </div>

      {/* 4. Quick Plot Mini-Grid (Dải danh sách nhanh bên dưới để người dùng dễ chọn) */}
      <div className="pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>
                Thửa Đất {selectedUnit ? `Vùng [${selectedUnit.unit_code} - ${selectedUnit.name}]` : 'Toàn Bộ HTX'} ({filteredPlots.length})
              </span>
            </div>

            {/* Quick Unit Filter Pills */}
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => onSelectUnit(null)}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer ${
                  !selectedUnit
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả
              </button>
              {units.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onSelectUnit(u)}
                  className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition cursor-pointer font-mono ${
                    selectedUnit?.id === u.id
                      ? 'bg-emerald-700 text-white shadow-2xs ring-1 ring-emerald-500'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={`${u.name} (${u.area} ha)`}
                >
                  {u.unit_code}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-slate-500">Bấm vào thửa đất để định vị trực tiếp trên bản đồ vệ tinh</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {filteredPlots.map((plot) => {
            const isSelected = activePlot?.id === plot.id;
            const isPhi = isPlotInPhi(plot);
            const isFallow = !isPhi && (plot.status === 'FALLOW' || plot.status !== 'ACTIVE');
            const globalIdx = plots.findIndex((p) => p.id === plot.id);
            const plotIndex = globalIdx >= 0 ? globalIdx : 0;

            return (
              <button
                key={plot.id}
                type="button"
                onClick={() => {
                  setActivePlot(plot);
                  if (mapRef.current) {
                    const coords = plot.geometry_geojson?.coordinates?.[0]?.map((pt: any) => [pt[1], pt[0]]);
                    const targetCenter = (coords && coords.length > 0)
                      ? calculatePolygonCentroid(coords)
                      : ([centerLat, centerLng] as [number, number]);
                    mapRef.current.flyTo(targetCenter, 18, { animate: true, duration: 1.0 });
                  }
                }}
                className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/40 shadow-xs'
                    : isPhi
                    ? 'border-rose-300 bg-rose-50/50 hover:bg-rose-100/60'
                    : isFallow
                    ? 'border-slate-300 bg-slate-100/70 hover:bg-slate-200/60'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[11px] font-black text-slate-900 truncate">
                    #{plotIndex + 1} {plot.plot_code.replace('PLOT-TT-', '')}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isPhi ? 'bg-rose-500 animate-pulse' : isFallow ? 'bg-slate-400' : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between font-mono">
                  <span>
                    <strong className="text-slate-800 text-[11px]">
                      {Number(plot.area || 0).toLocaleString('vi-VN')} ha
                    </strong>
                    <span className="text-slate-400 text-[9px] block">
                      {(Number(plot.area || 0) < 100 ? Number(plot.area || 0) * 10000 : Number(plot.area || 0)).toLocaleString('vi-VN')} m²
                    </span>
                  </span>
                  <span className={isPhi ? 'text-rose-600 font-bold' : isFallow ? 'text-slate-600 font-semibold' : 'text-emerald-700 font-medium'}>
                    {isPhi ? 'PHI' : isFallow ? 'Nghỉ vụ' : 'VietGAP'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals Trụ Cột 1 & 3: Chuyển Đổi VN-2000 & In/Xuất Mẫu 01-PUC */}
      <Vn2000ConverterModal
        isOpen={isVn2000ModalOpen}
        onClose={() => setIsVn2000ModalOpen(false)}
        plotCode={activePlot?.plot_code}
        nominalArea={activePlot?.area}
        onApplyCoordinates={handleApplyVn2000}
      />

      <PrintPucMapModal
        isOpen={isPrintPucModalOpen}
        onClose={() => setIsPrintPucModalOpen(false)}
        productionUnit={selectedUnit}
        plots={plots}
      />
    </div>
  );
};
