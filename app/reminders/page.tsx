"use client";

import { useState } from "react";
import { useReminders } from "../context/ReminderContext";

export default function RemindersPage() {
  const { reminders, markDone, deleteReminder } = useReminders();
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");

  const filteredReminders = reminders.filter((r) =>
    activeTab === "pending" ? !r.completed : r.completed
  );

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        Your Reminders ⏰
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
        <button
          onClick={() => setActiveTab("pending")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            background: activeTab === "pending" ? "#16a34a" : "#1f2937",
            color: "white",
          }}
        >
          ⏳ Pending
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            background: activeTab === "completed" ? "#2563eb" : "#1f2937",
            color: "white",
          }}
        >
          ✔ Completed
        </button>
      </div>

      {/* Empty State */}
      {filteredReminders.length === 0 && (
        <p style={{ marginTop: "20px", color: "#9ca3af" }}>
          No {activeTab} reminders
        </p>
      )}

      {/* Reminder Cards */}
      {filteredReminders.map((r) => (
        <div
          key={r._id}
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "#0f172a",
            borderRadius: "8px",
            width: "280px",
            opacity: r.completed ? 0.6 : 1,
          }}
        >
          🌱 <b>{r.plantName}</b>
          <br />
          📅 {new Date(r.reminderDate).toDateString()}
          <br />

          <div explain style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            {!r.completed && (
              <button
                onClick={() => markDone(r._id)}
                style={{
                  padding: "6px 10px",
                  background: "#22c55e",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ✅ Mark Done
              </button>
            )}

            {r.completed && (
              <span style={{ color: "#22c55e", fontWeight: "bold" }}>
                ✔ Completed
              </span>
            )}

            <button
              onClick={() => deleteReminder(r._id)}
              style={{
                padding: "6px 10px",
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              🗑 Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
