<?php

namespace Modules\Notification\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Notification\Presentation\Http\Resources\NotificationResource;

class NotificationController extends Controller
{
    /**
     * Get user's notifications.
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        
        $notifications = $user->notifications()
            ->latest()
            ->paginate($request->get('limit', 15));

        return response()->json([
            'data' => NotificationResource::collection($notifications)->response()->getData(true)
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(string $id): JsonResponse
    {
        $user = auth()->user();
        
        $notification = $user->notifications()->find($id);

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read',
            'data' => new NotificationResource($notification)
        ]);
    }
}
