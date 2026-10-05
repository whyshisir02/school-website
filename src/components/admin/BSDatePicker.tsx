"use client";
import { useId, useState } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Modal from "@/components/Modal";
import { BS_FIRST_YEAR, BS_LAST_YEAR, BS_MONTH_NAMES, bsMonthDays, bsDateValue, todayBS } from "@/lib/bs-calendar";

export default function BSDatePicker({ label, value, onChange, disabled }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ year: BS_FIRST_YEAR, month: 0 });
  const selected = value ? value.split("-").map(Number) : null;
  const calendar = open ? bsMonthDays(view.year, view.month) : null;
  function show() {
    const today = todayBS();
    setView(selected ? { year: selected[0], month: selected[1] - 1 } : { year: today.year, month: today.month });
    setOpen(true);
  }
  function move(delta: number) {
    const index = view.year * 12 + view.month + delta;
    setView({ year: Math.floor(index / 12), month: index % 12 });
  }
  return <div className="min-w-0">
    <span id={id} className="text-sm font-medium">{label}</span>
    <button type="button" disabled={disabled} aria-haspopup="dialog" aria-expanded={open} aria-labelledby={`${id} ${id}-value`} onClick={show} className="mt-2 flex min-h-12 w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3 text-left text-sm disabled:opacity-50">
      <span id={`${id}-value`}>{selected ? `${selected[2]} ${BS_MONTH_NAMES[selected[1] - 1]} ${selected[0]}` : "Choose date"}</span><FiCalendar className="shrink-0 text-slate-500" />
    </button>
    {open && calendar && <Modal title={`${label} calendar`} onClose={() => setOpen(false)} className="!max-w-sm !p-4">
      <h2 className="mb-4 text-lg font-bold">{label}</h2>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Previous month" disabled={view.year === BS_FIRST_YEAR && view.month === 0} onClick={() => move(-1)} className="flex h-11 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30"><FiChevronLeft /></button>
        <select autoFocus aria-label="BS month" value={view.month} onChange={(e) => setView({ ...view, month: Number(e.target.value) })} className="h-11 min-w-0 flex-1 rounded-lg border bg-white px-2 text-sm">{BS_MONTH_NAMES.map((month, i) => <option key={month} value={i}>{month}</option>)}</select>
        <select aria-label="BS year" value={view.year} onChange={(e) => setView({ ...view, year: Number(e.target.value) })} className="h-11 rounded-lg border bg-white px-2 text-sm">{Array.from({ length: BS_LAST_YEAR - BS_FIRST_YEAR + 1 }, (_, i) => <option key={i} value={BS_FIRST_YEAR + i}>{BS_FIRST_YEAR + i}</option>)}</select>
        <button type="button" aria-label="Next month" disabled={view.year === BS_LAST_YEAR && view.month === 11} onClick={() => move(1)} className="flex h-11 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-30"><FiChevronRight /></button>
      </div>
      <div className="mt-4 grid grid-cols-7 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day} className="py-2 text-xs text-slate-500">{day}</span>)}
        {Array.from({ length: calendar.weekday }, (_, i) => <span key={`blank-${i}`} />)}
        {Array.from({ length: calendar.days }, (_, i) => {
          const date = bsDateValue(view.year, view.month, i + 1);
          return <button type="button" key={date} aria-label={`${i + 1} ${BS_MONTH_NAMES[view.month]} ${view.year} BS`} aria-pressed={date === value} onClick={() => { onChange(date); setOpen(false); }} className={`min-h-11 rounded-lg text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${date === value ? "bg-navy font-bold text-white" : "hover:bg-slate-100"}`}>{i + 1}</button>;
        })}
      </div>
      <div className="mt-3 flex items-center justify-between border-t pt-2">
        <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="min-h-11 px-2 text-sm underline">Clear date</button>
        <button type="button" onClick={() => setOpen(false)} className="min-h-11 px-3 text-sm font-semibold">Cancel</button>
      </div>
    </Modal>}
  </div>;
}
