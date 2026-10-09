"use client";
import { useState } from "react";
export function SaveSimulation({ data }: { data: unknown }) {
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [saved,setSaved]=useState(false);
  async function save(){setBusy(true);setMessage("");try{const res=await fetch("/api/simulations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const result=await res.json();if(!res.ok)throw Error(result.error);setMessage(`บันทึกผล ${result.score}/100 ในระบบแล้ว`);setSaved(true);}catch(e){setMessage(e instanceof Error?e.message:"บันทึกไม่สำเร็จ");}finally{setBusy(false);}}
  return <div className="my-4"><button className="bg-orange-600 text-white rounded-xl px-4 py-2" disabled={busy||saved} onClick={()=>void save()}>{busy?"กำลังบันทึก...":saved?"บันทึกแล้ว":"บันทึกผลกิจกรรม"}</button>{message&&<p role="status" className="mt-2">{message}</p>}</div>;
}
