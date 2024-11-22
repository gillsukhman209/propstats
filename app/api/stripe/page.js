"use client";
import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import axios from "axios";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const CheckoutForm = ({ email }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentStatus, setPaymentStatus] = useState("idle");
  email = "gillsukhman209@gmail.com"; // Replace with dynamic email as needed

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentStatus("processing");

    if (!stripe) {
      console.error("Stripe.js has not loaded yet.");
      setPaymentStatus("failed");
      return;
    }

    try {
      const { data } = await axios.post("/api/stripe/create-payment-intent", {
        email,
        amount: 100000, // Amount in cents ($100.00)
      });

      const { clientSecret, paymentIntentId } = data;
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        console.error("Payment failed:", result.error.message);
        setPaymentStatus("failed");
      } else if (result.paymentIntent.status === "succeeded") {
        setPaymentStatus("succeeded");

        await axios.post("/api/stripe/update-payment-status", {
          email,
          paymentId: paymentIntentId,
          paymentDate: new Date().toISOString(),
        });

        // Redirect to home page using window.location
        window.location.href = "/"; // Redirect to the home page
      }
    } catch (error) {
      console.error("Payment error:", error.message);
      setPaymentStatus("failed");
    }
  };

  // Custom styles for CardElement
  const cardElementOptions = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  return (
    <form
      onSubmit={handlePayment}
      className="max-w-lg mx-auto p-4 0 min-h-screen w-full"
    >
      <label className="block text-black text-lg mb-2">
        Card Details {paymentStatus}
      </label>
      <div className="p-4 bg-gray-100 rounded-md">
        <CardElement options={cardElementOptions} />
      </div>
      <button
        type="submit"
        disabled={!stripe || paymentStatus === "processing"}
        className="mt-4 shadow-2xl bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
      >
        {paymentStatus === "processing" ? "Processing..." : "Pay $100"}
      </button>
    </form>
  );
};

const OneTimePayment = ({ email }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm email={email} />
    </Elements>
  );
};

export default OneTimePayment;
