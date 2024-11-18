"use client";

import { useState } from "react";
import PlaidButton from "./components/PlaidButton";

const HomePage = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({});

  const fetchTransactions = async () => {
    if (!accessToken) {
      console.error("No access token available!");
      return;
    }

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
    setTransactions(data);

    // Categorize transactions dynamically by merchant name
    const categorizedTransactions = {};
    data.forEach((transaction) => {
      const merchant = transaction.merchant_name || "Unknown Merchant";
      if (!categorizedTransactions[merchant]) {
        categorizedTransactions[merchant] = [];
      }
      categorizedTransactions[merchant].push(transaction);
    });

    // Calculate total spending for each category
    const totals = {};
    for (const merchant in categorizedTransactions) {
      totals[merchant] = categorizedTransactions[merchant].reduce(
        (sum, tx) => sum + tx.amount,
        0
      );
    }

    setCategories({ merchants: categorizedTransactions, totals });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Connect Your Bank Account</h1>
      <PlaidButton
        onTokenExchanged={(token) => {
          console.log("Access Token Set in HomePage:", token); // Debugging
          setAccessToken(token);
        }}
      />

      <button
        onClick={fetchTransactions}
        className={`px-4 py-2 mt-4 font-semibold text-white ${
          accessToken
            ? "bg-green-500 hover:bg-green-600"
            : "bg-red-500 hover:bg-red-600"
        } rounded`}
      >
        Fetch Transactions
      </button>

      {/* Render all categorized transactions */}
      <div className="w-full max-w-4xl mt-6">
        {Object.keys(categories.merchants || {}).map((merchant) => (
          <div key={merchant} className="mb-8">
            <h2 className="text-lg font-bold mb-2">{merchant}</h2>
            <p className="text-sm text-gray-500">
              Total Spent: ${categories.totals[merchant].toFixed(2)}
            </p>
            <ul className="list-disc list-inside">
              {categories.merchants[merchant].map((tx) => (
                <li key={tx.transaction_id} className="mb-2">
                  <img
                    src={tx.logo_url || "https://via.placeholder.com/50"}
                    alt={tx.name}
                    className="inline-block mr-2 w-8 h-8 rounded"
                  />
                  <strong>{tx.name || "Unknown Merchant"}</strong> - $
                  {tx.amount.toFixed(2)} <br />
                  <span className="text-sm text-gray-500">
                    {tx.date} | {tx.category?.join(", ") || "Uncategorized"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
