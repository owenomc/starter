import React from "react";
import "@/public/global.css";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

export const metadata = {
  title: "Starter",
  description: "owenomc-starter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Load Stripe.js asynchronously before React hydration */}
        <Script
          src="https://js.stripe.com/basil/stripe.js"
          strategy="beforeInteractive"
          id="stripe-js"
        />
      </head>
      <Analytics />
      <body>{children}</body>
    </html>
  );
}
