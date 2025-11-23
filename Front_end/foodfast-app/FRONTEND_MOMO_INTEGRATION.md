# 🎨 FRONTEND MOMO INTEGRATION GUIDE

## 📋 Tổng quan

Frontend đã được tích hợp đầy đủ với **MoMo Payment Gateway**. Tài liệu này mô tả các thay đổi và cách hoạt động của luồng thanh toán MoMo.

## ✅ Các thay đổi đã thực hiện

### 1. **PaymentPage.js** - Trang thanh toán

#### Thay đổi Payment Methods
- ❌ **Đã xóa:** Credit/Debit Card
- ✅ **Đã thêm:** MoMo E-Wallet (mặc định, recommended)
- ✅ **Giữ nguyên:** Cash on Delivery

#### State Updates
```javascript
// Mặc định chọn MoMo
const [paymentMethod, setPaymentMethod] = useState("momo");

// Không cần cardInfo nữa
// ❌ Đã xóa state cardInfo
```

#### Payment Method Mapping
```javascript
// Map từ frontend value sang backend format
let backendPaymentMethod = paymentMethod;
if (paymentMethod === 'momo') {
  backendPaymentMethod = 'MOMO';
} else if (paymentMethod === 'cash') {
  backendPaymentMethod = 'CASH';
}
```

#### Xử lý MoMo Payment Flow
```javascript
// Sau khi tạo order thành công
if (paymentMethod === 'momo') {
  // 1. Lấy payment info để có momoPayUrl
  const paymentResponse = await fetch(`http://localhost:8084/api/payments/order/${response.id}`);
  const paymentData = await paymentResponse.json();
  
  // 2. Lưu orderId vào localStorage
  localStorage.setItem('pendingOrderId', response.id);
  localStorage.setItem('pendingPaymentOrderId', paymentData.momoOrderId);
  
  // 3. Clear cart
  clearCart();
  
  // 4. Redirect đến MoMo payment page
  window.location.href = paymentData.momoPayUrl;
}
```

#### UI Changes
```jsx
{/* MoMo Option với badge "Recommended" */}
<div className="flex items-center space-x-3 p-4 border rounded-lg">
  <RadioGroupItem value="momo" id="momo" />
  <Label htmlFor="momo">
    <Wallet className="w-5 h-5 text-pink-600" />
    <span>MoMo E-Wallet</span>
    <span className="text-pink-600 font-semibold">Recommended</span>
  </Label>
</div>

{/* Thông tin về MoMo khi được chọn */}
{paymentMethod === "momo" && (
  <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
    <h4>Pay with MoMo</h4>
    <p>You will be redirected to MoMo payment gateway...</p>
    <ul>
      <li>• Fast and secure payment</li>
      <li>• Instant confirmation</li>
      <li>• Multiple payment options in MoMo app</li>
    </ul>
  </div>
)}
```

### 2. **PaymentResultPage.js** - Trang kết quả thanh toán (MỚI)

#### Mục đích
- Nhận callback từ MoMo sau khi user thanh toán
- Kiểm tra payment status
- Hiển thị kết quả thanh toán (Success/Failed)

#### Flow hoạt động
```
1. User thanh toán trên MoMo
   ↓
2. MoMo redirect về: http://localhost:3000/payment/result?orderId=XXX&resultCode=0
   ↓
3. PaymentResultPage đọc parameters
   ↓
4. Gọi API kiểm tra payment status
   ↓
5. Hiển thị kết quả + actions
```

#### Code chính
```javascript
const checkPaymentResult = async () => {
  // Lấy params từ URL
  const momoOrderId = searchParams.get('orderId');
  const resultCode = searchParams.get('resultCode');
  
  // Lấy orderId từ localStorage
  const pendingOrderId = localStorage.getItem('pendingOrderId');
  
  // Gọi API kiểm tra
  const response = await fetch(
    `http://localhost:8084/api/payments/momo/result?orderId=${momoOrderId}&resultCode=${resultCode}`
  );
  const data = await response.json();
  
  // Xác định status
  if (data.resultCode === 0 || data.status === 'SUCCESS') {
    setPaymentStatus('success');
    localStorage.removeItem('pendingOrderId');
    localStorage.removeItem('pendingPaymentOrderId');
  } else {
    setPaymentStatus('failed');
  }
};
```

#### UI States

**Processing:**
```jsx
<Loader2 className="animate-spin" />
<h2>Processing Payment...</h2>
<p>Please wait while we verify your payment</p>
```

**Success:**
```jsx
<CheckCircle className="text-green-600" />
<h2>Payment Successful!</h2>
<p>Order ID: #{orderId}</p>
<div>
  <p>Amount Paid: $XX.XX</p>
  <p>Payment Method: MoMo E-Wallet</p>
  <p>Status: Paid</p>
