import { ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyCartProps {
  onGoToMenu: () => void;
}

export function EmptyCart({ onGoToMenu }: EmptyCartProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mb-6">
        <ShoppingBag className="w-16 h-16 text-orange-600" />
      </div>
      
      <h2 className="text-gray-900 mb-3">Your cart is empty 🍟</h2>
      
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Let's order something delicious! Browse our menu and add your favorite items to get started.
      </p>

      <Button 
        className="bg-orange-600 hover:bg-orange-700 text-white px-8"
        onClick={onGoToMenu}
      >
        Go to Menu
      </Button>
    </div>
  );
}
