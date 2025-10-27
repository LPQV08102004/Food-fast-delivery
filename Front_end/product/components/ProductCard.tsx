import { ShoppingCart, Star, Clock, Flame } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  restaurantId: string;
  prepTime: string;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isPopular?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export function ProductCard({
  product,
  onAddToCart,
  onBuyNow,
  onViewDetails,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image */}
      <div
        className="relative h-48 overflow-hidden bg-gray-100 cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isPopular && (
          <Badge className="absolute top-2 left-2 bg-orange-600">
            Popular
          </Badge>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {product.isSpicy && (
            <Badge variant="destructive" className="bg-red-500">
              <Flame className="w-3 h-3" />
            </Badge>
          )}
          {product.isVegetarian && (
            <Badge className="bg-green-600">
              🌱
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3
          className="cursor-pointer hover:text-orange-600 transition-colors mb-1"
          onClick={() => onViewDetails(product)}
        >
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Rating and Time */}
        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{product.rating}</span>
            <span className="text-gray-500">({product.reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{product.prepTime}</span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-orange-600">${product.price.toFixed(2)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddToCart(product)}
              className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-600"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add
            </Button>
            <Button
              size="sm"
              onClick={() => onBuyNow(product)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
