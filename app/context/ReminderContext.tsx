"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Reminder = {
  _id: string;
  plantName: string;
  reminderDate: string;
  completed: boolean;
};

type ReminderContextType = {
  reminders: Reminder[];
  addReminder: (plantName: string, date: string) => Promise<void>;
  markDone: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
};

const ReminderContext = createContext<ReminderContextType | null>(null);

export function ReminderProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    fetch("/api/reminders")
      .then((res) => res.json())
      .then(setReminders);
  }, []);

  const addReminder = async (plantName: string, date: string) => {
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantName, reminderDate: date }),
    });

    const newReminder = await res.json();
    setReminders((prev) => [newReminder, ...prev]);
  };

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

export function useReminders() {
  const ctx = useContext(ReminderContext);
  if (!ctx) throw new Error("useReminders must be used inside provider");
  return ctx;
}
