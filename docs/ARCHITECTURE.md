# Kiến trúc hiện tại

```text
React + Vite + TypeScript
        |
Supabase JS client
        |
Supabase Auth / PostgreSQL / Storage / RLS
```

Client Supabase nằm tại `src/lib/supabase.ts`. Client chỉ được khởi tạo khi đủ hai biến môi trường. Hàm `checkSupabaseConnection` truy vấn `education_levels` để kiểm tra cả kết nối và quyền đọc database.

Các feature tiếp theo sẽ được tổ chức theo module trong `src/features`, tách UI, validation, business logic và data access.
