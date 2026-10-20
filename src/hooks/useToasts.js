import { useCallback, useEffect, useRef, useState } from 'react'

export default function useToasts(duration = 3500) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())
  const nextId = useRef(1)

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message, type = 'success') => {
      const id = nextId.current++
      setToasts((prev) => [...prev.slice(-3), { id, message, type }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), type === 'error' ? duration * 2 : duration),
      )
    },
    [dismiss, duration],
  )

  useEffect(() => {
    const map = timers.current
    return () => {
      map.forEach((timer) => clearTimeout(timer))
      map.clear()
    }
  }, [])

  return { toasts, notify, dismiss }
}
