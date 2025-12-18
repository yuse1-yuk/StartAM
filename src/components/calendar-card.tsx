'use client';

import { useEffect, useState } from "react";

type CalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end?: string;
  allDay: boolean;
  location?: string;
};

type CalendarState =
  | { status: "loading" | "ready" }
  | { status: "unauthorized" }
  | { status: "error"; message: string };

const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
});

export function CalendarCard() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [state, setState] = useState<CalendarState>({ status: "loading" });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/calendar", {
          cache: "no-store",
          credentials: "include", // ensure cookies (g_tokens) are sent
        });
        if (res.status === 401) {
          setState({ status: "unauthorized" });
          return;
        }
        if (!res.ok) throw new Error("イベントの取得に失敗しました");

        const payload = await res.json();
        setEvents(payload.events ?? []);
        setState({ status: "ready" });
      } catch (error) {
        console.error(error);
        setState({ status: "error", message: "読み込みに失敗しました" });
      }
    };

    fetchEvents();
  }, []);

  const goToAuth = () => {
    window.location.href = "/api/google/auth";
  };

  return (
    <div className="flex flex-col rounded-3xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-xl sm:p-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">
            Calendar
          </p>
          <h3 className="text-lg font-semibold text-white">今日の予定</h3>
        </div>
        {state.status === "unauthorized" ? (
          <button
            onClick={goToAuth}
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            連携する
          </button>
        ) : (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
            プライマリ
          </span>
        )}
      </header>

      <div className="space-y-3 sm:max-h-none sm:overflow-visible max-h-[45vh] overflow-auto pr-1">
        {state.status === "loading" && (
          <p className="text-sm text-white/70">予定を読み込み中...</p>
        )}
        {state.status === "error" && (
          <p className="text-sm text-red-100">{state.message}</p>
        )}
        {state.status === "unauthorized" && (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-white/80">
            <p className="text-sm font-semibold">Googleカレンダーと同期</p>
            <p className="text-xs text-white/60">
              接続すると今日の予定を自動で読み込みます。
            </p>
          </div>
        )}
        {state.status === "ready" && events.length === 0 && (
          <p className="text-sm text-white/70">今日は予定がありません。</p>
        )}
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white/90"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{event.summary || "（無題）"}</p>
              <span className="text-[11px] font-medium text-white/70">
                {formatEventTime(event)}
              </span>
            </div>
            {event.location && (
              <p className="mt-1 text-xs text-white/60">{event.location}</p>
            )}
          </div>
        ))}
      </div>

      {state.status === "unauthorized" && (
        <button
          onClick={goToAuth}
          className="mt-4 w-full rounded-2xl border border-white/20 bg-white/90 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          Googleカレンダーに接続
        </button>
      )}
    </div>
  );
}

function formatEventTime(event: CalendarEvent) {
  if (event.allDay) return "終日";
  if (!event.start) return "時間未設定";

  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : undefined;

  if (!end || start.toDateString() !== end.toDateString()) {
    return `${timeFormatter.format(start)} 〜`;
  }

  return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}
