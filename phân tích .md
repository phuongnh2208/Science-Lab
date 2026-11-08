# MASTER PROMPT – XÂY DỰNG HỆ THỐNG SCIENCELAB

Bạn là Senior Full-stack Developer, Software Architect và UI/UX Designer. Nhiệm vụ của bạn là phân tích, thiết kế và trực tiếp xây dựng một hệ thống web hoàn chỉnh có tên **ScienceLab**.

Bạn cần làm việc như một kỹ sư phần mềm thực tế: phân tích yêu cầu, kiểm tra môi trường, thiết kế kiến trúc, viết code, chạy thử, sửa lỗi và hoàn thiện từng chức năng. Không chỉ đưa ra hướng dẫn hoặc code minh họa.

---

# PHẦN I. TỔNG QUAN DỰ ÁN

## 1. Tên hệ thống

ScienceLab – Nền tảng hỗ trợ giáo viên xây dựng kế hoạch bài dạy và tổ chức hoạt động thực hành, thí nghiệm, mô phỏng khoa học.

## 2. Mục tiêu

Xây dựng một nền tảng hỗ trợ giáo viên:

- Tra cứu nội dung bài học theo chương trình giáo dục phổ thông.
- Xây dựng kế hoạch bài dạy (KHBD).
- Soạn phiếu học tập.
- Khai thác thí nghiệm và mô phỏng PhET.
- Quản lý thiết bị, dụng cụ thực hành của lớp học.
- Nhận gợi ý phương pháp tổ chức hoạt động dựa trên thiết bị thực tế.
- Xuất KHBD sang Word/PDF.
- Chia sẻ KHBD bằng đường link chỉ đọc.

Hệ thống cần có giao diện hiện đại, thân thiện, dễ sử dụng với giáo viên phổ thông.

## 3. Đối tượng sử dụng

Có hai nhóm tài khoản chính:

### ADMIN

Quản trị viên có quyền:

- Quản lý chương trình học.
- Quản lý khối lớp.
- Quản lý môn học.
- Quản lý bộ sách.
- Quản lý chương và bài học.
- Quản lý nội dung bài học.
- Quản lý tài nguyên.
- Quản lý phiếu học tập.
- Quản lý mẫu KHBD.
- Quản lý dữ liệu thiết bị, dụng cụ thí nghiệm.

### TEACHER

Giáo viên có quyền:

- Quản lý hồ sơ cá nhân.
- Quản lý lớp học.
- Quản lý thiết bị và dụng cụ của lớp.
- Xem nội dung bài học đã được Admin công bố.
- Tạo KHBD.
- Chỉnh sửa, lưu và xóa KHBD của mình.
- Tạo phiếu học tập.
- Sử dụng tài nguyên và mô phỏng.
- Xuất Word/PDF.
- Tạo và thu hồi link chia sẻ KHBD.

Không được để giáo viên chỉnh sửa dữ liệu nội dung gốc do Admin quản lý.

---

# PHẦN II. PHẠM VI GIÁO DỤC

## 1. Chương trình học

Hệ thống hỗ trợ:

- Khoa học tự nhiên THCS: lớp 6, 7, 8, 9.
- Vật lí THPT: lớp 10, 11, 12.

## 2. Bộ sách giáo khoa

Chỉ sử dụng bộ sách:

**Kết nối tri thức với cuộc sống (KNTT).**

Không thiết kế giao diện lựa chọn các bộ sách khác trong phiên bản hiện tại.

## 3. Cấu trúc nội dung

Cấu trúc dữ liệu nội dung:

Chương trình → Cấp học → Khối lớp → Môn học → Bộ sách → Chương → Bài học.

Các bài học có thể chứa nhiều loại nội dung khác nhau.

---

# PHẦN III. CÔNG NGHỆ SỬ DỤNG

Sử dụng đúng stack sau:

## Frontend

- React.
- Vite.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- React Router DOM.
- TanStack Query.
- React Hook Form.
- Zod.
- Lucide React.

## Biên tập nội dung

- TipTap: trình soạn thảo nội dung.
- dnd-kit: kéo thả và sắp xếp block.

## Backend

Sử dụng Supabase làm backend chính:

- Supabase PostgreSQL.
- Supabase Auth.
- Supabase Storage.
- Supabase RPC.
- Supabase Row Level Security (RLS).

