SCIENCELAB – TÀI LIỆU ĐẶC TẢ YÊU CẦU SẢN PHẨM (PRD)
PHIÊN BẢN HỢP NHẤT – DÀNH CHO ANTIGRAVITY
1. Tổng quan dự án
Tên website: ScienceLab | Hỗ trợ giáo viên KHTN và Vật lí xây dựng bài giảng có thí nghiệm.

Mục tiêu:

Xây dựng nền tảng hỗ trợ giáo viên Khoa học tự nhiên cấp THCS và giáo viên Vật lí cấp THPT trong việc tìm kiếm học liệu, thiết kế kế hoạch bài dạy, tổ chức thí nghiệm thực và sử dụng mô phỏng tương tác.

Hệ thống tập trung vào việc:
- Phân loại bài học theo chương trình, môn học, khối lớp và nội dung SGK KNTT.
- Đề xuất bộ thí nghiệm thực, dụng cụ, cách lắp đặt và lưu ý kỹ thuật.
- Tích hợp mô phỏng tương tác từ PhET và các nguồn bên ngoài.
- Tích hợp video hướng dẫn thí nghiệm từ YouTube.
- Cung cấp phiếu học tập tương ứng với từng thí nghiệm/mô phỏng.
- Hỗ trợ giáo viên soạn KHBD theo Công văn 5512 hoặc chủ đề STEM.
- Cá nhân hóa phương án tổ chức dạy học theo điều kiện thiết bị và đặc điểm của lớp.
- Lưu trữ, chỉnh sửa, tải xuống và chia sẻ KHBD.
2. Phạm vi chương trình và phân loại bài học
2.1. Cấp học và môn học
Cấp học	Môn học	Khối lớp
THCS	Khoa học tự nhiên (KHTN)	6, 7, 8, 9
THPT	Vật lí	10, 11, 12

2.2. Bộ sách giáo khoa
Bộ sách duy nhất
 Kết nối tri thức với cuộc sống (KNTT)

Yêu cầu:
- Chỉ sử dụng bộ SGK KNTT làm nguồn chương trình chính thức.
- Không hiển thị lựa chọn Chân trời sáng tạo và Cánh Diều.
- Không xây dựng chức năng chuyển đổi giữa các bộ sách.
- Giao diện chọn bài học mặc định và duy nhất theo KNTT.
- Dữ liệu bài học phải được tổ chức đúng theo chương trình của từng khối.
- Admin có quyền bổ sung, chỉnh sửa và cập nhật danh sách bài học.
2.3. Cấu trúc phân loại
ScienceLab
│
├── THCS
│   └── Khoa học tự nhiên
│       ├── Lớp 6
│       ├── Lớp 7
│       ├── Lớp 8
│       └── Lớp 9
│
└── THPT
    └── Vật lí
        ├── Lớp 10
        ├── Lớp 11
        └── Lớp 12


Trong mỗi khối:
Khối lớp
  └── Chương/Chủ đề
       └── Bài học
            ├── Hướng dẫn bài giảng
            ├── Bộ thí nghiệm thực
            ├── Mô phỏng
            ├── Video
            └── Phiếu học tập


3. Đối tượng sử dụng và phân quyền
Hệ thống có hai đối tượng chính.
3.1. Giáo viên
Giáo viên có thể:
- Đăng ký, đăng nhập tài khoản.
- Xem thư viện hướng dẫn bài giảng theo khối lớp và bài học.
- Xem nội dung do Admin đăng tải.
- Xem video, mô phỏng và phiếu học tập.
- Sử dụng PhET trực tiếp trên website nếu nguồn cho phép nhúng.
- Tạo KHBD mới.
- Chọn Hồ sơ lớp để cá nhân hóa KHBD.
- Chọn chế độ soạn CV 5512 hoặc STEM.
- Chỉnh sửa nội dung KHBD và phiếu học tập.
- Lưu KHBD vào Kho KHBD cá nhân.
- Tải KHBD và phiếu học tập về máy dưới dạng Word/PDF.
- Tùy chọn chia sẻ KHBD để người khác xem công khai.
- Quản lý, chỉnh sửa và xóa các KHBD của mình.
3.2. Admin
Admin chịu trách nhiệm quản trị toàn bộ nội dung của hệ thống.

