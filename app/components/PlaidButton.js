"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePlaidLink } from "react-plaid-link";

const PlaidButton = ({ onTokenExchanged }) => {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      console.log("Current User Email:", session.user.email);
    }
  }, [status, session]);

  const fetchLinkToken = async () => {
    console.log("Fetching Link Token..."); // Should appear when button is clicked
    try {
      const res = await fetch("/api/plaid/link-token");
      console.log("Fetch Response Status:", res.status); // Debugging
      if (!res.ok) {
        throw new Error(`Failed to fetch link token: ${res.statusText}`);
      }
      const data = await res.json();
      console.log("Fetched Link Token Response:", data); // Debugging
      setLinkToken(data.link_token);
    } catch (error) {
      console.error("Error fetching link token:", error); // Debugging
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      const res = await fetch("/api/plaid/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token }),
      });

      const data = await res.json();
      console.log("Access Token (PlaidButton):", data.access_token);
      const token = data.access_token;
      // Update access token in database
      await fetch("/api/mongo/updateToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          newAccessToken: token,
        }),
      })
        .then((res) => {
          console.log("access token updates successfully", res);
        })
        .catch((error) => {
          console.log("error updating the token");
        });

      onTokenExchanged(data.access_token);
    },
  });

  return (
    <button
      onClick={() => {
        console.log("Plaid Button Clicked!");
        // Reset scroll position to ensure UI is centered
        window.scrollTo(0, 0);

        if (linkToken) {
          console.log("Opening Plaid Link UI...");
          open();
        } else {
          console.log("Fetching Link Token...");
          fetchLinkToken();
        }
      }}
      disabled={loading || (linkToken && !ready)}
      className="px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
    >
      {loading ? "Loading..." : "Connect Bank Account"}
    </button>
  );
};

export default PlaidButton;
