'use client';

import { useSearchParams } from "next/navigation";

export function LogoutNotice() {
  const params = useSearchParams();
  const done = params.get("logout") === "done";
  if (!done) return null;
  return (
    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
      ログアウトしました。再度連携するときはホームからGoogle連携してください。
    </div>
  );
}
