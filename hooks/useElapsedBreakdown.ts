import { useEffect, useMemo, useState } from 'react';

import { getElapsedBreakdown } from '@/utils/tracker';

const SECOND_MS = 1000;

export const useElapsedBreakdown = (startedAt: string, parts: number = 3) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = setInterval(update, SECOND_MS);
    return () => clearInterval(timer);
  }, [startedAt]);

  return useMemo(() => {
    const elapsedMs = Math.max(0, now - new Date(startedAt).getTime());
    return getElapsedBreakdown(elapsedMs, parts);
  }, [now, parts, startedAt]);
};
