import React from "react";
import "@/public/global.css";
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: "Starter", // ← This sets the bookmark title
  description: "owenomc-starter", // ← This sets the bookmark description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Analytics/>
      <body
      >
        {children}
      </body>
    </html>
  );
}
