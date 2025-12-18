'use client';

import { useEffect, useState } from "react";

const storageKey = "morning-brief-note";

export function MemoCard() {
  const [note, setNote] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(storageKey) ?? "";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, note);
  }, [note]);

  return (
    <div className="flex flex-col rounded-3xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-xl sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">
            Focus
          </p>
          <h3 className="text-lg font-semibold text-white">朝のメモ</h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/80">
          ローカル保存
        </span>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="今日のフォーカス、持ち物、連絡したい人などをメモ"
        className="min-h-[140px] resize-none rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/90 outline-none ring-2 ring-transparent transition focus:ring-white/20 sm:min-h-[180px]"
      />
    </div>
  );
}
