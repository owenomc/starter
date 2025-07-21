import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: Request) {
  const body = await req.text();

  // Await headers() so we can access .get()
  const hdrs = await headers();
  const sig = hdrs.get('stripe-signature');

  if (!sig) {
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.supabase_user_id;

    if (userId) {
      await supabaseAdmin
        .from('purchases')
        .insert({
          user_id: userId,
          product_id: session.metadata?.product_id,
          stripe_session_id: session.id,
          amount: session.amount_total,
          status: 'paid',
        });
    }
  }

  return new Response('ok', { status: 200 });
}
