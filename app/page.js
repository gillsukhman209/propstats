"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import PlaidButton from "./components/PlaidButton";
import customTransactions from "./transactions";
import axios from "axios";
import { FaSignOutAlt } from "react-icons/fa";
import Card from "./components/Card";

const HomePage = () => {
  const { data: session, status } = useSession();
  const [accessToken, setAccessToken] = useState("");
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

      const updatedTransactions = [...customTransactions];
      // const updatedTransactions = [...customTransactions, ...data];
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

      // Adjust total spent based on the new logic
      for (const merchant in totals) {
        totals[merchant] = notEvalTotals[merchant] - evalTotals[merchant];
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
    <div className="min-h-screen bg-gradient-to-b from-[#03030E] to-[#2A2E48] w-full text-white p-4 md:p-6">
      <header className="max-w-full mx-auto text-center mb-6 flex flex-col md:flex-row justify-between items-center px-4 space-y-4 md:space-y-0">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Propfirm Stats
        </h1>
        <div className="flex flex-wrap justify-center md:justify-end space-x-2 space-y-2 md:space-y-0">
          {!accessToken && (
            <PlaidButton
              onTokenExchanged={(token) => setAccessToken(token)}
              className="font-semibold text-white rounded-lg bg-gradient px-4 py-2 text-sm md:text-base"
            />
          )}
          <div className="flex space-x-4">
            <button
              onClick={fetchTransactions}
              className="h-12 w-40 text-center font-semibold text-white border-2 border-white rounded-lg bg-gradient-to-r from-[#080a12] to-[#08083a8a]"
            >
              Sync transactions
            </button>
            <button
              onClick={() => signOut()}
              className="h-12 w-40 text-center font-semibold text-white border-2 border-white rounded-lg bg-gradient-to-r from-[#080a12] to-[#08083a8a] flex items-center justify-center"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="w-full h-auto flex items-center justify-center">
        <div className="flex flex-wrap w-full justify-center items-center gap-4">
          {Object.keys(categories.merchants || {}).map((merchant) => (
            <Card categories={categories} merchant={merchant} key={merchant} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
