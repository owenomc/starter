// app/api/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

export async function POST(req: Request) {
  try {
    const { priceId, successUrl, cancelUrl, mode, userId } = await req.json();

    if (!priceId || !successUrl || !cancelUrl || !userId) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    // Fetch the Price object to confirm it exists (and its type)
    const price = await stripe.prices.retrieve(priceId);
    if (!price || !price.id) {
      return NextResponse.json({ error: `Price not found: ${priceId}` }, { status: 400 });
    }

    // Determine mode if not passed explicitly
    const checkoutMode =
      mode || (price.recurring ? "subscription" : "payment");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: checkoutMode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId, // link to user for Firestore later
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
