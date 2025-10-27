import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, Clock, Flame, Search, MapPin, UtensilsCrossed, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast, Toaster } from "sonner";

const mockProducts = [
  {
    id: "1",
    name: "Margherita Pizza",
    description: "Classic Italian pizza with fresh mozzarella, tomato sauce, and basil",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1681567604770-0dc826c870ae?w=400",
    rating: 4.8,
    reviews: 156,
    category: "pizza",
    restaurantId: "1",
    prepTime: "20-25 min",
    isPopular: true,
    isVegetarian: true,
  },
  {
    id: "2",
    name: "Classic Cheeseburger",
    description: "Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1688246780164-00c01647e78c?w=400",
    rating: 4.6,
    reviews: 203,
    category: "burger",
    restaurantId: "2",
    prepTime: "15-20 min",
    isPopular: true,
  },
  {
    id: "3",
    name: "Salmon Sushi Roll",
    description: "Fresh salmon with cucumber, avocado, and special mayo wrapped in seaweed",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1712725214706-e564b8dd1bbe?w=400",
    rating: 4.9,
    reviews: 89,
    category: "sushi",
    restaurantId: "3",
    prepTime: "25-30 min",
  },
  {
    id: "4",
    name: "Creamy Carbonara",
    description: "Traditional Italian pasta with bacon, eggs, parmesan, and black pepper",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1747852628136-e612ace24a23?w=400",
    rating: 4.7,
    reviews: 134,
    category: "pasta",
    restaurantId: "4",
    prepTime: "20-25 min",
    isPopular: true,
  },
  {
    id: "5",
    name: "Caesar Salad",
    description: "Crispy romaine lettuce with caesar dressing, croutons, and parmesan",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1708184528305-33ce7daced65?w=400",
    rating: 4.5,
    reviews: 78,
    category: "salad",
    restaurantId: "1",
    prepTime: "10-15 min",
    isVegetarian: true,
  },
  {
    id: "6",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a gooey molten center",
    price: 6.99,
    image: "https://images.unsplash.com/photo-1680090966824-eb9e8500bc2b?w=400",
    rating: 4.9,
    reviews: 245,
    category: "dessert",
    restaurantId: "2",
    prepTime: "15-20 min",
    isVegetarian: true,
  },
  {
    id: "7",
    name: "Spicy Pepperoni Pizza",
    description: "Loaded with spicy pepperoni, mozzarella, and hot chili flakes",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
    rating: 4.7,
    reviews: 187,
    category: "pizza",
    restaurantId: "1",
    prepTime: "20-25 min",
    isPopular: true,
    isSpicy: true,
  },
  {
    id: "8",
    name: "Veggie Burger",
    description: "Plant-based patty with avocado, lettuce, tomato, and vegan mayo",
    price: 10.99,
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400",
    rating: 4.4,
    reviews: 95,
    category: "burger",
    restaurantId: "2",
    prepTime: "15-20 min",
    isVegetarian: true,
  },
];

const restaurants = [
  { id: "all", name: "All Restaurants", rating: 4.5, deliveryTime: "20-30 min" },
  { id: "1", name: "Pizza Palace", rating: 4.8, deliveryTime: "20-30 min" },
  { id: "2", name: "Burger Bros", rating: 4.6, deliveryTime: "15-25 min" },
  { id: "3", name: "Sushi Station", rating: 4.9, deliveryTime: "30-40 min" },
  { id: "4", name: "Pasta Paradise", rating: 4.7, deliveryTime: "25-35 min" },
];

const categories = [
  { id: "all", name: "All" },
  { id: "pizza", name: "Pizza" },
  { id: "burger", name: "Burgers" },
  { id: "sushi", name: "Sushi" },
  { id: "pasta", name: "Pasta" },
  { id: "salad", name: "Salads" },
  { id: "dessert", name: "Desserts" },
];