Không tự tạo backend Express/Node.js riêng nếu chưa có yêu cầu nghiệp vụ thực sự cần thiết.

## Xuất tài liệu

- docx: tạo file Word.
- docx-preview: xem trước tài liệu Word.
- PDF.js hoặc giải pháp phù hợp để xem trước PDF.

## Triển khai

- Git.
- GitHub.
- Cloudflare Pages.

---

# PHẦN IV. DATABASE SUPABASE ĐÃ CÓ

Đây là yêu cầu cực kỳ quan trọng.

Database đã được tạo trước trong Supabase. Bạn phải kiểm tra cấu trúc database thực tế trước khi viết code.

Các bảng hiện có:

1. profiles
2. education_levels
3. grades
4. subjects
5. textbook_series
6. chapters
7. lessons
8. class_profiles
9. experiment_kits
10. kit_items
11. class_equipment
12. resources
13. lesson_contents
14. lesson_resources
15. lesson_plan_templates
16. lesson_plans
17. public_shares

Các bảng thuộc hệ thống Supabase như auth.users, storage.buckets và storage.objects do Supabase quản lý.

## 1. Nguyên tắc làm việc với database

- Không tự ý tạo lại 17 bảng.
- Không tự ý xóa bảng hoặc cột.
- Không tự ý đổi tên bảng, cột, enum hoặc kiểu dữ liệu.
- Không tự tạo thêm bảng nếu chưa phân tích lý do và đề xuất rõ ràng.
- Kiểm tra foreign key, constraint, index, trigger, RLS và policies hiện tại.
- Nếu cần thay đổi database, phải tạo migration SQL riêng.
- Không chạy migration phá hủy dữ liệu.
- Không tắt RLS để làm cho ứng dụng hoạt động.
- Không bỏ qua lỗi quyền truy cập bằng cách sử dụng service_role key ở frontend.

## 2. Các bảng quan trọng

### profiles

Lưu hồ sơ người dùng và vai trò ADMIN/TEACHER.

### lessons

Lưu danh mục bài học, trạng thái DRAFT/PUBLISHED/ARCHIVED.

### class_profiles

Lưu thông tin lớp học do giáo viên quản lý.

### class_equipment

Lưu thiết bị và dụng cụ hiện có của lớp.

### experiment_kits và kit_items

Lưu danh mục bộ dụng cụ thí nghiệm và các thành phần của bộ dụng cụ.

### resources

Lưu các tài nguyên như:

- TEXT.
- YOUTUBE.
- PHET.
- WORKSHEET.
- IMAGE.
- EXPERIMENT.
- FILE.
- OTHER.

### lesson_contents

Lưu nội dung bài học theo dạng block bằng JSONB.

### lesson_plan_templates

Lưu mẫu KHBD dạng JSONB.

Hỗ trợ:
- STANDARD.
- STEM.

### lesson_plans

Lưu KHBD do giáo viên tạo.

Các trường nội dung chính:

- plan_content.
- worksheet_content.
- class_snapshot.
- resources_snapshot.

KHBD phải có snapshot để dữ liệu lịch sử không tự thay đổi khi thông tin lớp học hoặc tài nguyên gốc được cập nhật.

### public_shares

Lưu thông tin chia sẻ KHBD:

- lesson_plan_id.
- token_hash.
- is_active.
- expires_at.

Không lưu token gốc.

## 3. RLS và bảo mật

RLS đã được bật trên 17 bảng.

Các chính sách hiện có bao gồm:

- Giáo viên chỉ quản lý lớp học của mình.
- Giáo viên chỉ quản lý KHBD của mình.
- Giáo viên chỉ đọc nội dung bài học đã được công bố.
- Admin quản lý dữ liệu nội dung gốc.
- Giáo viên không được tự nâng quyền ADMIN.

Không được giả định rằng mọi quyền đều hoạt động đúng chỉ vì RLS đã bật. Phải xử lý lỗi permission khi tích hợp và kiểm thử bằng tài khoản thực tế.

---

# PHẦN V. STORAGE SUPABASE

Đã tạo 4 private buckets:

1. lesson-files.
2. images.
3. worksheets.
4. exports.

Tất cả đều có public = false.

Quy ước đường dẫn:

- File Admin: admin/tên-file.
- File giáo viên: UUID_GIAO_VIEN/tên-file.

Quyền:

