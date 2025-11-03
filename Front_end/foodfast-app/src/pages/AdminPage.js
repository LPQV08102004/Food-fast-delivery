import React, { useState } from 'react';
import { 
  Users, 
  ShoppingBag, 
  Plane, 
  Package, 
  UtensilsCrossed, 
  BarChart3, 
  Settings,
  ChevronDown,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data
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

const users = [
  { id: 1, username: 'john_doe', password: '********', state: 'Active' },
  { id: 2, username: 'jane_smith', password: '********', state: 'Active' },
  { id: 3, username: 'mike_wilson', password: '********', state: 'Inactive' },
  { id: 4, username: 'sarah_jones', password: '********', state: 'Active' },
  { id: 5, username: 'david_brown', password: '********', state: 'Active' },
  { id: 6, username: 'emily_davis', password: '********', state: 'Inactive' },
  { id: 7, username: 'chris_miller', password: '********', state: 'Active' },
  { id: 8, username: 'amanda_taylor', password: '********', state: 'Active' },
];

const orders = [
  { 
    id: 'ORD-001', 
    customer: 'John Smith', 
    time: '10:30 AM', 
    date: '2025-11-03', 
    amount: '$45.50', 
    status: 'Completed',
    restaurant: 'Burger Palace'
  },
  { 
    id: 'ORD-002', 
    customer: 'Emma Wilson', 
    time: '11:15 AM', 
    date: '2025-11-03', 
    amount: '$32.00', 
    status: 'Pending',
    restaurant: 'Pizza Corner'
  },
  { 
    id: 'ORD-003', 
    customer: 'Michael Brown', 
    time: '09:45 AM', 
    date: '2025-11-03', 
    amount: '$58.75', 
    status: 'In Progress',
    restaurant: 'Sushi Bar'
  },
  { 
    id: 'ORD-004', 
    customer: 'Sarah Davis', 
    time: '12:00 PM', 
    date: '2025-11-03', 
    amount: '$28.50', 
    status: 'Completed',
    restaurant: 'Taco Haven'
  },
  { 
    id: 'ORD-005', 
    customer: 'James Johnson', 
    time: '01:20 PM', 
    date: '2025-11-03', 
    amount: '$42.00', 
    status: 'Cancelled',
    restaurant: 'Noodle House'
  },
];

const products = [
  { 
    name: 'Classic Burger', 
    price: '$8.99', 
    catalog: 'Burgers', 
    restaurant: 'Burger Palace'
  },
  { 
    name: 'Pepperoni Pizza', 
    price: '$12.50', 
    catalog: 'Pizza', 
    restaurant: 'Pizza Corner'
  },
  { 
    name: 'California Roll', 
    price: '$15.00', 
    catalog: 'Sushi', 
    restaurant: 'Sushi Bar'
  },
  { 
    name: 'Chicken Tacos', 
    price: '$9.99', 
    catalog: 'Mexican', 
    restaurant: 'Taco Haven'
  },
  { 
    name: 'Pad Thai', 
    price: '$11.50', 
    catalog: 'Asian', 
    restaurant: 'Noodle House'
  },
];

const restaurants = [
  { 
    id: 'RES-001', 
    name: 'Burger Palace', 
    address: '123 Main St, New York, NY', 
    contact: '+1 234-567-8901',
    state: 'Active'
  },
  { 
    id: 'RES-002', 
    name: 'Pizza Corner', 
    address: '456 Oak Ave, Los Angeles, CA', 
    contact: '+1 234-567-8902',
    state: 'Active'
  },
  { 
    id: 'RES-003', 
    name: 'Sushi Bar', 
    address: '789 Pine Rd, Chicago, IL', 
    contact: '+1 234-567-8903',
    state: 'Inactive'
  },
  { 
    id: 'RES-004', 
    name: 'Taco Haven', 
    address: '321 Elm St, Houston, TX', 
    contact: '+1 234-567-8904',
    state: 'Active'
  },
];

// Sidebar Component
function Sidebar({ activeScreen, onNavigate }) {
  const [restaurantOpen, setRestaurantOpen] = useState(
    activeScreen === 'restaurant-list' || activeScreen === 'restaurant-register'
  );

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'user', label: 'User', icon: Users },
    { id: 'order', label: 'Order', icon: ShoppingBag },
    { id: 'drone', label: 'Drone', icon: Plane },
    { id: 'product', label: 'Product', icon: Package },
    { 
      id: 'restaurant', 
      label: 'Restaurant', 
      icon: UtensilsCrossed,
      subItems: [
        { id: 'restaurant-list', label: 'List Restaurant' },
        { id: 'restaurant-register', label: 'Register Restaurant' }
      ]
    },
    { id: 'setting', label: 'Setting', icon: Settings },
  ];

  const handleMenuClick = (id) => {
    if (id === 'restaurant') {
      setRestaurantOpen(!restaurantOpen);
    } else {
      onNavigate(id);
    }
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">Fast Delivery Admin</h1>
      </div>
      
      <nav className="flex-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id || 
                          (item.subItems && item.subItems.some(sub => sub.id === activeScreen));
          
          return (
            <div key={item.id}>
              <button
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive && !item.subItems
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.subItems && (
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${
                      restaurantOpen ? 'rotate-180' : ''
                    }`} 
                  />
                )}
              </button>
              
              {item.subItems && restaurantOpen && (
                <div className="ml-4 mb-1">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => onNavigate(subItem.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg mb-1 transition-colors text-sm ${
                        activeScreen === subItem.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

// Dashboard Screen
function ReportScreen() {
  const kpiData = [
    {
      title: 'Total Orders',
      value: '12,345',
      icon: ShoppingBag,
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{kpi.title}</p>
                    <h2 className="text-2xl font-bold text-gray-900">{kpi.value}</h2>
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
          <CardTitle className="text-xl font-bold text-gray-900">Monthly Revenue</CardTitle>
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

// User Screen
function UserScreen() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search users..." 
              className="pl-9 w-64"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add user
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Edit</TableHead>
              <TableHead>Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.password}</TableCell>
                <TableCell>
                  <Badge 
                    className={
                      user.state === 'Active' 
                        ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                    }
                  >
                    {user.state}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4 text-blue-600" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Order Screen
function OrderScreen() {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New orders
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Name Restaurant</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.time}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell className="font-semibold">{order.amount}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{order.restaurant}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 text-blue-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Product Screen
function ProductScreen() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Product</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search products..." 
              className="pl-9 w-64"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add product
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Catalog</TableHead>
              <TableHead>Restaurant</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="font-semibold">{product.price}</TableCell>
                <TableCell>{product.catalog}</TableCell>
                <TableCell>{product.restaurant}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="link" size="sm" className="text-blue-600 p-0 h-auto">
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </Button>
                    <span className="text-gray-300">|</span>
                    <Button variant="link" size="sm" className="text-red-600 p-0 h-auto">
                      Cancel
                    </Button>
                    <span className="text-gray-300">|</span>
                    <Button variant="link" size="sm" className="text-green-600 p-0 h-auto">
                      Approve
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Restaurant List Screen
function RestaurantListScreen() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Restaurant</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search restaurants..." 
              className="pl-9 w-64"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Restaurant
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Res_id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Main_address</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants.map((restaurant) => (
              <TableRow key={restaurant.id}>
                <TableCell className="font-medium">{restaurant.id}</TableCell>
                <TableCell>{restaurant.name}</TableCell>
                <TableCell>{restaurant.address}</TableCell>
                <TableCell>{restaurant.contact}</TableCell>
                <TableCell>
                  <Badge 
                    className={
                      restaurant.state === 'Active' 
                        ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                    }
                  >
                    {restaurant.state}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="link" size="sm" className="text-blue-600 p-0 h-auto">
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </Button>
                    <span className="text-gray-300">|</span>
                    <Button variant="link" size="sm" className="text-red-600 p-0 h-auto">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Restaurant Register Screen
function RestaurantRegisterScreen() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Register Restaurant</h1>
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name
              </label>
              <Input placeholder="Enter restaurant name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number
              </label>
              <Input placeholder="Enter contact number" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <Input placeholder="Enter full address" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Type
              </label>
              <Input placeholder="e.g., Italian, Chinese, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input type="email" placeholder="restaurant@example.com" />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Register Restaurant
            </Button>
            <Button variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Admin Page Component
export default function AdminPage() {
  const [activeScreen, setActiveScreen] = useState('dashboard');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <ReportScreen />;
      case 'user':
        return <UserScreen />;
      case 'order':
        return <OrderScreen />;
      case 'product':
        return <ProductScreen />;
      case 'restaurant-list':
        return <RestaurantListScreen />;
      case 'restaurant-register':
        return <RestaurantRegisterScreen />;
      case 'drone':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">Drone Management</h1>
            <p className="text-gray-500 mt-4">Drone management screen coming soon...</p>
          </div>
        );
      case 'setting':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-4">Settings screen coming soon...</p>
          </div>
        );
      default:
        return <ReportScreen />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeScreen={activeScreen} onNavigate={setActiveScreen} />
      <main className="flex-1 overflow-auto">
        {renderScreen()}
      </main>
    </div>
  );
}
