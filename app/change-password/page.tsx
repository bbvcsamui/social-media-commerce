"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) return setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
    setLoading(true);
    try {
      const response = await fetch("/api/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (response.status === 401) { router.replace("/login"); return; }
      if (!response.ok) { setError(result.error || "บันทึกไม่สำเร็จ"); return; }
      router.replace(result.role === "teacher" ? "/teacher" : "/learn");
      router.refresh();
    } catch { setError("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่"); }
    finally { setLoading(false); }
  }
  return <main className="min-h-screen flex items-center justify-center p-6">
    <form onSubmit={submit} className="w-full max-w-md space-y-4">
      <h1 className="text-2xl font-bold">เปลี่ยนรหัสผ่าน</h1>
      <p>กรุณาตั้งรหัสผ่านส่วนตัวก่อนเข้าใช้งาน</p>
      <label className="block">รหัสผ่านใหม่
        <input className="block w-full border rounded p-3" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      <label className="block">ยืนยันรหัสผ่านใหม่
        <input className="block w-full border rounded p-3" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={e => setConfirmation(e.target.value)} />
      </label>
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <button disabled={loading} className="w-full bg-orange-600 text-white rounded p-3">{loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่าน"}</button>
    </form>
  </main>;
}