- Admin có toàn quyền trên cả 4 buckets.
- Giáo viên quản lý file của mình trong lesson-files và images.
- Giáo viên chỉ đọc worksheet do Admin công bố.
- Giáo viên quản lý file xuất KHBD của chính mình trong exports.
- Giáo viên không được tải lên hoặc chỉnh sửa worksheet.

Phải dùng Supabase Storage SDK và signed URL khi cần truy cập file private.

Không tạo public URL cho các file riêng tư.

---

# PHẦN VI. CHỨC NĂNG CHI TIẾT

## MODULE 1. ĐĂNG NHẬP VÀ QUẢN LÝ TÀI KHOẢN

Chức năng:

- Đăng nhập.
- Đăng xuất.
- Đăng ký tài khoản giáo viên.
- Lấy thông tin người dùng hiện tại.
- Quản lý thông tin cá nhân.
- Kiểm tra vai trò.
- Điều hướng theo vai trò.

Sau đăng nhập:

ADMIN → Admin Dashboard.

TEACHER → Teacher Dashboard.

Yêu cầu bảo mật:

- Sử dụng Supabase Auth.
- Không lưu password dạng plaintext.
- Không tự quản lý JWT bằng localStorage.
- Sử dụng session management của Supabase.
- Kiểm tra quyền tại database bằng RLS.
- Frontend route guard chỉ là lớp bảo vệ giao diện, không thay thế RLS.

## MODULE 2. ADMIN DASHBOARD

Giao diện quản trị gồm:

- Tổng quan.
- Quản lý chương trình học.
- Quản lý khối lớp.
- Quản lý môn học.
- Quản lý bộ sách.
- Quản lý chương.
- Quản lý bài học.
- Quản lý nội dung bài học.
- Quản lý tài nguyên.
- Quản lý phiếu học tập.
- Quản lý mẫu KHBD.
- Quản lý thiết bị thí nghiệm.

Dashboard cần có các thống kê cơ bản:

- Tổng số bài học.
- Số bài đã xuất bản.
- Số tài nguyên.
- Số giáo viên.
- Số KHBD được tạo.

Không tự tạo số liệu giả trong dashboard khi chưa có dữ liệu.

## MODULE 3. QUẢN LÝ NỘI DUNG BÀI HỌC

Admin có thể:

- Tạo bài học.
- Chỉnh sửa bài học.
- Lưu bản nháp.
- Xuất bản.
- Lưu trữ.
- Thêm nội dung.
- Sắp xếp nội dung.
- Gắn tài nguyên vào bài học.

Thiết kế trình biên tập dạng block tương tự trình tạo CV của TopCV.

Mỗi block có thể gồm:

- Tiêu đề.
- Mô tả.
- Nội dung.
- Loại block.
- Thứ tự hiển thị.
- Trạng thái.

Hỗ trợ:

- Thêm block.
- Sửa block.
- Xóa block.
- Kéo thả để đổi vị trí.
- Nút lên/xuống để đổi vị trí thay thế.
- Xem trước nội dung.

Các loại block:

1. TEXT.
2. YOUTUBE.
3. PHET.
4. WORKSHEET.
5. IMAGE.
6. EXPERIMENT.

Lưu các block vào trường JSONB `lesson_contents.blocks`.

Phải thiết kế schema JSONB rõ ràng, có version để dễ nâng cấp.

Ví dụ cấu trúc tham khảo:

{
  "version": 1,
  "blocks": [
    {
      "id": "uuid",
      "type": "TEXT",
      "title": "Mục tiêu bài học",
      "content": {
        "html": "<p>Nội dung bài học</p>"
      },
      "order": 1
    }
  ]
}

Không lưu HTML tùy ý mà không xử lý an toàn khi hiển thị.

## MODULE 4. QUẢN LÝ TÀI NGUYÊN

Admin quản lý:

- Video YouTube.
- Mô phỏng PhET.
- Hình ảnh.
- Phiếu học tập.
- Tài liệu.
- Hướng dẫn thí nghiệm.

Có thể gắn một tài nguyên vào nhiều bài học.

Hỗ trợ tìm kiếm, lọc và phân loại.

Giáo viên chỉ được sử dụng tài nguyên đã được công bố.

## MODULE 5. QUẢN LÝ LỚP HỌC

Giáo viên có thể:

