import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, FileQuestion } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { Pagination } from './Pagination';
import { cn } from '@/utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  // Pagination
  pagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data = [],
  isLoading = false,
  emptyMessage = 'Không có dữ liệu hiển thị',
  sortKey,
  sortDirection,
  onSort,
  pagination = true,
  currentPage = 1,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  className,
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = useState<number>(1);
  const [internalPageSize, setInternalPageSize] = useState<number>(pageSize);

  const isServerSide = !!onPageChange;
  const activePage = isServerSide ? currentPage : internalPage;
  const activePageSize = isServerSide ? pageSize : internalPageSize;
  const activeTotalItems = isServerSide ? (totalItems ?? data.length) : data.length;

  useEffect(() => {
    if (!isServerSide && internalPage > 1 && (internalPage - 1) * internalPageSize >= data.length) {
      setInternalPage(1);
    }
  }, [data.length, internalPage, internalPageSize, isServerSide]);

  const displayData = isServerSide
    ? data
    : (pagination ? data.slice((activePage - 1) * activePageSize, activePage * activePageSize) : data);

  const handleSort = (columnKey: string, sortable?: boolean) => {
    if (sortable && onSort) {
      onSort(columnKey);
    }
  };

  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 select-none',
                    col.sortable ? 'cursor-pointer hover:bg-slate-100 transition-colors' : '',
                    col.className
                  )}
                  onClick={() => handleSort(col.key, col.sortable)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-400">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="rounded-full bg-slate-100 p-3 text-slate-400">
                      <FileQuestion className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              displayData.map((item, rowIdx) => (
                <tr
                  key={item.id || rowIdx}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3.5 text-slate-700', col.className)}>
                      {col.render ? col.render(item, rowIdx) : item[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && activeTotalItems > 0 && (
        <Pagination
          currentPage={activePage}
          totalItems={activeTotalItems}
          pageSize={activePageSize}
          onPageChange={(page) => {
            if (onPageChange) {
              onPageChange(page);
            } else {
              setInternalPage(page);
            }
          }}
          onPageSizeChange={(newSize) => {
            if (onPageSizeChange) {
              onPageSizeChange(newSize);
            } else {
              setInternalPageSize(newSize);
              setInternalPage(1);
            }
          }}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  );
}
