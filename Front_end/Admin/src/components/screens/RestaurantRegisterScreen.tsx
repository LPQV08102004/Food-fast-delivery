import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Eye } from 'lucide-react';

const pendingRestaurants = [
  { 
    name: 'Thai Garden', 
    address: '111 Broadway, Seattle, WA', 
    contact: '+1 234-567-8907'
  },
  { 
    name: 'Mediterranean Grill', 
    address: '222 Highland Ave, Boston, MA', 
    contact: '+1 234-567-8908'
  },
  { 
    name: 'BBQ Smokehouse', 
    address: '333 River Rd, Austin, TX', 
    contact: '+1 234-567-8909'
  },
  { 
    name: 'Vegan Delights', 
    address: '444 Park St, Portland, OR', 
    contact: '+1 234-567-8910'
  },
  { 
    name: 'Seafood Shack', 
    address: '555 Bay Dr, Miami, FL', 
    contact: '+1 234-567-8911'
  },
];

export function RestaurantRegisterScreen() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1>Restaurant</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search restaurants..." 
            className="pl-9 w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Main_address</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingRestaurants.map((restaurant, index) => (
              <TableRow key={index}>
                <TableCell>{restaurant.name}</TableCell>
                <TableCell>{restaurant.address}</TableCell>
                <TableCell>{restaurant.contact}</TableCell>
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
