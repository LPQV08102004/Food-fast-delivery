import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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

export function RevenueScreen() {
  const chartData = [
    { date: 'Week 1', revenue: 4200, orders: 45 },
    { date: 'Week 2', revenue: 5100, orders: 52 },
    { date: 'Week 3', revenue: 3800, orders: 38 },
    { date: 'Week 4', revenue: 6200, orders: 61 },
  ];

  const stats = [
    { title: 'Total Revenue', value: '$19,300', change: '+12.5%' },
    { title: 'Total Order', value: '196', change: '+8.2%' },
    { title: 'Best Seller', value: 'Grilled Salmon', change: '42 orders' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2>Revenue</h2>
        <Select defaultValue="30">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2}
              name="Revenue ($)"
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#9ca3af"
              strokeWidth={2}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-gray-600">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">{stat.value}</div>
              <div className="text-sm text-green-600 mt-1">{stat.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
