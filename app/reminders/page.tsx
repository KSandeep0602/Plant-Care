"use client";

import { useState, useMemo } from "react";
import { useReminders } from "../context/ReminderContext";
import Navbar from "../components/Navbar";

type FilterType = "all" | "today" | "overdue" | "upcoming";
type SortType = "date-asc" | "date-desc" | "name-asc" | "name-desc";

export default function RemindersPage() {
  const { reminders, markDone, deleteReminder } = useReminders();
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("date-asc");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort reminders
  const filteredAndSortedReminders = useMemo(() => {
    let filtered = reminders.filter((r) =>
      activeTab === "pending" ? !r.completed : r.completed
    );

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((r) =>
        r.plantName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    filtered = filtered.filter((r) => {
      const reminderDate = new Date(r.reminderDate);
      const reminderDay = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate());

      switch (filter) {
        case "today":
          return reminderDay.getTime() === today.getTime();
        case "overdue":
          return reminderDay < today && !r.completed;
        case "upcoming":
          return reminderDay > today;
        default:
          return true;
      }
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime();
        case "date-desc":
          return new Date(b.reminderDate).getTime() - new Date(a.reminderDate).getTime();
        case "name-asc":
          return a.plantName.localeCompare(b.plantName);
        case "name-desc":
          return b.plantName.localeCompare(a.plantName);
        default:
          return 0;
      }
    });

    return filtered;
  }, [reminders, activeTab, filter, sort, searchQuery]);

  const getReminderStatus = (reminder: any) => {
    const now = new Date();
    const reminderDate = new Date(reminder.reminderDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const reminderDay = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate());

    if (reminder.completed) return { status: "completed", color: "text-green-600", bgColor: "bg-green-50" };
    if (reminderDay < today) return { status: "overdue", color: "text-red-600", bgColor: "bg-red-50" };
    if (reminderDay.getTime() === today.getTime()) return { status: "today", color: "text-blue-600", bgColor: "bg-blue-50" };
    return { status: "upcoming", color: "text-gray-600", bgColor: "bg-gray-50" };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  return (
    <>
      <Navbar />
      <div className="p-6 bg-black min-h-screen text-white">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-green-400 mb-2">
              Your Plant Reminders ⏰
            </h1>
            <p className="text-gray-400">
              Stay on top of your plant care schedule
            </p>
          </div>

          {/* Controls */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8">
            {/* Tabs */}
            <div className="flex gap-3 mb-6">
              <TabButton
                active={activeTab === "pending"}
                onClick={() => setActiveTab("pending")}
              >
                ⏳ Pending ({reminders.filter(r => !r.completed).length})
              </TabButton>

              <TabButton
                active={activeTab === "completed"}
                onClick={() => setActiveTab("completed")}
              >
                ✔ Completed ({reminders.filter(r => r.completed).length})
              </TabButton>
            </div>

            {/* Filters and Search */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Plants
                </label>
                <input
                  type="text"
                  placeholder="Type plant name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Filter by Date
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Reminders</option>
                  <option value="today">Due Today</option>
                  <option value="overdue">Overdue</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sort by
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortType)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="date-asc">Date (Earliest First)</option>
                  <option value="date-desc">Date (Latest First)</option>
                  <option value="name-asc">Plant Name (A-Z)</option>
                  <option value="name-desc">Plant Name (Z-A)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reminders List */}
          {filteredAndSortedReminders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {searchQuery || filter !== "all"
                  ? "No reminders match your filters"
                  : `No ${activeTab} reminders`}
              </h3>
              <p className="text-gray-500">
                {activeTab === "pending"
                  ? "Add some plants to your collection to get started with reminders!"
                  : "Completed reminders will appear here."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAndSortedReminders.map((r) => {
                const { status, color, bgColor } = getReminderStatus(r);
                return (
                  <div
                    key={r._id}
                    className={`rounded-xl p-6 shadow-lg transition-all hover:shadow-xl ${bgColor} border-l-4 ${
                      status === "overdue" ? "border-l-red-500" :
                      status === "today" ? "border-l-blue-500" :
                      status === "completed" ? "border-l-green-500" :
                      "border-l-gray-400"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">🌱</span>
                          <h3 className="text-xl font-bold text-gray-800">
                            {r.plantName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            status === "overdue" ? "bg-red-100 text-red-700" :
                            status === "today" ? "bg-blue-100 text-blue-700" :
                            status === "completed" ? "bg-green-100 text-green-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>

                        <div className="text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span>{new Date(r.reminderDate).toLocaleDateString()}</span>
                            <span className="text-sm text-gray-500">
                              ({formatDate(r.reminderDate)})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 ml-4">
                        {!r.completed ? (
                          <button
                            onClick={() => markDone(r._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                          >
                            ✅ Mark Done
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600 font-bold">
                            <span>✔</span>
                            <span>Completed</span>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Delete reminder for ${r.plantName}?`)) {
                              deleteReminder(r._id);
                            }
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
                          title="Delete reminder"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------- UI Components ---------- */

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-full font-bold cursor-pointer transition-all ${
        active
          ? "bg-green-600 text-white shadow-lg"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}
