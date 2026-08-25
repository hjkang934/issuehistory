import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "해외 거래처 이슈 트래커",
  description: "해외 거래처 이슈 등록·추적 및 엑셀 다운로드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