Các chức năng:
- Quản lý tài khoản giáo viên.
- Quản lý cấp học, môn học, khối lớp, chương và bài học.
- Quản lý nội dung hướng dẫn bài giảng.
- Quản lý bộ thí nghiệm thực.
- Quản lý mô phỏng PhET và các nguồn bên ngoài.
- Quản lý video YouTube.
- Quản lý phiếu học tập.
- Quản lý mẫu KHBD.
- Quản lý nội dung theo từng bài học.
- Sắp xếp thứ tự các thành phần nội dung.
- Chỉnh sửa, ẩn, xóa và xuất bản nội dung.
4. Chức năng dành cho giáo viên
4.1. Trang chủ
Trang chủ giới thiệu ScienceLab và cung cấp lối truy cập nhanh đến thư viện bài giảng.

Các thành phần:
- Header: Logo ScienceLab, Giới thiệu, Thư viện bài giảng, Kho KHBD, Đăng nhập.
- Banner giới thiệu mục tiêu hệ thống.
- Lựa chọn cấp học: THCS, THPT.
- Danh sách môn học.
- Danh sách khối lớp.
- Bài học nổi bật.
- Các học liệu thực nghiệm được đề xuất.
4.2. Thư viện bài giảng
Giáo viên truy cập theo cấu trúc:
1. Chọn cấp học.
2. Chọn môn học.
3. Chọn khối lớp.
4. Chọn chương/chủ đề.
5. Chọn bài học.
Trang chi tiết bài học hiển thị nội dung do Admin đăng tải.

Các nội dung có thể gồm:
- Mục tiêu bài học.
- Kiến thức trọng tâm.
- Hướng dẫn tổ chức hoạt động.
- Bộ thí nghiệm thực.
- Danh sách dụng cụ.
- Hướng dẫn lắp đặt.
- Video hướng dẫn.
- Mô phỏng tương tác.
- Phiếu học tập.
- Lưu ý kỹ thuật và an toàn.
4.3. Trang chi tiết hướng dẫn bài giảng
Đây là nơi giáo viên xem toàn bộ học liệu của một bài học.

Bố cục đề xuất:

Phần 1 – Thông tin bài học
- Tên bài.
- Môn học.
- Khối lớp.
- Chương/chủ đề.
- Mục tiêu kiến thức và kỹ năng.
Phần 2 – Hướng dẫn tổ chức bài dạy
- Nội dung hướng dẫn.
- Các hoạt động dạy học.
- Phương pháp tổ chức thí nghiệm.
- Sản phẩm học tập dự kiến.
Phần 3 – Hệ thống học liệu
- Thí nghiệm thực.
- Mô phỏng.
- Video.
- Phiếu học tập.
Mỗi học liệu có phần mô tả riêng và có thể được mở rộng để xem chi tiết.

5. Chức năng soạn mới Kế hoạch bài dạy
Đây là chức năng trọng tâm của hệ thống, được thiết kế theo luồng từ trên xuống dưới.
5.1. Chọn lớp và đồng bộ Hồ sơ lớp
Giáo viên lựa chọn lớp từ danh sách hồ sơ đã tạo.

Ví dụ:
- Lớp 8A1.
- Lớp 8A3.
- Lớp 9A2.
- CLB STEM 8-9.
Khi chọn lớp, hệ thống tự động nạp các thông tin:
- Sĩ số.
- Thiết bị hiện có.
- Nhu cầu hỗ trợ đặc biệt.
- Ghi chú về đặc điểm lớp.
Cho phép chọn không gắn với lớp cụ thể nếu muốn soạn KHBD dùng chung.
5.2. Chọn chương trình và bài học
Các trường lựa chọn:
- Cấp học: THCS/THPT.
- Môn học: KHTN/Vật lí.
- Khối lớp: 6–12 theo môn học tương ứng.
- Bộ sách: KNTT (mặc định và duy nhất).
- Chương/chủ đề.
- Bài học.
Không hiển thị dropdown lựa chọn bộ sách khác.
5.3. Chọn mẫu soạn bài
Có hai chế độ.

Chế độ 1: Soạn theo Công văn 5512

