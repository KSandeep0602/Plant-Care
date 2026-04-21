"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  category?: string;
  difficulty?: string;
  sunlight?: string;
  watering?: string;
};

type FilterType = "all" | "easy" | "medium" | "hard";
type CategoryType = "all" | "indoor" | "outdoor" | "flowering" | "succulent" | "herb";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [plants, setPlants] = useState<Plant[]>([]);
  const [recentPlants, setRecentPlants] = useState<Plant[]>([]);
  const [date, setDate] = useState("");
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [category, setCategory] = useState<CategoryType>("all");
  const [sortBy, setSortBy] = useState<"name" | "category" | "difficulty">("name");

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

  // Fetch plants from backend API
  const searchPlants = useCallback(async (value: string) => {
    if (!value.trim()) {
      setPlants([]);
      setSearchError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/plants/search?q=${encodeURIComponent(value)}`);
      if (!res.ok) {
        throw new Error(`Search failed: ${res.status}`);
      }
      const data = await res.json();
      const results = data.plants || [];
      setPlants(results);
      persistRecentPlants(results.slice(0, 3));
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Failed to search plants. Please try again.");
      setPlants([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setPlants([]);
      setSearchError(null);
      setIsLoading(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      searchPlants(trimmed);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [query, searchPlants]);

  // Filter and sort plants
  const filteredAndSortedPlants = useMemo(() => {
    let filtered = [...plants];

    // Apply difficulty filter
    if (filter !== "all") {
      filtered = filtered.filter(plant => plant.difficulty?.toLowerCase() === filter);
    }

    // Apply category filter
    if (category !== "all") {
      filtered = filtered.filter(plant => plant.category?.toLowerCase() === category);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "category":
          return (a.category || "").localeCompare(b.category || "");
        case "difficulty":
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          const aOrder = difficultyOrder[a.difficulty?.toLowerCase() as keyof typeof difficultyOrder] || 0;
          const bOrder = difficultyOrder[b.difficulty?.toLowerCase() as keyof typeof difficultyOrder] || 0;
          return aOrder - bOrder;
        default:
          return 0;
      }
    });

    return filtered;
  }, [plants, filter, category, sortBy]);

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

      {/* Search and Filters */}
      <div className="space-y-6 mb-10">
        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <input
              placeholder="Search plants by name, type, or care needs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-6 py-4 pr-12 rounded-full bg-white text-black border border-gray-300 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              ) : (
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>
          {searchError && (
            <p className="text-red-400 text-sm mt-2">{searchError}</p>
          )}
        </div>

        {/* Filters and Date */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Difficulty Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-4 py-2 rounded-full bg-gray-800 text-white border border-gray-600 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy Care</option>
            <option value="medium">Medium Care</option>
            <option value="hard">Hard Care</option>
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryType)}
            className="px-4 py-2 rounded-full bg-gray-800 text-white border border-gray-600 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="flowering">Flowering</option>
            <option value="succulent">Succulent</option>
            <option value="herb">Herb</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "category" | "difficulty")}
            className="px-4 py-2 rounded-full bg-gray-800 text-white border border-gray-600 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="difficulty">Sort by Difficulty</option>
          </select>

          {/* Date Picker */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 rounded-full bg-white text-black border border-gray-300 outline-none focus:ring-2 focus:ring-green-500"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {!query.trim() && recentPlants.length > 0 && (
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

      {/* Results Count */}
      {query && (
        <div className="mb-6">
          <p className="text-gray-300">
            {isLoading ? "Searching..." : `Found ${filteredAndSortedPlants.length} plant${filteredAndSortedPlants.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredAndSortedPlants.map((plant) => (
          <div
            key={plant.id}
            className="group block overflow-hidden rounded-2xl bg-white text-black shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <Link href={`/plant/${plant.id}`}>
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={plant.image}
                  alt={plant.name}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                {/* Difficulty Badge */}
                {plant.difficulty && (
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold text-white ${
                    plant.difficulty.toLowerCase() === 'easy' ? 'bg-green-500' :
                    plant.difficulty.toLowerCase() === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {plant.difficulty}
                  </div>
                )}
                {/* Category Badge */}
                {plant.category && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white bg-blue-500">
                    {plant.category}
                  </div>
                )}
              </div>
            </Link>

            <div className="p-5">
              <Link href={`/plant/${plant.id}`}>
                <h3 className="text-xl font-bold text-green-600 cursor-pointer hover:text-green-700 transition">
                  {plant.name}
                </h3>
              </Link>

              <p className="text-gray-700 mt-2 line-clamp-2">
                {plant.description}
              </p>

              {/* Plant Care Info */}
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                {plant.sunlight && (
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">☀️</span>
                    <span>{plant.sunlight}</span>
                  </div>
                )}
                {plant.watering && (
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">💧</span>
                    <span>{plant.watering}</span>
                  </div>
                )}
              </div>

              <button
                onClick={async () => {
                  if (!date) {
                    alert("Please select a date for the reminder");
                    return;
                  }

                  if (!userPhone) {
                    alert("Please log in again");
                    router.push("/login");
                    return;
                  }

                  try {
                    await addReminder(plant.name, date, userPhone);
                    setDate("");
                    alert(`🌿 WhatsApp reminder scheduled for ${plant.name}!`);
                  } catch (error) {
                    console.error("Failed to add reminder:", error);
                    alert("Failed to schedule reminder. Please try again.");
                  }
                }}
                className="w-full mt-4 py-3 rounded-full bg-green-600 text-white font-bold hover:bg-green-700 transition duration-200 flex items-center justify-center gap-2"
              >
                <span>⏰</span>
                Add WhatsApp Reminder
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {query && !isLoading && filteredAndSortedPlants.length === 0 && !searchError && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-bold text-white mb-2">No plants found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="block overflow-hidden rounded-2xl bg-white shadow-lg animate-pulse">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-5">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-1"></div>
                <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                <div className="h-10 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
