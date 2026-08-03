import React, { useState, useEffect, useMemo, useRef } from "react"
import { EyeIcon, FunnelIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline"
import { toast } from "react-toastify"
import apiAdmin from "@/service/apiAdmin"
import { useDebounce } from "@/hooks/useDebounce"
import { PageHeader, Toolbar, FilterPanel, DataTable, Pagination, StatusBadge, AdminButton } from "@/components/admin/ui"

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
  COD: "COD",
  BANK: "Chuyển khoản",
  MOMO: "Ví MoMo",
  ZALOPAY: "ZaloPay",
  VNPAY: "VNPay",
  CASH: "Tại cửa hàng",
}

const OrdersContent = ({ onEditOrder }) => {
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
    staffId: "",
    orderType: "",
    isFlashSale: "",
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
  const [staffs, setStaffs] = useState([])
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

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await apiAdmin.get("/users/staff", {
          params: { page: 1, limit: 100 }
        })
        setStaffs(res.data.data || [])
      } catch (err) {
        console.error("Error fetching staff:", err)
      }
    }
    fetchStaff()
  }, [])

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
      fetchOrders(page, debouncedFilters)
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
      toast.error(err?.response?.data?.message || "Không thể tải danh sách đơn hàng")
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
      fetchOrders(page, debouncedFilters)
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
      await apiAdmin.patch(`/orders/${orderId}/payment-status`, { status: newStatus })
      toast.success('Cập nhật trạng thái thanh toán thành công!')
      fetchOrders(page, debouncedFilters)
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

  const clearFilters = () => {
    const emptyFilters = {
      userId: "",
      staffId: "",
      orderType: "",
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

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(orders.map(o => o._id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleBulkStatusUpdate = async () => {
    if (selectedOrders.length === 0 || !bulkStatus) {
      return toast.warn("Vui lòng chọn đơn và trạng thái!")
    }

    try {
      setLoading(true)
      const response = await apiAdmin.patch("/orders/bulk-status", {
        orderIds: selectedOrders,
        status: bulkStatus
      })

      const { summary } = response.data
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
          toast.error(`Đơn #${item.id.substring(0, 6)}: ${errorMessage}`)
        })
      }

      setSelectedOrders([])
      setBulkStatus("")
      fetchOrders(page, debouncedFilters)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi hệ thống khi cập nhật hàng loạt ❌")
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={orders.length > 0 && selectedOrders.length === orders.length}
          onChange={handleSelectAll}
          className="rounded text-pink-600 focus:ring-pink-500"
        />
      ),
      width: "40px",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedOrders.includes(row?._id)}
          onChange={() => handleSelectOrder(row?._id)}
          className="rounded text-pink-600 focus:ring-pink-500"
        />
      )
    },
    {
      header: "Mã đơn",
      render: (row) => <span className="font-bold text-slate-800">#{row._id.slice(-6).toUpperCase()}</span>
    },
    {
      header: "Mã Code",
      render: (row) => <span className="font-semibold text-slate-600">{row.code || 'N/A'}</span>
    },
    {
      header: "Khách hàng",
      render: (row) => (
        <div className="min-w-0">
          <p className="font-semibold text-slate-800">{row.user?.name || row.shippingInfo?.name || 'Khách vãng lai'}</p>
          <p className="text-xs text-slate-400">{row.user?.email || row.shippingInfo?.phone || ''}</p>
        </div>
      )
    },
    {
      header: "Ngày đặt",
      render: (row) => (
        <div className="text-xs text-slate-600">
          <p>{new Date(row.createdAt).toLocaleDateString("vi-VN")}</p>
          <p className="text-slate-400 mt-0.5">{new Date(row.createdAt).toLocaleTimeString("vi-VN")}</p>
        </div>
      )
    },
    {
      header: "Địa chỉ",
      render: (row) => (
        <p className="text-xs text-slate-600 max-w-[200px] truncate" title={row.address}>
          {row.orderType === "POS" ? "Mua tại cửa hàng" : row.address || row.shippingInfo?.address || 'Chưa cấu hình'}
        </p>
      )
    },
    {
      header: "Tổng tiền",
      render: (row) => (
        <span className="font-bold text-pink-600 text-sm">
          {row?.total?.toLocaleString("vi-VN")}₫
        </span>
      )
    },
    {
      header: "Trạng thái",
      render: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          {editingId === row._id ? (
            <select
              className="text-xs bg-white border border-pink-200 text-slate-700 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              defaultValue={row.status}
              onChange={(e) => handleStatusChange(row._id, e.target.value)}
              onBlur={() => setEditingId(null)}
              autoFocus
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <div className="cursor-pointer" onClick={() => setEditingId(row._id)}>
              <StatusBadge status={row.status} />
            </div>
          )}
        </div>
      )
    },
    {
      header: "Thanh toán",
      render: (row) => <span className="text-xs text-slate-500">{paymentMethodOptions[row?.paymentMethod] || row?.paymentMethod || 'COD'}</span>
    },
    {
      header: "Trạng thái TT",
      render: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          {editingPaymentId === row._id ? (
            <select
              className="text-xs bg-white border border-pink-200 text-slate-700 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              defaultValue={row.paymentStatus}
              onChange={(e) => handlePaymentStatusChange(row._id, e.target.value)}
              onBlur={() => setEditingPaymentId(null)}
              autoFocus
            >
              {Object.entries(paymentStatusOptions).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          ) : (
            <div className="cursor-pointer" onClick={() => setEditingPaymentId(row._id)}>
              <StatusBadge status={row.paymentStatus} />
            </div>
          )}
        </div>
      )
    },
    {
      header: "Thao tác",
      sticky: true,
      width: "60px",
      render: (row) => (
        <button
          onClick={() => onEditOrder(row?._id)}
          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors border border-slate-200 shadow-sm"
          title="Xem chi tiết"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
      )
    }
  ]

  const bulkActions = (
    <div className="flex items-center gap-2">
      <select
        value={bulkStatus}
        onChange={(e) => setBulkStatus(e.target.value)}
        className="text-xs bg-white border border-pink-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
      >
        <option value="">-- Trạng thái hàng loạt --</option>
        {statusOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <AdminButton
        variant="primary"
        size="xs"
        onClick={handleBulkStatusUpdate}
        disabled={!bulkStatus}
      >
        Cập nhật
      </AdminButton>
    </div>
  )

  const additionalActions = (
    <>
      <AdminButton
        variant="secondary"
        size="sm"
        onClick={handleExportExcel}
        icon={<ArrowDownTrayIcon className="w-4 h-4" />}
      >
        Xuất báo cáo
      </AdminButton>
      <AdminButton
        variant="secondary"
        size="sm"
        onClick={() => setShowImportModal(true)}
        icon={<ArrowUpTrayIcon className="w-4 h-4" />}
      >
        Import Excel
      </AdminButton>
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx, .xls"
        onChange={handleImportExcel}
        className="hidden"
      />
    </>
  )

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Danh sách Đơn hàng"
        description="Quản lý toàn bộ thông tin đơn hàng, trạng thái xử lý, vận chuyển và thanh toán khách hàng."
        badge={`${total} đơn hàng`}
      />

      <Toolbar
        onFilterToggle={() => setIsFilterVisible(!isFilterVisible)}
        filterActive={isFilterVisible}
        filterCount={Object.values(filters).filter(val => val !== "").length}
        actions={additionalActions}
        bulkActions={bulkActions}
        selectedCount={selectedOrders.length}
      />

      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-96 p-6 border border-slate-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-base font-bold text-slate-800 mb-2">📤 Nhập đơn hàng từ Excel</h2>
            <p className="text-xs text-slate-400 mb-4">
              Vui lòng chọn tệp tin Excel chứa dữ liệu hóa đơn cần nhập.
            </p>

            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => {
                handleImportExcel(e)
                setShowImportModal(false)
              }}
              className="block w-full text-xs text-slate-600 border border-slate-200 rounded-lg cursor-pointer bg-slate-50 focus:outline-none file:border-0 file:bg-pink-600 file:text-white file:px-3 file:py-1.5 file:mr-2 file:text-xs file:font-semibold"
            />
            <div className="mt-4 text-xs text-slate-500">
              Tải file dữ liệu mẫu:{" "}
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
                className="text-pink-600 hover:underline font-bold"
              >
                Nhấp vào đây
              </button>
            </div>
            <div className="flex justify-end mt-6">
              <AdminButton variant="secondary" size="xs" onClick={() => setShowImportModal(false)}>
                Hủy bỏ
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      <FilterPanel isOpen={isFilterVisible} onReset={clearFilters}>
        <div className="lg:col-span-2">
          <FilterPanel.Field label="Khách hàng">
            <select
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
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
          </FilterPanel.Field>
        </div>

        <FilterPanel.Field label="Nhân viên">
          <select name="staffId" value={filters.staffId} onChange={handleFilterChange}>
            <option value="">-- Tất cả nhân viên --</option>
            {staffs.map(staff => (
              <option key={staff._id} value={staff._id}>{staff.name}</option>
            ))}
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Trạng thái">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">-- Tất cả trạng thái --</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Loại đơn hàng">
          <select name="orderType" value={filters.orderType} onChange={handleFilterChange}>
            <option value="">-- Tất cả loại đơn --</option>
            <option value="ONLINE">ONLINE</option>
            <option value="POS">POS</option>
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Flash Sale">
          <select name="isFlashSale" value={filters.isFlashSale} onChange={handleFilterChange}>
            <option value="">-- Tất cả --</option>
            <option value="yes">Đơn Flash Sale</option>
            <option value="no">Đơn thường</option>
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Tỉnh / Thành phố">
          <select name="province" value={filters.province} onChange={handleProvinceChange}>
            <option value="">-- Tất cả tỉnh/TP --</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.name}>{p.name}</option>
            ))}
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Quận / Huyện">
          <select name="district" value={filters.district} onChange={handleDistrictChange} disabled={!filters.province}>
            <option value="">-- Tất cả Quận/Huyện --</option>
            {districts.map((d) => (
              <option key={d.code} value={d.name}>{d.name}</option>
            ))}
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Phường / Xã">
          <select name="ward" value={filters.ward} onChange={handleWardChange} disabled={!filters.district}>
            <option value="">-- Tất cả Phường/Xã --</option>
            {wards.map((w) => (
              <option key={w.code} value={w.name}>{w.name}</option>
            ))}
          </select>
        </FilterPanel.Field>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        keyExtractor={(row) => row._id}
      />

      <Pagination
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />
    </div>
  )
}

export default OrdersContent