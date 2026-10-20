import { useEffect, useId, useRef, useState } from 'react'
import { Database, Download, GraduationCap, Moon, Plus, RotateCcw, Sun, Upload } from 'lucide-react'

const iconButton =
  'inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800'

const menuItem =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-indigo-500 dark:hover:bg-stone-800'

function DataMenu({ onExport, onImport, onReset }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const buttonRef = useRef(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const run = (action) => () => {
    setOpen(false)
    action()
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={iconButton}
      >
        <Database className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Data</span>
        <span className="sr-only sm:hidden">Data options</span>
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute right-0 z-40 mt-2 w-56 animate-pop-in rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl dark:border-stone-700 dark:bg-stone-900"
        >
          <button type="button" onClick={run(onExport)} className={menuItem}>
            <Download className="h-4 w-4 text-stone-500" aria-hidden="true" />
            Export data (JSON)
          </button>
          <button type="button" onClick={run(onImport)} className={menuItem}>
            <Upload className="h-4 w-4 text-stone-500" aria-hidden="true" />
            Import data (JSON)
          </button>
          <div className="my-1 h-px bg-stone-200 dark:bg-stone-700" role="separator" />
          <button
            type="button"
            onClick={run(onReset)}
            className={`${menuItem} text-red-600 hover:bg-red-50! dark:text-red-400 dark:hover:bg-red-500/10!`}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset all data
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default function Navbar({ theme, onToggleTheme, onAdd, onExport, onImportFile, onReset }) {
  const fileInputRef = useRef(null)
  const isDark = theme === 'dark'

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    // Clear the input so choosing the same file again still triggers a change.
    event.target.value = ''
    if (file) onImportFile(file)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-50/80 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="truncate text-base font-semibold tracking-tight">My Study Tracker</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <DataMenu
            onExport={onExport}
            onImport={() => fileInputRef.current?.click()}
            onReset={onReset}
          />
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`${iconButton} w-10 px-0`}
          >
            {isDark ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 sm:px-4"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add subject</span>
            <span className="sr-only sm:hidden">Add subject</span>
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        tabIndex={-1}
        aria-label="Import data from a JSON file"
        onChange={handleFileChange}
      />
    </header>
  )
}
