import connectToDatabase from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function POST(req) {
  console.log("inside save transactions api");
  const { access_token, transactions } = await req.json();
  const db = await connectToDatabase();

  try {
    // Save each transaction to the database
    const savedTransactions = await Promise.all(
      transactions.map((tx) =>
        Transaction.findOneAndUpdate(
          { transaction_id: tx.transaction_id },
          tx,
          { upsert: true, new: true }
        )
      )
    );

    return NextResponse.json(savedTransactions);
  } catch (error) {
    console.error("Error saving transactions:", error);
    return NextResponse.json(
      { error: "Failed to save transactions" },
      { status: 500 }
    );
  }
}
