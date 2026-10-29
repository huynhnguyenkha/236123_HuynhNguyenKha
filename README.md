# Hệ thống quản lý món ăn

**Sinh viên:** Huỳnh Nguyên Kha - **MSSV:** 236123
**Học phần:** Điện toán đám mây

## 1. Đề tài
Xây dựng và triển khai hệ thống quản lý món ăn trên nền tảng đám mây. Hệ thống cho phép thêm, xem, sửa, xóa và tìm kiếm món ăn.

## 2. Công nghệ sử dụng
- Frontend: React (Vite)
- Backend: Node.js, Express
- Cơ sở dữ liệu: MongoDB Atlas
- Quản lý mã nguồn: Git, GitHub
- Đóng gói: Docker, Docker Hub
- Triển khai: Render

## 3. Cấu trúc dự án
```
236123_HuynhNguyenKha/
├── backend/     # API Node.js + Express, kết nối MongoDB Atlas
├── frontend/    # Giao diện React
├── .gitignore
└── README.md
```

## 4. Hướng dẫn cài đặt và chạy chương trình

### Yêu cầu
Node.js 20 trở lên, Git, tài khoản MongoDB Atlas.

### Chạy backend
```bash
cd backend
npm install
```
Tạo file `.env` trong thư mục `backend` (xem mẫu `.env.example`), sau đó:
```bash
npm run dev
```
Backend chạy tại http://localhost:5000

### Chạy frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend chạy tại http://localhost:5173

## 5. Link triển khai
(Sẽ cập nhật ở các câu sau)


## 6. Cơ sở dữ liệu
- Nền tảng: MongoDB Atlas
- Database: `236123_HuynhNguyenKha`
- Collection: `foods`

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| foodId | String | Mã món ăn (duy nhất) |
| name | String | Tên món ăn |
| category | String | Loại món ăn |
| cuisine | String | Ẩm thực / vùng miền |
| ingredients | Array | Danh sách nguyên liệu |
| price | Number | Giá bán |
| quantity | Number | Số lượng hiện có |
| description | String | Mô tả món ăn |
| imageUrl | String | Đường dẫn hình ảnh |

Chuỗi kết nối được cấu hình qua biến môi trường `MONGODB_URI` (xem `backend/.env.example`). 


## 7. API

| Phương thức | Endpoint | Chức năng |
|---|---|---|
| GET | /health | Kiểm tra trạng thái backend |
| GET | /api/foods | Lấy danh sách món ăn |
| GET | /api/foods?search=pho | Tìm kiếm theo tên, loại, vùng miền |
| GET | /api/foods/:id | Xem một món ăn (theo foodId) |
| POST | /api/foods | Thêm món ăn |
| PUT | /api/foods/:id | Cập nhật món ăn |
| DELETE | /api/foods/:id | Xóa món ăn |

### Chạy backend

    cd backend
    npm install
    cp .env.example .env   # rồi điền MONGODB_URI, PORT
    node index.js

    ## 8. Chạy backend bằng Docker

Image trên Docker Hub: https://hub.docker.com/r/huynhnguyenkha236123/backend

Image được GitHub Actions tự động build và đẩy lên Docker Hub khi có thay đổi trong thư mục `backend`.

### Chạy bằng image có sẵn

```bash
docker pull huynhnguyenkha236123/backend:latest
docker run -d --name backend -p 5000:5000 \
  -e PORT=5000 \
  -e MONGODB_URI="<chuỗi kết nối MongoDB Atlas>" \
  -e CORS_ORIGIN="http://localhost:5173" \
  huynhnguyenkha236123/backend:latest
```

### Tự build từ mã nguồn

```bash
cd backend
docker build -t huynhnguyenkha236123/backend:latest .
docker run -d --name backend -p 5000:5000 --env-file .env huynhnguyenkha236123/backend:latest
```

### Kiểm tra

- http://localhost:5000/health
- http://localhost:5000/api/foods

Thông tin bí mật (`MONGODB_URI`) chỉ truyền lúc chạy container, không nằm trong image.