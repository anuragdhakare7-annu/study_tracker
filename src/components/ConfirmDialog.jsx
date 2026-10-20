import { useRef } from 'react'
import Modal from './Modal.jsx'

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null)
  const confirmClasses =
    tone === 'danger'
      ? 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-500'
      : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-500'

  return (
    <Modal
      role="alertdialog"
      title={title}
      description={message}
      onClose={onCancel}
      initialFocusRef={cancelRef}
    >
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-stone-700 dark:hover:bg-stone-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 ${confirmClasses}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
