import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ShoppingCart, Star, Clock, Flame, Search, MapPin, UtensilsCrossed, ArrowLeft, User, LogOut, Settings, Package, Phone, Mail } from "lucide-react";
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

function ProductDetailDialog({ product, isOpen, onClose, onAddToCart, onBuyNow }) {
	if (!product) return null;

	const productData = {
		name: product.name || 'Unknown Product',
		description: product.description || 'No description available',
		price: product.price || 0,
		image: product.image || "https://via.placeholder.com/400x300?text=No+Image",
		rating: product.rating || 4.0,
		reviews: product.reviews || 0,
		prepTime: product.prepTime || "25-30 min",
		category: product.category || 'uncategorized',
		isPopular: product.isPopular || false,
		isSpicy: product.isSpicy || false,
		isVegetarian: product.isVegetarian || false
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{productData.name}</DialogTitle>
					<DialogDescription>
						View detailed information about this dish
					</DialogDescription>
				</DialogHeader>

				<div className="grid md:grid-cols-2 gap-6">
					<div className="relative">
						<img
							src={productData.image}
							alt={productData.name}
							className="w-full h-80 object-cover rounded-lg"
							onError={(e) => {
								e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
							}}
						/>
						{productData.isPopular && (
							<Badge className="absolute top-2 left-2 bg-orange-600 hover:bg-orange-600">
								Popular
							</Badge>
						)}
						<div className="absolute top-2 right-2 flex gap-1">
							{productData.isSpicy && (
								<Badge variant="destructive" className="bg-red-500 hover:bg-red-500">
									<Flame className="w-3 h-3 mr-1" />
									Spicy
								</Badge>
							)}
							{productData.isVegetarian && (
								<Badge className="bg-green-600 hover:bg-green-600">
									Vegetarian
								</Badge>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<div>
							<h3 className="text-gray-900 mb-2 font-semibold">Description</h3>
							<p className="text-gray-600">{productData.description}</p>
						</div>

						<Separator />

						<div className="flex items-center gap-6">
							<div className="flex items-center gap-1">
								<Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
								<span className="font-medium">{productData.rating.toFixed(1)}</span>
								<span className="text-gray-500">({productData.reviews} reviews)</span>
							</div>
							<div className="flex items-center gap-1 text-gray-600">
								<Clock className="w-5 h-5" />
								<span>{productData.prepTime}</span>
							</div>
						</div>

						<Separator />

						<div>
							<h3 className="text-gray-900 mb-2 font-semibold">Additional Information</h3>
							<div className="space-y-2 text-sm text-gray-600">
								<div className="flex justify-between">
									<span>Category:</span>
									<span className="text-gray-900 capitalize">{productData.category}</span>
								</div>
								<div className="flex justify-between">
									<span>Preparation Time:</span>
									<span className="text-gray-900">{productData.prepTime}</span>
								</div>
								<div className="flex justify-between">
									<span>Dietary Info:</span>
									<span className="text-gray-900">
										{productData.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}
										{productData.isSpicy ? ", Spicy" : ""}
									</span>
								</div>
							</div>
						</div>

						<Separator />

						<div className="mt-auto">
							<div className="mb-4">
								<span className="text-gray-600">Price:</span>
								<div className="text-3xl font-bold text-orange-600 mt-1">${productData.price.toFixed(2)}</div>
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
		<Card className="overflow-hidden hover:shadow-lg transition-shadow">
			<div className="relative h-48 overflow-hidden bg-gray-100 cursor-pointer" onClick={() => onViewDetails(product)}>
				<img
					src={product.image}
					alt={product.name}
					className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
					onError={(e) => {
						e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
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
							onClick={(e) => {
								e.stopPropagation();
								onAddToCart(product);
							}}
							className="hover:bg-orange-50 hover:text-orange-600"
						>
							<ShoppingCart className="w-4 h-4 mr-1" />
							Add
						</Button>
						<Button
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								onBuyNow(product);
							}}
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

export default function RestaurantMenuPage() {
	const navigate = useNavigate();
	const { restaurantId } = useParams();
	const { addToCart, getTotalItems } = useCart();
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [restaurant, setRestaurant] = useState(null);
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([{ id: "all", name: "All" }]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Kiểm tra trạng thái đăng nhập
	useEffect(() => {
		const currentUser = authService.getCurrentUser();
		const authenticated = authService.isAuthenticated();

		if (authenticated && currentUser) {
			setUser(currentUser);
			setIsAuthenticated(true);
		}
	}, []);

	// Lấy thông tin restaurant
	useEffect(() => {
		const fetchRestaurant = async () => {
			try {
				const data = await restaurantService.getRestaurantById(restaurantId);
				setRestaurant({
					id: data.id,
					name: data.name || 'Restaurant',
					address: data.address || 'N/A',
					phoneNumber: data.phoneNumber || 'N/A',
					rating: data.rating || 4.5,
					deliveryTime: data.deliveryTime || "25-30 min",
					description: data.description || "Welcome to our restaurant"
				});
			} catch (err) {
				console.error('Error fetching restaurant:', err);
				toast.error('Không thể tải thông tin nhà hàng');
				setError('Không thể tải thông tin nhà hàng');
			}
		};

		if (restaurantId) {
			fetchRestaurant();
		}
	}, [restaurantId]);

	// Lấy danh sách categories
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
			}
		};

		fetchCategories();
	}, []);

	// Lấy danh sách products của restaurant
	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await productService.getProductsByRestaurant(restaurantId);

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
					restaurantId: product.restaurantId ? product.restaurantId.toString() : null,
					prepTime: "20-25 min",
					isPopular: product.stock > 50,
					isVegetarian: false,
					isSpicy: false,
					stock: product.stock,
					isActive: product.isActive
				})).filter(product => product.isActive);

				setProducts(formattedProducts);
			} catch (err) {
				console.error('Error fetching products:', err);
				setError('Không thể tải menu. Vui lòng thử lại sau.');
				toast.error('Không thể tải menu');
			} finally {
				setLoading(false);
			}
		};

		if (restaurantId) {
			fetchProducts();
		}
	}, [restaurantId]);

	const filteredProducts = products.filter((product) => {
		const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
		const matchesSearch =
			searchQuery === "" ||
			product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			product.description.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesCategory && matchesSearch;
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

			{/* Header */}
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
			</header>

			{/* Restaurant Info Banner */}
			{restaurant && (
				<div className="bg-white border-b">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
						<div className="flex items-center gap-3 mb-4">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate('/products')}
								className="gap-2"
							>
								<ArrowLeft className="w-4 h-4" />
								Back to Restaurants
							</Button>
						</div>
						<div className="flex items-start justify-between">
							<div>
								<h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
								<p className="text-gray-600 mb-3">{restaurant.description}</p>
								<div className="flex items-center gap-6 text-sm text-gray-600">
									<div className="flex items-center gap-1">
										<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
										<span className="font-medium">{restaurant.rating}</span>
										<span>Rating</span>
									</div>
									<div className="flex items-center gap-1">
										<Clock className="w-4 h-4" />
										<span>{restaurant.deliveryTime}</span>
									</div>
									<div className="flex items-center gap-1">
										<MapPin className="w-4 h-4" />
										<span>{restaurant.address}</span>
									</div>
									<div className="flex items-center gap-1">
										<Phone className="w-4 h-4" />
										<span>{restaurant.phoneNumber}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Search and Filter */}
			<div className="bg-white border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
						<input
							type="text"
							placeholder="Search menu..."
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
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
			</div>

			{/* Products Grid */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-6">
					<h2 className="text-xl text-gray-700">
						{loading ? (
							"Đang tải menu..."
						) : (
							<>
								Showing {filteredProducts.length} {filteredProducts.length === 1 ? "dish" : "dishes"}
								{selectedCategory !== "all" && (
									<span> in <span className="text-gray-900 capitalize">{categories.find(c => c.id === selectedCategory)?.name}</span></span>
								)}
							</>
						)}
					</h2>
				</div>

				{loading ? (
					<div className="text-center py-16">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-orange-600"></div>
						<p className="text-gray-600 text-lg mt-4">Đang tải menu...</p>
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
		</div>
	);
}

