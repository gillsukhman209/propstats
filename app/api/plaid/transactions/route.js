// app/api/plaid/transactions/route.js
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});
const plaidClient = new PlaidApi(config);

export async function POST(req) {
  const { access_token, start_date, end_date, merchant } = await req.json();
  try {
    const response = await plaidClient.transactionsGet({
      access_token,
      start_date,
      end_date,
    });

    const filteredTransactions = response.data.transactions.filter((tx) =>
      tx.name.toLowerCase().includes(merchant.toLowerCase())
    );

    return new Response(JSON.stringify(filteredTransactions), { status: 200 });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
