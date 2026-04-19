"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

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

        {/* Account */}
        <button
          onClick={() => router.push("/account")}
          className="bg-white text-green-700 px-4 py-1 rounded-full font-semibold"
        >
          Account
        </button>
      </div>
    </nav>
  );
}
