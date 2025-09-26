import React from 'react';

const CollectionPage = () => {
  return (
    <div className="bg-gray-100 font-sans">
      
      {/* Hero Section */}
      <div
        className="relative w-full h-[60vh] lg:h-[80vh] bg-cover bg-center"
        style={{ backgroundImage: "url('https://via.placeholder.com/1920x1080/d4d4d4?text=Fashion+Collection+Background')" }}
      >
        <div className="absolute inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center text-center">
          <div className="text-white space-y-4">
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight">Bộ Sưu Tập</h1>
            <p className="text-lg lg:text-xl font-light">
              Khám phá những xu hướng thời trang mới nhất
            </p>
            <button className="mt-4 px-8 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors">
              Khám phá ngay
            </button>
          </div>
        </div>
      </div>

      {/* Collection Grid */}
      <div className="bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

          {[
            {
              title: "Xuân Hè 2024",
              img: "https://via.placeholder.com/600x400/f5f5f5?text=Xuan+He+2024",
              count: 20,
              desc: "Bộ sưu tập tươi mới với những gam màu pastel nhẹ nhàng, phù hợp cho mùa xuân hè năm 2024."
            },
            {
              title: "Thu Đông 2024",
              img: "https://via.placeholder.com/600x400/f5f5f5?text=Thu+Dong+2024",
              count: 25,
              desc: "Những thiết kế ấm áp và sang trọng, mang đến sự thoải mái trong những ngày lạnh."
            },
            {
              title: "Cao Cấp",
              img: "https://via.placeholder.com/600x400/f5f5f5?text=Cao+Cap",
              count: 15,
              desc: "Bộ sưu tập cao cấp với chất liệu premium và thiết kế tinh tế cho những dịp đặc biệt."
            }
          ].map((collection, index) => (
            <div key={index} className="bg-gray-50 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
              <img src={collection.img} alt={collection.title} className="w-full h-48 object-cover" />
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-gray-800">{collection.title}</h3>
                <p className="text-sm text-gray-500">{collection.count} sản phẩm</p>
                <p className="text-gray-600 text-sm">{collection.desc}</p>
                <button className="w-full mt-4 py-2 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors">
                  Xem bộ sưu tập
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-pink-50 py-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-800">Sản phẩm nổi bật</h2>
            <p className="text-gray-600">Những món đồ được yêu thích nhất từ các bộ sưu tập</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

            {[
              { name: "Váy maxi hoa", price: "890.000₫", oldPrice: "1.090.000₫", imgBg: "f8f4f4?text=White+Dress" },
              { name: "Áo blazer thanh lịch", price: "1.200.000₫", oldPrice: "1.500.000₫", imgBg: "f8f4f4?text=Blazer" },
              { name: "Chân váy xếp ly", price: "650.000₫", oldPrice: "850.000₫", imgBg: "f8f4f4?text=Chân+váy" },
              { name: "Áo len cổ lọ", price: "750.000₫", oldPrice: "950.000₫", imgBg: "f8f4f4?text=Áo+len" }
            ].map((product, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
                <div
                  className="relative w-full h-64"
                  style={{
                    backgroundImage: `url('https://via.placeholder.com/400x500/${product.imgBg}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 017.5 3c2.4 0 4.23 1.25 5 3.5.77-2.25 2.6-3.5 5-3.5A5.5 5.5 0 0122 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                    </svg>
                  </button>
                </div>
                <div className="p-3 sm:p-4 flex flex-col flex-grow">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
                  <div className="flex items-baseline mb-3">
                    <span className="text-pink-600 font-bold text-lg">{product.price}</span>
                    <span className="text-gray-400 line-through text-sm ml-2">{product.oldPrice}</span>
                  </div>
                  <button className="mt-auto flex items-center justify-center px-4 py-3 bg-pink-600 text-white rounded-md text-sm sm:text-base font-semibold transition-colors duration-200 hover:bg-pink-700">
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
s
    </div>
  );
};

export default CollectionPage;
