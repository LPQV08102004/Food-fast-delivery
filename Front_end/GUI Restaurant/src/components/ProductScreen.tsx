import { Plus, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export function ProductScreen() {
  const products = [
    { id: 1, name: 'Caesar Salad', price: '$12.99', catalog: 'Appetizers', status: 'Available' },
    { id: 2, name: 'Grilled Salmon', price: '$24.99', catalog: 'Main Course', status: 'Available' },
    { id: 3, name: 'Margherita Pizza', price: '$18.99', catalog: 'Main Course', status: 'Available' },
    { id: 4, name: 'Chocolate Lava Cake', price: '$8.99', catalog: 'Desserts', status: 'Out of Stock' },
    { id: 5, name: 'Mushroom Soup', price: '$9.99', catalog: 'Appetizers', status: 'Available' },
    { id: 6, name: 'Beef Burger', price: '$16.99', catalog: 'Main Course', status: 'Available' },
  ];

  return (
    <div className="p-8">
      <h2 className="mb-6">Product</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              className="pl-10"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="w-4 h-4" />
            Add product
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Catalog</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead>Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.catalog}</TableCell>
                <TableCell>{product.status}</TableCell>
                <TableCell>
                  <button className="text-blue-600 hover:underline">detail</button>
                </TableCell>
                <TableCell>
                  <button className="text-red-600 hover:underline">delete</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
