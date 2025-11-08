import React, { useCallback, useEffect, useState } from "react"
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  XMarkIcon,
  CheckCircleIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { ExclamationCircleIcon } from "@heroicons/react/24/solid"
import apiAdmin from "@/service/apiAdmin"
import { toast } from "react-toastify"
import { socket } from "@/service/socket"
import AsyncSelect from "react-select/async"
import debounce from "lodash.debounce"

// ===== Modal dùng chung =====
const CommonModal = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-auto shadow-xl">
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
    <div className="flex text-[#ff69b4]">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`w-4 h-4 ${i < rating ? "fill-current" : "text-gray-300"}`}
        />
      ))}
    </div>
  )

  return (
    <CommonModal title="Phản hồi đánh giá" isOpen={isOpen} onClose={onClose}>
      <div className="mt-4 p-4 border rounded-xl bg-gray-50">
        <h4 className="font-semibold text-lg">
          {review?.user?.name || "Người dùng"} {getStarRating(review?.rating)}
        </h4>
        <p className="text-sm text-gray-600 italic">"{review?.content}"</p>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nội dung phản hồi
        </label>
        <textarea
          className="w-full h-32 px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#ff69b4]"
          placeholder="Nhập phản hồi của bạn..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
        ></textarea>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Hủy bỏ
        </button>
        <button
          onClick={handleSend}
          className="px-4 py-2 text-sm font-medium text-white bg-[#ff69b4] rounded-lg hover:bg-[#ff4f9f] transition-colors"
        >
          Gửi phản hồi
        </button>
      </div>
    </CommonModal>
  )
}

