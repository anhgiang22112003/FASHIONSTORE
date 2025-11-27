import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Edit } from 'lucide-react';
import OrderSearch from './OrderSearch';
import apiAdmin from '@/service/apiAdmin';
import { COMPLAINT_TYPES, COMPLAINT_TYPE_LABELS } from '@/data/constants';
import { toast } from 'react-toastify'

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
  // ... (useEffect, resetForm, handleOrderSelect, validateForm, handleSubmit giữ nguyên)
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

  useEffect(() => {
    setIsDialogOpen(isOpen);
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      orderId: '',
      complaintType: '',
      reason: '',
      complaintAmount: '',
      note: ''
    });
    setSelectedOrder(null);
    setError('');
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    if (order) {     
      setFormData(prev => ({ ...prev, orderId: order._id }));
    } else {
      setFormData(prev => ({ ...prev, orderId: '' }));
    }
  };

  const validateForm = () => {
    if (!formData.orderId) {
      setError('Vui lòng chọn đơn hàng');
      return false;
    }
    if (!formData.complaintType) {
      setError('Vui lòng chọn loại khiếu nại');
      return false;
    }
    if (!formData.reason.trim()) {
      setError('Vui lòng nhập lý do khiếu nại');
      return false;
    }
    if (!formData.complaintAmount || isNaN(formData.complaintAmount) || Number(formData.complaintAmount) <= 0) {
      setError('Vui lòng nhập số tiền khiếu nại hợp lệ');
      return false;
    }
    if (selectedOrder && Number(formData.complaintAmount) > selectedOrder.total) {
      setError('Số tiền khiếu nại không được vượt quá tổng đơn hàng');
      return false;
    }
    return true;
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setLoading(true);
  setError('');

  try {
    const submitData = {
      ...formData,
      complaintAmount: Number(formData.complaintAmount)
    };

    const id = complaint?._id; 
    let successMessage = '';
    
    if (isEditing && id) {
      await apiAdmin.put(`/complaints/${id}`, submitData);
      successMessage = 'Cập nhật khiếu nại thành công!';
    } else {
      await apiAdmin.post('/complaints', submitData);
      successMessage = 'Tạo khiếu nại mới thành công!';
    }
    
    // ⭐️ THÊM THÔNG BÁO THÀNH CÔNG ⭐️
    toast.success(successMessage);

    onSuccess?.();
    handleClose();
  } catch (err) {
    // Sử dụng optional chaining để truy cập data.error an toàn hơn
    toast.error(err.response?.data?.error || "Lỗi khi thêm hoặc sửa khiếu nại.");
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    setIsDialogOpen(false);
    onClose?.();
    if (!isEditing) {
      resetForm();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // ⭐️ THAY THẾ FormContent BẰNG BIẾN JSX ⭐️
  const FormJSX = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Order Selection */}
      {!isEditing && (
        <div className="space-y-2">
          <Label>Chọn đơn hàng *</Label>
          <OrderSearch 
            onOrderSelect={handleOrderSelect}
            selectedOrder={selectedOrder}
          />
        </div>
      )}
     
      

      {/* Show selected order info for editing */}
      {isEditing && selectedOrder && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h4 className="font-medium">Thông tin đơn hàng</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Mã đơn: {selectedOrder.code}</div>
                <div>Tổng tiền: {formatCurrency(selectedOrder.total)}đ</div>
                <div>Khách hàng: {selectedOrder.customerInfo?.name || selectedOrder.shippingInfo?.name}</div>
                <div>Ngày tạo: {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complaint Type */}
      <div className="space-y-2">
        <Label htmlFor="complaintType">Loại khiếu nại *</Label>
        <Select 
          value={formData.complaintType} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, complaintType: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn loại khiếu nại" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(COMPLAINT_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Complaint Amount */}
      <div className="space-y-2">
        <Label htmlFor="complaintAmount">Số tiền khiếu nại (VNĐ) *</Label>
        <Input
          id="complaintAmount"
          type="number"
          placeholder="Nhập số tiền khiếu nại"
          value={formData.complaintAmount}
          onChange={(e) => setFormData(prev => ({ ...prev, complaintAmount: e.target.value }))}
          min="1"
          max={selectedOrder?.total || undefined}
        />
        {selectedOrder && (
          <p className="text-xs text-gray-500">
            Tối đa: {formatCurrency(selectedOrder.total)}đ
          </p>
        )}
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">Lý do khiếu nại *</Label>
        <Textarea
          id="reason"
          placeholder="Mô tả chi tiết lý do khiếu nại..."
          value={formData.reason}
          onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
          rows={4}
        />
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="note">Ghi chú</Label>
        <Textarea
          id="note"
          placeholder="Ghi chú thêm (không bắt buộc)..."
          value={formData.note}
          onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Cập nhật' : 'Tạo khiếu nại'}
        </Button>
      </div>
    </form>
  );
  // ⭐️ KẾT THÚC FormJSX ⭐️

  if (trigger) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Chỉnh sửa khiếu nại' : 'Tạo khiếu nại mới'}
            </DialogTitle>
          </DialogHeader>
          {FormJSX} {/* Sử dụng biến JSX */}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa khiếu nại' : 'Tạo khiếu nại mới'}
          </DialogTitle>
        </DialogHeader>
        {FormJSX} {/* Sử dụng biến JSX */}
      </DialogContent>
    </Dialog>
  );
};

// Export both the main component and a trigger version
export default ComplaintForm;

export const CreateComplaintButton = ({ onSuccess }) => (
  <ComplaintForm
    trigger={
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        Tạo khiếu nại
      </Button>
    }
    onSuccess={onSuccess}
  />
);

export const EditComplaintButton = ({ complaint, onSuccess }) => (
  <ComplaintForm
    complaint={complaint}
    trigger={
      <Button variant="outline" size="sm" className="gap-2">
        <Edit className="h-4 w-4" />
        Sửa
      </Button>
    }
    onSuccess={onSuccess}
  />
);