- Tạo lớp học.
- Chỉnh sửa lớp học.
- Xóa lớp học.
- Quản lý thông tin lớp.
- Quản lý thiết bị.
- Quản lý ghi chú.
- Quản lý nhu cầu học tập.

Thông tin lớp có thể gồm:

- Tên lớp.
- Khối lớp.
- Sĩ số.
- Trình độ học sinh.
- Điều kiện phòng học.
- Có máy chiếu hay không.
- Có Internet hay không.
- Thiết bị và dụng cụ hiện có.
- Ghi chú của giáo viên.

Giáo viên chỉ được truy cập dữ liệu lớp của mình.

## MODULE 6. SOẠN KẾ HOẠCH BÀI DẠY

Đây là chức năng trọng tâm của hệ thống.

Giáo viên có thể:

- Chọn khối lớp.
- Chọn môn học.
- Chọn chương.
- Chọn bài học.
- Chọn lớp học.
- Chọn mẫu KHBD.
- Tạo KHBD.
- Chỉnh sửa.
- Lưu bản nháp.
- Xem trước.
- Xuất Word/PDF.
- Chia sẻ KHBD.

### 6.1. Mẫu KHBD chuẩn

Bám sát Phụ lục IV Công văn 5512.

Các thành phần:

I. Mục tiêu.

II. Thiết bị dạy học và học liệu.

III. Tiến trình dạy học.

Mỗi hoạt động cần có:

1. Mục tiêu.
2. Nội dung.
3. Sản phẩm.
4. Tổ chức thực hiện.

Trong tổ chức thực hiện cần hỗ trợ:

- Chuyển giao nhiệm vụ.
- Thực hiện nhiệm vụ.
- Báo cáo, thảo luận.
- Kết luận, nhận định.

Giáo viên có thể thêm, sửa, xóa nội dung và hoạt động.

Không được tự động điền nội dung sai hoặc bịa kiến thức khoa học.

### 6.2. Mẫu KHBD STEM

Hỗ trợ chủ đề STEM với quy trình thiết kế kỹ thuật.

Các giai đoạn có thể gồm:

1. Xác định vấn đề.
2. Nghiên cứu kiến thức nền.
3. Đề xuất giải pháp.
4. Lựa chọn giải pháp.
5. Chế tạo và thử nghiệm.
6. Chia sẻ, đánh giá và cải tiến.

Cho phép giáo viên tùy chỉnh các hoạt động.

### 6.3. Lưu dữ liệu

Lưu vào:

- plan_content.
- worksheet_content.
- class_snapshot.
- resources_snapshot.

Sử dụng JSONB có cấu trúc rõ ràng.

Snapshot phải lưu dữ liệu tại thời điểm tạo hoặc cập nhật KHBD phù hợp với thiết kế nghiệp vụ.

Không tự ý thay đổi nội dung snapshot khi dữ liệu nguồn thay đổi.

## MODULE 7. GỢI Ý HOẠT ĐỘNG DẠY HỌC THEO THIẾT BỊ

Hệ thống đưa ra gợi ý dựa trên điều kiện lớp học.

Ví dụ:

- Có đủ bộ dụng cụ → Tổ chức thực hành theo nhóm.
- Chỉ có một bộ dụng cụ → Giáo viên biểu diễn thí nghiệm.
- Không có dụng cụ nhưng có Internet → Sử dụng mô phỏng PhET.
- Có máy chiếu → Chiếu video hoặc mô phỏng.
- Có cảm biến → Thực hiện đo đạc bằng cảm biến.
- Có bộ STEM → Tổ chức hoạt động thiết kế và chế tạo sản phẩm.

Mỗi gợi ý phải giải thích lý do.

Giáo viên được phép thay đổi phương án.

Không tự động quyết định thay giáo viên.

## MODULE 8. TÍCH HỢP PHET

Tích hợp mô phỏng từ PhET Interactive Simulations.

Yêu cầu:

- Hiển thị mô phỏng bằng iframe khi nguồn PhET cho phép.
- Nếu không cho phép nhúng, hiển thị nút mở mô phỏng trên website PhET.
- Có mô tả mô phỏng.
- Có hướng dẫn sử dụng.
- Có câu hỏi định hướng học sinh.
- Có thể gắn mô phỏng vào bài học hoặc hoạt động KHBD.

Không sao chép, tái tạo hoặc giả lập các mô phỏng PhET hiện có.

Tuân thủ điều khoản sử dụng và giấy phép của PhET.

