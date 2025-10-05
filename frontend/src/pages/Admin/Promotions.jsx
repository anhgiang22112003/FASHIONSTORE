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
} from '@heroicons/react/24/outline'
import {
  ExclamationCircleIcon,
} from '@heroicons/react/24/solid'
import EditPromotionModal from '@/components/EditPromotionModal'
import api from '@/service/api'
import { set } from 'date-fns'
import { toast } from 'react-toastify'



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
        await api.patch(`/vouchers/${selectedPromotion._id}/pause`, { status: 'paused' })
        toast.success('Tạm dừng voucher thành công!')
      }

      if (action === 'resume') {
        // Gọi API kích hoạt lại
        await api.patch(`/vouchers/${selectedPromotion._id}/pause`, { status: 'active' })
        toast.success('Kích hoạt lại voucher thành công!')
      }

      if (action === 'delete') {
        // Gọi API xóa
        await api.delete(`/vouchers/${selectedPromotion._id}`)
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

  const fetVoucher = async () => {
    setLoading(true)
    try {
      const response = await api.get('/vouchers')

      setPromotionsData(response.data || [])
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {

    fetVoucher()
  }, [])

  const filteredPromotions = promotionsData?.filter(promo => {
    const matchesSearch = promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'Tất cả' || promo.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý khuyến mại</h1>
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

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative w-full md:w-1/2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Tìm kiếm theo tên hoặc mã khuyến mại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2 items-center">
            <select
              className="px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-300"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Tất cả</option>
              <option>Đang hoạt động</option>
              <option>Bị tạm dừng</option>
            </select>
            <button className="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-pink-100 hover:bg-pink-200 text-[#ff69b4] flex items-center space-x-2">
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Xuất báo cáo</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredPromotions.map((promo) => (
            <div key={promo.id} className="relative bg-gray-50 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center md:items-start hover:bg-pink-50 transition-colors">
              <div className="flex-grow">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900">{promo.name}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses(promo.status)}`}>
                    {promo?.status}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-pink-200 text-pink-700">{promo.code}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{promo.description}</p>
                <div className="mt-4 text-sm">
                  {promo?.type === "free_shipping" ? (
                    <p><span className="font-medium">Giá trị giảm:</span> Miễn phí vận chuyển</p>
                  ) : (
                    <p><span className="font-medium">Giá trị giảm:</span> {promo.discountValue}{promo.type === 'percent' ? '%' : 'đ'}</p>
                  )}
                  <p>
                    <span className="font-medium">Đơn hàng tối thiểu:</span> {promo.minOrderValue}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right md:w-1/3 mt-4 md:mt-0">
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Thời gian</span>
                  <br />
                  {formatDateTime(promo.startDate)} - {formatDateTime(promo.endDate)}
                </p>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">Sử dụng</p>
                  <p className="text-sm text-gray-500">{promo.usedCount}/{promo.maxUsage} ({getUsagePercentage(promo.usedCount, promo.maxUsage).toFixed(0)}%)</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className="bg-[#ff69b4] h-2.5 rounded-full"
                      style={{ width: `${getUsagePercentage(promo.usedCount, promo.maxUsage)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 ml-4 mt-4 md:mt-0">
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