Cấu trúc:
- I. Mục tiêu.
- II. Thiết bị dạy học và học liệu.
- III. Tiến trình dạy học.
Gồm bốn hoạt động:
1. Mở đầu.
2. Hình thành kiến thức mới.
3. Luyện tập.
4. Vận dụng.
Mỗi hoạt động có:
- Mục tiêu.
- Nội dung.
- Sản phẩm.
- Tổ chức thực hiện.
Cấu trúc cần đối chiếu với mẫu Phụ lục IV Công văn 5512 do khách hàng cung cấp.

Chế độ 2: Soạn theo chủ đề STEM

Hỗ trợ:
- Quy trình thiết kế kỹ thuật.
- Kịch bản sinh hoạt CLB STEM ngoại khóa.
Có thể tổ chức theo các bước:
1. Xác định vấn đề.
2. Nghiên cứu kiến thức nền.
3. Đề xuất giải pháp.
4. Thiết kế và chế tạo.
5. Thử nghiệm, đánh giá.
6. Báo cáo và cải tiến.
5.4. Gợi ý và lựa chọn học liệu
Hiển thị dưới dạng lưới bốn nhóm học liệu.
1. Bộ thí nghiệm thực

- Tên bộ thí nghiệm.
- Danh sách dụng cụ.
- Số lượng dụng cụ.
- Hướng dẫn lắp đặt.
- Các bước tiến hành.
- Lưu ý kỹ thuật và an toàn.
  
  2. Mô phỏng
- PhET.
- Coach 7.
- Các phần mềm mô phỏng khác.
- Mở trực tiếp hoặc nhúng vào website.
- Câu hỏi khám phá.
  
  3. Video
- Video hướng dẫn thao tác thí nghiệm.
- Video hiện tượng khoa học.
- Video giải thích kiến thức.
- Nhúng YouTube hoặc mở liên kết.
  
  4. Phiếu học tập
- Mẫu phiếu học tập.
- Phiếu thực hành.
- Bảng ghi số liệu.
- Câu hỏi phân tích và kết luận.
- Xem trước Word/PDF.

Giáo viên có thể tích chọn nhiều học liệu. Các học liệu được chọn sẽ được sử dụng trong quá trình tạo KHBD.

6. Chức năng quản lý nội dung dành cho Admin
Đây là phần cần giữ nguyên ý tưởng ban đầu của bạn: giao diện tạo nội dung tương tự trình tạo CV của TopCV, nghĩa là Admin xây dựng bài giảng bằng cách thêm từng khối nội dung vào một trang làm việc.
6.1. Giao diện trình tạo bài giảng
Bố cục đề xuất:
- Cột trái: Danh sách loại nội dung có thể thêm.
- Khu vực giữa: Trang làm việc, nơi các nội dung được thêm vào.
- Cột phải: Cấu hình và chỉnh sửa nội dung đang được chọn.







softwaresuggest.com


6.2. Luồng tạo bài giảng
1. Admin chọn khối lớp.
2. Chọn chương/chủ đề.
3. Chọn bài học.
4. Nhập tên hướng dẫn bài giảng.
5. Thêm từng khối nội dung.
6. Nhập mô tả cho từng khối.
7. Sắp xếp thứ tự các khối.
8. Xem trước nội dung.
9. Lưu bản nháp hoặc xuất bản.
6.3. Các loại khối nội dung
Loại 1 – Nội dung văn bản
- Tiêu đề.
- Mô tả.
- Nội dung hướng dẫn.
- Công thức.
- Ghi chú.
Loại 2 – Mô phỏng YouTube
- Nhập URL YouTube.
- Tự động nhận diện video ID.
- Nhúng trình phát video.
- Nhập tiêu đề.
- Nhập mô tả.
- Có nút mở video gốc.
Loại 3 – Mô phỏng PhET
- Nhập URL PhET.
- Nhập tên mô phỏng.
- Nhập mô tả.
- Nhập câu hỏi khám phá.
- Chọn chế độ hiển thị: nhúng iframe hoặc mở tab mới.
Ví dụ URL:

https://phet.colorado.edu/vi/simulations/ohms-law

Khi nhúng thành công, người xem có thể tương tác trực tiếp với mô phỏng trong website, bao gồm kéo thanh trượt, thay đổi thông số và quan sát kết quả.

