import { NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import User from "../../../../models/User";

export async function GET(req) {
  console.log("inside get request");
  // Get the email from the request
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }
  try {
    // Connect to the database
    await connectDB();
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    // Get the access token from the user
    const accessToken = user.accessToken;
    return NextResponse.json({ accessToken }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch user data", error);
    return NextResponse.json(
      { message: "Failed to fetch user data", error: error.message },
      { status: 500 }
    );
  }
}