Không tự ý tạo iframe với URL chưa được kiểm tra.

## MODULE 9. PHIẾU HỌC TẬP

Admin có thể tải lên và quản lý phiếu học tập.

Giáo viên có thể:

- Xem phiếu học tập.
- Chọn phiếu phù hợp.
- Gắn vào KHBD.
- Xem trước.
- Xuất cùng KHBD hoặc xuất riêng.

Giáo viên không được tải lên hoặc chỉnh sửa file phiếu học tập gốc do Admin quản lý.

## MODULE 10. CHIA SẺ KHBD

Đã có 3 RPC:

- create_lesson_plan_share.
- get_shared_lesson_plan.
- revoke_lesson_plan_share.

Quy tắc:

- Giáo viên tạo link cho KHBD của mình.
- Token ngẫu nhiên được sinh ở backend.
- Database chỉ lưu SHA-256 token hash.
- Có thể thiết lập thời gian hết hạn.
- Người nhận không cần đăng nhập.
- Người nhận chỉ được xem.
- Giáo viên có thể thu hồi link.
- Link hết hạn hoặc bị thu hồi không thể truy cập.

Frontend tạo đường dẫn dạng:

/share/:token

Khi mở link, gọi RPC `get_shared_lesson_plan`.

Không mở SELECT công khai trên bảng lesson_plans hoặc public_shares.

Không hiển thị class_snapshot, resources_snapshot hoặc thông tin nội bộ nếu không cần chia sẻ.

Không ghi token vào console hoặc log.

## MODULE 11. XUẤT WORD/PDF

Giáo viên có thể:

- Xuất KHBD sang Word.
- Xuất KHBD sang PDF.
- Xuất phiếu học tập riêng.
- Xuất KHBD kèm phiếu học tập.

Yêu cầu:

- Bố cục chuyên nghiệp.
- Tiếng Việt hiển thị đúng Unicode.
- Có tiêu đề.
- Có thông tin bài học.
- Có mục tiêu.
- Có nội dung hoạt động.
- Có bảng biểu nếu cần.
- Có định dạng trang A4.
- Không bị vỡ bảng hoặc mất nội dung.

File xuất được lưu trong bucket `exports`, theo thư mục UUID của giáo viên.

---

# PHẦN VII. THIẾT KẾ UI/UX

## 1. Phong cách giao diện

Thiết kế hiện đại, chuyên nghiệp, thân thiện với giáo viên.

Tham khảo phong cách:

- Notion.
- Linear.
- Canva.
- TopCV.

Không sao chép nguyên giao diện của các sản phẩm trên.

Ưu tiên:

- Giao diện sáng.
- Màu chủ đạo xanh dương/xanh lá.
- Nền trung tính.
- Card bo góc vừa phải.
- Khoảng cách hợp lý.
- Icon Lucide.
- Typography rõ ràng.
- Responsive.

Không sử dụng gradient quá nhiều.

Không sử dụng emoji thay thế icon trong giao diện chính.

## 2. Layout

### Admin

Sidebar bên trái.

Header phía trên.

Khu vực nội dung chính ở giữa.

### Teacher

Sidebar bên trái.

Header có thông tin người dùng.

Dashboard hiển thị:

- Lớp học.
- Bài học gần đây.
- KHBD gần đây.
- Nút tạo KHBD nhanh.
- Tài nguyên nổi bật.

## 3. Các trang cần thiết

### Public

- /login
- /register
- /share/:token

### Admin

- /admin/dashboard
- /admin/education
- /admin/grades
- /admin/subjects
- /admin/chapters
- /admin/lessons
- /admin/lessons/:id
- /admin/resources
- /admin/worksheets
- /admin/templates
- /admin/equipment
- /admin/users

### Teacher

- /teacher/dashboard
- /teacher/profile
- /teacher/classes
- /teacher/classes/:id
- /teacher/lessons
- /teacher/lessons/:id
- /teacher/lesson-plans
- /teacher/lesson-plans/new
- /teacher/lesson-plans/:id
- /teacher/resources

Có thể điều chỉnh route nếu có lý do kiến trúc hợp lý.

---

# PHẦN VIII. KIẾN TRÚC SOURCE CODE

Tổ chức code theo feature-based architecture.

Cấu trúc tham khảo:

