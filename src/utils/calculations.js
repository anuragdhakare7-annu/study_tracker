export const MAX_LECTURES = 10000
export const MAX_NAME_LENGTH = 80

export const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

export const SORT_OPTIONS = [
  { value: 'added', label: 'Date added' },
  { value: 'name-asc', label: 'Name (A–Z)' },
  { value: 'name-desc', label: 'Name (Z–A)' },
  { value: 'progress-desc', label: 'Progress (high to low)' },
  { value: 'progress-asc', label: 'Progress (low to high)' },
]

const WHOLE_NUMBER = /^\d+$/

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Progress = (completed / total) × 100, rounded to a whole number.
 * Returns 0 when there are no lectures, so there is never a division by zero.
 * An unfinished course never displays 100% (e.g. 199/200 shows 99%), so
 * "100%" always means the course is really complete.
 */
export function getCourseProgress(completed, total) {
  if (!Number.isFinite(total) || total <= 0) return 0
  const safeCompleted = clamp(Number(completed) || 0, 0, total)
  const rounded = Math.round((safeCompleted / total) * 100)
  if (safeCompleted < total && rounded >= 100) return 99
  return rounded
}

export function isCourseCompleted(course) {
  return course.total > 0 && course.completed >= course.total
}

export function getRemaining(course) {
  return Math.max(course.total - course.completed, 0)
}

/**
 * Overall progress is total completed ÷ total lectures across all subjects
 * (not an average of the per-subject percentages).
 */
export function getOverallStats(courses) {
  const subjectCount = courses.length
  const totalLectures = courses.reduce((sum, c) => sum + c.total, 0)
  const completedLectures = courses.reduce((sum, c) => sum + c.completed, 0)
  return {
    subjectCount,
    totalLectures,
    completedLectures,
    remainingLectures: Math.max(totalLectures - completedLectures, 0),
    completedCourses: courses.filter(isCourseCompleted).length,
    overallPercent: getCourseProgress(completedLectures, totalLectures),
  }
}

/**
 * Validates raw form input (strings). Returns the errors by field plus the
 * cleaned, parsed values when everything is valid.
 */
export function validateCourseInput({ name, total, completed }) {
  const errors = {}

  const cleanName = String(name ?? '').trim().replace(/\s+/g, ' ')
  if (!cleanName) {
    errors.name = 'Subject name is required.'
  } else if (cleanName.length > MAX_NAME_LENGTH) {
    errors.name = `Subject name must be ${MAX_NAME_LENGTH} characters or fewer.`
  }

  const totalText = String(total ?? '').trim()
  let validTotal = null
  if (!totalText) {
    errors.total = 'Total lectures is required.'
  } else if (!WHOLE_NUMBER.test(totalText)) {
    errors.total = 'Total lectures must be a whole number greater than 0.'
  } else {
    const parsed = Number.parseInt(totalText, 10)
    if (parsed < 1) {
      errors.total = 'Total lectures must be a whole number greater than 0.'
    } else if (parsed > MAX_LECTURES) {
      errors.total = `Total lectures can’t be more than ${MAX_LECTURES.toLocaleString('en-US')}.`
    } else {
      validTotal = parsed
    }
  }

  const completedText = String(completed ?? '').trim()
  let completedValue = 0
  if (completedText) {
    if (!WHOLE_NUMBER.test(completedText)) {
      errors.completed = 'Completed lectures must be a whole number (0 or more).'
    } else {
      completedValue = Number.parseInt(completedText, 10)
      if (validTotal !== null && completedValue > validTotal) {
        errors.completed = `Completed lectures can’t be more than total lectures (${validTotal.toLocaleString('en-US')}).`
      } else if (completedValue > MAX_LECTURES) {
        errors.completed = `Completed lectures can’t be more than ${MAX_LECTURES.toLocaleString('en-US')}.`
      }
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    values: { name: cleanName, total: validTotal, completed: completedValue },
  }
}

/**
 * Search by name, filter by status and sort. "In Progress" means any course
 * that is not yet completed (including ones not started), so In Progress and
 * Completed together always add up to All.
 */
export function filterAndSortCourses(courses, { query = '', filter = 'all', sort = 'added' } = {}) {
  const q = query.trim().toLowerCase()

  const list = courses.filter((course) => {
    if (q && !course.name.toLowerCase().includes(q)) return false
    if (filter === 'completed') return isCourseCompleted(course)
    if (filter === 'in-progress') return !isCourseCompleted(course)
    return true
  })

  const byName = (a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })
  const ratio = (c) => (c.total > 0 ? c.completed / c.total : 0)

  switch (sort) {
    case 'name-asc':
      return list.sort(byName)
    case 'name-desc':
      return list.sort((a, b) => byName(b, a))
    case 'progress-desc':
      return list.sort((a, b) => ratio(b) - ratio(a) || byName(a, b))
    case 'progress-asc':
      return list.sort((a, b) => ratio(a) - ratio(b) || byName(a, b))
    default:
      return list
  }
}
