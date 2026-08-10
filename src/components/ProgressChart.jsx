import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { getAnalysisHistory } from '../utils/skincareStorage'

export default function ProgressChart() {
  const history = getAnalysisHistory()
  const chartData = history.length > 0
    ? [...history].reverse().map((item) => {
        const dateObj = new Date(item.date)
        const dayLabel = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })
        const scoreVal = Math.round((item.confidenceValue || 0.9) * 100)
        return {
          name: dayLabel,
          score: scoreVal,
          disease: item.disease,
        }
      })
    : [
        { name: 'Mon', score: 75, disease: 'Initial' },
        { name: 'Wed', score: 82, disease: 'Improving' },
        { name: 'Fri', score: 88, disease: 'Barrier Calmer' },
        { name: 'Sun', score: 92, disease: 'Optimal' },
      ]

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <p className="text-base font-bold text-slate-900">Skin Barrier Progression Chart</p>
          <p className="text-xs text-slate-500">Historical AI prediction score trajectory</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">+8% Trend</div>
      </div>
      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis domain={[50, 100]} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              formatter={(value, name, props) => [`${value}% Score`, `Condition: ${props.payload.disease}`]}
            />
            <Area type="monotone" dataKey="score" stroke="#10b981" fill="url(#scoreGradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
