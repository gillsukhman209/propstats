// app/api/plaid/exchange-token/route.js
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
  const { public_token } = await req.json();
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    return new Response(
      JSON.stringify({ access_token: response.data.access_token }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error exchanging token:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
