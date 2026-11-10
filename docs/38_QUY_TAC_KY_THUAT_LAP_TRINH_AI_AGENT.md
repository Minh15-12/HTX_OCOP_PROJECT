# 38_QUY_TAC_KY_THUAT_LAP_TRINH_AI_AGENT.md

# TRỤ CỘT IV: QUY TẮC KỸ THUẬT LẬP TRÌNH BẮT BUỘC CHO AI CODING AGENT

> **Dự án:** Hệ thống Quản lý Hợp tác xã Nông nghiệp & Số hóa Hồ sơ OCOP  
> **Áp dụng:** Backend Laravel 11, Frontend React 18/TypeScript, PostgreSQL 16, RESTful API, Kiểm thử, Bảo mật và Tích hợp hệ thống HTX/OCOP.

---

## 1. Nguyên tắc ưu tiên và xử lý xung đột

1. Không sửa mã nguồn trước khi đọc hướng dẫn Agent, kiến trúc, SRS, business rules, database design, API specification, sổ đăng ký quy tắc `docs/00_RULES_REGISTER.md` và các tệp liên quan trực tiếp đến chức năng cần thực hiện.
2. Thứ tự ưu tiên khi đối chiếu:
   - Pháp luật và tiêu chuẩn chính thức đã được xác minh, còn áp dụng (bao gồm văn bản gốc và văn bản sửa đổi bổ sung).
   - Yêu cầu nghiệp vụ đã được chủ dự án phê duyệt.
   - SRS, business rules và các đặc tả hệ thống đã thống nhất.
   - Kiến trúc và quy ước kỹ thuật của repository.
   - Đề xuất tối ưu của Agent.
3. Nếu hai nguồn mâu thuẫn hoặc thiếu căn cứ, không tự ý chọn một nguồn rồi triển khai. Ghi nhận nội dung mâu thuẫn, tác động, nguồn liên quan và phương án đề xuất để yêu cầu xác minh.
4. Không được tự phát minh công thức tài chính, quy tắc phân quyền, trường dữ liệu, enum, endpoint hoặc quy trình pháp lý.
5. Mọi giả định chưa được xác nhận phải được ghi rõ là giả định, không được trình bày như yêu cầu đã phê duyệt.
6. Phân biệt rạch ròi giữa quy định pháp luật nhà nước và quy chế nội bộ của HTX (ví dụ: tỷ lệ phí dịch vụ, trần tín dụng, chuẩn cảm quan độ ngọt Brix là quy chế nội bộ HTX).

---

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

---

## 3. Quy tắc kiến trúc và tổ chức mã nguồn

1. Tuân thủ kiến trúc hiện có; với backend áp dụng ranh giới Domain, Application, Infrastructure và Presentation theo tài liệu dự án.
2. Controller chỉ tiếp nhận yêu cầu, kiểm tra đầu vào thông qua cơ chế phù hợp, điều phối nghiệp vụ và trả response. Không đặt công thức nghiệp vụ phức tạp trực tiếp trong Controller.
3. Không để frontend truy cập cơ sở dữ liệu hoặc gọi trực tiếp các thành phần nội bộ của backend.
4. Không để Domain phụ thuộc vào Controller, HTTP Request, Eloquent hoặc thành phần giao diện.
5. Mỗi module cần có ranh giới trách nhiệm rõ ràng. Chỉ tạo interface, repository, service hoặc abstraction khi có giá trị thực tế; tránh tạo quá nhiều lớp trung gian không cần thiết.
6. Không tạo tệp/component quá lớn một cách không kiểm soát. Mốc 400 dòng là ngưỡng cần xem xét tách nhỏ, không phải lý do để chia mã một cách máy móc.
7. Tránh copy-paste nghiệp vụ. Logic dùng chung phải có một nguồn triển khai đáng tin cậy.
8. Không sử dụng biến toàn cục, singleton có trạng thái thay đổi hoặc side effect ẩn nếu không có lý do kiến trúc rõ ràng.

---

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

---

## 5. Quy tắc cơ sở dữ liệu và tính toàn vẹn

1. Mọi bảng nghiệp vụ đa HTX phải có cơ chế xác định tenant rõ ràng theo thiết kế. **Không chỉ kiểm tra tenant ở Controller**: Truy vấn bị thiếu điều kiện tenant có thể làm lộ dữ liệu của HTX khác qua API, báo cáo, file xuất, job nền hoặc quan hệ dữ liệu. Bắt buộc kiểm soát tại tầng Data Access (Eloquent Global Scope, Repository), Policy, các truy vấn quan hệ (`with`, `whereHas`), hàng đợi (Queue Jobs) và xuất file (Export).
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

