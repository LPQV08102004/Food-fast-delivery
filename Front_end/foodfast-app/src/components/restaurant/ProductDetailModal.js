import React, { useState, useEffect } from 'react';
import { X, Loader2, Plus, Trash2, Image as ImageIcon, Save, Edit2 } from 'lucide-react';
import restaurantService from '../../services/restaurantService';
import { toast } from 'sonner';

export function ProductDetailModal({ isOpen, onClose, productId, restaurantId, onProductUpdated }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [imageUrls, setImageUrls] = useState(['']);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    restaurantId: restaurantId,
    isActive: true
  });

  // Load product details khi modal mở
  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.getProductById(productId);
        setProduct(data);
        
        // Populate form với dữ liệu sản phẩm
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: data.price || '',
          stock: data.stock || '',
          categoryId: data.categoryId || '',
          restaurantId: data.restaurantId || restaurantId,
          isActive: data.isActive !== undefined ? data.isActive : true
        });
        
        // Set image URLs
        if (data.imageUrls && data.imageUrls.length > 0) {
          setImageUrls(data.imageUrls);
        } else if (data.image_urls && data.image_urls.length > 0) {
          setImageUrls(data.image_urls);
        } else {
          setImageUrls(['']);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    const loadCategories = async () => {
      try {
        const data = await restaurantService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Không thể tải danh mục');
      }
    };

    if (isOpen && productId) {
      loadProductDetails();
      loadCategories();
    }
  }, [isOpen, productId, restaurantId]);

  // Helper function để reload product data
  const reloadProductData = async () => {
    try {
      const data = await restaurantService.getProductById(productId);
      setProduct(data);
      
      // Update form data
      setFormData({
        name: data.name || '',
        description: data.description || '',
        price: data.price || '',
        stock: data.stock || '',
        categoryId: data.categoryId || '',
        restaurantId: data.restaurantId || restaurantId,
        isActive: data.isActive !== undefined ? data.isActive : true
      });
      
      // Update image URLs
      if (data.imageUrls && data.imageUrls.length > 0) {
        setImageUrls(data.imageUrls);
      } else if (data.image_urls && data.image_urls.length > 0) {
        setImageUrls(data.image_urls);
      } else {
        setImageUrls(['']);
      }
    } catch (error) {
      console.error('Error reloading product:', error);
      toast.error('Không thể tải lại thông tin sản phẩm');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Xử lý thay đổi URL ảnh
  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  // Thêm ô nhập URL ảnh mới
  const addImageUrlField = () => {
    setImageUrls([...imageUrls, '']);
  };

  // Xóa ô nhập URL ảnh
  const removeImageUrlField = (index) => {
    if (imageUrls.length > 1) {
      const newImageUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newImageUrls);
    } else {
      setImageUrls(['']);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name || !formData.price || formData.stock === '' || !formData.categoryId) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      toast.error('Giá sản phẩm phải lớn hơn 0');
      return;
    }

    if (parseInt(formData.stock) < 0) {
      toast.error('Số lượng không được âm');
      return;
    }

    try {
      setSaving(true);
      
      // Chuẩn bị data để gửi
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId),
        restaurantId: formData.restaurantId,
        isActive: formData.isActive,
        imageUrls: imageUrls.filter(url => url.trim() !== '') // Chỉ gửi URL không rỗng
      };

      await restaurantService.updateProduct(productId, productData);
      
      toast.success('Cập nhật sản phẩm thành công!');
      
      // Gọi callback để reload danh sách sản phẩm
      if (onProductUpdated) {
        onProductUpdated();
      }
      
      // Tắt chế độ chỉnh sửa và reload lại dữ liệu
      setIsEditing(false);
      await reloadProductData();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Không thể cập nhật sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form về dữ liệu gốc
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        categoryId: product.categoryId || '',
        restaurantId: product.restaurantId || restaurantId,
        isActive: product.isActive !== undefined ? product.isActive : true
      });
      
      if (product.imageUrls && product.imageUrls.length > 0) {
        setImageUrls(product.imageUrls);
      } else if (product.image_urls && product.image_urls.length > 0) {
        setImageUrls(product.image_urls);
      } else {
        setImageUrls(['']);
      }
    }
    setIsEditing(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Chi tiết sản phẩm'}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing && !loading && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={saving}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="ml-3 text-gray-500">Đang tải...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cột trái - Thông tin cơ bản */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Thông tin cơ bản
                </h3>

                {/* Tên sản phẩm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tên sản phẩm"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{product?.name}</p>
                  )}
                </div>

                {/* Mô tả */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập mô tả sản phẩm"
                    />
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {product?.description || 'Chưa có mô tả'}
                    </p>
                  )}
                </div>

                {/* Giá */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="1000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 font-semibold text-lg">
                      {formatPrice(product?.price || 0)}
                    </p>
                  )}
                </div>

                {/* Số lượng */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng tồn kho <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      required
                    />
                  ) : (
                    <p className="text-gray-900">
                      <span className="font-medium">{product?.stock || 0}</span> sản phẩm
                    </p>
                  )}
                </div>

                {/* Danh mục */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">{getCategoryName(product?.categoryId)}</p>
                  )}
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Sản phẩm đang hoạt động
                      </label>
                    </div>
                  ) : (
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      product?.isActive && product?.stock > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product?.isActive && product?.stock > 0 ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                    </span>
                  )}
                </div>
              </div>

              {/* Cột phải - Hình ảnh */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Hình ảnh sản phẩm
                </h3>

                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ImageIcon className="w-4 h-4 inline mr-1" />
                      URL Ảnh
                    </label>
                    <div className="space-y-2">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => handleImageUrlChange(index, e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {imageUrls.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeImageUrlField(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa ảnh"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addImageUrlField}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm ảnh
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Nhập URL đầy đủ của ảnh (ví dụ: https://example.com/image.jpg)
                    </p>
                  </div>
                ) : null}

                {/* Gallery hiển thị ảnh */}
                <div className="grid grid-cols-2 gap-3">
                  {(isEditing ? imageUrls : (product?.imageUrls || product?.image_urls || []))
                    .filter(url => url && url.trim() !== '')
                    .map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`${product?.name} - ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg border border-gray-300"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error';
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  
                  {/* Hiển thị thông báo nếu không có ảnh */}
                  {(!product?.imageUrls || product?.imageUrls.length === 0) && 
                   (!product?.image_urls || product?.image_urls.length === 0) && 
                   !isEditing && (
                    <div className="col-span-2 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">Chưa có hình ảnh</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Thông tin bổ sung */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Thông tin bổ sung
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">ID Sản phẩm</p>
                  <p className="text-gray-900 font-mono">#{product?.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Ngày tạo</p>
                  <p className="text-gray-900">
                    {product?.createdAt 
                      ? new Date(product.createdAt).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Cập nhật lần cuối</p>
                  <p className="text-gray-900">
                    {product?.updatedAt 
                      ? new Date(product.updatedAt).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
