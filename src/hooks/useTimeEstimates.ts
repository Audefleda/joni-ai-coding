'use client';

import { useState, useCallback, useMemo } from 'react';

export interface UseTimeEstimatesResult {
  estimates: Record<string, number>;
  setEstimate: (taskId: string, bubbles: number) => void;
  totalMinutes: number;
}

/**
 * In-memory state for time estimates per task.
 * Each estimate is a number 0–16 representing filled bubbles (each = 15 min).
 * State is lost on page reload (no persist in MVP).
 */
export function useTimeEstimates(taskIds: string[]): UseTimeEstimatesResult {
  const [estimates, setEstimates] = useState<Record<string, number>>({});

  const setEstimate = useCallback((taskId: string, bubbles: number) => {
    const clamped = Math.max(0, Math.min(16, bubbles));
    setEstimates((prev) => ({ ...prev, [taskId]: clamped }));
  }, []);

  const totalMinutes = useMemo(() => {
    return taskIds.reduce((sum, id) => sum + (estimates[id] ?? 0) * 15, 0);
  }, [taskIds, estimates]);

  return { estimates, setEstimate, totalMinutes };
}
