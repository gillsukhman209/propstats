import connectDB from "../../../../lib/db";
import User from "../../../../models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  console.log("Inside update data API");
  const { email, newAccessToken } = await req.json();

  console.log("Update data email:", email, "new access token:", newAccessToken);

  try {
    // Parse the request body

    // Connect to the database
    await connectDB();

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update the access token
    user.accessToken = newAccessToken;

    // Save the updated user
    await user.save();

    return NextResponse.json(
      { message: "User data updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update user data", error);
    return NextResponse.json(
      { message: "Failed to update user data", error: error.message },
      { status: 500 }
    );
  }
}
