"use client";

type OrderDateFilterProps = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

/** Date-range filter (desde/hasta) for the order history pages. */
export default function OrderDateFilter({
  from,
  to,
  onFromChange,
  onToChange,
}: OrderDateFilterProps) {
  const inputClassName =
    "mt-1 block rounded-md border border-gray-300 px-3 py-1.5 text-sm " +
    "text-gray-900 focus:border-indigo-500 focus:outline-none";

  return (
    <div className="mt-6 flex flex-wrap items-end gap-3">
      <label className="block text-sm font-medium text-gray-700">
        Desde
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => onFromChange(event.target.value)}
          className={inputClassName}
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Hasta
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => onToChange(event.target.value)}
          className={inputClassName}
        />
      </label>
      {from || to ? (
        <button
          type="button"
          onClick={() => {
            onFromChange("");
            onToChange("");
          }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Limpiar
        </button>
      ) : null}
    </div>
  );
}
