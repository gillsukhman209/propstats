import React from "react";
import { FaSignOutAlt } from "react-icons/fa";

function Card({ categories, merchant }) {
  return (
    <div className="w-[40%] h-[500px]  shadow-2xl m-4 rounded-2xl overflow-hidden ">
      <div
        key={merchant}
        className="p-6 h-full w-full flex flex-col justify-center bg-gradient-to-b from-[#080a12] to-[#08083a8a] shadow-2xl border-[2px] border-white rounded-2xl"
      >
        <h2 className="text-4xl flex justify-center items-center font-bold text-white mb-16 ">
          {merchant}
        </h2>
        <div className="flex justify-around text-xl mb-10 tracking-wider">
          <div className="text-gray-500 mb-4 shadow-glow">
            <span>Total Spent:</span>
            <span className="font-semibold">
              ${categories.totals[merchant].toFixed(2)}
            </span>
          </div>
          <div className="text-gray-500 mb-4 ">
            <span>Evals Total:</span>
            <span className="font-semibold">
              ${categories.evalTotals[merchant].toFixed(2)}
            </span>
          </div>
          <div className="text-gray-500 mb-4 ">
            <span>Payouts:</span>
            <span className="font-semibold">
              ${categories.notEvalTotals[merchant].toFixed(2)}
            </span>
          </div>
        </div>
        <ul className="space-y-3">
          {categories.merchants[merchant].map((tx, index) => (
            <li
              key={tx.transaction_id || index} // Use `transaction_id` or fallback to index
              className="flex text-lg items-center space-x-4 p-3 bg-gray-100 rounded-lg "
            >
              <img
                src={tx.logo_url || "https://via.placeholder.com/50"}
                alt={tx.name}
                className="w-20 h-12 rounded"
              />
              <div className="w-full flex justify-between ">
                <h3 className="font-medium text-gray-800">
                  {tx.name || "Unknown Merchant"}
                  <p className="text-gray-500 ">{tx.date}</p>
                </h3>

                <p className="text-gray-500 flex items-center text-xl">
                  ${tx.amount.toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Card;
