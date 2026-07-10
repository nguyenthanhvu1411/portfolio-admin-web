# Portfolio Admin Frontend

Giao diện quản trị cho backend Portfolio ASP.NET Core.

## Công nghệ

- React 18 + TypeScript + Vite
- Ant Design
- TanStack Query
- Axios interceptor JWT + refresh token HttpOnly cookie
- Zustand
- React Router
- Day.js

## Module

- Đăng nhập, refresh token, đăng xuất
- Dashboard
- Hồ sơ cá nhân, avatar, banner, CV
- Nhóm kỹ năng và kỹ năng
- Dự án, công nghệ, gallery, thumbnail
- Kinh nghiệm
- Học vấn
- Chứng chỉ và ảnh chứng chỉ
- Blog, danh mục Blog, tags, thumbnail
- Tin nhắn liên hệ
- Tài khoản Admin/SuperAdmin
- Cấu hình website, logo, favicon
- Upload ảnh, tài liệu và CV dùng chung

## Cài đặt

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Mặc định frontend chạy tại:

```text
http://localhost:5173
```

## Cấu hình `.env`

```env
VITE_API_BASE_URL=https://localhost:7165
VITE_PUBLIC_BASE_URL=https://localhost:7165
```

Không thêm `/api` vào cuối base URL vì các API đã dùng đường dẫn đầy đủ.

## CORS backend

Backend phải cho phép origin Vite và credentials:

```json
"Cors": {
  "AllowedOrigins": [
    "http://localhost:5173"
  ]
}
```

Cấu hình policy cần gọi `AllowCredentials()` vì refresh token được lưu trong HttpOnly cookie.

## HTTPS local

Mở `https://localhost:7165/swagger` một lần và chấp nhận development certificate nếu trình duyệt đang chặn backend.

## Tài khoản seed development

```text
Email: admin@portfolio.com
Password: Admin@123
```

## Lưu ý nghiệp vụ

- Role ID theo seed hiện tại: `1 = SuperAdmin`, `2 = Admin`.
- User Management chỉ hiện thao tác ghi cho SuperAdmin.
- Dashboard tổng hợp số lượng từ các API danh sách vì backend chưa có endpoint dashboard riêng.
- Trang Kho file chỉ hiển thị các file vừa upload trong phiên hiện tại vì backend chưa có API `GET /uploads`.
- Các URL file tương đối được ghép với `VITE_PUBLIC_BASE_URL`.
