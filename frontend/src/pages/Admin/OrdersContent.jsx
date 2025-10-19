import React, { useState, useEffect, useMemo } from "react"
import { EyeIcon, PencilIcon, FunnelIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import api from "@/service/api"
import { toast } from "react-toastify"

const statusOptions = [
  { value: "PENDING", label: "Đang chờ xử lý" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPED", label: "Đang giao hàng" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
]

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-600",
  PROCESSING: "bg-blue-100 text-blue-600",
  SHIPPED: "bg-purple-100 text-purple-600",
  COMPLETED: "bg-green-100 text-green-600",
  CANCELLED: "bg-red-100 text-red-600",
}

const OrdersContent = ({ data,onEditOrder }) => {
  const [orders, setOrders] = useState([])
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    customerName: "",
    status: "Tất cả",
    minDate: "",
    maxDate: "",
  })

   useEffect(() => {
    fetchOrders()
  }, [data])

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/all")
      setOrders(res.data || [])
    } catch (err) {
      toast.error("Không thể tải danh sách đơn hàng")
    }
  }
  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoading(true)
      await api.patch(`/orders/${id}/status`, { status: newStatus })
      toast.success("Cập nhật trạng thái thành công ✅")
       fetchOrders() // reload lại list
      setEditingId(null)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const toggleFilter = () => setIsFilterVisible(!isFilterVisible)

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customerMatch =
        filters.customerName === "" ||
        order.user?.name?.toLowerCase().includes(filters.customerName.toLowerCase())

      const statusMatch =
        filters.status === "Tất cả" || order.status === filters.status

      const orderDate = new Date(order.createdAt)
      const minDate = filters.minDate ? new Date(filters.minDate) : null
      const maxDate = filters.maxDate ? new Date(filters.maxDate) : null
      const dateMatch =
        (!minDate || orderDate >= minDate) && (!maxDate || orderDate <= maxDate)

      return customerMatch && statusMatch && dateMatch
    })
  }, [orders, filters])

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans antialiased">
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Danh sách Đơn hàng</h1>
          <div className="flex space-x-2">
            <button
              onClick={toggleFilter}
              className="flex items-center space-x-1 bg-pink-50 text-pink-600 px-4 py-2 rounded-xl font-semibold hover:bg-pink-100 transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Bộ lọc</span>
            </button>
            <button className="flex items-center space-x-1 bg-pink-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-pink-700 transition-colors">
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Xuất báo cáo</span>
            </button>
          </div>
        </div>

        {/* Bộ lọc */}
        {isFilterVisible && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                <input
                  type="text"
                  name="customerName"
                  value={filters.customerName}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500"
                >
                  <option>Tất cả</option>
                  <option value="PENDING">Đang xử lý</option>
                  <option value="SHIPPING">Đang giao</option>
                  <option value="DELIVERED">Hoàn thành</option>
                  <option value="CANCELED">Đã hủy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng ngày</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    name="minDate"
                    value={filters.minDate}
                    onChange={handleFilterChange}
                    className="w-1/2 px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500"
                  />
                  <input
                    type="date"
                    name="maxDate"
                    value={filters.maxDate}
                    onChange={handleFilterChange}
                    className="w-1/2 px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bảng đơn hàng */}
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-pink-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Mã đơn</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Khách hàng</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Ngày đặt</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-pink-50">
                    <td className="px-6 py-4 font-semibold text-pink-600">{order._id.slice(-6)}</td>
                    <td className="px-6 py-4">
                      <p>{order.user?.name}</p>
                      <p className="text-gray-400 text-sm">{order.user?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {order.total.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-6 py-4">
                      {editingId === order._id ? (
                        <select
                          className="border border-pink-400 rounded-lg p-1 text-sm"
                          defaultValue={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={loading}
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold cursor-pointer ${statusColors[order.status]}`}
                          onClick={() => setEditingId(order._id)}
                        >
                          {statusOptions.find(s => s.value === order.status)?.label || order.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        onClick={() =>onEditOrder(order?._id)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      > 

                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Không có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default OrdersContent
