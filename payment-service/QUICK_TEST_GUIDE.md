# 🧪 HƯỚNG DẪN TEST NHANH - MoMo Payment Fix

## 🚀 Khởi động lại Payment Service

```powershell
cd c:\Study\CNPM\Food-fast-delivery\payment-service
gradlew clean build -x test
gradlew bootRun
```

## ✅ Test Case 1: Reject payment method không phải MOMO

### Sử dụng PowerShell:
```powershell
$body = @{
    orderId = 123
    amount = 50000
    paymentMethod = "CASH"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8084/api/payments" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Kết quả mong đợi:
```
Invoke-RestMethod : Only MOMO payment method is supported at this time
```

**✅ PASS** nếu nhận được error message này.

---

## ✅ Test Case 2: Reject khi không có paymentMethod

### PowerShell:
```powershell
$body = @{
    orderId = 123
    amount = 50000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8084/api/payments" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Kết quả mong đợi:
```
Invoke-RestMethod : Payment method is required
```

**✅ PASS** nếu nhận được error message này.

---

## ✅ Test Case 3: Tạo payment MOMO thành công

### PowerShell:
```powershell
$body = @{
    orderId = 123
    amount = 50000
    paymentMethod = "MOMO"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8084/api/payments" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

# Hiển thị kết quả
$response | ConvertTo-Json -Depth 3

# Kiểm tra có momoPayUrl không
if ($response.momoPayUrl) {
    Write-Host "✅ PASS: momoPayUrl = $($response.momoPayUrl)" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: momoPayUrl is missing" -ForegroundColor Red
}

# Kiểm tra status
if ($response.status -eq "PENDING") {
    Write-Host "✅ PASS: status = PENDING" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: status = $($response.status)" -ForegroundColor Red
}
```

### Kết quả mong đợi:
```json
{
  "id": 1,
  "orderId": 123,
  "amount": 50000.0,
  "status": "PENDING",
  "momoPayUrl": "https://test-payment.momo.vn/pay/store/...",
  "momoRequestId": "uuid-here",
  "momoOrderId": "ORDER_123_1234567890",
  "momoResultCode": 0,
  "momoMessage": "Successful"
}
```

**✅ PASS** nếu:
- `momoPayUrl` có giá trị (không null/empty)
- `status` = "PENDING"
- `momoOrderId` bắt đầu với "ORDER_"

---

## ✅ Test Case 4: Simulate MoMo callback - Success

### PowerShell:
```powershell
# Lấy payment info trước
$payment = Invoke-RestMethod -Uri "http://localhost:8084/api/payments/order/123" -Method Get

# Tạo callback request
$callbackBody = @{
    orderId = $payment.momoOrderId
    requestId = $payment.momoRequestId
    resultCode = 0
    message = "Successful"
    transId = "9876543210"
    amount = 50000
} | ConvertTo-Json

# Gửi callback
$callbackResponse = Invoke-RestMethod -Uri "http://localhost:8084/api/payments/momo/callback" `
    -Method Post `
    -ContentType "application/json" `
    -Body $callbackBody

Write-Host "Callback response: $($callbackResponse | ConvertTo-Json)" -ForegroundColor Cyan

# Kiểm tra payment đã update chưa
Start-Sleep -Seconds 1
$updatedPayment = Invoke-RestMethod -Uri "http://localhost:8084/api/payments/order/123" -Method Get

if ($updatedPayment.status -eq "SUCCESS") {
    Write-Host "✅ PASS: Payment status updated to SUCCESS" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: Payment status = $($updatedPayment.status)" -ForegroundColor Red
}

if ($updatedPayment.momoTransId -eq "9876543210") {
    Write-Host "✅ PASS: momoTransId saved correctly" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: momoTransId = $($updatedPayment.momoTransId)" -ForegroundColor Red
}
```

**✅ PASS** nếu:
- Payment status = "SUCCESS"
- momoTransId = "9876543210"

---

## ✅ Test Case 5: Callback với requestId sai

### PowerShell:
```powershell
$payment = Invoke-RestMethod -Uri "http://localhost:8084/api/payments/order/123" -Method Get

$callbackBody = @{
    orderId = $payment.momoOrderId
    requestId = "wrong-request-id-12345"  # Sai requestId
    resultCode = 0
    message = "Successful"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8084/api/payments/momo/callback" `
    -Method Post `
    -ContentType "application/json" `
    -Body $callbackBody
```

**✅ PASS** nếu nhận được error:
```
Invoke-RestMethod : Invalid requestId
```

---

## ✅ Test Case 6: Callback duplicate (payment đã SUCCESS)

### PowerShell:
```powershell
# Giả sử payment đã SUCCESS từ Test Case 4
$payment = Invoke-RestMethod -Uri "http://localhost:8084/api/payments/order/123" -Method Get

# Gửi lại callback
$callbackBody = @{
    orderId = $payment.momoOrderId
    requestId = $payment.momoRequestId
    resultCode = 0
    message = "Successful"
    transId = "different-trans-id-999"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8084/api/payments/momo/callback" `
    -Method Post `
    -ContentType "application/json" `
    -Body $callbackBody

if ($response.message -eq "Payment already processed") {
    Write-Host "✅ PASS: Duplicate callback handled correctly" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: Response = $($response | ConvertTo-Json)" -ForegroundColor Red
}

# Verify transId KHÔNG bị ghi đè
$payment2 = Invoke-RestMethod -Uri "http://localhost:8084/api/payments/order/123" -Method Get
if ($payment2.momoTransId -eq "9876543210") {  # TransId gốc từ Test Case 4
    Write-Host "✅ PASS: TransId not overwritten" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: TransId changed to $($payment2.momoTransId)" -ForegroundColor Red
}
```

**✅ PASS** nếu:
- Response message = "Payment already processed"
- momoTransId vẫn giữ nguyên giá trị cũ (không bị ghi đè)

---

## 🎯 Chạy tất cả tests một lượt

### PowerShell Script:
```powershell
# Test Suite - MoMo Payment Fix

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "   MoMo Payment Fix - Test Suite" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

$passCount = 0
$failCount = 0

# Test 1: Reject CASH
Write-Host "Test 1: Reject payment method CASH" -ForegroundColor Cyan
try {
    $body = @{ orderId = 100; amount = 50000; paymentMethod = "CASH" } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8084/api/payments" -Method Post -ContentType "application/json" -Body $body -ErrorAction Stop
    Write-Host "❌ FAIL: Should reject CASH" -ForegroundColor Red
    $failCount++
} catch {
    if ($_.Exception.Message -match "MOMO.*supported") {
        Write-Host "✅ PASS" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "❌ FAIL: Wrong error message" -ForegroundColor Red
        $failCount++
    }
}

# Test 2: Reject no paymentMethod
Write-Host "`nTest 2: Reject missing paymentMethod" -ForegroundColor Cyan
try {
    $body = @{ orderId = 101; amount = 50000 } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8084/api/payments" -Method Post -ContentType "application/json" -Body $body -ErrorAction Stop
    Write-Host "❌ FAIL: Should reject missing payment method" -ForegroundColor Red
    $failCount++
} catch {
    if ($_.Exception.Message -match "required") {
        Write-Host "✅ PASS" -ForegroundColor Green
        $passCount++
    } else {
        Write-Host "❌ FAIL: Wrong error message" -ForegroundColor Red
        $failCount++
    }
}

# Test 3: Accept MOMO with URL
Write-Host "`nTest 3: Accept MOMO payment" -ForegroundColor Cyan
try {
    $orderId = Get-Random -Minimum 1000 -Maximum 9999
    $body = @{ orderId = $orderId; amount = 50000; paymentMethod = "MOMO" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:8084/api/payments" -Method Post -ContentType "application/json" -Body $body
    
    if ($response.momoPayUrl -and $response.status -eq "PENDING") {
        Write-Host "✅ PASS: Payment created with URL" -ForegroundColor Green
        $passCount++
        
        # Save for next tests
        $script:testOrderId = $orderId
        $script:testPayment = $response
    } else {
        Write-Host "❌ FAIL: Missing momoPayUrl or wrong status" -ForegroundColor Red
        $failCount++
    }
} catch {
    Write-Host "❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $failCount++
}

# Test 4: Callback success
if ($script:testPayment) {
    Write-Host "`nTest 4: Process successful callback" -ForegroundColor Cyan
    try {
        $callbackBody = @{
            orderId = $script:testPayment.momoOrderId
            requestId = $script:testPayment.momoRequestId
            resultCode = 0
            message = "Successful"
            transId = "TEST_TRANS_123"
            amount = 50000
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri "http://localhost:8084/api/payments/momo/callback" -Method Post -ContentType "application/json" -Body $callbackBody | Out-Null
        Start-Sleep -Seconds 1
        
        $updated = Invoke-RestMethod -Uri "http://localhost:8084/api/payments/order/$($script:testOrderId)" -Method Get
        
        if ($updated.status -eq "SUCCESS" -and $updated.momoTransId -eq "TEST_TRANS_123") {
            Write-Host "✅ PASS: Callback processed correctly" -ForegroundColor Green
            $passCount++
        } else {
            Write-Host "❌ FAIL: Status or transId incorrect" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "   Test Results" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "✅ Passed: $passCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red

if ($failCount -eq 0) {
    Write-Host "`n🎉 All tests PASSED! Payment fix working correctly." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Please review the changes." -ForegroundColor Yellow
}
```

### Chạy test suite:
1. Copy toàn bộ script trên
2. Paste vào PowerShell
3. Enter để chạy

---

## 📊 Kết quả mong đợi

```
========================================
   MoMo Payment Fix - Test Suite
========================================

Test 1: Reject payment method CASH
✅ PASS

Test 2: Reject missing paymentMethod
✅ PASS

Test 3: Accept MOMO payment
✅ PASS: Payment created with URL

Test 4: Process successful callback
✅ PASS: Callback processed correctly

========================================
   Test Results
========================================
✅ Passed: 4
❌ Failed: 0

🎉 All tests PASSED! Payment fix working correctly.
```

---

## 🔍 Kiểm tra logs

Xem logs của Payment Service trong terminal đang chạy `gradlew bootRun`:

### Logs khi reject CASH:
```
ERROR ... : Unsupported payment method: CASH
```

### Logs khi tạo MOMO payment thành công:
```
INFO  ... : Creating payment for order 123 with method MOMO
INFO  ... : Creating MoMo payment - OrderID: ORDER_123_..., Amount: 50000, RequestID: ...
INFO  ... : MoMo payment created successfully - PayUrl: https://test-payment.momo.vn/...
INFO  ... : MoMo payment initiated successfully for order 123 - PayURL: ...
```

### Logs khi nhận callback:
```
INFO  ... : Received MoMo callback: {orderId=ORDER_123_..., requestId=..., resultCode=0, ...}
INFO  ... : Payment successful for order: ORDER_123_... with transId: TEST_TRANS_123
```

---

## ✅ Checklist hoàn thành

- [ ] Payment Service đã restart với code mới
- [ ] Test 1 PASS: Reject CASH payment
- [ ] Test 2 PASS: Reject missing paymentMethod
- [ ] Test 3 PASS: Create MOMO payment with URL
- [ ] Test 4 PASS: Process callback successfully
- [ ] Test 5 PASS: Reject invalid requestId
- [ ] Test 6 PASS: Handle duplicate callback
- [ ] Logs hiển thị đúng thông tin
- [ ] Không có errors trong console

**Nếu tất cả tests PASS ✅, vấn đề đã được fix hoàn toàn!** 🎉
