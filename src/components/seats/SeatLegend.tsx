const LEGEND_ITEMS = [
  {
    label: "Standard",
    className: "bg-zinc-700 border border-zinc-600",
    note: "Base price",
  },
  {
    label: "Premium",
    className: "bg-blue-900 border border-blue-700",
    note: "1.3×",
  },
  {
    label: "Recliner",
    className: "bg-amber-900 border border-amber-700",
    note: "1.5×",
  },
  {
    label: "Selected",
    className: "bg-violet-600 border-2 border-violet-400 scale-110",
    note: "Your pick",
  },
  {
    label: "Held",
    className: "bg-zinc-800 border border-zinc-700 opacity-50",
    note: "Someone else",
  },
  {
    label: "Sold",
    className: "bg-zinc-900 border border-zinc-800 opacity-30",
    note: "Not available",
  },
];

export function SeatLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 pt-2">
      {LEGEND_ITEMS.map(({ label, className, note }) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`w-6 h-5 rounded-t-md rounded-b-sm ${className} shrink-0`}
          />
          <div className="text-left">
            <p className="text-xs text-zinc-300 leading-none">{label}</p>
            <p className="text-[10px] text-zinc-500 leading-none mt-0.5">{note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
