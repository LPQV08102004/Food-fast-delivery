import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Plus, Eye } from 'lucide-react';

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
  { 
    name: 'Cheese Burger', 
    price: '$10.99', 
    catalog: 'Burgers', 
    restaurant: 'Burger Palace'
  },
  { 
    name: 'Margherita Pizza', 
    price: '$11.00', 
    catalog: 'Pizza', 
    restaurant: 'Pizza Corner'
  },
  { 
    name: 'Salmon Sushi', 
    price: '$18.00', 
    catalog: 'Sushi', 
    restaurant: 'Sushi Bar'
  },
];

export function ProductScreen() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1>Product</h1>
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
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.price}</TableCell>
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