Lưu ý kỹ thuật: PhET phải cho phép nhúng ở URL tương ứng. Nếu iframe bị chặn hoặc không tương thích, hiển thị nút mở trực tiếp PhET. Không xây dựng lại phần mềm mô phỏng của PhET.

Loại 4 – Phiếu học tập
- Upload file Word .docx.
- Có thể upload PDF nếu cần.
- Nhập tên phiếu.
- Nhập mô tả.
- Xem trước tài liệu ngay trong website.
- Cho phép tải file gốc.
Đối với DOCX, dùng thư viện docx-preview hoặc giải pháp chuyển đổi an toàn sang PDF để hiển thị. Không chỉ hiển thị tên file và nút tải xuống.

Loại 5 – Hình ảnh/sơ đồ
- Upload hình ảnh.
- Nhập tiêu đề.
- Nhập mô tả.
- Hiển thị sơ đồ lắp đặt hoặc hình minh họa.
Loại 6 – Bộ thí nghiệm thực
- Tên bộ.
- Mục đích.
- Danh sách dụng cụ.
- Hướng dẫn lắp đặt.
- Quy trình thực hiện.
- Lưu ý an toàn.
6.4. Quy tắc thao tác các khối nội dung
Mỗi khối nội dung phải có:
- Khu vực nhập tiêu đề.
- Khu vực nhập mô tả.
- Khu vực nhập nội dung hoặc upload tài nguyên.
- Nút chỉnh sửa.
- Nút xóa.
- Nút di chuyển lên.
- Nút di chuyển xuống.
- Có thể hỗ trợ kéo thả để thay đổi thứ tự.
Khi Admin chọn thêm loại nội dung nào, hệ thống tạo một khối tương ứng bên dưới nội dung hiện tại.

Ví dụ:
BÀI: ĐỊNH LUẬT ÔM

┌─────────────────────────────────┐
│ 1. Giới thiệu bài học            │
│ Nội dung văn bản                 │
│ Mô tả...                         │
│ [Sửa] [Xóa] [Di chuyển]          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 2. Video thí nghiệm              │
│ [YouTube Player]                 │
│ Mô tả video...                   │
│ [Sửa] [Xóa] [Di chuyển]          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 3. Mô phỏng PhET                 │
│ [PhET Interactive Simulation]   │
│ Mô tả mô phỏng...                │
│ [Sửa] [Xóa] [Di chuyển]          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 4. Phiếu học tập                 │
│ [Khung xem trước DOCX/PDF]       │
│ Mô tả phiếu...                   │
│ [Sửa] [Xóa] [Di chuyển]          │
└─────────────────────────────────┘

             [+ Thêm nội dung]


6.5. Quản lý trạng thái nội dung
- Bản nháp.
- Đã xuất bản.
- Đã ẩn.
Chỉ nội dung đã xuất bản mới xuất hiện trong thư viện dành cho giáo viên.

7. Ba tab kết quả đầu ra
7.1. Tab KHBD
- Tạo giáo án hoàn chỉnh.
- Hiển thị đúng cấu trúc CV 5512 hoặc STEM.
- Tự động chèn học liệu đã chọn.
- Tự động điều chỉnh hoạt động thí nghiệm theo thiết bị lớp.
- Gợi ý hỗ trợ học sinh có nhu cầu đặc biệt.
- Cho phép chỉnh sửa trực tiếp.
- Sao chép nội dung.
- Lưu vào Kho KHBD.
- Tải Word/PDF.
7.2. Tab Phiếu học tập
- Tạo phiếu học tập tương ứng với bài học.
- Có câu hỏi dự đoán.
- Có bảng ghi số liệu thực nghiệm.
- Có câu hỏi phân tích.
- Có phần kết luận.
- Cho phép chỉnh sửa.
- Tải Word/PDF riêng để in.
7.3. Tab Mô phỏng tương tác và AI
Phân thành hai phần:

A. Mô phỏng nội bộ ScienceLab
- Thanh trượt điều chỉnh đại lượng vật lí.
- Đồ họa trực quan.
- Tự động tính kết quả.
- Ghi kết quả vào bảng số liệu.
- Xóa/reset dữ liệu.
- Có công thức và đơn vị.
B. AI hỗ trợ xây dựng mô phỏng
- Nhập mô tả thí nghiệm.
- AI đề xuất kịch bản.
- Đề xuất biến số.
- Đề xuất công thức.
- Gợi ý câu hỏi khám phá.
- Gợi ý phiếu học tập.
Trong MVP, AI chỉ được tạo cấu hình cho các mẫu mô phỏng đã được kiểm chứng, không được tự chạy code tùy ý.

