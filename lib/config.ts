export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("your-project-ref"));
}

/** Students sign in with their student code; Supabase Auth needs an email, so we derive one. */
export const STUDENT_EMAIL_DOMAIN = "student.local";

export function loginToEmail(login: string): string {
  const v = login.trim().toLowerCase();
  return v.includes("@") ? v : `${v}@${STUDENT_EMAIL_DOMAIN}`;
}

export const COURSE = {
  code: "31910-2028",
  nameTh: "การพาณิชย์บนสื่อสังคมออนไลน์",
  nameEn: "Social Media for Commerce",
  credits: "ทฤษฎี 2 ชม. ปฏิบัติ 2 ชม. 3 หน่วยกิต",
  college: "วิทยาลัยอาชีวศึกษาภาวนาโพธิคุณ",
  level: "ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)",
  standard: "มาตรฐานคุณวุฒิวิชาชีพ สถาบันคุณวุฒิวิชาชีพ (องค์การมหาชน) รหัส 1023 อาชีพนักพาณิชย์อิเล็กทรอนิกส์ ระดับ 5",
  outcome: "ทำธุรกิจออนไลน์ด้วยระบบพาณิชย์บนสื่อสังคมออนไลน์ด้วยความละเอียด รอบคอบ",
  objectives: [
    "เข้าใจเกี่ยวกับหลักการพาณิชย์บนสื่อสังคมออนไลน์",
    "มีทักษะในการจัดการระบบพาณิชย์บนสื่อสังคมออนไลน์",
    "มีความสามารถประยุกต์ใช้ระบบพาณิชย์บนสื่อสังคมออนไลน์ทางธุรกิจ",
    "มีเจตคติและกิจนิสัยที่ดีในการปฏิบัติงานด้วยความละเอียด รอบคอบ",
  ],
  competencies: [
    "ประมวลความรู้เกี่ยวกับการพาณิชย์บนสื่อสังคมออนไลน์ตามหลักการ",
    "จัดการระบบพาณิชย์บนสื่อสังคมออนไลน์ทางธุรกิจ",
    "ประยุกต์ใช้ระบบพาณิชย์บนสื่อสังคมออนไลน์ทางธุรกิจ",
  ],
  description:
    "ศึกษาและปฏิบัติเกี่ยวกับหลักการพาณิชย์บนสื่อสังคมออนไลน์ ระบบการชำระเงิน ระบบการส่งสินค้า บริการหลังการขาย การจัดการคลังสินค้า การจัดอันดับเว็บไซต์ (SEO) การใช้เครื่องมือดิจิทัล ขั้นตอนการวางแผนสำหรับกิจกรรมธุรกิจอีคอมเมิร์ซ ประยุกต์ใช้พาณิชย์บนสื่อสังคมออนไลน์ทางธุรกิจ",
} as const;
