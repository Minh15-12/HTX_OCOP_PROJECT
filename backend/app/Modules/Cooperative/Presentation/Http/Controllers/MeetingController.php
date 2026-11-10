<?php

namespace Modules\Cooperative\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Cooperative\Application\Services\MeetingService;
use Modules\Cooperative\Presentation\Http\Requests\CastVoteRequest;
use Modules\Cooperative\Presentation\Http\Requests\CreateMeetingRequest;
use Modules\Cooperative\Presentation\Http\Resources\MeetingResource;
use Modules\Cooperative\Presentation\Http\Resources\VoteResource;

class MeetingController extends BaseController
{
    public function __construct(private readonly MeetingService $meetingService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('MEMBER.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách đại hội/cuộc họp', status: 403);
        }

        $filters = $request->only(['status', 'meeting_type', 'search']);
        $perPage = (int) $request->input('per_page', 15);

        $paginator = $this->meetingService->listMeetings($filters, $perPage);

        return ApiResponse::success(
            data: MeetingResource::collection($paginator->items()),
            message: 'Lấy danh sách cuộc họp thành công',
            meta: [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ]
        );
    }

    public function show(string $id): JsonResponse
    {
        if (!Gate::allows('MEMBER.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết cuộc họp', status: 403);
        }

        $meeting = $this->meetingService->getMeetingById($id);

        return ApiResponse::success(
            data: new MeetingResource($meeting),
            message: 'Lấy chi tiết cuộc họp thành công'
        );
    }

    public function store(CreateMeetingRequest $request): JsonResponse
    {
        if (!Gate::allows('MEMBER.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền tạo mới cuộc họp/đại hội', status: 403);
        }

        $meeting = $this->meetingService->createMeeting($request->validated());

        return ApiResponse::success(
            data: new MeetingResource($meeting),
            message: 'Tạo mới cuộc họp thành công',
            status: 201
        );
    }

    public function update(string $id, Request $request): JsonResponse
    {
        if (!Gate::allows('MEMBER.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật cuộc họp', status: 403);
        }

        $meeting = $this->meetingService->updateMeeting($id, $request->all());

        return ApiResponse::success(
            data: new MeetingResource($meeting),
            message: 'Cập nhật cuộc họp thành công'
        );
    }

    public function listVotes(string $id, Request $request): JsonResponse
    {
        if (!Gate::allows('MEMBER.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách biểu quyết', status: 403);
        }

        $resolutionCode = $request->query('resolution_code');
        $votes = $this->meetingService->listVotes($id, $resolutionCode);

        return ApiResponse::success(
            data: VoteResource::collection($votes),
            message: 'Lấy danh sách phiếu biểu quyết thành công'
        );
    }

    public function castVote(string $id, CastVoteRequest $request): JsonResponse
    {
        $userId = auth()->id();
        if (!$userId) {
            return ApiResponse::error('UNAUTHENTICATED', 'Vui lòng đăng nhập để biểu quyết', status: 401);
        }

        $vote = $this->meetingService->castVote($id, $userId, $request->validated());

        return ApiResponse::success(
            data: new VoteResource($vote),
            message: 'Ghi nhận biểu quyết thành công',
            status: 201
        );
    }

    public function resolutionsSummary(string $id): JsonResponse
    {
        if (!Gate::allows('MEMBER.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem kết quả biểu quyết', status: 403);
        }

        $summary = $this->meetingService->getResolutionsSummary($id);

        return ApiResponse::success(
            data: $summary,
            message: 'Tổng hợp kết quả biểu quyết thành công'
        );
    }
}
