import React, { useState, useRef } from 'react';

declare global {
  interface Window {
    Stripe?: (key: string) => {
      initEmbeddedCheckout: (opts: {
        fetchClientSecret: () => Promise<string>;
      }) => Promise<{ mount: (selector: string) => void; unmount?: () => void }>;
    };
  }
}

export default function BuyCourse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const checkoutRef = useRef<{ unmount?: () => void } | null>(null);

  const startCheckout = async () => {
    setError(null);
    setLoading(true);

    if (!window.Stripe) {
      setError('Stripe.js not loaded. Please check your script tag.');
      setLoading(false);
      return;
    }

    try {
      const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

      if (!stripe) {
        setError('Failed to initialize Stripe.');
        setLoading(false);
        return;
      }

      const fetchClientSecret = async () => {
        const res = await fetch('/api/create-checkout-session', { method: 'POST' });
        if (!res.ok) throw new Error('Failed to create checkout session');
        const data = await res.json();
        return data.clientSecret;
      };

      // If there's an existing checkout mounted, unmount it before remounting:
      if (checkoutRef.current?.unmount) {
        checkoutRef.current.unmount();
      }

      const checkout = await stripe.initEmbeddedCheckout({ fetchClientSecret });
      checkout.mount('#stripe-checkout-container');
      checkoutRef.current = checkout;
      setCheckoutStarted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Buy Course - $50</h2>

      {!checkoutStarted && (
        <button
          onClick={startCheckout}
          disabled={loading}
          style={{
            padding: '12px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            borderRadius: 6,
            backgroundColor: '#6772e5',
            color: 'white',
            border: 'none',
          }}
        >
          {loading ? 'Loading...' : 'Start Payment'}
        </button>
      )}

      {error && (
        <div style={{ color: 'red', marginTop: 10 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Checkout iframe container */}
      <div
        id="stripe-checkout-container"
        style={{
          minHeight: 400,
          marginTop: 20,
          border: '1px solid #ccc',
          borderRadius: 6,
          padding: 10,
          display: checkoutStarted ? 'block' : 'none',
        }}
      />
    </div>
  );
}
