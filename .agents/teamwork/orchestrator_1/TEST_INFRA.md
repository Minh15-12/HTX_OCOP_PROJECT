# E2E Test Infra: OCOP Digitization Project (QĐ 148/QĐ-TTg)

## Test Philosophy
- Opaque-box, requirement-driven testing based on QĐ 148/QĐ-TTg, Form 01, 02, 03 standards and farmer UX specifications.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Interaction + Real-World Workload Testing.

## Test Architecture
- **Backend Test Runner**:
  - Command: `php artisan test --filter=Ocop`
  - Target: Feature and Unit tests in `backend/tests/Feature/` and `backend/tests/Unit/`.
  - Pass/Fail semantics: Exit code 0, 0 failed tests.
- **Frontend Verification**:
  - Commands: `npm run build` and `npm run lint` (in `frontend/`).
  - Pass/Fail semantics: Exit code 0, no compile errors, no lint violations.

## Feature Inventory & Test Coverage Goals
| # | Feature | Requirement | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Real-World) |
|---|---------|-------------|:-----------------:|:-----------------:|:-----------------:|:-------------------:|
| 1 | Cây tiêu chí QĐ 148 (100đ) | R1 | 5 test cases | 5 test cases | ✓ | ✓ |
| 2 | Quy tắc chấm điểm bậc thang | R1 | 5 test cases | 5 test cases | ✓ | ✓ |
| 3 | Điều kiện khống chế (Cứng) | R1 | 5 test cases | 5 test cases | ✓ | ✓ |
| 4 | Seeder Sweet Palermo | R1 | 5 test cases | 5 test cases | ✓ | ✓ |
| 5 | Trợ lý Gợi ý Điểm Thông minh | R2 | 5 test cases | 5 test cases | ✓ | ✓ |
| 6 | API Gợi ý Điểm Tự chấm | R2 | 5 test cases | 5 test cases | ✓ | ✓ |
| 7 | Số hóa Biểu mẫu 01 chuẩn | R2 | 5 test cases | 5 test cases | ✓ | ✓ |
| 8 | Số hóa Biểu mẫu 02 chuẩn | R2 | 5 test cases | 5 test cases | ✓ | ✓ |
| 9 | Số hóa Biểu mẫu 03 chuẩn | R2 | 5 test cases | 5 test cases | ✓ | ✓ |
| 10 | Tính tổng điểm & Dự báo sao | R2 | 5 test cases | 5 test cases | ✓ | ✓ |
| 11 | Đo lường % Hoàn thiện hồ sơ | R2 | 5 test cases | 5 test cases | ✓ | ✓ |
| 12 | Quản lý Mã băm SHA-256 | R3 | 5 test cases | 5 test cases | ✓ | ✓ |
| 13 | Quản lý Phiên bản Minh chứng | R3 | 5 test cases | 5 test cases | ✓ | ✓ |
| 14 | Trích xuất Minh chứng Nội bộ | R3 | 5 test cases | 5 test cases | ✓ | ✓ |
| 15 | Farmer Wizard Cải tiến | R4 | 5 test cases | 5 test cases | ✓ | ✓ |
| 16 | Thẻ chọn điểm to bản (Card UI) | R4 | 5 test cases | 5 test cases | ✓ | ✓ |
| 17 | Đơn giản hóa thuật ngữ | R4 | 5 test cases | 5 test cases | ✓ | ✓ |
| 18 | Chỉ báo trạng thái 3 màu | R4 | 5 test cases | 5 test cases | ✓ | ✓ |
| 19 | Modal Xem trước & In ấn A4 | R4 | 5 test cases | 5 test cases | ✓ | ✓ |
| 20 | Tối ưu hóa Build & Lint | R4 | 5 test cases | 5 test cases | ✓ | ✓ |

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Expected Outcome |
|---|----------|--------------------|------------------|
| S1 | Hộ xã viên Tân Tiến nộp hồ sơ mới cho Ớt chuông Sweet Palermo | F1, F4, F7, F10, F15 | Hồ sơ tạo thành công, tự động điền thông tin HTX, khởi tạo 11 chỉ tiêu |
| S2 | Nông dân dùng tính năng Gợi ý Thông minh dựa trên VietGAP & Nhật ký PHI | F5, F6, F10, F11, F16 | Điểm gợi ý được áp dụng chuẩn xác, % hoàn thành cập nhật thời gian thực |
| S3 | Nông dân tự điều chỉnh điểm thủ công và nạp minh chứng PDF mới | F10, F11, F12, F13, F18 | SHA-256 hash tính chuẩn xác, trạng thái chuyển từ Vàng sang Xanh |
| S4 | Cập nhật phiên bản mới của Giấy chứng nhận VietGAP (v1.0 -> v1.1) | F12, F13, F14 | Bản cũ chuyển sang ARCHIVED, giữ nguyên lịch sử, hash mới cập nhật |
| S5 | Xem trước và In ấn Biểu mẫu 01, 02, 03 chuẩn A4 gửi Hội đồng thẩm định | F7, F8, F9, F19 | Hiển thị đầy đủ quốc hiệu, tiêu ngữ, chữ ký, bảng 100đ, không vỡ layout |
| S6 | Kiểm tra khống chế sao khi thiếu VietGAP hoặc điểm PHI vi phạm | F3, F10 | Hạ bậc xếp hạng sao tự động hoặc chặn submit khi vi phạm điều kiện cứng |

## Verification Execution Plan
1. **Tier 1 - Feature Unit/Integration Tests**: Verify each seeder, service, endpoint, and component in isolation.
2. **Tier 2 - Boundary Checks**: Total score != 100, invalid hash, oversized uploads, missing mandatory criteria.
3. **Tier 3 - Interaction Testing**: Suggestion -> Apply -> Score Recompute -> Star Forecast -> Evidence Link -> Submit Check.
4. **Tier 4 - End-to-End User Workflows**: Complete farmer dossier preparation, print preview, and submission.
5. **Tier 5 - Adversarial Coverage Hardening**: White-box coverage analysis and adversarial edge case stress testing.
