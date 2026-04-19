"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar"

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
        setName(data.user.name || "");
        setDob(data.user.dob || "");
      }
    }

    fetchUser();
  }, []);

  const saveProfile = async () => {
    const res = await fetch("/api/auth/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, dob }),
    });

    const data = await res.json();

    if (res.ok) {
      setUser(data.user);
      setEditing(false);
      alert("Profile updated ✅");
    } else {
      alert("Error updating profile");
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout");
    router.push("/login");
  };

  if (!user) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  return (
    <>
    <Navbar />

    <div className="min-h-screen bg-black flex justify-center p-10">
      <div className="bg-white rounded-2xl w-[500px] p-8 text-black">

        <h1 className="text-2xl font-bold text-green-600 mb-6">
          👤 Account
        </h1>

        {!editing ? (
          <>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Name:</strong> {user.name || "Not set"}</p>
            <p><strong>DOB:</strong> {user.dob || "Not set"}</p>

            <button
              onClick={() => setEditing(true)}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded-full"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />

            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />

            <button
              onClick={saveProfile}
              className="w-full bg-green-600 text-white py-2 rounded-full"
            >
              Save
            </button>

            <button
              onClick={() => setEditing(false)}
              className="mt-2 w-full bg-gray-400 text-white py-2 rounded-full"
            >
              Cancel
            </button>
          </>
        )}

        <button
          onClick={logout}
          className="mt-6 w-full bg-red-500 text-white py-2 rounded-full"
        >
          Logout
        </button>

      </div>
    </div>
    </>
  );
}