import { useState } from 'react';
import { Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

interface OrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  onCheckout: () => void;
  onApplyCoupon: (code: string) => void;
}

export function OrderSummary({ subtotal, deliveryFee, discount, onCheckout, onApplyCoupon }: OrderSummaryProps) {
  const [couponCode, setCouponCode] = useState('');
  const total = subtotal + deliveryFee - discount;

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      onApplyCoupon(couponCode);
      setCouponCode('');
    }
  };

  return (
    <Card className="p-6 h-fit sticky top-24">
      <h2 className="text-gray-900 mb-6">Order Summary</h2>

      {/* Subtotal */}
      <div className="flex justify-between mb-3">
        <span className="text-gray-600">Subtotal</span>
        <span className="text-gray-900">${subtotal.toFixed(2)}</span>
      </div>

      {/* Delivery Fee */}
      <div className="flex justify-between mb-3">
        <span className="text-gray-600">Delivery Fee</span>
        <span className="text-gray-900">${deliveryFee.toFixed(2)}</span>
      </div>

      {/* Discount */}
      {discount > 0 && (
        <div className="flex justify-between mb-3">
          <span className="text-green-600">Discount</span>
          <span className="text-green-600">-${discount.toFixed(2)}</span>
        </div>
      )}

      <div className="border-t border-gray-200 my-4"></div>

      {/* Coupon Code */}
      <div className="mb-6">
        <label className="text-gray-700 text-sm mb-2 block">Have a coupon code?</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Enter code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleApplyCoupon}
            className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-600"
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between mb-6 p-4 bg-orange-50 rounded-lg">
        <span className="text-gray-900">Total</span>
        <span className="text-orange-600">${total.toFixed(2)}</span>
      </div>

      {/* Checkout Button */}
      <Button 
        className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12"
        onClick={onCheckout}
      >
        Proceed to Checkout
      </Button>

      <p className="text-gray-500 text-xs text-center mt-4">
        You will be redirected to the payment page upon checkout.
      </p>
    </Card>
  );
}
