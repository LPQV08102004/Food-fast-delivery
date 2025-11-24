import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin, CreditCard, Wallet, Banknote,
  Check, ArrowLeft, ShoppingBag, UtensilsCrossed,
  CheckCircle
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Separator } from "../components/ui/separator";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import { useCart } from "../contexts/CartContext";
import authService from "../services/authService";
import orderService from "../services/orderService";
import paymentService from "../services/paymentService";

const DELIVERY_FEE = 3.5;
const TAX_RATE = 0.1;

// Step Indicator Component
function StepIndicator({ currentStep }) {
  const steps = [
    { number: 1, title: "Cart" },
    { number: 2, title: "Delivery" },
    { number: 3, title: "Payment" },
  ];

  return (
    <div className="w-full bg-white py-6 px-4 mb-8 border-b">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
            <div
              className="h-full bg-orange-600 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  currentStep > step.number
                    ? "bg-orange-600 border-orange-600 text-white"
                    : currentStep === step.number
                    ? "bg-orange-600 border-orange-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <span
                className={`text-sm ${
                  currentStep >= step.number ? "text-gray-900 font-medium" : "text-gray-400"
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const { cartItems, getSubtotal, clearCart } = useCart();
  const [user, setUser] = useState(null);
  const [currentStep] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderResponse, setOrderResponse] = useState(null); // Thêm state để lưu full response

  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    notes: ""
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast.error("Please login to continue");
      navigate('/login');
      return;
    }
    setUser(currentUser);

    // Pre-fill delivery info if user has data
    if (currentUser.fullName) {
      setDeliveryInfo(prev => ({
        ...prev,
        fullName: currentUser.fullName,
        phone: currentUser.phone || ""
      }));
    }

    // Check if cart is empty
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const subtotal = getSubtotal();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + DELIVERY_FEE;

  const handlePlaceOrder = async () => {
    // Validate delivery info
    if (!deliveryInfo.fullName || !deliveryInfo.phone || !deliveryInfo.address || !deliveryInfo.city) {
      toast.error("Please fill in all delivery information");
      return;
    }

    setIsProcessing(true);

    try {
      // Get restaurantId from cart items (all items should be from same restaurant)
      const restaurantId = cartItems[0]?.restaurantId;
      
      if (!restaurantId) {
        toast.error("Invalid cart items. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Map payment method to backend format
      let backendPaymentMethod = paymentMethod;
      if (paymentMethod === 'momo') {
        backendPaymentMethod = 'MOMO';
      } else if (paymentMethod === 'cash') {
        backendPaymentMethod = 'CASH';
      }

      // Prepare order data
      const orderData = {
        userId: user.id,
        restaurantId: restaurantId,
        items: cartItems.map(item => {
          const productId = parseInt(item.id);
          if (isNaN(productId) || productId <= 0) {
            throw new Error(`Invalid product ID: ${item.id}`);
          }
          return {
            productId: productId,
            quantity: item.quantity
          };
        }),
        deliveryInfo: deliveryInfo,
        paymentMethod: backendPaymentMethod,
        subtotal: subtotal,
        tax: tax,
        deliveryFee: DELIVERY_FEE,
        totalPrice: total
      };

      // Create order via API
      const response = await orderService.createOrder(orderData);

      setOrderId(response.id);
      setOrderResponse(response);

      // Xử lý theo payment method
      if (paymentMethod === 'momo') {
        // Lấy payment info để có momoPayUrl qua paymentService
        try {
          console.log('Fetching payment info for order:', response.id);
          const paymentData = await paymentService.getPaymentByOrderId(response.id);
          
          console.log('Payment data received:', paymentData);
          
          // Kiểm tra có momoPayUrl không
          if (paymentData.momoPayUrl) {
            // Lưu orderId vào localStorage để check sau khi redirect về
            localStorage.setItem('pendingOrderId', response.id);
            localStorage.setItem('pendingPaymentOrderId', paymentData.momoOrderId);
            
            // Clear cart trước khi redirect
            clearCart();
            
            console.log('Redirecting to MoMo:', paymentData.momoPayUrl);
            // Redirect đến MoMo payment page
            window.location.href = paymentData.momoPayUrl;
            return; // Stop execution
          } else {
            console.error('MoMo payment URL not available in response:', paymentData);
            throw new Error('MoMo payment URL not available');
          }
        } catch (error) {
          console.error('Error getting MoMo payment URL:', error);
          toast.error(error.message || 'Failed to initiate MoMo payment. Please try again.');
          setIsProcessing(false);
          return;
        }
      } else if (paymentMethod === 'cash') {
        // Cash on delivery - show success immediately
        clearCart();
        setShowSuccessDialog(true);
        toast.success("Order placed successfully! Pay on delivery.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    navigate('/orders');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-orange-600 p-1.5 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-orange-600">FoodFast</span>
            </Link>

            <Button
              variant="ghost"
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Button>
          </div>
        </div>
      </header>

      <StepIndicator currentStep={currentStep} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={deliveryInfo.fullName}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="+1 234 567 8900"
                      value={deliveryInfo.phone}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street, Apt 4B"
                    value={deliveryInfo.address}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    value={deliveryInfo.city}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, city: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Ring doorbell, leave at door, etc."
                    value={deliveryInfo.notes}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, notes: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="momo" id="momo" />
                      <Label htmlFor="momo" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Wallet className="w-5 h-5 text-pink-600" />
                        <span>MoMo E-Wallet</span>
                        <span className="ml-auto text-xs text-pink-600 font-semibold">Recommended</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Banknote className="w-5 h-5" />
                        Cash on Delivery
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {paymentMethod === "momo" && (
                  <div className="mt-6 p-4 bg-pink-50 border border-pink-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Wallet className="w-5 h-5 text-pink-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Pay with MoMo</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          You will be redirected to MoMo payment gateway to complete your payment securely.
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Fast and secure payment</li>
                          <li>• Instant confirmation</li>
                          <li>• Multiple payment options in MoMo app</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "cash" && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Banknote className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Cash on Delivery</h4>
                        <p className="text-sm text-gray-600">
                          Pay with cash when your order is delivered. Please prepare exact amount if possible.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-md sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-orange-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>${DELIVERY_FEE.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold"
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  By placing your order, you agree to our Terms & Conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center text-center py-6"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-1">Order ID: #{orderId}</p>
            <p className="text-gray-600 mb-6">Your delicious food is on its way!</p>

            {/* Payment status message */}
            {orderResponse && (
              <p className="text-gray-600 mb-4">
                Payment Status:{" "}
                <span className={orderResponse.paymentStatus === 'SUCCESS' ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {orderResponse.paymentStatus}
                </span>
              </p>
            )}

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => navigate('/products')}
                className="flex-1"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={handleSuccessDialogClose}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                View Orders
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
