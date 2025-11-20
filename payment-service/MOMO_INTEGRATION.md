# Tích hợp MoMo Payment vào Payment Service

## 📋 Tổng quan

Payment Service đã được tích hợp thành công với **MoMo Payment Gateway** sử dụng MoMo Java SDK từ thư mục `javapayment`.

## 🔧 Các thay đổi đã thực hiện

### 1. **Cấu hình (pom.xml)**
- Thêm dependency `momopayment-1.0.jar` từ thư mục javapayment
- Thêm Gson và Apache HttpClient cho MoMo SDK

### 2. **Cấu hình MoMo (application.yml)**
```yaml
momo:
  environment: dev  # dev hoặc prod
  dev:
    endpoint: https://test-payment.momo.vn/v2/gateway/api
    partner-code: MOMOLRJZ20181206
    access-key: mTCKt9W3eU1m39TW
    secret-key: SetA5RDnLHvt51AULf51DyauxUo3kDU6
  urls:
    return-url: http://localhost:3000/payment/result
    notify-url: http://localhost:8080/api/payments/momo/callback
```

### 3. **Các Class mới**

#### `MoMoConfig.java`
- Đọc cấu hình MoMo từ application.yml
- Tạo bean `Environment` cho MoMo SDK

#### `MoMoService.java`
- Xử lý tạo payment với MoMo
- Hỗ trợ verify signature
- Truy vấn trạng thái giao dịch

#### `MoMoCallbackController.java`
- Nhận callback từ MoMo sau khi thanh toán
- Endpoint: `POST /api/payments/momo/callback`
- Endpoint kiểm tra kết quả: `GET /api/payments/momo/result`

### 4. **Cập nhật Model**

#### `Payment.java` - Thêm các trường:
- `momoRequestId` - ID request gửi đến MoMo
- `momoOrderId` - Order ID của MoMo
- `momoTransId` - Transaction ID từ MoMo
- `momoPayUrl` - URL thanh toán MoMo
- `momoResultCode` - Mã kết quả từ MoMo
- `momoMessage` - Thông báo từ MoMo

#### `PaymentMethod.java` - Thêm:
- `MOMO` enum value

#### `PaymentResponse.java` - Thêm các trường MoMo

## 🚀 Cách sử dụng

### 1. Tạo thanh toán MoMo

**Request:**
```bash
POST http://localhost:8080/api/payments
Content-Type: application/json

{
  "orderId": 12345,
  "amount": 100000,
  "paymentMethod": "MOMO"
}
```

**Response:**
```json
{
  "id": 1,
  "orderId": 12345,
  "amount": 100000,
  "status": "PENDING",
  "momoPayUrl": "https://test-payment.momo.vn/pay/...",
  "momoRequestId": "uuid-here",
  "momoOrderId": "ORDER_12345_1234567890",
  "momoResultCode": 0,
  "momoMessage": "Successful"
}
```

### 2. Redirect người dùng đến `momoPayUrl`

Frontend cần redirect người dùng đến URL trong `momoPayUrl` để thực hiện thanh toán.

### 3. MoMo callback

Sau khi người dùng thanh toán, MoMo sẽ gọi callback đến:
```
POST http://localhost:8080/api/payments/momo/callback
```

Payment status sẽ được tự động cập nhật thành `SUCCESS` hoặc `FAILED`.

### 4. Kiểm tra kết quả

```bash
GET http://localhost:8080/api/payments/momo/result?orderId=ORDER_12345_1234567890
```

## 🔐 Bảo mật

- **Signature verification**: Cần implement xác thực chữ ký từ MoMo trong callback
- **HTTPS**: Production phải sử dụng HTTPS cho callback URL
- **Secret Key**: Không commit secret key vào Git

## 📝 Cấu hình Production

Khi deploy production, cập nhật trong application.yml:

```yaml
momo:
  environment: prod
  prod:
    endpoint: https://payment.momo.vn/v2/gateway/api
    partner-code: YOUR_PROD_PARTNER_CODE
    access-key: YOUR_PROD_ACCESS_KEY
    secret-key: YOUR_PROD_SECRET_KEY
  urls:
    return-url: https://yourdomain.com/payment/result
    notify-url: https://yourdomain.com/api/payments/momo/callback
```

## 🧪 Testing

### Test với MoMo Sandbox
1. Sử dụng thông tin test credentials trong `application.yml`
2. Tạo payment request
3. Sử dụng test card/account của MoMo để thanh toán
4. Verify callback được nhận và status được cập nhật

### Test Endpoints

```bash
# Tạo payment
curl -X POST http://localhost:8084/api/payments \
  -H "Content-Type: application/json" \
  -d '{"orderId":123,"amount":50000,"paymentMethod":"MOMO"}'

# Kiểm tra payment theo orderId
curl http://localhost:8084/api/payments/order/123
```

## 📚 Tài liệu tham khảo

- [MoMo Developer Documentation](https://developers.momo.vn)
- MoMo SDK: `/javapayment/`

## ⚠️ Lưu ý

1. **Build javapayment trước**: 
   ```bash
   cd javapayment
   mvn clean package -DskipTests
   ```

2. **Cập nhật callback URL** trong MoMo Developer Console phải trùng với `notify-url` trong config

3. **Return URL** nên là trang kết quả thanh toán trên frontend

4. **Test credentials** chỉ dùng cho môi trường development

## 🐛 Troubleshooting

### Lỗi "Cannot find momopayment-1.0.jar"
- Chạy build javapayment trước: `cd javapayment && mvn clean package`

### Callback không nhận được
- Kiểm tra `notify-url` có accessible từ internet không (sử dụng ngrok cho local dev)
- Verify URL đã đăng ký trong MoMo Developer Console

### ResultCode != 0
- Kiểm tra credentials trong application.yml
- Xem message để biết lỗi cụ thể

