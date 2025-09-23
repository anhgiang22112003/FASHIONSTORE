import React, { useState } from 'react';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Classic White Blouse",
      price: 89000,
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHw0fHxmYXNoaW9ufGVufDB8fHx8MTc1ODU3MzUzMXww&ixlib=rb-4.1.0&q=85",
      size: "M",
      color: "Trắng",
      quantity: 2
    },
    {
      id: 2,
      name: "Premium Denim Jacket",
      price: 149000,
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxjbG90aGluZ3xlbnwwfHx8fDE3NTg1NTc0MDh8MA&ixlib=rb-4.1.0&q=85",
      size: "L",
      color: "Xanh đậm",
      quantity: 1
    }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <Button onClick={() => navigate('/')} className="bg-pink-500 hover:bg-pink-600">
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <span className="cursor-pointer hover:text-pink-500" onClick={() => navigate('/')}>
          Trang chủ
        </span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Giỏ hàng</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    <span>Size: {item.size}</span>
                    <span className="mx-2">•</span>
                    <span>Màu: {item.color}</span>
                  </div>
                  <div className="text-lg font-bold text-pink-500">
                    {item.price.toLocaleString('vi-VN')}đ
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[50px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-6">Tổng đơn hàng</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                <span>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>
                  {shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')}đ`}
                </span>
              </div>
              
              {shipping > 0 && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  Mua thêm {(500000 - subtotal).toLocaleString('vi-VN')}đ để được miễn phí vận chuyển
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-pink-500">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
              size="lg"
              onClick={() => navigate('/checkout')}
            >
              Thanh toán
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              variant="outline" 
              className="w-full mt-3"
              onClick={() => navigate('/')}
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;