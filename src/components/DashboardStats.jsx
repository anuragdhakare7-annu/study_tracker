import { BookOpen, CheckCircle2, ListChecks, TrendingUp } from 'lucide-react'
import ProgressBar from './ProgressBar.jsx'

const TONES = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONES[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{label}</p>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  )
}

export default function DashboardStats({ stats }) {
  const { subjectCount, totalLectures, completedLectures, remainingLectures, overallPercent } = stats

  return (
    <section aria-labelledby="overview-heading" className="space-y-4">
      <h2 id="overview-heading" className="sr-only">
        Overview
      </h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total subjects" value={subjectCount.toLocaleString()} tone="indigo" />
        <StatCard icon={ListChecks} label="Total lectures" value={totalLectures.toLocaleString()} tone="sky" />
        <StatCard
          icon={CheckCircle2}
          label="Completed lectures"
          value={completedLectures.toLocaleString()}
          tone="emerald"
        />
        <StatCard icon={TrendingUp} label="Overall progress" value={`${overallPercent}%`} tone="amber" />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Overall syllabus completion</p>
          <p className="text-sm text-stone-500 tabular-nums dark:text-stone-400">
            {completedLectures.toLocaleString()} of {totalLectures.toLocaleString()} lectures done
            {totalLectures > 0 ? ` · ${remainingLectures.toLocaleString()} to go` : ''}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <div className="flex-1">
            <ProgressBar
              value={overallPercent}
              label="Overall syllabus completion"
              size="lg"
              complete={totalLectures > 0 && completedLectures >= totalLectures}
            />
          </div>
          <span className="w-12 text-right text-lg font-semibold tabular-nums">{overallPercent}%</span>
        </div>
      </div>
    </section>
  )
}
