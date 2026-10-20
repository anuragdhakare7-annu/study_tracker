import { useId, useRef, useState } from 'react'
import { validateCourseInput } from '../utils/calculations.js'

const inputBase =
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 shadow-sm transition focus:outline-none focus:ring-2 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500'
const inputOk =
  'border-stone-300 focus:border-indigo-500 focus:ring-indigo-500/30 dark:border-stone-700'
const inputError =
  'border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500/70'

function Field({ id, label, optional = false, error, hint, inputRef, ...inputProps }) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-sm font-medium">
        <span>{label}</span>
        {optional ? (
          <span className="text-xs font-normal text-stone-500 dark:text-stone-400">Optional</span>
        ) : null}
      </label>
      <input
        id={id}
        ref={inputRef}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`${inputBase} ${error ? inputError : inputOk}`}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export default function CourseForm({ initialValues, submitLabel, onSubmit, onCancel, nameInputRef }) {
  const uid = useId()
  const [fields, setFields] = useState(initialValues)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const totalRef = useRef(null)
  const completedRef = useRef(null)

  const { errors } = validateCourseInput(fields)
  const showError = (field) => (submitted || touched[field] ? errors[field] : undefined)

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setFields((prev) => ({ ...prev, [field]: value }))
  }
  const handleBlur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }))

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = validateCourseInput(fields)
    if (!result.isValid) {
      setSubmitted(true)
      const firstInvalid = result.errors.name
        ? nameInputRef?.current
        : result.errors.total
          ? totalRef.current
          : completedRef.current
      firstInvalid?.focus()
      return
    }
    onSubmit(result.values)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Field
        id={`${uid}-name`}
        label="Subject name"
        type="text"
        autoComplete="off"
        placeholder="e.g. Data Structures & Algorithms"
        value={fields.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        error={showError('name')}
        inputRef={nameInputRef}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Field
          id={`${uid}-total`}
          label="Total lectures"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="e.g. 30"
          value={fields.total}
          onChange={handleChange('total')}
          onBlur={handleBlur('total')}
          error={showError('total')}
          inputRef={totalRef}
          required
        />
        <Field
          id={`${uid}-completed`}
          label="Completed"
          optional
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={fields.completed}
          onChange={handleChange('completed')}
          onBlur={handleBlur('completed')}
          error={showError('completed')}
          hint="Leave empty to start at 0."
          inputRef={completedRef}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-stone-700 dark:hover:bg-stone-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
