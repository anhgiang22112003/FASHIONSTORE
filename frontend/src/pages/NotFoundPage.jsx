import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, ShoppingBag, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 py-16">
      <div className="w-full max-w-xl text-center space-y-8">
        {/* Animated 404 */}
        <div className="relative">
          <h1
            className="text-[160px] sm:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 leading-none select-none"
            style={{ WebkitTextStroke: '2px rgba(236,72,153,0.15)' }}
          >
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-xl shadow-pink-200 animate-bounce">
              <Search className="w-9 h-9 text-white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
            Ối! Trang không tồn tại
          </h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Trang bạn đang tìm kiếm có thể đã được di chuyển, xóa, hoặc đường link không chính xác.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-pink-200 hover:shadow-xl hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            <Home className="w-4 h-4" /> Về trang chủ
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-pink-200 transition-all shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" /> Xem sản phẩm
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 text-gray-500 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
