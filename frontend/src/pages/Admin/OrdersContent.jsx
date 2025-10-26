import React, { useState, useEffect, useMemo, useRef } from "react"
import { EyeIcon, FunnelIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline"
import { toast } from "react-toastify"
import { socket } from "@/service/socket"
import apiAdmin from "@/service/apiAdmin"


const statusOptions = [
  { value: "PENDING", label: "Đang chờ xử lý" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPED", label: "Đang giao hàng" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
]

const paymentStatusOptions = {
  PENDING: "Chờ thanh toán",
  APPROVED: "Đã thanh toán",
  DECLINED: "Từ chối",
  CANCELLED: "Đã hủy",
}

const paymentMethodOptions = {
  COD: "Thanh toán khi nhận hàng",
  BANK: "Chuyển khoản ngân hàng",
  MOMO: "Ví MoMo",
  ZALOPAY: "ZaloPay",
  VNPAY: "VNPay",
}

const paymentStatusColors = {
  PENDING: "bg-yellow-100 text-yellow-600",
  APPROVED: "bg-green-100 text-green-600",
  DECLINED: "bg-red-100 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-600",
}

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
  const [selectedOrders, setSelectedOrders] = useState([])
  const [bulkStatus, setBulkStatus] = useState("")

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
  const limit = 20
  
  useEffect(() => {
    fetchOrders(page)
  }, [data, page])


  const handleExportExcel = async () => {
    try {
      setLoading(true)
      const res = await apiAdmin.get("/excel/export", {
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
      const res = await apiAdmin.post("/excel/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const data = res.data
      if (data.errors?.length) {
        toast.warning(`${data.message} ⚠️ (${data.errors.length} lỗi)`)
        console.error("Chi tiết lỗi:", data.errors)
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
      const res = await apiAdmin.get(`/orders/all?page=${pageNum}&limit=${limit}`)
      setOrders(res?.data.data || [])
      setTotal(res.data.total || 0)
      setPage(res.data.page || 1)
    } catch {
      toast.error("Không thể tải danh sách đơn hàng")
    }
  }

  const fetchCustomers = async (page = 1) => {
    try {
      const res = await apiAdmin.get(`/users?role=customer&page=${page}&limit=10`)
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

  const handleProvinceChange = (e) => {
    const selectedProvinceName = e.target.value
    setFilters(prev => ({ ...prev, province: selectedProvinceName, district: '', ward: '' }))

    const selectedProvince = provinces.find(p => p.name === selectedProvinceName)
    setDistricts(selectedProvince ? selectedProvince.districts : [])
    setWards([])
  }

  const handleDistrictChange = (e) => {
    const selectedDistrictName = e.target.value
    setFilters(prev => ({ ...prev, district: selectedDistrictName, ward: '' }))

    const selectedProvince = provinces.find(p => p.name === filters.province)
    if (selectedProvince) {
      const selectedDistrict = selectedProvince.districts.find(d => d.name === selectedDistrictName)
      setWards(selectedDistrict ? selectedDistrict.wards : [])
    }
  }

  const handleWardChange = (e) => {
    setFilters(prev => ({ ...prev, ward: e.target.value }))
  }

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
      await apiAdmin.patch(`/orders/${id}/status`, { status: newStatus })
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
  const applyFilter = async () => {
    try {
      const res = await apiAdmin.get("/orders/filter", { params: filters })
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

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map(o => o._id))
    } else {
      setSelectedOrders([])
    }
  }

  const isAllSelected = filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length
  const handleBulkStatusUpdate = async () => {
  if (selectedOrders.length === 0 || !bulkStatus) {
    return toast.warn("Vui lòng chọn đơn và trạng thái!")
  }

  try {
    setLoading(true)
    
    // Giả định apiAdmin.patch trả về data có cấu trúc { message: "...", summary: [...] }
    const response = await apiAdmin.patch("/orders/bulk-status", {
      orderIds: selectedOrders,
      status: bulkStatus
    })
    
    const { message, summary } = response.data

    // 1. Phân loại kết quả
    const successCount = summary.filter(item => item.success).length
    const failedItems = summary.filter(item => !item.success)
    const totalCount = summary.length

    if (successCount > 0) {
      toast.success(`Cập nhật thành công ${successCount}/${totalCount} đơn hàng ✅`)
    } 
    
    if (failedItems.length > 0) {
      toast.error(`CÓ LỖI: ${failedItems.length}/${totalCount} đơn hàng thất bại ❌`)
            failedItems.forEach(item => {
        const errorMessage = item.error || "Lỗi không xác định."
        toast.error(`Đơn #${item.id.substring(0, 6)}: ${errorMessage}`, {
          autoClose: false, 
          closeOnClick: false,
          className: 'toast-error-bulk-update'
        })
      })
    }

    // 4. Reset và làm mới dữ liệu
    setSelectedOrders([])
    setBulkStatus("")
    fetchOrders()

  } catch (err) {
    // Xử lý các lỗi HTTP chung (ví dụ: mất kết nối, lỗi 500 trước khi xử lý logic)
    toast.error(err?.response?.data?.message || "Lỗi hệ thống khi cập nhật hàng loạt ❌")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans antialiased">
      <main className="flex-1 p-6">

        {/* TIÊU ĐỀ & NÚT HÀNH ĐỘNG */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Danh sách Đơn hàng</h1>
            <div className="flex space-x-2">
              <button
                onClick={toggleFilter}
                className={`flex items-center space-x-1 px-4 py-2 rounded-xl font-semibold transition-colors ${isFilterVisible ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}`}
              >
                <FunnelIcon className="w-5 h-5" />
                <span>Bộ lọc</span>
              </button>
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

          {/* BULK ACTIONS */}
          {selectedOrders.length > 0 && (
            <div className="flex items-center justify-between bg-pink-50 border border-pink-200 rounded-xl px-4 py-3 mb-4">
              <span className="text-pink-700 font-medium">
                Đã chọn {selectedOrders.length} đơn hàng
              </span>
              <div className="flex items-center space-x-3">
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="border border-pink-400 rounded-lg p-1 text-sm bg-white"
                >
                  <option value="">-- Chọn trạng thái --</option>
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  onClick={handleBulkStatusUpdate}
                  disabled={!bulkStatus || loading}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-60"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          )}
        </div>

        {showImportModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-96 p-6 relative">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">📤 Nhập đơn hàng từ Excel</h2>

              <p className="text-sm text-gray-500 mb-3">
                Chọn file Excel đúng định dạng để nhập dữ liệu đơn hàng.
              </p>

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
                      const res = await apiAdmin.get("/excel/export-template", { responseType: "blob" })
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


        {isFilterVisible && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Bộ lọc nâng cao</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">

              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-600 mb-1">Khách hàng</label>
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

            <div className="flex justify-end space-x-3 pt-6 border-t mt-4">
              <button onClick={clearFilters} className="px-4 py-2 rounded-xl text-gray-700 bg-gray-100 font-semibold hover:bg-gray-200 transition-colors">Xóa lọc</button>
              <button onClick={applyFilter} className="px-4 py-2 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-colors">Áp dụng bộ lọc</button>
            </div>
          </div>
        )}

        {/* TABLE WITH HORIZONTAL SCROLL & STICKY HEADER */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="overflow-x-auto">
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-pink-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap bg-pink-50">
                      <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap bg-pink-50">Mã đơn</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap bg-pink-50">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap bg-pink-50">Ngày đặt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap bg-pink-50">Địa chỉ giao hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap bg-pink-50">Tổng tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap bg-pink-50">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap bg-pink-50">Hình thức thanh toán</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap bg-pink-50">Trạng thái thanh toán</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-pink-50 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order?._id} className="hover:bg-pink-50/50 transition-colors">
                        <td className="px-4 py-4 text-center whitespace-nowrap bg-white">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order?._id)}
                            onChange={() => handleSelectOrder(order?._id)}
                          />
                        </td>

                        <td className="px-6 py-4 font-bold text-pink-600 text-sm whitespace-nowrap bg-white">#{order._id.slice(-6).toUpperCase()}</td>

                        <td className="px-6 py-4 whitespace-nowrap bg-white">
                          <p className="font-semibold text-gray-800">{order.user?.name || order.shippingInfo?.name || 'Khách vãng lai'}</p>
                          <p className="text-gray-500 text-xs">{order.user?.email || order.shippingInfo?.phone || ''}</p>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap bg-white">
                          <p>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString("vi-VN")}</p>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs bg-white">
                          <p className="line-clamp-2" title={order.address}>
                            {order.address || order.shippingInfo?.address || 'Chưa có địa chỉ'}
                          </p>
                        </td>

                        <td className="px-6 py-4 font-bold text-lg text-red-500 whitespace-nowrap bg-white">
                          {order?.total?.toLocaleString("vi-VN")}₫
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap bg-white">
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
                              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors shadow-sm whitespace-nowrap ${statusColors[order.status]}`}
                              onClick={() => setEditingId(order._id)}
                            >
                              {statusOptions.find(s => s.value === order.status)?.label || order.status}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap bg-white">
                          {paymentMethodOptions[order?.paymentMethod] || order?.paymentMethod || 'Chưa chọn'}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap bg-white">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${paymentStatusColors[order?.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                            {paymentStatusOptions[order?.paymentStatus] || 'Chưa thanh toán'}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-white shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
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
                      <td colSpan="10" className="px-6 py-10 text-center text-gray-500 font-medium">Không tìm thấy đơn hàng nào khớp với bộ lọc.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PHÂN TRANG */}
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