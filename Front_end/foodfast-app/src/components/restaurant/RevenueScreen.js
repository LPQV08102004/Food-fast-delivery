import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import restaurantService from '../../services/restaurantService';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function RevenueScreen({ restaurantId = 1 }) {
  const [period, setPeriod] = useState('30');
  const [stats, setStats] = useState(null);
  const [productStats, setProductStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, restaurantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [revenueData, prodData] = await Promise.all([
        restaurantService.getRevenueStats(restaurantId, period),
        restaurantService.getProductStats(restaurantId)
      ]);
      setStats(revenueData);
      setProductStats(prodData);
    } catch (error) {
      console.error('Error loading revenue stats:', error);
      toast.error('Không thể tải thống kê doanh thu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center min-h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="ml-3 text-gray-500">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  const chartData = stats?.chartData || [];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Revenue</h2>
        <select 
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {chartData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có dữ liệu doanh thu</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value, name) => {
                if (name === 'revenue') {
                  return [formatCurrency(value), 'Doanh thu'];
                }
                return [value, 'Đơn hàng'];
              }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
                name="Doanh thu"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#9ca3af"
                strokeWidth={2}
                name="Đơn hàng"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {formatCurrency(stats?.totalRevenue || 0)}
          </p>
          <p className="text-sm text-green-600 mt-1">Trong {period} ngày qua</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-600 text-sm font-medium">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {stats?.totalOrders || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Đơn hàng</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-600 text-sm font-medium">Best Seller</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {productStats?.bestSeller?.productName || 'N/A'}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            {productStats?.bestSeller?.quantity || 0} đã bán
          </p>
        </div>
      </div>
    </div>
  );
}
