import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { colorForSubject } from '../../lib/subjectColors'
import EmptyState from '../../components/ui/EmptyState'
import { ClipboardIcon } from '../../components/icons'

function Dot({ cx, cy, stroke }) {
  if (cx == null || cy == null) return null
  return <circle cx={cx} cy={cy} r={4} fill={stroke} stroke="#fff" strokeWidth={2} />
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-card-lg">
      <p className="mb-1 text-xs font-semibold text-slate-700">{label}</p>
      <div className="flex flex-col gap-0.5">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: p.stroke }} />
            <span className="text-slate-500">{p.dataKey}</span>
            <span className="font-semibold text-slate-800">{p.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MarksChart({ marks }) {
  const { data, subjects } = useMemo(() => {
    const sorted = [...marks].sort((a, b) => (a.date?.seconds || 0) - (b.date?.seconds || 0))
    const examOrder = []
    const byExam = new Map()
    const subjectSet = new Set()

    for (const m of sorted) {
      subjectSet.add(m.subject)
      if (!byExam.has(m.examName)) {
        byExam.set(m.examName, { exam: m.examName })
        examOrder.push(m.examName)
      }
      byExam.get(m.examName)[m.subject] = Math.round((m.marksObtained / m.totalMarks) * 100)
    }

    return { data: examOrder.map((e) => byExam.get(e)), subjects: Array.from(subjectSet) }
  }, [marks])

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardIcon className="h-6 w-6" />}
        title="Not enough data yet"
        description="A performance trend will appear once marks are entered."
      />
    )
  }

  return (
    <div>
      {subjects.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1.5">
          {subjects.map((s) => (
            <div key={s} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorForSubject(s) }} />
              {s}
            </div>
          ))}
        </div>
      )}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e1e0d9" strokeWidth={1} />
            <XAxis
              dataKey="exam"
              tick={{ fontSize: 11, fill: '#898781' }}
              tickLine={false}
              axisLine={{ stroke: '#c3c2b7' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#898781' }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip content={<ChartTooltip />} />
            {subjects.map((s) => (
              <Line
                key={s}
                type="monotone"
                dataKey={s}
                stroke={colorForSubject(s)}
                strokeWidth={2}
                dot={<Dot />}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
