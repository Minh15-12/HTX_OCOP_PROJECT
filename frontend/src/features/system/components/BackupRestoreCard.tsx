import React from 'react';
import { Database, Download, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const BackupRestoreCard: React.FC = () => {
  const backupHistory = [
    { time: '08/09/2025 14:30', size: '245 MB', user: 'Nguyễn Văn A', status: 'Thành công' },
    { time: '01/09/2025 14:22', size: '240 MB', user: 'Trần Thị B', status: 'Thành công' },
    { time: '25/08/2025 09:15', size: '238 MB', user: 'Nguyễn Văn A', status: 'Thành công' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Database className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Sao lưu & Phục hồi dữ liệu</h3>
            <p className="text-xs text-slate-500">Đảm bảo an toàn dữ liệu hệ thống HTX</p>
          </div>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sao lưu */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">Sao lưu dữ liệu</h4>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Lần sao lưu gần nhất: <span className="font-semibold text-slate-700">08/09/2025 14:30</span> (Dung lượng: 245 MB)
            </p>

            <div className="mt-3">
              <span className="text-[11px] font-bold text-slate-600 block mb-1">Lịch sử sao lưu</span>
              <table className="w-full text-left text-[11px] border border-slate-200 rounded bg-white overflow-hidden">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="py-1.5 px-2">Thời gian</th>
                    <th className="py-1.5 px-2">Dung lượng</th>
                    <th className="py-1.5 px-2">Người thực hiện</th>
                    <th className="py-1.5 px-2 text-center">Trạng thái</th>
                    <th className="py-1.5 px-2 text-right">Tải về</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {backupHistory.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-2 font-mono text-slate-600">{item.time}</td>
                      <td className="py-1.5 px-2 font-mono">{item.size}</td>
                      <td className="py-1.5 px-2">{item.user}</td>
                      <td className="py-1.5 px-2 text-center text-emerald-600 font-semibold">{item.status}</td>
                      <td className="py-1.5 px-2 text-right">
                        <button className="text-slate-500 hover:text-emerald-600 p-0.5">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Button variant="primary" size="sm" className="mt-4 w-full justify-center" leftIcon={<Database className="w-4 h-4" />}>
            Sao lưu ngay
          </Button>
        </div>

        {/* Khôi phục */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase">Khôi phục dữ liệu</h4>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Chọn file sao lưu `.sql` hoặc `.zip` để khôi phục hệ thống về trạng thái trước đó.
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-white cursor-pointer hover:border-emerald-500 transition-colors">
              <RotateCcw className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <span className="text-xs font-semibold text-slate-700 block">Kéo thả file sao lưu hoặc Bấm để chọn file</span>
              <span className="text-[11px] text-slate-400 block mt-1">Định dạng hỗ trợ: SQL, TAR.GZ</span>
            </div>
          </div>

          <Button variant="secondary" size="sm" className="mt-4 w-full justify-center" leftIcon={<RotateCcw className="w-4 h-4" />}>
            Khôi phục
          </Button>
        </div>
      </div>
    </div>
  );
};
