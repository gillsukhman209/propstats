import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  transaction_id: { type: String, unique: true, required: true },
  merchant_name: { type: String },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  category: { type: [String] },
  logo_url: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
