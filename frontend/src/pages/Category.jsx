import React from "react";
import { Heart, Search, Filter } from "lucide-react";

const categories = [
  { name: "Tất cả", count: 120, active: true },
  { name: "Váy đầm", count: 35 },
  { name: "Áo", count: 45 },
  { name: "Quần", count: 25 },
  { name: "Áo khoác", count: 15 },
];

const priceRanges = [
  "Dưới 500.000₫",
  "500.000₫ - 1.000.000₫",
  "1.000.000₫ - 2.000.000₫",
  "Trên 2.000.000₫",
];

const sizes = ["XS", "S", "M", "L", "XL"];

const products = [
  {
    name: "Váy midi hoa nhí",
    price: "680.000₫",
    oldPrice: "850.000₫",
    rating: 4.8,
    discount: "-20%",
    image: "https://via.placeholder.com/400x500/f8f4f4?text=White+Dress",
  },
  {
    name: "Áo sơ mi lụa",
    price: "520.000₫",
    oldPrice: "650.000₫",
    rating: 4.8,
    discount: "-20%",
    image: "https://via.placeholder.com/400x500/f8f4f4?text=White+Dress",
  },
  {
    name: "Chân váy bút chì",
    price: "450.000₫",
    oldPrice: "560.000₫",
    rating: 4.8,
    discount: "-20%",
    image: "https://via.placeholder.com/400x500/f8f4f4?text=White+Dress",
  },
  {
    name: "Áo thun cơ bản",
    price: "350.000₫",
    oldPrice: "440.000₫",
    rating: 4.8,
    discount: "-20%",
    image: "https://via.placeholder.com/400x500/f8f4f4?text=White+Dress",
  },
];

const ProductCard = ({ product }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
    <div
      className="relative w-full h-64 bg-cover bg-center"
      style={{ backgroundImage: `url(${product.image})` }}
    >
      {product.discount && (
        <div className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {product.discount}
        </div>
      )}
      <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
        <Heart className="w-4 h-4 text-pink-600" />
      </button>
    </div>
    <div className="p-3 sm:p-4 flex flex-col flex-grow">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
        {product.name}
      </h3>
      <div className="flex items-baseline mb-3">
        <span className="text-pink-600 font-bold text-lg">{product.price}</span>
        <span className="text-gray-400 line-through text-sm ml-2">{product.oldPrice}</span>
      </div>
      <div className="flex items-center text-yellow-400 text-sm space-x-1 mb-2">
        <span>({product.rating})</span>
      </div>
      <button className="mt-auto flex items-center justify-center px-4 py-3 bg-pink-600 text-white rounded-md text-sm sm:text-base font-semibold transition-colors duration-200 hover:bg-pink-700">
        Thêm vào giỏ
      </button>
    </div>
  </div>
);

const ProductCategoryPage = () => {
  return (
    <div className="bg-pink-50 py-12 px-6">
      <div className="w-full max-w-[1500px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <h2 className="text-3xl font-bold text-gray-800">Danh mục sản phẩm</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button className="flex items-center px-4 py-2 bg-pink-50 text-pink-600 rounded-lg font-semibold">
              <Filter className="w-5 h-5 mr-1" />
              Bộ lọc
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4 space-y-6 bg-white p-6 rounded-xl shadow-lg">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-800">Danh mục</h3>
              <ul className="space-y-2 text-gray-600">
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <a
                      href="#"
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        cat.active ? "bg-pink-50 text-pink-600 font-semibold" : "hover:bg-gray-100"
                      }`}
                    >
                      {cat.name} <span className={cat.active ? "text-gray-500" : "text-gray-400"}>({cat.count})</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-800">Khoảng giá</h3>
              <ul className="space-y-2 text-gray-600">
                {priceRanges.map((range) => (
                  <li key={range}>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="form-checkbox text-pink-500 rounded border-gray-300" />
                      <span>{range}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-800">Kích thước</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:w-3/4 space-y-6">
            <div className="flex items-center justify-between text-gray-600">
              <p>Hiển thị 1-12 của 120 sản phẩm</p>
              <div className="flex items-center space-x-2">
                <p>Sắp xếp theo:</p>
                <select className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Mới nhất</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.name} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCategoryPage;
