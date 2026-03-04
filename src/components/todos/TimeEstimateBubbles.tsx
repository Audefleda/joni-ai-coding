'use client';

const TOTAL_BUBBLES = 16;
const BUBBLES_PER_ROW = 8;
const MINUTES_PER_BUBBLE = 15;

interface TimeEstimateBubblesProps {
  taskId: string;
  filled: number;
  onEstimate: (taskId: string, bubbles: number) => void;
}

function formatEstimate(filled: number): string {
  if (filled === 0) return '0 Min';
  const totalMinutes = filled * MINUTES_PER_BUBBLE;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} Min`;
  if (minutes === 0) return `${hours} Std`;
  return `${hours} Std ${minutes} Min`;
}

export default function TimeEstimateBubbles({ taskId, filled, onEstimate }: TimeEstimateBubblesProps) {
  function handleClick(index: number) {
    // If clicking the last filled bubble, reset to 0
    if (index + 1 === filled) {
      onEstimate(taskId, 0);
    } else {
      // Fill up to and including the clicked bubble
      onEstimate(taskId, index + 1);
    }
  }

  const bubbles = Array.from({ length: TOTAL_BUBBLES }, (_, i) => i);
  const row1 = bubbles.slice(0, BUBBLES_PER_ROW);
  const row2 = bubbles.slice(BUBBLES_PER_ROW);

  return (
    <div className="mt-2 flex flex-col gap-1">
      <div className="flex gap-1" role="group" aria-label="Zeitschätzung">
        {row1.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(i)}
            aria-label={`${(i + 1) * MINUTES_PER_BUBBLE} Minuten`}
            aria-pressed={i < filled}
            className={`h-3.5 w-3.5 shrink-0 rounded-full border transition-colors md:h-3 md:w-3 ${
              i < filled
                ? 'border-zinc-600 bg-zinc-700 dark:border-zinc-300 dark:bg-zinc-300'
                : 'border-zinc-300 bg-transparent hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500'
            }`}
          />
        ))}
      </div>
      <div className="flex gap-1" role="group" aria-label="Zeitschätzung Reihe 2">
        {row2.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(i)}
            aria-label={`${(i + 1) * MINUTES_PER_BUBBLE} Minuten`}
            aria-pressed={i < filled}
            className={`h-3.5 w-3.5 shrink-0 rounded-full border transition-colors md:h-3 md:w-3 ${
              i < filled
                ? 'border-zinc-600 bg-zinc-700 dark:border-zinc-300 dark:bg-zinc-300'
                : 'border-zinc-300 bg-transparent hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {formatEstimate(filled)}
      </p>
    </div>
  );
}
