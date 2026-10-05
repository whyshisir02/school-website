export default function Loading() {
  return <div role="status" aria-label="Loading admin page" className="space-y-6 animate-pulse">
    <div className="h-10 w-48 rounded-xl bg-slate-200" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-36 rounded-2xl bg-white" />)}</div>
    <div className="h-72 rounded-2xl bg-white" />
  </div>;
}
