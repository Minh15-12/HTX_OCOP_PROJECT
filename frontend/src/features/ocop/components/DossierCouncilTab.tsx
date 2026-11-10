import React from 'react';

interface DossierCouncilTabProps {
  dossier: {
    productName: string;
    subjectName: string;
  };
}

export const DossierCouncilTab: React.FC<DossierCouncilTabProps> = ({ dossier }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex justify-between items-center border-b pb-3 border-slate-200">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm">
            Phiếu đánh giá hội đồng OCOP Tỉnh Lâm Đồng
          </h3>
          <p className="text-xs text-slate-500">
            Chủ thể: {dossier.subjectName} &bull; Sản phẩm: {dossier.productName}
          </p>
        </div>
        <div className="pill-badge pill-green text-xs font-extrabold">
          &bull; Đề xuất công nhận 4 sao OCOP
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
              <th className="py-3 px-4">Nhóm tiêu chí QĐ 148</th>
              <th className="py-3 px-4 text-center">Điểm tối đa</th>
              <th className="py-3 px-4 text-center">Điểm hội đồng chấm</th>
              <th className="py-3 px-4 text-center">Tỉ lệ (%)</th>
              <th className="py-3 px-4 text-center">Nhận xét</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            <tr className="hover:bg-slate-50">
              <td className="py-3 px-4 font-bold text-slate-800">
                Phần A: Sản phẩm và sức mạnh cộng đồng
              </td>
              <td className="py-3 px-4 text-center font-mono font-bold">40.0</td>
              <td className="py-3 px-4 text-center font-mono font-black text-emerald-800">38.0</td>
              <td className="py-3 px-4 text-center font-mono font-bold">95.0%</td>
              <td className="py-3 px-4 text-center font-bold text-emerald-700">Đạt xuất sắc</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="py-3 px-4 font-bold text-slate-800">Phần B: Khả năng tiếp thị</td>
              <td className="py-3 px-4 text-center font-mono font-bold">25.0</td>
              <td className="py-3 px-4 text-center font-mono font-black text-emerald-800">23.5</td>
              <td className="py-3 px-4 text-center font-mono font-bold">94.0%</td>
              <td className="py-3 px-4 text-center font-bold text-emerald-700">Đạt xuất sắc</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="py-3 px-4 font-bold text-slate-800">Phần C: Chất lượng sản phẩm</td>
              <td className="py-3 px-4 text-center font-mono font-bold">35.0</td>
              <td className="py-3 px-4 text-center font-mono font-black text-emerald-800">33.5</td>
              <td className="py-3 px-4 text-center font-mono font-bold">95.7%</td>
              <td className="py-3 px-4 text-center font-bold text-emerald-700">Đạt xuất sắc</td>
            </tr>
            <tr className="bg-emerald-50/60 font-black text-slate-900 border-t-2 border-emerald-200">
              <td className="py-3 px-4">TỔNG CỘNG ĐIỂM HỘI ĐỒNG</td>
              <td className="py-3 px-4 text-center font-mono">100.0</td>
              <td className="py-3 px-4 text-center text-emerald-950 text-sm font-mono font-black">
                95.0
              </td>
              <td className="py-3 px-4 text-center text-emerald-950 text-sm font-mono">95.0%</td>
              <td className="py-3 px-4 text-center text-emerald-950 text-xs uppercase font-extrabold">
                Đề xuất 4 sao OCOP (Tiềm năng 5 sao)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pt-4 grid grid-cols-2 text-center text-xs gap-4 font-bold text-slate-700">
        <div>
          <p>Chủ tịch Hội đồng Thẩm định</p>
          <p className="italic font-normal text-slate-400 mt-8">(Đã ký tên điện tử)</p>
        </div>
        <div>
          <p>Thư ký Hội đồng OCOP</p>
          <p className="italic font-normal text-slate-400 mt-8">(Đã ký tên điện tử)</p>
        </div>
      </div>
    </div>
  );
};
