"use client";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function HomePage() {
  const [emailData, setEmailData] = useState(null);
  const { data: session } = useSession();

  const fetchEmails = async () => {
    try {
      const res = await fetch("/api/fetch-emails");
      const data = await res.json();
      setEmailData(data);
    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  };

  const getEmailHeader = (headers, name) => {
    const header = headers.find((h) => h.name === name);
    return header ? header.value : "No data";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Current User: {session?.user?.email}</h1>
      <button
        onClick={fetchEmails}
        className="px-4 py-2 mb-6 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Fetch Emails
      </button>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 mb-6 font-semibold text-white bg-red-500 rounded hover:bg-red-600"
      >
        Sign Out
      </button>
      {emailData && (
        <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-6 space-y-4">
          {emailData.map((email, index) => (
            <div key={email.id} className="border-b pb-4 mb-4">
              <h3 className="text-lg font-bold">
                Subject: {getEmailHeader(email.payload.headers, "Subject")}
              </h3>
              <p>
                <strong>From:</strong>{" "}
                {getEmailHeader(email.payload.headers, "From")}
              </p>
              <p>
                <strong>To:</strong>{" "}
                {getEmailHeader(email.payload.headers, "To")}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Snippet:</strong> {email.snippet}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
