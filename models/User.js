import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  accessToken: { type: String, unique: true, required: false },
  createdAt: { type: Date, default: Date.now },

  // One-time payment related fields
  hasPaid: { type: Boolean, default: false }, // Whether the user has completed a payment
  paymentId: { type: String, required: false }, // Stripe Payment ID
  paymentDate: { type: Date, required: false }, // Date of payment
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
