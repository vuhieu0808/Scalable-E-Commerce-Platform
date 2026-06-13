# Notification Templates

Thư mục này chứa các template cho notification service. Template sử dụng cú pháp `{{variableName}}` để thay thế giá trị động.

## Cấu trúc

```
templates/
├── email/       # HTML templates cho email
└── sms/         # Text templates cho SMS
```

## Email Templates

Các file HTML trong `email/` được sử dụng để gửi email qua Resend API.

### Quy tắc viết template email:

- Sử dụng inline CSS (không dùng external stylesheets)
- Responsive design cho mobile
- Biến động format: `{{variableName}}`
- Test trên nhiều email clients

### Ví dụ:

```html
<p>Xin chào {{userName}}!</p>
<p>Mã đơn hàng của bạn là: {{orderId}}</p>
```

## SMS Templates

Các file `.txt` trong `sms/` được sử dụng để gửi SMS.

### Quy tắc viết template SMS:

- Tối đa 160 ký tự (1 SMS)
- Không dùng dấu tiếng Việt để tiết kiệm ký tự
- Rõ ràng, ngắn gọn
- Bao gồm link rút gọn nếu cần

### Ví dụ:

```
Don hang #{{orderId}} da duoc xac nhan! Tong gia tri: {{totalAmount}} VND. Chi tiet: {{orderUrl}}
```

## Template Variables

### Common Variables (dùng cho nhiều loại)

- `userName`: Tên người dùng
- `userEmail`: Email người dùng
- `orderId`: Mã đơn hàng

### Specific Variables (theo từng loại)

Xem chi tiết trong [README.md](../../../README.md#template-variables-by-type)

## Thêm Template Mới

1. Tạo file HTML trong `email/` và file TXT trong `sms/`
2. Thêm enum value vào `NotificationType` trong `send-notification.dto.ts`
3. Đăng ký trong `TemplateService`:
   - `emailTemplateMap` - subject và fileName
   - `smsTemplateMap` - fileName

4. Test template:

```bash
# Publish a test notification event through the gateway or a RabbitMQ client
# Payload example:
# {
#   "messageId": "550e8400-e29b-41d4-a716-446655440000",
#   "recipient": "test@example.com",
#   "channel": "email",
#   "type": "your-new-type",
#   "data": {
#     "variable1": "value1",
#     "variable2": "value2"
#   }
# }
```

## Best Practices

### Email Templates

✅ **Nên:**

- Sử dụng table layout cho tương thích tốt
- Inline CSS cho mọi style
- Test trên Gmail, Outlook, Apple Mail
- Sử dụng màu sắc nhất quán với brand
- Có footer với thông tin công ty

❌ **Không nên:**

- External CSS hoặc JavaScript
- Background images phức tạp
- Font chữ không phổ biến
- Template quá dài (> 600px width)

### SMS Templates

✅ **Nên:**

- Ngắn gọn, đủ ý
- Bỏ dấu tiếng Việt để tiết kiệm
- Link rút gọn (bit.ly, tinyurl)
- Đầu SMS có tên brand

❌ **Không nên:**

- Quá 160 ký tự (phí thêm SMS)
- Dấu tiếng Việt không cần thiết
- Link dài
- Thiếu thông tin quan trọng

## Testing

Trước khi deploy template mới:

1. Test với nhiều giá trị data khác nhau
2. Kiểm tra hiển thị trên mobile
3. Test với email client khác nhau (Gmail, Outlook, iOS Mail)
4. Verify tất cả biến được thay thế đúng
5. Check spam score với mail-tester.com