8. Hồ sơ lớp
Mỗi giáo viên có thể tạo và quản lý nhiều hồ sơ lớp.
Nhóm thông tin	Nội dung
Tên lớp	Lớp 8A1, 9A2, CLB STEM...
Sĩ số	Số lượng học sinh
Thiết bị	Bộ thí nghiệm nhóm, bộ biểu diễn, máy chiếu, Internet, kit STEM, cảm biến
Nhu cầu đặc biệt	Khiếm thị, khiếm thính, hạn chế vận động tay...
Ghi chú	Năng lực tiếp thu, thói quen thảo luận, định hướng học tập

Logic cá nhân hóa
Điều kiện lớp	Phương án
Đủ bộ thí nghiệm	Chia nhóm thực hành
Chỉ có một bộ	Giáo viên biểu diễn, học sinh quan sát
Không có bộ nhưng có Internet	Sử dụng mô phỏng
Có máy chiếu	Trình chiếu mô phỏng/video
Có cảm biến số	Gợi ý đo đạc bằng cảm biến
Có bộ kit STEM	Đề xuất hoạt động chế tạo

Hệ thống phải giải thích lý do chọn phương án để giáo viên có thể điều chỉnh.

9. Kho KHBD và chia sẻ
9.1. Kho KHBD cá nhân
Hiển thị danh sách giáo án đã lưu.

Mỗi thẻ gồm:
- Tên bài học.
- Môn và khối lớp.
- Bộ sách KNTT.
- Lớp áp dụng.
- Loại KHBD.
- Nhãn học liệu.
- Ngày tạo/cập nhật.
Thao tác:
- Mở lại.
- Chỉnh sửa.
- Nhân bản.
- Xóa.
- Tải Word/PDF.
9.2. Chia sẻ KHBD
Giáo viên có thể lựa chọn:
- Riêng tư: chỉ mình giáo viên xem.
- Công khai: người khác có liên kết có thể xem.
Không mặc định công khai khi lưu.

Nếu công khai, cần có URL riêng và trang xem KHBD chỉ đọc. Người xem không được chỉnh sửa nội dung gốc.

10. Database và lưu trữ
Đề xuất sử dụng Supabase PostgreSQL.
Công nghệ
Thành phần	Công nghệ
Frontend	React + Vite + TypeScript
UI	Tailwind CSS + shadcn/ui
Routing	React Router
Quản lý dữ liệu	TanStack Query
Form	React Hook Form + Zod
Rich text editor	TipTap
Kéo thả	dnd-kit
Database	Supabase PostgreSQL
Authentication	Supabase Auth
File storage	Supabase Storage
Phân quyền	Supabase RLS
Backend bổ sung	Supabase Edge Functions
Mô phỏng	SVG/Canvas + TypeScript
Xuất Word	docx
Xem trước DOCX	docx-preview
Xem PDF	PDF.js
Deploy	Cloudflare Pages
Quản lý source	GitHub

10.1. Các bảng database
Bảng	Chức năng
profiles	Tài khoản và vai trò
education_levels	THCS, THPT
subjects	KHTN, Vật lí
grades	Khối lớp
textbook_series	Bộ sách KNTT duy nhất
chapters	Chương/chủ đề
lessons	Bài học
class_profiles	Hồ sơ lớp
class_equipment	Thiết bị lớp
experiment_kits	Bộ thí nghiệm
kit_items	Dụng cụ
simulations	Mô phỏng
videos	Video
worksheets	Phiếu học tập
lesson_contents	Các khối nội dung bài giảng
lesson_resources	Liên kết học liệu
lesson_plans	KHBD
plan_resources	Học liệu của KHBD
worksheet_drafts	Phiếu học tập đã chỉnh sửa
simulation_sessions	Phiên mô phỏng
lesson_plan_templates	Mẫu KHBD
public_shares	Liên kết chia sẻ KHBD

