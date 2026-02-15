import { useState, useEffect } from "react";
import { formatRemainingTime } from "../utils";

/**
 * Custom hook that provides a live countdown timer
 * @param endDate - The target date to count down to
 * @returns The formatted countdown string that updates every second
 */
export function useCountdown(endDate: Date | null): string {
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    if (!endDate) {
      setCountdown("");
      return;
    }

    // Update immediately
    setCountdown(formatRemainingTime(endDate));

    // Update every second
    const interval = setInterval(() => {
      setCountdown(formatRemainingTime(endDate));
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [endDate]);

  return countdown;
}

