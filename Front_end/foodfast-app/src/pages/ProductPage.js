import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Clock, Flame, Search, MapPin, UtensilsCrossed, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, X, User, LogOut, Settings, Package } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast, Toaster } from "sonner";
import authService from "../services/authService";
import productService from "../services/productService";
import categoryService from "../services/categoryService";
import restaurantService from "../services/restaurantService";
import { useCart } from "../contexts/CartContext";

// Giữ lại categories tĩnh cho filter
const initialCategories = [
	{ id: "all", name: "All" },
];

// Danh sách restaurants tạm thời (có thể lấy từ API sau)
const initialRestaurants = [
	{ id: "all", name: "All Restaurants" },
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
	const navigate = useNavigate();
	const { addToCart, getTotalItems } = useCart();
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedRestaurant, setSelectedRestaurant] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState(initialCategories);
	const [restaurants, setRestaurants] = useState(initialRestaurants);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Kiểm tra trạng thái đăng nhập khi component mount
	useEffect(() => {
		const currentUser = authService.getCurrentUser();
		const authenticated = authService.isAuthenticated();

		if (authenticated && currentUser) {
			setUser(currentUser);
			setIsAuthenticated(true);
		}
	}, []);

	// Lấy danh sách categories từ API
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const data = await categoryService.getAllCategories();
				const formattedCategories = [
					{ id: "all", name: "All" },
					...data.map(cat => ({
						id: cat.id.toString(),
						name: cat.name,
						description: cat.description
					}))
				];
				setCategories(formattedCategories);
			} catch (err) {
				console.error('Error fetching categories:', err);
				toast.error('Không thể tải danh mục');
			}
		};

		fetchCategories();
	}, []);

	// Lấy danh sách restaurants từ API
	useEffect(() => {
		const fetchRestaurants = async () => {
			try {
				const data = await restaurantService.getAllRestaurants();
				const formattedRestaurants = [
					{ id: "all", name: "All Restaurants" },
					...data.map(rest => ({
						id: rest.id.toString(),
						name: rest.name,
						address: rest.address,
						phoneNumber: rest.phoneNumber,
						rating: rest.rating || 4.5,
						deliveryTime: rest.deliveryTime || "25-30 min",
						productCount: rest.productCount || 0
					}))
				];
				setRestaurants(formattedRestaurants);
			} catch (err) {
				console.error('Error fetching restaurants:', err);
				toast.error('Không thể tải danh sách nhà hàng');
			}
		};

		fetchRestaurants();
	}, []);

	// Lấy danh sách products từ API
	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await productService.getAllProducts();

				// Chuyển đổi dữ liệu từ backend sang format frontend
				const formattedProducts = data.map(product => ({
					id: product.id.toString(),
					name: product.name,
					description: product.description || "Delicious food item",
					price: product.price,
					image: product.image_urls && product.image_urls.length > 0
						? product.image_urls[0]
						: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
					rating: 4.5,
					reviews: Math.floor(Math.random() * 200) + 50,
					category: product.categoryId ? product.categoryId.toString() : "all",
					categoryId: product.categoryId,
					restaurantId: product.restaurantId ? product.restaurantId.toString() : null,  // Lấy restaurantId thực từ backend
					prepTime: "20-25 min",
					isPopular: product.stock > 50,
					isVegetarian: false,
					stock: product.stock,
					isActive: product.isActive
				})).filter(product => product.isActive);

				setProducts(formattedProducts);
			} catch (err) {
				console.error('Error fetching products:', err);
				setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
				toast.error('Không thể tải danh sách sản phẩm');
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();
	}, []);

	const filteredProducts = products.filter((product) => {
		const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
		const matchesRestaurant = selectedRestaurant === "all" || product.restaurantId === selectedRestaurant;
		const matchesSearch =
			searchQuery === "" ||
			product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			product.description.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesCategory && matchesRestaurant && matchesSearch;
	});

	const handleAddToCart = (product) => {
		addToCart(product, 1);
	};

	const handleBuyNow = (product) => {
		addToCart(product, 1);
		navigate('/cart');
	};

	const handleViewDetails = (product) => {
		setSelectedProduct(product);
		setIsDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setIsDialogOpen(false);
		setSelectedProduct(null);
	};

	const handleLogout = () => {
		authService.logout();
		setUser(null);
		setIsAuthenticated(false);
		toast.success("Đăng xuất thành công");
		navigate('/login');
	};

	// Get user initials for avatar
	const getUserInitials = () => {
		if (!user) return "U";
		if (user.fullName) {
			const names = user.fullName.split(' ');
			return names.length >= 2
				? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
				: names[0][0].toUpperCase();
		}
		return user.username ? user.username[0].toUpperCase() : "U";
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
								<Button
									variant="ghost"
									size="sm"
									className="relative"
									onClick={() => navigate('/cart')}
								>
									<ShoppingCart className="w-5 h-5" />
									{getTotalItems() > 0 && (
										<Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-600 hover:bg-orange-600">
											{getTotalItems()}
										</Badge>
									)}
								</Button>

								{/* Hiển thị khác nhau dựa trên trạng thái đăng nhập */}
								{isAuthenticated && user ? (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="relative h-9 w-9 rounded-full">
												<Avatar className="h-9 w-9">
													<AvatarImage src={user.avatar} alt={user.fullName || user.username} />
													<AvatarFallback className="bg-orange-600 text-white">
														{getUserInitials()}
													</AvatarFallback>
												</Avatar>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent className="w-56" align="end" forceMount>
											<DropdownMenuLabel className="font-normal">
												<div className="flex flex-col space-y-1">
													<p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
													<p className="text-xs leading-none text-muted-foreground">
														{user.email}
													</p>
												</div>
											</DropdownMenuLabel>
											<DropdownMenuSeparator />
											<DropdownMenuItem onClick={() => navigate('/profile')}>
												<User className="mr-2 h-4 w-4" />
												<span>Profile</span>
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => navigate('/orders')}>
												<Package className="mr-2 h-4 w-4" />
												<span>My Orders</span>
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => navigate('/settings')}>
												<Settings className="mr-2 h-4 w-4" />
												<span>Settings</span>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem onClick={handleLogout} className="text-red-600">
												<LogOut className="mr-2 h-4 w-4" />
												<span>Log out</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
									<>
										<Link to="/login">
											<Button variant="ghost" size="sm">Login</Button>
										</Link>
										<Link to="/register">
											<Button size="sm" className="bg-orange-600 hover:bg-orange-700">Register</Button>
										</Link>
									</>
								)}
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
						{loading ? (
							"Đang tải sản phẩm..."
						) : (
							<>
								Showing {filteredProducts.length} {filteredProducts.length === 1 ? "dish" : "dishes"}
								{selectedCategory !== "all" && (
									<span> in <span className="text-gray-900 capitalize">{selectedCategory}</span></span>
								)}
								{selectedRestaurant !== "all" && selectedRestaurantData && (
									<span> from <span className="text-gray-900">{selectedRestaurantData.name}</span></span>
								)}
							</>
						)}
					</h2>
				</div>

				{loading ? (
					<div className="text-center py-16">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-600"></div>
						<p className="text-gray-600 text-lg mt-4">Đang tải sản phẩm...</p>
					</div>
				) : error ? (
					<div className="text-center py-16">
						<p className="text-red-600 text-lg">{error}</p>
						<Button
							onClick={() => window.location.reload()}
							className="mt-4 bg-orange-600 hover:bg-orange-700"
						>
							Thử lại
						</Button>
					</div>
				) : filteredProducts.length > 0 ? (
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
