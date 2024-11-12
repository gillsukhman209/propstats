"use client";
import React from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

function Login() {
  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col gap-20 justify-center items-center">
      <h1 className="text-4xl">Login</h1>
      <div className="flex flex-col gap-10">
        <button
          className="border-2 text-white p-4 rounded-2xl shadow-2xl"
          onClick={() =>
            signIn("google", { callbackUrl: "http://localhost:3000" })
          }
        >
          <div className="flex gap-4 items-center  ">
            <FcGoogle size={30} />
            <h1> Sign in with Google</h1>
          </div>
        </button>
      </div>
    </div>
  );
}

export default Login;
