"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-green-50 dark:bg-green-900 text-green-900 dark:text-green-200">
      <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
      <p className="mb-4">Thank you for your purchase.</p>
      {sessionId && (
        <p className="text-sm break-all mb-8">
          Session ID: <code>{sessionId}</code>
        </p>
      )}

      <button
        onClick={() => router.push("/")}
        className="px-6 py-2 rounded bg-green-700 hover:bg-green-800 text-white transition"
      >
        Go Back Home
      </button>
    </main>
  );
}
