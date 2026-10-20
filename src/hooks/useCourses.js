import { useCallback, useEffect, useState } from 'react'
import { clamp } from '../utils/calculations.js'
import { createId, loadCourses, saveCourses } from '../utils/storage.js'

/**
 * Owns the list of subjects. State lives in React; every change is written to
 * LocalStorage straight away by the effect below.
 */
export default function useCourses() {
  const [boot] = useState(loadCourses)
  const [courses, setCourses] = useState(boot.courses)
  const [storageError, setStorageError] = useState(boot.status === 'unavailable')

  useEffect(() => {
    setStorageError(!saveCourses(courses))
  }, [courses])

  const addCourse = useCallback(({ name, total, completed }) => {
    const course = { id: createId(), name, total, completed: clamp(completed, 0, total) }
    setCourses((prev) => [...prev, course])
    return course
  }, [])

  const updateCourse = useCallback((id, { name, total, completed }) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, name, total, completed: clamp(completed, 0, total) } : c,
      ),
    )
  }, [])

  const incrementLecture = useCallback((id) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: clamp(c.completed + 1, 0, c.total) } : c)),
    )
  }, [])

  const decrementLecture = useCallback((id) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: clamp(c.completed - 1, 0, c.total) } : c)),
    )
  }, [])

  const deleteCourse = useCallback((id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const replaceAll = useCallback((list) => setCourses(list), [])
  const resetAll = useCallback(() => setCourses([]), [])

  return {
    courses,
    bootStatus: boot.status,
    storageError,
    addCourse,
    updateCourse,
    incrementLecture,
    decrementLecture,
    deleteCourse,
    replaceAll,
    resetAll,
  }
}
