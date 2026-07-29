import React from 'react'

const EmptyState = ({
  icon,
  title = 'Không có dữ liệu',
  description = 'Hiện chưa có dữ liệu nào để hiển thị.',
  action,
  size = 'md',
}) => {
  const sizeStyles = {
    sm: { wrapper: 'py-10', icon: 'w-10 h-10', title: 'text-base', desc: 'text-sm' },
    md: { wrapper: 'py-16', icon: 'w-14 h-14', title: 'text-lg',   desc: 'text-sm' },
    lg: { wrapper: 'py-24', icon: 'w-16 h-16', title: 'text-xl',   desc: 'text-base' },
  }
  const s = sizeStyles[size] || sizeStyles.md

  return (
    <div className={`flex flex-col items-center justify-center ${s.wrapper} text-center`}>
      <div className={`${s.icon} text-slate-300 dark:text-slate-700 mb-4 flex items-center justify-center`}>
        {icon || (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <h3 className={`font-semibold text-slate-700 dark:text-slate-300 mb-1 ${s.title}`}>{title}</h3>
      <p className={`text-slate-400 dark:text-slate-500 mb-4 max-w-xs ${s.desc}`}>{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}

export default EmptyState
