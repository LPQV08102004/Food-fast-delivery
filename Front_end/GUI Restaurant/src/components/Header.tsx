import { LogOut, User } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

export function Header() {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end items-center gap-4">
      <Avatar>
        <AvatarFallback className="bg-blue-100 text-blue-600">
          <User className="w-5 h-5" />
        </AvatarFallback>
      </Avatar>
      <Button variant="outline" className="gap-2">
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  );
}
