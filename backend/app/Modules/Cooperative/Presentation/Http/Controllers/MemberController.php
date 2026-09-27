<?php

namespace Modules\Cooperative\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Cooperative\Application\DTOs\CreateMemberDTO;
use Modules\Cooperative\Application\DTOs\UpdateMemberDTO;
use Modules\Cooperative\Application\Services\MemberService;
use Modules\Cooperative\Presentation\Http\Requests\CreateMemberRequest;
use Modules\Cooperative\Presentation\Http\Requests\StatusTransitionRequest;
use Modules\Cooperative\Presentation\Http\Requests\UpdateMemberRequest;
use Modules\Cooperative\Presentation\Http\Resources\MemberResource;

class MemberController extends BaseController
{
    public function __construct(private readonly MemberService $memberService) {}

    public function index(Request $request): JsonResponse
    {
        if (auth()->check() && !Gate::allows('MEMBER.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách xã viên', status: 403);
        }

        $filters = $request->only(['search', 'status', 'member_type']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-created_at');

        $paginator = $this->memberService->listMembers($filters, $perPage, $sort);

        return ApiResponse::success(
            data: MemberResource::collection($paginator->items()),
            message: 'Lấy danh sách xã viên thành công',
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
        if (auth()->check() && !Gate::allows('MEMBER.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem thông tin xã viên', status: 403);
        }

        $member = $this->memberService->getMemberById($id);

        return ApiResponse::success(
            data: new MemberResource($member),
            message: 'Lấy thông tin xã viên thành công'
        );
    }

    public function store(CreateMemberRequest $request): JsonResponse
    {
        if (auth()->check() && !Gate::allows('MEMBER.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền thêm mới xã viên', status: 403);
        }

        $dto = new CreateMemberDTO(
            memberCode: $request->input('member_code'),
            identityInformation: $request->input('identity_information'),
            memberType: $request->input('member_type', 'OFFICIAL'),
            userId: $request->input('user_id'),
            admissionDate: $request->input('admission_date'),
            cooperativeId: $request->input('cooperative_id'),
            creditLimit: (float) $request->input('credit_limit', 0)
        );

        $member = $this->memberService->createMember($dto);

        return ApiResponse::success(
            data: new MemberResource($member),
            message: 'Thêm mới xã viên thành công',
            status: 201
        );
    }

    public function update(string $id, UpdateMemberRequest $request): JsonResponse
    {
        if (auth()->check() && !Gate::allows('MEMBER.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật thông tin xã viên', status: 403);
        }

        $dto = new UpdateMemberDTO(
            identityInformation: $request->input('identity_information'),
            memberType: $request->input('member_type'),
            userId: $request->input('user_id'),
            admissionDate: $request->input('admission_date'),
            creditLimit: $request->has('credit_limit') ? (float) $request->input('credit_limit') : null
        );

        $member = $this->memberService->updateMember($id, $dto);

        return ApiResponse::success(
            data: new MemberResource($member),
            message: 'Cập nhật thông tin xã viên thành công'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        if (auth()->check() && !Gate::allows('MEMBER.DELETE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xóa xã viên', status: 403);
        }

        $this->memberService->deleteMember($id);

        return ApiResponse::success(
            data: null,
            message: 'Xóa xã viên thành công'
        );
    }

    public function approve(string $id): JsonResponse
    {
        if (!Gate::allows('MEMBER.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền phê duyệt kết nạp xã viên', status: 403);
        }

        $member = $this->memberService->approveMember($id);

        return ApiResponse::success(
            data: new MemberResource($member),
            message: 'Phê duyệt kết nạp xã viên thành công'
        );
    }

    public function transitionStatus(string $id, StatusTransitionRequest $request): JsonResponse
    {
        if (!Gate::allows('MEMBER.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền chuyển trạng thái xã viên', status: 403);
        }

        $targetStatus = $request->input('target_status');
        $reason = $request->input('reason');

        $member = $this->memberService->transitionStatus($id, $targetStatus, $reason);

        return ApiResponse::success(
            data: new MemberResource($member),
            message: "Chuyển trạng thái xã viên sang [{$targetStatus}] thành công"
        );
    }
}
