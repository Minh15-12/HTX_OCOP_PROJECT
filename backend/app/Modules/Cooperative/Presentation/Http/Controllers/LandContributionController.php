<?php

namespace Modules\Cooperative\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Cooperative\Application\Services\LandContributionService;
use Modules\Cooperative\Presentation\Http\Requests\CreateLandContributionRequest;
use Modules\Cooperative\Presentation\Http\Resources\LandContributionResource;

class LandContributionController extends BaseController
{
    public function __construct(private readonly LandContributionService $landService) {}

    public function indexAll(): JsonResponse
    {
        if (!Gate::allows('MEMBER.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin góp vốn đất đai', status: 403);
        }

        $contributions = $this->landService->listAllLandContributions();

        return ApiResponse::success(
            data: LandContributionResource::collection($contributions),
            message: 'Lấy toàn bộ danh sách góp vốn quyền sử dụng đất thành công'
        );
    }

    public function indexByMember(string $memberId): JsonResponse
    {
        if (!Gate::allows('MEMBER.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin góp vốn đất đai', status: 403);
        }

        $contributions = $this->landService->listLandContributionsByMember($memberId);

        return ApiResponse::success(
            data: LandContributionResource::collection($contributions),
            message: 'Lấy danh sách góp vốn quyền sử dụng đất thành công'
        );
    }

    public function show(string $id): JsonResponse
    {
        if (!Gate::allows('MEMBER.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết góp vốn đất đai', status: 403);
        }

        $land = $this->landService->getLandContributionById($id);

        return ApiResponse::success(
            data: new LandContributionResource($land),
            message: 'Lấy chi tiết góp vốn quyền sử dụng đất thành công'
        );
    }

    public function storeForMember(string $memberId, CreateLandContributionRequest $request): JsonResponse
    {
        if (!Gate::allows('MEMBER.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền ghi nhận góp vốn đất đai cho xã viên', status: 403);
        }

        $land = $this->landService->createLandContribution($memberId, $request->validated());

        return ApiResponse::success(
            data: new LandContributionResource($land),
            message: 'Ghi nhận góp vốn quyền sử dụng đất thành công',
            status: 201
        );
    }

    public function destroy(string $id): JsonResponse
    {
        if (!Gate::allows('MEMBER.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xóa bản ghi góp vốn đất đai', status: 403);
        }

        $this->landService->deleteLandContribution($id);

        return ApiResponse::success(
            data: ['id' => $id],
            message: 'Xóa bản ghi góp vốn đất đai thành công'
        );
    }
}
