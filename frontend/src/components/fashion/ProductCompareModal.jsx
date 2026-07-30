import React, { useContext } from 'react';
import { createPortal } from 'react-dom';
import { CompareContext } from '@/context/CompareContext';
import { X, Scale, Trash2, ShoppingBag, Star, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCompareModal = () => {
  const { compareList, removeFromCompare, clearCompare, isCompareOpen, setIsCompareOpen } =
    useContext(CompareContext);

  if (compareList.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Bar when items are selected */}
      {!isCompareOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[8888] bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-pink-200 flex items-center gap-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-500 rounded-xl text-white">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">So sánh sản phẩm</p>
              <p className="text-xxs text-gray-500">Đã chọn {compareList.length}/3 sản phẩm</p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
            <div className="flex -space-x-2 overflow-hidden">
              {compareList.map((item, i) => (
                <img
                  key={i}
                  src={item.mainImage}
                  alt={item.name}
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                />
              ))}
            </div>
            <button
              onClick={() => setIsCompareOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
            >
              So sánh ngay
            </button>
            <button
              onClick={clearCompare}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              title="Xóa tất cả"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Comparison Detail Modal */}
      {isCompareOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCompareOpen(false)}
            />
            <div className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Bảng so sánh sản phẩm</h3>
                    <p className="text-xs opacity-90">So sánh giá, đánh giá và thông số sản phẩm</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={clearCompare}
                    className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    Xóa tất cả
                  </button>
                  <button
                    onClick={() => setIsCompareOpen(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-4 gap-4 min-w-[700px]">
                  {/* Column 0: Criteria labels */}
                  <div className="space-y-6 pt-36 border-r border-gray-100 pr-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                    <div className="h-10 flex items-center">Giá bán</div>
                    <div className="h-10 flex items-center">Đánh giá</div>
                    <div className="h-10 flex items-center">Tồn kho / Đã bán</div>
                    <div className="h-14 flex items-center">Màu sắc</div>
                    <div className="h-14 flex items-center">Kích thước</div>
                    <div className="h-16 flex items-center">Thao tác</div>
                  </div>

                  {/* Columns 1..N: Selected Products */}
                  {compareList.map((product) => {
                    const pId = product._id || product.id;
                    const colors = [...new Set(product.variations?.map((v) => v.color) || [])];
                    const sizes = [...new Set(product.variations?.map((v) => v.size) || [])];

                    return (
                      <div key={pId} className="space-y-6 text-center">
                        {/* Product Header */}
                        <div className="relative h-36 flex flex-col items-center">
                          <button
                            onClick={() => removeFromCompare(pId)}
                            className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500 rounded-full bg-gray-100 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <img
                            src={product.mainImage}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-xl shadow-sm border border-gray-100 mb-2"
                          />
                          <Link
                            to={`/product/${pId}`}
                            onClick={() => setIsCompareOpen(false)}
                            className="font-bold text-xs text-gray-900 hover:text-pink-600 line-clamp-2"
                          >
                            {product.name}
                          </Link>
                        </div>

                        {/* Price */}
                        <div className="h-10 flex items-center justify-center font-extrabold text-pink-600 text-sm bg-pink-50/50 rounded-xl">
                          {product.sellingPrice?.toLocaleString('vi-VN')}đ
                        </div>

                        {/* Rating */}
                        <div className="h-10 flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-gray-800">
                            {product.ratingAverage || 5}
                          </span>
                          <span className="text-xxs text-gray-400">({product.reviewCount || 0})</span>
                        </div>

                        {/* Stock & Sold */}
                        <div className="h-10 flex flex-col items-center justify-center text-xs">
                          <span className="text-emerald-600 font-semibold">{product.status || 'Còn hàng'}</span>
                          <span className="text-xxs text-gray-400">Đã bán: {product.soldCount || 0}</span>
                        </div>

                        {/* Colors */}
                        <div className="h-14 flex items-center justify-center flex-wrap gap-1">
                          {colors.length > 0 ? (
                            colors.map((c, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xxs font-medium text-gray-700"
                              >
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>

                        {/* Sizes */}
                        <div className="h-14 flex items-center justify-center flex-wrap gap-1">
                          {sizes.length > 0 ? (
                            sizes.map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-pink-50 border border-pink-200 rounded text-xxs font-bold text-pink-700"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="h-16 flex items-center justify-center">
                          <Link
                            to={`/product/${pId}`}
                            onClick={() => setIsCompareOpen(false)}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" /> Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ProductCompareModal;
