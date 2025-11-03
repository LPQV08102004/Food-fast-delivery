import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Eye } from 'lucide-react';
import { Badge } from '../ui/badge';

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
  { 
    id: 'ORD-006', 
    customer: 'Lisa Anderson', 
    time: '02:30 PM', 
    date: '2025-11-03', 
    amount: '$65.25', 
    status: 'Pending',
    restaurant: 'Burger Palace'
  },
  { 
    id: 'ORD-007', 
    customer: 'Robert Taylor', 
    time: '03:15 PM', 
    date: '2025-11-03', 
    amount: '$39.00', 
    status: 'In Progress',
    restaurant: 'Pizza Corner'
  },
];

const getStatusColor = (status: string) => {
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

export function OrderScreen() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1>Orders</h1>
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
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.time}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.amount}</TableCell>
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