</div>
<Button onClick={() => navigate('/orders')}>View My Orders</Button>
<Button onClick={() => navigate('/products')}>Continue Shopping</Button>
```

**Failed:**
```jsx
<XCircle className="text-red-600" />
<h2>Payment Failed</h2>
<p>Your payment could not be processed</p>
<div className="bg-red-50">
  <p>Error Code: {resultCode}</p>
  <p>Message: {message}</p>
</div>
<Button onClick={() => navigate('/cart')}>Back to Cart</Button>
```

### 3. **paymentService.js** - Service layer

#### MoMo APIs đã thêm

```javascript
// Lấy MoMo payment result
getMoMoPaymentResult: async (orderId, resultCode) => {
  const response = await api.get(`/payments/momo/result`, {
    params: { orderId, resultCode }
  });
  return response.data;
},

// Xử lý MoMo callback
handleMoMoCallback: async (callbackData) => {
  const response = await api.post('/payments/momo/callback', callbackData);
  return response.data;
},
```

### 4. **App.js** - Routing

#### Route mới
```javascript
import PaymentResultPage from './pages/PaymentResultPage';

// Route cho payment result
<Route 
  path="/payment/result" 
  element={
    <UserRoute>
      <PaymentResultPage />
    </UserRoute>
  } 
/>
```

## 🔄 Luồng hoạt động chi tiết

### User Story: Thanh toán với MoMo

```
1. User vào trang Cart
   → Click "Proceed to Payment"
   
2. PaymentPage hiển thị
   → MoMo được chọn mặc định (recommended)
   → User nhập delivery info
   → Click "Place Order"
   
3. Frontend xử lý
   → Validate delivery info
   → Gọi orderService.createOrder() với paymentMethod: "MOMO"
   → Nhận response với orderId
   
4. Frontend lấy payment info
   → Gọi GET /api/payments/order/{orderId}
   → Nhận momoPayUrl
   → Lưu orderId vào localStorage
   → Clear cart
   → Redirect đến momoPayUrl
   
5. User trên trang MoMo
   → Nhập số điện thoại MoMo
   → Nhập PIN/OTP
   → Xác nhận thanh toán
   
6. MoMo xử lý
   → Thanh toán thành công/thất bại
   → Gọi callback đến backend (notify-url)
   → Redirect user về frontend (return-url)
   
7. PaymentResultPage hiển thị
   → Đọc parameters từ URL
   → Gọi API kiểm tra payment status
   → Hiển thị Success hoặc Failed
   → User có thể View Orders hoặc Continue Shopping
```

## 🎯 Test Flow

### Test Case 1: Thanh toán MoMo thành công

1. **Login** và add items vào cart
2. **Checkout** → Chọn MoMo (mặc định)
3. **Nhập delivery info** → Click "Place Order"
4. **Kiểm tra:**
   - ✅ Redirect đến MoMo payment page
   - ✅ URL bắt đầu với `https://test-payment.momo.vn`
   - ✅ Cart đã được clear
5. **Trên MoMo:**
   - Nhập SĐT test: `0909000000`
   - Nhập OTP: `123456`
   - Click "Xác nhận"
6. **Kiểm tra redirect về:**
   - ✅ URL: `http://localhost:3000/payment/result?orderId=XXX&resultCode=0`
   - ✅ Hiển thị "Payment Successful"
   - ✅ Order ID hiển thị đúng
   - ✅ Amount hiển thị đúng
7. **Click "View My Orders":**
   - ✅ Redirect đến `/orders`
   - ✅ Order hiển thị với status SUCCESS

### Test Case 2: Thanh toán Cash on Delivery

1. **Checkout** → Chọn "Cash on Delivery"
2. **Nhập delivery info** → Click "Place Order"
3. **Kiểm tra:**
   - ✅ KHÔNG redirect đến MoMo
   - ✅ Hiển thị Success Dialog ngay lập tức
   - ✅ Toast: "Order placed successfully! Pay on delivery."
   - ✅ Cart được clear
4. **Click "View Orders":**
   - ✅ Order có payment method = CASH
   - ✅ Payment status = PENDING hoặc COD

### Test Case 3: MoMo API lỗi

