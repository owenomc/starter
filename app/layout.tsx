import React from "react";
import "@/public/global.css";

export const metadata = {
  title: "LogitechGProX", // ← This sets the bookmark title
  description: "Pure Power.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
