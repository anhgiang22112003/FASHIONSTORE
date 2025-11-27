import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Loader2
} from 'lucide-react';
import apiAdmin from '@/service/apiAdmin';
import { 
  COMPLAINT_STATUS, 
  COMPLAINT_STATUS_LABELS, 
  COMPLAINT_TYPE_LABELS,
  ORDER_STATUS_LABELS 
} from '@/data/constants';

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
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case COMPLAINT_STATUS.PENDING:
        return 'default';
      case COMPLAINT_STATUS.APPROVED:
        return 'success';
      case COMPLAINT_STATUS.REJECTED:
        return 'destructive';
      default:
        return 'secondary';
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
      await apiAdmin.put(`/complaints/${complaint._id}/approve`, {actionNote});
      onUpdate?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi duyệt khiếu nại');
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
      await apiAdmin.put(`/complaints/${complaint._id}/reject`,{actionNote});
      onUpdate?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi từ chối khiếu nại');
    } finally {
      setActionLoading(false);
    }
  };

  if (!complaint) return null;

  const isPending = complaint.status === COMPLAINT_STATUS.PENDING;
  const isApproved = complaint.status === COMPLAINT_STATUS.APPROVED;
  const isRejected = complaint.status === COMPLAINT_STATUS.REJECTED;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chi tiết khiếu nại #{complaint.code}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Status and Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Thông tin cơ bản
                <Badge variant={getStatusBadgeVariant(complaint.status)}>
                  {COMPLAINT_STATUS_LABELS[complaint.status]}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Mã khiếu nại:</span>
                    <span>{complaint.code}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Mã đơn hàng:</span>
                    <span>{complaint.orderCode}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Khách hàng:</span>
                    <span>{complaint.customerName}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Ngày tạo:</span>
                    <span>{formatDateTime(complaint.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Loại khiếu nại:</span>
                    <Badge variant="outline">
                      {COMPLAINT_TYPE_LABELS[complaint.complaintType]}
                    </Badge>
                  </div>
                  {isApproved && complaint.approvedAt && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Ngày duyệt:</span>
                      <span>{formatDateTime(complaint.approvedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Thông tin tài chính
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(complaint.orderTotal)}
                  </div>
                  <div className="text-sm text-gray-600">Tổng đơn hàng</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(complaint.complaintAmount)}
                  </div>
                  <div className="text-sm text-gray-600">Số tiền yêu cầu</div>
                  <div className="text-xs text-gray-500">
                    ({complaint.percent}% đơn hàng)
                  </div>
                </div>
                {isApproved && complaint.discountGiven && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(complaint.discountGiven)}
                    </div>
                    <div className="text-sm text-gray-600">Số tiền đã duyệt</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Information */}
          {complaint.orderId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Thông tin đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Mã đơn:</span>
                      <span>{complaint.orderId.code || complaint.orderCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Trạng thái:</span>
                      <Badge variant="outline">
                        {ORDER_STATUS_LABELS[complaint.orderId.status] || complaint.orderId.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tổng tiền:</span>
                      <span>{formatCurrency(complaint.orderId.total || complaint.orderTotal)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {complaint.orderId.discount && (
                      <div className="flex justify-between">
                        <span className="font-medium">Đã giảm:</span>
                        <span className="text-red-600">
                          -{formatCurrency(complaint.orderId.discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Ngày tạo:</span>
                      <span>{formatDateTime(complaint.orderId.createdAt || complaint.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complaint Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chi tiết khiếu nại
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-medium">Lý do khiếu nại:</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{complaint.reason}</p>
                </div>
              </div>
              
              {complaint.note && (
                <div>
                  <Label className="font-medium">Ghi chú:</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{complaint.note}</p>
                  </div>
                </div>
              )}

              {complaint.approvedBy && (
                <div>
                  <Label className="font-medium">Người duyệt:</Label>
                  <div className="mt-2 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm">{complaint.approvedBy.name || 'N/A'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Section for Pending Complaints */}
          {isPending && showActions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Xử lý khiếu nại</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="actionNote">
                    Ghi chú xử lý *
                  </Label>
                  <Textarea
                    id="actionNote"
                    placeholder="Nhập ghi chú cho việc duyệt hoặc từ chối..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <XCircle className="h-4 w-4" />
                    Từ chối
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <CheckCircle className="h-4 w-4" />
                    Duyệt khiếu nại
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintDetail;

// Export trigger button component
export const ViewComplaintButton = ({ complaint, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Eye className="h-4 w-4" />
        Xem
      </Button>
      <ComplaintDetail
        complaint={complaint}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUpdate={onUpdate}
      />
    </>
  );
};