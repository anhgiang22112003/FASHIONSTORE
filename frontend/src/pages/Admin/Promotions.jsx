import React, { useEffect, useState } from 'react'
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import {
  ExclamationCircleIcon,
} from '@heroicons/react/24/solid'
import EditPromotionModal from '@/components/EditPromotionModal'
import { set } from 'date-fns'
import { toast } from 'react-toastify'
import apiAdmin from '@/service/apiAdmin'



const formatDateTime = (isoString) => {
  const date = new Date(isoString)
  const formattedDate = date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${formattedDate} ${formattedTime}`
}

// Modal chung
const CommonModal = ({ title, isOpen, onClose, children, className = '' }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`bg-white rounded-2xl p-6 mx-auto shadow-xl ${className}`}>
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}


// Modal xác nhận chung
const ConfirmationModal = ({ title, message, isOpen, onClose, onConfirm, confirmText = 'Xác nhận', buttonColor = 'bg-blue-500', buttonHoverColor = 'bg-blue-600' }) => {
  return (
    <CommonModal title={title} isOpen={isOpen} onClose={onClose}>
      <div className="mt-4 flex items-center space-x-3">
        <ExclamationCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
        <p className="text-gray-600">{message}</p>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Hủy bỏ</button>
        <button onClick={onConfirm} className={`px-4 py-2 text-sm font-medium text-white ${buttonColor} rounded-lg hover:${buttonHoverColor} transition-colors`}>{confirmText}</button>
      </div>
    </CommonModal>
  )
}

const PromotionManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tất cả')
  const [selectedPromotion, setSelectedPromotion] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [promotionsData, setPromotionsData] = useState([])
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const [total, setTotal] = useState(0)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false) // State mới cho panel bộ lọc

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'Tất cả',
    type: '',
    autoCondition: '',
    minDiscountValue: '',
    maxDiscountValue: '',
    startDateFrom: '',
    startDateTo: '',
    endDateFrom: '',
    endDateTo: '',
  })
  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(prev => !prev)
  }
  const handleResumeClick = (promotion) => {
    setSelectedPromotion(promotion)
    setIsResumeModalOpen(true)
  }

  const handleAddClick = () => {
    setSelectedPromotion(null)
    setIsAddModalOpen(true)
  }

  const handleEditClick = (promotion) => {
    setSelectedPromotion(promotion)
    setIsEditModalOpen(true)
  }

  const handlePauseClick = (promotion) => {
    setSelectedPromotion(promotion)
    setIsPauseModalOpen(true)
  }

  const handleDeleteClick = (promotion) => {
    setSelectedPromotion(promotion)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmAction = async (action) => {
    if (!selectedPromotion) return

    try {
      if (action === 'pause') {
        // Gọi API tạm dừng
        await apiAdmin.patch(`/vouchers/${selectedPromotion._id}/pause`, { status: 'paused' })
        toast.success('Tạm dừng voucher thành công!')
      }

      if (action === 'resume') {
        // Gọi API kích hoạt lại
        await apiAdmin.patch(`/vouchers/${selectedPromotion._id}/pause`, { status: 'active' })
        toast.success('Kích hoạt lại voucher thành công!')
      }

      if (action === 'delete') {
        // Gọi API xóa
        await apiAdmin.delete(`/vouchers/${selectedPromotion._id}`)
        toast.success('Xóa voucher thành công!')
      }

      // Reload danh sách
      await fetVoucher()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      // Đóng modal
      setSelectedPromotion(null)
      setIsResumeModalOpen(false)
      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
      setIsPauseModalOpen(false)
      setIsDeleteModalOpen(false)
    }
  }
  const checkVoucherExpirationOrUsage = (promo) => {
    const now = new Date()
    const endDate = new Date(promo.endDate)
    const isExpired = now > endDate
    const isMaxUsage =
      promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit
    return isExpired || isMaxUsage
  }

  const fetVoucher = async (filters = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      params.append('page', page)
      params.append('limit', limit)

      if (filters.searchTerm) {
        params.append('name', filters.searchTerm)
        params.append('code', filters.searchTerm)
      }
      if (filters.type) params.append('type', filters.type)

      if (filters.status && filters.status !== 'Tất cả') {
        if (filters.status === 'Đang hoạt động') params.append('status', 'active')
        else if (filters.status === 'Bị tạm dừng') params.append('status', 'paused')
        else if (filters.status === 'Hết hạn') params.append('status', 'expired')
      }
      if (filters.autoCondition) params.append('autoCondition', filters.autoCondition)

      if (filters.minDiscountValue)
        params.append('minDiscountValue', filters.minDiscountValue)
      if (filters.maxDiscountValue)
        params.append('maxDiscountValue', filters.maxDiscountValue)

      if (filters.startDateFrom)
        params.append('startDateFrom', filters.startDateFrom)
      if (filters.startDateTo)
        params.append('startDateTo', filters.startDateTo)

      // Khoảng thời gian kết thúc
      if (filters.endDateFrom)
        params.append('endDateFrom', filters.endDateFrom)
      if (filters.endDateTo)
        params.append('endDateTo', filters.endDateTo)

      const res = await apiAdmin.get(`/vouchers?${params.toString()}`)
      setPromotionsData(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch (error) {
      console.error('Error fetching promotions:', error)
      toast.error('Không thể tải danh sách khuyến mãi!')
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    const handler = setTimeout(() => {
      fetVoucher(filters)
    }, 500)
    return () => clearTimeout(handler)
  }, [filters, page, limit])




  const getStatusClasses = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'paused':
        return 'bg-yellow-100 text-yellow-700'
      case 'expired':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getUsagePercentage = (used, total) => {
    return total > 0 ? (used / total) * 100 : 0
  }

  return (
    <div style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }} className="min-h-screen   p-5 font-sans text-gray-800">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold ">Quản lý khuyến mại</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAddClick}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-[#ff69b4] hover:bg-[#ff4f9f] text-white"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm khuyến mại</span>
          </button>
        </div>
      </header>

      <div className=" rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative w-full md:w-1/2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 text-black pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Tìm kiếm theo tên hoặc mã khuyến mại..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            />
          </div>

          <div className="flex space-x-3 items-center">
            {/* Nút Bộ lọc */}
            <button
              onClick={toggleFilterPanel}
              className={`px-4 py-2 rounded-xl flex items-center space-x-1 font-medium transition-all ${isFilterPanelOpen ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
            >
              <FunnelIcon className="w-5 h-5" />
              <span>{isFilterPanelOpen ? ' Bộ lọc' : 'Bộ lọc'}</span>
            </button>

            {/* Nút Xuất báo cáo */}
            <button
              // Thêm logic export tại đây nếu cần
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-pink-100 hover:bg-pink-200 text-[#ff69b4] flex items-center space-x-2 border border-pink-300"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Xuất báo cáo</span>
            </button>
          </div>
        </div>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isFilterPanelOpen
            ? 'max-h-96 opacity-100 mb-6'
            : 'max-h-0 opacity-0 mb-0'
            }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

            {/* Bộ lọc Loại */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 ">Loại khuyến mãi</label>
              <select
                className="px-3 py-2 border rounded-lg text-black bg-white focus:ring-2 focus:ring-pink-300"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value, status: 'Tất cả' })}
              >
                <option value="">Tất cả loại</option>
                <option value="percent">Giảm theo %</option>
                <option value="amount">Giảm theo số tiền</option>
                <option value="free_shipping">Miễn phí vận chuyển</option>
              </select>
            </div>

            {/* Bộ lọc Trạng thái */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 ">Trạng thái</label>
              <select
                className="px-3 py-2 border rounded-lg text-black bg-white focus:ring-2 focus:ring-pink-300"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Đang hoạt động">Đang hoạt động</option>
                <option value="Bị tạm dừng">Bị tạm dừng</option>
                <option value="Hết hạn">Hết hạn</option>
              </select>
            </div>

            {/* Bộ lọc Điều kiện */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 ">Điều kiện tự động</label>
              <select
                className="px-3 py-2 border rounded-lg text-black bg-white focus:ring-2 focus:ring-pink-300"
                value={filters.autoCondition}
                onChange={(e) => setFilters({ ...filters, autoCondition: e.target.value })}
              >
                <option value="">Tất cả điều kiện</option>
                <option value="new_user">Người dùng mới</option>
                <option value="vip_user">Khách VIP</option>
                <option value="birthday">Sinh nhật</option>
                <option value="manual">Tạo thủ công</option>
              </select>
            </div>

            {/* Giá trị giảm tối thiểu */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 ">Giá trị giảm tối thiểu</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="VD: 50.000 ₫"
                className="px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-pink-300"
                value={
                  filters.minDiscountValue
                    ? new Intl.NumberFormat('vi-VN').format(filters.minDiscountValue)
                    : ''
                }
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, '')
                  setFilters({ ...filters, minDiscountValue: raw ? Number(raw) : '' })
                }}
              />

            </div>

            {/* Giá trị giảm tối đa */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 ">Giá trị giảm tối đa</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="VD: 100.000 ₫"
                className="px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-pink-300"
                value={
                  filters.maxDiscountValue
                    ? new Intl.NumberFormat('vi-VN').format(filters.maxDiscountValue)
                    : ''
                }
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, '')
                  setFilters({ ...filters, maxDiscountValue: raw ? Number(raw) : '' })
                }}
              />
            </div>

            {/* Khoảng thời gian bắt đầu */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 ">Bắt đầu từ</label>
              <input
                type="date"
                className="px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-pink-300"
                value={filters.startDateFrom}
                onChange={(e) => setFilters({ ...filters, startDateFrom: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 ">Bắt đầu đến</label>
              <input
                type="date"
                className="px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-pink-300"
                value={filters.startDateTo}
                onChange={(e) => setFilters({ ...filters, startDateTo: e.target.value })}
              />
            </div>

            {/* Khoảng thời gian kết thúc */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1 ">Kết thúc từ</label>
              <input
                type="date"
                className="px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-pink-300"
                value={filters.endDateFrom}
                onChange={(e) => setFilters({ ...filters, endDateFrom: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium  ">Kết thúc đến</label>
              <input
                type="date"
                className="px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-pink-300"
                value={filters.endDateTo}
                onChange={(e) => setFilters({ ...filters, endDateTo: e.target.value })}
              />
            </div>

          </div>
          <div className="flex justify-end col-span-full">
            <button
              onClick={() => {
                setFilters({
                  searchTerm: '',
                  status: 'Tất cả',
                  type: '',
                  autoCondition: '',
                  minDiscountValue: '',
                  maxDiscountValue: '',
                  startDateFrom: '',
                  startDateTo: '',
                  endDateFrom: '',
                  endDateTo: '',
                })
                setPage(1)
                fetVoucher({
                  searchTerm: '',
                  status: 'Tất cả',
                  type: '',
                  autoCondition: '',
                  minDiscountValue: '',
                  maxDiscountValue: '',
                  startDateFrom: '',
                  startDateTo: '',
                  endDateFrom: '',
                  endDateTo: '',
                })
              }}
              className="px-4 bg-pink-500 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium border border-gray-300 transition-colors"
            >
              Đặt lại bộ lọc
            </button>
          </div>
          {/* Nút Reset Bộ lọc */}


        </div>

        <div className="space-y-4">
          {promotionsData?.map((promo) => (
            <div key={promo.id} className="relative border border-gray-100  rounded-xl p-6 flex flex-col md:flex-row justify-between items-center md:items-start hover:bg-pink-50 hover:text-black transition-colors">
              <div className="flex-grow">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold ">{promo.name}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses(promo.status)}`}>
                    {promo?.status}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-pink-200 text-pink-700">{promo.code}</span>
                </div>
                <p className="text-sm  mt-2">{promo.description}</p>
                {checkVoucherExpirationOrUsage(promo) && (
                  <span className="text-red-600 text-sm font-semibold">
                    Hết hạn hoặc hết lượt sử dụng
                  </span>
                )}
                <div className="mt-4 text-sm">
                  {promo?.type === "free_shipping" ? (
                    <p><span className="font-medium">Giá trị giảm:</span> Miễn phí vận chuyển</p>
                  ) : (
                    <p>
                      <span className="font-medium">Giá trị giảm:</span>{' '}
                      {promo.type === 'percent'
                        ? `${promo.discountValue}%`
                        : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promo.discountValue)}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Đơn hàng tối thiểu:</span>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promo?.minOrderValue)}

                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right md:w-1/3 mt-4 md:mt-0">
                <p className="text-sm ">
                  <span className="font-medium ">Thời gian</span>
                  <br />
                  {formatDateTime(promo.startDate)} - {formatDateTime(promo.endDate)}
                </p>
                <div className="mt-4">
                  <p className="text-sm font-medium ">Sử dụng</p>
                  <p className="text-sm ">
                    {promo.usedCount}/{promo.usageLimit} ({getUsagePercentage(promo.usedCount, promo.usageLimit).toFixed(0)}%)
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className="bg-[#ff69b4] h-2.5 rounded-full transition-all duration-700 ease-in-out"
                      style={{ width: `${getUsagePercentage(promo.usedCount, promo.usageLimit)}%` }}
                    ></div>

                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4 mt-4 md:mt-0">
                {promo.status === 'active' && (
                  <>
                    <button onClick={() => handleEditClick(promo)} title="Chỉnh sửa" className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => handlePauseClick(promo)} title="Tạm dừng" className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100 transition-colors">
                      <PauseIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
                {promo.status === 'paused' && (
                  <button onClick={() => handleResumeClick(promo)} title="Kích hoạt lại" className="p-2 rounded-full text-green-600 hover:bg-green-100 transition-colors">
                    <PlayIcon className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => handleDeleteClick(promo)} title="Xóa" className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {total > limit && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
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
                  ? "bg-pink-600 text-black"
                  : " hover:bg-pink-600"
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="px-3 py-1 border rounded-lg  hover:bg-gray-200 disabled:opacity-50"
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <EditPromotionModal
          title="Thêm khuyến mại mới"
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={fetVoucher}
        />
      )}

      {isEditModalOpen && (
        <EditPromotionModal
          title="Chỉnh sửa khuyến mại"
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={fetVoucher}
          promotion={selectedPromotion}
        />
      )}

      {isPauseModalOpen && (
        <ConfirmationModal
          title="Tạm dừng khuyến mại"
          message="Bạn có chắc chắn muốn tạm dừng khuyến mại này?"
          isOpen={isPauseModalOpen}
          onClose={() => setIsPauseModalOpen(false)}
          onConfirm={() => handleConfirmAction('pause')}
          confirmText="Tạm dừng"
          buttonColor="bg-yellow-500"
          buttonHoverColor="bg-yellow-600"
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          title="Xóa khuyến mại"
          message="Bạn có chắc chắn muốn xóa khuyến mại này? Thao tác này không thể hoàn tác."
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => handleConfirmAction('delete')}
          confirmText="Xóa"
          buttonColor="bg-red-500"
          buttonHoverColor="bg-red-600"
        />
      )}
      {isResumeModalOpen && (
        <ConfirmationModal
          title="Kích hoạt lại khuyến mại"
          message="Bạn có chắc chắn muốn kích hoạt lại khuyến mại này?"
          isOpen={isResumeModalOpen}
          onClose={() => setIsResumeModalOpen(false)}
          onConfirm={() => handleConfirmAction('resume')}
          confirmText="Kích hoạt"
          buttonColor="bg-green-500"
          buttonHoverColor="bg-green-600"
        />
      )}

    </div>
  )
}

export default PromotionManagementPage
