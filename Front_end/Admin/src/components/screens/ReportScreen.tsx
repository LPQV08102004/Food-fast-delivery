import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', revenue: 45000, expenses: 28000 },
  { month: 'Feb', revenue: 52000, expenses: 32000 },
  { month: 'Mar', revenue: 48000, expenses: 30000 },
  { month: 'Apr', revenue: 61000, expenses: 35000 },
  { month: 'May', revenue: 55000, expenses: 33000 },
  { month: 'Jun', revenue: 67000, expenses: 38000 },
  { month: 'Jul', revenue: 72000, expenses: 42000 },
  { month: 'Aug', revenue: 68000, expenses: 40000 },
  { month: 'Sep', revenue: 74000, expenses: 43000 },
  { month: 'Oct', revenue: 79000, expenses: 45000 },
  { month: 'Nov', revenue: 85000, expenses: 48000 },
  { month: 'Dec', revenue: 91000, expenses: 52000 },
];

export function ReportScreen() {
  const kpiData = [
    {
      title: 'Total Orders',
      value: '12,345',
      icon: ShoppingCart,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Order today',
      value: '234',
      icon: TrendingUp,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Revenue',
      value: '$789,456',
      icon: DollarSign,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Total User',
      value: '8,492',
      icon: Users,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="p-8">
      <h1 className="mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 mb-1">{kpi.title}</p>
                    <h2>{kpi.value}</h2>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${kpi.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${kpi.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#9CA3AF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
