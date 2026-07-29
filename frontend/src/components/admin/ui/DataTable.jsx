import React from 'react'

// Skeleton row for loading state
const SkeletonRow = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
      </td>
    ))}
  </tr>
)

const DataTable = ({
  columns,
  data,
  loading,
  skeletonRows = 8,
  emptyState,
  keyExtractor,
  onRowClick,
  stickyHeader = true,
  maxHeight = 'calc(100vh - 300px)',
  className = '',
}) => {
  const headerCls = `px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap bg-slate-50 dark:bg-slate-900 ${stickyHeader ? 'sticky top-0 z-10' : ''}`

  return (
    <div className={`bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <div style={{ maxHeight }} className="overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={`${headerCls} ${col.sticky ? 'sticky right-0 shadow-[-2px_0_4px_rgba(0,0,0,0.04)] dark:shadow-[-2px_0_4px_rgba(0,0,0,0.4)]' : ''}`}
                    style={{ width: col.width }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-900 bg-white dark:bg-slate-950">
              {loading ? (
                Array.from({ length: skeletonRows }).map((_, i) => (
                  <SkeletonRow key={i} cols={columns.length} />
                ))
              ) : data && data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <tr
                    key={keyExtractor ? keyExtractor(row) : rowIndex}
                    className={`hover:bg-pink-50/50 dark:hover:bg-pink-950/20 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-4 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap ${col.sticky ? 'sticky right-0 bg-white dark:bg-slate-950 group-hover:bg-pink-50/50 dark:group-hover:bg-pink-950/20 shadow-[-2px_0_4px_rgba(0,0,0,0.04)] dark:shadow-[-2px_0_4px_rgba(0,0,0,0.4)]' : ''} ${col.cellClassName || ''}`}
                      >
                        {col.render ? col.render(row, rowIndex) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-2">
                    {emptyState || (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <svg className="w-12 h-12 text-slate-200 dark:text-slate-800 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-slate-400 dark:text-slate-600 font-medium">Không có dữ liệu</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DataTable
