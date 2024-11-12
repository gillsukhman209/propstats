// app/page.js
"use client";
import { useState } from "react";

export default function HomePage() {
  const [emailData, setEmailData] = useState(null);

  const fetchEmails = async () => {
    try {
      const res = await fetch("/api/fetch-emails");
      const data = await res.json();
      setEmailData(data);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <button
        onClick={fetchEmails}
        className="px-4 py-2 mb-6 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Fetch Emails
      </button>
      {emailData && (
        <pre className="p-4 bg-gray-200 rounded">
          {JSON.stringify(emailData, null, 2)}
        </pre>
      )}
    </div>
  );
}
