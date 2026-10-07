import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { COURSE } from "@/lib/config";

export const metadata: Metadata = {
  title: `${COURSE.code} ${COURSE.nameTh} | ${COURSE.college}`,
  description: `${COURSE.nameTh} (${COURSE.nameEn}) หลักสูตร ปวส. ${COURSE.college} อ้างอิงมาตรฐานคุณวุฒิวิชาชีพ รหัส 1023 อาชีพนักพาณิชย์อิเล็กทรอนิกส์ ระดับ 5`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Sarabun',sans-serif] antialiased transition-colors">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
