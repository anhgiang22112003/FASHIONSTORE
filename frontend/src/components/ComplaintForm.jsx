import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit, X, AlertCircle, ShoppingCart, FileText, DollarSign, MessageSquare } from 'lucide-react';
import OrderSearch from './OrderSearch';
import apiAdmin from 'service/apiAdmin';
import { COMPLAINT_TYPES, COMPLAINT_TYPE_LABELS } from 'data/constants';
import { toast } from 'react-toastify';

// ── Custom Modal Shell ──────────────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 [&::-webkit-scrollbar]:hidden">
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
    </div>
  );
};

// ── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, required, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-700">
      {label}{required && <span className="text-pink-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

const inputCls = "w-full px-4 py-2.5 text-sm text-gray-800 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all placeholder-gray-400";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

// ── Main Form Component ──────────────────────────────────────────────────────
const ComplaintForm = ({
  complaint = null,
  isOpen,
  onClose,
  onSuccess,
  trigger = null
}) => {
  const [formData, setFormData] = useState({
    orderId: '',
    complaintType: '',
    reason: '',
    complaintAmount: '',
    note: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(isOpen || false);

  const isEditing = !!complaint;

  useEffect(() => {
    if (complaint) {
      setFormData({
        orderId: complaint.orderId?._id || complaint.orderId || '',
        complaintType: complaint.complaintType || '',
        reason: complaint.reason || '',
        complaintAmount: complaint.complaintAmount?.toString() || '',
        note: complaint.note || ''
      });
      if (complaint.orderId && typeof complaint.orderId === 'object') {
        setSelectedOrder(complaint.orderId);
      }
    } else {
      resetForm();
    }
  }, [complaint]);

  useEffect(() => { setIsDialogOpen(isOpen); }, [isOpen]);

  const resetForm = () => {
    setFormData({ orderId: '', complaintType: '', reason: '', complaintAmount: '', note: '' });
    setSelectedOrder(null);
    setError('');
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setFormData(prev => ({ ...prev, orderId: order ? order._id : '' }));
  };

  const validateForm = () => {
    if (!formData.orderId) { setError('Vui lòng chọn đơn hàng'); return false; }
    if (!formData.complaintType) { setError('Vui lòng chọn loại khiếu nại'); return false; }
    if (!formData.reason.trim()) { setError('Vui lòng nhập lý do khiếu nại'); return false; }
    if (!formData.complaintAmount || isNaN(formData.complaintAmount) || Number(formData.complaintAmount) <= 0) {
      setError('Vui lòng nhập số tiền khiếu nại hợp lệ'); return false;
    }
    if (selectedOrder && Number(formData.complaintAmount) > selectedOrder.total) {
      setError('Số tiền khiếu nại không được vượt quá tổng đơn hàng'); return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      const submitData = { ...formData, complaintAmount: Number(formData.complaintAmount) };
      if (isEditing && complaint?._id) {
        await apiAdmin.put(`/complaints/${complaint._id}`, submitData);
        toast.success('Cập nhật khiếu nại thành công!');
      } else {
        await apiAdmin.post('/complaints', submitData);
        toast.success('Tạo khiếu nại mới thành công!');
      }
      onSuccess?.();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi lưu khiếu nại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    onClose?.();
    if (!isEditing) resetForm();
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount);

  const FormBody = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Search */}
      {!isEditing && (
        <Field label="Đơn hàng" required>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <OrderSearch
              onOrderSelect={handleOrderSelect}
              selectedOrder={selectedOrder}
            />
          </div>
        </Field>
      )}

      {/* Order info card when editing */}
      {isEditing && selectedOrder && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Thông tin đơn hàng</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Mã đơn:</span> <span className="font-medium text-gray-800">{selectedOrder.code}</span></div>
            <div><span className="text-gray-500">Tổng tiền:</span> <span className="font-semibold text-pink-600">{formatCurrency(selectedOrder.total)}đ</span></div>
            <div><span className="text-gray-500">Khách hàng:</span> <span className="font-medium text-gray-800">{selectedOrder.customerInfo?.name || selectedOrder.shippingInfo?.name}</span></div>
            <div><span className="text-gray-500">Ngày tạo:</span> <span className="text-gray-700">{new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}</span></div>
          </div>
        </div>
      )}

      {/* Two-col grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Complaint Type */}
        <Field label="Loại khiếu nại" required>
          <select
            className={selectCls}
            value={formData.complaintType}
            onChange={(e) => setFormData(prev => ({ ...prev, complaintType: e.target.value }))}
          >
            <option value="">-- Chọn loại --</option>
            {Object.entries(COMPLAINT_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </Field>

        {/* Amount */}
        <Field
          label="Số tiền khiếu nại (VNĐ)"
          required
          hint={selectedOrder ? `Tối đa: ${formatCurrency(selectedOrder.total)}đ` : ''}
        >
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              className={`${inputCls} pl-9`}
              placeholder="0"
              value={formData.complaintAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, complaintAmount: e.target.value }))}
              min="1"
              max={selectedOrder?.total || undefined}
            />
          </div>
        </Field>
      </div>

      {/* Reason */}
      <Field label="Lý do khiếu nại" required>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <textarea
            className={`${inputCls} pl-9 resize-none`}
            placeholder="Mô tả chi tiết lý do khiếu nại..."
            value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            rows={4}
          />
        </div>
      </Field>

      {/* Note */}
      <Field label="Ghi chú">
        <textarea
          className={`${inputCls} resize-none`}
          placeholder="Ghi chú thêm (không bắt buộc)..."
          value={formData.note}
          onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
          rows={2}
        />
      </Field>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleClose}
          className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl transition-all shadow-md shadow-pink-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</>
            : <>{isEditing ? <><Edit className="w-4 h-4" />Cập nhật</> : <><Plus className="w-4 h-4" />Tạo khiếu nại</>}</>
          }
        </button>
      </div>
    </form>
  );

  // With external trigger (uses internal open state)
  if (trigger) {
    return (
      <>
        <span onClick={() => setIsDialogOpen(true)} style={{ cursor: 'pointer', display: 'inline-flex' }}>
          {trigger}
        </span>
        <Modal
          isOpen={isDialogOpen}
          onClose={handleClose}
          title={isEditing ? 'Chỉnh sửa khiếu nại' : 'Tạo khiếu nại mới'}
        >
          {FormBody}
        </Modal>
      </>
    );
  }

  // Controlled mode
  return (
    <Modal
      isOpen={isDialogOpen}
      onClose={handleClose}
      title={isEditing ? 'Chỉnh sửa khiếu nại' : 'Tạo khiếu nại mới'}
    >
      {FormBody}
    </Modal>
  );
};

export default ComplaintForm;

// ── Exported convenience wrappers ────────────────────────────────────────────
export const CreateComplaintButton = ({ onSuccess }) => (
  <ComplaintForm
    trigger={
      <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl shadow-md shadow-pink-200 transition-all">
        <Plus className="h-4 w-4" />
        Tạo khiếu nại
      </button>
    }
    onSuccess={onSuccess}
  />
);

export const EditComplaintButton = ({ complaint, onSuccess }) => (
  <ComplaintForm
    complaint={complaint}
    trigger={
      <button className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
        <Edit className="h-4 w-4" />
      </button>
    }
    onSuccess={onSuccess}
  />
);