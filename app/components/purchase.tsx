"use client";

import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { auth } from "../lib/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PurchaseProps = {
  priceId: string;
  label: string;
};

const Purchase: React.FC<PurchaseProps> = ({ priceId, label }) => {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
    });
    return () => unsub();
  }, []);

  const handleClick = async () => {
    if (!uid) {
      alert("Please sign in before purchasing.");
      return;
    }

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/cancel`,
          userId: uid,
        }),
      });

      const data = await res.json();

      if (data.sessionId) {
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Stripe failed to load");
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        alert("Failed to create checkout session: " + data.error);
      }
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
    >
      {label}
    </button>
  );
};

export default Purchase;
