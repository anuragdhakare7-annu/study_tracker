import { AlertCircle, CheckCircle2, X } from 'lucide-react'

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-4 sm:w-96"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error'
        const Icon = isError ? AlertCircle : CheckCircle2
        return (
          <div
            key={toast.id}
            role={isError ? 'alert' : 'status'}
            className="pointer-events-auto flex animate-toast-in items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-lg dark:border-stone-700 dark:bg-stone-900"
          >
            <Icon
              className={`mt-0.5 h-5 w-5 shrink-0 ${
                isError ? 'text-red-500' : 'text-emerald-500'
              }`}
              aria-hidden="true"
            />
            <p className="min-w-0 flex-1 break-words text-sm">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="-m-1 rounded-lg p-1 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
