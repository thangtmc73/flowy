import { useEffect } from 'react'

export default function Toast({ message, type = 'error', actionLabel, onAction, onDismiss }) {
  useEffect(() => {
    if (!message) return undefined
    const id = setTimeout(onDismiss, 6000)
    return () => clearTimeout(id)
  }, [message, onDismiss])

  if (!message) return null

  const isError = type === 'error'

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-[max(5.5rem,calc(5rem+env(safe-area-inset-bottom)))] left-4 right-4 z-50 flex justify-center pointer-events-none"
    >
      <div
        className={`pointer-events-auto flex items-start gap-3 max-w-md w-full rounded-2xl px-4 py-3 shadow-lg border backdrop-blur-sm animate-[toast-in_0.35s_cubic-bezier(0.22,1,0.36,1)_both] ${
          isError
            ? 'bg-red-50/95 border-red-200 text-red-900'
            : 'bg-white/95 border-slate-200 text-slate-800'
        }`}
      >
        <div className={`shrink-0 mt-0.5 ${isError ? 'text-red-500' : 'text-brand'}`} aria-hidden="true">
          {isError ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm leading-snug">{message}</p>
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="cursor-pointer mt-2 text-sm font-semibold text-brand hover:text-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/30 rounded"
            >
              {actionLabel}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Đóng thông báo"
          className="cursor-pointer shrink-0 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
