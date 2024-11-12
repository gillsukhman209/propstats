// app/api/fetch-emails/route.js
import { google } from "googleapis";
import { NextResponse } from "next/server";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

/**
 * Authorizes the client using the refresh token.
 */
async function authorize() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return oauth2Client;
}

/**
 * Fetches emails from the user's Gmail inbox.
 */
async function fetchEmails(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const response = await gmail.users.messages.list({
    userId: "me",
    q: "", // You can use search queries here, e.g., "from:specificemail@example.com"
    maxResults: 10, // Limits the number of emails fetched to 10 for demonstration
  });

  const messages = response.data.messages || [];

  // Fetch full data for each message ID
  const emailData = await Promise.all(
    messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
      });
      return {
        id: message.id,
        snippet: msg.data.snippet, // Short preview of the message
        payload: msg.data.payload, // Contains headers and body data
      };
    })
  );

  return emailData;
}

export async function GET() {
  try {
    const auth = await authorize();
    const emails = await fetchEmails(auth);
    return NextResponse.json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
