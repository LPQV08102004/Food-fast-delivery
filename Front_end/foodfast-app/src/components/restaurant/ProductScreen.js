import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import restaurantService from '../../services/restaurantService';
import { toast } from 'sonner';
import { AddProductModal } from './AddProductModal';

export function ProductScreen({ restaurantId = 1 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.getProductsByRestaurantId(restaurantId);
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Không thể tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [restaurantId]);

  useEffect(() => {
    // Filter products based on search term
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const reloadProducts = async () => {
    try {
      const data = await restaurantService.getProductsByRestaurantId(restaurantId);
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error reloading products:', error);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      await restaurantService.deleteProduct(productId);
      toast.success('Xóa sản phẩm thành công');
      reloadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center min-h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="ml-3 text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Product</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add product
          </button>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            {products.length === 0 ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium mb-2">Chưa có sản phẩm nào</p>
                <p className="text-gray-500 mb-4">Bắt đầu thêm sản phẩm đầu tiên của bạn</p>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thêm sản phẩm đầu tiên
                </button>
              </div>
            ) : (
              <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp với từ khóa "{searchTerm}"</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Image</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Detail</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {product.image_urls && product.image_urls.length > 0 ? (
                        <img 
                          src={product.image_urls[0]} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-400">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4">{formatPrice(product.price)}</td>
                    <td className="py-3 px-4">{product.stock}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.isActive && product.stock > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive && product.stock > 0 ? 'Available' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => toast.info('Chức năng xem chi tiết đang phát triển')}
                        className="text-blue-600 hover:underline"
                      >
                        detail
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:underline"
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        restaurantId={restaurantId}
        onProductAdded={reloadProducts}
      />
    </div>
  );
}
