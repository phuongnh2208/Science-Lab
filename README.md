# ScienceLab

Nền tảng hỗ trợ giáo viên KHTN và Vật lí xây dựng bài giảng, thí nghiệm và kế hoạch bài dạy.

## Yêu cầu môi trường

- Node.js 20 trở lên
- npm 10 trở lên
- Một Supabase project đã có schema theo [phân tích .md](./phân%20tích%20.md)

## Cài đặt

```powershell
npm install
Copy-Item .env.example .env.local
```

Mở `.env.local` và điền URL cùng publishable/anon key lấy tại **Supabase Dashboard → Project Settings → API**.

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Chỉ sử dụng publishable/anon key ở frontend; không dùng `service_role` key.

## Tạo dữ liệu khởi đầu

Database trống không phải lỗi kết nối. Để tạo danh mục mẫu KNTT, mở **Supabase Dashboard → SQL Editor → New query**, mở file [`supabase/seed.sql`](./supabase/seed.sql), dán toàn bộ nội dung và chọn **Run**.

Seed này chỉ thêm dữ liệu nếu các ID chưa tồn tại, gồm:

- THCS, THPT
- KHTN, Vật lí
- Các khối 6-12
- Bộ sách KNTT
- Một chương và một bài mẫu cho mỗi khối
- Nội dung block rỗng cho các bài mẫu

Để upload và xem phiếu bài tập trong bucket private `worksheets`, chạy thêm
[`supabase/storage-policies.sql`](./supabase/storage-policies.sql) trong SQL Editor.
File worksheet được lưu theo đường dẫn `<user-id>/<file-name>`. Sau khi upload,
hãy lưu nội dung bài học để đường dẫn được ghi vào block `WORKSHEET`.

Để lưu danh sách thiết bị theo từng hồ sơ lớp, chạy thêm
[`supabase/lesson-plan-equipment.sql`](./supabase/lesson-plan-equipment.sql).
Sau đó giáo viên chọn thiết bị khi tạo hồ sơ lớp; thiết bị sẽ được tự động đưa
vào phần “II. Thiết bị dạy học và học liệu” của KHBD.

Không chạy seed bằng publishable/anon key từ frontend. File SQL cần chạy trong SQL Editor với quyền quản trị database.

## Chạy và kiểm tra

```powershell
npm run dev
npm run lint
npm run build
```

## Gợi ý KHBD bằng AI

Tính năng **Gợi ý bằng AI** gọi OpenRouter qua Supabase Edge Function. API key
không được đặt trong frontend hoặc `.env.local`.

```powershell
supabase functions deploy generate-lesson-plan
supabase secrets set OPENROUTER_API_KEY=your-key OPENROUTER_MODEL=openai/gpt-4o-mini
```

Sau khi triển khai, giáo viên chọn bài học và hồ sơ lớp trong Kho KHBD rồi bấm
**Gợi ý bằng AI**. Kết quả chỉ là bản nháp để giáo viên kiểm tra, chỉnh sửa và
lưu; AI không tự động xuất bản hoặc ghi đè KHBD đã lưu.

Trang khởi động truy vấn bảng `education_levels` để xác nhận kết nối database và quyền đọc qua RLS. Nếu thiếu biến môi trường hoặc schema chưa tồn tại, giao diện hiển thị lỗi cấu hình thay vì dùng dữ liệu giả.

## Trạng thái hiện tại

- Đã khởi tạo React + Vite + TypeScript.
- Đã cài đặt Supabase JS, TanStack Query, React Router và Lucide React.
- Đã tạo Supabase client có session persistence và auto refresh.
- Đã thêm kiểm tra kết nối database.
- Chưa thể xác nhận kết nối tới project thật nếu chưa có `.env.local` với credentials tương ứng.
