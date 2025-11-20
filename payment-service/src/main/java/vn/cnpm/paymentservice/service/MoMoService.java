package vn.cnpm.paymentservice.service;

import com.mservice.config.Environment;
import com.mservice.enums.RequestType;
import com.mservice.models.PaymentResponse;
import com.mservice.processor.CreateOrderMoMo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.cnpm.paymentservice.config.MoMoConfig;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MoMoService {

    private final Environment momoEnvironment;
    private final MoMoConfig momoConfig;

    /**
     * Tạo đơn hàng thanh toán MoMo
     *
     * @param orderId ID đơn hàng
     * @param amount Số tiền thanh toán
     * @param orderInfo Thông tin đơn hàng
     * @return PaymentResponse từ MoMo
     */
    public PaymentResponse createPayment(Long orderId, Double amount, String orderInfo) {
        try {
            String momoOrderId = "ORDER_" + orderId + "_" + System.currentTimeMillis();
            String requestId = UUID.randomUUID().toString();
            String amountStr = String.valueOf(amount.longValue());
            String extraData = "";

            String returnUrl = momoConfig.getReturnUrl();
            String notifyUrl = momoConfig.getNotifyUrl();

            log.info("Creating MoMo payment - OrderID: {}, Amount: {}, RequestID: {}",
                    momoOrderId, amountStr, requestId);

            PaymentResponse response = CreateOrderMoMo.process(
                    momoEnvironment,
                    momoOrderId,
                    requestId,
                    amountStr,
                    orderInfo,
                    returnUrl,
                    notifyUrl,
                    extraData,
                    RequestType.CAPTURE_WALLET,
                    true
            );

            if (response != null) {
                log.info("MoMo payment created successfully - PayUrl: {}, ResultCode: {}",
                        response.getPayUrl(), response.getResultCode());
            } else {
                log.error("MoMo payment creation failed - Response is null");
            }

            return response;

        } catch (Exception e) {
            log.error("Error creating MoMo payment for order {}: {}", orderId, e.getMessage(), e);
            throw new RuntimeException("Failed to create MoMo payment", e);
        }
    }

    /**
     * Xác thực signature từ MoMo callback
     */
    public boolean verifySignature(String signature, String rawData) {
        // TODO: Implement signature verification
        // Use MoMo SDK's Encoder class to verify HMAC SHA256 signature
        return true;
    }

    /**
     * Truy vấn trạng thái giao dịch từ MoMo
     */
    public PaymentResponse queryTransaction(String orderId, String requestId) {
        // TODO: Implement transaction query using QueryTransactionStatus processor
        return null;
    }
}

