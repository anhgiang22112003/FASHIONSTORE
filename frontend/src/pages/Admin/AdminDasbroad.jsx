import React, { useEffect, useState } from "react"
import apiAdmin from "@/service/apiAdmin"
import OrderStatusChart from "@/components/OrderStatusChart"

const AdminDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const params = {}
      if (from) params.from = from
      if (to) params.to = to

      const res = await apiAdmin.get("/dashboard", { params })
      setData(res.data)
    } catch (err) {
      console.error("Lỗi khi tải dashboard:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const statusColors = {
    COMPLETED: "bg-green-100 text-green-600",
    PENDING: "bg-yellow-100 text-yellow-600",
    PROCESSING: "bg-blue-100 text-blue-600",
  }

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>

  if (!data)
    return (
      <div className="p-8 text-center text-gray-500">
        Không có dữ liệu để hiển thị
      </div>
    )

  const { summary, recentOrders, bestSellingProducts } = data

  return (
    <div className="p-8 space-y-8">
      {/* Bộ lọc ngày */}
      <div  style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label>Từ:</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border text-black rounded-md px-3 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <label>Đến:</label>
          <input
              
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border text-black rounded-md px-3 py-1"
          />
        </div>
        <button
          onClick={fetchDashboard}
          className="bg-pink-600 text-var(--text-color) px-4 py-2 rounded-lg hover:bg-pink-700"
        >
          Lọc
        </button>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className=" p-6 rounded-xl shadow flex justify-between items-center">
          <div>
            <p className="text-sm text-var(--text-color)">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-pink-600">
              {summary.revenue.toLocaleString()}đ
            </p>
            <p className="text-xs text-var(--text-color) mt-1">
              {new Date(summary.from).toLocaleDateString()} -{" "}
              {new Date(summary.to).toLocaleDateString()}
            </p>
          </div>
          <div className="text-3xl">📈</div>
        </div>

        <div className=" p-6 rounded-xl shadow flex justify-between items-center">
          <div>
            <p className="text-sm text-var(--text-color)">Đơn hàng</p>
            <p className="text-2xl font-bold text-pink-600">
              {summary.orders}
            </p>
          </div>
          <div className="text-3xl">🛒</div>
        </div>

        <div className=" p-6 rounded-xl shadow flex justify-between items-center">
          <div>
            <p className="text-sm text-var(--text-color)">Khách hàng</p>
            <p className="text-2xl font-bold text-pink-600">
              {summary.customers}
            </p>
          </div>
          <div className="text-3xl">👤</div>
        </div>

        <div className="p-6 rounded-xl shadow flex justify-between items-center">
          <div>
            <p className="text-sm text-var(--text-color)">Sản phẩm</p>
            <p className="text-2xl font-bold text-pink-600">
              {summary.products}
            </p>
          </div>
          <div className="text-3xl">🏷️</div>
        </div>
      </div>
      <OrderStatusChart statusSummary={data.summary.statusSummary} />


      {/* Orders & Best Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Đơn hàng gần đây */}
        <div className="  p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Đơn hàng gần đây</h2>
          <ul className="space-y-4">
            {recentOrders.map((order, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center p-4 bg-pink-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🛒</span>
                  <div>
                    <p className="font-semibold text-black">
                      {order.user.name || "Khách hàng"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.items?.length || 0} sản phẩm
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-pink-600">
                    {order.total?.toLocaleString()}đ
                  </p>
                  {(() => {
                    const status = order.status
                    const info = {
                      PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
                      PROCESSING: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
                      SHIPPED: { label: "Đã giao hàng", color: "bg-green-100 text-green-700" },
                      COMPLETED: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-700" },
                      CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
                    }[status] || { label: status, color: "bg-gray-100 text-gray-500" }

                    return (
                      <span className={`px-2 py-1 rounded-full text-xs ${info.color}`}>
                        {info.label}
                      </span>
                    )
                  })()}

                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Sản phẩm bán chạy */}
        <div className=" p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm bán chạy</h2>
          <ul className="space-y-4">
            {bestSellingProducts.map((product, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center p-4 bg-pink-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🏷️</span>
                  <div>
                    <p className="font-semibold text-black">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.totalSold} đã bán
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-pink-600">
                  {product.price?.toLocaleString()}đ
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
