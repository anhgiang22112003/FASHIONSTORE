import React from "react";

const products = [
  {
    id: 1,
    name: "Váy hồng thanh lịch",
    price: 590000,
    oldPrice: 690000,
    image: "https://via.placeholder.com/300x400.png?text=Vay+hong",
  },
  {
    id: 2,
    name: "Áo sơ mi trắng basic",
    price: 450000,
    oldPrice: 550000,
    image: "https://via.placeholder.com/300x400.png?text=Ao+so+mi",
  },
  {
    id: 3,
    name: "Áo cardigan hồng",
    price: 720000,
    oldPrice: 820000,
    image: "https://via.placeholder.com/300x400.png?text=Ao+cardigan",
  },
  {
    id: 4,
    name: "Chân váy xoè",
    price: 380000,
    oldPrice: 480000,
    image: "https://via.placeholder.com/300x400.png?text=Chan+vay",
  },
  {
    id: 5,
    name: "Váy hồng thanh lịch",
    price: 590000,
    oldPrice: 690000,
    image: "https://via.placeholder.com/300x400.png?text=Vay+hong",
  },
  {
    id: 6,
    name: "Áo sơ mi trắng basic",
    price: 450000,
    oldPrice: 550000,
    image: "https://via.placeholder.com/300x400.png?text=Ao+so+mi",
  },
];

const Wishlist = () => {
  return (
    <div className="bg-pink-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center text-gray-800">
          <h1 className="text-2xl sm:text-3xl font-bold">Danh sách yêu thích</h1>
          <div className="text-gray-500 font-medium">{products.length} sản phẩm</div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
            >
              <div className="relative w-full h-48 sm:h-64 bg-gray-100 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <span className="heart-icon w-4 h-4 bg-cover"></span>
                </button>
              </div>
              <div className="p-3 sm:p-4 flex flex-col flex-grow">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                  {product.name}
                </h3>
                <div className="flex items-baseline mb-3">
                  <span className="text-pink-600 font-bold text-lg">
                    {product.price.toLocaleString()}₫
                  </span>
                  <span className="text-gray-400 line-through text-sm ml-2">
                    {product.oldPrice.toLocaleString()}₫
                  </span>
                </div>
                <div className="mt-auto flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center px-4 py-3 bg-pink-600 text-white rounded-md text-sm sm:text-base font-semibold transition-colors duration-200 hover:bg-pink-700">
                    <span className="cart-icon w-4 h-4 sm:w-5 sm:h-5 mr-1 bg-contain bg-no-repeat"></span>
                    Thêm vào giỏ
                  </button>
                  <button className="p-3 border border-pink-600 rounded-md">
                    <span className="trash-icon w-5 h-5 bg-contain bg-no-repeat"></span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
