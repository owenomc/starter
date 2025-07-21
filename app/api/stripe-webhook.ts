import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'node:stream/consumers';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export const config = {
  api: { bodyParser: false }, // Required to verify raw body
};

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil', // Or '2022-11-15' if on Stripe v12
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const sig = req.headers['stripe-signature']!;
  const buf = await buffer(req);

  try {
    const event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const supabaseUserId = session.metadata?.supabase_user_id;
      const productId = session.metadata?.product_id;

      if (supabaseUserId && productId) {
        await supabaseAdmin.from('purchases').insert({
          user_id: supabaseUserId,
          product_id: productId,
          stripe_session_id: session.id,
          amount_paid: session.amount_total,
          currency: session.currency,
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    const error = err as Error;
    console.error('Webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
