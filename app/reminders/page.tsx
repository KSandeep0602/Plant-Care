"use client";

import { useState } from "react";
import { useReminders } from "../context/ReminderContext";
import Navbar from "../components/Navbar";

export default function RemindersPage() {
  const { reminders, markDone, deleteReminder } = useReminders();
  const [activeTab, setActiveTab] =
    useState<"pending" | "completed">("pending");

  const filteredReminders = reminders.filter((r) =>
    activeTab === "pending" ? !r.completed : r.completed
  );

  return (
    <>
    <Navbar/>
    <div className="p-10 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-extrabold">
        Your Reminders ⏰
      </h1>

      {/* Tabs */}
      <div className="flex gap-3 mt-5">
        <TabButton
          active={activeTab === "pending"}
          onClick={() => setActiveTab("pending")}
        >
          ⏳ Pending
        </TabButton>

        <TabButton
          active={activeTab === "completed"}
          onClick={() => setActiveTab("completed")}
        >
          ✔ Completed
        </TabButton>
      </div>

      {filteredReminders.length === 0 && (
        <p className="mt-6 text-gray-400">
          No {activeTab} reminders
        </p>
      )}

      <div className="mt-7 flex flex-col gap-4">
        {filteredReminders.map((r) => (
          <div
            key={r._id}
            className="bg-white p-5 rounded-2xl flex justify-between items-center shadow-lg text-black"
          >
            <div>
              <b>🌱 {r.plantName}</b>
              <div className="text-gray-600">
                📅 {new Date(r.reminderDate).toDateString()}
              </div>
            </div>

            <div className="flex gap-3">
              {!r.completed ? (
                <button
                  onClick={() => markDone(r._id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600"
                >
                  Mark Done
                </button>
              ) : (
                <span className="text-green-600 font-bold">
                  Completed ✔
                </span>
              )}

              <button
                onClick={() => deleteReminder(r._id)}
                className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

/* ---------- small UI helpers ---------- */

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
      className={`px-5 py-3 rounded-full font-bold cursor-pointer ${
        active
          ? "bg-green-600 text-white"
          : "bg-gray-200 text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}
