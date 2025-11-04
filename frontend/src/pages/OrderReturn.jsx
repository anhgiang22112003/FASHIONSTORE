import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/service/api";
import { toast } from "react-toastify";

const OrderReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

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

      setTimeout(() => navigate("/orders"), 3000);
    };

    fetchResult();
  }, [location.search, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      {status === "loading" && <p>Đang xác thực thanh toán...</p>}
      {status === "success" && <h2 className="text-green-600 text-2xl font-bold">✅ Thanh toán thành công!</h2>}
      {status === "failed" && <h2 className="text-red-600 text-2xl font-bold">❌ Thanh toán thất bại!</h2>}
      <p className="text-gray-600 mt-4">Hệ thống sẽ chuyển bạn về trang đơn hàng...</p>
    </div>
  );
};

export default OrderReturn;
