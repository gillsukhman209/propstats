// pages/api/update-payment-status.js
import { NextResponse } from "next/server";
import User from "../../../../models/User";
import connectDB from "../../../../lib/db";

export async function POST(req) {
  const { email, paymentId, paymentDate } = await req.json();
  console.log("Inside update-payment-status", email, paymentDate, paymentId);

  try {
    await connectDB(); // Ensure MongoDB is connected

    await User.findOneAndUpdate(
      { email },
      {
        hasPaid: true,
        paymentId,
        paymentDate,
      },
      { new: true }
    );
    console.log("after updating user", User);

    return NextResponse.json(
      { message: "Payment status updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating payment status:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
