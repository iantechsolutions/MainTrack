import { NextResponse } from "next/server";
/* import { Stripe } from 'stripe';
import { env } from "~/env";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30.acacia"
}); */

export async function POST(/* req: Request */) {
  /* const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event | null = null;
  try {
    event = stripe.webhooks.constructEvent(payload, signature!, env.STRIPE_WEBHOOK_SECRET);
    switch (event?.type) {
      case "payment_intent.succeeded":
        // handle payment_intent.succeded
        break;
      case "account.updated":
        // handle other type of stripe events
        break;
      default:
        // other events that we don't handle
        break;
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
  } */

  return NextResponse.json({ received: true });
}
