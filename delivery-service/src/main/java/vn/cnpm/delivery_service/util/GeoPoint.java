package vn.cnpm.delivery_service.util;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Điểm GPS (Latitude, Longitude)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeoPoint {
    private double lat;
    private double lng;

    /**
     * Tính khoảng cách đến điểm khác (km) - Haversine formula
     */
    public double distanceTo(GeoPoint other) {
        final int R = 6371; // Bán kính trái đất (km)

        double lat1Rad = Math.toRadians(this.lat);
        double lat2Rad = Math.toRadians(other.lat);
        double deltaLat = Math.toRadians(other.lat - this.lat);
        double deltaLng = Math.toRadians(other.lng - this.lng);

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                   Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                   Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    /**
     * Tính điểm giữa theo tỷ lệ (0.0 - 1.0)
     * ratio = 0.0 => điểm hiện tại
     * ratio = 1.0 => điểm đích
     */
    public GeoPoint interpolate(GeoPoint destination, double ratio) {
        double lat = this.lat + (destination.lat - this.lat) * ratio;
        double lng = this.lng + (destination.lng - this.lng) * ratio;
        return new GeoPoint(lat, lng);
    }

    @Override
    public String toString() {
        return String.format("(%.6f, %.6f)", lat, lng);
    }
}


