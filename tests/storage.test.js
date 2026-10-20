import { beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'

// Minimal in-memory localStorage so the storage helpers can run under Node.
class MemoryStorage {
  constructor() {
    this.map = new Map()
    this.failWrites = false
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null
  }
  setItem(key, value) {
    if (this.failWrites) throw new Error('QuotaExceededError')
    this.map.set(key, String(value))
  }
  removeItem(key) {
    this.map.delete(key)
  }
}

const memory = new MemoryStorage()
globalThis.localStorage = memory

const {
  BACKUP_KEY,
  STORAGE_KEY,
  buildExportPayload,
  loadCourses,
  parseImport,
  resetCourses,
  saveCourses,
} = await import('../src/utils/storage.js')

beforeEach(() => {
  memory.map.clear()
  memory.failWrites = false
})

test('first launch seeds the four sample subjects and saves them', () => {
  const { courses, status } = loadCourses()
  assert.equal(status, 'seeded')
  assert.deepEqual(
    courses.map(({ name, completed, total }) => [name, completed, total]),
    [
      ['Data Structures & Algorithms', 12, 30],
      ['DBMS', 8, 20],
      ['Operating Systems', 5, 25],
      ['Computer Networks', 0, 20],
    ],
  )
  assert.equal(new Set(courses.map((c) => c.id)).size, 4)
  assert.ok(memory.getItem(STORAGE_KEY))
})

test('saved data is loaded again and never replaced by samples', () => {
  const mine = [{ id: 'x1', name: 'Maths', completed: 3, total: 9 }]
  assert.equal(saveCourses(mine), true)
  const { courses, status } = loadCourses()
  assert.equal(status, 'ok')
  assert.deepEqual(courses, mine)
})

test('reset saves an empty list so samples are not re-created on reload', () => {
  loadCourses()
  assert.equal(resetCourses(), true)
  const { courses, status } = loadCourses()
  assert.equal(status, 'ok')
  assert.deepEqual(courses, [])
})

test('corrupted JSON is backed up and the app starts empty (no crash, no samples)', () => {
  memory.setItem(STORAGE_KEY, '{not json')
  const { courses, status } = loadCourses()
  assert.equal(status, 'recovered')
  assert.deepEqual(courses, [])
  assert.equal(memory.getItem(BACKUP_KEY), '{not json')
})

test('wrong data shape is treated as corrupted', () => {
  memory.setItem(STORAGE_KEY, JSON.stringify({ hello: 'world' }))
  assert.equal(loadCourses().status, 'recovered')
})

test('invalid entries are dropped, valid ones kept, original backed up', () => {
  const raw = JSON.stringify([
    { id: '1', name: 'Good', completed: 1, total: 2 },
    { id: '2', name: '', completed: 1, total: 2 },
    { id: '3', name: 'Too many', completed: 5, total: 2 },
    { id: '4', name: 'Float', completed: 1.5, total: 2 },
    null,
  ])
  memory.setItem(STORAGE_KEY, raw)
  const { courses, status, dropped } = loadCourses()
  assert.equal(status, 'recovered')
  assert.equal(dropped, 4)
  assert.deepEqual(courses, [{ id: '1', name: 'Good', completed: 1, total: 2 }])
  assert.equal(memory.getItem(BACKUP_KEY), raw)
})

test('duplicate or missing ids are repaired', () => {
  memory.setItem(
    STORAGE_KEY,
    JSON.stringify([
      { id: 'same', name: 'A', completed: 0, total: 1 },
      { id: 'same', name: 'B', completed: 0, total: 1 },
      { name: 'C', completed: 0, total: 1 },
    ]),
  )
  const { courses } = loadCourses()
  assert.equal(new Set(courses.map((c) => c.id)).size, 3)
})

test('a failing write is reported instead of throwing', () => {
  memory.failWrites = true
  assert.equal(saveCourses([]), false)
})

test('export payload round-trips through import validation', () => {
  const courses = [
    { id: 'a', name: 'DSA', completed: 12, total: 30 },
    { id: 'b', name: 'DBMS', completed: 8, total: 20 },
  ]
  const payload = buildExportPayload(courses)
  assert.equal(payload.app, 'my-study-tracker')
  const result = parseImport(JSON.stringify(payload))
  assert.equal(result.ok, true)
  assert.deepEqual(result.courses, courses)
})

test('import accepts a plain array too', () => {
  const result = parseImport(JSON.stringify([{ name: 'OS', completed: 1, total: 5 }]))
  assert.equal(result.ok, true)
  assert.equal(result.courses.length, 1)
  assert.ok(result.courses[0].id)
})

test('import rejects bad files with a clear message and changes nothing', () => {
  const cases = [
    ['', /empty/i],
    ['not json', /not valid JSON/i],
    [JSON.stringify({ foo: 1 }), /No subject list/i],
    [JSON.stringify([{ name: 'A', completed: 9, total: 2 }]), /Subject #1 is invalid/],
    [JSON.stringify([{ name: 'ok', completed: 0, total: 1 }, { name: 'B', completed: 0, total: 0 }]), /Subject #2 is invalid/],
    [JSON.stringify([{ name: 'A', completed: '1', total: 2 }]), /Subject #1 is invalid/],
  ]
  for (const [text, pattern] of cases) {
    const result = parseImport(text)
    assert.equal(result.ok, false, `should reject: ${text}`)
    assert.match(result.error, pattern)
  }
  assert.equal(memory.getItem(STORAGE_KEY), null)
})

test('an empty subject list is a valid import', () => {
  const result = parseImport(JSON.stringify({ courses: [] }))
  assert.equal(result.ok, true)
  assert.deepEqual(result.courses, [])
})
