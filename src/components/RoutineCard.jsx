export default function RoutineCard({ title, items, accent }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
      <div className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${accent}`}>{title}</div>
      <ul className="mt-4 space-y-3 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
