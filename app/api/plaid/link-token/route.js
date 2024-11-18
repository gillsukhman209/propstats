// app/api/plaid/link-token/route.js
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

export async function GET() {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: "user-id" }, // Use the authenticated user ID
      client_name: "Your App Name",
      products: process.env.PLAID_PRODUCTS.split(","),
      country_codes: process.env.PLAID_COUNTRY_CODES.split(","),
      language: "en",
    });
    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    console.error("Error creating link token:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