10.2. Thiết kế khối nội dung động
Bảng lesson_contents cần có các trường:
Trường	Ý nghĩa
id	ID khối nội dung
lesson_id	Bài học liên kết
content_type	TEXT, YOUTUBE, PHET, WORKSHEET, IMAGE, EXPERIMENT
title	Tiêu đề
description	Mô tả
content_data	JSONB chứa dữ liệu theo loại
sort_order	Thứ tự hiển thị
status	Trạng thái
created_at	Ngày tạo
updated_at	Ngày cập nhật

Nhờ cấu trúc này, Admin có thể thêm nhiều loại nội dung mà không cần tạo một bảng database mới mỗi khi xuất hiện một loại block mới.
10.3. Lưu file
- Ảnh, Word, PDF lưu trong Supabase Storage.
- Database chỉ lưu đường dẫn, tên file, dung lượng và metadata.
- KHBD lưu dưới dạng JSONB có cấu trúc.
- KHBD có snapshot dữ liệu lớp và học liệu để không bị thay đổi khi dữ liệu gốc được cập nhật.

11. Triển khai miễn phí trong một tháng
Định hướng:









Cloudflare Pages

Deploy giao diện website

Free tier











Supabase

Database, Auth, Storage

Free tier











GitHub

Quản lý source code

Free tier


Lưu ý:
- Kiểm tra quota và chính sách miễn phí trước khi deploy.
- Không lưu file quá lớn nếu không cần thiết.
- Tối ưu hình ảnh.
- Hạn chế upload trùng lặp.
- Không dùng AI API có tính phí nếu chưa được duyệt.
- Sao lưu database và file trước khi hết thời gian demo.
- Nếu website cần hoạt động lâu dài, phải có phương án chuyển sang gói trả phí hoặc hạ tầng khác.

12. Phạm vi triển khai theo thứ tự ưu tiên
Vì thời gian bàn giao là 18h00 ngày 08/11, nên cần ưu tiên luồng nghiệp vụ chính.
Ưu tiên	Chức năng	Mức độ
P0	Giao diện ScienceLab và điều hướng	Bắt buộc
P0	Đăng nhập, phân quyền	Bắt buộc
P0	Admin quản lý bài học	Bắt buộc
P0	Admin tạo nội dung dạng block như TopCV	Bắt buộc
P0	Nhúng PhET và YouTube	Bắt buộc
P0	Upload và xem trước phiếu Word/PDF	Bắt buộc
P0	Giáo viên xem thư viện bài giảng	Bắt buộc
P0	Hồ sơ lớp	Bắt buộc
P0	Soạn KHBD CV 5512	Bắt buộc
P0	Kho KHBD	Bắt buộc
P1	Soạn bài STEM	Nâng cao
P1	Xuất Word/PDF	Nâng cao
P1	Mô phỏng nội bộ	Nâng cao
P1	Chia sẻ KHBD công khai	Nâng cao
P2	AI tạo mô phỏng	Phát triển sau
P2	Nhiều mô phỏng nội bộ	Phát triển sau


13. Prompt cuối cùng dành cho Antigravity
Bạn có thể đặt phần sau ở cuối file Markdown và yêu cầu Antigravity đọc toàn bộ tài liệu trước khi triển khai.
YÊU CẦU TRIỂN KHAI DỰ ÁN SCIENCELAB
Bạn là Senior Full-stack Developer và UI/UX Designer chịu trách nhiệm xây dựng hệ thống ScienceLab theo toàn bộ đặc tả phía trên.
1. Nguyên tắc bắt buộc
- Đọc và phân tích toàn bộ tài liệu trước khi code.
- Không bỏ qua các yêu cầu ban đầu về quản lý nội dung dạng block tương tự TopCV.
- Không bỏ qua chức năng nhúng PhET tương tác và YouTube.
- Không thay thế PhET bằng hình ảnh hoặc video tĩnh.
- Không xây dựng lựa chọn bộ sách Chân trời sáng tạo và Cánh Diều. Chỉ sử dụng KNTT.
- Hỗ trợ KHTN lớp 6–9 và Vật lí lớp 10–12.
- Hệ thống có đúng hai vai trò chính: TEACHER và ADMIN.
- Dữ liệu nghiệp vụ phải lưu thật trong Supabase.
- Không dùng mock data cho các luồng chức năng chính khi đã kết nối database.
2. Kiến trúc kỹ thuật
Sử dụng:
- React + Vite + TypeScript.
- Tailwind CSS + shadcn/ui.
- React Router.
- TanStack Query.
- Supabase PostgreSQL.
- Supabase Auth.
- Supabase Storage.
- Supabase RLS.
- TipTap.
- dnd-kit.
- docx và docx-preview.
- SVG/Canvas cho mô phỏng nội bộ.
Deploy frontend bằng Cloudflare Pages.
3. Giao diện
Thiết kế website theo phong cách nền tảng giáo dục khoa học hiện đại, chuyên nghiệp, thân thiện.

