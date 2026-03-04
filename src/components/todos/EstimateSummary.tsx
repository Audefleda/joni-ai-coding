interface EstimateSummaryProps {
  totalMinutes: number;
}

function formatTotal(totalMinutes: number): string {
  if (totalMinutes === 0) return '0 Min';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} Min`;
  if (minutes === 0) return `${hours} Std`;
  return `${hours} Std ${minutes} Min`;
}

const OVERLOAD_THRESHOLD = 8 * 60; // 8 hours in minutes

export default function EstimateSummary({ totalMinutes }: EstimateSummaryProps) {
  const isOverloaded = totalMinutes > OVERLOAD_THRESHOLD;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm font-medium ${
          isOverloaded
            ? 'text-red-600 dark:text-red-400'
            : 'text-zinc-600 dark:text-zinc-400'
        }`}
        role="status"
        aria-live="polite"
      >
        Heute geplant: {formatTotal(totalMinutes)}
      </span>
      {isOverloaded && (
        <span className="text-xs text-red-500 dark:text-red-400" aria-label="Warnung: Mehr als 8 Stunden geplant">
          Vorsicht: &gt;8h geplant
        </span>
      )}
    </div>
  );
}
