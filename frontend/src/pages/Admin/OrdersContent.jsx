import React, { useState, useEffect, useMemo, useRef } from "react"
import { EyeIcon, FunnelIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline"
import api from "@/service/api"
import { toast } from "react-toastify"
import { socket } from "@/service/socket"


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

const OrdersContent = ({ data, onEditOrder }) => {
  const [orders, setOrders] = useState([])
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const [filters, setFilters] = useState({
    userId: "",
    status: "",
    minDate: "",
    maxDate: "",
    minTotal: "",
    maxTotal: "",
    province: "",
    district: "",
    ward: "",
  })

  const [customers, setCustomers] = useState([])
  const [customerPage, setCustomerPage] = useState(1)
  const [hasMoreCustomers, setHasMoreCustomers] = useState(true)
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const customerListRef = useRef(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10
  // 🔥 Lấy đơn hàng
  useEffect(() => {
    fetchOrders(page)
  }, [data, page])

  useEffect(() => {
    socket.on("newOrder", (newOrder) => {
      toast.info(`🆕 Có đơn hàng mới từ ${newOrder.user?.name || "khách hàng"}`)
      fetchOrders(page)
    })
    return () => socket.off("newOrder")
  }, [])
  const handleExportExcel = async () => {
    try {
      setLoading(true)
      const res = await api.get("/excel/export", {
        responseType: "blob",
      })
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `orders_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast.success("Xuất file Excel thành công 🎉")
    } catch (err) {
      console.error(err)
      toast.error("Không thể xuất Excel")
    } finally {
      setLoading(false)
    }
  }
  const handleOpenImport = () => setShowImportModal(true)

  const handleImportExcel = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      setLoading(true)
      const res = await api.post("/excel/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const data = res.data
      if (data.errors && data.errors.length > 0) {
        toast.warning(`${data.message} ⚠️`)
        data.errors.forEach(err => toast.error(err))
      } else {
        toast.success(data.message || "Import Excel thành công 🎉")
      }

      fetchOrders()
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || "Lỗi khi import Excel")
    } finally {
      setLoading(false)
      e.target.value = ""
    }
  }

  const fetchOrders = async (pageNum = 1) => {
    try {
      const res = await api.get(`/orders/all?page=${pageNum}&limit=${limit}`)
      console.log(res)

      setOrders(res?.data.data || [])
      setTotal(res.data.total || 0)
      setPage(res.data.page || 1)
    } catch {
      toast.error("Không thể tải danh sách đơn hàng")
    }
  }

  const fetchCustomers = async (page = 1) => {
    try {
      const res = await api.get(`/users?role=customer&page=${page}&limit=10`)
      const newCustomers = res.data.data || []
      if (newCustomers.length === 0) setHasMoreCustomers(false)
      setCustomers(prev => page === 1 ? newCustomers : [...prev, ...newCustomers])
    } catch {
      toast.error("Không thể tải danh sách khách hàng")
    }
  }

  useEffect(() => { fetchCustomers() }, [])
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch('https://provinces.open-api.vn/api/?depth=3')
        const data = await res.json()
        setProvinces(data)
      } catch (error) {
        console.error('Lỗi tải tỉnh/thành:', error)
        toast.error('Không tải được danh sách tỉnh/thành!')
      }
    }
    fetchProvinces()
  }, [])

  // 🔹 Khi chọn Tỉnh → cập nhật Huyện
  const handleProvinceChange = (e) => {
    const selectedProvinceName = e.target.value
    setFilters(prev => ({ ...prev, province: selectedProvinceName, district: '', ward: '' }))

    const selectedProvince = provinces.find(p => p.name === selectedProvinceName)
    setDistricts(selectedProvince ? selectedProvince.districts : [])
    setWards([])
  }

  // 🔹 Khi chọn Huyện → cập nhật Xã
  const handleDistrictChange = (e) => {
    const selectedDistrictName = e.target.value
    setFilters(prev => ({ ...prev, district: selectedDistrictName, ward: '' }))

    const selectedProvince = provinces.find(p => p.name === filters.province)
    if (selectedProvince) {
      const selectedDistrict = selectedProvince.districts.find(d => d.name === selectedDistrictName)
      setWards(selectedDistrict ? selectedDistrict.wards : [])
    }
  }

  // 🔹 Khi chọn Xã
  const handleWardChange = (e) => {
    setFilters(prev => ({ ...prev, ward: e.target.value }))
  }

  // 👇 Lazy load khách hàng
  const handleCustomerScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight
    if (bottom && hasMoreCustomers) {
      const nextPage = customerPage + 1
      setCustomerPage(nextPage)
      fetchCustomers(nextPage)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoading(true)
      await api.patch(`/orders/${id}/status`, { status: newStatus })
      toast.success("Cập nhật trạng thái thành công ✅")
      fetchOrders()
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
  console.log(filters)

  const applyFilter = async () => {
    try {
      const res = await api.get("/orders/filter", { params: filters })
      setOrders(res.data)
      toast.success("Lọc thành công ✅")
    } catch {
      toast.error("Không thể lọc đơn hàng")
    }
  }

  const clearFilters = () => {
    setFilters({
      userId: "",
      status: "",
      minDate: "",
      maxDate: "",
      minTotal: "",
      maxTotal: "",
      city: "",
      district: "",
      ward: "",
      province: ""
    })
    fetchOrders()
  }

  const filteredOrders = useMemo(() => orders, [orders])

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans antialiased">
      <main className="flex-1 p-6">

        {/* TIÊU ĐỀ & NÚT HÀNH ĐỘNG */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Danh sách Đơn hàng</h1>
          <div className="flex space-x-2">
            {/* Nút Bộ lọc */}
            <button
              onClick={toggleFilter}
              className={`flex items-center space-x-1 px-4 py-2 rounded-xl font-semibold transition-colors ${isFilterVisible ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}`}
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Bộ lọc</span>
            </button>
            {/* Nút Xuất báo cáo */}
            <button onClick={handleExportExcel}
              disabled={loading} className="flex items-center space-x-1 bg-pink-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-pink-700 transition-colors">
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Xuất báo cáo</span>
            </button>
            <button
              onClick={handleOpenImport}
              disabled={loading}
              className="flex items-center space-x-1 bg-pink-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-pink-700 transition-colors disabled:opacity-60"
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
              <span>Import Excel</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </div>
        </div>
        {showImportModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-96 p-6 relative">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">📤 Nhập đơn hàng từ Excel</h2>

              <p className="text-sm text-gray-500 mb-3">
                Chọn file Excel đúng định dạng để nhập dữ liệu đơn hàng.
              </p>

              {/* Nút chọn file */}
              <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                onChange={handleImportExcel}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-pink-500"
              />
              <div className="mt-3 text-sm text-gray-600">
                Chưa có file mẫu?{" "}
                <button
                  onClick={async () => {
                    try {
                      const res = await api.get("/excel/export-template", { responseType: "blob" })
                      const blob = new Blob([res.data], {
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = "template_import_orders.xlsx"
                      a.click()
                      window.URL.revokeObjectURL(url)
                    } catch (err) {
                      toast.error("Không thể tải file mẫu ❌")
                    }
                  }}
                  className="text-pink-600 hover:underline font-medium"
                >
                  Click vào đây để tải
                </button>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}


        {/* 🔽 PHẦN BỘ LỌC ĐÃ CẢI TIẾN 🔽 */}
        {isFilterVisible && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Bộ lọc nâng cao</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">

              {/* Khách hàng (Col Span 3) */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-600 mb-1">Khách hàng</label>
                {/* Cần đảm bảo `onScroll` vẫn hoạt động cho lazy load */}
                <select
                  name="userId"
                  value={filters.userId}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  ref={customerListRef}
                  onScroll={handleCustomerScroll}
                >
                  <option value="">-- Tất cả Khách hàng --</option>
                  {customers.map((cus) => (
                    <option key={cus._id} value={cus._id}>
                      {cus.name} ({cus.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Trạng thái (Col Span 1) */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">Trạng thái</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">-- Tất cả --</option>
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Khoảng tiền (Col Span 2) */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Khoảng tiền</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="minTotal"
                    placeholder="Từ (₫)"
                    value={filters.minTotal}
                    onChange={handleFilterChange}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                  <input
                    type="number"
                    name="maxTotal"
                    placeholder="Đến (₫)"
                    value={filters.maxTotal}
                    onChange={handleFilterChange}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* Tỉnh / Thành phố */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Tỉnh / Thành phố</label>
                <select
                  name="province"
                  value={filters.province}
                  onChange={handleProvinceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">-- Chọn Tỉnh / Thành phố --</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Quận / Huyện */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Quận / Huyện</label>
                <select
                  name="district"
                  value={filters.district}
                  onChange={handleDistrictChange}
                  disabled={!filters.province}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">-- Chọn Quận / Huyện --</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Phường / Xã */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Phường / Xã</label>
                <select
                  name="ward"
                  value={filters.ward}
                  onChange={handleWardChange}
                  disabled={!filters.district}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">-- Chọn Phường / Xã --</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nút hành động cho Bộ lọc */}
            <div className="flex justify-end space-x-3 pt-6 border-t mt-4">
              <button onClick={clearFilters} className="px-4 py-2 rounded-xl text-gray-700 bg-gray-100 font-semibold hover:bg-gray-200 transition-colors">Xóa lọc</button>
              <button onClick={applyFilter} className="px-4 py-2 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-colors">Áp dụng bộ lọc</button>
            </div>
          </div>
        )}

        {/* 🔽 PHẦN BẢNG ĐƠN HÀNG ĐÃ CẢI TIẾN 🔽 */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-pink-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Mã đơn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Ngày đặt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Địa chỉ giao hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-pink-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-pink-600 text-sm">#{order._id.slice(-6).toUpperCase()}</td>

                    {/* Cột Khách hàng */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{order.user?.name || order.shippingInfo?.name || 'Khách vãng lai'}</p>
                      <p className="text-gray-500 text-xs">{order.user?.email || order.shippingInfo?.phone || ''}</p>
                    </td>

                    {/* Cột Ngày đặt (Hiển thị chi tiết ngày giờ) */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <p>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString("vi-VN")}</p>
                    </td>

                    {/* Cột Địa chỉ Giao hàng */}
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      <p className="line-clamp-2" title={order.address}>
                        {order.address || order.shippingInfo?.address || 'Chưa có địa chỉ'}
                      </p>
                    </td>

                    {/* Cột Tổng tiền */}
                    <td className="px-6 py-4 font-bold text-lg text-red-500">
                      {order?.total?.toLocaleString("vi-VN")}₫
                    </td>

                    {/* Cột Trạng thái */}
                    <td className="px-6 py-4">
                      {editingId === order._id ? (
                        <select
                          className="border border-pink-400 rounded-lg p-1 text-sm bg-white shadow-sm"
                          defaultValue={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          onBlur={() => setEditingId(null)}
                          autoFocus
                          disabled={loading}
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors shadow-sm ${statusColors[order.status]}`}
                          onClick={() => setEditingId(order._id)}
                        >
                          {statusOptions.find(s => s.value === order.status)?.label || order.status}
                        </span>
                      )}
                    </td>

                    {/* Cột Thao tác */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onEditOrder(order?._id)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors shadow-sm"
                        title="Xem chi tiết đơn hàng"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500 font-medium">Không tìm thấy đơn hàng nào khớp với bộ lọc.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* 📄 PHÂN TRANG */}
        {total > limit && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              ← Trước
            </button>

            {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded-lg font-semibold ${page === i + 1
                  ? "bg-pink-600 text-white"
                  : "bg-white hover:bg-gray-100"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="px-3 py-1 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Sau →
            </button>
          </div>
        )}

      </main>

    </div>
  )
}

export default OrdersContent
