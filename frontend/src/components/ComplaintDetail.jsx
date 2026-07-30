import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Package, 
  User, 
  Calendar, 
  DollarSign,
  FileText,
  MessageSquare,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import apiAdmin from '@/service/apiAdmin';
import { 
  COMPLAINT_STATUS, 
  COMPLAINT_STATUS_LABELS, 
  COMPLAINT_TYPE_LABELS,
  ORDER_STATUS_LABELS 
} from '@/data/constants';

// ── Custom Modal Shell (Portal to escape sticky table z-index) ──────────────
const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 [&::-webkit-scrollbar]:hidden">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Section Card Component ──────────────────────────────────────────────────
const SectionCard = ({ title, icon: Icon, children, badge = null }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-pink-500" />}
        <h3 className="font-bold text-gray-800 text-base">{title}</h3>
      </div>
      {badge}
    </div>
    <div className="text-sm text-gray-600">
      {children}
    </div>
  </div>
);

// ── Main Detail Component ────────────────────────────────────────────────────
const ComplaintDetail = ({ 
  complaint, 
  isOpen, 
  onClose, 
  onUpdate,
  showActions = true 
}) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [error, setError] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case COMPLAINT_STATUS.PENDING:
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case COMPLAINT_STATUS.APPROVED:
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case COMPLAINT_STATUS.REJECTED:
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  const handleApprove = async () => {
    if (!actionNote.trim()) {
      setError('Vui lòng nhập ghi chú duyệt');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      await apiAdmin.put(`/complaints/${complaint._id}/approve`, { actionNote });
      onUpdate?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Có lỗi xảy ra khi duyệt khiếu nại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!actionNote.trim()) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      await apiAdmin.put(`/complaints/${complaint._id}/reject`, { actionNote });
      onUpdate?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Có lỗi xảy ra khi từ chối khiếu nại');
    } finally {
      setActionLoading(false);
    }
  };

  if (!complaint) return null;

  const isPending = complaint.status === COMPLAINT_STATUS.PENDING;
  const isApproved = complaint.status === COMPLAINT_STATUS.APPROVED;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết khiếu nại #${complaint.code}`}
    >
      <div className="space-y-6">
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status and Basic Info */}
          <SectionCard 
            title="Thông tin cơ bản" 
            icon={FileText}
            badge={
              <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${getStatusBadgeStyle(complaint.status)}`}>
                {COMPLAINT_STATUS_LABELS[complaint.status]}
              </span>
            }
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Mã khiếu nại</span>
                  <span className="font-semibold text-gray-800">{complaint.code}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Mã đơn hàng</span>
                  <span className="font-semibold text-gray-800">{complaint.orderCode}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Khách hàng</span>
                  <span className="font-medium text-gray-800">{complaint.customerName}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Ngày tạo</span>
                  <span className="font-medium text-gray-700">{formatDateTime(complaint.createdAt)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Loại khiếu nại</span>
                  <span className="mt-1 inline-block self-start px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium">
                    {COMPLAINT_TYPE_LABELS[complaint.complaintType]}
                  </span>
                </div>
                {isApproved && complaint.approvedAt && (
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Ngày duyệt</span>
                    <span className="font-semibold text-emerald-600">{formatDateTime(complaint.approvedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Financial Information */}
          <SectionCard title="Thông tin tài chính" icon={DollarSign}>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col justify-center">
                <span className="text-sm font-bold text-blue-700">{formatCurrency(complaint.orderTotal)}đ</span>
                <span className="text-xxs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Tổng đơn</span>
              </div>
              <div className="text-center p-3 bg-pink-50/50 border border-pink-100 rounded-xl flex flex-col justify-center">
                <span className="text-sm font-bold text-pink-600">{formatCurrency(complaint.complaintAmount)}đ</span>
                <span className="text-xxs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Yêu cầu hoàn</span>
                <span className="text-xxs text-gray-400 mt-0.5">({complaint.percent}%)</span>
              </div>
              <div className="text-center p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex flex-col justify-center">
                <span className="text-sm font-bold text-emerald-700">
                  {isApproved && complaint.discountGiven ? `${formatCurrency(complaint.discountGiven)}đ` : '---'}
                </span>
                <span className="text-xxs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Đã duyệt</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Order Details */}
        {complaint.orderId && (
          <SectionCard title="Chi tiết Đơn hàng liên quan" icon={Package}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between border-b border-gray-50 py-1">
                  <span className="text-gray-500">Mã đơn:</span>
                  <span className="font-medium text-gray-800">{complaint.orderId.code || complaint.orderCode}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 py-1">
                  <span className="text-gray-500">Trạng thái đơn:</span>
                  <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-semibold uppercase">
                    {ORDER_STATUS_LABELS[complaint.orderId.status] || complaint.orderId.status}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between border-b border-gray-50 py-1">
                  <span className="text-gray-500">Tổng thanh toán:</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(complaint.orderId.total || complaint.orderTotal)}đ</span>
                </div>
                {complaint.orderId.discount && (
                  <div className="flex justify-between border-b border-gray-50 py-1">
                    <span className="text-gray-500">Đã áp dụng voucher:</span>
                    <span className="text-red-500 font-semibold">-{formatCurrency(complaint.orderId.discount)}đ</span>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        )}

        {/* Complaint Reason & Note */}
        <SectionCard title="Mô tả khiếu nại" icon={MessageSquare}>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-1 uppercase tracking-wider">Lý do khiếu nại</span>
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                {complaint.reason}
              </div>
            </div>
            {complaint.note && (
              <div>
                <span className="text-xs font-semibold text-gray-400 block mb-1 uppercase tracking-wider">Ghi chú thêm</span>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                  {complaint.note}
                </div>
              </div>
            )}
            {complaint.approvedBy && (
              <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t border-gray-50">
                <span>Người duyệt:</span>
                <strong className="text-gray-700">{complaint.approvedBy.name || 'N/A'}</strong>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Action Section for Pending Complaints */}
        {isPending && showActions && (
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 text-base">Xử lý khiếu nại & phê duyệt</h3>
            <div className="space-y-1.5">
              <label htmlFor="actionNote" className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                Ghi chú xử lý / lý do duyệt/từ chối *
              </label>
              <textarea
                id="actionNote"
                placeholder="Nhập lý do chi tiết..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 text-sm text-gray-800 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all placeholder-gray-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-md shadow-red-100 disabled:opacity-60"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Từ chối
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl transition-all shadow-md shadow-pink-200 disabled:opacity-60"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Duyệt & hoàn tiền
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ComplaintDetail;

// Export trigger button component
export const ViewComplaintButton = ({ complaint, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-pink-600 hover:text-pink-800 hover:bg-pink-50 rounded-lg transition-colors"
        title="Xem chi tiết"
      >
        <Eye className="h-4 w-4" />
      </button>
      <ComplaintDetail
        complaint={complaint}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  );
};