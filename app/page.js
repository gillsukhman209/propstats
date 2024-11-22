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
  const [accessToken, setAccessToken] = useState(null);
  const [categories, setCategories] = useState({});
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    const handleUserAuthentication = async () => {
      if (status === "unauthenticated") {
        signIn();
      } else if (status === "authenticated" && session) {
        await addUserToDB();
        await fetchSubscriptionStatus();
        if (subscriptionStatus) {
          await fetchTransactions();
        }
      }
    };

    handleUserAuthentication();
  }, [status, session, subscriptionStatus]);

  const fetchSubscriptionStatus = async () => {
    try {
      const { data } = await axios.get(
        `/api/stripe/get-subscription-status?email=${session?.user?.email}`
      );
      setSubscriptionStatus(data.subscriptionStatus);
    } catch (error) {
      console.error("Error fetching subscription status:", error.message);
    }
  };

  const addUserToDB = async () => {
    try {
      await axios.post("/api/mongo/createUser", {
        email: session?.user?.email,
        accessToken,
      });
    } catch (error) {
      console.error("Error adding user to DB:", error);
    }
  };

  const fetchTransactions = async () => {
    let tokenToUse = accessToken;

    if (!accessToken) {
      try {
        const res = await axios.get(
          `/api/mongo/getToken?email=${session?.user?.email}`
        );
        tokenToUse = res.data.accessToken;
        setAccessToken(tokenToUse);
      } catch (err) {
        console.error("Error fetching token:", err);
        return;
      }
    }

    try {
      const res = await fetch("/api/plaid/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: tokenToUse,
          start_date: "2000-01-01",
          end_date: "2024-11-17",
        }),
      });

      const data = await res.json();
      const updatedTransactions = [...customTransactions];
      console.log("updated trans", updatedTransactions);

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

  if (status === "loading" || subscriptionStatus === null) {
    return (
      <div className="min-h-screen bg-gray-900 w-full text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (subscriptionStatus !== true) {
    return (
      <div className="min-h-screen bg-gray-900 w-full text-white flex items-center justify-center">
        <p>Please subscribe to access this content.</p>
        <button
          onClick={() => (window.location.href = "api/stripe")}
          className="mt-4 shadow-2xl bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          Subscribe Now
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#03030E] to-[#2A2E48] w-full text-white p-4 md:p-6">
      <header className="max-w-full mx-auto text-center mb-6 flex flex-col md:flex-row justify-between items-center px-4 space-y-4 md:space-y-0">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Propfirm Stats
        </h1>
        <h1>Access token {accessToken} </h1>
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
