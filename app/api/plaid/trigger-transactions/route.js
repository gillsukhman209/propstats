export async function POST(req) {
  const { access_token } = await req.json();

  try {
    console.log("Triggering new transaction webhook...");

    // Perform a direct HTTP POST request to the Plaid endpoint
    const response = await fetch(
      "https://sandbox.plaid.com/sandbox/transactions/fire_webhook",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
          "PLAID-SECRET": process.env.PLAID_SECRET,
        },
        body: JSON.stringify({
          access_token,
          webhook_code: "DEFAULT_UPDATE", // Simulates a new transaction
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error triggering webhook:", errorData);
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Webhook triggered successfully:", data);

    return new Response(
      JSON.stringify({ message: "Webhook triggered successfully" }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error triggering transactions webhook:", error);
    return new Response(
      JSON.stringify({ error: "Failed to trigger transactions webhook" }),
      {
        status: 500,
      }
    );
  }
}
