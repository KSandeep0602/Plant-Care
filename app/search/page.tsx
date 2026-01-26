"use client";

import { useState } from "react";
import Image from "next/image";
import { useReminders } from "../context/ReminderContext";

type Plant = {
  name: string;
  description: string;
  image: string;
};

const PLANTS: Plant[] = [
  {
    name: "Tulsi",
    description: "A sacred plant known for boosting immunity.",
    image: "/plants/tulsi.jpg",
  },
  {
    name: "Money Plant",
    description: "Low maintenance indoor plant.",
    image: "/plants/money-plant.jpg",
  },
  {
    name: "Neem",
    description: "Medicinal plant with antibacterial properties.",
    image: "/plants/neem.jpg",
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [phone, setPhone] = useState("");

  const { addReminder } = useReminders();

  const filteredPlants = PLANTS.filter((plant) =>
    plant.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        Search Plants 🌱
      </h1>

      <p style={{ color: "#9ca3af", marginBottom: "16px" }}>
        Search plants by name.
      </p>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="Search plant..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="WhatsApp number (+91...)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {filteredPlants.map((plant) => (
          <div key={plant.name} style={{ width: 320 }}>
            <Image
              src={plant.image}
              alt={plant.name}
              width={320}
              height={180}
            />

            <h3>{plant.name}</h3>
            <p>{plant.description}</p>

            <button
              onClick={async () => {
                if (!date || !phone) {
                  alert("Please select date and enter WhatsApp number");
                  return;
                }

                // ✅ ONLY SAVE — CRON WILL SEND WHATSAPP
                await addReminder(plant.name, date, phone);

                setDate("");
                setPhone("");
                alert("✅ WhatsApp reminder scheduled!");
              }}
            >
              ⏰ Add WhatsApp Reminder
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
