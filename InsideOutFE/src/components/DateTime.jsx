import React, { useEffect, useState } from "react";

function DateTime() {
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const formatted = new Intl.DateTimeFormat("en-PH", {
        timeZone: "Asia/Manila",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(now);

      setDateTime(formatted);
    };

    updateTime(); // initial call
    const interval = setInterval(updateTime, 1000); // update every second

    return () => clearInterval(interval);
  }, []);

    return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
            <p className="text-lg font-bold text-slate-700 tracking-tight tabular-nums">
              {dateTime}
            </p>
          </div>
        </div>
      );
    }

export default DateTime;
