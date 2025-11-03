import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Badge } from '../ui/badge';

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

export function UserScreen() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1>User</h1>
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
                <TableCell>{user.id}</TableCell>
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
