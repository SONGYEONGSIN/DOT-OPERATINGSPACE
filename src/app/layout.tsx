import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orchestrator System | 통합 운영 관리",
  description:
    "서비스 관리, 계약, 인수인계, AI 분석까지 — 차세대 통합 운영 관리 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className="dark h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=JSON.parse(localStorage.getItem("sentinelhub-theme")||"{}");var c=t&&t.state&&t.state.theme;if(c==="light"){document.documentElement.classList.remove("dark");document.documentElement.classList.add("light")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
