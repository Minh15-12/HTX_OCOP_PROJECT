import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { Member, CapitalTransaction } from '@/types/memberTypes';
import { openVoucherPrintWindow, getVoucherDocumentBlobUrl } from '@/utils/voucherDocumentGenerator';

interface CapitalVoucherModalProps {
  transaction: CapitalTransaction | null;
  member: Member | null;
  onClose: () => void;
}

export const CapitalVoucherModal: React.FC<CapitalVoucherModalProps> = ({
  transaction,
  member,
  onClose,
}) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] shadow-modal overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Xem file chứng từ đính kèm:{' '}
              <span className="font-mono text-emerald-800">
                {transaction.receipt_number || transaction.transaction_code}
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (member) {
                  openVoucherPrintWindow(member, transaction);
                }
              }}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" /> In chứng từ
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-slate-100 p-4 overflow-auto flex items-center justify-center">
          {transaction.receipt_file_url &&
          (transaction.receipt_file_url.startsWith('data:image/') ||
            transaction.receipt_file_name?.match(/\.(png|jpg|jpeg|webp|gif)$/i)) ? (
            <div className="bg-white p-4 rounded-xl shadow-md max-h-full flex flex-col items-center justify-center overflow-auto border border-slate-200">
              <img
                src={transaction.receipt_file_url}
                alt={transaction.receipt_file_name || transaction.receipt_number}
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-sm"
              />
              {transaction.receipt_file_name && (
                <div className="mt-3 text-xs font-bold text-slate-600">
                  📁 File đính kèm: {transaction.receipt_file_name}
                </div>
              )}
            </div>
          ) : transaction.receipt_file_url &&
            (transaction.receipt_file_url.startsWith('data:application/pdf') ||
              transaction.receipt_file_name?.endsWith('.pdf')) ? (
            <iframe
              src={transaction.receipt_file_url}
              title="Chứng từ PDF đính kèm"
              className="w-full h-full border-0 rounded-xl bg-white shadow-sm"
            />
          ) : (
            <iframe
              src={member ? getVoucherDocumentBlobUrl(member, transaction) : ''}
              title="Biên nhận chứng từ"
              className="w-full h-full border-0 rounded-xl bg-white shadow-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
};
