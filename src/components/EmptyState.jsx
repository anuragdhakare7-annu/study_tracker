import { GraduationCap, Plus, SearchX } from 'lucide-react'

export default function EmptyState({ variant = 'empty', onAdd, onClear }) {
  const isEmpty = variant === 'empty'
  const Icon = isEmpty ? GraduationCap : SearchX

  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 text-center dark:border-stone-700 dark:bg-stone-900/40">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">
        {isEmpty ? 'No subjects yet' : 'No matching subjects'}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-stone-600 dark:text-stone-400">
        {isEmpty
          ? 'Add your first subject and start ticking off lectures to see your progress here.'
          : 'Nothing matches your current search or filter. Try something different.'}
      </p>
      {isEmpty ? (
        <button
          type="button"
          onClick={onAdd}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add your first subject
        </button>
      ) : (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-stone-700 dark:hover:bg-stone-800"
        >
          Clear search and filters
        </button>
      )}
    </div>
  )
}
