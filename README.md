# My Study Tracker

Track your syllabus, one lecture at a time.

A personal, single-user dashboard for tracking college subjects, lectures and syllabus completion. Everything is stored in your browser's LocalStorage. There is no backend, database or login.

**Stack:** React + Vite, Tailwind CSS v4, JavaScript, LocalStorage, Lucide React icons.

## Requirements

- Node.js **20.19 or newer** (or 22.12+), which Vite 7 needs
- npm (ships with Node)

## Install and run

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal (usually http://localhost:5173).

Other commands:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm test          # unit tests for the calculation and storage logic (no extra packages)
```

## What it does

- **Dashboard:** total subjects, total lectures, completed lectures, overall completion % and an overall progress bar, all calculated live from your data.
- **Course cards:** completed / total, remaining, percentage, progress bar, **+1**, **−1**, edit and delete. A "Course Completed" badge appears when every lecture is done.
- **Add / edit subject:** validated form (name required, total must be a whole number ≥ 1, completed must be a whole number from 0 up to the total). Lowering the total below the completed count is rejected.
- **Delete / reset / import:** each one asks for confirmation first.
- **Search, filter, sort:** search by name; filter by All / In Progress / Completed; sort by date added, name or progress.
- **Toasts, empty states, light/dark theme** and a layout that works on desktop, tablet and phone.
- **Data menu (top right):** export to JSON, import from JSON, reset all data.

## How the numbers work

- Course progress = completed ÷ total × 100, rounded to a whole number.
- Overall progress = **total completed lectures ÷ total lectures** across all subjects (not an average of percentages). With the sample data that is 25 / 95 ≈ **26%**.
- With no subjects (or no lectures) every percentage is 0, with no division-by-zero.
- A course that is not finished never displays 100%: 199 / 200 shows 99%, so "100%" always means complete.
- **In Progress** means "not completed yet", so it includes subjects you haven't started. In Progress + Completed always adds up to All.

## Data and storage

- Subjects are saved to LocalStorage immediately after every add, edit, delete or +1 / −1, and loaded on startup. Refreshing or reopening the browser never resets them.
- The four sample subjects (DSA 12/30, DBMS 8/20, OS 5/25, Computer Networks 0/20) are created **only on the very first launch**, when nothing has been saved yet.
- **Reset all data** saves an empty list rather than deleting the key, so the samples do not come back after a reload.
- **Corrupted data:** if saved data cannot be read, the original text is copied to a backup key (`my-study-tracker:courses:corrupted-backup`), valid subjects are loaded and you see a message. The app never crashes on bad data.
- **Export** downloads `my-study-tracker-YYYY-MM-DD.json`. **Import** validates the whole file first (nothing changes if any subject is invalid) and asks before replacing your existing subjects.
- LocalStorage belongs to one browser profile on one site address. Data does not follow you to another browser, a private window or a different port (`localhost:5173` vs `localhost:4173`). Use Export / Import to move or back up your data.

## Project structure

```
src/
  components/
    Navbar.jsx          brand, Data menu, theme toggle, Add subject
    DashboardStats.jsx  stat cards + overall progress bar
    CourseCard.jsx      one subject
    ProgressBar.jsx
    AddCourseModal.jsx  / EditCourseModal.jsx  (share CourseForm.jsx)
    ConfirmDialog.jsx
    Modal.jsx           accessible dialog shell (focus trap, Escape, focus return)
    EmptyState.jsx
    Toast.jsx
  hooks/
    useCourses.js       subject state, synced to LocalStorage
    useToasts.js
  utils/
    storage.js          all LocalStorage access, import / export, validation of stored data
    calculations.js     progress maths, form validation, search / filter / sort
  App.jsx
  main.jsx
  index.css             Tailwind v4 setup (@import "tailwindcss"), dark variant, animations
tests/
  calculations.test.js
  storage.test.js
```

## Tailwind note

The project uses Tailwind CSS **v4** through the official Vite plugin (`@tailwindcss/vite`). There is no `tailwind.config.js` or PostCSS config: `index.css` starts with `@import "tailwindcss";` and the plugin is registered in `vite.config.js`.

## Troubleshooting

- **Blank page / old data after changing code:** hard-refresh the page (Ctrl/Cmd + Shift + R).
- **"Storage unavailable" banner:** your browser is blocking or has filled LocalStorage (for example in some private modes). The app still works for the session, but use **Data → Export** to keep a copy.
