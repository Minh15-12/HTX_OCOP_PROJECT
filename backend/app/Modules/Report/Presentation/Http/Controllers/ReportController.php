<?php

namespace Modules\Report\Presentation\Http\Controllers;

use App\Shared\Infrastructure\Export\OpenXmlSpreadsheetService;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Cooperative\Application\Services\TenantContext;
use Modules\Cooperative\Infrastructure\Persistence\Models\MemberModel;
use Modules\Finance\Infrastructure\Persistence\Models\CashTransactionModel;
use Modules\Report\Application\Services\DashboardReportService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends BaseController
{
    public function __construct(
        private readonly DashboardReportService $dashboardReportService,
        private readonly OpenXmlSpreadsheetService $spreadsheetService,
        private readonly TenantContext $tenantContext
    ) {}

    public function dashboard(Request $request): JsonResponse
    {
        $cooperativeId = $request->get('cooperative_id');
        $summary = $this->dashboardReportService->getDashboardSummary($cooperativeId);

        return $this->success(
            data: $summary,
            message: 'Tải dữ liệu tổng quan Dashboard thành công'
        );
    }

    public function ocopReadiness(string $applicationId): JsonResponse
    {
        $readiness = $this->dashboardReportService->getOcopReadiness($applicationId);

        return $this->success(
            data: $readiness,
            message: 'Tải báo cáo tiến độ sẵn sàng nộp hồ sơ OCOP thành công'
        );
    }

    public function ocopAnalytics(Request $request): JsonResponse
    {
        $cooperativeId = $request->get('cooperative_id');
        $analytics = $this->dashboardReportService->getOcopAnalyticsSummary($cooperativeId);

        return $this->success(
            data: $analytics,
            message: 'Tải báo cáo phân tích chiến lược OCOP thành công'
        );
    }

    public function exportMembers(Request $request): StreamedResponse
    {
        $query = MemberModel::query();
        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        $members = $query->orderBy('member_code', 'asc')->get();

        $headers = [
            'STT',
            'Mã xã viên',
            'Họ và tên',
            'Số CCCD/CMND',
            'Số điện thoại',
            'Địa chỉ',
            'Loại xã viên',
            'Ngày kết nạp',
            'Vốn cam kết (VNĐ)',
            'Hạn mức nợ (VNĐ)',
            'Trạng thái',
        ];

        $rows = [];
        $stt = 1;
        foreach ($members as $m) {
            $rows[] = [
                $stt++,
                $m->member_code,
                $m->identity_information['full_name'] ?? '',
                $m->identity_information['citizen_id'] ?? '',
                $m->identity_information['phone_number'] ?? '',
                $m->identity_information['address'] ?? '',
                $m->member_type,
                $m->admission_date ? $m->admission_date->format('Y-m-d') : '',
                (float) $m->committed_capital,
                (float) $m->credit_limit,
                $m->status,
            ];
        }

        $filename = 'danh_ba_xa_vien_' . date('Ymd_His') . '.xlsx';
        return $this->spreadsheetService->downloadXlsx($filename, 'Danh bạ xã viên', $headers, $rows);
    }

    public function exportCashBook(Request $request): StreamedResponse
    {
        $query = CashTransactionModel::query();
        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if ($request->filled('date_from')) {
            $query->where('transaction_date', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->where('transaction_date', '<=', $request->input('date_to'));
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->get();

        $headers = [
            'STT',
            'Mã phiếu',
            'Ngày giao dịch',
            'Loại giao dịch',
            'Khoản mục',
            'Số tiền (VNĐ)',
            'Phương thức',
            'Diễn giải',
            'Trạng thái',
        ];

        $rows = [];
        $stt = 1;
        foreach ($transactions as $tx) {
            $rows[] = [
                $stt++,
                $tx->transaction_code,
                $tx->transaction_date ? $tx->transaction_date->format('Y-m-d') : '',
                $tx->transaction_type === 'RECEIPT' ? 'Thu' : 'Chi',
                $tx->category,
                (float) $tx->amount,
                $tx->payment_method,
                $tx->description,
                $tx->status,
            ];
        }

        $filename = 'so_quy_tien_mat_' . date('Ymd_His') . '.xlsx';
        return $this->spreadsheetService->downloadXlsx($filename, 'Sổ quỹ tiền mặt', $headers, $rows);
    }

    public function exportReceivablesPayables(Request $request): StreamedResponse
    {
        $query = \Modules\Finance\Infrastructure\Persistence\Models\ReceivablePayableModel::query();
        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if ($request->filled('debt_type')) {
            $query->where('debt_type', $request->input('debt_type'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $records = $query->orderBy('due_date', 'asc')->get();

        $headers = [
            'STT',
            'Mã công nợ',
            'Phân loại',
            'Loại đối tượng',
            'Tên đối tác / Xã viên',
            'Số tiền gốc (VNĐ)',
            'Còn phải thu/trả (VNĐ)',
            'Hạn thanh toán',
            'Trạng thái',
            'Nội dung / Diễn giải',
        ];

        $rows = [];
        $stt = 1;
        foreach ($records as $r) {
            $debtTypeLabel = $r->debt_type === 'RECEIVABLE' ? 'Phải thu' : 'Phải trả';
            $counterpartyLabel = match ($r->counterparty_type) {
                'MEMBER' => 'Xã viên',
                'SUPPLIER' => 'Nhà cung cấp',
                'CUSTOMER' => 'Khách hàng',
                default => $r->counterparty_type,
            };
            $statusLabel = match ($r->status) {
                'PAID' => 'Đã tất toán',
                'PARTIALLY_PAID' => 'Thanh toán 1 phần',
                'OVERDUE' => 'Quá hạn',
                'CANCELLED' => 'Đã hủy',
                default => 'Chờ thanh toán',
            };

            $rows[] = [
                $stt++,
                $r->debt_code,
                $debtTypeLabel,
                $counterpartyLabel,
                $r->counterparty_name,
                (float) $r->original_amount,
                (float) $r->outstanding_amount,
                $r->due_date ? $r->due_date->format('Y-m-d') : '',
                $statusLabel,
                $r->description ?? '',
            ];
        }

        $filename = 'so_cong_no_' . date('Ymd_His') . '.xlsx';
        return $this->spreadsheetService->downloadXlsx($filename, 'Sổ theo dõi công nợ', $headers, $rows);
    }

    public function exportInventoryStock(Request $request): StreamedResponse
    {
        $query = \Modules\Inventory\Infrastructure\Persistence\Models\MaterialModel::with('batches');
        if ($this->tenantContext->hasTenant()) {
            $query->where('cooperative_id', $this->tenantContext->getCooperativeId());
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        $materials = $query->orderBy('name', 'asc')->get();

        $headers = [
            'STT',
            'Mã SKU',
            'Tên vật tư nông nghiệp',
            'Phân loại',
            'Đơn vị tính',
            'Số lượng lô',
            'Tổng tồn kho',
            'Ngưỡng an toàn',
            'Lô cận hạn nhất',
            'Hạn sử dụng lô',
            'Cảnh báo FEFO',
            'Trạng thái',
        ];

        $rows = [];
        $stt = 1;
        $now = now();
        foreach ($materials as $m) {
            $totalStock = (float) $m->batches->sum('quantity');
            $nearestBatch = $m->batches->where('quantity', '>', 0)->sortBy('expired_at')->first();
            
            $fefoStatus = 'Bình thường';
            $expiryStr = '';
            $batchNum = '';
            if ($nearestBatch && $nearestBatch->expired_at) {
                $batchNum = $nearestBatch->batch_number;
                $expiryStr = $nearestBatch->expired_at->format('Y-m-d');
                $days = $now->diffInDays($nearestBatch->expired_at, false);
                if ($days < 0) {
                    $fefoStatus = 'ĐÃ HẾT HẠN';
                } elseif ($days <= 30) {
                    $fefoStatus = 'CẬN HẠN (<= 30 ngày)';
                }
            }

            $rows[] = [
                $stt++,
                $m->sku,
                $m->name,
                $m->category,
                $m->unit,
                $m->batches->count(),
                $totalStock,
                (float) $m->reorder_threshold,
                $batchNum,
                $expiryStr,
                $fefoStatus,
                $m->status ?? 'ACTIVE',
            ];
        }

        $filename = 'ton_kho_vat_tu_' . date('Ymd_His') . '.xlsx';
        return $this->spreadsheetService->downloadXlsx($filename, 'Tồn kho & Cảnh báo FEFO', $headers, $rows);
    }

    public function exportFarmingLogs(Request $request): StreamedResponse
    {
        $query = \Modules\Agriculture\Infrastructure\Persistence\Models\FarmingLogModel::with(['cropSeason', 'plot.productionUnit', 'performer', 'material']);
        
        if ($this->tenantContext->hasTenant()) {
            $coopId = $this->tenantContext->getCooperativeId();
            $query->whereHas('plot.productionUnit', function ($q) use ($coopId) {
                $q->where('cooperative_id', $coopId);
            });
        }

        if ($request->filled('date_from')) {
            $query->where('activity_date', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->where('activity_date', '<=', $request->input('date_to'));
        }

        $logs = $query->orderBy('activity_date', 'desc')->get();

        $headers = [
            'STT',
            'Ngày thực hiện',
            'Thửa đất / Lô',
            'Vụ mùa canh tác',
            'Loại hoạt động',
            'Nội dung công việc',
            'Vật tư sử dụng',
            'Số lô vật tư',
            'Lượng bón / phun',
            'Đơn vị tính',
            'Thời gian cách ly PHI (ngày)',
            'Tọa độ GPS',
            'Người thực hiện',
        ];

        $rows = [];
        $stt = 1;
        foreach ($logs as $log) {
            $gps = '';
            if ($log->gps_latitude && $log->gps_longitude) {
                $gps = "{$log->gps_latitude}, {$log->gps_longitude}";
            }

            $plotLabel = '';
            if ($log->plot) {
                $plotLabel = $log->plot->plot_code;
                if ($log->plot->productionUnit) {
                    $plotLabel .= ' (' . $log->plot->productionUnit->name . ')';
                }
            }

            $rows[] = [
                $stt++,
                $log->activity_date ? $log->activity_date->format('Y-m-d') : '',
                $plotLabel,
                $log->cropSeason ? $log->cropSeason->name : '',
                $log->activity_type,
                $log->description ?? '',
                $log->material ? $log->material->name : '',
                $log->material_batch_number ?? '',
                (float) $log->quantity_applied,
                $log->unit ?? '',
                (int) $log->phi_days,
                $gps,
                $log->performer ? $log->performer->full_name : ($log->performed_by ?? ''),
            ];
        }

        $filename = 'nhat_ky_canh_tac_vietgap_' . date('Ymd_His') . '.xlsx';
        return $this->spreadsheetService->downloadXlsx($filename, 'Nhật ký canh tác VietGAP', $headers, $rows);
    }
}
