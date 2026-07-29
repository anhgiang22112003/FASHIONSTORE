import React from 'react'
import AdminButton from './AdminButton'

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa',
  description = 'Bạn có chắc chắn muốn thực hiện hành động này? Thao tác này không thể hoàn tác.',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Dialog box */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-4">
          {/* Warning Icon */}
          <div className={`p-3 rounded-full flex-shrink-0 ${
            variant === 'danger' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <AdminButton variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </AdminButton>
          <AdminButton variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </AdminButton>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
