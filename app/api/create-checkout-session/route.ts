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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment", // or "subscription" if you want subscription products
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe create-checkout-session error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
