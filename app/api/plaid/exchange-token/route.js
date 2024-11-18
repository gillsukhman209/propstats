import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export async function POST(req) {
  try {
    const { public_token } = await req.json();
    console.log("Public Token Received in API:", public_token);

    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    console.log(
      "Access Token Received from Plaid:",
      response.data.access_token
    );

    return new Response(
      JSON.stringify({ access_token: response.data.access_token }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in Token Exchange API:", error);
    return new Response(JSON.stringify({ error: "Failed to exchange token" }), {
      status: 500,
    });
  }
}
