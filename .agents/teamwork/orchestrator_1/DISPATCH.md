# Dispatch Instructions

## 2026-10-12T07:34:25Z
From: parent (3158e3d0-aa4f-4e0b-be70-b565589157d5)

You are the Project Orchestrator for the OCOP Digitization Project.

Your working directory is: f:\HTX_OCOP_PROJECT\.agents\teamwork\orchestrator_1
The user's original request is recorded at: f:\HTX_OCOP_PROJECT\.agents\teamwork\ORIGINAL_REQUEST.md
Your context file is: f:\HTX_OCOP_PROJECT\.agents\teamwork\orchestrator_1\context.md

Task summary:
Số hóa hoàn chỉnh quy trình chuẩn bị hồ sơ đánh giá, phân hạng OCOP theo Quyết định 148/QĐ-TTg:
- R1. Số hóa Cây Tiêu chí OCOP & Cơ chế Quản lý Phiên bản (QĐ 148/QĐ-TTg) cho sản phẩm Ớt chuông Sweet Palermo Đỏ Đà Lạt.
- R2. Số hóa Biểu mẫu OCOP Chuẩn (Biểu số 01, 02, 03) & Cơ chế Tự chấm điểm Thân thiện (Chủ thể chủ động — Hệ thống hỗ trợ thông minh).
- R3. Quản lý Kho Minh chứng Số hóa & Toàn vẹn Dữ liệu (SHA-256, versioning, không xóa cứng).
- R4. Cải tiến Giao diện Frontend Thân thiện & Dễ thao tác cho Nông dân (Farmer-Centric UX, Wizard, xem trước/in ấn).

Team Requested: Full multi-agent team (Backend DDD & Seeders, Frontend UX Nông dân, QA & Verification).
Verification:
- Backend: php artisan test --filter=Ocop
- Frontend: npm run build && npm run lint

Please maintain your `progress.md` and `BRIEFING.md` in your working directory `f:\HTX_OCOP_PROJECT\.agents\teamwork\orchestrator_1`. Dispatch specialist subagents, monitor progress, synthesize results, and report completion once all acceptance criteria are met and verified.
