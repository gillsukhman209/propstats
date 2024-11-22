import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import User from "../../../../models/User";

export async function GET(req) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  try {
    await connectDB(); // Ensure MongoDB is connected

    const user = await User.findOne({ email });
    console.log("email received", email);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const subscriptionStatus = user.hasPaid ? true : false; // Determine subscription status
    console.log("sub status is ", subscriptionStatus);
    return NextResponse.json({ subscriptionStatus }, { status: 200 });
  } catch (error) {
    console.error("Error fetching subscription status:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
