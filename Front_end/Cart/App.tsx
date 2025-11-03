import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Header } from './components/Header';
import { CartItem, CartItemType } from './components/CartItem';
import { OrderSummary } from './components/OrderSummary';
import { EmptyCart } from './components/EmptyCart';
import { Footer } from './components/Footer';
import { Button } from './components/ui/button';
import { toast, Toaster } from 'sonner@2.0.3';

const DELIVERY_FEE = 5.99;

// Mock cart data
const initialCartItems: CartItemType[] = [
  {
    id: '1',
    name: 'Classic Beef Burger',
    description: 'Juicy beef patty with lettuce, tomato, cheese & special sauce',
    price: 12.99,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1656439659132-24c68e36b553?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmYXN0JTIwZm9vZHxlbnwxfHx8fDE3NjE3NjE5ODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '2',
    name: 'Pepperoni Pizza',
    description: 'Large pizza with mozzarella cheese and premium pepperoni',
    price: 18.99,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHNsaWNlfGVufDF8fHx8MTc2MTc0OTA5NXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '3',
    name: 'Crispy French Fries',
    description: 'Golden crispy fries seasoned to perfection',
    price: 4.99,
    quantity: 3,
    image: 'https://images.unsplash.com/photo-1630431341973-02e1b662ec35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBmcmllc3xlbnwxfHx8fDE3NjE3ODIzMzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '4',
    name: 'Coca-Cola',
    description: 'Refreshing cold drink - 500ml',
    price: 2.49,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1614620150352-c89bb3dae31c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0JTIwZHJpbmslMjBjb2xhfGVufDF8fHx8MTc2MTg0MDY3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export default function App() {
  const [cartItems, setCartItems] = useState<CartItemType[]>(initialCartItems);
  const [discount, setDiscount] = useState(0);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Handle quantity change
  const handleQuantityChange = (id: string, newQuantity: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
    toast.success('Quantity updated');
  };

  // Handle remove item
  const handleRemoveItem = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    setCartItems(items => items.filter(item => item.id !== id));
    toast.success(`${item?.name} removed from cart`);
  };

  // Handle apply coupon
  const handleApplyCoupon = (code: string) => {
    const upperCode = code.toUpperCase();
    
    // Mock coupon validation
    if (upperCode === 'SAVE10') {
      setDiscount(subtotal * 0.1);
      toast.success('Coupon applied! 10% discount added');
    } else if (upperCode === 'FREESHIP') {
      setDiscount(DELIVERY_FEE);
      toast.success('Coupon applied! Free delivery');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    toast.success('Redirecting to checkout...');
    // In a real app: navigate to /checkout
    setTimeout(() => {
      toast.info('This would navigate to the payment page');
    }, 1500);
  };

  // Handle go to menu
  const handleGoToMenu = () => {
    toast.info('Redirecting to menu...');
    // In a real app: navigate to /menu
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    toast.info('Redirecting to menu...');
    // In a real app: navigate to /menu
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" richColors />
      
      <Header cartItemCount={totalItemCount} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {cartItems.length === 0 
              ? 'No items in your cart' 
              : `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} in your cart`
            }
          </p>
        </div>

        {cartItems.length === 0 ? (
          <EmptyCart onGoToMenu={handleGoToMenu} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}

              {/* Continue Shopping Button */}
              <Button
                variant="outline"
                className="w-full mt-6 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-600"
                onClick={handleContinueShopping}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </div>

            {/* Right Column - Order Summary */}
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
