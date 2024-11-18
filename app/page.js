"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen"></div>
  );
}
