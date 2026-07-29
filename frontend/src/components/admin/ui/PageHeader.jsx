import React from 'react'

const PageHeader = ({ title, description, badge, children, backButton, onBack }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 min-w-0">
        {backButton && (
          <button
            onClick={onBack}
            className="flex-shrink-0 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">{title}</h1>
            {badge && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400 border border-pink-200 dark:border-pink-900/50 flex-shrink-0">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {children}
        </div>
      )}
    </div>
  )
}

export default PageHeader
