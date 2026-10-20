import { CheckCircle2, Minus, Pencil, Plus, Trash2 } from 'lucide-react'
import { getCourseProgress, getRemaining, isCourseCompleted } from '../utils/calculations.js'
import ProgressBar from './ProgressBar.jsx'

const iconButton =
  'rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100'

export default function CourseCard({ course, onIncrement, onDecrement, onEdit, onDelete }) {
  const percent = getCourseProgress(course.completed, course.total)
  const remaining = getRemaining(course)
  const done = isCourseCompleted(course)

  return (
    <article
      aria-label={course.name}
      className="animate-fade-in-up rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words text-base font-semibold leading-snug tracking-tight">
          {course.name}
        </h3>
        <div className="-mr-2 -mt-1 flex shrink-0 items-center">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${course.name}`}
            title="Edit subject"
            className={iconButton}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${course.name}`}
            title="Delete subject"
            className={`${iconButton} hover:bg-red-50! hover:text-red-600! dark:hover:bg-red-500/10! dark:hover:text-red-400!`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">{percent}%</p>
        <p className="pb-1 text-sm text-stone-600 tabular-nums dark:text-stone-400">
          <span className="font-medium text-stone-900 dark:text-stone-100">{course.completed}</span> /{' '}
          {course.total} lectures
        </p>
      </div>

      <div className="mt-3">
        <ProgressBar value={percent} label={`${course.name} progress`} complete={done} />
      </div>

      <div className="mt-3 h-6 text-sm">
        {done ? (
          <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Course Completed
          </p>
        ) : (
          <p className="text-stone-600 tabular-nums dark:text-stone-400">
            {remaining} {remaining === 1 ? 'lecture' : 'lectures'} remaining
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={course.completed <= 0}
          aria-label={`Decrease completed lectures for ${course.name}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:border-stone-700 dark:hover:bg-stone-800"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />1
        </button>
        <button
          type="button"
          onClick={onIncrement}
          disabled={done}
          aria-label={`Mark one lecture completed for ${course.name}`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-indigo-600"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />1 lecture done
        </button>
      </div>
    </article>
  )
}