---

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

---

## 7. Quy tắc nghiệp vụ và giao dịch tài chính

1. Công thức nghiệp vụ phải được triển khai tại một vị trí thống nhất và có test độc lập.
2. Không tính cùng một chỉ số theo những công thức khác nhau giữa API, báo cáo và giao diện.
3. Các giao dịch đã duyệt, đã thanh toán hoặc đã chốt phải tuân theo quy tắc sửa đổi được phê duyệt; không tùy tiện cập nhật hoặc xóa trực tiếp.
4. Nếu cần sửa giao dịch tài chính đã ghi nhận, phải sử dụng cơ chế đảo bút toán hoặc quy trình điều chỉnh đã được xác định trong nghiệp vụ.
5. Khi một quy trình có nhiều bước, phải bảo đảm dữ liệu liên quan được cập nhật đồng bộ trong transaction.
6. Kiểm tra giới hạn số tiền, tổng phân bổ, tồn kho, ngày tháng, trạng thái và điều kiện chuyển trạng thái ở backend.
7. Không tự động làm tròn hoặc cắt bỏ phần dư tiền mà không tuân thủ quy tắc làm tròn đã được phê duyệt.
8. Tách biệt dữ liệu gốc, dữ liệu tổng hợp, số liệu báo cáo và dữ liệu cache. Không dùng dữ liệu tổng hợp làm nguồn ghi ngược vào sổ nghiệp vụ nếu không có quy trình rõ ràng.

---

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
4. **Không coi test thành công hoặc mã HTTP 200 là bằng chứng duy nhất**: Một API có thể trả về HTTP 200 nhưng vẫn có thể ghi sai sổ quỹ, trừ kho hai lần, sai lệch công nợ hoặc cho phép người dùng không đủ quyền duyệt phiếu. Test bắt buộc phải kiểm tra cả kết quả nghiệp vụ và trạng thái dữ liệu thực tế trong CSDL sau khi thực hiện (số dư sổ quỹ, biến động tồn kho, công nợ, audit trail).
5. Không xóa, vô hiệu hóa hoặc nới lỏng test chỉ để làm cho pipeline xanh.
6. Không sửa test để chấp nhận một hành vi sai nghiệp vụ mà chưa được phê duyệt.
7. Dùng factory và dữ liệu test riêng biệt; không phụ thuộc dữ liệu thật của người dùng.
8. Chạy các test liên quan trước, sau đó chạy toàn bộ test khả thi.
9. Phân biệt rõ test đã chạy, test chưa chạy, test bị lỗi môi trường và test thất bại do mã nguồn.

---

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

---

## 10. Quy tắc hiệu năng và chất lượng mã

1. Tránh N+1 query; sử dụng eager loading, pagination và truy vấn có chọn lọc khi phù hợp.
2. Không tải toàn bộ dữ liệu lớn lên frontend chỉ để phân trang ở trình duyệt nếu API có thể phân trang.
3. Không thêm index, cache hoặc queue theo cảm tính; xác định mục tiêu và kiểm chứng tác động.
4. Không cache dữ liệu theo cách có thể làm rò rỉ dữ liệu giữa các tenant.
5. Không thực hiện xử lý file lớn, xuất báo cáo nặng hoặc tác vụ dài trực tiếp trong request nếu kiến trúc hỗ trợ queue phù hợp.
6. Không thêm thư viện mới nếu chức năng có thể được giải quyết hợp lý bằng công cụ hiện có.
7. Khi thêm hoặc nâng cấp dependency, kiểm tra khả năng tương thích, bảo trì, giấy phép và rủi ro bảo mật.
8. **Không refactor toàn bộ dự án khi chỉ cần sửa một chức năng**: Xóa import, biến và mã chết khi có căn cứ; không chạy các đợt refactor lớn không liên quan đến nhiệm vụ. Ưu tiên các thay đổi nhỏ (Surgical Change), có thể kiểm thử độc lập, có thể xem xét lại và dễ dàng hoàn tác (rollback) để tránh phá hỏng các phần backend đã chạy ổn định trong khi tiếp tục hoàn thiện frontend.
9. Tuân thủ formatter, linter, static analysis và coding standard đã được cấu hình trong repository.
10. Không tối ưu sớm bằng các abstraction phức tạp khi chưa có nhu cầu rõ ràng.

