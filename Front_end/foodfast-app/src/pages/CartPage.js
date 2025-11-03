import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag,
  Tag,
  User,
  LogOut,
  Menu as MenuIcon,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

// Mock initial cart items
const initialCartItems = [
  {
    id: '1',
    name: 'Classic Burger',
    description: 'Juicy beef patty with fresh vegetables',
    price: 12.99,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop'
  },
  {
    id: '2',
    name: 'Pepperoni Pizza',
    description: 'Large pizza with extra cheese',
    price: 18.99,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop'
  },
  {
    id: '3',
    name: 'French Fries',
    description: 'Crispy golden fries',
    price: 4.99,
    quantity: 3,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop'
  },
  {
    id: '4',
    name: 'Coca Cola',
    description: 'Chilled soft drink',
    price: 2.49,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200&h=200&fit=crop'
  }
];

const DELIVERY_FEE = 5.99;

// Header Component
function Header({ cartItemCount }) {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-orange-600">FoodFast Delivery</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="/products" className="text-gray-700 hover:text-orange-600 transition-colors">
              Menu
            </a>
            <a href="/profile" className="text-gray-700 hover:text-orange-600 transition-colors">
              Orders
            </a>
          </nav>

          <div className="flex items-center gap-3">
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
                    <p className="text-sm font-medium leading-none">John Doe</p>
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

            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

// CartItem Component
function CartItem({ item, onQuantityChange, onRemove }) {
  return (
    <Card className="p-4 flex gap-4 hover:shadow-lg transition-shadow">
      <img 
        src={item.image} 
        alt={item.name}
        className="w-24 h-24 object-cover rounded-lg"
      />
      
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{item.description}</p>
        <p className="text-lg font-semibold text-orange-600">${item.price.toFixed(2)}</p>
      </div>

      <div className="flex flex-col justify-between items-end">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-white"
            onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="min-w-8 text-center font-medium">{item.quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-white"
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-gray-900">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// EmptyCart Component
function EmptyCart({ onGoToMenu }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag className="w-16 h-16 text-orange-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty </h2>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Let's order something delicious! Browse our menu and add your favorite items to get started.
      </p>
      <Button 
        onClick={onGoToMenu}
        className="bg-orange-600 hover:bg-orange-700 text-white px-8"
      >
        Go to Menu
      </Button>
    </div>
  );
}

// OrderSummary Component
function OrderSummary({ subtotal, deliveryFee, discount, onCheckout, onApplyCoupon }) {
  const [couponCode, setCouponCode] = useState('');
  const total = subtotal + deliveryFee - discount;

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      onApplyCoupon(couponCode);
      setCouponCode('');
    }
  };

  return (
    <Card className="p-6 h-fit sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

      <div className="flex justify-between mb-3">
        <span className="text-gray-600">Subtotal</span>
        <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between mb-3">
        <span className="text-gray-600">Delivery Fee</span>
        <span className="text-gray-900 font-medium">${deliveryFee.toFixed(2)}</span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between mb-3">
          <span className="text-green-600">Discount</span>
          <span className="text-green-600 font-medium">-${discount.toFixed(2)}</span>
        </div>
      )}

      <div className="border-t border-gray-200 my-4"></div>

      <div className="mb-6">
        <label className="text-gray-700 text-sm mb-2 block font-medium">Have a coupon code?</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Enter code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleApplyCoupon}
            className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-600"
          >
            Apply
          </Button>
        </div>
      </div>

      <div className="flex justify-between mb-6 p-4 bg-orange-50 rounded-lg">
        <span className="text-lg font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-orange-600">${total.toFixed(2)}</span>
      </div>

      <Button 
        className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-base font-semibold"
        onClick={onCheckout}
      >
        Proceed to Checkout
      </Button>

      <p className="text-gray-500 text-xs text-center mt-4">
        You will be redirected to the payment page upon checkout.
      </p>
    </Card>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-orange-400 mb-4">FoodFast Delivery</h3>
            <p className="text-gray-400 text-sm">
              Your favorite fast food delivered hot and fresh to your doorstep. Fast, reliable, and delicious!
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-orange-400 mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span>Hotline: 1-800-FOODFAST</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span>support@foodfast.com</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-orange-400 mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a 
                href="#facebook" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#instagram" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#twitter" 
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
             {new Date().getFullYear()} FoodFast Delivery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Main CartPage Component
export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [discount, setDiscount] = useState(0);

  const handleQuantityChange = (id, newQuantity) => {
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
    toast.success('Cart updated!');
  };

  const handleRemoveItem = (id) => {
    const item = cartItems.find(item => item.id === id);
    setCartItems(items => items.filter(item => item.id !== id));
    toast.success(`${item.name} removed from cart`);
  };

  const handleApplyCoupon = (code) => {
    const upperCode = code.toUpperCase();
    if (upperCode === 'SAVE10') {
      const discountAmount = subtotal * 0.1;
      setDiscount(discountAmount);
      toast.success('10% discount applied!');
    } else if (upperCode === 'FREESHIP') {
      setDiscount(DELIVERY_FEE);
      toast.success('Free delivery applied!');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const handleCheckout = () => {
    toast.success('Proceeding to checkout...');
    setTimeout(() => {
      navigate('/payment');
    }, 1000);
  };

  const handleGoToMenu = () => {
    navigate('/products');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" richColors />
      <Header cartItemCount={totalItemCount} />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shopping Cart {cartItems.length > 0 && `(${totalItemCount} items)`}
          </h1>
          <p className="text-gray-600">Review your items before checkout</p>
        </div>

        {cartItems.length === 0 ? (
          <EmptyCart onGoToMenu={handleGoToMenu} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}
              
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={handleContinueShopping}
                  className="w-full sm:w-auto hover:bg-orange-50 hover:text-orange-600 hover:border-orange-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <OrderSummary
                subtotal={subtotal}
                deliveryFee={DELIVERY_FEE}
                discount={discount}
                onCheckout={handleCheckout}
                onApplyCoupon={handleApplyCoupon}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}