"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import PlaidButton from "./components/PlaidButton";
import customTransactions from "./transactions";
import axios from "axios";

const HomePage = () => {
  const { data: session, status } = useSession();
  const [accessToken, setAccessToken] = useState("empty access token");
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({});
  useEffect(() => {
    const handleUserAuthentication = async () => {
      if (status === "unauthenticated") {
        signIn(); // Redirects to the login page
      } else if (status === "authenticated" && session) {
        await addUserToDB();
        await fetchTransactions();
      }
    };

    handleUserAuthentication(); // Call the async function
  }, [status, session]);

  const addUserToDB = async () => {
    console.log(
      "about to add user to database",
      session.user.email,
      accessToken
    );
    try {
      await axios.post("/api/mongo/createUser", {
        email: session?.user?.email,

        accessToken: accessToken,
      });
    } catch (error) {
      console.error("Error adding user to DB:", error);
    }
  };

  const fetchTransactions = async () => {
    let tokenToUse = accessToken;

    // If `accessToken` is empty or needs to be fetched from the database
    if (!accessToken || accessToken === "empty access token") {
      console.log("Fetching access token from database...");
      try {
        const res = await axios.get(
          `/api/mongo/getToken?email=${session?.user?.email}`
        );
        console.log("Successfully fetched token:", res.data.accessToken);
        tokenToUse = res.data.accessToken; // Use a local variable
        setAccessToken(res.data.accessToken); // Update state for future use
      } catch (err) {
        console.error("Error fetching token:", err);
        return; // Exit if token fetch fails
      }
    }

    console.log("Using Access Token:", tokenToUse);

    try {
      const res = await fetch("/api/plaid/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: tokenToUse, // Explicitly use the local variable
          start_date: "2000-01-01",
          end_date: "2024-11-17",
        }),
      });

      const data = await res.json();
      console.log("Fetched transactions:", data);

      const updatedTransactions = [...customTransactions, ...data];
      console.log("Fetched and Merged Transactions:", updatedTransactions);

      // Categorize transactions dynamically by merchant name
      const categorizedTransactions = {};
      updatedTransactions.forEach((transaction) => {
        const merchant = transaction.merchant_name || "Unknown Merchant";
        if (!categorizedTransactions[merchant]) {
          categorizedTransactions[merchant] = [];
        }
        categorizedTransactions[merchant].push(transaction);
      });

      // Calculate total spending for each category
      const totals = {};
      const evalTotals = {};
      const notEvalTotals = {};
      let totalEval = 0;
      let totalNotEval = 0;
      for (const merchant in categorizedTransactions) {
        totals[merchant] = categorizedTransactions[merchant].reduce(
          (sum, tx) => sum + tx.amount,
          0
        );
        evalTotals[merchant] = categorizedTransactions[merchant].reduce(
          (sum, tx) => (tx.eval ? sum + tx.amount : sum),
          0
        );
        notEvalTotals[merchant] = categorizedTransactions[merchant].reduce(
          (sum, tx) => (!tx.eval ? sum + tx.amount : sum),
          0
        );
        totalEval += evalTotals[merchant];
        totalNotEval += notEvalTotals[merchant];
      }

      setCategories({
        merchants: categorizedTransactions,
        totals,
        evalTotals,
        notEvalTotals,
        totalEval,
        totalNotEval,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 w-full text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 w-full text-white p-6">
      <header className="max-w-4xl mx-auto text-center mb-8 ">
        <h1 className="text-4xl font-bold text-white mb-4">Propfirm Stats</h1>
        <p className="text-gray-600 text-lg">
          Track your prop firm stats in seconds{" "}
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
          className={`w-[20%] ml-4 mt-4 py-3 font-semibold text-white rounded ${
            accessToken
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Fetch Transactions
        </button>
        <button
          onClick={() => signOut()}
          className="w-[20%] ml-4 mt-4 py-3 font-semibold text-white rounded bg-red-600 hover:bg-red-700"
        >
          Logout
        </button>

        <div className="text-center mt-4">
          <p className="text-lg text-red-400 mb-4">
            Evals cost:{" "}
            <span className="font-semibold text-2xl">
              ${categories.totalEval ? categories.totalEval.toFixed(2) : "0.00"}
            </span>
          </p>
          <p className="text-lg text-green-400 mb-4">
            Total Payouts:{" "}
            <span className="font-semibold text-2xl">
              $
              {categories.totalNotEval
                ? categories.totalNotEval.toFixed(2)
                : "0.00"}
            </span>
          </p>
        </div>
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
              <p className="text-sm text-gray-500 mb-4">
                Eval Total:{" "}
                <span className="font-semibold">
                  ${categories.evalTotals[merchant].toFixed(2)}
                </span>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Payout:{" "}
                <span className="font-semibold">
                  ${categories.notEvalTotals[merchant].toFixed(2)}
                </span>
              </p>
              <ul className="space-y-3">
                {categories.merchants[merchant].map((tx, index) => (
                  <li
                    key={tx.transaction_id || index} // Use `transaction_id` or fallback to index
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={tx.logo_url || "https://via.placeholder.com/50"}
                      alt={tx.name}
                      className="w-20 h-12 rounded"
                    />
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {tx.name || "Unknown Merchant"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {tx.date} | ${tx.amount.toFixed(2)} | Eval:{" "}
                        {tx.eval ? "Yes" : "No"}
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
