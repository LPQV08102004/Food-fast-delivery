import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, UtensilsCrossed, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import apiConfig from "../config/apiConfig";

export default function PaymentResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('processing'); // processing, success, failed
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    checkPaymentResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkPaymentResult = async () => {
    try {
      // Lấy parameters từ MoMo callback URL
      const momoOrderId = searchParams.get('orderId');
      const resultCode = searchParams.get('resultCode');

      // Lấy orderId từ localStorage
      const pendingOrderId = localStorage.getItem('pendingOrderId');
      const pendingPaymentOrderId = localStorage.getItem('pendingPaymentOrderId');

      if (!momoOrderId && !pendingPaymentOrderId) {
        toast.error('Invalid payment session');
        setPaymentStatus('failed');
        return;
      }

      // Sử dụng momoOrderId từ URL hoặc từ localStorage
      const orderIdToCheck = momoOrderId || pendingPaymentOrderId;

      // Gọi API để kiểm tra payment result
      const resultUrl = apiConfig.getPaymentServiceUrl(
        `/payments/momo/result?orderId=${orderIdToCheck}&resultCode=${resultCode || 0}`
      );
      const response = await fetch(resultUrl);

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();
      setPaymentDetails(data);
      setOrderId(data.orderId || pendingOrderId);

      // Xác định trạng thái dựa trên resultCode
      if (data.resultCode === 0 || data.status === 'SUCCESS') {
        setPaymentStatus('success');
        toast.success('Payment successful!');
        
        // Clear localStorage
        localStorage.removeItem('pendingOrderId');
        localStorage.removeItem('pendingPaymentOrderId');
      } else {
        setPaymentStatus('failed');
        toast.error(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Error checking payment result:', error);
      setPaymentStatus('failed');
      toast.error('Failed to verify payment status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-orange-600 p-1.5 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-orange-600">FoodFast</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {paymentStatus === 'processing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center py-8"
              >
                <Loader2 className="w-16 h-16 text-orange-600 animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment...</h2>
                <p className="text-gray-600">Please wait while we verify your payment</p>
              </motion.div>
            )}

            {paymentStatus === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex flex-col items-center text-center py-8"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">Your order has been confirmed and payment completed.</p>

                {orderId && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 w-full">
                    <p className="text-sm text-gray-600 mb-1">Order ID</p>
                    <p className="text-xl font-bold text-orange-600">#{orderId}</p>
                  </div>
                )}

                {paymentDetails && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount Paid</span>
                      <span className="font-semibold">${paymentDetails.amount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-semibold">MoMo E-Wallet</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <span className="font-semibold text-green-600">Paid</span>
                    </div>
                  </div>
                )}

                <div className="w-full space-y-3">
                  <Button
                    onClick={() => navigate('/orders')}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg"
                  >
                    View My Orders
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    onClick={() => navigate('/products')}
                    variant="outline"
                    className="w-full py-6 text-lg"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </motion.div>
            )}

            {paymentStatus === 'failed' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex flex-col items-center text-center py-8"
              >
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                <p className="text-gray-600 mb-6">
                  {paymentDetails?.message || 'Your payment could not be processed. Please try again.'}
                </p>

                {paymentDetails && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 w-full">
                    <p className="text-sm text-red-800">
                      <strong>Error Code:</strong> {paymentDetails.resultCode}
                    </p>
                    <p className="text-sm text-red-800 mt-1">
                      <strong>Message:</strong> {paymentDetails.message}
                    </p>
                  </div>
                )}

                <div className="w-full space-y-3">
                  <Button
                    onClick={() => navigate('/cart')}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg"
                  >
                    Back to Cart
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    onClick={() => navigate('/orders')}
                    variant="outline"
                    className="w-full py-6 text-lg"
                  >
                    View My Orders
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@foodfast.com" className="text-orange-600 hover:underline">
              support@foodfast.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
