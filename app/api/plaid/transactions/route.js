import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import { NextResponse } from "next/server";

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox, // Use 'sandbox' for testing
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export async function POST(req) {
  const { access_token, start_date, end_date } = await req.json();

  console.log("Access Token:", access_token);
  console.log("Start Date:", start_date);
  console.log("End Date:", end_date);

  try {
    console.log("Fetching all transactions from Plaid API...");

    const response = await plaidClient.transactionsGet({
      access_token,
      start_date,
      end_date,
    });

    const transactions = response.data.transactions;
    console.log("Fetched Transactions:", transactions);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error(
      "Error fetching transactions:",
      error.response?.data || error
    );
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
