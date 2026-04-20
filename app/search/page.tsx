"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReminders } from "../context/ReminderContext";
import Navbar from "../components/Navbar";

type Plant = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [plants, setPlants] = useState<Plant[]>([]);
  const [recentPlants, setRecentPlants] = useState<Plant[]>([]);
  const [date, setDate] = useState("");
  const [userPhone, setUserPhone] = useState<string | null>(null);

  const { addReminder } = useReminders();

  // Load logged-in user phone once
  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data?.user?.phone) {
          router.push("/login");
          return;
        }
        setUserPhone(String(data.user.phone));
      } catch {
        router.push("/login");
      }
    }

    loadMe();
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("recentlySearchedPlants");
    if (!stored) return;

    try {
      const parsed: Plant[] = JSON.parse(stored);
      setRecentPlants(parsed);
    } catch {
      // ignore invalid values
    }
  }, []);

  const persistRecentPlants = (plantsToAdd: Plant[]) => {
    setRecentPlants((current) => {
      const merged = [
        ...plantsToAdd,
        ...current.filter(
          (existing) => !plantsToAdd.some((item) => item.id === existing.id)
        ),
      ].slice(0, 6);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "recentlySearchedPlants",
          JSON.stringify(merged)
        );
      }

      return merged;
    });
  };

  // 🔥 NEW: Fetch plants from backend API
  const searchPlants = async (value: string) => {
    setQuery(value);

    if (!value) {
      setPlants([]);
      return;
    }

    try {
      const res = await fetch(`/api/plants/search?q=${value}`);
      const data = await res.json();
      const results = data.plants || [];
      setPlants(results);
      persistRecentPlants(results.slice(0, 3));
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-black px-10 py-10 text-white">
      {/* Title */}
      <h1 className="text-3xl font-extrabold text-green-500">
        Discover Plants 🌱
      </h1>

      <p className="text-gray-300 mb-8">
        Search plants and schedule WhatsApp care reminders
      </p>

      {/* Inputs */}
      <div className="flex flex-wrap gap-4 mb-10">
        <input
          placeholder="Search plant..."
          value={query}
          onChange={(e) => searchPlants(e.target.value)}
          className="px-4 py-2 rounded-full bg-white text-black border border-gray-300 outline-none"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 rounded-full bg-white text-black border border-gray-300 outline-none"
        />
      </div>

      {recentPlants.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            Recently searched plants
          </h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recentPlants.map((plant) => (
              <Link
                key={plant.id}
                href={`/plant/${plant.id}`}
                className="group block overflow-hidden rounded-2xl bg-white text-black shadow-lg transition hover:-translate-y-1"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={plant.image}
                    alt={plant.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-green-600">
                    {plant.name}
                  </h3>
                  <p className="text-gray-700 mt-2 line-clamp-3">
                    {plant.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="flex flex-wrap gap-8">
        {plants.map((plant) => (
          <div
            key={plant.id}
            className="w-[320px] bg-white rounded-2xl overflow-hidden shadow-lg text-black"
          >
            <Link href={`/plant/${plant.id}`}>
              <Image
                src={plant.image}
                alt={plant.name}
                width={320}
                height={180}
                className="object-cover cursor-pointer hover:opacity-90"
              />
            </Link>

            <div className="p-5">
              <Link href={`/plant/${plant.id}`}>
                <h3 className="text-xl font-bold text-green-600 cursor-pointer">
                  {plant.name}
                </h3>
              </Link>

              <p className="text-gray-700 my-2">
                {plant.description}
              </p>

              <button
                onClick={async () => {
                  if (!date) {
                    alert("Please select a date");
                    return;
                  }

                  if (!userPhone) {
                    alert("Please log in again");
                    router.push("/login");
                    return;
                  }

                  await addReminder(plant.name, date, userPhone);
                  setDate("");
                  alert("🌿 WhatsApp reminder scheduled!");
                }}
                className="w-full mt-4 py-3 rounded-full bg-green-600 text-white font-bold hover:bg-green-700"
              >
                ⏰ Add WhatsApp Reminder
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
