import React from "react";

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
        <svg
          className="w-4 h-4 text-pink-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 017.5 3c2.4 0 4.23 1.25 5 3.5.77-2.25 2.6-3.5 5-3.5A5.5 5.5 0 0122 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
        </svg>
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
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button className="flex items-center px-4 py-2 bg-pink-50 text-pink-600 rounded-lg font-semibold">
              <svg
                className="w-5 h-5 mr-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 17a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v12zm1-2h16V5H4v10zm-1-8H1a1 1 0 000 2h2v-2zm22 0h-2a1 1 0 000 2h2v-2zM9 11a1 1 0 001 1h4a1 1 0 001-1V9a1 1 0 00-1-1h-4a1 1 0 00-1 1v2z"></path>
              </svg>
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
