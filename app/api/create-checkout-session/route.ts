import Stripe from 'stripe';
import { getUserFromSupabase } from '@/app/lib/supabaseServer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: Request) {
  try {
    const user = await getUserFromSupabase(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const priceId = process.env.STRIPE_COURSE_PRICE_ID!;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      metadata: { supabase_user_id: user.id, product_id: 'prod_SisWXchuWDJnhm' },
      ui_mode: 'embedded',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout-cancel`,
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), { status: 200 });
  } catch (error) {
    console.error('Stripe Checkout session error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