// ===== Modal xác nhận hành động =====
const ConfirmationModal = ({
  title,
  message,
  isOpen,
  onClose,
  onConfirm,
  confirmText = "Xác nhận",
  buttonColor = "bg-blue-500",
  buttonHoverColor = "bg-blue-600",
}) => {
  if (!isOpen) return null
  return (
    <CommonModal title={title} isOpen={isOpen} onClose={onClose}>
      <div className="mt-4 flex items-center space-x-3">
        <ExclamationCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
        <p className="text-gray-600">{message}</p>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Hủy bỏ
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-sm font-medium text-white ${buttonColor} rounded-lg hover:${buttonHoverColor} transition-colors`}
        >
          {confirmText}
        </button>
      </div>
    </CommonModal>
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

  // Hàm gọi API fetch product
  const fetchProducts = async (inputValue) => {
    const res = await apiAdmin.get("/products", {
      params: { search: inputValue, limit: 20 },
    })
    return res.data.products.map((p) => ({ value: p._id, label: p.name }))
  }

  // Dùng debounce để delay khi người dùng gõ
  const loadOptions = useCallback(
    debounce((inputValue, callback) => {
      fetchProducts(inputValue).then(callback)
    }, 500), // 500ms delay
    []
  )

  const handleChange = (selected) => {
    setSelectedProduct(selected)
    setProductFilter(selected?.value || "")
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
    <div className="flex text-[#ff69b4]">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`w-4 h-4 ${i < rating ? "fill-current" : "text-gray-300"}`}
        />
      ))}
    </div>
  )

  const getStatusClasses = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đánh giá</h1>
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-pink-100 hover:bg-pink-200 text-[#ff69b4]">
          <ArrowDownTrayIcon className="w-5 h-5" />
          <span>Xuất báo cáo</span>
        </button>
      </header>

      {/* Bộ lọc */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative w-full md:w-1/2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Tìm kiếm theo nội dung, sản phẩm, user..."
              value={searchTerm}
              onChange={handleSearch}
              onBlur={fetchReviews}
            />
          </div>
          <AsyncSelect
            cacheOptions
            defaultOptions // load mặc định ban đầu
            loadOptions={loadOptions}
            value={selectedProduct}
            onChange={handleChange}
            isClearable
            placeholder="Chọn sản phẩm..."
            styles={{
              container: (provided) => ({ ...provided, width: 300 }),
            }}
          />
          <div className="flex space-x-2 items-center">
            <select
              className="px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-pink-300"
              value={starFilter}
              onChange={(e) => setStarFilter(e.target.value)}
            >
              <option value="">Số sao</option>
              {[5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>{s} sao</option>
              ))}
            </select>
            <select
              className="px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-pink-300"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chờ duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>

        {/* Danh sách */}
        {loading ? (
          <p className="text-center py-8 text-gray-500">Đang tải...</p>
        ) : reviews.length > 0 ? (
          // Đảm bảo bạn có đủ các icon (CheckCircleIcon, XMarkIcon, TrashIcon, PencilIcon)

          <div className="space-y-6"> {/* Tăng khoảng cách giữa các review */}
            {reviews.map((review) => (
              <div
                key={review._id}
                // Card nền trắng, bo góc lớn hơn, bóng đổ nhẹ tạo cảm giác sang trọng
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex justify-between items-start">

                  {/* Cột 1: Avatar và Nội dung chính */}
                  <div className="flex items-start space-x-4 flex-grow min-w-0">

                    {/* Avatar - Giữ nguyên logic monogram nhưng dùng kích thước lớn hơn */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center border-2 border-[#ff69b4]">
                      <span className="text-xl font-bold text-[#ff69b4]">
                        {review?.user?.name?.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>

                    <div className="flex-grow min-w-0">
                      {/* Hàng 1: Tên, Sao, Trạng thái */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                        <span className="text-lg font-extrabold text-gray-900 truncate">
                          {review?.user?.name || "Người dùng"}
                        </span>
                        <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                          {getStarRating(review.rating)} {/* Hàm hiển thị sao */}
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${getStatusClasses(review.status)}`}
                          >
                            {review.status}
                          </span>
                        </div>
                      </div>

                      {/* Hàng 2: Sản phẩm được đánh giá */}
                      <div className="flex items-center space-x-2 text-gray-700 mb-3">
                        <span className="text-sm font-medium">cho:</span>
                        <img src={review?.product?.mainImage} alt={review?.product?.name} className="w-8 h-8 rounded-lg object-cover shadow-sm" />
                        <span className="text-sm text-gray-800 font-semibold truncate">
                          {review?.product?.name}
                        </span>
                      </div>

                      {/* Nội dung đánh giá */}
                      {/* Sử dụng font chữ dễ đọc hơn cho nội dung */}
                      <p className="text-base text-gray-800 mt-2 leading-relaxed">
                        {review.content}
                      </p>

                      {/* Thông tin phụ: Thời gian và Hữu ích */}
                      <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                        <span className="text-xs">
                          {new Date(review.createdAt).toLocaleString()}
                        </span>
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold text-gray-700">{review.helpfulCount}</span>
                          <span>người thấy hữu ích</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cột 2: Hành động */}
                  <div className="flex flex-col items-center space-y-1 ml-6 flex-shrink-0">

                    {review.status === "pending" && (
                      <>
                        {/* Nút Duyệt: Màu sắc mạnh mẽ hơn */}
                        <button
                          onClick={() => {
                            setSelectedReview(review)
                            setIsApproveModalOpen(true)
                          }}
                          className="p-2 rounded-full text-white bg-green-500 hover:bg-green-600 transition shadow-md"
                          title="Duyệt"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                        {/* Nút Từ chối: Màu sắc mạnh mẽ hơn */}
                        <button
                          onClick={() => {
                            setSelectedReview(review)
                            setIsRejectModalOpen(true)
                          }}
                          className="p-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition shadow-md"
                          title="Từ chối"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Nút Phản hồi: Dùng màu chủ đạo của app */}
                    {(review.status === "approved" || review.status === "pending") && (
                      <button
                        onClick={() => {
                          setSelectedReview(review)
                          setIsReplyModalOpen(true)
                        }}
                        className="p-2 rounded-full text-white bg-[#ff69b4] hover:bg-pink-600 transition shadow-md"
                        title="Phản hồi"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}

                    {/* Nút Xóa: Luôn có, màu xám nhạt tinh tế hơn */}
                    <button
                      onClick={() => {
                        setSelectedReview(review)
                        setIsDeleteModalOpen(true)
                      }}
                      className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition"
                      title="Xóa"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>

                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Không có đánh giá nào.</p>
        )}

        {/* Phân trang */}
        {total > limit && (
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
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
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="px-3 py-1 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isReplyModalOpen && (
        <ReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          onSendReply={handleReply}
          review={selectedReview}
        />
      )}

      {isApproveModalOpen && (
        <ConfirmationModal
          title="Duyệt đánh giá"
          message="Bạn có chắc chắn muốn duyệt đánh giá này?"
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          onConfirm={handleApprove}
          confirmText="Duyệt"
          buttonColor="bg-green-500"
          buttonHoverColor="bg-green-600"
        />
      )}

      {isRejectModalOpen && (
        <ConfirmationModal
          title="Từ chối đánh giá"
          message="Bạn có chắc chắn muốn từ chối đánh giá này?"
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          onConfirm={handleReject}
          confirmText="Từ chối"
          buttonColor="bg-red-500"
          buttonHoverColor="bg-red-600"
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          title="Xóa đánh giá"
          message="Bạn có chắc chắn muốn xóa đánh giá này? Thao tác này không thể hoàn tác."
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          confirmText="Xóa"
          buttonColor="bg-red-500"
          buttonHoverColor="bg-red-600"
        />
      )}
    </div>
  )
}

export default ReviewManagementPage
