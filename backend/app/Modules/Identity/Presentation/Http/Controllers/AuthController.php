<?php

namespace Modules\Identity\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Identity\Application\DTOs\LoginData;
use Modules\Identity\Application\Services\AuthenticationService;
use Modules\Identity\Presentation\Http\Requests\LoginRequest;
use Modules\Identity\Presentation\Http\Resources\UserResource;

class AuthController extends BaseController
{
    public function __construct(private readonly AuthenticationService $authService) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $dto = new LoginData(
            username: $request->input('username'),
            password: $request->input('password')
        );

        $result = $this->authService->login($dto);

        return ApiResponse::success(
            data: [
                'token' => $result['token'],
                'token_type' => $result['token_type'],
                'user' => new UserResource($result['user']),
            ],
            message: 'Đăng nhập thành công'
        );
    }

    public function me(Request $request): JsonResponse
    {
        $userData = $this->authService->getUserInfo($request->user());

        return ApiResponse::success(
            data: new UserResource($userData),
            message: 'Lấy thông tin người dùng thành công'
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return ApiResponse::success(
            data: null,
            message: 'Đăng xuất thành công'
        );
    }
}
