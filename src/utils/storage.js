import { MAX_LECTURES, MAX_NAME_LENGTH } from './calculations.js'

// All browser storage access lives in this file.
export const STORAGE_KEY = 'my-study-tracker:courses:v1'
export const BACKUP_KEY = 'my-study-tracker:courses:corrupted-backup'
// Must match the key read by the inline script in index.html.
export const THEME_KEY = 'study-tracker-theme'

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024
const MAX_IMPORT_SUBJECTS = 500

const SAMPLE_DATA = [
  { name: 'Data Structures & Algorithms', completed: 12, total: 30 },
  { name: 'DBMS', completed: 8, total: 20 },
  { name: 'Operating Systems', completed: 5, total: 25 },
  { name: 'Computer Networks', completed: 0, total: 20 },
]

export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export function createSampleCourses() {
  return SAMPLE_DATA.map((course) => ({ id: createId(), ...course }))
}

function getStore() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    // Accessing localStorage can throw (blocked cookies, sandboxed iframes…).
    return null
  }
}

function isValidCourse(course) {
  if (!course || typeof course !== 'object') return false
  const { name, total, completed } = course
  return (
    typeof name === 'string' &&
    name.trim().length > 0 &&
    name.trim().length <= MAX_NAME_LENGTH &&
    Number.isInteger(total) &&
    total >= 1 &&
    total <= MAX_LECTURES &&
    Number.isInteger(completed) &&
    completed >= 0 &&
    completed <= total
  )
}

function normalizeCourse(course, usedIds) {
  let id = typeof course.id === 'string' && course.id ? course.id : createId()
  while (usedIds.has(id)) id = createId()
  usedIds.add(id)
  return {
    id,
    name: course.name.trim().replace(/\s+/g, ' '),
    total: course.total,
    completed: course.completed,
  }
}

function backupRawData(store, raw) {
  try {
    store.setItem(BACKUP_KEY, raw)
  } catch {
    // Nothing more we can do; the main flow continues.
  }
}

/**
 * Loads subjects. Sample data is created only when nothing has ever been saved.
 *
 * status:
 *  - 'seeded'      first launch, sample subjects were created and saved
 *  - 'ok'          saved data loaded
 *  - 'recovered'   saved data was unreadable or partly invalid; the original
 *                  text is kept under BACKUP_KEY and only valid subjects load
 *  - 'unavailable' browser storage can't be used; samples are shown in memory
 */
export function loadCourses() {
  const store = getStore()
  if (!store) return { courses: createSampleCourses(), status: 'unavailable', dropped: 0 }

  let raw
  try {
    raw = store.getItem(STORAGE_KEY)
  } catch {
    return { courses: createSampleCourses(), status: 'unavailable', dropped: 0 }
  }

  if (raw === null) {
    const courses = createSampleCourses()
    const saved = saveCourses(courses)
    return { courses, status: saved ? 'seeded' : 'unavailable', dropped: 0 }
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = null
  }

  if (!Array.isArray(parsed)) {
    backupRawData(store, raw)
    return { courses: [], status: 'recovered', dropped: 0 }
  }

  const usedIds = new Set()
  const courses = []
  let dropped = 0
  for (const item of parsed) {
    if (isValidCourse(item)) courses.push(normalizeCourse(item, usedIds))
    else dropped += 1
  }
  if (dropped > 0) backupRawData(store, raw)

  return { courses, status: dropped > 0 ? 'recovered' : 'ok', dropped }
}

/** Returns true when the data was written successfully. */
export function saveCourses(courses) {
  const store = getStore()
  if (!store) return false
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(courses))
    return true
  } catch {
    return false
  }
}

/**
 * Clears all subjects. An empty list is saved (instead of removing the key)
 * so the sample subjects are not created again on the next page load.
 */
export function resetCourses() {
  return saveCourses([])
}

export function buildExportPayload(courses) {
  return {
    app: 'my-study-tracker',
    version: 1,
    exportedAt: new Date().toISOString(),
    courses: courses.map(({ id, name, total, completed }) => ({ id, name, total, completed })),
  }
}

function localDateStamp() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function exportCoursesToFile(courses) {
  const json = JSON.stringify(buildExportPayload(courses), null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `my-study-tracker-${localDateStamp()}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Validates the text of an imported file. Nothing is changed here; the caller
 * decides what to do with the result: { ok: true, courses } or { ok: false, error }.
 */
export function parseImport(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return { ok: false, error: 'The selected file is empty.' }
  }

  let data
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' }
  }

  const list = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray(data.courses)
      ? data.courses
      : null
  if (!list) {
    return { ok: false, error: 'No subject list found. Please choose a file exported from My Study Tracker.' }
  }
  if (list.length > MAX_IMPORT_SUBJECTS) {
    return { ok: false, error: `That file has too many subjects (limit is ${MAX_IMPORT_SUBJECTS}).` }
  }

  const usedIds = new Set()
  const courses = []
  for (let i = 0; i < list.length; i += 1) {
    if (!isValidCourse(list[i])) {
      return {
        ok: false,
        error: `Subject #${i + 1} is invalid. Each subject needs a name, total lectures (1 or more) and completed lectures (0 up to the total).`,
      }
    }
    courses.push(normalizeCourse(list[i], usedIds))
  }
  return { ok: true, courses }
}

export function getStoredTheme() {
  const store = getStore()
  if (!store) return null
  try {
    const value = store.getItem(THEME_KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}

export function saveTheme(theme) {
  const store = getStore()
  if (!store) return
  try {
    store.setItem(THEME_KEY, theme)
  } catch {
    // Theme preference is optional.
  }
}
