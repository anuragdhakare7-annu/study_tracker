import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Search } from 'lucide-react'
import AddCourseModal from './components/AddCourseModal.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import CourseCard from './components/CourseCard.jsx'
import DashboardStats from './components/DashboardStats.jsx'
import EditCourseModal from './components/EditCourseModal.jsx'
import EmptyState from './components/EmptyState.jsx'
import Navbar from './components/Navbar.jsx'
import ToastContainer from './components/Toast.jsx'
import useCourses from './hooks/useCourses.js'
import useToasts from './hooks/useToasts.js'
import {
  FILTER_OPTIONS,
  SORT_OPTIONS,
  filterAndSortCourses,
  getOverallStats,
} from './utils/calculations.js'
import {
  MAX_IMPORT_BYTES,
  exportCoursesToFile,
  parseImport,
  saveTheme,
} from './utils/storage.js'

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

export default function App() {
  const {
    courses,
    bootStatus,
    storageError,
    addCourse,
    updateCourse,
    incrementLecture,
    decrementLecture,
    deleteCourse,
    replaceAll,
    resetAll,
  } = useCourses()
  const { toasts, notify, dismiss } = useToasts()

  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('added')

  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [pendingImport, setPendingImport] = useState(null)
  const [showReset, setShowReset] = useState(false)

  const stats = useMemo(() => getOverallStats(courses), [courses])
  const visibleCourses = useMemo(
    () => filterAndSortCourses(courses, { query, filter, sort }),
    [courses, query, filter, sort],
  )

  const editingCourse = courses.find((c) => c.id === editingId) ?? null
  const deletingCourse = courses.find((c) => c.id === deletingId) ?? null
  const hasActiveFilters = query.trim() !== '' || filter !== 'all'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    saveTheme(theme)
  }, [theme])

  const bootNotified = useRef(false)
  useEffect(() => {
    if (bootStatus === 'recovered' && !bootNotified.current) {
      bootNotified.current = true
      notify(
        'Some saved data could not be read. A copy of the original was kept in your browser and every valid subject was loaded.',
        'error',
      )
    }
  }, [bootStatus, notify])

  const clearFilters = () => {
    setQuery('')
    setFilter('all')
  }

  const handleAdd = (values) => {
    addCourse(values)
    setShowAdd(false)
    notify(`Added “${values.name}”.`)
  }

  const handleEdit = (values) => {
    updateCourse(editingId, values)
    setEditingId(null)
    notify(`Updated “${values.name}”.`)
  }

  const handleIncrement = (course) => {
    if (course.completed >= course.total) return
    incrementLecture(course.id)
    if (course.completed + 1 >= course.total) {
      notify(`${course.name} is complete. Great work!`)
    }
  }

  const handleDecrement = (course) => {
    if (course.completed <= 0) return
    decrementLecture(course.id)
  }

  const handleConfirmDelete = () => {
    if (!deletingCourse) return
    deleteCourse(deletingCourse.id)
    notify(`Deleted “${deletingCourse.name}”.`)
    setDeletingId(null)
  }

  const handleExport = () => {
    try {
      exportCoursesToFile(courses)
      notify(`Exported ${plural(courses.length, 'subject')} to a JSON file.`)
    } catch {
      notify('Could not export your data. Please try again.', 'error')
    }
  }

  const applyImport = (list) => {
    replaceAll(list)
    clearFilters()
    setPendingImport(null)
    notify(`Imported ${plural(list.length, 'subject')}.`)
  }

  const handleImportFile = async (file) => {
    if (file.size > MAX_IMPORT_BYTES) {
      notify('That file is too large to be a Study Tracker export.', 'error')
      return
    }
    let text
    try {
      text = await file.text()
    } catch {
      notify('Could not read that file.', 'error')
      return
    }
    const result = parseImport(text)
    if (!result.ok) {
      notify(result.error, 'error')
      return
    }
    // Only ask before replacing when there is something to replace.
    if (courses.length === 0) applyImport(result.courses)
    else setPendingImport(result.courses)
  }

  const handleConfirmReset = () => {
    resetAll()
    clearFilters()
    setShowReset(false)
    notify('All data has been reset.')
  }

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onAdd={() => setShowAdd(true)}
        onExport={handleExport}
        onImportFile={handleImportFile}
        onReset={() => setShowReset(true)}
      />

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="pb-6 pt-8 sm:pt-10">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Track your syllabus, one lecture at a time.
          </h1>
        </div>

        {storageError ? (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p>
              Your browser’s storage is unavailable or full, so changes can’t be saved and will be lost
              when you close this page. Use Data → Export to keep a copy.
            </p>
          </div>
        ) : null}

        <DashboardStats stats={stats} />

        <section aria-labelledby="courses-heading" className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="courses-heading" className="text-xl font-semibold tracking-tight">
              My Courses
            </h2>
            {courses.length > 0 ? (
              <p className="text-sm text-stone-500 dark:text-stone-400" aria-live="polite">
                Showing {visibleCourses.length} of {plural(courses.length, 'subject')}
              </p>
            ) : null}
          </div>

          {courses.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <label htmlFor="course-search" className="sr-only">
                  Search subjects by name
                </label>
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                  aria-hidden="true"
                />
                <input
                  id="course-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search subjects…"
                  autoComplete="off"
                  className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3.5 text-sm shadow-sm transition placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-stone-700 dark:bg-stone-900 dark:placeholder:text-stone-500"
                />
              </div>

              <div role="group" aria-label="Filter courses" className="flex rounded-xl border border-stone-300 bg-white p-1 shadow-sm dark:border-stone-700 dark:bg-stone-900">
                {FILTER_OPTIONS.map((option) => {
                  const active = filter === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFilter(option.value)}
                      aria-pressed={active}
                      className={`flex-1 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                        active
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="course-sort" className="shrink-0 text-sm text-stone-600 dark:text-stone-400">
                  Sort by
                </label>
                <select
                  id="course-sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-stone-700 dark:bg-stone-900"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          <div className="mt-5">
            {courses.length === 0 ? (
              <EmptyState variant="empty" onAdd={() => setShowAdd(true)} />
            ) : visibleCourses.length === 0 ? (
              <EmptyState variant="no-results" onClear={clearFilters} />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleCourses.map((course) => (
                  <li key={course.id} className="contents">
                    <CourseCard
                      course={course}
                      onIncrement={() => handleIncrement(course)}
                      onDecrement={() => handleDecrement(course)}
                      onEdit={() => setEditingId(course.id)}
                      onDelete={() => setDeletingId(course.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
            {hasActiveFilters && visibleCourses.length > 0 ? (
              <p className="mt-4 text-center text-sm text-stone-500 dark:text-stone-400">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-medium text-indigo-600 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-400"
                >
                  Clear search and filters
                </button>
              </p>
            ) : null}
          </div>
        </section>

        <p className="mt-12 text-center text-xs text-stone-500 dark:text-stone-500">
          Everything is stored only in this browser (LocalStorage). Export a backup from the Data menu
          now and then.
        </p>
      </main>

      {showAdd ? <AddCourseModal onSubmit={handleAdd} onClose={() => setShowAdd(false)} /> : null}

      {editingCourse ? (
        <EditCourseModal
          course={editingCourse}
          onSubmit={handleEdit}
          onClose={() => setEditingId(null)}
        />
      ) : null}

      {deletingCourse ? (
        <ConfirmDialog
          title="Delete this subject?"
          message={`“${deletingCourse.name}” and its progress (${deletingCourse.completed} of ${deletingCourse.total} lectures) will be permanently removed.`}
          confirmLabel="Delete subject"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingId(null)}
        />
      ) : null}

      {pendingImport ? (
        <ConfirmDialog
          title="Replace your current subjects?"
          message={`Importing will replace your ${plural(courses.length, 'current subject')} with ${plural(
            pendingImport.length,
            'subject',
          )} from the file. This can’t be undone.`}
          confirmLabel="Replace and import"
          onConfirm={() => applyImport(pendingImport)}
          onCancel={() => setPendingImport(null)}
        />
      ) : null}

      {showReset ? (
        <ConfirmDialog
          title="Reset all data?"
          message="This permanently deletes every subject and all progress stored in this browser. Export a backup first if you might need it."
          confirmLabel="Reset all data"
          onConfirm={handleConfirmReset}
          onCancel={() => setShowReset(false)}
        />
      ) : null}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
