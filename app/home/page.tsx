"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { plantsData } from "../lib/plantsData";

export default function HomePage() {
  const [reminders, setReminders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/reminders")
      .then((res) => res.json())
      .then((data) => setReminders(data));
  }, []);

  const getReminderDate = (r: any) => {
    const dateValue = r.nextWateringDate ?? r.reminderDate;
    const parsed = dateValue ? new Date(dateValue) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
  };

  const todaysWatering = reminders.filter((r: any) => {
    const d = getReminderDate(r);
    if (!d) return false;

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return d >= start && d <= end;
  });

  const getPlantKey = (plantName: string) =>
    plantName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const feedingCount = reminders.filter((r: any) => {
    const key = getPlantKey(r.plantName || "");
    const care = plantsData[key];
    return care && care.fertilizer && !care.fertilizer.toLowerCase().includes("no fertilizer");
  }).length;

  const sunlightCount = reminders.filter((r: any) => {
    const key = getPlantKey(r.plantName || "");
    const care = plantsData[key];
    return care ? Boolean(care.sunlight) : true;
  }).length;

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
          <p>{feedingCount} plants need feeding</p>
        </div>

        <div className="bg-gray-300 text-black p-5 rounded-xl">
          ☀️ <b>Sunlight</b>
          <p>{sunlightCount} plants need sunlight</p>
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
                {getReminderDate(r)
                  ? getReminderDate(r)!.toDateString()
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