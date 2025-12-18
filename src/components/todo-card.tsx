'use client';

import { useEffect, useState } from "react";

type Todo = { id: number; text: string; target_date: string };

export function TodoCard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/todos?date=today", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setTodos(data.todos ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: number) => {
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-xl text-white sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">
            ToDo
          </p>
          <h3 className="text-lg font-semibold">今日やること</h3>
        </div>
        <button
          onClick={load}
          className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/20"
        >
          更新
        </button>
      </div>

      {loading && <p className="text-sm text-white/70">読み込み中...</p>}
      {!loading && todos.length === 0 && (
        <p className="text-sm text-white/70">今日はタスクはありません。</p>
      )}
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm"
          >
            <span>{todo.text}</span>
            <button
              onClick={() => remove(todo.id)}
              className="text-[11px] text-white/60 hover:text-white"
            >
              完了
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
