<?php

namespace Modules\Notification\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Notification\Presentation\Http\Resources\NotificationResource;

class NotificationController extends BaseController
{
    /**
     * Get user's notifications with pagination and unread counter.
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $limit = min(max((int) $request->get('limit', 15), 1), 100);

        $paginator = $user->notifications()
            ->latest()
            ->paginate($limit);

        return ApiResponse::success(
            data: NotificationResource::collection($paginator->items()),
            message: 'Lấy danh sách thông báo thành công',
            meta: [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'unread_count' => $user->unreadNotifications()->count(),
            ]
        );
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(string $id): JsonResponse
    {
        $user = auth()->user();

        $notification = $user->notifications()->find($id);

        if (!$notification) {
            return ApiResponse::error('NOTIFICATION_NOT_FOUND', 'Thông báo không tồn tại trong hệ thống', status: 404);
        }

        $notification->markAsRead();

        return ApiResponse::success(
            data: new NotificationResource($notification),
            message: 'Đã đánh dấu thông báo là đã đọc'
        );
    }

    /**
     * Mark all notifications as read for current user.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = auth()->user();
        $user->unreadNotifications()->update(['read_at' => now()]);

        return ApiResponse::success(
            data: null,
            message: 'Đã đánh dấu tất cả thông báo là đã đọc'
        );
    }
}
