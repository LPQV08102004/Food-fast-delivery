package vn.cnpm.paymentservice.model;

import lombok.Getter;

@Getter
public enum PaymentMethod {
    CARD,
    WALLET,
    CASH,
    MOMO,
    OTHER;

    public static PaymentMethod fromString(String s) {
        if (s == null) return OTHER;
        try {
            return PaymentMethod.valueOf(s.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return OTHER;
        }
    }
}
