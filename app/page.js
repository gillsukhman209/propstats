"use client";

import { useState } from "react";
import PlaidButton from "./components/PlaidButton";

const HomePage = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    const res = await fetch("/api/plaid/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: accessToken,
        start_date: "2023-01-01",
        end_date: "2023-12-31",
        merchant: "myfundedfutures",
      }),
    });
    const data = await res.json();
    setTransactions(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Connect Your Bank Account</h1>
      <PlaidButton onTokenExchanged={setAccessToken} />
      <button
        onClick={fetchTransactions}
        disabled={!accessToken}
        className="px-4 py-2 mt-4 font-semibold text-white bg-green-500 rounded hover:bg-green-600"
      >
        Fetch Transactions from "myfundedfutures"
      </button>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.transaction_id}>
            {tx.date} - {tx.name}: ${tx.amount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