function ProductDetailDialog({ product, isOpen, onClose, onAddToCart, onBuyNow }) {
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
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-80 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
              }}
            />
            {product.isPopular && (
              <Badge className="absolute top-2 left-2 bg-orange-600 hover:bg-orange-600">
                Popular
              </Badge>
            )}
            <div className="absolute top-2 right-2 flex gap-1">
              {product.isSpicy && (
                <Badge variant="destructive" className="bg-red-500 hover:bg-red-500">
                  <Flame className="w-3 h-3 mr-1" />
                  Spicy
                </Badge>
              )}
              {product.isVegetarian && (
                <Badge className="bg-green-600 hover:bg-green-600">
                  Vegetarian
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-gray-900 mb-2 font-semibold">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <Separator />

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-gray-500">({product.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>{product.prepTime}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-gray-900 mb-2 font-semibold">Additional Information</h3>
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

            <div className="mt-auto">
              <div className="mb-4">
                <span className="text-gray-600">Price:</span>
                <div className="text-3xl font-bold text-orange-600 mt-1">${product.price.toFixed(2)}</div>
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

function ProductCard({ product, onAddToCart, onBuyNow, onViewDetails }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div 
        className="relative h-48 overflow-hidden bg-gray-100 cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isPopular && (
          <Badge className="absolute top-2 left-2 bg-orange-600 hover:bg-orange-600">
            Popular
          </Badge>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {product.isSpicy && (
            <Badge variant="destructive" className="bg-red-500 hover:bg-red-500">
              <Flame className="w-3 h-3" />
            </Badge>
          )}
          {product.isVegetarian && (
            <Badge className="bg-green-600 hover:bg-green-600">
              Veg
            </Badge>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 
          className="text-lg font-semibold mb-1 cursor-pointer hover:text-orange-600 transition-colors"
          onClick={() => onViewDetails(product)}
        >
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
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
        <div className="flex items-center justify-between gap-2">
          <span className="text-2xl font-bold text-orange-600">${product.price.toFixed(2)}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddToCart(product)}
              className="hover:bg-orange-50 hover:text-orange-600"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add
            </Button>
            <Button
              size="sm"
              onClick={() => onBuyNow(product)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Buy
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function ProductPage() {
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesRestaurant = selectedRestaurant === "all" || product.restaurantId === selectedRestaurant;
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesRestaurant && matchesSearch;
  });

  const handleAddToCart = (product) => {
    setCartCount(cartCount + 1);
    toast.success(product.name + " added to cart!", {
      description: "Price: $" + product.price.toFixed(2),
    });
  };

  const handleBuyNow = (product) => {
    toast.success("Proceeding to checkout", {
      description: "Total: $" + product.price.toFixed(2),
    });
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  const selectedRestaurantData = restaurants.find(r => r.id === selectedRestaurant);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <ProductDetailDialog
        product={selectedProduct}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="border-b bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2">
                  <div className="bg-orange-600 p-1.5 rounded-lg">
                    <UtensilsCrossed className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-orange-600">FoodFast</span>
                </Link>
                <div className="hidden md:flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Deliver to: <span className="text-gray-900">New York, NY</span></span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-600 hover:bg-orange-600">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">Register</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-80">
              <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{restaurant.name}</span>
                        {restaurant.id !== "all" && (
                          <div className="flex items-center gap-2 ml-4 text-xs text-gray-500">
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{restaurant.rating}</span>
                            </div>
                            <span></span>
                            <span>{restaurant.deliveryTime}</span>
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for dishes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {selectedRestaurant !== "all" && selectedRestaurantData && (
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{selectedRestaurantData.rating}</span>
                <span>Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{selectedRestaurantData.deliveryTime}</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? "bg-orange-600 hover:bg-orange-700 whitespace-nowrap" : "whitespace-nowrap"}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl text-gray-700">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "dish" : "dishes"}
            {selectedCategory !== "all" && (
              <span> in <span className="text-gray-900 capitalize">{selectedCategory}</span></span>
            )}
            {selectedRestaurant !== "all" && selectedRestaurantData && (
              <span> from <span className="text-gray-900">{selectedRestaurantData.name}</span></span>
            )}
          </h2>
        </div>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No dishes found.</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters.</p>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-orange-600 p-2 rounded-lg">
                  <UtensilsCrossed className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xl">FoodFast</span>
              </div>
              <p className="text-sm">
                Your favorite restaurants, delivered to your doorstep. Fresh, fast, and delicious meals whenever you crave them.
              </p>
              <div className="flex gap-3 pt-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-2 rounded-full hover:bg-orange-600 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-2 rounded-full hover:bg-orange-600 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-2 rounded-full hover:bg-orange-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-2 rounded-full hover:bg-orange-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white mb-4 font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-orange-600 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-600 transition-colors">
                    Restaurants
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-600 transition-colors">
                    Become a Partner
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-600 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-600 transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white mb-4 font-semibold">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-orange-600 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-600 transition-colors">
                    Track Your Order
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-600 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-600 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-600 transition-colors">
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white mb-4 font-semibold">Contact Us</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>123 Food Street, New York, NY 10001</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <a href="tel:+1234567890" className="hover:text-orange-600 transition-colors">
                    +1 (234) 567-890
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <a href="mailto:support@foodfast.com" className="hover:text-orange-600 transition-colors">
                    support@foodfast.com
                  </a>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-sm">
                  <span className="text-white">Open Daily:</span> 9:00 AM - 11:00 PM
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-gray-800" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>2025 FoodFast Delivery. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-orange-600 transition-colors">
                Terms & Conditions
              </a>
              <a href="#" className="hover:text-orange-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-orange-600 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}