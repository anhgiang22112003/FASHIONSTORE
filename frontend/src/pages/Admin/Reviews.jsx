import React, { useCallback, useEffect, useState } from "react"
import {
  XMarkIcon,
  CheckCircleIcon,
  StarIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline"
import apiAdmin from "@/service/apiAdmin"
import { toast } from "react-toastify"
import AdminSpinner from "@/components/AdminSpinner"
import { socket } from "@/service/socket"
import AsyncSelect from "react-select/async"
import debounce from "lodash.debounce"
import { PageHeader, Toolbar, FilterPanel, Pagination, EmptyState, StatusBadge, AdminButton, ConfirmDialog, AdminModal, AdminTextarea } from "@/components/admin/ui"

// ===== Modal phản hồi =====
const ReplyModal = ({ isOpen, onClose, onSendReply, review }) => {
  const [replyContent, setReplyContent] = useState("")

  const handleSend = () => {
    if (!replyContent.trim()) {
      toast.warning("Vui lòng nhập nội dung phản hồi")
      return
    }
    onSendReply(review._id, replyContent)
    setReplyContent("")
    onClose()
  }

  const getStarRating = (rating) => (
    <div className="flex text-amber-400">
      {[...Array(5)].map((_, i) => (
        <StarIcon key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-current" : "text-slate-200"}`} />
      ))}
    </div>
  )

  return (
    <AdminModal
      open={isOpen}
      onClose={onClose}
      title="Phản hồi đánh giá"
      description={`Tới: ${review?.user?.name || 'Người dùng'}`}
      size="md"
      footer={
        <>
          <AdminButton variant="ghost" size="sm" onClick={onClose}>Hủy bỏ</AdminButton>
          <AdminButton variant="primary" size="sm" onClick={handleSend}>Gửi phản hồi</AdminButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{review?.user?.name || 'Người dùng'}</span>
            {getStarRating(review?.rating)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{review?.content}"</p>
        </div>
        <AdminTextarea
          label="Nội dung phản hồi"
          placeholder="Nhập phản hồi của bạn..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          rows={5}
        />
      </div>
    </AdminModal>
  )
}

// ===== Trang chính =====
const ReviewManagementPage = () => {
  const [selectedReview, setSelectedReview] = useState(null)
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [reviews, setReviews] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [starFilter, setStarFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [productFilter, setProductFilter] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isFilterVisible, setIsFilterVisible] = useState(false)

  const fetchProducts = async (inputValue) => {
    const res = await apiAdmin.get("/products", {
      params: { search: inputValue, limit: 20 },
    })
    return res.data.products.map((p) => ({ value: p._id, label: p.name }))
  }

  const loadOptions = useCallback(
    debounce((inputValue, callback) => {
      fetchProducts(inputValue).then(callback)
    }, 500),
    []
  )

  const handleChange = (selected) => {
    setSelectedProduct(selected)
    setProductFilter(selected?.value || "")
    setPage(1)
  }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const params = {
        page,
        limit,
        search: searchTerm || undefined,
        rating: starFilter || undefined,
        status: statusFilter || undefined,
        productId: productFilter || undefined,
      }
      const res = await apiAdmin.get("/reviews", { params })
      setReviews(res.data.data || [])
      setTotal(res.data.totalItems || 0)
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi tải dữ liệu đánh giá")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [page, starFilter, statusFilter, productFilter])

  useEffect(() => {
    socket.on("newReview", (review) => {
      toast.info(`🆕 Có đánh giá mới: ${review.content}`)
      fetchReviews()
    })
    return () => socket.disconnect()
  }, [])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleReply = async (id, reply) => {
    try {
      await apiAdmin.patch(`/reviews/${id}/reply`, { reply })
      toast.success("Đã gửi phản hồi thành công")
      fetchReviews()
    } catch {
      toast.error("Không thể gửi phản hồi")
    }
  }

  const handleApprove = async () => {
    try {
      await apiAdmin.patch(`/reviews/${selectedReview._id}/approve`)
      toast.success("Duyệt đánh giá thành công")
      fetchReviews()
    } catch {
      toast.error("Không thể duyệt đánh giá")
    }
    setIsApproveModalOpen(false)
  }

  const handleReject = async () => {
    try {
      await apiAdmin.patch(`/reviews/${selectedReview._id}/reject`)
      toast.success("Đã từ chối đánh giá")
      fetchReviews()
    } catch {
      toast.error("Không thể từ chối đánh giá")
    }
    setIsRejectModalOpen(false)
  }

  const handleDelete = async () => {
    try {
      await apiAdmin.delete(`/reviews/${selectedReview._id}`)
      toast.success("Đã xóa đánh giá")
      fetchReviews()
    } catch {
      toast.error("Không thể xóa đánh giá")
    }
    setIsDeleteModalOpen(false)
  }

  const getStarRating = (rating) => (
    <div className="flex text-amber-400">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`w-4 h-4 ${i < rating ? "fill-current" : "text-slate-200"}`}
        />
      ))}
    </div>
  )

  const handleResetFilters = () => {
    setSearchTerm("")
    setStarFilter("")
    setStatusFilter("")
    setSelectedProduct(null)
    setProductFilter("")
    setPage(1)
  }

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PageHeader
        title="Quản lý Đánh giá"
        description="Xem xét đánh giá của khách hàng về sản phẩm, trả lời phản hồi và kiểm duyệt nội dung."
        badge={`${total} đánh giá`}
      />

      <Toolbar
        searchValue={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setPage(1); }}
        searchPlaceholder="Tìm kiếm đánh giá..."
        onFilterToggle={() => setIsFilterVisible(!isFilterVisible)}
        filterActive={isFilterVisible}
        filterCount={Object.values({ starFilter, statusFilter, productFilter }).filter(Boolean).length}
      />

      <FilterPanel isOpen={isFilterVisible} onReset={handleResetFilters}>
        <div className="md:col-span-2">
          <FilterPanel.Field label="Sản phẩm">
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadOptions}
              value={selectedProduct}
              onChange={handleChange}
              className="text-slate-800 text-sm"
              isClearable
              placeholder="Gõ để tìm sản phẩm..."
              styles={{
                control: (provided) => ({
                  ...provided,
                  borderRadius: '12px',
                  borderColor: '#e2e8f0',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                  }
                }),
              }}
            />
          </FilterPanel.Field>
        </div>

        <FilterPanel.Field label="Số sao">
          <select value={starFilter} onChange={(e) => { setStarFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả sao</option>
            {[5, 4, 3, 2, 1].map((s) => (
              <option key={s} value={s}>{s} sao</option>
            ))}
          </select>
        </FilterPanel.Field>

        <FilterPanel.Field label="Trạng thái">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="approved">Đã duyệt</option>
            <option value="pending">Chờ duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </FilterPanel.Field>
      </FilterPanel>

      {loading ? (
        <AdminSpinner message="Đang tải danh sách đánh giá..." />
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-start gap-6"
            >
              <div className="flex-shrink-0 flex items-center md:flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center border border-pink-100 text-pink-600 font-bold text-lg">
                  {review?.user?.name ? review?.user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : "UD"}
                </div>
                <div className="md:text-center">
                  <p className="font-bold text-slate-800 text-sm">{review?.user?.name || "Khách hàng"}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="flex-grow min-w-0 space-y-3">
                <div className="flex items-center gap-3">
                  {getStarRating(review.rating)}
                  <StatusBadge status={review.status === "approved" ? "active" : review.status === "pending" ? "pending" : "inactive"} />
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 w-fit max-w-full">
                  <img
                    src={review?.product?.mainImage || "https://placehold.co/100x100"}
                    alt={review?.product?.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                  />
                  <span className="text-xs text-slate-600 font-semibold truncate max-w-[200px]">
                    {review?.product?.name}
                  </span>
                </div>

                <p className="text-slate-700 text-sm leading-relaxed">{review.content}</p>

                {review.reply && (
                  <div className="mt-3 pl-4 border-l-2 border-slate-200 space-y-1 bg-slate-50/50 p-3 rounded-r-xl">
                    <p className="text-xs font-bold text-slate-600">Phản hồi của hệ thống:</p>
                    <p className="text-xs text-slate-500 italic">"{review.reply}"</p>
                  </div>
                )}
              </div>

              <div className="flex md:flex-col items-center gap-1.5 flex-shrink-0 md:self-stretch justify-end">
                {review.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedReview(review)
                        setIsApproveModalOpen(true)
                      }}
                      className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 rounded-lg transition-colors border border-green-200 shadow-sm"
                      title="Duyệt"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReview(review)
                        setIsRejectModalOpen(true)
                      }}
                      className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 rounded-lg transition-colors border border-amber-200 shadow-sm"
                      title="Từ chối"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </>
                )}

                {(review.status === "approved" || review.status === "pending") && (
                  <button
                    onClick={() => {
                      setSelectedReview(review)
                      setIsReplyModalOpen(true)
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-pink-600 hover:text-pink-700 rounded-lg transition-colors border border-slate-200 shadow-sm"
                    title="Phản hồi"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedReview(review)
                    setIsDeleteModalOpen(true)
                  }}
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
          title="Không có đánh giá nào"
          description="Chưa có đánh giá nào phù hợp với bộ lọc tìm kiếm hiện tại."
        />
      )}

      <Pagination
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
      />

      {isReplyModalOpen && (
        <ReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          onSendReply={handleReply}
          review={selectedReview}
        />
      )}

      <ConfirmDialog
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={handleApprove}
        title="Duyệt đánh giá"
        description="Bạn có chắc chắn muốn phê duyệt đánh giá này để hiển thị công khai?"
      />

      <ConfirmDialog
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
        title="Từ chối đánh giá"
        description="Bạn có chắc chắn muốn từ chối đánh giá này?"
      />

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xóa đánh giá"
        description="Bạn có chắc chắn muốn xóa đánh giá này? Thao tác này không thể hoàn tác."
      />
    </div>
  )
}

export default ReviewManagementPage
