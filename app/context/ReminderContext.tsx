"use client";

import { createContext, useContext, useEffect, useState } from "react";

/* =========================
   TYPES
========================= */
type Reminder = {
  _id: string;
  plantName: string;
  reminderDate: string;
  phone: string;
  completed: boolean;
};

type ReminderContextType = {
  reminders: Reminder[];
  addReminder: (
    plantName: string,
    date: string,
    phone: string
  ) => Promise<void>;
  markDone: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
};

/* =========================
   CONTEXT
========================= */
const ReminderContext = createContext<ReminderContextType | null>(null);

/* =========================
   PROVIDER
========================= */
export function ReminderProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Load reminders on app start
  useEffect(() => {
    fetch("/api/reminders")
      .then((res) => res.json())
      .then(setReminders);
  }, []);

  /* =========================
     ADD REMINDER (FIXED)
  ========================= */
  const addReminder = async (
    plantName: string,
    date: string,
    phone: string
  ) => {
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plantName,
        reminderDate: date,
        phone, // ✅ REQUIRED
      }),
    });

    const newReminder = await res.json();
    setReminders((prev) => [newReminder, ...prev]);
  };

  /* =========================
     MARK DONE
  ========================= */
  const markDone = async (id: string) => {
    const res = await fetch("/api/reminders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const updated = await res.json();
    setReminders((prev) =>
      prev.map((r) => (r._id === id ? updated : r))
    );
  };

  /* =========================
     DELETE REMINDER
  ========================= */
  const deleteReminder = async (id: string) => {
    await fetch("/api/reminders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setReminders((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <ReminderContext.Provider
      value={{ reminders, addReminder, markDone, deleteReminder }}
    >
      {children}
    </ReminderContext.Provider>
  );
}

/* =========================
   HOOK
========================= */
export function useReminders() {
  const ctx = useContext(ReminderContext);
  if (!ctx) {
    throw new Error("useReminders must be used inside ReminderProvider");
  }
  return ctx;
}
