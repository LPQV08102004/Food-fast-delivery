package vn.cnpm.paymentservice.config;

import com.mservice.config.Environment;
import com.mservice.config.PartnerInfo;
import com.mservice.config.MoMoEndpoint;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "momo")
@Data
public class MoMoConfig {

    private String environment;
    private DevConfig dev;
    private ProdConfig prod;
    private UrlsConfig urls;

    @Data
    public static class DevConfig {
        private String endpoint;
        private String partnerCode;
        private String accessKey;
        private String secretKey;
    }

    @Data
    public static class ProdConfig {
        private String endpoint;
        private String partnerCode;
        private String accessKey;
        private String secretKey;
    }

    @Data
    public static class UrlsConfig {
        private String returnUrl;
        private String notifyUrl;
    }

    @Bean
    public Environment momoEnvironment() {
        String partnerCode;
        String accessKey;
        String secretKey;
        String endpoint;

        if ("prod".equalsIgnoreCase(environment)) {
            partnerCode = prod.getPartnerCode();
            accessKey = prod.getAccessKey();
            secretKey = prod.getSecretKey();
            endpoint = prod.getEndpoint();
        } else {
            partnerCode = dev.getPartnerCode();
            accessKey = dev.getAccessKey();
            secretKey = dev.getSecretKey();
            endpoint = dev.getEndpoint();
        }

        PartnerInfo partnerInfo = new PartnerInfo(partnerCode, accessKey, secretKey);

        MoMoEndpoint momoEndpoint = new MoMoEndpoint(
                endpoint,
                "/create",
                "/refund",
                "/query",
                "/confirm",
                "/pay/app",
                "/pay/bind",
                "/pay/query-cbtoken",
                "/pay/delete"
        );

        return new Environment(momoEndpoint, partnerInfo, "dev");
    }

    public String getReturnUrl() {
        return urls != null ? urls.getReturnUrl() : "http://localhost:3000/payment/result";
    }

    public String getNotifyUrl() {
        return urls != null ? urls.getNotifyUrl() : "http://localhost:8080/api/payments/momo/callback";
    }
}
