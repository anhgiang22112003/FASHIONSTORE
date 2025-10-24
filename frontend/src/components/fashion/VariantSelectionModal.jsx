import React, { useState, useMemo, useCallback, useEffect, useContext } from 'react';
import { ShoppingBag, X, Minus, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'react-toastify'
import { CartContext } from '@/context/CartContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'



const VariantSelectionModal = ({ product, isOpen, onClose,onSuccessAndOpenCart}) => {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext)

  // 1. Lấy danh sách Màu và Size duy nhất
  const availableColors = useMemo(() => {
    const colors = new Set(product?.variations?.map(v => v.color));
    return Array.from(colors);
  }, [product]);

  const availableSizes = useMemo(() => {
    // Chỉ lấy size của màu đã chọn
    const filteredVariations = product?.variations?.filter(v => v.color === selectedColor);
    const sizes = new Set(filteredVariations?.map(v => v.size));
    return Array.from(sizes);
  }, [product, selectedColor]);

  // 2. Tìm tồn kho hiện tại và Biến thể đã chọn
  const currentVariant = useMemo(() => {
    return product?.variations?.find(v => v.color === selectedColor && v.size === selectedSize);
  }, [product, selectedColor, selectedSize]);

  const currentStock = currentVariant?.stock || 0;
  const isOutOfStock = currentStock <= 0;

  // 3. Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = useCallback(async () => {
    if (!selectedColor || !selectedSize) {
      toast.warning('Vui lòng chọn Màu và Kích thước');
      return;
    }

    if (quantity > currentStock) {
      toast.warning(`Không đủ hàng, chỉ còn ${currentStock} sản phẩm.`);
      return;
    }
    
    if (!product?._id) {
      toast.error('Không tìm thấy sản phẩm');
      return;
    }

    try {
      const body = {
        productId: product._id,
        quantity,
        color: selectedColor,
        size: selectedSize,
      };
      // Gọi hàm API được truyền từ bên ngoài
      await addToCart(body); 
      onSuccessAndOpenCart(); 
      onClose(); 
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Thêm vào giỏ hàng thất bại');
    }
  }, [product, quantity, selectedColor, selectedSize, currentStock, addToCart, onClose, onSuccessAndOpenCart, isOutOfStock]);

  useEffect(() => {
    if (selectedColor && !availableSizes.includes(selectedSize)) {
      setSelectedSize('');
    }
  }, [selectedColor, availableSizes, selectedSize]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 rounded-xl">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-xl font-bold text-gray-800">
            Chọn Biến Thể Sản Phẩm
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 space-y-5">
          
          <div className="flex items-start space-x-4">
            <img 
              src={product?.mainImage} 
              alt={product?.name} 
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border" 
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {product?.name}
              </h3>
              <p className="text-2xl font-bold text-pink-600 mt-1">
                {product?.sellingPrice?.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-base font-medium text-gray-700">
              Màu sắc: 
              <span className="font-bold text-gray-900 ml-1">
                {selectedColor || 'Vui lòng chọn'}
              </span>
            </p>
            <div className="flex flex-wrap gap-3">
              {availableColors.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setQuantity(1); 
                  }}
                  className={`px-4 py-2 text-sm rounded-full border transition-all duration-200 
                    ${selectedColor === color 
                      ? 'bg-pink-600 text-white border-pink-600 shadow-md font-semibold' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
                    }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {selectedColor && (
            <div className="space-y-2">
              <p className="text-base font-medium text-gray-700">
                Kích thước: 
                <span className="font-bold text-gray-900 ml-1">
                  {selectedSize || 'Vui lòng chọn'}
                </span>
              </p>
              <div className="flex flex-wrap gap-3">
                {availableSizes.map(size => {
                  const variant = product?.variations?.find(v => v.color === selectedColor && v.size === size);
                  const stock = variant?.stock || 0;
                  const isDisabled = stock <= 0;

                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedSize(size);
                          setQuantity(1); 
                        }
                      }}
                      disabled={isDisabled}
                      className={`px-4 py-2 text-sm rounded-full border transition-all duration-200 
                        ${selectedSize === size
                          ? 'bg-pink-600 text-white border-pink-600 shadow-md font-semibold'
                          : isDisabled
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
                        }`}
                      title={isDisabled ? 'Hết hàng' : `Còn: ${stock}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. Chọn Số lượng và Tồn kho */}
          {(selectedColor && selectedSize) && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-gray-500">
                Tồn kho: 
                <span className={`font-semibold ml-1 ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                  {isOutOfStock ? 'Hết hàng' : `${currentStock} sản phẩm`}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-full border-gray-300"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-bold text-gray-800">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setQuantity(prev => Math.min(currentStock, prev + 1))}
                  disabled={quantity >= currentStock || isOutOfStock}
                  className="w-8 h-8 rounded-full border-gray-300"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Nút Thêm vào Giỏ Hàng */}
        <div className="p-4 border-t">
          <Button 
            onClick={handleAddToCart}
            disabled={!selectedColor || !selectedSize || isOutOfStock || quantity < 1}
            className="w-full bg-pink-600 hover:bg-pink-700 text-lg py-6 font-bold shadow-lg disabled:bg-gray-400"
          >
            <ShoppingBag className="w-5 h-5 mr-3" />
            {isOutOfStock ? 'Hết Hàng' : 'Thêm Vào Giỏ Hàng'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VariantSelectionModal;