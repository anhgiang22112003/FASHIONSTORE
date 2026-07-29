import React, { useEffect, useState } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline'
import EditPromotionModal from '@/components/EditPromotionModal'
import { toast } from 'react-toastify'
import apiAdmin from '@/service/apiAdmin'
import AdminSpinner from '@/components/AdminSpinner'
import { PageHeader, Toolbar, FilterPanel, Pagination, EmptyState, StatusBadge, AdminButton, ConfirmDialog } from "@/components/admin/ui"

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

const PromotionManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
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
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

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
        await apiAdmin.patch(`/vouchers/${selectedPromotion._id}/pause`, { status: 'paused' })
        toast.success('Tạm dừng voucher thành công!')
      }

      if (action === 'resume') {
        await apiAdmin.patch(`/vouchers/${selectedPromotion._id}/pause`, { status: 'active' })
        toast.success('Kích hoạt lại voucher thành công!')
      }

      if (action === 'delete') {
        await apiAdmin.delete(`/vouchers/${selectedPromotion._id}`)
        toast.success('Xóa voucher thành công!')
      }

      await fetVoucher(filters)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
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

  const fetVoucher = async (activeFilters = filters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('limit', limit)

      if (activeFilters.searchTerm) {
        params.append('name', activeFilters.searchTerm)
        params.append('code', activeFilters.searchTerm)
      }
      if (activeFilters.type) params.append('type', activeFilters.type)

      if (activeFilters.status && activeFilters.status !== 'Tất cả') {
        if (activeFilters.status === 'Đang hoạt động') params.append('status', 'active')
        else if (activeFilters.status === 'Bị tạm dừng') params.append('status', 'paused')
        else if (activeFilters.status === 'Hết hạn') params.append('status', 'expired')
      }
      if (activeFilters.autoCondition) params.append('autoCondition', activeFilters.autoCondition)

      if (activeFilters.minDiscountValue)
        params.append('minDiscountValue', activeFilters.minDiscountValue)
      if (activeFilters.maxDiscountValue)
        params.append('maxDiscountValue', activeFilters.maxDiscountValue)

      if (activeFilters.startDateFrom)
        params.append('startDateFrom', activeFilters.startDateFrom)
      if (activeFilters.startDateTo)
        params.append('startDateTo', activeFilters.startDateTo)

      if (activeFilters.endDateFrom)
        params.append('endDateFrom', activeFilters.endDateFrom)
      if (activeFilters.endDateTo)
        params.append('endDateTo', activeFilters.endDateTo)

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

  const getUsagePercentage = (used, total) => {
    return total > 0 ? (used / total) * 100 : 0
  }

  const handleResetFilters = () => {
    const defaultFilters = {
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
    }
    setFilters(defaultFilters)
    setPage(1)
    fetVoucher(defaultFilters)
  }

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Quản lý khuyến mại"
        description="Tạo các chương trình voucher giảm giá, mã miễn phí vận chuyển cho khách hàng mua sắm."
        badge={`${total} khuyến mại`}
      />

      <Toolbar
        searchValue={filters.searchTerm}
        onSearchChange={(val) => setFilters({ ...filters, searchTerm: val })}
        searchPlaceholder="Tìm kiếm khuyến mại..."
        onFilterToggle={toggleFilterPanel}
        filterActive={isFilterPanelOpen}
        filterCount={Object.values(filters).filter(val => val !== "" && val !== "Tất cả").length}
        actions={
          <AdminButton
            variant="primary"
            size="sm"
            onClick={handleAddClick}
            icon={<PlusIcon className="w-4 h-4" />}
          >
            Thêm khuyến mại
          </AdminButton>
        }
      />

      <FilterPanel isOpen={isFilterPanelOpen} onReset={handleResetFilters}>
        <FilterPanel.Field label="Loại khuyến mãi">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">Tất cả loại</option>
            <option value="percent">Giảm theo %</option>
            <option value="amount">Giảm theo số tiền</option>
            <option value="free_shipping">Miễn phí vận chuyển</option>
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Trạng thái">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="Tất cả">Tất cả trạng thái</option>
            <option value="Đang hoạt động">Đang hoạt động</option>
            <option value="Bị tạm dừng">Bị tạm dừng</option>
            <option value="Hết hạn">Hết hạn</option>
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Điều kiện tự động">
          <select
            value={filters.autoCondition}
            onChange={(e) => setFilters({ ...filters, autoCondition: e.target.value })}
          >
            <option value="">Tất cả điều kiện</option>
            <option value="new_user">Người dùng mới</option>
            <option value="vip_user">Khách VIP</option>
            <option value="birthday">Sinh nhật</option>
            <option value="manual">Tạo thủ công</option>
          </select>
        </FilterPanel.Field>

        <div className="flex gap-2">
          <FilterPanel.Field label="Giảm từ ₫">
            <input
              type="text"
              placeholder="VD: 50.000"
              value={filters.minDiscountValue ? new Intl.NumberFormat('vi-VN').format(filters.minDiscountValue) : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, '')
                setFilters({ ...filters, minDiscountValue: raw ? Number(raw) : '' })
              }}
            />
          </FilterPanel.Field>
          <FilterPanel.Field label="Giảm đến ₫">
            <input
              type="text"
              placeholder="VD: 500.000"
              value={filters.maxDiscountValue ? new Intl.NumberFormat('vi-VN').format(filters.maxDiscountValue) : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, '')
                setFilters({ ...filters, maxDiscountValue: raw ? Number(raw) : '' })
              }}
            />
          </FilterPanel.Field>
        </div>

        <div className="flex gap-2">
          <FilterPanel.Field label="Bắt đầu từ">
            <input
              type="date"
              value={filters.startDateFrom}
              onChange={(e) => setFilters({ ...filters, startDateFrom: e.target.value })}
            />
          </FilterPanel.Field>
          <FilterPanel.Field label="Bắt đầu đến">
            <input
              type="date"
              value={filters.startDateTo}
              onChange={(e) => setFilters({ ...filters, startDateTo: e.target.value })}
            />
          </FilterPanel.Field>
        </div>

        <div className="flex gap-2">
          <FilterPanel.Field label="Kết thúc từ">
            <input
              type="date"
              value={filters.endDateFrom}
              onChange={(e) => setFilters({ ...filters, endDateFrom: e.target.value })}
            />
          </FilterPanel.Field>
          <FilterPanel.Field label="Kết thúc đến">
            <input
              type="date"
              value={filters.endDateTo}
              onChange={(e) => setFilters({ ...filters, endDateTo: e.target.value })}
            />
          </FilterPanel.Field>
        </div>
      </FilterPanel>

      {isLoading ? (
        <AdminSpinner message="Đang tải danh sách khuyến mãi..." />
      ) : promotionsData && promotionsData.length > 0 ? (
        <div className="space-y-4">
          {promotionsData.map((promo) => (
            <div
              key={promo._id || promo.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-pink-200 transition-all duration-300 flex flex-col md:flex-row gap-6 items-center md:items-start justify-between"
            >
              <div className="flex-grow space-y-3 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm truncate">{promo.name}</span>
                  <StatusBadge
                    status={promo.status === 'active' ? 'active' : promo.status === 'paused' ? 'pending' : 'inactive'}
                    customLabel={promo.status === 'active' ? 'Đang chạy' : promo.status === 'paused' ? 'Tạm dừng' : 'Hết hạn'}
                  />
                  <span className="px-2 py-0.5 text-xs font-bold text-pink-600 bg-pink-50 border border-pink-100 rounded-lg">
                    {promo.code}
                  </span>
                </div>

                <p className="text-slate-500 text-xs leading-relaxed">{promo.description}</p>

                {checkVoucherExpirationOrUsage(promo) && (
                  <p className="text-xs font-bold text-red-500">⚠️ Đã hết hạn hoặc hết lượt sử dụng</p>
                )}

                <div className="flex items-center gap-6 text-xs text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 font-bold">Giá trị giảm: </span>
                    <span className="font-extrabold text-pink-600">
                      {promo.type === "free_shipping"
                        ? "Miễn phí ship"
                        : promo.type === "percent"
                        ? `${promo.discountValue}%`
                        : `${promo.discountValue?.toLocaleString("vi-VN")}₫`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Đơn tối thiểu: </span>
                    <span className="font-semibold text-slate-700">
                      {promo.minOrderValue?.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-full md:w-1/3 space-y-4">
                <div className="text-xs text-slate-600">
                  <p className="font-bold text-slate-400 mb-1">Thời hạn chương trình</p>
                  <p className="font-medium text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-2">
                    {formatDateTime(promo.startDate)} - {formatDateTime(promo.endDate)}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span className="font-bold text-slate-400">Đã sử dụng</span>
                    <span className="font-bold text-slate-700">
                      {promo.usedCount}/{promo.usageLimit} ({getUsagePercentage(promo.usedCount, promo.usageLimit).toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 border border-slate-200/50">
                    <div
                      className="bg-pink-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${getUsagePercentage(promo.usedCount, promo.usageLimit)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 md:self-stretch justify-end">
                {promo.status === 'active' && (
                  <>
                    <button
                      onClick={() => handleEditClick(promo)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-blue-600 hover:text-blue-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePauseClick(promo)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-amber-600 hover:text-amber-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
                      title="Tạm dừng"
                    >
                      <PauseIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
                {promo.status === 'paused' && (
                  <button
                    onClick={() => handleResumeClick(promo)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-green-600 hover:text-green-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
                    title="Kích hoạt lại"
                  >
                    <PlayIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteClick(promo)}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 text-red-600 hover:text-red-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
                  title="Xóa"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Không tìm thấy khuyến mại"
          description="Chưa có mã voucher nào hoạt động hoặc phù hợp với bộ lọc tìm kiếm hiện tại."
        />
      )}

      <Pagination
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />

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

      <ConfirmDialog
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        onConfirm={() => handleConfirmAction('pause')}
        title="Tạm dừng khuyến mại"
        description="Bạn có chắc chắn muốn tạm thời dừng hoạt động của mã voucher này?"
      />

      <ConfirmDialog
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onConfirm={() => handleConfirmAction('resume')}
        title="Kích hoạt lại khuyến mại"
        description="Bạn có chắc chắn muốn kích hoạt lại hoạt động cho mã voucher này?"
      />

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleConfirmAction('delete')}
        title="Xóa khuyến mại"
        description="Bạn có chắc chắn muốn xóa vĩnh viễn khuyến mại này? Thao tác này không thể khôi phục."
      />
    </div>
  )
}

export default PromotionManagementPage
