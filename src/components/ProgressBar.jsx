const HEIGHTS = {
  sm: 'h-2',
  md: 'h-2.5',
  lg: 'h-3.5',
}

export default function ProgressBar({ value, label, size = 'md', complete = false }) {
  const percent = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), 100)

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={`w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800 ${HEIGHTS[size] ?? HEIGHTS.md}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${
          complete ? 'bg-emerald-500' : 'bg-indigo-500'
        }`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
