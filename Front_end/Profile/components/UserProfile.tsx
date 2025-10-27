import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { EditProfileDialog } from './EditProfileDialog';
import { OrderDetailsDialog } from './OrderDetailsDialog';
import { SettingsDialog } from './SettingsDialog';
import { LogOut, Edit, Package, CreditCard, User, Mail, Phone, MapPin, Calendar, ShoppingBag, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SavedAddress {
  id: string;
  label: string;
  address: string;
}

interface UserData {
  avatar: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  savedAddresses: SavedAddress[];
  defaultAddressId: string;
  role: string;
  createdAt: string;
}

function getDefaultAddress(userData: UserData): string {
  const defaultAddr = userData.savedAddresses.find(
    addr => addr.id === userData.defaultAddressId
  );
  return defaultAddr ? defaultAddr.address : '';
}

interface Order {
  id: string;
  orderCode: string;
  orderDate: string;
  totalAmount: number;
  status: 'delivered' | 'pending' | 'cancelled' | 'processing';
  productCount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface Payment {
  id: string;
  paymentDate: string;
  orderCode: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
}

export function UserProfile() {
  const [userData, setUserData] = useState<UserData>({
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    fullName: 'John Anderson',
    username: 'john_anderson',
    email: 'john.anderson@email.com',
    phone: '+1 (555) 123-4567',
    savedAddresses: [
      {
        id: '1',
        label: 'Home',
        address: '123 Main Street, Apt 4B, New York, NY 10001',
      },
      {
        id: '2',
        label: 'Work',
        address: '456 Business Ave, Suite 200, New York, NY 10002',
      },
      {
        id: '3',
        label: 'Parents House',
        address: '789 Family Road, Brooklyn, NY 11201',
      },
    ],
    defaultAddressId: '1',
    role: 'Premium Customer',
    createdAt: '2024-01-15',
  });

  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderCode: 'ORD-2024-1234',
      orderDate: '2024-10-25',
      totalAmount: 45.99,
      status: 'delivered',
      productCount: 3,
      items: [
        { name: 'Margherita Pizza', quantity: 1, price: 18.99 },
        { name: 'Caesar Salad', quantity: 1, price: 12.00 },
        { name: 'Garlic Bread', quantity: 2, price: 7.50 },
      ],
    },
    {
      id: '2',
      orderCode: 'ORD-2024-1223',
      orderDate: '2024-10-22',
      totalAmount: 32.50,
      status: 'delivered',
      productCount: 2,
      items: [
        { name: 'Chicken Burger', quantity: 2, price: 14.25 },
        { name: 'French Fries', quantity: 2, price: 4.00 },
      ],
    },
    {
      id: '3',
      orderCode: 'ORD-2024-1215',
      orderDate: '2024-10-20',
      totalAmount: 28.75,
      status: 'processing',
      productCount: 2,
      items: [
        { name: 'Sushi Platter', quantity: 1, price: 24.75 },
        { name: 'Miso Soup', quantity: 1, price: 4.00 },
      ],
    },
    {
      id: '4',
      orderCode: 'ORD-2024-1198',
      orderDate: '2024-10-18',
      totalAmount: 56.20,
      status: 'delivered',
      productCount: 4,
      items: [
        { name: 'BBQ Ribs', quantity: 1, price: 28.99 },
        { name: 'Coleslaw', quantity: 2, price: 5.50 },
        { name: 'Corn on the Cob', quantity: 2, price: 8.10 },
      ],
    },
    {
      id: '5',
      orderCode: 'ORD-2024-1187',
      orderDate: '2024-10-15',
      totalAmount: 22.99,
      status: 'cancelled',
      productCount: 1,
      items: [
        { name: 'Vegetarian Pasta', quantity: 1, price: 22.99 },
      ],
    },
  ]);

  const [payments] = useState<Payment[]>([
    {
      id: '1',
      paymentDate: '2024-10-25',
      orderCode: 'ORD-2024-1234',
      amount: 45.99,
      method: 'Credit Card',
      status: 'completed',
    },
    {
      id: '2',
      paymentDate: '2024-10-22',
      orderCode: 'ORD-2024-1223',
      amount: 32.50,
      method: 'PayPal',
      status: 'completed',
    },
    {
      id: '3',
      paymentDate: '2024-10-20',
      orderCode: 'ORD-2024-1215',
      amount: 28.75,
      method: 'Credit Card',
      status: 'pending',
    },
    {
      id: '4',
      paymentDate: '2024-10-18',
      orderCode: 'ORD-2024-1198',
      amount: 56.20,
      method: 'Debit Card',
      status: 'completed',
    },
    {
      id: '5',
      paymentDate: '2024-10-15',
      orderCode: 'ORD-2024-1187',
      amount: 22.99,
      method: 'Credit Card',
      status: 'failed',
    },
  ]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleLogout = () => {
    toast.success('Logged out successfully');
    // Implement logout logic here
  };

  const handleUpdateProfile = (updatedData: Partial<UserData>) => {
    setUserData({ ...userData, ...updatedData });
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = (oldPassword: string, newPassword: string) => {
    // Implement password change logic here
    toast.success('Password changed successfully');
  };

  const handleDeleteAccount = () => {
    // Implement account deletion logic here
    toast.success('Account deleted successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'cancelled':
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-orange-500">User Profile</h1>
              <p className="text-gray-600">Manage your account and orders</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSettingsDialogOpen(true)}
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information Card */}
        <div className="lg:col-span-1">
          <Card className="border-orange-200 shadow-lg">
            <CardHeader className="bg-orange-500 text-white">
              <CardTitle>Personal Information</CardTitle>
              <CardDescription className="text-orange-100">
                Your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="w-24 h-24 border-4 border-orange-500">
                  <AvatarImage src={userData.avatar} alt={userData.fullName} />
                  <AvatarFallback className="bg-orange-100 text-orange-500">
                    {userData.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-center">{userData.fullName}</h2>
                <p className="text-gray-500">@{userData.username}</p>
                <Badge className="mt-2 bg-orange-500 hover:bg-orange-600">
                  {userData.role}
                </Badge>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="break-all">{userData.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{userData.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Default Shipping Address</p>
                    <p>{getDefaultAddress(userData)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p>{new Date(userData.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setEditDialogOpen(true)}
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Information
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Order History and Payment History */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-orange-100">
              <TabsTrigger 
                value="orders" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <Package className="w-4 h-4 mr-2" />
                Order History
              </TabsTrigger>
              <TabsTrigger 
                value="payments"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Payment History
              </TabsTrigger>
            </TabsList>

            {/* Order History Tab */}
            <TabsContent value="orders" className="mt-6">
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-orange-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-orange-500" />
                            <span className="text-orange-500">{order.orderCode}</span>
                            <Badge className={`${getStatusColor(order.status)} text-white`}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Order Date</p>
                              <p>{new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Total Amount</p>
                              <p className="text-orange-500">${order.totalAmount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Products</p>
                              <p>{order.productCount} items</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectedOrder(order)}
                          variant="outline"
                          className="border-orange-500 text-orange-500 hover:bg-orange-50"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Payment History Tab */}
            <TabsContent value="payments" className="mt-6">
              <div className="space-y-4">
                {payments.map((payment) => (
                  <Card key={payment.id} className="border-orange-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-orange-500" />
                            <span className="text-orange-500">{payment.orderCode}</span>
                            <Badge className={`${getStatusColor(payment.status)} text-white`}>
                              {payment.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Payment Date</p>
                              <p>{new Date(payment.paymentDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Amount</p>
                              <p className="text-orange-500">${payment.amount.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Payment Method</p>
                              <p>{payment.method}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialogs */}
      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        userData={userData}
        onSave={handleUpdateProfile}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        onChangePassword={handleChangePassword}
        onDeleteAccount={handleDeleteAccount}
      />

      <OrderDetailsDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