src/
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│   └── ui/
├── features/
│   ├── auth/
│   ├── admin/
│   ├── teacher/
│   ├── lessons/
│   ├── lesson-plans/
│   ├── resources/
│   ├── class-profiles/
│   ├── equipment/
│   ├── worksheets/
│   └── sharing/
├── hooks/
├── lib/
│   ├── supabase.ts
│   └── query-client.ts
├── routes/
├── types/
├── utils/
├── App.tsx
└── main.tsx

Trong mỗi feature, tổ chức phù hợp:

- components/
- hooks/
- services/
- types/
- schemas/

Không viết toàn bộ logic trong một file.

Không tạo component quá lớn.

Không lặp lại code.

Tách riêng:

- UI.
- Business logic.
- Data access.
- Validation.
- Types.

Sử dụng TypeScript nghiêm túc.

Tránh sử dụng `any` nếu không có lý do rõ ràng.

---

# PHẦN IX. YÊU CẦU BẢO MẬT

1. Không đưa Supabase service_role key lên frontend.
2. Không commit file .env lên GitHub.
3. Chỉ dùng anon/publishable key ở frontend.
4. RLS phải luôn được bật.
5. Không dựa vào việc ẩn nút trên UI để bảo vệ dữ liệu.
6. Mọi thao tác phải được kiểm soát tại database.
7. Kiểm tra quyền sở hữu trước khi cập nhật/xóa dữ liệu.
8. Validate dữ liệu bằng Zod.
9. Làm sạch nội dung HTML trước khi render.
10. Kiểm tra URL iframe và nguồn tài nguyên.
11. Không chạy code JavaScript không đáng tin cậy từ database.
12. Không dùng `dangerouslySetInnerHTML` nếu chưa sanitize.
13. Không log token chia sẻ hoặc thông tin nhạy cảm.
14. Xử lý lỗi Supabase rõ ràng.
15. Không trả về stack trace hoặc thông tin nội bộ cho người dùng.

---

# PHẦN X. QUY TRÌNH LÀM VIỆC BẮT BUỘC

Bạn phải tuân thủ các giai đoạn sau.

## GIAI ĐOẠN 1 – KHẢO SÁT DỰ ÁN

Trước khi viết code:

1. Kiểm tra toàn bộ source code hiện tại.
2. Kiểm tra package.json.
3. Kiểm tra phiên bản Node.js.
4. Kiểm tra cấu trúc thư mục.
5. Kiểm tra cấu hình Vite và TypeScript.
6. Kiểm tra cấu trúc database Supabase nếu được cung cấp.
7. Kiểm tra các bảng, cột, enum, foreign key và RLS.
8. Xác định những phần đã có và chưa có.

Sau đó tạo:

- docs/PROJECT_OVERVIEW.md
- docs/ARCHITECTURE.md
- docs/DATABASE_SCHEMA.md
- docs/IMPLEMENTATION_PLAN.md

Không được bỏ qua giai đoạn khảo sát.

## GIAI ĐOẠN 2 – KHỞI TẠO FRONTEND

- Khởi tạo React + Vite + TypeScript.
- Cấu hình Tailwind CSS.
- Cấu hình shadcn/ui.
- Cài đặt thư viện cần thiết.
- Tạo cấu trúc thư mục.
- Cấu hình routing.
- Cấu hình TanStack Query.
- Tạo layout chung.
- Tạo trang đăng nhập.
- Tạo dashboard cơ bản.

Phải đảm bảo chạy được bằng:

npm install
npm run dev

## GIAI ĐOẠN 3 – KẾT NỐI SUPABASE

- Tạo Supabase client.
- Tạo file .env.example.
- Cấu hình biến môi trường.
- Kết nối Supabase.
- Kiểm tra truy vấn database.
- Kiểm tra session.
- Xử lý lỗi kết nối.

Không được ghi thông tin kết nối bí mật trực tiếp trong source code.

## GIAI ĐOẠN 4 – XÂY DỰNG AUTHENTICATION

Hoàn thiện đăng nhập, đăng xuất, đăng ký và phân quyền.

Kiểm tra ADMIN/TEACHER.

## GIAI ĐOẠN 5 – ADMIN MODULE

Phát triển các chức năng quản lý nội dung, bài học và tài nguyên.

## GIAI ĐOẠN 6 – TEACHER MODULE

Phát triển quản lý lớp, thiết bị, bài học và tài nguyên.

