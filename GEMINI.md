# QUY TẮC BẮT BUỘC CHO AI AGENT — DỰ ÁN HTX-OCOP
> **Áp dụng cho mọi phiên làm việc, trả lời câu hỏi và thực thi mã nguồn.**

---

## 1. NGUYÊN TẮC TỐI THƯỢNG: ĐỌC TÀI LIỆU KIM CHỈ NAM TRƯỚC KHI TRẢ LỜI HOẶC VIẾT CODE
Mỗi khi người dùng đặt câu hỏi, giao nhiệm vụ, phân tích lỗi hoặc yêu cầu viết code mới/sửa code:
1. **BẮT BUỘC ĐỌC VÀ ĐỐI CHIẾU:**
   - [`AGENT.md`](file:///f:/HTX_OCOP_PROJECT/AGENT.md): Hướng dẫn kiến trúc, quy chuẩn công nghệ, ma trận phân quyền, 9 modules DDD, FSM, và các quy tắc cốt lõi.
   - [`docs/00_RULES_REGISTER.md`](file:///f:/HTX_OCOP_PROJECT/docs/00_RULES_REGISTER.md): Sổ đăng ký quy tắc tập trung, nguồn căn cứ pháp lý, văn bản sửa đổi và tình trạng xác minh.
   - [`README.md`](file:///f:/HTX_OCOP_PROJECT/README.md): Tầm nhìn đề tài, mục tiêu, kết quả bàn giao, tài khoản mẫu và các endpoint API chuẩn.
   - Các tài liệu SRS, Business Rules (`docs/06_BUSINESS_RULES.md`), Database Design (`docs/11`), API Architecture (`docs/12-13`), quy trình chuyên sâu (`docs/30–35` và `docs/36–38`) liên quan trực tiếp đến module đang sửa.
2. **THEO DÕI VĂN BẢN PHÁP LÝ GỐC VÀ SỬA ĐỔI:**
   - **Luật Hợp tác xã số 17/2023/QH15:** Có hiệu lực thi hành từ ngày **01/07/2024**.
   - **Đánh giá OCOP:** Theo dõi đồng thời **Quyết định 148/QĐ-TTg** (24/02/2023) và văn bản sửa đổi, bổ sung **Quyết định 1489/QĐ-TTg** (06/07/2025) về tiêu chí, quy trình, thẩm quyền và cấp đánh giá.
   - **Truy xuất nguồn gốc & Nhật ký canh tác:** Căn cứ theo **TCVN 12850:2019**, **Thông tư 17/2021/TT-BNNPTNT** và tiêu chuẩn **VietGAP TCVN 11892-1:2017** *(Tuyệt đối không nhầm lẫn hoặc viện dẫn Thông tư 02/2024/TT-BNNPTNT vốn quy định về phòng chống tham nhũng/thời hạn người thôi chức vụ quản lý)*.
3. **KHÔNG ĐƯỢC SUY ĐOÁN HAY TỰ PHÁT MINH NGHIỆP VỤ:**
   - Mọi thực thể, trường dữ liệu, enum trạng thái và công thức tính toán phải khớp với tài liệu đặc tả.
   - Nếu tài liệu mâu thuẫn hoặc thiếu căn cứ, phải ghi nhận nội dung mâu thuẫn và yêu cầu xác minh thay vì tự ý chọn một phương án.
   - Phân biệt rạch ròi giữa quy định pháp luật và quy chế nội bộ HTX (ví dụ: phí dịch vụ 2-3%, quy cách cảm quan độ ngọt Brix, trần tín dụng là quy chế HTX, không gắn nhãn "theo luật").

---

## 2. NGUYÊN TẮC TOÀN VẸN DỮ LIỆU: CẤM "SILENT MOCKING" TẠI RUNTIME
1. **Không sử dụng dữ liệu giả lập đè lên dữ liệu thật ở môi trường chạy ứng dụng:**
   - Tuyệt đối không dùng các toán tử fallback che giấu dữ liệu như `members.length || 24`, `|| 31`, `mockMembersList` trong mã nguồn ứng dụng (production/staging).
   - Nếu cơ sở dữ liệu thật có 11 xã viên, hệ thống phải hiển thị chính xác 11 xã viên.
   - *Cho phép mock có chủ đích trong unit test, integration test hoặc Storybook cô lập.*
2. **Xử lý trung thực trạng thái dữ liệu (Truthful Data States):**
   - Khi API đang tải: Hiển thị Loading Skeleton.
   - Khi API trả về mảng rỗng `[]`: Hiển thị Empty State với hướng dẫn thao tác, không chèn mock data.
   - Khi API lỗi: Hiển thị Error Alert / Toast có mã lỗi cụ thể, không nuốt lỗi âm thầm.

---

## 3. NGUYÊN TẮC KIẾN TRÚC FRONTEND & CLEAN CODE
1. **Bóc tách theo Đơn trách nhiệm (Single Responsibility):**
   - Mốc 400 dòng là ngưỡng cảnh báo cần xem xét tách nhỏ, không coi số dòng là tiêu chí chất lượng duy nhất; ưu tiên tách theo trách nhiệm, khả năng kiểm thử và mức độ kết dính (cohesion).
   - Khuyến nghị cấu trúc:
     - `hooks/use[Feature]Data.ts`: Quản lý truy vấn React Query, filter và mutations.
     - `components/[Feature]Table.tsx`: Hiển thị bảng dữ liệu.
     - `components/[Feature]Modal.tsx`: Hộp thoại biểu mẫu.
     - `components/[Feature]Drawer.tsx`: Ngăn kéo xem chi tiết.
2. **Không tạo tính năng "ma" & Kiểm soát trạng thái hành động (Action Completeness):**
   - Không vẽ nút bấm, thanh tìm kiếm, bộ lọc nếu không có hàm xử lý sự kiện hoặc endpoint backend tương ứng.
   - Mọi nút bấm/hành động phải có:
     - Trạng thái đang xử lý (`loading` / `disabled` / debounce chống click lặp).
     - Thông báo phản hồi kết quả (Success/Error Toast).
     - Kiểm soát phân quyền (RBAC) ẩn/vô hiệu hóa nếu người dùng không đủ quyền.
3. **Đồng bộ ngữ cảnh HTX động (Tenant Context Consistency):**
   - Không hardcode tên HTX trong code (như "HTX Tân Tiến" hay "HTX Phú Thịnh").
   - Luôn sử dụng tên HTX từ `useTenantContextStore` hoặc hồ sơ HTX người dùng đang đăng nhập.
4. **Đa phương thức In/Xuất chứng từ cho mọi thiết bị (Device-Agnostic Printing & Exporting):**
   - Khi thiết kế bất kỳ chức năng in ấn hoặc xuất biểu mẫu, chứng từ (Mẫu 02-VT, sổ sách kế toán, báo cáo OCOP, hợp đồng bao tiêu, v.v.), bắt buộc phải tính đến trường hợp người dùng sử dụng thiết bị khác không có máy in (laptop cá nhân, máy tính bảng, điện thoại).
   - Tuyệt đối cấm chỉ cung cấp duy nhất nút in trình duyệt `window.print()`. Bắt buộc phải cung cấp đủ các phương án:
     - **In trực tiếp (Print Preview / `window.print()`)**: Dành cho máy tính kết nối trực tiếp máy in văn phòng.
     - **Tải file PDF (.pdf)**: Dành cho người dùng laptop/di động lưu trữ ngoại tuyến, ký số hoặc gửi qua Zalo/Email.
     - **Tải file Excel / CSV (.xlsx / .csv)**: Dành cho kế toán, cán bộ HTX tải về laptop để đối soát, tính toán số liệu.
5. **Toàn vẹn hiển thị văn bản dài & Chống cắt cụt dấu ba chấm (`...`) trên chứng từ (Long Text & Anti-Truncation Resilience):**
   - Dữ liệu HTX và nông nghiệp có nhiều trường văn bản rất dài (tên vật tư kèm hoạt chất/nồng độ, tên xã viên kèm mã số, địa chỉ thôn xóm chi tiết, nhật ký ghi chú canh tác, số tiền lớn).
   - Tuyệt đối cấm dùng các class cắt cụt như `truncate`, `overflow-hidden`, `text-ellipsis` trên các biểu mẫu in, chứng từ kế toán, phiếu xuất kho hoặc modal xem trước chứng từ khiến người dùng hoặc cơ quan thanh tra không đọc được đầy đủ dữ liệu.
   - Bắt buộc áp dụng: `break-words`, `whitespace-normal`, cấu hình độ rộng cột tối thiểu (`min-w-[...]`) và co giãn theo nội dung; kiểm soát `@media print` ngắt trang an toàn (`break-inside-avoid`, `page-break-inside: avoid`, lặp lại `thead` qua các trang in `display: table-header-group`).

---

## 4. NGUYÊN TẮC KIẾN TRÚC BACKEND, TOÀN VẸN & BẢO MẬT
1. **Tuân thủ Modular Monolith 4 Lớp & Ranh giới Phụ thuộc:**
   - Domain $\rightarrow$ Application $\rightarrow$ Infrastructure $\rightarrow$ Presentation.
   - Controller chỉ tiếp nhận request, validate qua Form Request, gọi Application Service và trả API Resource / DTO; cấm Controller truy vấn nghiệp vụ/Eloquent trực tiếp hoặc trả Eloquent Model tùy tiện.
2. **Cô lập Đa người thuê (Tenant Isolation) Toàn diện:**
   - Phải kiểm soát tại lớp truy cập dữ liệu (Eloquent Global Scope, Repository), Policy/Service, các truy vấn quan hệ (`with`, `whereHas`), xử lý tác vụ nền (Queue Jobs) và xuất báo cáo (Export).
   - Tenant phải được xác thực từ Auth context hệ thống, không phụ thuộc vào `cooperative_id` do client tự gửi.
3. **Bảo mật Audit Trail & Hash Chaining SHA-256:**
   - Hash chain SHA-256 là biện pháp phát hiện sai lệch (tamper-evident), không tự bảo đảm bất biến nếu tài khoản có quyền sửa database.
   - Bắt buộc: Ghi audit log trong database transaction của nghiệp vụ; phân quyền nghiêm ngặt ở mức DB; kiểm tra phát hiện đứt gãy chuỗi và kiểm thử với các thao tác đồng thời.
4. **Bảo toàn dữ liệu lịch sử:**
   - Xã viên nghỉ việc: Dùng Soft Delete (`status = 'TERMINATED'`), tuyệt đối không xóa cứng (Hard Delete).
   - Hồ sơ OCOP đã nộp (`SUBMITTED`): Khóa chỉ đọc (Read-only), chỉ vai trò có thẩm quyền pháp lý (`HTX_OWNER`, `SYSTEM_ADMIN`) mới được nộp.

---

## 5. BA NGUYÊN TẮC BẮT BUỘC ĐẶC BIỆT KHI TRIỂN KHAI

### NGUYÊN TẮC A: CÔ LẬP TENANT TOÀN DIỆN — KHÔNG CHỈ KIỂM TRA Ở CONTROLLER
1. Đối với hệ thống HTX đa người thuê, chỉ kiểm tra `cooperative_id` ở Controller là chưa đủ và tiềm ẩn nguy cơ rò rỉ dữ liệu của HTX khác qua API, báo cáo, file xuất, job nền hoặc quan hệ dữ liệu.
2. Điều kiện tenant phải được kiểm soát xuyên suốt mọi luồng xử lý:
   - **Tầng Data Access:** Sử dụng Eloquent Global Scope hoặc Repository binding cứng `cooperative_id`.
   - **Truy vấn quan hệ:** Kiểm soát chặt chẽ các truy vấn `with`, `whereHas`, nested joins, không để sót quan hệ chéo tenant.
   - **Tác vụ nền & Hàng đợi (Queue Jobs):** Mọi Job xử lý nền phải mang theo và xác thực tenant context, không chạy job ở trạng thái toàn cục.
   - **Báo cáo & Xuất file:** File Excel/PDF export phải kiểm tra phạm vi tenant của tài khoản thực hiện.
3. Không chỉ tìm kiếm chuỗi `cooperative_id` trong mã nguồn; phải kiểm thử thâm nhập bằng cách thử dùng ID tài nguyên thuộc HTX khác để chứng minh cô lập thành công.

### NGUYÊN TẮC B: KIỂM CHỨNG TOÀN VẸN NGHIỆP VỤ & DỮ LIỆU — KHÔNG COI TEST THÀNH CÔNG LÀ BẰNG CHỨNG DUY NHẤT
1. Một API có thể trả về HTTP 200 hoặc một bài test báo xanh nhưng vẫn có thể ghi sai sổ quỹ, trừ kho hai lần, sai lệch công nợ hoặc cho phép người dùng không đủ quyền duyệt phiếu.
2. Agent bắt buộc phải kiểm tra cả kết quả nghiệp vụ và trạng thái dữ liệu thực tế sau khi thực hiện:
   - **Trạng thái CSDL sau thao tác:** Số dư sổ quỹ (`Cashbook`), biến động công nợ (`Receivable`), và số lượng tồn kho (`StockBalance`).
   - **Chống trừ kho / ghi sổ hai lần:** Kiểm tra tính lũy kế, idempotency và cơ chế khóa dòng (`lockForUpdate`), không để xảy ra race condition khi thao tác đồng thời.
   - **Phân tách trách nhiệm (Separation of Duties):** Đảm bảo vai trò không đủ quyền không thể duyệt phiếu dù gửi payload hợp lệ.
   - **Toàn vẹn chuỗi kiểm toán:** Mọi thay đổi trạng thái tài chính hoặc điểm OCOP phải sinh đúng sự kiện audit log với hash SHA-256 liền mạch.

### NGUYÊN TẮC C: THAY ĐỔI PHẪU THUẬT, THU HẸP BÁN KÍNH TÁC ĐỘNG — CẤM REFACTOR TOÀN BỘ DỰ ÁN KHI CHỈ CẦN SỬA MỘT CHỨC NĂNG
1. Khi được giao sửa một lỗi hoặc thêm một tính năng cụ thể:
   - Tuyệt đối **không refactor toàn bộ dự án** hoặc tự ý viết lại các module backend đã vận hành ổn định.
   - Ưu tiên thay đổi nhỏ nhất có thể (Surgical Change), tập trung đúng nguyên nhân gốc, giảm thiểu tối đa bán kính ảnh hưởng (Blast Radius).
   - Đảm bảo mã nguồn thay đổi có thể kiểm thử độc lập, có thể xem xét lại (reviewable) và dễ dàng hoàn tác (rollbackable).
2. Đây là nguyên tắc sống còn để giảm rủi ro phá hỏng những phần backend đã hoạt động trong khi tiếp tục hoàn thiện và tích hợp frontend.

---

# TRỤ CỘT IV: QUY TẮC KỸ THUẬT LẬP TRÌNH BẮT BUỘC CHO AI CODING AGENT

Phạm vi: Backend Laravel, frontend React/TypeScript (nếu phù hợp với stack thực tế), PostgreSQL, API, kiểm thử, bảo mật và tích hợp hệ thống HTX/OCOP.

## 1. Nguyên tắc ưu tiên và xử lý xung đột

1. Không sửa mã nguồn trước khi đọc hướng dẫn Agent, kiến trúc, SRS, business rules, database design, API specification và các tệp liên quan đến chức năng cần thực hiện.
2. Thứ tự ưu tiên khi đối chiếu:
   - Pháp luật và tiêu chuẩn chính thức đã được xác minh, còn áp dụng.
   - Yêu cầu nghiệp vụ đã được chủ dự án phê duyệt.
   - SRS, business rules và các đặc tả hệ thống đã thống nhất.
   - Kiến trúc và quy ước kỹ thuật của repository.
   - Đề xuất tối ưu của Agent.
3. Nếu hai nguồn mâu thuẫn, không tự ý chọn một nguồn rồi triển khai. Ghi nhận nội dung mâu thuẫn, tác động, nguồn liên quan và phương án đề xuất.
4. Không được tự phát minh công thức tài chính, quy tắc phân quyền, trường dữ liệu, enum, endpoint hoặc quy trình pháp lý.
5. Mọi giả định chưa được xác nhận phải được ghi rõ là giả định, không được trình bày như yêu cầu đã phê duyệt.

## 2. Quy tắc kiểm tra repository trước khi thay đổi

1. Kiểm tra cấu trúc thư mục, stack, phiên bản framework, package, route, migration, model, service, controller, test và các thay đổi Git hiện có.
2. Tái sử dụng kiến trúc và thành phần hiện có nếu chúng đáp ứng yêu cầu. Không tạo module, service hoặc component trùng chức năng.
3. Trước khi sửa, xác định:
   - Vấn đề thực tế.
   - Nguyên nhân gốc.
   - Các thành phần phụ thuộc.
   - Những chức năng có thể bị ảnh hưởng.
   - Cách kiểm chứng sau sửa.
4. Không ghi đè hoặc xóa thay đổi của người dùng, không tự ý khôi phục file về phiên bản cũ.
5. Không xóa mã nguồn chỉ vì chưa được sử dụng trực tiếp mà chưa kiểm tra các tham chiếu, route, job, test và luồng nghiệp vụ phụ thuộc.

## 3. Quy tắc kiến trúc và tổ chức mã nguồn

1. Tuân thủ kiến trúc hiện có; với backend áp dụng ranh giới Domain, Application, Infrastructure và Presentation theo tài liệu dự án.
2. Controller chỉ tiếp nhận yêu cầu, kiểm tra đầu vào thông qua cơ chế phù hợp, điều phối nghiệp vụ và trả response. Không đặt công thức nghiệp vụ phức tạp trực tiếp trong Controller.
3. Không để frontend truy cập cơ sở dữ liệu hoặc gọi trực tiếp các thành phần nội bộ của backend.
4. Không để Domain phụ thuộc vào Controller, HTTP Request, Eloquent hoặc thành phần giao diện.
5. Mỗi module cần có ranh giới trách nhiệm rõ ràng. Chỉ tạo interface, repository, service hoặc abstraction khi có giá trị thực tế; tránh tạo quá nhiều lớp trung gian không cần thiết.
6. Không tạo tệp/component quá lớn một cách không kiểm soát. Mốc 400 dòng là ngưỡng cần xem xét tách nhỏ, không phải lý do để chia mã một cách máy móc.
7. Tránh copy-paste nghiệp vụ. Logic dùng chung phải có một nguồn triển khai đáng tin cậy.
8. Không sử dụng biến toàn cục, singleton có trạng thái thay đổi hoặc side effect ẩn nếu không có lý do kiến trúc rõ ràng.

## 4. Quy tắc thiết kế API và hợp đồng dữ liệu

1. Mọi endpoint phải có mục đích, quyền truy cập, phương thức HTTP, định dạng request/response và quy tắc lỗi rõ ràng.
2. Backend là nguồn xác thực cuối cùng đối với dữ liệu nghiệp vụ. Validation ở frontend chỉ hỗ trợ trải nghiệm người dùng.
3. Dùng Form Request hoặc cơ chế validation tương đương; không chỉ kiểm tra dữ liệu bằng điều kiện thủ công rải rác trong Controller.
4. Không trả trực tiếp toàn bộ Eloquent Model hoặc các trường nội bộ không được phép công khai. Dùng API Resource hoặc DTO theo kiến trúc dự án.
5. Chuẩn hóa cấu trúc response, phân trang, bộ lọc, sắp xếp và định dạng lỗi theo API contract.
6. Mã HTTP phải phù hợp với kết quả xử lý. Lỗi validation, authentication, authorization, tài nguyên không tồn tại và xung đột nghiệp vụ phải phân biệt được.
7. Không nuốt exception hoặc trả thành công giả khi nghiệp vụ thất bại.
8. Không tự ý đổi tên field, enum, cấu trúc response hoặc URL endpoint mà không cập nhật tài liệu, frontend và test liên quan.
9. Với endpoint có thể được gọi lại nhiều lần, đặc biệt là thanh toán, quyết toán, nhập/xuất kho và phân phối lợi nhuận, phải xem xét idempotency hoặc cơ chế chống xử lý trùng phù hợp.
10. Không sử dụng HTTP GET để thay đổi trạng thái dữ liệu.

## 5. Quy tắc cơ sở dữ liệu và tính toàn vẹn

1. Mọi bảng nghiệp vụ đa HTX phải có cơ chế xác định tenant rõ ràng theo thiết kế; mọi truy vấn đọc, ghi, cập nhật, xóa mềm, export và xử lý nền phải được kiểm tra tenant.
2. Không chỉ dựa vào `cooperative_id` do client gửi. Tenant phải được xác định và xác thực từ ngữ cảnh đăng nhập hoặc cơ chế được hệ thống tin cậy.
3. Sử dụng foreign key, unique constraint, check constraint và index khi phù hợp để bảo vệ tính toàn vẹn tại cơ sở dữ liệu.
4. Không dùng dữ liệu đầu vào chưa được kiểm tra làm căn cứ cho các phép tính tài chính hoặc thay đổi tồn kho.
5. Dùng transaction cho nghiệp vụ nhiều bước cần bảo đảm tất cả thành công hoặc tất cả thất bại.
6. Kiểm soát tranh chấp khi nhiều người cùng duyệt phiếu, cập nhật tồn kho, chốt mùa vụ hoặc thực hiện phân phối lợi nhuận. Sử dụng khóa, điều kiện cập nhật hoặc cơ chế đồng bộ phù hợp.
7. Không giả định rằng kiểm tra tồn kho trước khi ghi là đủ để ngăn tồn kho âm trong môi trường đồng thời.
8. Migration phải có khả năng triển khai có kiểm soát, tránh làm mất dữ liệu. Với thay đổi phá vỡ tương thích, ưu tiên chiến lược mở rộng rồi chuyển đổi rồi mới loại bỏ.
9. Không sửa migration đã chạy ở môi trường có dữ liệu để âm thầm thay đổi lịch sử. Tạo migration mới trừ khi môi trường và quy trình dự án cho phép rõ ràng.
10. Không chạy lệnh xóa dữ liệu, reset database hoặc seed ghi đè dữ liệu thật nếu chưa được cho phép rõ ràng.
11. Lưu thời gian theo quy ước thống nhất của hệ thống; xử lý múi giờ khi hiển thị và khi tính ngày nghiệp vụ.
12. Sử dụng kiểu dữ liệu chính xác cho tiền tệ và số lượng. Không dùng số thực nhị phân để thực hiện phép tính tiền cần độ chính xác kế toán.

## 6. Quy tắc bảo mật và phân quyền

1. Mọi endpoint phải xác thực người dùng và kiểm tra quyền trên tài nguyên cụ thể.
2. Không được xem việc ẩn nút trên frontend là biện pháp phân quyền.
3. Kiểm thử truy cập chéo tenant bằng cách thử dùng ID của tài nguyên thuộc HTX khác.
4. Không tin tưởng ID, role, tenant ID, giá tiền, điểm đánh giá hoặc trạng thái phê duyệt do client tự gửi.
5. Không lưu mật khẩu dạng văn bản thuần, token bí mật hoặc thông tin xác thực trong mã nguồn.
6. Không ghi mật khẩu, token, thông tin nhạy cảm hoặc toàn bộ dữ liệu cá nhân vào log.
7. Kiểm tra upload file: loại nội dung, kích thước, quyền truy cập, tên lưu trữ và đường dẫn. Không chỉ dựa vào phần mở rộng của file.
8. Không cho phép truy cập file minh chứng riêng tư chỉ bằng cách biết URL hoặc tên file.
9. Chống mass assignment, SQL injection, XSS, CSRF và các rủi ro phù hợp với phương thức xác thực, framework và kiến trúc thực tế.
10. Không cho phép người tạo tự duyệt giao dịch nếu quy tắc phân tách trách nhiệm yêu cầu người duyệt độc lập.
11. Mọi thay đổi quyền, trạng thái tài chính, điểm OCOP và khóa sổ phải có kiểm soát quyền và audit trail thích hợp.
12. Không coi việc sử dụng SHA-256 hoặc hash chain là đủ để bảo đảm audit log bất biến nếu tài khoản có quyền vẫn có thể sửa hoặc xóa dữ liệu gốc.

## 7. Quy tắc nghiệp vụ và giao dịch tài chính

1. Công thức nghiệp vụ phải được triển khai tại một vị trí thống nhất và có test độc lập.
2. Không tính cùng một chỉ số theo những công thức khác nhau giữa API, báo cáo và giao diện.
3. Các giao dịch đã duyệt, đã thanh toán hoặc đã chốt phải tuân theo quy tắc sửa đổi được phê duyệt; không tùy tiện cập nhật hoặc xóa trực tiếp.
4. Nếu cần sửa giao dịch tài chính đã ghi nhận, phải sử dụng cơ chế đảo bút toán hoặc quy trình điều chỉnh đã được xác định trong nghiệp vụ.
5. Khi một quy trình có nhiều bước, phải bảo đảm dữ liệu liên quan được cập nhật đồng bộ trong transaction.
6. Kiểm tra giới hạn số tiền, tổng phân bổ, tồn kho, ngày tháng, trạng thái và điều kiện chuyển trạng thái ở backend.
7. Không tự động làm tròn hoặc cắt bỏ phần dư tiền mà không tuân thủ quy tắc làm tròn đã được phê duyệt.
8. Tách biệt dữ liệu gốc, dữ liệu tổng hợp, số liệu báo cáo và dữ liệu cache. Không dùng dữ liệu tổng hợp làm nguồn ghi ngược vào sổ nghiệp vụ nếu không có quy trình rõ ràng.

## 8. Quy tắc kiểm thử bắt buộc

1. Mỗi chức năng mới hoặc lỗi được sửa phải có kiểm thử phù hợp với mức độ rủi ro.
2. Kiểm thử tối thiểu gồm:
   - Trường hợp thành công.
   - Dữ liệu đầu vào không hợp lệ.
   - Chưa đăng nhập hoặc không đủ quyền.
   - Truy cập dữ liệu của tenant khác.
   - Tài nguyên không tồn tại.
   - Trạng thái nghiệp vụ không hợp lệ.
   - Lỗi transaction hoặc xử lý trùng nếu có liên quan.
3. Với công thức tài chính, PHI, chấm điểm OCOP, tồn kho và quyết toán, phải có test cho biên giá trị, trường hợp bằng ngưỡng và trường hợp vượt ngưỡng.
4. Test phải kiểm tra cả kết quả trả về lẫn tác động thực tế đến cơ sở dữ liệu.
5. Không xóa, vô hiệu hóa hoặc nới lỏng test chỉ để làm cho pipeline xanh.
6. Không sửa test để chấp nhận một hành vi sai nghiệp vụ mà chưa được phê duyệt.
7. Dùng factory và dữ liệu test riêng biệt; không phụ thuộc dữ liệu thật của người dùng.
8. Chạy các test liên quan trước, sau đó chạy toàn bộ test khả thi.
9. Phân biệt rõ test đã chạy, test chưa chạy, test bị lỗi môi trường và test thất bại do mã nguồn.

## 9. Quy tắc tích hợp frontend

1. Frontend phải sử dụng API thật của backend cho các nghiệp vụ đã được tích hợp.
2. Không giả lập việc lưu thành công nếu API chưa tồn tại hoặc yêu cầu thất bại.
3. Mỗi trang dữ liệu phải có trạng thái loading, empty, error và success phù hợp.
4. Form phải hiển thị lỗi validation từ backend tại trường tương ứng khi có thể.
5. Nút gửi biểu mẫu phải chống gửi lặp trong thời gian xử lý.
6. Các thao tác quan trọng như xóa mềm, duyệt phiếu, thanh toán và chốt mùa vụ cần xác nhận trước khi thực hiện.
7. Tìm kiếm, lọc, phân trang, xuất báo cáo và các nút hành động phải hoạt động thực sự; không tạo giao diện chỉ để minh họa rồi coi là hoàn thành.
8. Không hardcode tên HTX, người dùng, số liệu tổng quan hoặc quyền người dùng.
9. Kiểm tra trạng thái quyền, phiên đăng nhập hết hạn và lỗi mạng.
10. Không để lỗi API làm hỏng toàn bộ trang nếu có thể hiển thị lỗi tại khu vực chức năng bị ảnh hưởng.
11. Không lưu dữ liệu nhạy cảm vào local storage nếu không có đánh giá bảo mật và lý do cần thiết.
12. Đảm bảo giao diện có thể sử dụng trên màn hình nhỏ, bàn phím và các trạng thái dữ liệu khác nhau.
13. Khi làm tính năng in ấn, xuất biểu mẫu chứng từ (Mẫu 02-VT, phiếu thu chi, hợp đồng, báo cáo), bắt buộc thiết kế đa thiết bị: hỗ trợ song song in trực tiếp, xuất PDF và xuất Excel/CSV cho người dùng laptop/mobile không có máy in.
14. Trên các biểu mẫu chứng từ in ấn và bảng kê pháp lý, cấm dùng `truncate` cắt cụt văn bản thành `...`; bắt buộc cho phép xuống dòng (`break-words`, `whitespace-normal`) để bảo đảm hiển thị đầy đủ thông tin nông nghiệp/kế toán.

## 10. Quy tắc hiệu năng và chất lượng mã

1. Tránh N+1 query; sử dụng eager loading, pagination và truy vấn có chọn lọc khi phù hợp.
2. Không tải toàn bộ dữ liệu lớn lên frontend chỉ để phân trang ở trình duyệt nếu API có thể phân trang.
3. Không thêm index, cache hoặc queue theo cảm tính; xác định mục tiêu và kiểm chứng tác động.
4. Không cache dữ liệu theo cách có thể làm rò rỉ dữ liệu giữa các tenant.
5. Không thực hiện xử lý file lớn, xuất báo cáo nặng hoặc tác vụ dài trực tiếp trong request nếu kiến trúc hỗ trợ queue phù hợp.
6. Không thêm thư viện mới nếu chức năng có thể được giải quyết hợp lý bằng công cụ hiện có.
7. Khi thêm hoặc nâng cấp dependency, kiểm tra khả năng tương thích, bảo trì, giấy phép và rủi ro bảo mật.
8. Xóa import, biến và mã chết khi có căn cứ; không chạy các đợt refactor lớn không liên quan đến nhiệm vụ.
9. Tuân thủ formatter, linter, static analysis và coding standard đã được cấu hình trong repository.
10. Không tối ưu sớm bằng các abstraction phức tạp khi chưa có nhu cầu rõ ràng.

## 11. Quy tắc log, giám sát và xử lý lỗi

1. Lỗi phải có thông tin đủ để chẩn đoán nhưng không làm lộ dữ liệu nhạy cảm.
2. Phân biệt lỗi nghiệp vụ dự kiến với lỗi hệ thống không dự kiến.
3. Sử dụng mã lỗi ổn định cho các lỗi nghiệp vụ quan trọng; frontend không nên phải phân tích chuỗi thông báo tự do để quyết định hành vi.
4. Các tác vụ nền và thao tác nhiều bước cần có cơ chế ghi nhận trạng thái, lỗi và khả năng thử lại phù hợp.
5. Không tự động thử lại một thao tác tài chính không idempotent nếu có nguy cơ ghi nhận giao dịch hai lần.
6. Không bắt exception rồi bỏ qua mà không xử lý, ghi nhận hoặc truyền lỗi phù hợp.

## 12. Quy tắc quản lý tài liệu

1. Khi thay đổi API, cập nhật API specification và tài liệu tích hợp frontend.
2. Khi thay đổi bảng, field, enum hoặc quan hệ, cập nhật database design và data dictionary.
3. Khi thay đổi nghiệp vụ, cập nhật business rules, use cases hoặc tài liệu liên quan.
4. Khi thay đổi quyền, cập nhật role/permission matrix.
5. Khi có quy tắc pháp lý mới hoặc thay đổi, ghi rõ nguồn, điều khoản, ngày hiệu lực và phạm vi ảnh hưởng.
6. Không đánh dấu tài liệu là đã xác minh pháp lý nếu chưa đối chiếu nguồn đáng tin cậy.
7. Không để báo cáo cũ tiếp tục được sử dụng như trạng thái hiện tại sau khi mã nguồn đã thay đổi.

## 13. Quy trình làm việc của Agent

Với mỗi nhiệm vụ, Agent phải thực hiện theo trình tự:

Bước 1: Đọc tài liệu và kiểm tra repository hiện tại.

Bước 2: Xác định vấn đề, nguyên nhân gốc, phạm vi và các phụ thuộc.

Bước 3: Lập kế hoạch thay đổi nhỏ, có thứ tự và có cách kiểm chứng.

Bước 4: Triển khai theo từng module hoặc nhóm thay đổi có thể kiểm tra độc lập.

Bước 5: Chạy formatter, linter, static analysis và test phù hợp với stack thực tế.

Bước 6: Kiểm tra hồi quy, quyền truy cập, tenant isolation, dữ liệu và hợp đồng API.

Bước 7: Cập nhật tài liệu, báo cáo kết quả và liệt kê những điểm chưa giải quyết.

Agent không được tuyên bố hoàn thành chỉ vì đã tạo hoặc sửa file.

## 14. Tiêu chí hoàn thành nhiệm vụ

Một nhiệm vụ chỉ được đánh dấu DONE khi:

- Yêu cầu đã được đối chiếu với tài liệu liên quan.
- Mã nguồn đã được triển khai trong phạm vi cho phép.
- Không còn lỗi đã biết thuộc phạm vi nhiệm vụ mà chưa được nêu rõ.
- Test phù hợp đã chạy và có kết quả thực tế.
- Các hợp đồng API, database và frontend liên quan đã được cập nhật.
- Quyền truy cập và tenant isolation đã được kiểm tra khi liên quan.
- Không có dữ liệu giả mạo kết quả hoặc chức năng chỉ hoạt động trên giao diện.
- Có báo cáo tóm tắt file thay đổi, test đã chạy, kết quả, hạn chế và công việc còn lại.

Nếu một điều kiện chưa đạt, phải đánh dấu PARTIAL hoặc BLOCKED và nêu lý do cụ thể; không được báo cáo DONE.

## 15. Quy tắc cuối cùng

Bảo toàn dữ liệu, tính đúng đắn nghiệp vụ, bảo mật và khả năng kiểm chứng quan trọng hơn tốc độ tạo mã.

Khi thiếu thông tin, ưu tiên điều tra và nêu rõ điểm chưa chắc chắn. Khi có nhiều phương án, chọn phương án ít rủi ro nhất, phù hợp kiến trúc hiện tại và có thể kiểm thử. Không được tự ý mở rộng phạm vi hoặc thay đổi công nghệ chỉ vì sở thích của Agent.

## 16. Quy tắc quản lý phạm vi chức năng HTX-OCOP (Scope Boundary Guardrail)

1. Hệ thống phần mềm được thiết kế dành cho **Chủ thể OCOP (Hợp tác xã)** nhằm chuẩn bị, số hóa hồ sơ và tự đánh giá theo **Quyết định 148/QĐ-TTg** và **Quyết định 1489/QĐ-TTg**.
2. **3 chức năng sau nằm ngoài phạm vi cốt lõi và mặc định bị ẨN khỏi thanh điều hướng:**
   - **Đại hội & Biểu quyết** (`/meetings`): Nghiệp vụ quản trị nội bộ chuyên sâu của HTX, không thuộc chuỗi tạo lập hồ sơ minh chứng OCOP.
   - **Hội đồng thẩm định** (`/ocop/evaluation`): Thuộc thẩm quyền Cơ quan Nhà nước (UBND huyện/tỉnh). HTX chỉ làm "Tự đánh giá nội bộ".
   - **Quyết định & Cấp sao** (`/ocop/decisions`): Thẩm quyền ban hành của Chủ tịch UBND cấp huyện/tỉnh, HTX không có quyền tự cấp sao.
3. **Quy định đối với AI Agent ở mọi phiên làm việc mới (kể cả khi người dùng mở khung chat mới):**
   - AI Agent tuyệt đối **KHÔNG tự ý hiển thị lại** hoặc khôi phục 3 chức năng này vào Sidebar/Navigation khi không có yêu cầu rõ ràng từ người dùng.
   - **Cơ chế khôi phục nếu người dùng yêu cầu hiển thị lại:** Đổi hàm `isOutOfScopeModulesEnabled()` trả về `true` trong `frontend/src/router/navigation.ts` hoặc hướng dẫn người dùng chạy lệnh `localStorage.setItem('htx_ocop_enable_out_of_scope_modules', 'true')` trong Console trình duyệt.

