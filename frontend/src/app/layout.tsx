import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TV.RuslanMV - Technical Broadcasting",
  description: "TV.RuslanMV - Educational broadcasting for AI, Data Science, and Cloud Architecture."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-primary text-text font-sans antialiased flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  );
}
