import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import restaurantService from '../../services/restaurantService';
import { toast } from 'sonner';

export function AddProductModal({ isOpen, onClose, restaurantId, onProductAdded }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageUrls, setImageUrls] = useState(['']); // Mảng chứa các URL ảnh
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    restaurantId: restaurantId,
    isActive: true
  });

  // Load categories khi modal mở
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const data = await restaurantService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Không thể tải danh mục');
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
    if (!formData.name || !formData.price || !formData.stock || !formData.categoryId) {
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
      setLoading(true);
      
      // Chuẩn bị data để gửi
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId),
        restaurantId: restaurantId,
        isActive: formData.isActive,
        imageUrls: imageUrls.filter(url => url.trim() !== '') // Chỉ gửi URL không rỗng
      };

      await restaurantService.createProduct(productData);
      
      toast.success('Thêm sản phẩm thành công!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        restaurantId: restaurantId,
        isActive: true
      });
      setImageUrls(['']); // Reset image URLs
      
      // Gọi callback để reload danh sách sản phẩm
      if (onProductAdded) {
        onProductAdded();
      }
      
      // Đóng modal
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Không thể thêm sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">Thêm sản phẩm mới</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tên sản phẩm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mô tả sản phẩm"
            />
          </div>

          {/* Giá và Số lượng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá (VNĐ) <span className="text-red-500">*</span>
              </label>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng <span className="text-red-500">*</span>
              </label>
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
            </div>
          </div>

          {/* Danh mục */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục <span className="text-red-500">*</span>
            </label>
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
            {categories.length === 0 && (
              <p className="mt-1 text-sm text-amber-600">
                Chưa có danh mục nào. Vui lòng liên hệ admin để thêm danh mục.
              </p>
            )}
          </div>

          {/* URL Ảnh sản phẩm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Ảnh sản phẩm (URL)
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
            {/* Preview ảnh đầu tiên nếu có URL hợp lệ */}
            {imageUrls[0] && imageUrls[0].trim() !== '' && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                <img 
                  src={imageUrls[0]} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                  onLoad={(e) => {
                    e.target.style.display = 'block';
                  }}
                />
              </div>
            )}
          </div>

          {/* Trạng thái hoạt động */}
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

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                'Thêm sản phẩm'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
