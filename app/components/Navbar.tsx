"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) return;
    router.push(`/search?query=${encodeURIComponent(query)}`);
    setQuery("");
  };

  return (
    <nav
      style={{
        backgroundColor: "#dd73ebff",
        padding: "14px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        <h2 style={{ fontWeight: "700" }}>PlantCare</h2>

        <Link href="/">Home</Link>
        <Link href="/search">Search</Link>
        <Link href="/reminders">Your Reminders</Link>
        <Link href="/about">About Plants</Link>
      </div>

      {/* Right */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ffffffff",
          }}
        />

        <button
          onClick={handleSearch}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "white",
            cursor: "pointer",
          }}
        >
          Search
        </button>

        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#ebbd7cff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
          }}
        >
          ?
        </div>
      </div>
    </nav>
  );
}
