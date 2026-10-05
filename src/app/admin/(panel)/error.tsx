"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div role="alert" className="rounded-2xl border border-slate-200 bg-white p-8">
    <h1 className="text-xl font-bold">This page could not load</h1>
    <p className="my-3 text-slate-600">Check your connection and try again.</p>
    <button onClick={reset} className="btn-primary">Try again</button>
  </div>;
}
