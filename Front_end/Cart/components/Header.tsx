import { ShoppingCart, User, Menu as MenuIcon, LogOut } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  cartItemCount: number;
}

export function Header({ cartItemCount }: HeaderProps) {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-orange-600">FoodFast Delivery</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#menu" className="text-gray-700 hover:text-orange-600 transition-colors">
              Menu
            </a>
            <a href="#orders" className="text-gray-700 hover:text-orange-600 transition-colors">
              Orders
            </a>
          </nav>

          {/* Cart Icon & User Avatar */}
          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <div className="relative">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-600 hover:bg-orange-700 text-white min-w-5 h-5 flex items-center justify-center p-1">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100">
                  <Avatar className="h-10 w-10 border-2 border-orange-200">
                    <AvatarImage 
                      src="https://images.unsplash.com/photo-1701463387028-3947648f1337?w=100&h=100&fit=crop" 
                      alt="User avatar" 
                    />
                    <AvatarFallback className="bg-orange-500 text-white">JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" sideOffset={5}>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="leading-none">John Doe</p>
                    <p className="text-xs text-gray-500 leading-none">john.doe@email.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
