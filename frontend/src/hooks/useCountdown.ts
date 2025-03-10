import { getTimeRemaining } from '@/lib/utils';
import { TimeRemaining } from '@/types/Utils';
import { useEffect, useMemo, useRef, useState } from 'react';

export const useCountdown = (isoDate: string): TimeRemaining => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => getTimeRemaining(isoDate));
  const lastUpdateRef = useRef<TimeRemaining>(timeLeft);
  const isoDateRef = useRef(isoDate);
  const timeoutRef = useRef<number>(0);

  useEffect(() => {
    isoDateRef.current = isoDate;
    const newTime = getTimeRemaining(isoDate);
    setTimeLeft(newTime);
    lastUpdateRef.current = newTime;
  }, [isoDate]);

  useEffect(() => {
    if (timeLeft.expired || timeLeft.invalid) return;

    const update = () => {
      const newTime = getTimeRemaining(isoDateRef.current);

      if (
        newTime.hours !== lastUpdateRef.current.hours ||
        newTime.minutes !== lastUpdateRef.current.minutes ||
        newTime.seconds !== lastUpdateRef.current.seconds
      ) {
        setTimeLeft(newTime);
        lastUpdateRef.current = newTime;
      }

      const now = Date.now();
      const delay = 1000 - (now % 1000) + 5;
      timeoutRef.current = window.setTimeout(update, delay);
    };

    const initialDelay = 1000 - (Date.now() % 1000) + 5;
    timeoutRef.current = window.setTimeout(update, initialDelay);

    return () => {
      window.clearTimeout(timeoutRef.current);
    };
  }, [timeLeft.expired, timeLeft.invalid]);

  return useMemo(
    () => timeLeft,
    [timeLeft.hours, timeLeft.minutes, timeLeft.seconds, timeLeft.expired, timeLeft.invalid],
  );
};
