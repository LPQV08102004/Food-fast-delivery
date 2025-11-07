import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

// Test Page để kiểm tra kết nối Backend
function TestConnectionPage() {
  const [testResults, setTestResults] = useState({
    apiGateway: null,
    userService: null,
    productService: null,
    orderService: null,
    paymentService: null,
  });
  const [testing, setTesting] = useState(false);
  const [testToken, setTestToken] = useState(null);

  // Test API Gateway Health
  const testAPIGateway = async () => {
    try {
      const response = await fetch('http://localhost:8080/actuator/health');
      if (response.ok) {
        return { status: 'success', message: 'API Gateway is running' };
      }
      return { status: 'error', message: 'API Gateway not responding' };
    } catch (error) {
      return { status: 'error', message: 'Cannot connect to API Gateway' };
    }
  };

  // Test User Service - Register
  const testUserService = async () => {
    try {
      const testUser = {
        username: `test_${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: 'test123456',
        phone: '0123456789'
      };

      const response = await api.post('/auth/register', testUser);
      
      if (response.status === 201 || response.status === 200) {
        return { status: 'success', message: 'User Service OK - Register works', data: response.data };
      }
      return { status: 'error', message: 'User Service not responding correctly' };
    } catch (error) {
      if (error.response?.status === 409) {
        // User exists - still OK, service is working
        return { status: 'success', message: 'User Service OK (user exists)' };
      }
      return { status: 'error', message: error.response?.data?.message || 'User Service failed' };
    }
  };

  // Test User Service - Login
  const testLogin = async () => {
    try {
      const response = await api.post('/auth/login', {
        username: 'admin',
        password: 'admin'
      });

      if (response.data.token) {
        setTestToken(response.data.token);
        return { status: 'success', message: 'Login successful', token: response.data.token };
      }
      return { status: 'error', message: 'Login failed' };
    } catch (error) {
      return { status: 'error', message: error.response?.data?.message || 'Login failed' };
    }
  };

  // Test Product Service
  const testProductService = async () => {
    try {
      const response = await api.get('/products');
      
      if (response.status === 200) {
        const products = response.data;
        return { 
          status: 'success', 
          message: `Product Service OK - Found ${products.length || 0} products`,
          data: products
        };
      }
      return { status: 'error', message: 'Product Service not responding' };
    } catch (error) {
      return { status: 'error', message: error.response?.data?.message || 'Product Service failed' };
    }
  };

  // Test Order Service
  const testOrderService = async () => {
    try {
      // Need authentication for orders
      if (!testToken) {
        return { status: 'warning', message: 'Need login first' };
      }

      const response = await api.get('/orders', {
        headers: { Authorization: `Bearer ${testToken}` }
      });

      if (response.status === 200) {
        return { 
          status: 'success', 
          message: `Order Service OK - Found ${response.data.length || 0} orders` 
        };
      }
      return { status: 'error', message: 'Order Service not responding' };
    } catch (error) {
      if (error.response?.status === 401) {
        return { status: 'warning', message: 'Order Service OK (auth required)' };
      }
      return { status: 'error', message: error.response?.data?.message || 'Order Service failed' };
    }
  };

  // Test Payment Service
  const testPaymentService = async () => {
    try {
      if (!testToken) {
        return { status: 'warning', message: 'Need login first' };
      }

      const response = await api.get('/payments', {
        headers: { Authorization: `Bearer ${testToken}` }
      });

      if (response.status === 200) {
        return { 
          status: 'success', 
          message: `Payment Service OK - Found ${response.data.length || 0} payments` 
        };
      }
      return { status: 'error', message: 'Payment Service not responding' };
    } catch (error) {
      if (error.response?.status === 401) {
        return { status: 'warning', message: 'Payment Service OK (auth required)' };
      }
      return { status: 'error', message: error.response?.data?.message || 'Payment Service failed' };
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setTesting(true);
    toast.info('Starting connection tests...');

    try {
      // Test 1: API Gateway
      toast.info('Testing API Gateway...');
      const gatewayResult = await testAPIGateway();
      setTestResults(prev => ({ ...prev, apiGateway: gatewayResult }));

      if (gatewayResult.status === 'error') {
        toast.error('API Gateway is not running! Start backend services first.');
        setTesting(false);
        return;
      }

      // Test 2: User Service
      toast.info('Testing User Service...');
      const userResult = await testUserService();
      setTestResults(prev => ({ ...prev, userService: userResult }));

      // Test 3: Login
      toast.info('Testing Login...');
      const loginResult = await testLogin();

      // Test 4: Product Service
      toast.info('Testing Product Service...');
      const productResult = await testProductService();
      setTestResults(prev => ({ ...prev, productService: productResult }));

      // Test 5: Order Service
      toast.info('Testing Order Service...');
      const orderResult = await testOrderService();
      setTestResults(prev => ({ ...prev, orderService: orderResult }));

      // Test 6: Payment Service
      toast.info('Testing Payment Service...');
      const paymentResult = await testPaymentService();
      setTestResults(prev => ({ ...prev, paymentService: paymentResult }));

      // Summary
      const allSuccess = Object.values({
        apiGateway: gatewayResult,
        userService: userResult,
        productService: productResult,
        orderService: orderResult,
        paymentService: paymentResult
      }).every(r => r.status === 'success' || r.status === 'warning');

      if (allSuccess) {
        toast.success('✅ All services are connected successfully!');
      } else {
        toast.warning('⚠️ Some services are not responding');
      }

    } catch (error) {
      toast.error('Test failed: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    if (status === null) {
      return <Badge className="bg-gray-500">Not Tested</Badge>;
    }
    if (status === 'success') {
      return (
        <Badge className="bg-green-500 text-white hover:bg-green-600">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      );
    }
    if (status === 'warning') {
      return (
        <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">
          <AlertCircle className="w-3 h-3 mr-1" />
          Auth Required
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500 text-white hover:bg-red-600">
        <XCircle className="w-3 h-3 mr-1" />
        Failed
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Backend Connection Test
        </h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Backend Services</CardTitle>
            <p className="text-sm text-gray-500">
              Click the button below to test all backend service connections
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runAllTests} 
              disabled={testing}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run Connection Tests'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="space-y-4">
          {/* API Gateway */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">API Gateway</h3>
                  <p className="text-sm text-gray-500">
                    http://localhost:8080
                  </p>
                  {testResults.apiGateway?.message && (
                    <p className="text-sm mt-1">{testResults.apiGateway.message}</p>
                  )}
                </div>
                <StatusBadge status={testResults.apiGateway?.status} />
              </div>
            </CardContent>
          </Card>

          {/* User Service */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">User Service</h3>
                  <p className="text-sm text-gray-500">
                    /api/auth/**, /api/users/**
                  </p>
                  {testResults.userService?.message && (
                    <p className="text-sm mt-1">{testResults.userService.message}</p>
                  )}
                </div>
                <StatusBadge status={testResults.userService?.status} />
              </div>
            </CardContent>
          </Card>

          {/* Product Service */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Product Service</h3>
                  <p className="text-sm text-gray-500">
                    /api/products/**
                  </p>
                  {testResults.productService?.message && (
                    <p className="text-sm mt-1">{testResults.productService.message}</p>
                  )}
                </div>
                <StatusBadge status={testResults.productService?.status} />
              </div>
            </CardContent>
          </Card>

          {/* Order Service */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Order Service</h3>
                  <p className="text-sm text-gray-500">
                    /api/orders/**
                  </p>
                  {testResults.orderService?.message && (
                    <p className="text-sm mt-1">{testResults.orderService.message}</p>
                  )}
                </div>
                <StatusBadge status={testResults.orderService?.status} />
              </div>
            </CardContent>
          </Card>

          {/* Payment Service */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Payment Service</h3>
                  <p className="text-sm text-gray-500">
                    /api/payments/**
                  </p>
                  {testResults.paymentService?.message && (
                    <p className="text-sm mt-1">{testResults.paymentService.message}</p>
                  )}
                </div>
                <StatusBadge status={testResults.paymentService?.status} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold">Before Testing:</h4>
                <ol className="list-decimal list-inside ml-2 space-y-1 text-gray-600">
                  <li>Start Eureka Service (port 8761)</li>
                  <li>Start User Service (port 8081)</li>
                  <li>Start Product Service (port 8082)</li>
                  <li>Start Order Service (port 8083)</li>
                  <li>Start Payment Service (port 8084)</li>
                  <li>Start API Gateway (port 8080)</li>
                  <li>Make sure MySQL is running with databases created</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold">Expected Results:</h4>
                <ul className="list-disc list-inside ml-2 space-y-1 text-gray-600">
                  <li>All badges should show "Connected" (green)</li>
                  <li>Order/Payment services might show "Auth Required" (yellow) - this is OK</li>
                  <li>If any service shows "Failed" (red), check that service's logs</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold">Troubleshooting:</h4>
                <ul className="list-disc list-inside ml-2 space-y-1 text-gray-600">
                  <li>Check Eureka Dashboard: <a href="http://localhost:8761" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">http://localhost:8761</a></li>
                  <li>Verify all services are registered in Eureka</li>
                  <li>Check browser console (F12) for detailed error messages</li>
                  <li>Check backend service logs for errors</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TestConnectionPage;
