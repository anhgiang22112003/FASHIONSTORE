import React from 'react'

/**
 * AdminCard – Reusable section card for Admin detail and form pages.
 *
 * Props:
 *   title       {string}     – Card heading text
 *   description {string}     – Optional sub-heading
 *   icon        {ReactNode}  – Icon next to the title (optional)
 *   actions     {ReactNode}  – Header-right slot for buttons/badges
 *   footer      {ReactNode}  – Footer slot
 *   noPadding   {boolean}    – Skip inner padding (for tables inside cards)
 *   variant     {string}     – 'default' | 'highlight' | 'danger'
 *   className   {string}     – Extra classes for the card wrapper
 *   children    {ReactNode}  – Card body content
 */

const variantClasses = {
  default:   'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80',
  highlight: 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40',
  danger:    'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40',
  warning:   'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40',
  success:   'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40',
}

const titleVariantClasses = {
  default:   'text-slate-800 dark:text-slate-200',
  highlight: 'text-indigo-800 dark:text-indigo-300',
  danger:    'text-rose-800 dark:text-rose-300',
  warning:   'text-amber-800 dark:text-amber-300',
  success:   'text-emerald-800 dark:text-emerald-300',
}

const iconVariantClasses = {
  default:   'text-slate-500 dark:text-slate-400',
  highlight: 'text-indigo-500',
  danger:    'text-rose-500',
  warning:   'text-amber-500',
  success:   'text-emerald-500',
}

const AdminCard = ({
  title,
  description,
  icon,
  actions,
  footer,
  noPadding = false,
  variant = 'default',
  className = '',
  children,
}) => {
  const hasHeader = title || actions

  return (
    <div className={[
      'rounded-2xl border shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-200',
      variantClasses[variant] || variantClasses.default,
      className,
    ].join(' ')}>
      {/* Header */}
      {hasHeader && (
        <div className={[
          'flex items-center justify-between gap-4 px-8 py-5',
          'border-b border-slate-100 dark:border-slate-800/50',
        ].join(' ')}>
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <span className={[
                'flex-shrink-0 w-5 h-5',
                iconVariantClasses[variant] || iconVariantClasses.default,
              ].join(' ')}>
                {icon}
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className={[
                  'text-lg md:text-xl font-bold leading-tight truncate',
                  titleVariantClasses[variant] || titleVariantClasses.default,
                ].join(' ')}>
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{description}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className={noPadding ? '' : 'p-8'}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/10">
          {footer}
        </div>
      )}
    </div>
  )
}

export default AdminCard
