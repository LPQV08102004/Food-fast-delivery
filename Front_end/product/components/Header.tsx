import { ShoppingCart, Search, LogOut, User, MapPin, Clock, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  isLoggedIn: boolean;
  cartCount: number;
  selectedRestaurant: string;
  selectedCategory: string;
  searchQuery: string;
  onRestaurantChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
}

const restaurants: Restaurant[] = [
  { id: "all", name: "All Restaurants", rating: 4.5, deliveryTime: "20-30 min" },
  { id: "1", name: "Pizza Palace", rating: 4.8, deliveryTime: "20-30 min" },
  { id: "2", name: "Burger Bros", rating: 4.6, deliveryTime: "15-25 min" },
  { id: "3", name: "Sushi Station", rating: 4.9, deliveryTime: "30-40 min" },
  { id: "4", name: "Pasta Paradise", rating: 4.7, deliveryTime: "25-35 min" },
  { id: "5", name: "Taco Town", rating: 4.5, deliveryTime: "20-30 min" },
];

const categories = [
  { id: "all", name: "All" },
  { id: "pizza", name: "Pizza" },
  { id: "burger", name: "Burgers" },
  { id: "sushi", name: "Sushi" },
  { id: "pasta", name: "Pasta" },
  { id: "salad", name: "Salads" },
  { id: "dessert", name: "Desserts" },
  { id: "mexican", name: "Mexican" },
  { id: "asian", name: "Asian" },
];

export function Header({
  isLoggedIn,
  cartCount,
  selectedRestaurant,
  selectedCategory,
  searchQuery,
  onRestaurantChange,
  onCategoryChange,
  onSearchChange,
  onLogin,
  onRegister,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      {/* Top Bar */}
      <div className="border-b bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <h1 className="text-orange-600">FoodHub</h1>
              <div className="hidden md:flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Deliver to: <span className="text-gray-900">New York, NY</span></span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Cart */}
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-600">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* User Section */}
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline">John Doe</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>My Orders</DropdownMenuItem>
                      <DropdownMenuItem onClick={onLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={onLogin}>
                    Login
                  </Button>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={onRegister}>
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Restaurant Selector */}
          <div className="w-full md:w-64">
            <Select value={selectedRestaurant} onValueChange={onRestaurantChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select restaurant" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{restaurant.name}</span>
                      {restaurant.id !== "all" && (
                        <div className="flex items-center gap-2 ml-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{restaurant.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{restaurant.deliveryTime}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for dishes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Category Bar */}
      <div className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className={
                  selectedCategory === category.id
                    ? "bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
                    : "whitespace-nowrap"
                }
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
