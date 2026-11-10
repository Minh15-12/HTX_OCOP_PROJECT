## 2026-11-02T16:15:37Z
You are Explorer 3 (Live Persona Data Entry Simulation & Database Integrity Verification) for Milestone 4 (Phân hệ 1: Quản trị HTX & Xã viên).

Your working directory is:
f:/HTX_OCOP_PROJECT/.agents/teamwork/explorer_m4_persona

Mandatory Reference:
Read f:/HTX_OCOP_PROJECT/.agents/teamwork/ORIGINAL_REQUEST.md (especially section ## 2026-11-02T16:11:34Z) before doing anything. Also adhere strictly to f:/HTX_OCOP_PROJECT/AGENT.md, f:/HTX_OCOP_PROJECT/GEMINI.md, and docs/00_RULES_REGISTER.md.

Mission Focus:
1. R3: Đóng vai trò người dùng nhập liệu thực tế & Đối chiếu Database (Live Persona Data Entry & DB Integrity Check).
   - Đóng vai trò 3 personas:
     - Persona A: Nông dân / Xã viên lớn tuổi (thao tác đăng ký tham gia HTX, xem vốn góp, biểu quyết)
     - Persona B: Kế toán HTX (nhập sổ vốn góp, lập kế hoạch phân phối thặng dư, đối soát)
     - Persona C: Chủ tịch / Cán bộ quản lý HTX (cập nhật hồ sơ pháp lý, tổ chức đại hội thành viên, ban hành nghị quyết)
   - Kiểm thử thực tế ít nhất 3 kịch bản cho mỗi nghiệp vụ trong Phân hệ 1:
     * Kịch bản 1: Thành công (Positive data entry flow).
     * Kịch bản 2: Thiếu dữ liệu bắt buộc / Sai định dạng (Missing fields, invalid format validation, toast alert).
     * Kịch bản 3: Vi phạm ràng buộc biên nghiệp vụ (Business constraint failure: vốn góp vượt trần 30% Luật HTX 2023, tỷ lệ trích quỹ < 20%, trùng lặp CCCD/Mã xã viên, quyền hạn trái phép).
   - Trực tiếp kiểm chứng CSDL PostgreSQL thực tế:
     * Kiểm tra migrations, seeders, schema các bảng: cooperatives, members, cooperative_members, charter_capitals, general_assemblies, resolutions, surplus_distributions, audit_events.
     * Kiểm chứng ràng buộc khóa ngoại, cơ chế cô lập đa người thuê (cooperative_id), trạng thái soft-delete (status = 'TERMINATED', cấm hard delete), tính toán số dư và chuỗi audit hash SHA-256.
     * Chạy hoặc kiểm tra các test suite liên quan (ví dụ: php artisan test --filter=Member hoặc Cooperative) và báo cáo chi tiết kết quả.

Output Requirements:
- Write your complete empirical findings with queries, commands, and results to f:/HTX_OCOP_PROJECT/.agents/teamwork/explorer_m4_persona/handoff.md.
- Send a message to the orchestrator when completed with a summary and link to your handoff file.
