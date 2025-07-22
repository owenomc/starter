// app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import admin from "firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// Initialize Firebase Admin (server-side)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const firestore = admin.firestore();

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Expand line items to know which product was purchased
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items.data.price.product"],
      });

      const userId = session.client_reference_id;
      const priceId = fullSession.line_items?.data[0]?.price?.id;

      if (userId && priceId) {
        const userRef = firestore.collection("users").doc(userId);

        const coursePriceId = process.env.STRIPE_COURSE_PRICE_ID!;
        const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID!;

        if (priceId === coursePriceId) {
          await userRef.update({ courseBought: true });
        } else if (priceId === subscriptionPriceId) {
          await userRef.update({
            subscriptionActive: true,
            subscriptionDate: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
      return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
