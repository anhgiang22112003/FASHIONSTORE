import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  XMarkIcon,
  CheckCircleIcon,
  StarIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  ExclamationCircleIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';

// Dữ liệu đánh giá giả lập
const reviewsData = [
  {
    id: 1,
    name: 'Nguyễn Thị Mai',
    status: 'Đã duyệt',
    rating: 5,
    product: 'Váy Hoa Nhí Vintage',
    productImage: 'https://placehold.co/80x80/E5E7EB/4B5563?text=Váy',
    review: 'Rất hài lòng với sản phẩm. Váy rất đẹp, chất liệu cotton mềm mại, form dáng vừa vặn. Giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ shop tiếp.',
    helpfulCount: 12,
    date: '20/1/2024',
    replied: true,
  },
  {
    id: 2,
    name: 'Lê Thị Hương',
    status: 'Chờ duyệt',
    rating: 4,
    product: 'Áo Blouse Trắng Thanh Lịch',
    productImage: 'https://placehold.co/80x80/E5E7EB/4B5563?text=Áo',
    review: 'Sản phẩm tốt nhưng size hơi nhỏ. Áo đẹp, chất liệu tốt nhưng size M hơi nhỏ so với mong đợi. Các bạn nên order size lớn hơn 1 size.',
    helpfulCount: 3,
    date: '19/1/2024',
    replied: false,
  },
  {
    id: 3,
    name: 'Trần Văn Nam',
    status: 'Từ chối',
    rating: 2,
    product: 'Chân Váy Xòe Cổ Điển',
    productImage: 'https://placehold.co/80x80/E5E7EB/4B5563?text=Váy',
    review: 'Không đúng như mô tả. Màu sắc không đúng như hình, chất liệu cầm giống như hàng chợ. Hơi thất vọng.',
    helpfulCount: 1,
    date: '18/1/2024',
    replied: false,
  },
];

