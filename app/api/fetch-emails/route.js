// app/api/fetch-emails/route.js
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/fetch-emails`
);

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

export async function GET(req) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  const code = new URL(req.url).searchParams.get("code");

  if (!code) {
    return Response.redirect(authUrl);
  }

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const response = await gmail.users.messages.list({
    userId: "me",
    q: "from:example@propfirm.com", // Customize the query
  });

  return new Response(JSON.stringify(response.data), {
    headers: { "Content-Type": "application/json" },
  });
}