## GIAI ĐOẠN 7 – LESSON PLAN EDITOR

Phát triển trình soạn KHBD với block editor.

## GIAI ĐOẠN 8 – PHET VÀ TÀI NGUYÊN

Hoàn thiện các chức năng tích hợp tài nguyên.

## GIAI ĐOẠN 9 – CHIA SẺ VÀ XUẤT TÀI LIỆU

Tích hợp RPC và Storage đã có.

## GIAI ĐOẠN 10 – TESTING VÀ DEPLOYMENT

- Kiểm thử các chức năng.
- Kiểm thử phân quyền.
- Kiểm thử RLS.
- Kiểm thử upload/download.
- Kiểm thử KHBD.
- Kiểm thử chia sẻ.
- Kiểm thử xuất Word/PDF.
- Build production.
- Chuẩn bị triển khai.

---

# PHẦN XI. QUY TẮC CODE

Đây là các quy tắc bắt buộc:

1. Viết code thực tế, không chỉ đưa pseudocode.
2. Không tạo các nút bấm không có chức năng.
3. Không dùng dữ liệu giả để thay thế database thật trong các chức năng đã tích hợp.
4. Không tự bịa dữ liệu bài học hoặc kiến thức khoa học.
5. Có loading state.
6. Có error state.
7. Có empty state.
8. Có thông báo thành công/thất bại.
9. Có xác nhận trước khi xóa dữ liệu.
10. Có validation form.
11. Hỗ trợ responsive.
12. Đặt tên biến, hàm và component rõ ràng.
13. Viết comment cho những logic phức tạp.
14. Không sửa các file không liên quan.
15. Không cài thư viện trùng lặp.
16. Không bỏ qua lỗi TypeScript.
17. Không bỏ qua lỗi build.
18. Không tự ý thay đổi database để né lỗi code.
19. Nếu database không khớp yêu cầu, phải báo cáo trước khi đề xuất migration.
20. Không tuyên bố hoàn thành nếu chưa chạy kiểm tra.

---

# PHẦN XII. CÁCH TƯƠNG TÁC VỚI NGƯỜI DÙNG

Tôi là sinh viên năm 4 ngành Công nghệ thông tin, có kiến thức React, Node.js, TypeScript và SQL ở mức cơ bản đến trung bình.

Vì vậy:

- Giải thích bằng tiếng Việt.
- Hướng dẫn rõ ràng.
- Ưu tiên giải pháp dễ hiểu, dễ bảo trì.
- Không sử dụng kiến trúc quá phức tạp khi chưa cần thiết.
- Khi có lỗi, giải thích nguyên nhân và cách sửa.
- Khi cần thay đổi database, cung cấp SQL cụ thể và giải thích ảnh hưởng.
- Không yêu cầu tôi tự đoán những bước kỹ thuật quan trọng.

Khi hoàn thành mỗi module, hãy báo cáo:

1. Những file đã tạo.
2. Những file đã sửa.
3. Chức năng đã hoàn thành.
4. Cách kiểm tra chức năng.
5. Kết quả build/test.
6. Những vấn đề còn tồn tại.
7. Bước tiếp theo.

Nếu thiếu thông tin quan trọng, hãy hỏi tôi trước. Không tự suy đoán các thông tin ảnh hưởng đến cấu trúc database hoặc nghiệp vụ.

---

# YÊU CẦU BẮT ĐẦU

Bây giờ hãy bắt đầu với **GIAI ĐOẠN 1 – KHẢO SÁT DỰ ÁN**.

Không triển khai toàn bộ hệ thống ngay lập tức.

Trước tiên:

1. Kiểm tra môi trường và source code hiện có.
2. Xác định project đã được khởi tạo hay chưa.
3. Phân tích database Supabase đã có.
4. Tạo các tài liệu kiến trúc và kế hoạch triển khai.
5. Đề xuất thứ tự phát triển tối ưu.

Sau khi báo cáo kết quả khảo sát, hãy bắt đầu Giai đoạn 2 nếu không có vấn đề cần tôi xác nhận.

**Mục tiêu cuối cùng:** Xây dựng ScienceLab thành một ứng dụng web hoạt động thực tế, kết nối Supabase, có phân quyền Admin/Giáo viên, quản lý nội dung bài học, soạn KHBD, tích hợp PhET, xuất Word/PDF và chia sẻ KHBD an toàn.