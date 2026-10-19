import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileCheck, Upload, Download, ShieldCheck, FileText, Check, Trash2, Search, 
  AlertTriangle, RefreshCw, Eye, Plus, Link, Clock, FileWarning, ShieldAlert
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import { Pagination } from '@/components/ui/Pagination';

export interface EvidenceRecord {
  stt: number;
  id: string;
  name: string;
  category: string;
  dossierCode: string;
  size: string;
  format: 'PDF' | 'JPG' | 'PNG' | 'DOCX';
  checksum: string;
  status: 'VALID' | 'PENDING' | 'EXPIRING' | 'REJECTED';
  statusLabel: string;
  uploadDate: string;
  uploader: string;
}

export const EvidencesPage: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [activeTabCategory, setActiveTabCategory] = useState<string>('ALL');
  const [selectedFile, setSelectedFile] = useState<EvidenceRecord | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const { data: apiEvidencesData, isLoading, refetch } = useQuery({
    queryKey: ['ocop-evidences-list'],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/ocop/evidences');
        return res.data?.data || res.data || [];
      } catch (err) {
        console.warn('Cannot fetch evidences from API, falling back to mock:', err);
        return [];
      }
    },
  });

  const mockEvidences: EvidenceRecord[] = [
    {
      stt: 1,
      id: 'ev-01',
      name: 'Giấy chứng nhận VietGAP_2024_2027.pdf',
      category: 'Chất lượng & ATTP',
      dossierCode: 'OCOP-2025-001',
      size: '2.4 MB',
      format: 'PDF',
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'VALID',
      statusLabel: 'Hợp lệ',
      uploadDate: '15/05/2025 10:24',
      uploader: 'Nguyễn Văn A',
    },
    {
      stt: 2,
      id: 'ev-02',
      name: 'Phiếu kiểm nghiệm sản phẩm.pdf',
      category: 'Chất lượng & ATTP',
      dossierCode: 'OCOP-2025-001',
      size: '1.8 MB',
      format: 'PDF',
      checksum: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
      status: 'VALID',
      statusLabel: 'Hợp lệ',
      uploadDate: '14/05/2025 15:32',
      uploader: 'Nguyễn Văn A',
    },
    {
      stt: 3,
      id: 'ev-03',
      name: 'Giấy ĐKKD HTX Tân Tiến.pdf',
      category: 'Pháp lý chủ thể',
      dossierCode: 'OCOP-2025-001',
      size: '980 KB',
      format: 'PDF',
      checksum: 'f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8',
      status: 'VALID',
      statusLabel: 'Hợp lệ',
      uploadDate: '12/05/2025 09:15',
      uploader: 'Trần Văn B',
    },
    {
      stt: 4,
      id: 'ev-04',
      name: 'Ảnh sản phẩm Ớt chuông.jpg',
      category: 'Bao bì & Truy xuất',
      dossierCode: 'OCOP-2025-001',
      size: '3.2 MB',
      format: 'JPG',
      checksum: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
      status: 'VALID',
      statusLabel: 'Hợp lệ',
      uploadDate: '11/05/2025 14:20',
      uploader: 'Nguyễn Văn A',
    },
    {
      stt: 5,
      id: 'ev-05',
      name: 'Chứng nhận ISO 22000.pdf',
      category: 'Chất lượng & ATTP',
      dossierCode: 'OCOP-2025-001',
      size: '1.6 MB',
      format: 'PDF',
      checksum: '9a8b7c6d5e4f9a8b7c6d5e4f9a8b7c6d5e4f9a8b7c6d5e4f9a8b7c6d5e4f9a8b',
      status: 'VALID',
      statusLabel: 'Hợp lệ',
      uploadDate: '10/05/2025 11:33',
      uploader: 'Trần Văn B',
    },
    {
      stt: 6,
      id: 'ev-06',
      name: 'Hợp đồng tiêu thụ sản phẩm.pdf',
      category: 'Thị trường tiêu thụ',
      dossierCode: 'OCOP-2025-001',
      size: '1.1 MB',
      format: 'PDF',
      checksum: '7f6e5d4c3b2a1f7f6e5d4c3b2a1f7f6e5d4c3b2a1f7f6e5d4c3b2a1f7f6e5d4c',
      status: 'PENDING',
      statusLabel: 'Chờ duyệt',
      uploadDate: '08/05/2025 16:10',
      uploader: 'Nguyễn Văn A',
    },
    {
      stt: 7,
      id: 'ev-07',
      name: 'Giấy chứng nhận OCOP 3 sao.pdf',
      category: 'Khác',
      dossierCode: 'OCOP-2024-003',
      size: '1.2 MB',
      format: 'PDF',
      checksum: 'b8a9c0d1e2f3b8a9c0d1e2f3b8a9c0d1e2f3b8a9c0d1e2f3b8a9c0d1e2f3b8a9',
      status: 'REJECTED',
      statusLabel: 'Bị từ chối',
      uploadDate: '28/04/2025 15:22',
      uploader: 'Nguyễn Văn A',
    },
  ];

  // Map API evidences or fallback to mock
  const displayEvidences: EvidenceRecord[] = (apiEvidencesData && apiEvidencesData.length > 0)
    ? apiEvidencesData.map((e: any, index: number) => {
        const currentVer = e.current_version;
        const sizeBytes = currentVer?.file_size || 0;
        const sizeStr = sizeBytes > 1024 * 1024
          ? (sizeBytes / (1024 * 1024)).toFixed(1) + ' MB'
          : (sizeBytes / 1024).toFixed(0) + ' KB';

        let category = 'Pháp lý chủ thể';
        if (e.evidence_type === 'LAB_REPORT' || e.title?.includes('QUATEST') || e.title?.includes('Pasteur')) {
          category = 'Chất lượng & ATTP';
        } else if (e.evidence_type === 'PROCESS_PHOTO' || e.title?.includes('Bao bì') || e.title?.includes('WinMart')) {
          category = 'Bao bì & Truy xuất';
        } else if (e.title?.includes('Hợp đồng') || e.title?.includes('bao tiêu') || e.title?.includes('Phân phối')) {
          category = 'Thị trường tiêu thụ';
        } else if (e.evidence_type === 'CERTIFICATE') {
          category = 'Chứng nhận tiêu chuẩn';
        }

        const isVerified = e.status === 'VERIFIED';
        const isRejected = e.status === 'REJECTED';

        return {
          stt: index + 1,
          id: e.id,
          name: currentVer?.file_name || e.title,
          category,
          dossierCode: 'OCOP-2026-DALAT-001',
          size: sizeStr,
          format: (currentVer?.mime_type === 'image/jpeg' ? 'JPG' : 'PDF') as 'PDF' | 'JPG' | 'PNG' | 'DOCX',
          checksum: currentVer?.checksum || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          status: (isVerified ? 'VALID' : (isRejected ? 'REJECTED' : 'PENDING')) as 'VALID' | 'PENDING' | 'EXPIRING' | 'REJECTED',
          statusLabel: isVerified ? 'Đã thẩm định' : (isRejected ? 'Bị từ chối' : 'Chờ duyệt'),
          uploadDate: currentVer?.uploaded_at ? new Date(currentVer.uploaded_at).toLocaleString('vi-VN') : '12/01/2026 10:15',
          uploader: 'Quản Trị Viên HTX',
        };
      })
    : mockEvidences;

  const activeRecord = selectedFile || displayEvidences[0];

  const filteredEvidences = displayEvidences.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.dossierCode.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeTabCategory === 'ALL' || e.category.includes(activeTabCategory);
    return matchesSearch && matchesCategory;
  });

  const totalCount = displayEvidences.length;
  const validCount = displayEvidences.filter(e => e.status === 'VALID').length;
  const pendingCount = displayEvidences.filter(e => e.status === 'PENDING').length;
  const rejectedCount = displayEvidences.filter(e => e.status === 'REJECTED').length;

  const paginatedEvidences = filteredEvidences.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-5 pb-20 animate-fade-in text-slate-800">
      {/* Header Banner (Matching Image 2) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Kho minh chứng số
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Quản lý và lưu trữ tập trung tất cả các tài liệu minh chứng phục vụ đánh giá, phân hạng OCOP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Làm mới
          </button>
          <button
            onClick={() => alert('Chọn tệp minh chứng từ máy tính để tải lên kho bảo mật SHA-256.')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-sm transition-all shrink-0 active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Tải lên tài liệu
          </button>
        </div>
      </div>

      {/* 4 KPI Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11.5px] text-slate-500 font-bold">Tổng số tài liệu</div>
            <div className="text-2xl font-black text-slate-900">{totalCount}</div>
            <div className="text-[10.5px] text-emerald-600 font-bold">&uarr; 100% <span className="text-slate-400 font-normal">hồ sơ số hóa</span></div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-black">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11.5px] text-slate-500 font-bold">Tài liệu hợp lệ</div>
            <div className="text-2xl font-black text-slate-900">{validCount}</div>
            <div className="text-[10.5px] text-emerald-600 font-bold">&uarr; {totalCount > 0 ? ((validCount / totalCount) * 100).toFixed(0) : 0}%</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-black">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11.5px] text-slate-500 font-bold">Chờ duyệt / Thiếu</div>
            <div className="text-2xl font-black text-slate-900">{pendingCount}</div>
            <div className="text-[10.5px] text-amber-600 font-bold">&uarr; {pendingCount} hồ sơ</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-black">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11.5px] text-slate-500 font-bold">Bị từ chối</div>
            <div className="text-2xl font-black text-slate-900">{rejectedCount}</div>
            <div className="text-[10.5px] text-rose-600 font-bold">&darr; {rejectedCount} hồ sơ</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-black">
            <FileWarning className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Split Grid: Evidence Table Left (2/3) + File Details Right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            {/* Search & Category Filter Bar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm tên tệp, mã hồ sơ, tiêu chí..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => setSearch('')}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Đặt lại
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold pb-1">
                {[
                  { id: 'ALL', label: `Tất cả (${displayEvidences.length})` },
                  { id: 'Pháp lý', label: `Pháp lý (${displayEvidences.filter(e => e.category.includes('Pháp lý')).length})` },
                  { id: 'Chất lượng', label: `Chất lượng & ATTP (${displayEvidences.filter(e => e.category.includes('Chất lượng')).length})` },
                  { id: 'Chứng nhận', label: `Chứng nhận (${displayEvidences.filter(e => e.category.includes('Chứng nhận')).length})` },
                  { id: 'Bao bì', label: `Bao bì & QR (${displayEvidences.filter(e => e.category.includes('Bao bì')).length})` },
                  { id: 'Thị trường', label: `Tiêu thụ (${displayEvidences.filter(e => e.category.includes('Thị trường')).length})` },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setActiveTabCategory(pill.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                      activeTabCategory === pill.id
                        ? 'bg-emerald-800 text-white font-extrabold shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10.5px] font-bold text-slate-500 uppercase">
                    <th className="py-2.5 px-3">STT</th>
                    <th className="py-2.5 px-3">Tên minh chứng</th>
                    <th className="py-2.5 px-3">Nhóm tiêu chí</th>
                    <th className="py-2.5 px-3">Liên kết hồ sơ</th>
                    <th className="py-2.5 px-3">Kích thước</th>
                    <th className="py-2.5 px-3">Mã băm (SHA-256)</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {paginatedEvidences.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedFile(item)}
                      className={`cursor-pointer transition-colors ${
                        activeRecord.id === item.id ? 'bg-emerald-50/70 font-bold' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-400">{item.stt}</td>
                      <td className="py-2.5 px-3 font-extrabold text-slate-900 flex items-center gap-1.5 truncate max-w-[200px]">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">{item.dossierCode}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono">{item.size}</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 truncate max-w-[100px]">
                        {item.checksum.substring(0, 12)}...
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`pill-badge text-[10px] ${
                          item.status === 'VALID' ? 'pill-green' : item.status === 'PENDING' ? 'pill-amber' : 'pill-red'
                        }`}>
                          {item.statusLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 text-slate-400 hover:text-emerald-700" title="Xem file">
                          <Eye className="w-3.5 h-3.5 inline" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-emerald-700" title="Tải xuống">
                          <Download className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            {filteredEvidences.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredEvidences.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[5, 10, 20]}
                className="border-t border-slate-100 px-0 pt-3"
              />
            )}
          </div>

          {/* Bottom 4 Feature Cards (Matching Image 2 Bottom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-slate-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bảo mật & Toàn vẹn dữ liệu</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tất cả tệp minh chứng được mã hóa, lưu trữ an toàn và kiểm tra tính toàn vẹn bằng mã băm SHA-256.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-amber-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Cảnh báo sắp hết hạn</span>
              </div>
              <p className="text-[11px] text-slate-500">8 tài liệu sẽ hết hạn trong 30 ngày tới.</p>
              <button className="text-[11px] font-bold text-amber-700 hover:underline">Xem chi tiết &rsaquo;</button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-sky-900 text-xs">
                <RefreshCw className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Đồng bộ từ Nhật ký nông nghiệp</span>
              </div>
              <p className="text-[11px] text-slate-500">1-click đồng bộ dữ liệu chứng nhận từ Mùa vụ & Vùng trồng.</p>
              <button className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10.5px] rounded-lg border border-emerald-200">
                Đồng bộ ngay
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-slate-900 text-xs">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tải mẫu biểu</span>
              </div>
              <p className="text-[11px] text-slate-500">Cung cấp các mẫu biểu chuẩn theo QĐ 148/QĐ-TTg.</p>
              <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10.5px] rounded-lg">
                Tải về
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel (1/3 width) - "Chi tiết tệp minh chứng" Side Drawer Preview (Matching Image 2 Right Panel) */}
        {activeRecord && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col h-fit sticky top-20">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> Chi tiết tệp minh chứng
              </h3>
              <span className="pill-badge pill-green text-[10px]">{activeRecord.statusLabel}</span>
            </div>

            {/* Document Title & Checksum */}
            <div className="space-y-1 text-xs">
              <div className="font-extrabold text-slate-900 text-sm leading-snug">{activeRecord.name}</div>
              <div className="text-[11px] text-slate-500 flex justify-between pt-1">
                <span>Nhóm tiêu chí:</span>
                <span className="font-bold text-slate-800">{activeRecord.category}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Liên kết hồ sơ:</span>
                <span className="font-mono font-bold text-emerald-700">{activeRecord.dossierCode}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Kích thước / Định dạng:</span>
                <span className="font-semibold text-slate-800">{activeRecord.size} ({activeRecord.format})</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[10px] break-all space-y-0.5">
                <span className="text-slate-400 font-bold">Mã băm SHA-256:</span>
                <div className="text-slate-700 font-medium">{activeRecord.checksum}</div>
              </div>
            </div>

            {/* Graphic Document Preview Frame (Matching Image 2 Right Side VietGAP graphic) */}
            <div className="aspect-4/3 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="text-xs font-black text-emerald-950">GIẤY CHỨNG NHẬN VietGAP</div>
              <div className="text-[10px] text-emerald-700 font-semibold">Mã số: VietGAP-OCOP-2024-2027</div>
              <div className="text-[9.5px] text-slate-400">Xem trước tệp PDF bảo mật bằng chữ ký số</div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => alert(`Tải xuống tệp minh chứng ${activeRecord.name}`)}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Tải xuống
              </button>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1">
                  <Link className="w-3.5 h-3.5" /> Liên kết chỉ tiêu
                </button>
                <button className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" /> Thay thế phiên bản
                </button>
              </div>
              <button className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Xóa tệp minh chứng
              </button>
            </div>

            {/* Version History */}
            <div className="space-y-2 pt-2 border-t text-xs">
              <h4 className="font-extrabold text-slate-900 text-[11.5px]">Lịch sử phiên bản</h4>
              <div className="space-y-1.5 text-[10.5px]">
                <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between border">
                  <div>
                    <span className="font-bold text-slate-900">v2.0</span> &bull; <span className="text-slate-500">20/05/2025 09:18</span>
                  </div>
                  <span className="text-slate-500">Cập nhật thời hạn</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between border">
                  <div>
                    <span className="font-bold text-slate-900">v1.0</span> &bull; <span className="text-slate-500">15/05/2025 10:24</span>
                  </div>
                  <span className="text-slate-500">Tài liệu gốc</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
