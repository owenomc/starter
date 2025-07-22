// app/api/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(req: Request) {
  try {
    const { priceId, successUrl, cancelUrl, userId } = await req.json();

    if (!priceId || !successUrl || !cancelUrl || !userId) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    // Verify the price exists so Stripe won't 500 on a bad ID
    const price = await stripe.prices.retrieve(priceId).catch(() => null);
    if (!price) {
      return NextResponse.json({ error: `Price not found: ${priceId}` }, { status: 400 });
    }

    // Determine checkout mode based on price type
    const checkoutMode = price.recurring ? "subscription" : "payment";

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: checkoutMode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId, // Pass UID for webhook updates
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
