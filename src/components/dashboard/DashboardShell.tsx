import DashboardHeader from './DashboardHeader';
import CalendarWidget from '@/components/calendar/CalendarWidget';
import TodosZone from '@/components/todos/TodosZone';
import NotionZone from './NotionZone';

interface DashboardShellProps {
  apiKey: string;
}

export default function DashboardShell({ apiKey }: DashboardShellProps) {
  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header spanning full width */}
      <div className="shrink-0 border-b border-zinc-100 px-4 py-4 dark:border-zinc-800 md:px-6 lg:px-8">
        <DashboardHeader />
      </div>

      {/* Main content: 3-zone layout */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:grid md:grid-cols-[1fr_2fr] md:grid-rows-[3fr_2fr] md:p-6 lg:p-8">
        {/* Zone A: Calendar (left column on desktop, second on mobile) */}
        <aside
          className="order-2 min-h-0 overflow-y-auto rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:order-1 md:row-span-2"
          aria-label="Kalender-Zone"
        >
          <CalendarWidget />
        </aside>

        {/* Zone B: Todos (right-top on desktop, first on mobile) */}
        <div className="order-1 min-h-0 overflow-y-auto rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:order-2">
          <TodosZone apiKey={apiKey} />
        </div>

        {/* Zone C: Notion placeholder (right-bottom on desktop, third on mobile) */}
        <div className="order-3 min-h-0 md:order-3">
          <NotionZone />
        </div>
      </div>
    </div>
  );
}
