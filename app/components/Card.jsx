import React from "react";

function Card({ categories, merchant }) {
  return (
    <div className="mt-[100px]  w-full sm:w-[48%] lg:w-[40%] xl:w-[35%] 3xl:w-[40%] max-w-4xl shadow-2xl m-6 rounded-2xl overflow-hidden">
      <div
        key={merchant}
        className="p-6 md:p-8 h-full flex flex-col justify-center bg-gradient-to-b from-[#080a12] to-[#08083a8a] shadow-2xl border-2 border-white rounded-2xl"
      >
        <h2 className="text-3xl md:text-5xl flex justify-center items-center font-bold text-white mb-10 ">
          {merchant}
        </h2>
        <div className="flex flex-wrap justify-between text-base md:text-xl mb-8 tracking-wider">
          <div className="text-gray-400 shadow-glow break-words">
            <span>Total Spent:</span>
            <span className="font-semibold block">
              ${categories.totals[merchant].toFixed(2)}
            </span>
          </div>

          <div className="text-gray-400 break-words">
            <span>Evals Total:</span>
            <span className="font-semibold block">
              ${categories.evalTotals[merchant].toFixed(2)}
            </span>
          </div>
          <div className="text-gray-400 break-words">
            <span>Payouts:</span>
            <span className="font-semibold block">
              ${categories.notEvalTotals[merchant]}
            </span>
          </div>
        </div>
        <ul className="space-y-4">
          {categories.merchants[merchant].map((tx, index) => (
            <li
              key={tx.transaction_id || index}
              className="flex text-base md:text-lg items-center space-x-4 p-4 bg-gray-100 rounded-lg"
            >
              <img
                src={tx.logo_url || "https://via.placeholder.com/50"}
                alt={tx.name}
                className="w-20 h-16 rounded hidden md:flex"
              />
              <div className="flex-grow overflow-hidden">
                <h3 className="font-medium text-gray-800 truncate">
                  {tx.name || "Unknown Merchant"}
                  <p className="text-gray-500 text-sm ">{tx.date}</p>
                </h3>
              </div>
              <p className="text-gray-500 text-lg">${tx.amount.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Card;
