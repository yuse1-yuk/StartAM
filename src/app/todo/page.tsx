import { NavBar } from "@/components/nav";
import { TodoForm } from "@/components/todo-form";

export default function TodoPage() {
  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6 sm:px-6 sm:py-8">
        <NavBar />
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-white/70">
            ToDo
          </p>
          <h1 className="text-3xl font-semibold">明日のタスクを仕込む</h1>
          <p className="text-sm text-white/70">
            target_date の初期値は翌日です。今日以降のタスクを管理できます。
          </p>
        </header>
        <TodoForm />
      </div>
    </div>
  );
}
