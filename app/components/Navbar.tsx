"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [userInitial, setUserInitial] = useState<string>("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user?.name) {
          setUserInitial(data.user.name.charAt(0).toUpperCase());
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }

    fetchUser();
  }, []);

  return (
    <nav className="bg-green-600 px-6 py-4 flex justify-between items-center">
      <Link href="/home" className="text-white text-xl font-bold">
        🌿 PlantCare
      </Link>

      <div className="flex gap-6 items-center text-white">
        <Link href="/home">Home</Link>
        <Link href="/search">Search</Link>
        <Link href="/reminders">Reminders</Link>
        <Link href="/about">About</Link>

        {/* User Avatar */}
        <button
          onClick={() => router.push("/account")}
          className="w-10 h-10 bg-white text-green-700 rounded-full font-bold flex items-center justify-center hover:bg-gray-100 transition-colors"
          title="Account"
        >
          {userInitial || "?"}
        </button>
      </div>
    </nav>
  );
}
