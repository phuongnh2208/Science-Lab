# ScienceLab - Tổng quan dự án

ScienceLab có hai luồng chính:

1. Thư viện bài giảng do Admin xây dựng bằng các block nội dung.
2. Công cụ để giáo viên tạo, lưu và chia sẻ kế hoạch bài dạy.

Phạm vi chương trình gồm KHTN lớp 6-9 và Vật lí lớp 10-12, sử dụng duy nhất bộ sách Kết nối tri thức với cuộc sống.

## Giai đoạn hiện tại

Project đã được khởi tạo bằng React, Vite và TypeScript. Supabase client đọc URL và publishable/anon key từ biến môi trường `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`. Không có secret key trong source code.
