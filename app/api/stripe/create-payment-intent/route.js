// app/api/stripe/create-payment-intent/route.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  console.log("inside create-payment-intent");
  const { email, amount } = await req.json();

  try {
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents (e.g., $10.00 -> 1000)
      currency: "usd",
      receipt_email: email, // Send a receipt to the user
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// ... existing code for handling other methods (if needed) ...