// Modal chung
const CommonModal = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-auto shadow-xl">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Modal phản hồi đánh giá
const ReplyModal = ({ isOpen, onClose, onSendReply, review }) => {
  const [replyContent, setReplyContent] = useState('');

  const handleSend = () => {
    onSendReply(review.id, replyContent);
    onClose();
  };

  const getStarRating = (rating) => {
    return (
      <div className="flex text-[#ff69b4]">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} className={`w-4 h-4 ${i < rating ? 'fill-current' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  return (
    <CommonModal title="Phản hồi đánh giá" isOpen={isOpen} onClose={onClose}>
      <div className="mt-4 p-4 border rounded-xl bg-gray-50">
        <h4 className="font-semibold text-lg">{review?.name} {getStarRating(review?.rating)}</h4>
        <p className="text-sm text-gray-600 italic">
          "{review?.review}"
        </p>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung phản hồi</label>
        <textarea
          className="w-full h-32 px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#ff69b4]"
          placeholder="Nhập phản hồi của bạn..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
        ></textarea>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Hủy bỏ</button>
        <button onClick={handleSend} className="px-4 py-2 text-sm font-medium text-white bg-[#ff69b4] rounded-lg hover:bg-[#ff4f9f] transition-colors">Gửi phản hồi</button>
      </div>
    </CommonModal>
  );
};

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
  );
};

const ReviewManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [starFilter, setStarFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Mở modal phản hồi
  const handleReplyClick = (review) => {
    setSelectedReview(review);
    setIsReplyModalOpen(true);
  };

  // Mở modal duyệt đánh giá
  const handleApproveClick = (review) => {
    setSelectedReview(review);
    setIsApproveModalOpen(true);
  };

  // Mở modal từ chối đánh giá
  const handleRejectClick = (review) => {
    setSelectedReview(review);
    setIsRejectModalOpen(true);
  };

  // Mở modal xóa đánh giá
  const handleDeleteClick = (review) => {
    setSelectedReview(review);
    setIsDeleteModalOpen(true);
  };

  // Logic xử lý khi xác nhận các hành động
  const handleConfirmAction = (action) => {
    console.log(`Đã thực hiện hành động "${action}" với đánh giá ID: ${selectedReview.id}`);
    // Thực hiện logic xử lý dữ liệu thực tế ở đây
    setSelectedReview(null);
    setIsReplyModalOpen(false);
    setIsApproveModalOpen(false);
    setIsRejectModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  const filteredReviews = reviewsData.filter(review => {
    const matchesSearch = review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStar = starFilter === '' || review.rating === parseInt(starFilter);
    const matchesStatus = statusFilter === 'Tất cả' || review.status === statusFilter;
    return matchesSearch && matchesStar && matchesStatus;
  });

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Đã duyệt':
        return 'bg-green-100 text-green-700';
      case 'Chờ duyệt':
        return 'bg-yellow-100 text-yellow-700';
      case 'Từ chối':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStarRating = (rating) => {
    return (
      <div className="flex text-[#ff69b4]">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} className={`w-4 h-4 ${i < rating ? 'fill-current' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đánh giá</h1>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-pink-100 hover:bg-pink-200 text-[#ff69b4]">
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Xuất báo cáo</span>
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
              placeholder="Tìm kiếm theo tên khách hàng, sản phẩm, nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2 items-center">
            <select
              className="px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-300"
              value={starFilter}
              onChange={(e) => setStarFilter(e.target.value)}
            >
              <option value="">Số sao</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
            <select
              className="px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-300"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Tất cả</option>
              <option>Đã duyệt</option>
              <option>Chờ duyệt</option>
              <option>Từ chối</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="relative bg-gray-50 rounded-xl p-4 flex items-start space-x-4 hover:bg-pink-50 transition-colors">
              <div className="relative w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-xl font-bold text-[#ff69b4]">
                  {review.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-grow">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900">{review.name}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses(review.status)}`}>
                    {review.status}
                  </span>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                <div className="flex items-center space-x-2 mb-1">
                  {getStarRating(review.rating)}
                  <span className="text-sm font-medium text-gray-700">cho</span>
                  <div className="flex items-center space-x-2">
                    <img src={review.productImage} alt={review.product} className="w-8 h-8 rounded" />
                    <span className="text-sm text-gray-700 font-medium">{review.product}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{review.review}</p>
                <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                  <span className="font-medium">{review.helpfulCount}</span>
                  <span>người thấy hữu ích</span>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1 ml-4 flex-shrink-0">
                {review.status === 'Chờ duyệt' && (
                  <button onClick={() => handleApproveClick(review)} title="Duyệt" className="p-2 rounded-full text-green-600 hover:bg-green-100 transition-colors">
                    <CheckCircleIcon className="w-5 h-5" />
                  </button>
                )}
                {review.status === 'Chờ duyệt' && (
                  <button onClick={() => handleRejectClick(review)} title="Từ chối" className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => handleDeleteClick(review)} title="Xóa" className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors">
                  <TrashIcon className="w-5 h-5" />
                </button>
                {(review.status === 'Đã duyệt' || review.status === 'Chờ duyệt') && (
                  <button onClick={() => handleReplyClick(review)} title="Phản hồi" className="p-2 rounded-full text-[#ff69b4] hover:bg-pink-100 transition-colors">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isReplyModalOpen && (
        <ReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          onSendReply={(id, content) => handleConfirmAction('reply')}
          review={selectedReview}
        />
      )}

      {isApproveModalOpen && (
        <ConfirmationModal
          title="Duyệt đánh giá"
          message="Bạn có chắc chắn muốn duyệt đánh giá này? Đánh giá sẽ hiển thị công khai trên website."
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          onConfirm={() => handleConfirmAction('approve')}
          confirmText="Duyệt"
          buttonColor="bg-green-500"
          buttonHoverColor="bg-green-600"
        />
      )}

      {isRejectModalOpen && (
        <ConfirmationModal
          title="Từ chối đánh giá"
          message="Bạn có chắc chắn muốn từ chối đánh giá này? Đánh giá sẽ không hiển thị trên website."
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          onConfirm={() => handleConfirmAction('reject')}
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
          onConfirm={() => handleConfirmAction('delete')}
          confirmText="Xóa"
          buttonColor="bg-red-500"
          buttonHoverColor="bg-red-600"
        />
      )}
    </div>
  );
};

export default ReviewManagementPage;
