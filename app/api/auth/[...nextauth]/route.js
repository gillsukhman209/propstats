import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: "tQiyihSwgCL7QreozSzMwtAILDKhEr4OA3+io4kYXD0=",

  // Add other NextAuth.js configuration here if needed
};

const handler = (req, res) => NextAuth(req, res, authOptions);

export { handler as GET, handler as POST };
