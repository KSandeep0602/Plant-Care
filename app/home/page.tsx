"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function HomePage() {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    fetch("/api/reminders")
      .then((res) => res.json())
      .then((data) => setReminders(data));
  }, []);

  const today = new Date();

  const todaysWatering = reminders.filter((r: any) => {
    if (!r.nextWateringDate) return false;

    const d = new Date(r.nextWateringDate);

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return d >= start && d <= end;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="px-6 py-10">

      {/* LOGO + TITLE */}
      <div className="text-center mb-10">
        <img
          src="/logo.png"
          className="mx-auto w-32 mb-4 rounded-xl"
        />
        <h1 className="text-4xl font-bold text-green-400">
          Welcome to PlantPal 🌱
        </h1>
        <p className="text-gray-400 mt-2">
          Smart AI-powered plant care assistant
        </p>
      </div>
      <div className="bg-red-500 text-white p-10">
  Tailwind is working
</div>
      {/* DAILY TASKS */}
      <h2 className="text-2xl font-bold text-green-400 mb-4">
        Daily Tasks
      </h2>

      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-blue-200 text-black p-5 rounded-xl">
          💧 <b>Today's Watering</b>
          <p>{todaysWatering.length} plants need water</p>
        </div>

        <div className="bg-yellow-200 text-black p-5 rounded-xl">
          🌱 <b>Feeding</b>
          <p>Coming soon</p>
        </div>

        <div className="bg-gray-300 text-black p-5 rounded-xl">
          ☀️ <b>Sunlight</b>
          <p>Coming soon</p>
        </div>

      </div>

      {/* PLANT COLLECTION */}
      <h2 className="text-2xl font-bold text-green-400 mb-4">
        My Plant Collection
      </h2>

      {reminders.length === 0 ? (
        <p className="text-gray-400">No plants found...</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {reminders.map((r: any) => (
            <div
              key={r._id}
              className="bg-gray-900 p-4 rounded-xl"
            >
              🌿 <b>{r.plantName}</b>
              <p className="text-sm text-gray-400 mt-2">
                Next watering:{" "}
                {r.nextWateringDate
                  ? new Date(r.nextWateringDate).toDateString()
                  : "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}