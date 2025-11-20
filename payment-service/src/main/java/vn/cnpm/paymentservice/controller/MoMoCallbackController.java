package vn.cnpm.paymentservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.cnpm.paymentservice.model.Payment;
import vn.cnpm.paymentservice.model.PaymentStatus;
import vn.cnpm.paymentservice.repository.PaymentRepository;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/momo")
@RequiredArgsConstructor
@Slf4j
public class MoMoCallbackController {

    private final PaymentRepository paymentRepository;

    /**
     * Nhận callback từ MoMo sau khi người dùng thanh toán
     */
    @PostMapping("/callback")
    public ResponseEntity<?> handleCallback(@RequestBody Map<String, Object> callbackData) {
        try {
            log.info("Received MoMo callback: {}", callbackData);

            String orderId = (String) callbackData.get("orderId");
            String requestId = (String) callbackData.get("requestId");
            Integer resultCode = (Integer) callbackData.get("resultCode");
            String message = (String) callbackData.get("message");
            String transId = callbackData.get("transId") != null ?
                    callbackData.get("transId").toString() : null;

            // Tìm payment record
            Payment payment = paymentRepository.findByMomoOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Payment not found for orderId: " + orderId));

            // Cập nhật trạng thái
            if (resultCode == 0) {
                payment.setStatus(PaymentStatus.SUCCESS);
                log.info("Payment successful for order: {}", orderId);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                log.warn("Payment failed for order: {} with code: {}", orderId, resultCode);
            }

            payment.setMomoTransId(transId);
            payment.setMomoResultCode(resultCode);
            payment.setMomoMessage(message);

            paymentRepository.save(payment);

            // Trả về response cho MoMo
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Callback processed"
            ));

        } catch (Exception e) {
            log.error("Error processing MoMo callback", e);
            return ResponseEntity.status(500).body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Endpoint để frontend kiểm tra kết quả thanh toán
     */
    @GetMapping("/result")
    public ResponseEntity<?> getPaymentResult(
            @RequestParam String orderId,
            @RequestParam(required = false) String resultCode
    ) {
        try {
            log.info("Checking payment result for orderId: {}", orderId);

            Payment payment = paymentRepository.findByMomoOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            return ResponseEntity.ok(Map.of(
                    "orderId", payment.getOrderId(),
                    "status", payment.getStatus(),
                    "amount", payment.getAmount(),
                    "resultCode", payment.getMomoResultCode() != null ? payment.getMomoResultCode() : 0,
                    "message", payment.getMomoMessage() != null ? payment.getMomoMessage() : ""
            ));

        } catch (Exception e) {
            log.error("Error getting payment result", e);
            return ResponseEntity.status(404).body(Map.of(
                    "status", "error",
                    "message", "Payment not found"
            ));
        }
    }
}

