"use client";

import { useState } from "react";
import PlaidButton from "./components/PlaidButton";

const HomePage = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    console.log("sending access", accessToken);
    const res = await fetch("/api/plaid/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: accessToken,
        start_date: "2000-01-01",
        end_date: "2024-11-17",
      }),
    });

    const data = await res.json();
    console.log("Fetched Transactions Response:", data);

    // If the API response contains transactions as a property, set it
    setTransactions(data); // Safeguard in case it's not an array
  };

  return (
    <div className="flex flex-col items-center justify-center h-auto">
      <h1 className="text-2xl font-bold mb-6">Connect Your Bank Account</h1>
      <PlaidButton
        onTokenExchanged={(token) => {
          console.log("Access Token Set in HomePage:", token); // Debugging
          setAccessToken(token);
        }}
      />

      <button
        onClick={() => {
          console.log("Fetch Transactions Clicked with Token:", accessToken); // Debugging
          fetchTransactions();
        }}
        className={`px-4 py-2 mt-4 font-semibold text-white ${
          accessToken
            ? "bg-green-500 hover:bg-green-600"
            : "bg-red-500 hover:bg-red-600"
        } rounded`}
      >
        Fetch Transactions from "myfundedfutures"
      </button>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.transaction_id} className="mb-2">
            <img
              src={tx.logo_url || "https://via.placeholder.com/50"}
              alt={tx.name}
              className="inline-block mr-2 w-8 h-8 rounded"
            />
            <strong>{tx.name || "Unknown Merchant"}</strong> - $
            {tx.amount.toFixed(2)} <br />
            <span className="text-sm text-gray-500">
              {tx.date} | {tx.category.join(", ")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
