import React, { forwardRef } from 'react'

/**
 * AdminInput – Reusable text/number/email/date input for Admin forms.
 *
 * Props:
 *   label      {string}          – Field label text
 *   error      {string}          – Validation error message
 *   icon       {ReactNode}       – Heroicon element shown on left (optional)
 *   required   {boolean}
 *   hint       {string}          – Helper text below the field
 *   className  {string}          – Extra wrapper classes
 *   inputClass {string}          – Extra classes applied to the <input> element
 *   All standard <input> props (type, name, value, onChange, placeholder, disabled…)
 */
const AdminInput = forwardRef(({
  label,
  error,
  icon,
  required = false,
  hint,
  className = '',
  inputClass = '',
  id,
  ...inputProps
}, ref) => {
  const fieldId = id || inputProps.name

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          {...inputProps}
          className={[
            'w-full rounded-xl border bg-white dark:bg-slate-950/50',
            'text-slate-800 dark:text-slate-200',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'border-slate-200 dark:border-slate-800/80',
            'focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20',
            'transition-all duration-150 text-sm py-3',
            icon ? 'pl-10 pr-4' : 'px-4',
            error ? 'border-rose-400 focus:ring-rose-400' : '',
            inputProps.disabled ? 'opacity-65 cursor-not-allowed bg-slate-50 dark:bg-slate-800' : '',
            inputClass,
          ].join(' ')}
        />
      </div>

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

AdminInput.displayName = 'AdminInput'
export default AdminInput
