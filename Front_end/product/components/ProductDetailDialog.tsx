import { Star, Clock, Flame, ShoppingCart, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Product } from "./ProductCard";

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export function ProductDetailDialog({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
}: ProductDetailDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            View detailed information about this dish
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="relative">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-80 object-cover rounded-lg"
            />
            {product.isPopular && (
              <Badge className="absolute top-2 left-2 bg-orange-600">
                Popular
              </Badge>
            )}
            <div className="absolute top-2 right-2 flex gap-1">
              {product.isSpicy && (
                <Badge variant="destructive" className="bg-red-500">
                  <Flame className="w-3 h-3 mr-1" />
                  Spicy
                </Badge>
              )}
              {product.isVegetarian && (
                <Badge className="bg-green-600">
                  🌱 Vegetarian
                </Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            {/* Description */}
            <div>
              <h3 className="text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <Separator />

            {/* Rating and Time */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span>{product.rating}</span>
                <span className="text-gray-500">({product.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>{product.prepTime}</span>
              </div>
            </div>

            <Separator />

            {/* Additional Info */}
            <div>
              <h3 className="text-gray-900 mb-2">Additional Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="text-gray-900 capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Preparation Time:</span>
                  <span className="text-gray-900">{product.prepTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dietary Info:</span>
                  <span className="text-gray-900">
                    {product.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}
                    {product.isSpicy ? ", Spicy" : ""}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Price and Actions */}
            <div className="mt-auto">
              <div className="mb-4">
                <span className="text-gray-600">Price:</span>
                <div className="text-orange-600 mt-1">${product.price.toFixed(2)}</div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-600"
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={() => {
                    onBuyNow(product);
                    onClose();
                  }}
                >
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
