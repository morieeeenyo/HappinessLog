import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Happy Couple Points",
  description: "A couple app to collect happy moments and reach monthly goals"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
