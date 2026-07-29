import React, { useEffect, useState } from "react"
import apiAdmin from "@/service/apiAdmin"
import OrderStatusChart from "@/components/OrderStatusChart"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {
  ArrowTrendingUpIcon,
  ShoppingCartIcon,
  UserIcon,
  TagIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import AdminSpinner from "@/components/AdminSpinner"
import { PageHeader, StatusBadge } from "@/components/admin/ui"

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

  if (loading) return <AdminSpinner message="Đang tải dữ liệu..." />

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500">
        Không có dữ liệu để hiển thị
      </div>
    )
  }

  const { summary, recentOrders, bestSellingProducts } = data

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-700">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Tổng quan hoạt động kinh doanh và hiệu suất bán hàng của bạn."
      >
        {/* Date Filter Panel */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-400 px-2 uppercase">Từ:</span>
            <DatePicker
              selected={from}
              onChange={(date) => setFrom(date)}
              className="w-36 text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              dateFormat="dd/MM/yyyy"
              showTimeSelect
              timeFormat="HH:mm"
              placeholderText="Chọn ngày"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-400 px-2 uppercase">Đến:</span>
            <DatePicker
              selected={to}
              onChange={(date) => setTo(date)}
              className="w-36 text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              dateFormat="dd/MM/yyyy"
              showTimeSelect
              timeFormat="HH:mm"
              placeholderText="Chọn ngày"
            />
          </div>
          <button
            onClick={fetchDashboard}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors active:scale-95 shadow-sm"
          >
            Lọc
          </button>
        </div>
      </PageHeader>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng doanh thu</p>
            <p className="text-xl font-bold text-slate-800 truncate mt-1">
              {summary.revenue.toLocaleString()}đ
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-1 truncate">
              {new Date(summary.from).toLocaleDateString()} - {new Date(summary.to).toLocaleDateString()}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 flex-shrink-0">
            <ArrowTrendingUpIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đơn hàng</p>
            <p className="text-xl font-bold text-slate-800 truncate mt-1">
              {summary.orders}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-1">Hóa đơn hoàn tất & chờ xử lý</p>
          </div>
          <div className="p-3 bg-pink-50 rounded-xl text-pink-600 flex-shrink-0">
            <ShoppingCartIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Khách hàng</p>
            <p className="text-xl font-bold text-slate-800 truncate mt-1">
              {summary.customers}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-1">Thành viên đăng ký mới</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 flex-shrink-0">
            <UserIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sản phẩm</p>
            <p className="text-xl font-bold text-slate-800 truncate mt-1">
              {summary.products}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 mt-1">Sản phẩm đang được bày bán</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600 flex-shrink-0">
            <TagIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Chart Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Biểu đồ trạng thái đơn hàng</h3>
        <OrderStatusChart statusSummary={data.summary.statusSummary} />
      </div>

      {/* Detailed Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Đơn hàng gần đây</h3>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
            {recentOrders.map((order, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
                    <ShoppingCartIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{order?.user?.name || "Khách hàng"}</p>
                    <p className="text-xs text-slate-400">{order?.items?.length || 0} sản phẩm</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-pink-600">{order.total?.toLocaleString()}đ</p>
                  <div className="mt-0.5">
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Sản phẩm bán chạy</h3>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
            {bestSellingProducts.map((product, idx) => (
              <div key={idx} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <TagIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 truncate max-w-xs">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.totalSold} đã bán</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-800">{product.price?.toLocaleString()}đ</p>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 animate-pulse" />
            Sản phẩm sắp hết hàng
          </h3>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="py-8 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center">
                <p className="text-xs font-semibold text-emerald-600">Mọi thứ đều ổn! Không có sản phẩm nào sắp hết hàng 🎉</p>
              </div>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product._id} className="py-3 flex gap-3 first:pt-0 last:pb-0">
                  {product.mainImage && (
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{product.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tồn kho: <span className="font-bold text-red-600">{product.stock}</span>
                    </p>
                    {product.lowStockVariations?.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {product.lowStockVariations.map((v, i) => (
                          <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-100">
                            {v.color} - {v.size}: {v.stock}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-slate-500" />
            Khách hàng hoạt động gần đây
          </h3>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
            {recentCustomers.map((c, i) => (
              <div key={i} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-bold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Đơn hàng: <span className="text-pink-600 font-bold">{c.orderCount}</span> • Chi tiêu:{" "}
                    <span className="text-emerald-600 font-bold">{c.totalSpent.toLocaleString()}đ</span>
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(c.updatedAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing Campaigns / Events */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-slate-500" />
            Chiến dịch Marketing / Flash Sales
          </h3>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
            {events.map((e, i) => (
              <div key={i} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                <span className="text-sm font-bold text-slate-800">{e.title}</span>
                <span className="text-xs">
                  <StatusBadge status={e.status === 'Đang diễn ra' ? 'ACTIVE' : e.status === 'Sắp diễn ra' ? 'UPCOMING' : 'ENDED'} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Stock Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ArchiveBoxIcon className="w-5 h-5 text-slate-500" />
            Sản phẩm tồn kho nhiều nhất
          </h3>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
            {topStockProducts.map((p, i) => (
              <div key={i} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                <span className="text-sm font-bold text-slate-800 truncate max-w-xs">{p._id}</span>
                <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">{p.totalStock} đơn vị</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
