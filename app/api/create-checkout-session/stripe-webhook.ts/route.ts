import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import admin from "firebase-admin";

// Initialize Stripe with your secret key and sandbox API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const firestore = admin.firestore();

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  // Read raw body as text
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // The user ID you set on session creation (Firebase UID)
    const userId = session.client_reference_id;

    if (!userId) {
      return NextResponse.json({ error: "Missing client_reference_id in session" }, { status: 400 });
    }

    try {
      const userDocRef = firestore.collection("users").doc(userId);

      if (session.mode === "subscription") {
        await userDocRef.update({
          subscriptionActive: true,
          subscriptionDate: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else if (session.mode === "payment") {
        await userDocRef.update({
          courseBought: true,
          coursePurchaseDate: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (e) {
      return NextResponse.json({ error: `Failed to update Firestore: ${(e as Error).message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
