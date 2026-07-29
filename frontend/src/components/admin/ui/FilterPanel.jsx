import React from 'react'

const FilterPanel = ({ isOpen, onReset, children, title = 'Bộ lọc nâng cao' }) => {
  if (!isOpen) return null

  return (
    <div className="mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</span>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs font-medium text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 hover:underline transition-colors"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// FilterField sub-component for consistent label + input pairs
FilterPanel.Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
    {React.cloneElement(children, {
      className: `${children.props.className || ''} w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 transition-all`.trim(),
    })}
  </div>
)

export default FilterPanel
