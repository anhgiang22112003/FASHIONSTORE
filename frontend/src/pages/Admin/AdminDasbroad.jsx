import React, { useEffect, useState } from "react"
import apiAdmin from "@/service/apiAdmin"
import OrderStatusChart from "@/components/OrderStatusChart"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { TagIcon } from '@heroicons/react/24/solid'

const AdminDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [events, setEvents] = useState([])
  const [recentCustomers, setRecentCustomers] = useState([])
  const [topStockProducts, setTopStockProducts] = useState([])

  useEffect(() => {
    apiAdmin.get("/dashboard/recent-customers").then(res => setRecentCustomers(res.data || []))
    apiAdmin.get("/dashboard/top-stock").then(res => setTopStockProducts(res.data || []))
  }, [])
  useEffect(() => {
    apiAdmin.get('/flash-sales/events').then(res => setEvents(res.data || []))
  }, [])
  const fetchLowStockProducts = async () => {
    try {
      const res = await apiAdmin.get("/dashboard/low-stock")
      setLowStockProducts(res.data)
    } catch (err) {
      console.error("Lỗi khi tải sản phẩm sắp hết hàng:", err)
    }
  }

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
    fetchLowStockProducts()
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
    <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="p-8 space-y-8">
      {/* Bộ lọc ngày */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label>Từ:</label>
          <DatePicker
            selected={from}
            onChange={(date) => setFrom(date)}
            className="border text-black rounded-md px-3 py-1"
            dateFormat="dd/MM/yyyy"
            showTimeSelect
            timeFormat="HH:mm"
            placeholderText="Chọn ngày từ"
          />
        </div>

        <div className="flex items-center gap-2">
          <label>Đến:</label>
          <DatePicker
            selected={to}
            onChange={(date) => setTo(date)}
            className="border text-black rounded-md px-3 py-1"
            dateFormat="dd/MM/yyyy"
            showTimeSelect
            timeFormat="HH:mm"
            placeholderText="Chọn ngày đến"
          />
        </div>

        <button
          onClick={fetchDashboard}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
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
        {/* Sản phẩm sắp hết hàng */}
        <div className="p-6 rounded-2xl shadow-xl   transition-all hover:shadow-2xl">
          {/* Header */}
          <h2 className="text-xl font-extrabold mb-5 text-red-700 flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.398 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Sản phẩm sắp hết hàng
          </h2>

          {/* Nội dung */}
          {lowStockProducts.length === 0 ? (
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-gray-600 font-medium">
                Không có sản phẩm nào sắp hết hàng! <span className="text-green-600">🎉 Mọi thứ đều ổn!</span>
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {lowStockProducts.map((product) => (
                <li
                  key={product._id}
                  className="p-4 bg-red-50 rounded-xl border border-red-100 transition-transform duration-300 hover:scale-[1.01] hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    {/* Ảnh sản phẩm */}
                    {product.mainImage && (
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-16 h-16 min-w-[4rem] rounded-xl object-cover border border-red-200 shadow-sm"
                      />
                    )}

                    {/* Thông tin sản phẩm */}
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-base leading-snug">{product.name}</p>

                      {/* Tổng tồn kho */}
                      <p className="text-sm text-gray-600 mt-1">
                        Tổng tồn kho: <span className="font-extrabold text-red-600 text-lg">{product.stock}</span> đơn vị
                      </p>

                      {/* Chi tiết biến thể */}
                      {product.lowStockVariations?.length > 0 && (
                        <div className="mt-2 p-2 border-l-4 border-red-300 bg-white rounded-md">
                          <p className="text-xs font-semibold text-red-600 mb-1">Các biến thể cần bổ sung:</p>
                          <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-gray-700">
                            {product.lowStockVariations.map((v, i) => (
                              <li key={i} className="truncate">
                                <span className="font-semibold text-pink-600">{v.color}</span> - {v.size}:{" "}
                                <span className="font-extrabold text-red-500">{v.stock}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Khách hàng hoạt động gần đây */}
        <div className="p-6 rounded-2xl shadow-xl  transition-all hover:shadow-2xl">
          <h2 className="text-xl font-extrabold mb-5 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M5 10v2a4 4 0 004 4h6a4 4 0 004-4v-2" />
            </svg>
            Khách hàng hoạt động gần đây
          </h2>
          <ul className="space-y-3">
            {recentCustomers.map((c, i) => (
              <li
                key={i}
                className="flex justify-between items-center bg-pink-50 border border-pink-100 rounded-xl p-4 hover:bg-pink-100 transition-transform duration-300 hover:scale-[1.01] hover:shadow-md"
              >
                <div>
                  <p className="font-semibold text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Đơn hàng: <span className="text-pink-600 font-bold">{c.orderCount}</span> •
                    Chi tiêu:{" "}
                    <span className="text-green-600 font-bold">
                      {c.totalSpent.toLocaleString()}đ
                    </span>
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(c.updatedAt).toLocaleDateString("vi-VN")}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {/* Lịch sự kiện / Chiến dịch marketing */}
        <div className="p-6 rounded-2xl shadow-xl  transition-all hover:shadow-2xl">
          <h2 className="text-xl font-extrabold mb-5  flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Lịch sự kiện / Chiến dịch marketing
          </h2>
          <ul className="space-y-3">
            {events.map((e, i) => {
              let statusInfo = {}
              if (e.status === 'Đang diễn ra') {
                statusInfo = { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-500' }
              } else if (e.status === 'Sắp diễn ra') {
                statusInfo = { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-500' }
              } else {
                statusInfo = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-500' }
              }

              return (
                <li
                  key={i}
                  className={`p-4 rounded-xl flex justify-between items-center ${statusInfo.bg} border-l-4 ${statusInfo.border} transition-transform duration-300 hover:scale-[1.01] hover:shadow-md`}
                >
                  <span className="font-medium text-gray-800">{e.title}</span>
                  <span className={`text-sm font-semibold ${statusInfo.text}`}>
                    {e.status}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
        {/* Sản phẩm tồn kho nhiều nhất */}
        <div className="p-6 rounded-2xl shadow-xl  transition-all hover:shadow-2xl">
          <h2 className="text-xl font-extrabold mb-5  flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 12h14M5 16h14M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" />
            </svg>
            Sản phẩm tồn kho nhiều nhất
          </h2>
          <ul className="space-y-3">
            {topStockProducts.map((p, i) => (
              <li
                key={i}
                className="flex justify-between items-center bg-pink-50 border border-blue-100 rounded-xl p-4 hover:bg-pink-100 transition-transform duration-300 hover:scale-[1.01] hover:shadow-md"
              >
                <span className="text-gray-800 font-medium">{p._id}</span>
                <span className="font-extrabold text-blue-600 text-lg">{p.totalStock}</span>
              </li>
            ))}
          </ul>
        </div>


      </div>
    </div>
  )
}

export default AdminDashboard
