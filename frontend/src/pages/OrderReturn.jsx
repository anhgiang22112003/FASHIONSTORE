import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "@/service/api";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Loader2, ShoppingBag, ArrowRight, RotateCcw } from "lucide-react";

const OrderReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const query = new URLSearchParams(location.search);
        const params = Object.fromEntries(query.entries());
        const res = await api.get("/vnpay/return", { params });

        if (res.data.success) {
          setStatus("success");
          toast.success(res.data.message);
        } else {
          setStatus("failed");
          toast.error(res.data.message);
        }
      } catch (err) {
        setStatus("failed");
        toast.error("Xác thực thanh toán thất bại");
      }
    };

    fetchResult();
  }, [location.search]);

  // Countdown & auto-redirect
  useEffect(() => {
    if (status === "loading") return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/orders");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 py-16">
      <div className="w-full max-w-lg text-center">
        {/* Loading State */}
        {status === "loading" && (
          <div className="animate-fade-in space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-pink-100 animate-ping opacity-30" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-200">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xác thực thanh toán...</h2>
              <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
            </div>
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-pink-400"
                  style={{
                    animation: 'bounce 1.4s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="animate-fade-in space-y-6">
            <div className="relative mx-auto w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-20" />
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200">
                <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Thanh toán thành công!</h2>
              <p className="text-gray-500 text-lg">Đơn hàng của bạn đã được xác nhận và đang xử lý</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold text-sm">
                <ShoppingBag className="w-4 h-4" />
                <span>Cảm ơn bạn đã mua sắm tại PinkFashion!</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-pink-200 hover:shadow-xl hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                Xem đơn hàng <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
            </div>

            <p className="text-xs text-gray-400">
              Tự động chuyển đến trang đơn hàng sau <span className="font-bold text-pink-500">{countdown}s</span>
            </p>
          </div>
        )}

        {/* Failed State */}
        {status === "failed" && (
          <div className="animate-fade-in space-y-6">
            <div className="relative mx-auto w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-20" />
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-xl shadow-red-200">
                <XCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Thanh toán thất bại</h2>
              <p className="text-gray-500 text-lg">Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-red-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-red-600 font-medium">
                Nếu tiền đã bị trừ, hệ thống sẽ tự động hoàn tiền trong 1-3 ngày làm việc.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-pink-200 hover:shadow-xl transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Xem đơn hàng
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Về trang chủ
              </Link>
            </div>

            <p className="text-xs text-gray-400">
              Tự động chuyển đến trang đơn hàng sau <span className="font-bold text-pink-500">{countdown}s</span>
            </p>
          </div>
        )}
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default OrderReturn;
