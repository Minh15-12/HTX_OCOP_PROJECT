# Milestone 4 Orchestrator Context

## Objective
Thực hiện vòng lặp đánh giá toàn diện giao diện và trải nghiệm người dùng (UI/UX) cho Hệ thống Quản lý HTX-OCOP theo chu trình cuốn chiếu từng phân hệ nghiệp vụ (bắt đầu từ Phân hệ 1: Quản trị HTX & Xã viên); rà soát chỉ rõ các chức năng và component trùng lặp, nhận xét các tab/màn hình xem chi tiết (Detail Drawer/Modal) đang nhồi nhét thông tin dư thừa; đóng vai trò người dùng thực tế nhập liệu để kiểm thử validation khi thiếu dữ liệu, kiểm chứng tính toàn vẹn trong Database và đánh giá bố cục chuẩn hóa dành cho người nông dân/xã viên không rành công nghệ.

## Reference Documents
- `ORIGINAL_REQUEST.md`: `f:/HTX_OCOP_PROJECT/.agents/teamwork/ORIGINAL_REQUEST.md` (Check section `## 2026-11-02T16:11:34Z`)
- Project Rules: `AGENT.md`, `GEMINI.md`, `docs/00_RULES_REGISTER.md`
- Architecture & Database: `docs/BAO_CAO_DANH_GIA_VA_THIET_KE_KIEN_TRUC_HTX_OCOP.md`, `docs/10_DOMAIN_MODEL.md`, `docs/11_DATABASE_DESIGN.md`, `docs/06_BUSINESS_RULES.md`

## Key Requirements to Execute
- **R1: Duplicate & Detail Bloat Audit**: Detect duplicate components/modals/drawers/buttons and review all detail drawers/modals for unnecessary bloat vs essential fields.
- **R2: Iterative Module-by-Module Audit (Module 1 Focus)**: Full 6-step deep dive on Cooperative & Member Governance (Legal dossier, Members, General Assembly voting, Charter capital ledger, Surplus distribution). List BE routes/controllers/validation + FE pages/tables/drawers/modals, CRUD completeness & location, data flow mechanisms.
- **R3: Live Persona Data Entry & DB Integrity Check**: Real persona simulation (farmer, accountant, officer) testing positive flow, missing required data validation, business constraint failures, and PostgreSQL DB state verification (soft-delete, balances, SHA-256 audit logs).
- **R4: Agricultural UX & Layout Polish**: Layout optimization for non-tech-savvy farmers/cooperative staff, eliminating cluttered elements, proposing actionable UI improvements.

## Deliverable
- Comprehensive report file (e.g. `docs/BAO_CAO_DANH_GIA_UIUX_VA_CSDL_PHAN_HE_1_QUAN_TRI_HTX.md` or similar well-structured document) meeting 100% of the acceptance criteria.
- Complete execution record in `progress.md` and `handoff.md`.
