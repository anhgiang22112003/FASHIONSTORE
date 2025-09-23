import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Filter, Grid, List, Star, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { products, categories } from '../data/productsMock';

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');

  useEffect(() => {
    let filtered = products.filter(product => {
      if (category === 'all') return true;
      return product.category === category || product.category === 'unisex';
    });

    // Filter by subcategory
    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(product => product.subcategory === selectedSubcategory);
    }

    // Filter by price range
    if (priceRange !== 'all') {
      switch (priceRange) {
        case 'under-100k':
          filtered = filtered.filter(product => product.price < 100000);
          break;
        case '100k-300k':
          filtered = filtered.filter(product => product.price >= 100000 && product.price <= 300000);
          break;
        case 'over-300k':
          filtered = filtered.filter(product => product.price > 300000);
          break;
      }
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredProducts(filtered);
  }, [category, selectedSubcategory, priceRange, sortBy]);

  const categoryInfo = categories[category] || { name: 'Tất cả sản phẩm', subcategories: [] };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <span className="cursor-pointer hover:text-pink-500" onClick={() => navigate('/')}>
          Trang chủ
        </span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{categoryInfo.name}</span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryInfo.name}</h1>
          <p className="text-gray-600">{filteredProducts.length} sản phẩm</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex border rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="featured">Nổi bật</option>
            <option value="newest">Mới nhất</option>
            <option value="price-low">Giá thấp đến cao</option>
            <option value="price-high">Giá cao đến thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5" />
              <h3 className="font-semibold">Bộ lọc</h3>
            </div>

            {/* Subcategory Filter */}
            {categoryInfo.subcategories.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-3">Danh mục con</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="subcategory"
                      value="all"
                      checked={selectedSubcategory === 'all'}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      className="mr-2"
                    />
                    Tất cả
                  </label>
                  {categoryInfo.subcategories.map((sub) => (
                    <label key={sub.id} className="flex items-center">
                      <input
                        type="radio"
                        name="subcategory"
                        value={sub.id}
                        checked={selectedSubcategory === sub.id}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        className="mr-2"
                      />
                      {sub.name} ({sub.count})
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Khoảng giá</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    value="all"
                    checked={priceRange === 'all'}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="mr-2"
                  />
                  Tất cả
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    value="under-100k"
                    checked={priceRange === 'under-100k'}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="mr-2"
                  />
                  Dưới 100,000đ
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    value="100k-300k"
                    checked={priceRange === '100k-300k'}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="mr-2"
                  />
                  100,000đ - 300,000đ
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="price"
                    value="over-300k"
                    checked={priceRange === 'over-300k'}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="mr-2"
                  />
                  Trên 300,000đ
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-6"
            }>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, viewMode, onClick }) => {
  const [isLiked, setIsLiked] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className="flex gap-6 bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div className="w-32 h-32 flex-shrink-0">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg cursor-pointer"
            onClick={onClick}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-pink-500" onClick={onClick}>
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({product.reviews})</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-pink-500">
                {product.price.toLocaleString('vi-VN')}đ
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  {product.originalPrice.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={isLiked ? 'text-pink-500 border-pink-500' : ''}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="aspect-square overflow-hidden rounded-t-lg relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
          onClick={onClick}
        />
        
        {product.originalPrice > product.price && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isLiked ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 hover:bg-pink-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-pink-500" onClick={onClick}>
          {product.name}
        </h3>
        
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < Math.floor(product.rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs text-gray-600 ml-1">({product.reviews})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-pink-500">
            {product.price.toLocaleString('vi-VN')}đ
          </span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {product.originalPrice.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;