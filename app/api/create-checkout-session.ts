import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getUserFromSupabase } from '@/app/lib/supabaseServer'; // your helper to get user

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. Authenticate user session (using your Supabase helper)
    const user = await getUserFromSupabase(req, res);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // 2. Create Stripe Checkout Session
    // Replace 'price_XXX' with your actual Stripe Price ID for the $50 course
    const priceId = process.env.NEXT_PUBLIC_STRIPE_COURSE_PRICE_ID!; 

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email, // prefill user email for Stripe
      metadata: {
        supabase_user_id: user.id,
        product_id: 'prod_SisWXchuWDJnhm',
      },
      // Embedded Checkout mode
      ui_mode: 'embedded',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout-cancel`,
    });

    return res.status(200).json({ clientSecret: session.client_secret });
  } catch (error: unknown) {
    console.error('Stripe Checkout session error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal Server Error' });
  }
}
