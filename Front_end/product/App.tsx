import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ProductCard, Product } from "./components/ProductCard";
import { ProductDetailDialog } from "./components/ProductDetailDialog";
import { Footer } from "./components/Footer";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./components/ui/pagination";

// Mock Products Data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    description: "Classic Italian pizza with fresh mozzarella, tomato sauce, and basil",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1681567604770-0dc826c870ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGZvb2R8ZW58MXx8fHwxNzYxNDkzNDAzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
    image: "https://images.unsplash.com/photo-1688246780164-00c01647e78c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc2MTU0NDUwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
    image: "https://images.unsplash.com/photo-1712725214706-e564b8dd1bbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMGphcGFuZXNlfGVufDF8fHx8MTc2MTQ5MDYwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
    image: "https://images.unsplash.com/photo-1747852628136-e612ace24a23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGl0YWxpYW58ZW58MXx8fHwxNzYxNTY3NzkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
    image: "https://images.unsplash.com/photo-1708184528305-33ce7daced65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGhlYWx0aHl8ZW58MXx8fHwxNzYxNTY2NDg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.5,
    reviews: 78,
    category: "salad",
    restaurantId: "all",
    prepTime: "10-15 min",
    isVegetarian: true,
  },
  {
    id: "6",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a gooey molten center, served with vanilla ice cream",
    price: 6.99,
    image: "https://images.unsplash.com/photo-1680090966824-eb9e8500bc2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNzZXJ0JTIwY2FrZXxlbnwxfHx8fDE3NjE1MjE4ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9,
    reviews: 245,
    category: "dessert",
    restaurantId: "all",
    prepTime: "15-20 min",
    isVegetarian: true,
  },
  {
    id: "7",
    name: "Spicy Beef Tacos",
    description: "Three soft tacos filled with seasoned beef, salsa, cheese, and sour cream",
    price: 10.99,
    image: "https://images.unsplash.com/photo-1599488400918-5f5f96b3f463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWNvcyUyMG1leGljYW58ZW58MXx8fHwxNzYxNDgzNzk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6,
    reviews: 167,
    category: "mexican",
    restaurantId: "5",
    prepTime: "15-20 min",
    isSpicy: true,
    isPopular: true,
  },
  {
    id: "8",
    name: "Tonkotsu Ramen",
    description: "Rich pork bone broth with ramen noodles, pork belly, egg, and vegetables",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYW1lbiUyMG5vb2RsZXN8ZW58MXx8fHwxNzYxNTAxMzIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8,
    reviews: 192,
    category: "asian",
    restaurantId: "3",
    prepTime: "25-30 min",
  },
  {
    id: "9",
    name: "Pepperoni Pizza",
    description: "Loaded with pepperoni, mozzarella cheese, and tomato sauce on crispy crust",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1681567604770-0dc826c870ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGZvb2R8ZW58MXx8fHwxNzYxNDkzNDAzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    reviews: 221,
    category: "pizza",
    restaurantId: "1",
    prepTime: "20-25 min",
  },
  {
    id: "10",
    name: "Bacon Burger Deluxe",
    description: "Double beef patties with crispy bacon, cheese, onion rings, and BBQ sauce",
    price: 11.99,
    image: "https://images.unsplash.com/photo-1688246780164-00c01647e78c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc2MTU0NDUwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8,
    reviews: 188,
    category: "burger",
    restaurantId: "2",
    prepTime: "20-25 min",
  },
  {
    id: "11",
    name: "Veggie Pasta Primavera",
    description: "Fresh vegetables tossed with pasta in a light garlic olive oil sauce",
    price: 11.99,
    image: "https://images.unsplash.com/photo-1747852628136-e612ace24a23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGl0YWxpYW58ZW58MXx8fHwxNzYxNTY3NzkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.5,
    reviews: 95,
    category: "pasta",
    restaurantId: "4",
    prepTime: "20-25 min",
    isVegetarian: true,
  },
  {
    id: "12",
    name: "Greek Salad",
    description: "Fresh vegetables, feta cheese, olives, and olive oil dressing",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1708184528305-33ce7daced65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGhlYWx0aHl8ZW58MXx8fHwxNzYxNTY2NDg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6,
    reviews: 112,
    category: "salad",
    restaurantId: "all",
    prepTime: "10-15 min",
    isVegetarian: true,
  },
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [selectedRestaurant, setSelectedRestaurant] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 30;

  // Filter products based on restaurant, category, and search
  const filteredProducts = mockProducts.filter((product) => {
    const matchesRestaurant =
      selectedRestaurant === "all" ||
      product.restaurantId === selectedRestaurant ||
      product.restaurantId === "all";

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRestaurant && matchesCategory && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRestaurant, selectedCategory, searchQuery]);

  const handleAddToCart = (product: Product) => {
    setCartCount(cartCount + 1);
    toast.success(`${product.name} added to cart!`, {
      description: `Price: $${product.price.toFixed(2)}`,
    });
  };

  const handleBuyNow = (product: Product) => {
    toast.success(`Proceeding to checkout for ${product.name}`, {
      description: `Total: $${product.price.toFixed(2)}`,
    });
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    toast.success("Welcome back!", {
      description: "You have successfully logged in.",
    });
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
    toast.success("Account created!", {
      description: "Welcome to FoodHub!",
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast.info("Logged out", {
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      <Header
        isLoggedIn={isLoggedIn}
        cartCount={cartCount}
        selectedRestaurant={selectedRestaurant}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onRestaurantChange={setSelectedRestaurant}
        onCategoryChange={setSelectedCategory}
        onSearchChange={setSearchQuery}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Info */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-gray-700">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "dish" : "dishes"}
            {selectedCategory !== "all" && (
              <span> in <span className="text-gray-900 capitalize">{selectedCategory}</span></span>
            )}
          </h2>
          {totalPages > 1 && (
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }
                        }}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                      const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                      const showEllipsisAfter =
                        page === currentPage + 2 && currentPage < totalPages - 2;

                      if (showEllipsisBefore || showEllipsisAfter) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => {
                              setCurrentPage(page);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => {
                          if (currentPage < totalPages) {
                            setCurrentPage(currentPage + 1);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No dishes found matching your criteria.</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
          </div>
        )}
      </main>

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        product={selectedProduct}
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <Footer />
    </div>
  );
}
