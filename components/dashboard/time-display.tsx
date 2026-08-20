"use client";

import { useEffect, useState } from "react";

export function TimeDisplay() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setNow(new Date());

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  return (
    <div className="px-4 pb-4 text-sidebar-foreground">
      <div className="text-2xl font-semibold tracking-tight">
        {now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>

      <div className="text-xs text-sidebar-foreground/60">
        {now.toLocaleDateString([], {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
    </div>
  );
}
