// Complaint Types
export const COMPLAINT_TYPES = {
  QUALITY: 'QUALITY',
  SERVICE: 'SERVICE', 
  DISCOUNT: 'DISCOUNT'
};

export const COMPLAINT_TYPE_LABELS = {
  [COMPLAINT_TYPES.QUALITY]: 'Khiếu nại chất lượng',
  [COMPLAINT_TYPES.SERVICE]: 'Khiếu nại dịch vụ',
  [COMPLAINT_TYPES.DISCOUNT]: 'Khiếu nại chiết khấu'
};

// Complaint Status
export const COMPLAINT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

export const COMPLAINT_STATUS_LABELS = {
  [COMPLAINT_STATUS.PENDING]: 'Chờ duyệt',
  [COMPLAINT_STATUS.APPROVED]: 'Đã duyệt',
  [COMPLAINT_STATUS.REJECTED]: 'Từ chối'
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
  [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
  [ORDER_STATUS.PROCESSING]: 'Đang xử lý',
  [ORDER_STATUS.SHIPPED]: 'Đã gửi hàng',
  [ORDER_STATUS.DELIVERED]: 'Đã giao hàng',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy'
};

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Date format
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';