import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, User, MapPin, CreditCard, Wallet, Banknote, 
  Smartphone, Check, ArrowLeft, ShoppingBag, UtensilsCrossed,
  CheckCircle
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Checkbox } from "../components/ui/checkbox";
import { Separator } from "../components/ui/separator";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";

// Mock order data
const mockOrderItems = [
  { id: "1", name: "Classic Cheeseburger", quantity: 2, price: 9.99 },
  { id: "2", name: "Margherita Pizza", quantity: 1, price: 12.99 },
  { id: "3", name: "Caesar Salad", quantity: 1, price: 8.99 },
];

const DELIVERY_FEE = 3.5;

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

// Delivery Form Component
function DeliveryForm({ formData, onChange, onUseSavedAddress }) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            Delivery Information
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onUseSavedAddress}
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
          >
            Use Saved Address
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+84 123 456 789"
            value={formData.phoneNumber}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="address">Delivery Address *</Label>
          <Input
            id="address"
            placeholder="Street address, building, floor"
            value={formData.address}
            onChange={(e) => onChange("address", e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="note">Note (Optional)</Label>
          <Textarea
            id="note"
            placeholder="Add delivery instructions, gate code, etc."
            value={formData.note}
            onChange={(e) => onChange("note", e.target.value)}
            className="mt-1 resize-none"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Payment Method Component
function PaymentMethod({
  selectedMethod,
  onMethodChange,
  cardDetails,
  onCardDetailsChange,
  savePaymentMethod,
  onSavePaymentMethodChange,
}) {
  const paymentOptions = [
    {
      id: "cod",
      label: "Cash on Delivery",
      icon: Banknote,
      description: "Pay with cash when your order arrives",
    },
    {
      id: "card",
      label: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, American Express",
    },
    {
      id: "momo",
      label: "MoMo E-Wallet",
      icon: Smartphone,
      description: "Pay with MoMo digital wallet",
    },
    {
      id: "vnpay",
      label: "VNPay",
      icon: Wallet,
      description: "Payment gateway for Vietnamese cards",
    },
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-orange-600" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
          {paymentOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.id}>
                <Label
                  htmlFor={option.id}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedMethod === option.id
                      ? "border-orange-600 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Icon className="w-5 h-5 text-gray-600" />
                  <div className="flex-1">
                    <p className="text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </Label>

                {selectedMethod === "card" && option.id === "card" && (
                  <div className="mt-3 ml-8 space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="cardNumber" className="text-sm">
                        Card Number
                      </Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.cardNumber}
                        onChange={(e) => onCardDetailsChange("cardNumber", e.target.value)}
                        className="mt-1"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="expiryDate" className="text-sm">
                          Expiry Date
                        </Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={cardDetails.expiryDate}
                          onChange={(e) => onCardDetailsChange("expiryDate", e.target.value)}
                          className="mt-1"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-sm">
                          CVV
                        </Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) => onCardDetailsChange("cvv", e.target.value)}
                          className="mt-1"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === "momo" && option.id === "momo" && (
                  <div className="mt-3 ml-8 p-4 bg-gray-50 rounded-lg">
                    <Label htmlFor="momoPhone" className="text-sm">
                      MoMo Phone Number
                    </Label>
                    <Input
                      id="momoPhone"
                      placeholder="+84 123 456 789"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </RadioGroup>

        {selectedMethod !== "cod" && (
          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="savePayment"
              checked={savePaymentMethod}
              onCheckedChange={onSavePaymentMethodChange}
            />
            <Label
              htmlFor="savePayment"
              className="text-sm text-gray-600 cursor-pointer"
            >
              Save this payment method for next time
            </Label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Order Summary Component
function OrderSummary({ items, deliveryFee }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

  return (
    <Card className="shadow-md sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-orange-600" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-gray-900 font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-orange-600">${total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Success Modal Component
function SuccessModal({ isOpen, onClose, orderNumber }) {
  const navigate = useNavigate();

  const handleTrackDelivery = () => {
    onClose();
    navigate("/profile");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-600">
              🎉 Your food is being prepared.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-lg font-bold text-orange-600 tracking-wide mt-1">
                #{orderNumber}
              </p>
            </div>
            <p className="text-sm text-gray-500 pt-2">
              You will receive a confirmation SMS shortly.
            </p>
          </motion.div>

          <div className="flex gap-3 mt-6 w-full">
            <Button
              variant="outline"
              onClick={handleTrackDelivery}
              className="flex-1"
            >
              View Order
            </Button>
            <Button
              onClick={handleTrackDelivery}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              Track Delivery
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Payment Page Component
export default function PaymentPage() {
  const navigate = useNavigate();
  const [currentStep] = useState(3);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    note: "",
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeliveryChange = (field, value) => {
    setDeliveryInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleUseSavedAddress = () => {
    setDeliveryInfo({
      fullName: "John Doe",
      phoneNumber: "+84 123 456 789",
      address: "123 Main Street, District 1, Ho Chi Minh City",
      note: "Ring the doorbell twice",
    });
    toast.success("Saved address loaded successfully");
  };

  const handleCardDetailsChange = (field, value) => {
    setCardDetails((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!deliveryInfo.fullName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!deliveryInfo.phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }
    if (!deliveryInfo.address.trim()) {
      toast.error("Please enter your delivery address");
      return false;
    }
    
    if (selectedPaymentMethod === "card") {
      if (!cardDetails.cardNumber.trim() || cardDetails.cardNumber.length < 15) {
        toast.error("Please enter a valid card number");
        return false;
      }
      if (!cardDetails.expiryDate.trim()) {
        toast.error("Please enter card expiry date");
        return false;
      }
      if (!cardDetails.cvv.trim() || cardDetails.cvv.length < 3) {
        toast.error("Please enter a valid CVV");
        return false;
      }
    }
    
    return true;
  };

  const total = mockOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + DELIVERY_FEE;
  const isOrderEmpty = mockOrderItems.length === 0;

  const handleConfirmPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        setShowSuccessModal(true);
      } else {
        toast.error("Payment failed, please try again");
      }
    }, 2000);
  };

  const handleBackToCart = () => {
    navigate("/products");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-orange-600 p-1.5 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-orange-600">FoodFast Delivery</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/products">
                <Button variant="ghost" size="sm">Menu</Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <StepIndicator currentStep={currentStep} />

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DeliveryForm
              formData={deliveryInfo}
              onChange={handleDeliveryChange}
              onUseSavedAddress={handleUseSavedAddress}
            />

            <PaymentMethod
              selectedMethod={selectedPaymentMethod}
              onMethodChange={setSelectedPaymentMethod}
              cardDetails={cardDetails}
              onCardDetailsChange={handleCardDetailsChange}
              savePaymentMethod={savePaymentMethod}
              onSavePaymentMethodChange={setSavePaymentMethod}
            />

            <div className="flex gap-3 lg:hidden">
              <Button
                variant="outline"
                onClick={handleBackToCart}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={isOrderEmpty || total === 0 || isProcessing}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isProcessing ? "Processing..." : "Confirm & Pay"}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary items={mockOrderItems} deliveryFee={DELIVERY_FEE} />
            
            <div className="hidden lg:flex flex-col gap-3 mt-6">
              <Button
                onClick={handleConfirmPayment}
                disabled={isOrderEmpty || total === 0 || isProcessing}
                className="w-full bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {isProcessing ? "Processing..." : "Confirm & Pay"}
              </Button>
              <Button
                variant="outline"
                onClick={handleBackToCart}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-gray-600">
            By confirming payment, you agree to FoodFast's Terms of Service.
          </p>
          <p className="text-sm text-gray-500">
            © 2025 FoodFast Delivery. All rights reserved.
          </p>
        </div>
      </footer>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderNumber={`FF${Date.now().toString().slice(-6)}`}
      />
    </div>
  );
}
