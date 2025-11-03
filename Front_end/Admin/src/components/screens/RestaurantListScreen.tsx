import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Plus, Eye } from 'lucide-react';
import { Badge } from '../ui/badge';

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
  { 
    id: 'RES-005', 
    name: 'Noodle House', 
    address: '654 Maple Dr, Phoenix, AZ', 
    contact: '+1 234-567-8905',
    state: 'Active'
  },
  { 
    id: 'RES-006', 
    name: 'Curry Palace', 
    address: '987 Cedar Ln, Philadelphia, PA', 
    contact: '+1 234-567-8906',
    state: 'Inactive'
  },
];

export function RestaurantListScreen() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1>Restaurant</h1>
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
                <TableCell>{restaurant.id}</TableCell>
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
