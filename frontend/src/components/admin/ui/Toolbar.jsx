import React from 'react'

const Toolbar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filterActive,
  onFilterToggle,
  filterCount = 0,
  actions,
  bulkActions,
  selectedCount = 0,
}) => {
  return (
    <div className="space-y-3 mb-4">
      {/* Bulk actions bar */}
      {selectedCount > 0 && bulkActions && (
        <div className="flex items-center justify-between bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/50 rounded-xl px-4 py-2.5">
          <span className="text-sm font-medium text-pink-800 dark:text-pink-300">
            Đã chọn <span className="font-bold">{selectedCount}</span> mục
          </span>
          <div className="flex items-center gap-2">{bulkActions}</div>
        </div>
      )}

      {/* Main toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search */}
        {onSearchChange && (
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 transition-all"
            />
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Filter toggle */}
        {onFilterToggle && (
          <button
            onClick={onFilterToggle}
            className={`inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl border transition-all ${
              filterActive
                ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Bộ lọc
            {filterCount > 0 && (
              <span className={`inline-flex items-center justify-center w-4 h-4 text-xs font-bold rounded-full ${filterActive ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400' : 'bg-pink-600 text-white'}`}>
                {filterCount}
              </span>
            )}
          </button>
        )}

        {/* Additional actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

export default Toolbar
