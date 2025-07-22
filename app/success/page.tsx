"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function CancelPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-red-50 dark:bg-red-900 text-red-900 dark:text-red-200">
      <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
      <p className="mb-4">Your payment was not completed.</p>
      <button
        onClick={() => router.push("/")}
        className="px-6 py-2 rounded bg-red-700 hover:bg-red-800 text-white transition"
      >
        Go Back Home
      </button>
    </main>
  );
}
