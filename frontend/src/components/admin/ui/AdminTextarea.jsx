import React, { forwardRef } from 'react'

/**
 * AdminTextarea – Reusable multiline textarea for Admin forms.
 *
 * Props:
 *   label      {string}  – Field label text
 *   error      {string}  – Validation error message
 *   required   {boolean}
 *   hint       {string}  – Helper text
 *   rows       {number}  – Number of rows (default: 4)
 *   className  {string}  – Extra wrapper classes
 *   All standard <textarea> props
 */
const AdminTextarea = forwardRef(({
  label,
  error,
  required = false,
  hint,
  rows = 4,
  className = '',
  id,
  ...textareaProps
}, ref) => {
  const fieldId = id || textareaProps.name

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        {...textareaProps}
        className={[
          'w-full rounded-xl border bg-white dark:bg-slate-950/50',
          'text-slate-800 dark:text-slate-200',
          'placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'border-slate-200 dark:border-slate-800/80',
          'focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20',
          'transition-all duration-150 text-sm px-4 py-3 resize-none',
          error ? 'border-rose-400 focus:ring-rose-400' : '',
          textareaProps.disabled ? 'opacity-65 cursor-not-allowed bg-slate-50 dark:bg-slate-800' : '',
        ].join(' ')}
      />

      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      )}
    </div>
  )
})

AdminTextarea.displayName = 'AdminTextarea'
export default AdminTextarea