Ưu tiên:
- Giao diện rõ ràng.
- Phân cấp nội dung hợp lý.
- Responsive.
- Tối ưu trải nghiệm desktop.
- Có loading, empty state, error state.
- Không sử dụng quá nhiều hiệu ứng trang trí.
4. Chức năng Admin
Đặc biệt chú trọng trình tạo nội dung bài giảng:
- Chọn khối, chương, bài.
- Thêm block văn bản.
- Thêm block YouTube.
- Thêm block PhET.
- Thêm block phiếu học tập Word/PDF.
- Thêm block hình ảnh.
- Thêm block thí nghiệm thực.
- Mỗi block có tiêu đề, mô tả và dữ liệu riêng.
- Có thể thêm, sửa, xóa, di chuyển lên xuống và kéo thả.
- Có xem trước toàn bộ bài giảng.
- Có lưu nháp và xuất bản.
Các block phải được lưu theo thứ tự trong database.
5. Chức năng Giáo viên
- Xem thư viện bài học.
- Xem nội dung do Admin đăng.
- Tương tác với PhET ngay trên trang khi được hỗ trợ iframe.
- Xem video YouTube.
- Xem trước phiếu học tập.
- Tạo và quản lý Hồ sơ lớp.
- Soạn KHBD theo CV 5512/STEM.
- Chọn học liệu.
- Cá nhân hóa hoạt động thí nghiệm.
- Chỉnh sửa nội dung.
- Lưu và mở lại KHBD.
- Chia sẻ KHBD công khai theo lựa chọn.
6. Database và bảo mật
- Thiết kế migration rõ ràng.
- Tạo seed dữ liệu mẫu KNTT.
- Có RLS cho tất cả dữ liệu cá nhân.
- Giáo viên chỉ truy cập dữ liệu của mình.
- Admin quản lý dữ liệu chuẩn.
- Không để lộ API key.
- Không cho phép thực thi code tùy ý.
- Không lưu dữ liệu nhạy cảm của học sinh không cần thiết.
7. Quy trình triển khai
Trước tiên, hãy kiểm tra repository hiện tại và lập kế hoạch thực hiện.

Sau đó triển khai theo từng giai đoạn:
1. Foundation và giao diện.
2. Supabase và phân quyền.
3. Quản lý bài học KNTT.
4. Trình tạo nội dung dạng block cho Admin.
5. Thư viện bài giảng cho Giáo viên.
6. Hồ sơ lớp.
7. Soạn KHBD.
8. Kho KHBD.
9. PhET, YouTube và xem trước tài liệu.
10. Xuất file và kiểm thử.
11. Deploy.
Sau mỗi giai đoạn phải kiểm tra TypeScript, lint, build và các luồng liên quan.

Không được tạo giao diện chỉ để minh họa nhưng các nút không hoạt động.

Nếu không đủ thời gian, ưu tiên hoàn thiện luồng nghiệp vụ P0 thay vì triển khai nhiều chức năng chưa hoàn chỉnh.

Cuối cùng, cung cấp:
- Source code hoàn chỉnh.
- Database migrations.
- Seed data.
- File .env.example.
- README hướng dẫn cài đặt.
- Hướng dẫn tạo tài khoản Admin.
- Hướng dẫn deploy.
- Danh sách chức năng đã hoàn thành và chưa hoàn thành.





Một điểm quan trọng mình muốn nhấn mạnh: ScienceLab thực chất có hai hướng sử dụng song song:
1. Thư viện bài giảng: Admin chủ động xây dựng nội dung từng bài bằng trình tạo block, giáo viên vào xem và sử dụng.
2. Công cụ soạn bài: Giáo viên tự chọn lớp, bài học, học liệu và tạo KHBD riêng.