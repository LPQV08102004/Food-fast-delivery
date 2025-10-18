package vn.cnpm.product_service.service;

import vn.cnpm.product_service.models.Category;
import java.util.List;

public interface CategoryService {
    Category createCategory(Category category);
    List<Category> getAllCategories();
    Category getCategoryById(Long id);
}
