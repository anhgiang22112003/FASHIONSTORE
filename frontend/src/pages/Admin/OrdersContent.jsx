import React, { useState, useEffect, useMemo, useRef } from "react"
import { EyeIcon, FunnelIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline"
import { toast } from "react-toastify"
import { socket } from "@/service/socket"
import apiAdmin from "@/service/apiAdmin"
import { useDebounce } from "@/hooks/useDebounce"


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

const paymentStatusColors = {
  PENDING: "bg-yellow-100 text-yellow-600",
  APPROVED: "bg-green-100 text-green-600",
  DECLINED: "bg-red-100 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-600",
}

const paymentMethodOptions = {
  COD: "Thanh toán khi nhận hàng",
  BANK: "Chuyển khoản ngân hàng",
  MOMO: "Ví MoMo",
  ZALOPAY: "ZaloPay",
  VNPAY: "VNPay",
  CASH: "Thanh toán tại cửa hàng",
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
  const [editingPaymentId, setEditingPaymentId] = useState(null)

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
  const debouncedMinTotal = useDebounce(filters.minTotal, 500)
  const debouncedMaxTotal = useDebounce(filters.maxTotal, 500)

  const debouncedFilters = useMemo(() => ({
    ...filters,
    minTotal: debouncedMinTotal,
    maxTotal: debouncedMaxTotal
  }), [filters, debouncedMinTotal, debouncedMaxTotal])

  useEffect(() => {
    fetchOrders(page, debouncedFilters)
  }, [page, debouncedFilters])




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

  const fetchOrders = async (pageNum = 1, appliedFilters = filters) => {
    try {
      setLoading(true)
      const res = await apiAdmin.get("/orders/all", {
        params: {
          page: pageNum,
          limit,
          ...appliedFilters
        }
      })
      setOrders(res.data.data || [])
      setTotal(res.data.total || 0)
      setPage(res.data.page || 1)
    } catch (err) {
      console.error(err)
      toast.error("Không thể tải danh sách đơn hàng")
    } finally {
      setLoading(false)
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
    import('@/data/provinces.json').then((data) => setProvinces(data.default))
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
  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(true)
      const res = await apiAdmin.patch(`/orders/${orderId}/payment-status`, { status: newStatus })
      toast.success('Cập nhật trạng thái thanh toán thành công!')
      fetchOrders()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái thanh toán')
    } finally {
      setLoading(false)
      setEditingPaymentId(null)
    }
  }


  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const toggleFilter = () => setIsFilterVisible(!isFilterVisible)


  const clearFilters = () => {
    const emptyFilters = {
      userId: "",
      status: "",
      minDate: "",
      maxDate: "",
      minTotal: "",
      maxTotal: "",
      province: "",
      district: "",
      ward: "",
    }
    setFilters(emptyFilters)
    fetchOrders(1, emptyFilters)
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
    <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="w-full min-h-screen font-sans antialiased">
      <main className="w-full p-3 sm:p-5">

        {/* TIÊU ĐỀ & NÚT HÀNH ĐỘNG */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Danh sách Đơn hàng</h1>
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
            <div className="flex items-center justify-between border border-pink-200 rounded-xl px-4 py-3 mb-4">
              <span className="text-pink-700 font-medium">
                Đã chọn {selectedOrders.length} đơn hàng
              </span>
              <div className="flex items-center space-x-3">
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="border text-black border-pink-400 rounded-lg p-1 text-sm bg-white"
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
          <div className=" rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold  mb-4 border-b pb-2">Bộ lọc nâng cao</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">

              <div className="lg:col-span-3">
                <label className="block text-sm font-medium  mb-1">Khách hàng</label>
                <select
                  name="userId"
                  value={filters.userId}
                  onChange={handleFilterChange}
                  className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
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
                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border text-black  border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">-- Tất cả --</option>
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium  mb-1">Khoảng tiền</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="minTotal"
                    placeholder="Từ (₫)"
                    value={filters.minTotal ? new Intl.NumberFormat('vi-VN').format(filters.minTotal) : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d]/g, '')
                      handleFilterChange({ target: { name: 'minTotal', value: raw ? Number(raw) : '' } })
                    }}
                    className="w-1/2 px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    name="maxTotal"
                    placeholder="Đến (₫)"
                    value={filters.maxTotal ? new Intl.NumberFormat('vi-VN').format(filters.maxTotal) : ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d]/g, '')
                      handleFilterChange({ target: { name: 'maxTotal', value: raw ? Number(raw) : '' } })
                    }}
                    className="w-1/2 px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>

              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium  mb-1">Tỉnh / Thành phố</label>
                <select
                  name="province"
                  value={filters.province}
                  onChange={handleProvinceChange}
                  className="w-full text-black  px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">-- Chọn Tỉnh / Thành phố --</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-1">Quận / Huyện</label>
                <select
                  name="district"
                  value={filters.district}
                  onChange={handleDistrictChange}
                  disabled={!filters.province}
                  className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">-- Chọn Quận / Huyện --</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-1">Phường / Xã</label>
                <select
                  name="ward"
                  value={filters.ward}
                  onChange={handleWardChange}
                  disabled={!filters.district}
                  className="w-full text-black  px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 disabled:text-gray-500"
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
            </div>
          </div>
        )}

        {/* TABLE WITH HORIZONTAL SCROLL & STICKY HEADER */}
        <div className="rounded-xl shadow-lg">
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-pink-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap ">
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
                <tbody className="divide-y divide-gray-100 ">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order?._id} className="hover:bg-pink-50 hover:text-black">
                        <td className="px-4 py-4 text-center whitespace-nowrap ">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order?._id)}
                            onChange={() => handleSelectOrder(order?._id)}
                          />
                        </td>

                        <td className="px-6 py-4 font-bold  text-sm whitespace-nowrap">#{order._id.slice(-6).toUpperCase()}</td>

                        <td className="px-6 py-4 whitespace-nowrap ">
                          <p className="font-semibold ">{order.user?.name || order.shippingInfo?.name || 'Khách mua tại cửa hàng'}</p>
                          <p className=" text-xs">{order.user?.email || order.shippingInfo?.phone || ''}</p>
                        </td>

                        <td className="px-6 py-4 text-sm  whitespace-nowrap">
                          <p>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString("vi-VN")}</p>
                        </td>

                        <td className="px-6 py-4 text-sm  max-w-xs ">
                          <p className="line-clamp-2" title={order.address}>
                            {order.orderType =="POS" ?"Khách mua tại cửa hàng ": order.address || order.shippingInfo?.address || 'Chưa có địa chỉ'}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-pink-600 font-bold text-lg whitespace-nowrap ">
                          {order?.total?.toLocaleString("vi-VN")}₫
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap ">
                          {editingId === order._id ? (
                            <select
                              className="border border-pink-400 text-black rounded-lg p-1 text-sm  shadow-sm"
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

                        <td className="px-6 py-4 text-sm  whitespace-nowrap ">
                          {paymentMethodOptions[order?.paymentMethod] || order?.paymentMethod || 'Chưa chọn'}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingPaymentId === order._id ? (
                            <select
                              className="border border-pink-400 text-black rounded-lg p-1 text-sm shadow-sm"
                              defaultValue={order.paymentStatus}
                              onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                              onBlur={() => setEditingPaymentId(null)}
                              autoFocus
                              disabled={loading}
                            >
                              {Object.entries(paymentStatusOptions).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors shadow-sm whitespace-nowrap ${paymentStatusColors[order.paymentStatus]}`}
                              onClick={() => setEditingPaymentId(order._id)}
                            >
                              {paymentStatusOptions[order.paymentStatus] || 'Chưa thanh toán'}
                            </span>
                          )}
                        </td>


                        <td className="px-6 py-4 whitespace-nowrap sticky right-0  shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
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
              className="px-3 py-1 border rounded-lg  hover:bg-gray-200 disabled:opacity-50"
            >
              ← Trước
            </button>

            {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded-lg font-semibold ${page === i + 1
                  ? "bg-pink-600 text-black "
                  : "bg-white text-black hover:bg-gray-100"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="px-3 py-1 border rounded-lg  hover:bg-gray-200 disabled:opacity-50"
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