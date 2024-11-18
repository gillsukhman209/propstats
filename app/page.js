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
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Bank Transaction Tracker
        </h1>
        <p className="text-gray-600">
          Connect your bank account and track your spending by merchants.
        </p>
      </header>

      <div className="max-w-4xl mx-auto mb-6">
        <PlaidButton
          onTokenExchanged={(token) => {
            console.log("Access Token Set in HomePage:", token); // Debugging
            setAccessToken(token);
          }}
        />
        <button
          onClick={fetchTransactions}
          className={`w-full mt-4 py-3 font-semibold text-white rounded ${
            accessToken
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Fetch Transactions
        </button>
      </div>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(categories.merchants || {}).map((merchant) => (
            <div
              key={merchant}
              className="bg-white shadow-md rounded-lg p-6 border-t-4 border-blue-500"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {merchant}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Total Spent:{" "}
                <span className="font-semibold">
                  ${categories.totals[merchant].toFixed(2)}
                </span>
              </p>
              <ul className="space-y-3">
                {categories.merchants[merchant].map((tx) => (
                  <li
                    key={tx.transaction_id}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={tx.logo_url || "https://via.placeholder.com/50"}
                      alt={tx.name}
                      className="w-12 h-12 rounded"
                    />
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {tx.name || "Unknown Merchant"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {tx.date} | ${tx.amount.toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
