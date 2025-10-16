import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/service/api";
import { toast } from "react-toastify";
const Checkout = () => {
    const navigate = useNavigate();
  const location = useLocation();
  const cart = location?.state?.cart; // ✅ Lấy dữ liệu giỏ hàng được truyền qua
  console.log(cart);
  
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    paymentMethod: "COD",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOrder = async () => {
    if (!form.address) {
      toast.warning("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    try {
      const res = await api.post("/orders", {
        address: form.address,
        paymentMethod: form.paymentMethod,
      });

      toast.success("Đặt hàng thành công 🎉");
      navigate("/orders/" + res.data._id);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Đặt hàng thất bại");
    }
  };

  if (!cart) {
    return <p className="text-center text-gray-600 mt-10">Không có sản phẩm trong giỏ hàng</p>;
  }
  return (
    <div className="min-h-screen w-full bg-gray-100 p-8 font-sans flex items-center justify-center">
      <div className="w-full max-w-[1500px] bg-white rounded-none lg:rounded-lg shadow-xl p-6 lg:p-12 flex flex-col lg:flex-row gap-8 min-h-screen">

        {/* Bên trái: Thông tin giao hàng */}
        <div className="flex-1 space-y-8 overflow-auto">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Thông tin giao hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên</label>
                <input type="text" placeholder="Nhập họ và tên" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                <input type="tel" placeholder="Nhập số điện thoại" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" placeholder="Nhập địa chỉ email" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ</label>
              <input type="text" placeholder="Nhập địa chỉ giao hàng" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tỉnh/Thành phố</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300">
                  <option>Chọn tỉnh/thành</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quận/Huyện</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300">
                  <option>Chọn quận/huyện</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phường/Xã</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300">
                  <option>Chọn phường/xã</option>
                </select>
              </div>
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Phương thức thanh toán</h2>
            <div className="space-y-4">
              <div className="relative flex items-center p-4 border border-pink-500 rounded-lg cursor-pointer">
                <input type="radio" name="payment_method" id="cod" defaultChecked className="w-5 h-5 appearance-none border border-gray-400 rounded-full cursor-pointer checked:border-pink-500 checked:bg-white" />
                <label htmlFor="cod" className="ml-3 font-bold text-gray-800 cursor-pointer">Thanh toán khi nhận hàng (COD)</label>
              </div>
              <div className="relative flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer">
                <input type="radio" name="payment_method" id="bank" className="w-5 h-5 appearance-none border border-gray-400 rounded-full cursor-pointer checked:border-pink-500 checked:bg-white" />
                <label htmlFor="bank" className="ml-3 text-gray-600 cursor-pointer">Chuyển khoản ngân hàng</label>
              </div>
              <div className="relative flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer">
                <input type="radio" name="payment_method" id="momo" className="w-5 h-5 appearance-none border border-gray-400 rounded-full cursor-pointer checked:border-pink-500 checked:bg-white" />
                <label htmlFor="momo" className="ml-3 text-gray-600 cursor-pointer">Ví điện tử MoMo</label>
              </div>
            </div>
          </div>
        </div>

        {/* Bên phải: Đơn hàng */}
        <div className="flex-1 bg-pink-50 rounded-none lg:rounded-lg p-6 lg:p-8 space-y-6 overflow-auto">
          <h2 className="text-2xl font-bold text-gray-800">Đơn hàng của bạn</h2>

          <div className="space-y-4">
            {/* SP 1 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-blue-200 flex items-center justify-center text-sm text-gray-500"></div>
                <div>
                  <p className="font-semibold text-gray-800">Váy hồng thanh lịch</p>
                  <p className="text-sm text-gray-500">Size: M, Màu: Hồng nhạt</p>
                  <p className="text-pink-600 font-semibold mt-1">590.000₫</p>
                </div>
              </div>
              <p className="text-gray-600">x1</p>
            </div>

            {/* SP 2 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-200 flex items-center justify-center text-sm text-gray-500"></div>
                <div>
                  <p className="font-semibold text-gray-800">Áo sơ mi trắng basic</p>
                  <p className="text-sm text-gray-500">Size: S, Màu: Trắng</p>
                  <p className="text-pink-600 font-semibold mt-1">450.000₫</p>
                </div>
              </div>
              <p className="text-gray-600">x2</p>
            </div>

            {/* SP 3 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-red-200 flex items-center justify-center text-sm text-gray-500"></div>
                <div>
                  <p className="font-semibold text-gray-800">Áo cardigan hồng</p>
                  <p className="text-sm text-gray-500">Size: L, Màu: Hồng</p>
                  <p className="text-pink-600 font-semibold mt-1">720.000₫</p>
                </div>
              </div>
              <p className="text-gray-600">x1</p>
            </div>
          </div>

          {/* Tổng tiền */}
          <div className="space-y-4 pt-6 border-t border-gray-300">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Tạm tính:</p>
              <p className="font-medium text-gray-800">2.210.000₫</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Phí vận chuyển:</p>
              <p className="font-medium text-gray-800">30.000₫</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Giảm giá:</p>
              <p className="font-medium text-pink-600">-100.000₫</p>
            </div>
            <div className="flex justify-between items-center text-xl font-bold pt-4 border-t-2 border-dashed border-gray-300">
              <p className="text-gray-800">Tổng cộng:</p>
              <p className="text-pink-600">2.140.000₫</p>
            </div>
          </div>

          <button className="w-full py-4 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors duration-300">
            Hoàn tất đặt đơn hàng
          </button>
        </div>

      </div>
    </div>
  )
}

export default Checkout
