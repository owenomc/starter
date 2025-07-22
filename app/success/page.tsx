"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function CancelPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-green-50 dark:bg-green-50 text-black-900 dark:text-black-200">
      <h1 className="text-4xl font-bold mb-4">Payment Success</h1>
      <p className="mb-4">Your payment has been proccessed.</p>
      <button
        onClick={() => router.push("/")}
        className="px-6 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white transition"
      >
        Go Back Home
      </button>
    </main>
  );
}