---

## 11. Quy tắc log, giám sát và xử lý lỗi

1. Lỗi phải có thông tin đủ để chẩn đoán nhưng không làm lộ dữ liệu nhạy cảm.
2. Phân biệt lỗi nghiệp vụ dự kiến với lỗi hệ thống không dự kiến.
3. Sử dụng mã lỗi ổn định cho các lỗi nghiệp vụ quan trọng; frontend không nên phải phân tích chuỗi thông báo tự do để quyết định hành vi.
4. Các tác vụ nền và thao tác nhiều bước cần có cơ chế ghi nhận trạng thái, lỗi và khả năng thử lại phù hợp.
5. Không tự động thử lại một thao tác tài chính không idempotent nếu có nguy cơ ghi nhận giao dịch hai lần.
6. Không bắt exception rồi bỏ qua mà không xử lý, ghi nhận hoặc truyền lỗi phù hợp.

---

## 12. Quy tắc quản lý tài liệu

1. Khi thay đổi API, cập nhật API specification và tài liệu tích hợp frontend.
2. Khi thay đổi bảng, field, enum hoặc quan hệ, cập nhật database design và data dictionary.
3. Khi thay đổi nghiệp vụ, cập nhật business rules, use cases hoặc tài liệu liên quan.
4. Khi thay đổi quyền, cập nhật role/permission matrix.
5. Khi có quy tắc pháp lý mới hoặc thay đổi, ghi rõ nguồn, điều khoản, ngày hiệu lực và phạm vi ảnh hưởng.
6. Không đánh dấu tài liệu là đã xác minh pháp lý nếu chưa đối chiếu nguồn đáng tin cậy.
7. Không để báo cáo cũ tiếp tục được sử dụng như trạng thái hiện tại sau khi mã nguồn đã thay đổi.

---

## 13. Quy trình làm việc của Agent

Với mỗi nhiệm vụ, Agent phải thực hiện theo trình tự:

- **Bước 1:** Đọc tài liệu và kiểm tra repository hiện tại.
- **Bước 2:** Xác định vấn đề, nguyên nhân gốc, phạm vi và các phụ thuộc.
- **Bước 3:** Lập kế hoạch thay đổi nhỏ, có thứ tự và có cách kiểm chứng.
- **Bước 4:** Triển khai theo từng module hoặc nhóm thay đổi có thể kiểm tra độc lập.
- **Bước 5:** Chạy formatter, linter, static analysis và test phù hợp với stack thực tế.
- **Bước 6:** Kiểm tra hồi quy, quyền truy cập, tenant isolation, dữ liệu và hợp đồng API.
- **Bước 7:** Cập nhật tài liệu, báo cáo kết quả và liệt kê những điểm chưa giải quyết.

*Agent không được tuyên bố hoàn thành chỉ vì đã tạo hoặc sửa file.*

---

## 14. Tiêu chí hoàn thành nhiệm vụ

Một nhiệm vụ chỉ được đánh dấu **DONE** khi:

- Yêu cầu đã được đối chiếu với tài liệu liên quan.
- Mã nguồn đã được triển khai trong phạm vi cho phép.
- Không còn lỗi đã biết thuộc phạm vi nhiệm vụ mà chưa được nêu rõ.
- Test phù hợp đã chạy và có kết quả thực tế.
- Các hợp đồng API, database và frontend liên quan đã được cập nhật.
- Quyền truy cập và tenant isolation đã được kiểm tra khi liên quan.
- Không có dữ liệu giả mạo kết quả hoặc chức năng chỉ hoạt động trên giao diện.
- Có báo cáo tóm tắt file thay đổi, test đã chạy, kết quả, hạn chế và công việc còn lại.

*Nếu một điều kiện chưa đạt, phải đánh dấu PARTIAL hoặc BLOCKED và nêu lý do cụ thể; không được báo cáo DONE.*

---

## 15. Quy tắc cuối cùng

> **Bảo toàn dữ liệu, tính đúng đắn nghiệp vụ, bảo mật và khả năng kiểm chứng quan trọng hơn tốc độ tạo mã.**

Khi thiếu thông tin, ưu tiên điều tra và nêu rõ điểm chưa chắc chắn. Khi có nhiều phương án, chọn phương án ít rủi ro nhất, phù hợp kiến trúc hiện tại và có thể kiểm thử. Không được tự ý mở rộng phạm vi hoặc thay đổi công nghệ chỉ vì sở thích của Agent.
