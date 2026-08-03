import React from 'react'

const StatusBadge = ({ status, map, label, className = '' }) => {
  // Default maps for common domain statuses
  const orderStatusMap = {
    PENDING:    { label: 'Chờ xử lý',    color: 'bg-amber-100 text-amber-700 border-amber-200' },
    PROCESSING: { label: 'Đang xử lý',   color: 'bg-blue-100 text-blue-700 border-blue-200' },
    SHIPPED:    { label: 'Đang giao',    color: 'bg-purple-100 text-purple-700 border-purple-200' },
    COMPLETED:  { label: 'Hoàn thành',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    CANCELLED:  { label: 'Đã hủy',       color: 'bg-red-100 text-red-700 border-red-200' },
  }

  const paymentStatusMap = {
    PENDING:  { label: 'Chờ TT',      color: 'bg-amber-100 text-amber-700 border-amber-200' },
    APPROVED: { label: 'Đã TT',       color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    DECLINED: { label: 'Từ chối',     color: 'bg-red-100 text-red-700 border-red-200' },
    CANCELLED:{ label: 'Đã hủy',     color: 'bg-slate-100 text-slate-600 border-slate-200' },
    FAILED:   { label: 'Thất bại',     color: 'bg-red-100 text-red-700 border-red-200' },
    SUCCESS:  { label: 'Thành công',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    PAID:     { label: 'Đã TT',       color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    UNPAID:   { label: 'Chưa TT',     color: 'bg-amber-100 text-amber-700 border-amber-200' },
  }

  const productStatusMap = {
    'Còn hàng':  { label: 'Còn hàng',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    'Hết hàng':  { label: 'Hết hàng',  color: 'bg-red-100 text-red-700 border-red-200' },
    'Ngừng bán': { label: 'Ngừng bán', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  }

  const userStatusMap = {
    active:   { label: 'Hoạt động', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    inactive: { label: 'Bị khóa',   color: 'bg-red-100 text-red-700 border-red-200' },
    pending:  { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  }

  const flashSaleStatusMap = {
    UPCOMING: { label: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    ACTIVE:   { label: 'Đang diễn ra',color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    ENDED:    { label: 'Đã kết thúc', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  }

  const extraStatusMap = {
    pending:    { label: 'Chờ xử lý',    color: 'bg-amber-100 text-amber-700 border-amber-200' },
    processing: { label: 'Đang xử lý',   color: 'bg-blue-100 text-blue-700 border-blue-200' },
    shipped:    { label: 'Đang giao',    color: 'bg-purple-100 text-purple-700 border-purple-200' },
    completed:  { label: 'Hoàn thành',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    cancelled:  { label: 'Đã hủy',       color: 'bg-red-100 text-red-700 border-red-200' },
    failed:     { label: 'Thất bại',     color: 'bg-red-100 text-red-700 border-red-200' },
    paid:       { label: 'Đã TT',       color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    unpaid:     { label: 'Chưa TT',     color: 'bg-amber-100 text-amber-700 border-amber-200' },
    success:    { label: 'Thành công',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  }

  // Resolve using provided map or auto-detect.
  // Priority: explicit `map` prop -> orderStatusMap -> paymentStatusMap -> extras
  const config = (map && map[status])
    || orderStatusMap[status]
    || paymentStatusMap[status]
    || productStatusMap[status]
    || userStatusMap[status]
    || flashSaleStatusMap[status]
    || extraStatusMap[status]

  if (!config) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-100 text-slate-600 border-slate-200 ${className}`}>
        {label || status}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      {label || config.label}
    </span>
  )
}

export default StatusBadge