1. **Stop payment-service** hoặc sửa MoMo credentials sai
2. **Checkout** với MoMo
3. **Kiểm tra:**
   - ✅ Hiển thị error: "Failed to initiate MoMo payment"
   - ✅ KHÔNG redirect
   - ✅ Cart KHÔNG bị clear
   - ✅ User có thể thử lại

### Test Case 4: User cancel thanh toán trên MoMo

1. **Checkout** với MoMo → Redirect thành công
2. **Trên MoMo:** Click "Hủy" hoặc "Quay lại"
3. **Kiểm tra redirect về:**
   - ✅ URL: `http://localhost:3000/payment/result?orderId=XXX&resultCode=1004`
   - ✅ Hiển thị "Payment Failed"
   - ✅ Error message: "Transaction cancelled"
4. **Click "Back to Cart":**
   - ✅ Redirect đến `/cart`
   - ⚠️ Cart đã bị clear (cần handle)

## 📱 UI/UX Improvements

### Payment Method Selection
- MoMo có badge "Recommended" màu hồng
- Icon Wallet màu hồng (#ec4899) cho MoMo
- Info box màu hồng nhạt khi chọn MoMo
- Info box màu vàng nhạt khi chọn Cash

### Loading States
- Button "Place Order" → "Processing..." khi đang xử lý
- Spinner animation trên PaymentResultPage khi checking

### Animations
- Success/Failed icons scale in với spring animation
- Smooth transitions

## 🔧 Configuration

### Backend (payment-service)

**application.yml:**
```yaml
momo:
  urls:
    return-url: http://localhost:3000/payment/result  # Frontend route
    notify-url: http://localhost:8080/api/payments/momo/callback  # Backend endpoint
```

### Frontend

**Payment Service URL:**
```javascript
// Trong PaymentPage.js
const paymentResponse = await fetch(`http://localhost:8084/api/payments/order/${response.id}`);

// Trong PaymentResultPage.js
const response = await fetch(
  `http://localhost:8084/api/payments/momo/result?orderId=${orderIdToCheck}&resultCode=${resultCode}`
);
```

**⚠️ Production:** Thay `http://localhost:8084` bằng actual backend URL

## 🐛 Known Issues & TODOs

### Issues
1. **Cart bị clear khi cancel MoMo**
   - Hiện tại: Cart clear trước khi redirect
   - TODO: Chỉ clear cart sau khi payment success

2. **localStorage không sync giữa tabs**
   - Nếu user mở nhiều tab, localStorage có thể conflict
   - TODO: Use sessionStorage hoặc check orderId từ backend

3. **Không có retry mechanism**
   - Nếu check payment status failed, không có retry
   - TODO: Add retry với exponential backoff

### Enhancements
1. **Loading skeleton** trên PaymentResultPage
2. **Order summary** trên PaymentResultPage
3. **Download receipt** button
4. **Share order** functionality
5. **Payment history** tracking

## 📚 Files Changed Summary

```
Frontend (foodfast-app):
├── src/
│   ├── pages/
│   │   ├── PaymentPage.js          ✏️ Modified
│   │   └── PaymentResultPage.js    ✨ New
│   ├── services/
│   │   └── paymentService.js       ✏️ Modified
│   └── App.js                      ✏️ Modified

Backend (payment-service):
├── src/main/resources/
│   └── application.yml             ✅ Already configured
```

## 🚀 Deployment Checklist

### Development
- [x] PaymentPage updated
- [x] PaymentResultPage created
- [x] Routes configured
- [x] MoMo URLs configured
- [ ] Test all payment flows
- [ ] Test error scenarios

### Production
- [ ] Update MoMo credentials in application.yml
- [ ] Update return-url to production domain
- [ ] Update notify-url to production domain
- [ ] Update frontend API URLs
- [ ] Test with real MoMo account
- [ ] Setup monitoring & alerts
- [ ] Load testing

## 🎉 Kết luận

Frontend đã được tích hợp đầy đủ với MoMo Payment Gateway:

✅ **User Experience:**
- Chọn MoMo làm payment method mặc định
- Redirect mượt mà đến MoMo
- Nhận kết quả thanh toán rõ ràng
- UI/UX đẹp và responsive

✅ **Technical:**
- Proper error handling
- Loading states
- LocalStorage management
- API integration

✅ **Security:**
- Payment validation ở backend
- Callback verification
- No sensitive data in frontend

**User giờ có thể thanh toán an toàn và nhanh chóng qua MoMo!** 🎯✨
