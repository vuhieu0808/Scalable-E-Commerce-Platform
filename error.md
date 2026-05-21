# 📝 TIL (Today I Learned) - Error Log

## ❌ Lỗi 404/Nhảy Location Mặc Định Do Sai Dấu Gạch Chéo (`/`) Trong Nginx

### 1. Ngữ cảnh (Context)

Cấu hình **Nginx-Private** làm API Gateway để định tuyến (Routing) request kiểm tra sức khỏe (`health`) vào Microservice `shopping_cart_service` chạy trong môi trường Docker-compose.

### 2. Triệu chứng (Symptom)

* Client gửi request: `GET /api/shopping-carts/health` (Không có dấu `/` ở cuối).
* Kết quả: Nginx không nhận diện được Endpoint này, tự động bỏ qua khối xử lý và đá request xuống `location /` dẫn đến lỗi `404 Not Found`.

### 3. Nguyên nhân (Root Cause)

* **Cấu hình lỗi:**
```nginx
location /api/shopping-carts/health/ {   # <--- Yêu cầu bắt buộc có dấu / ở cuối
    proxy_pass http://shopping_cart_service/;
}
```


* **Giải thích:** Khi thêm dấu `/` vào cuối `location`, Nginx hiểu đây là một **Thư mục (Directory)**. Request của client gửi lên thiếu dấu `/` nên Nginx đánh giá là **Không trùng khớp (No Match)**, sau đó nó chuyển sang tìm kiếm ở `location /`.

### 4. Giải pháp (Fix)

Bỏ toàn bộ dấu gạch chéo (`/`) ở cuối cả đường dẫn `location` lẫn `proxy_pass` để Nginx hiểu theo dạng **Chuỗi ký tự tiền tố (Prefix String)**.

* **Cấu hình chuẩn:**

```nginx
  location /api/shopping-carts/health {     # <--- Chấp nhận cả có hoặc không có dấu /
      proxy_pass http://shopping_cart_service; # <--- Giữ nguyên vẹn URI truyền vào Backend
  }
```

### 5. Bài học phỏng vấn (Interview Takeaway)

* **Quy tắc so khớp của Nginx:** `location` không có dấu `/` ở cuối hoạt động như một *Prefix Match*, nó bao sân được cả 2 trường hợp client gọi có hoặc không có dấu `/`.
* **Cơ chế `proxy_pass`:** Khi `proxy_pass` KHÔNG có dấu `/` ở cuối, Nginx sẽ bê nguyên vẹn (nguyên văn) cái URI mà client gửi lên để đẩy vào Backend (Node.js/NestJS), giúp tránh việc code Backend bị nhận sai Endpoint do Nginx tự ý cắt gọt.
