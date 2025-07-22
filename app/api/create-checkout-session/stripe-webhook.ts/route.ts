import { NextResponse } from "next/server";
import Stripe from "stripe";
import admin from "firebase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const firestore = admin.firestore();

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;

    if (userId) {
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 });

        const updates: Record<string, unknown> = {};

        for (const item of lineItems.data) {
          if (item.price?.id === process.env.STRIPE_PRICE_ID_COURSE) {
            updates.courseBought = true;
          }
          if (item.price?.id === process.env.STRIPE_PRICE_ID_SUBSCRIPTION) {
            updates.subscriptionActive = true;
            updates.subscriptionDate = admin.firestore.FieldValue.serverTimestamp();
          }
        }

        if (Object.keys(updates).length > 0) {
          const userDocRef = firestore.collection("users").doc(userId);
          await userDocRef.update(updates);
          console.log(`✅ Updated user ${userId} with`, updates);
        }
      } catch (err) {
        console.error("❌ Error updating Firestore:", err);
        return NextResponse.json({ error: "Failed to update Firestore" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
