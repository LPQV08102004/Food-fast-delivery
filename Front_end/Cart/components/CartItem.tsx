import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

export interface CartItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const subtotal = item.price * item.quantity;

  return (
    <Card className="p-4 flex gap-4 hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-gray-900">{item.name}</h3>
          <p className="text-gray-500 text-sm mt-1">{item.description}</p>
          <p className="text-orange-600 mt-2">${item.price.toFixed(2)}</p>
        </div>

        {/* Quantity Controls & Subtotal */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white"
              onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="min-w-8 text-center">{item.quantity}</span>
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
            <span className="text-gray-900">${subtotal.toFixed(2)}</span>
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
      </div>
    </Card>
  );
}
