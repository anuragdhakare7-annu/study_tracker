import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  filterAndSortCourses,
  getCourseProgress,
  getOverallStats,
  getRemaining,
  isCourseCompleted,
  validateCourseInput,
} from '../src/utils/calculations.js'

const SAMPLE = [
  { id: 'a', name: 'Data Structures & Algorithms', completed: 12, total: 30 },
  { id: 'b', name: 'DBMS', completed: 8, total: 20 },
  { id: 'c', name: 'Operating Systems', completed: 5, total: 25 },
  { id: 'd', name: 'Computer Networks', completed: 0, total: 20 },
]

test('course progress rounds to a whole number', () => {
  assert.equal(getCourseProgress(12, 30), 40)
  assert.equal(getCourseProgress(8, 20), 40)
  assert.equal(getCourseProgress(5, 25), 20)
  assert.equal(getCourseProgress(0, 20), 0)
  assert.equal(getCourseProgress(1, 3), 33)
  assert.equal(getCourseProgress(2, 3), 67)
})

test('progress never divides by zero or leaves 0-100', () => {
  assert.equal(getCourseProgress(0, 0), 0)
  assert.equal(getCourseProgress(5, 0), 0)
  assert.equal(getCourseProgress(-3, 10), 0)
  assert.equal(getCourseProgress(50, 10), 100)
})

test('an unfinished course never shows 100%', () => {
  assert.equal(getCourseProgress(199, 200), 99)
  assert.equal(getCourseProgress(200, 200), 100)
})

test('overall progress uses total completed / total lectures (spec example)', () => {
  const stats = getOverallStats(SAMPLE)
  assert.equal(stats.subjectCount, 4)
  assert.equal(stats.totalLectures, 95)
  assert.equal(stats.completedLectures, 25)
  assert.equal(stats.remainingLectures, 70)
  assert.equal(stats.overallPercent, 26)
  // The average of the per-subject percentages would be 25, which is wrong.
  assert.notEqual(stats.overallPercent, 25)
})

test('overall stats handle no subjects', () => {
  const stats = getOverallStats([])
  assert.deepEqual(stats, {
    subjectCount: 0,
    totalLectures: 0,
    completedLectures: 0,
    remainingLectures: 0,
    completedCourses: 0,
    overallPercent: 0,
  })
})

test('completed and remaining helpers', () => {
  assert.equal(isCourseCompleted({ completed: 20, total: 20 }), true)
  assert.equal(isCourseCompleted({ completed: 19, total: 20 }), false)
  assert.equal(isCourseCompleted({ completed: 0, total: 0 }), false)
  assert.equal(getRemaining({ completed: 12, total: 30 }), 18)
})

test('validation: valid input is parsed and trimmed', () => {
  const r = validateCourseInput({ name: '  Compiler   Design ', total: '40', completed: '' })
  assert.equal(r.isValid, true)
  assert.deepEqual(r.values, { name: 'Compiler Design', total: 40, completed: 0 })
})

test('validation: name is required', () => {
  const r = validateCourseInput({ name: '   ', total: '10', completed: '0' })
  assert.equal(r.isValid, false)
  assert.match(r.errors.name, /required/i)
})

test('validation: total must be a positive integer', () => {
  for (const bad of ['', '0', '-5', '2.5', 'abc', '1e3', '10001']) {
    const r = validateCourseInput({ name: 'X', total: bad, completed: '' })
    assert.equal(r.isValid, false, `total "${bad}" should be rejected`)
    assert.ok(r.errors.total, `total "${bad}" should have a message`)
  }
  assert.equal(validateCourseInput({ name: 'X', total: '1', completed: '' }).isValid, true)
  assert.equal(validateCourseInput({ name: 'X', total: '10000', completed: '' }).isValid, true)
})

test('validation: completed must be an integer from 0 to total', () => {
  for (const bad of ['-1', '1.5', 'x', '31']) {
    const r = validateCourseInput({ name: 'X', total: '30', completed: bad })
    assert.equal(r.isValid, false, `completed "${bad}" should be rejected`)
    assert.ok(r.errors.completed)
  }
  assert.equal(validateCourseInput({ name: 'X', total: '30', completed: '30' }).isValid, true)
  assert.equal(validateCourseInput({ name: 'X', total: '30', completed: '0' }).isValid, true)
})

test('validation: lowering total below completed is rejected (edit case)', () => {
  const r = validateCourseInput({ name: 'DSA', total: '10', completed: '12' })
  assert.equal(r.isValid, false)
  assert.match(r.errors.completed, /can’t be more than total/)
})

test('filter: In Progress = not completed, Completed = finished', () => {
  const list = [...SAMPLE, { id: 'e', name: 'Maths', completed: 10, total: 10 }]
  const inProgress = filterAndSortCourses(list, { filter: 'in-progress' }).map((c) => c.id)
  const completed = filterAndSortCourses(list, { filter: 'completed' }).map((c) => c.id)
  assert.deepEqual(inProgress, ['a', 'b', 'c', 'd'])
  assert.deepEqual(completed, ['e'])
  assert.equal(filterAndSortCourses(list, { filter: 'all' }).length, 5)
})

test('search is case-insensitive and trims', () => {
  assert.deepEqual(
    filterAndSortCourses(SAMPLE, { query: '  oPERATING ' }).map((c) => c.id),
    ['c'],
  )
  assert.equal(filterAndSortCourses(SAMPLE, { query: 'zzz' }).length, 0)
})

test('sorting by name and progress, without mutating the input', () => {
  const copy = [...SAMPLE]
  assert.deepEqual(
    filterAndSortCourses(SAMPLE, { sort: 'name-asc' }).map((c) => c.name),
    ['Computer Networks', 'Data Structures & Algorithms', 'DBMS', 'Operating Systems'],
  )
  assert.deepEqual(
    filterAndSortCourses(SAMPLE, { sort: 'name-desc' }).map((c) => c.id),
    ['c', 'b', 'a', 'd'],
  )
  // DSA and DBMS are both 40%; ties are broken by name.
  assert.deepEqual(
    filterAndSortCourses(SAMPLE, { sort: 'progress-desc' }).map((c) => c.id),
    ['a', 'b', 'c', 'd'],
  )
  assert.deepEqual(
    filterAndSortCourses(SAMPLE, { sort: 'progress-asc' }).map((c) => c.id),
    ['d', 'c', 'a', 'b'],
  )
  assert.deepEqual(SAMPLE, copy)
})
