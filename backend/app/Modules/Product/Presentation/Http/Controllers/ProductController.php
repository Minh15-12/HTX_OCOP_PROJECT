<?php

namespace Modules\Product\Presentation\Http\Controllers;

use App\Shared\Application\Responses\ApiResponse;
use App\Shared\Presentation\Http\Controllers\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Agriculture\Presentation\Http\Resources\LotResource;
use Modules\Product\Application\DTOs\AttachProductLotDTO;
use Modules\Product\Application\DTOs\CreateProductDTO;
use Modules\Product\Application\DTOs\UpdateProductDTO;
use Modules\Product\Application\Services\ProductService;
use Modules\Product\Presentation\Http\Requests\AttachProductLotRequest;
use Modules\Product\Presentation\Http\Requests\CreateProductRequest;
use Modules\Product\Presentation\Http\Requests\UpdateProductRequest;
use Modules\Product\Presentation\Http\Resources\ProductResource;

class ProductController extends BaseController
{
    public function __construct(private readonly ProductService $productService) {}

    public function index(Request $request): JsonResponse
    {
        if (!Gate::allows('PRODUCT.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh mục sản phẩm', status: 403);
        }

        $filters = $request->only(['category', 'status', 'search']);
        $perPage = (int) $request->input('per_page', 15);
        $sort = (string) $request->input('sort', '-created_at');

        $paginator = $this->productService->listProducts($filters, $perPage, $sort);

        return ApiResponse::success(
            data: ProductResource::collection($paginator->items()),
            message: 'Lấy danh sách sản phẩm thành công',
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
        if (!Gate::allows('PRODUCT.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem chi tiết sản phẩm', status: 403);
        }

        $product = $this->productService->getProductById($id);

        return ApiResponse::success(
            data: new ProductResource($product),
            message: 'Lấy chi tiết sản phẩm thành công'
        );
    }

    public function store(CreateProductRequest $request): JsonResponse
    {
        if (!Gate::allows('PRODUCT.CREATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền tạo mới sản phẩm', status: 403);
        }

        $dto = new CreateProductDTO(
            productCode: $request->input('product_code'),
            productName: $request->input('product_name'),
            category: $request->input('category'),
            specification: $request->input('specification'),
            brand: $request->input('brand'),
            qualityInformation: $request->input('quality_information'),
            cooperativeId: $request->input('cooperative_id')
        );

        $product = $this->productService->createProduct($dto);

        return ApiResponse::success(
            data: new ProductResource($product),
            message: 'Tạo mới sản phẩm thành công',
            status: 201
        );
    }

    public function update(string $id, UpdateProductRequest $request): JsonResponse
    {
        if (!Gate::allows('PRODUCT.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền cập nhật thông tin sản phẩm', status: 403);
        }

        $dto = new UpdateProductDTO(
            productName: $request->input('product_name'),
            category: $request->input('category'),
            specification: $request->input('specification'),
            brand: $request->input('brand'),
            qualityInformation: $request->input('quality_information'),
            status: $request->input('status')
        );

        $product = $this->productService->updateProduct($id, $dto);

        return ApiResponse::success(
            data: new ProductResource($product),
            message: 'Cập nhật sản phẩm thành công'
        );
    }

    public function attachLot(string $productId, AttachProductLotRequest $request): JsonResponse
    {
        if (!Gate::allows('PRODUCT.UPDATE')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền liên kết lô sản phẩm', status: 403);
        }

        $dto = new AttachProductLotDTO(
            productId: $productId,
            lotId: $request->input('lot_id'),
            quantity: $request->has('quantity') ? (float) $request->input('quantity') : null
        );

        $this->productService->attachLot($dto);

        return ApiResponse::success(
            data: null,
            message: 'Liên kết lô sản phẩm vào sản phẩm Master thành công',
            status: 201
        );
    }

    public function listLots(string $productId): JsonResponse
    {
        if (!Gate::allows('PRODUCT.READ')) {
            return ApiResponse::error('FORBIDDEN', 'Bạn không có quyền xem danh sách lô của sản phẩm', status: 403);
        }

        $lots = $this->productService->listProductLots($productId);

        return ApiResponse::success(
            data: LotResource::collection($lots),
            message: 'Lấy danh sách lô hàng thuộc sản phẩm thành công'
        );
    }
}
