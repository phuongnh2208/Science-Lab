# Kế hoạch triển khai

1. Hoàn tất cấu hình Supabase client và xác nhận truy vấn qua RLS.
2. Xây dựng Supabase Auth, profile và route guard cho ADMIN/TEACHER.
3. Xây dựng thư viện chương trình KNTT và quản lý bài học.
4. Xây dựng Admin block editor và quản lý tài nguyên.
5. Xây dựng thư viện bài giảng cho giáo viên.
6. Xây dựng hồ sơ lớp và logic gợi ý theo thiết bị.
7. Xây dựng trình soạn KHBD CV 5512, sau đó STEM.
8. Tích hợp Storage, preview tài liệu, PhET, YouTube, chia sẻ và xuất file.
9. Kiểm thử RLS, build production và triển khai Cloudflare Pages.

Mỗi giai đoạn phải có loading, empty và error state; không dùng dữ liệu giả cho luồng đã kết nối database.
