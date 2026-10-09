"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="max-w-xl mx-auto p-8 space-y-4"><h1 className="text-xl font-bold">โหลดข้อมูลไม่สำเร็จ</h1><p>กรุณาตรวจการเชื่อมต่อแล้วลองอีกครั้ง หากยังพบปัญหาให้ติดต่ออาจารย์</p><button onClick={reset} className="bg-orange-600 text-white rounded p-3">ลองใหม่</button></main>;
}
