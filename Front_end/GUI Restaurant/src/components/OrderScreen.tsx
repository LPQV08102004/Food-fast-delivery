import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export function OrderScreen() {
  const orders = [
    { id: '#12345', customer: 'John Smith', time: '2:30 PM', date: '2025-11-08', total: '$45.50', status: 'Completed' },
    { id: '#12346', customer: 'Sarah Johnson', time: '2:45 PM', date: '2025-11-08', total: '$32.00', status: 'Pending' },
    { id: '#12347', customer: 'Mike Brown', time: '3:00 PM', date: '2025-11-08', total: '$67.80', status: 'Completed' },
    { id: '#12348', customer: 'Emily Davis', time: '3:15 PM', date: '2025-11-08', total: '$28.90', status: 'Pending' },
    { id: '#12349', customer: 'David Wilson', time: '3:30 PM', date: '2025-11-08', total: '$54.20', status: 'Cancelled' },
    { id: '#12350', customer: 'Lisa Anderson', time: '3:45 PM', date: '2025-11-08', total: '$41.60', status: 'Completed' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2>Orders</h2>
        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Plus className="w-4 h-4" />
          New orders
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
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
                <TableCell>{order.total}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <button className="text-blue-600 hover:underline">view</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
