import React from 'react'

const Pagination = ({ page, total, limit, onPageChange }) => {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 4) pages.push('...')
      const start = Math.max(2, page - 2)
      const end = Math.min(totalPages - 1, page + 2)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < totalPages - 3) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  const pages = getPages()
  const btnBase = 'inline-flex items-center justify-center h-8 min-w-[2rem] px-2 text-sm font-medium rounded-lg transition-all'
  const btnActive = 'bg-pink-600 text-white shadow-sm'
  const btnInactive = 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
  const btnDisabled = 'text-slate-300 dark:text-slate-700 cursor-not-allowed'

  const from = Math.min((page - 1) * limit + 1, total)
  const to = Math.min(page * limit, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Hiển thị <span className="font-medium text-slate-700 dark:text-slate-300">{from}–{to}</span> trong số <span className="font-medium text-slate-700 dark:text-slate-300">{total}</span> mục
      </p>
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`${btnBase} ${page === 1 ? btnDisabled : btnInactive}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="inline-flex items-center justify-center h-8 w-8 text-sm text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`${btnBase} ${page === p ? btnActive : btnInactive}`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`${btnBase} ${page >= totalPages ? btnDisabled : btnInactive}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default Pagination
