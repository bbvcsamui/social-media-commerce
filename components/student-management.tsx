"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";

type Student = { id: string; student_code: string; full_name: string; must_change_password: boolean };
type Result = { student_code: string; full_name: string; status: string; password?: string; error?: string };
const endpoint = "/api/teacher/students";
const inputClass = "border rounded-lg p-2 bg-white dark:bg-slate-800 w-full";
const buttonClass = "px-4 py-2 rounded-lg bg-orange-600 text-white disabled:opacity-50";

export function StudentManagement() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);
  const [confirmCode, setConfirmCode] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStudents(data.students);
    } catch (e) { setMessage(e instanceof Error ? e.message : "โหลดรายชื่อไม่สำเร็จ"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  function download(filename: string, rows: Record<string, string>[]) {
    const url = URL.createObjectURL(new Blob(["\uFEFF" + Papa.unparse(rows, { escapeFormulae: true })], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
  }
  async function write(method: string, body: unknown) {
    const response = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw new Error([data.error, ...(data.errors || [])].join("\n"));
    return data;
  }
  async function importCsv(value: string) {
    setBusy(true); setMessage("");
    try {
      const parsed = Papa.parse<Record<string, string>>(value.replace(/^\uFEFF/, ""), { header: true, skipEmptyLines: "greedy", transformHeader: h => h.trim().toLowerCase() });
      const seen = new Set<string>();
      if (parsed.errors.length || !parsed.data.length || parsed.data.length > 500) throw Error("ไฟล์ต้องมีข้อมูลถูกต้อง 1–500 คน");
      for (const [index, row] of parsed.data.entries()) {
        const code = (row.student_code || "").trim();
        if (!/^\d{5,20}$/.test(code) || !(row.full_name || "").trim() || row.full_name.length > 200) throw Error(`แถว ${index+2}: กรุณาตรวจรหัสและชื่อ`);
        if (seen.has(code)) throw Error(`รหัส ${code} ซ้ำในไฟล์ กรุณาแก้ก่อนนำเข้า`);
        seen.add(code);
      }
      const all: Result[] = [];
      for (let index = 0; index < parsed.data.length; index += 25) {
        setMessage(`กำลังนำเข้า ${index + 1}–${Math.min(index + 25, parsed.data.length)} จาก ${parsed.data.length} คน`);
        const data = await write("POST", { csv: Papa.unparse(parsed.data.slice(index, index+25)) });
        all.push(...data.results);
        setResults(previous => [...previous.filter(r => r.status === "created"), ...data.results]);
      }
      const created = all.filter(r => r.status === "created").length;
      const skipped = all.filter(r => r.status === "skipped").length;
      const failed = all.filter(r => r.status === "failed").length;
      setMessage(`เพิ่มสำเร็จ ${created} คน · มีอยู่แล้ว ${skipped} คน · ไม่สำเร็จ ${failed} คน`);
      if (!failed) { setCsv(""); setPreview([]); setCode(""); setName(""); }
      await load();
      router.refresh();
    } catch (e) { setMessage(e instanceof Error ? e.message : "นำเข้าไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  async function chooseFile(file?: File) {
    setCsv(""); setPreview([]); setMessage("");
    if (!file) return;
    if (file.size > 500_000) { setMessage("ไฟล์ต้องมีขนาดไม่เกิน 500 KB"); return; }
    try {
      const buffer = await file.arrayBuffer();
      let value: string;
      try { value = new TextDecoder("utf-8", { fatal: true }).decode(buffer); }
      catch { value = new TextDecoder("windows-874").decode(buffer); }
      const parsed = Papa.parse<Record<string, string>>(value.replace(/^\uFEFF/, ""), { header: true, skipEmptyLines: "greedy", transformHeader: h => h.trim().toLowerCase() });
      if (parsed.errors.length || !parsed.meta.fields?.includes("student_code") || !parsed.meta.fields?.includes("full_name")) throw new Error("ไฟล์ CSV ต้องมีหัวคอลัมน์ student_code,full_name และข้อมูลครบทุกแถว");
      if (!parsed.data.length || parsed.data.length > 500) throw new Error("นำเข้าได้ครั้งละ 1–500 คน");
      setCsv(value); setPreview(parsed.data);
    } catch (e) { setMessage(e instanceof Error ? e.message : "อ่านไฟล์ไม่สำเร็จ"); }
  }
  async function saveEdit(event: React.FormEvent) {
    event.preventDefault(); if (!editing) return; setBusy(true); setMessage("");
    try { await write("PATCH", { id: editing.id, full_name: editing.full_name }); setEditing(null); setMessage("บันทึกชื่อแล้ว"); await load(); }
    catch (e) { setMessage(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!deleting || confirmCode !== deleting.student_code) return; setBusy(true); setMessage("");
    try { await write("DELETE", { id: deleting.id, student_code: confirmCode }); setDeleting(null); setConfirmCode(""); setMessage("ลบบัญชีแล้ว"); await load(); }
    catch (e) { setMessage(e instanceof Error ? e.message : "ลบไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  return <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 mb-8">
    <h2 className="text-xl font-bold">จัดการรายชื่อนักศึกษา</h2>
    <p className="text-sm text-slate-500">สร้างบัญชีจากรหัสนักศึกษา พร้อมรหัสผ่านสุ่มรายบุคคล นักศึกษาต้องเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก</p>
    {message && <p role="status" className="whitespace-pre-line p-3 bg-orange-50 dark:bg-orange-950 rounded">{message}</p>}
    <form onSubmit={e => { e.preventDefault(); void importCsv(Papa.unparse([{ student_code: code, full_name: name }])); }} className="flex flex-wrap gap-3 items-end">
      <label>รหัสนักศึกษา<input className={inputClass} required pattern="[0-9]{5,20}" value={code} onChange={e => setCode(e.target.value)} /></label>
      <label>ชื่อ-นามสกุล<input className={inputClass} required maxLength={200} value={name} onChange={e => setName(e.target.value)} /></label>
      <button className={buttonClass} disabled={busy || loading}>เพิ่มนักศึกษา</button>
    </form>
    <div className="flex flex-wrap gap-3 items-center">
      <label>นำเข้า CSV <input type="file" accept=".csv" disabled={busy} onChange={e => { void chooseFile(e.target.files?.[0]); e.target.value = ""; }} /></label>
      <button type="button" className="underline" onClick={() => download("students-template.csv", [{ student_code: "69319100001", full_name: "ชื่อ นามสกุล" }])}>ดาวน์โหลดตัวอย่าง CSV</button>
    </div>
    {preview.length > 0 && <div className="space-y-2">
      <p>พบ {preview.length} รายชื่อ รหัสที่มีอยู่แล้วจะข้ามโดยไม่เปลี่ยนรหัสผ่าน</p>
      <ul>{preview.slice(0, 5).map((row, i) => <li key={i}>{row.student_code} · {row.full_name}</li>)}</ul>
      <button className={buttonClass} disabled={busy} onClick={() => void importCsv(csv)}>{busy ? "กำลังนำเข้า..." : "ยืนยันนำเข้ารายชื่อ"}</button>
    </div>}
    {results.length > 0 && <div className="space-y-2">
      {results.some(r => r.status === "created") && <><p>ดาวน์โหลดรหัสผ่านเริ่มต้นเพื่อส่งให้นักศึกษาแต่ละคน ข้อมูลนี้จะแสดงเฉพาะครั้งนี้</p><button className={buttonClass} onClick={() => download("student-credentials.csv", results.filter(r => r.status === "created").map(r => ({ student_code: r.student_code, full_name: r.full_name, password: r.password! })))}>ดาวน์โหลดบัญชีและรหัสผ่านเริ่มต้น</button></>}
      {results.filter(r => r.status === "failed").map(r => <p key={r.student_code} className="text-red-600">{r.student_code}: {r.error}</p>)}
    </div>}
    <div className="flex gap-3 items-center"><input aria-label="ค้นหารายชื่อนักศึกษา" className={inputClass} placeholder="ค้นหารหัสหรือชื่อ..." value={search} onChange={e => setSearch(e.target.value)} /><button disabled={busy} onClick={() => void load()}>รีเฟรช</button></div>
    <p>นักศึกษาในระบบ {students.length} คน</p>
    {loading ? <p>กำลังโหลดรายชื่อ...</p> : <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr><th className="p-2">รหัสนักศึกษา</th><th>ชื่อ-นามสกุล</th><th>สถานะรหัสผ่าน</th><th>จัดการ</th></tr></thead><tbody>
      {students.filter(s => s.student_code.includes(search) || s.full_name.includes(search)).map(s => <tr key={s.id} className="border-t"><td className="p-2">{s.student_code}</td><td>{s.full_name}</td><td>{s.must_change_password ? "รอเปลี่ยนรหัสผ่านครั้งแรก" : "พร้อมใช้งาน"}</td><td className="space-x-3"><button disabled={busy} onClick={() => setEditing({ ...s })}>แก้ไขชื่อ</button><button disabled={busy} className="text-red-600" onClick={() => { setDeleting(s); setConfirmCode(""); }}>ลบบัญชี</button></td></tr>)}
    </tbody></table>{!students.length && <p className="p-3">ยังไม่มีนักศึกษา กรุณาเพิ่มหรือนำเข้า CSV</p>}</div>}
    {editing && <form onSubmit={saveEdit} className="border rounded p-4 space-y-3"><p>แก้ไขชื่อ {editing.student_code}</p><input aria-label="ชื่อใหม่" className={inputClass} required maxLength={200} value={editing.full_name} onChange={e => setEditing({ ...editing, full_name: e.target.value })} /><button disabled={busy} className={buttonClass}>บันทึก</button><button type="button" disabled={busy} onClick={() => setEditing(null)} className="ml-3">ยกเลิก</button></form>}
    {deleting && <div className="border border-red-300 rounded p-4 space-y-3"><p>ลบบัญชี {deleting.full_name} พร้อมคะแนนและงานที่บันทึกไว้ การลบกู้คืนไม่ได้</p><label>พิมพ์รหัส {deleting.student_code} เพื่อยืนยัน<input className={inputClass} value={confirmCode} onChange={e => setConfirmCode(e.target.value)} /></label><button className={buttonClass} disabled={busy || confirmCode !== deleting.student_code} onClick={() => void remove()}>ยืนยันลบบัญชี</button><button disabled={busy} onClick={() => setDeleting(null)} className="ml-3">ยกเลิก</button></div>}
  </section>;
}
