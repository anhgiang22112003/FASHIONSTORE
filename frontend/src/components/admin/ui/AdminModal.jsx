import React, { useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

/**
 * AdminModal – Reusable modal dialog for Admin forms and confirmations.
 *
 * Props:
 *   open        {boolean}    – Controls visibility
 *   onClose     {function}   – Called when backdrop / X is clicked
 *   title       {string}     – Modal heading
 *   description {string}     – Optional sub-heading below the title
 *   size        {string}     – 'sm' | 'md' | 'lg' | 'xl' | 'full' (default: 'md')
 *   footer      {ReactNode}  – Footer slot (action buttons)
 *   hideClose   {boolean}    – Hide the X button
 *   children    {ReactNode}  – Modal body content
 */

const sizeClasses = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  '2xl': 'max-w-4xl',
  full: 'max-w-[95vw]',
}

const AdminModal = ({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  hideClose = false,
  children,
}) => {
  const dialogRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Lock body scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className={[
          'relative w-full flex flex-col',
          'bg-white dark:bg-slate-900',
          'border border-slate-200 dark:border-slate-700',
          'rounded-2xl shadow-2xl',
          'max-h-[90vh] overflow-hidden',
          'animate-in fade-in zoom-in-95 duration-200',
          sizeClasses[size] || sizeClasses.md,
        ].join(' ')}
      >
        {/* Modal header */}
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <div className="min-w-0">
              {title && (
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
              )}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                aria-label="Đóng"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal body – scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Modal footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminModal
