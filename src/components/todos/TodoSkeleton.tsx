const skeletonWidths = ['w-3/5', 'w-3/4', 'w-[90%]'];

export default function TodoSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-start gap-4 overflow-hidden rounded-xl border border-zinc-100 p-4 dark:border-zinc-800"
        >
          <div className="mt-0.5 h-4 w-1 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex flex-1 flex-col gap-2">
            <div className={`h-4 rounded bg-zinc-200 dark:bg-zinc-700 ${skeletonWidths[i % 3]}`} />
            <div className="h-3 w-1/3 rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
