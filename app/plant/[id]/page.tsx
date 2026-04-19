"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PlantDetails() {
  const params = useParams();
  const id = params?.id as string;

  const [plant, setPlant] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchPlant() {
      const res = await fetch(`/api/plants/${id}`);
      const data = await res.json();
      setPlant(data);
    }

    fetchPlant();
  }, [id]);

  // 🌿 INDIA SEASON DETECTION
  function getIndianSeason() {
    const month = new Date().getMonth() + 1;

    if (month >= 3 && month <= 6) return "Summer";
    if (month >= 7 && month <= 10) return "Monsoon";
    return "Winter";
  }

  // 💧 SMART WATERING LOGIC
  function getWateringAdvice(scientificName: string, season: string) {
    const name = scientificName?.toLowerCase() || "";

    // 🌹 Rose
    if (name.includes("rosa")) {
      if (season === "Summer") return "Water 3 times per week";
      if (season === "Monsoon") return "Water once per week";
      return "Water twice per week";
    }

    // 🌿 Tulsi
    if (name.includes("ocimum")) {
      if (season === "Summer") return "Water daily";
      if (season === "Monsoon") return "Water every 2 days";
      return "Water twice per week";
    }

    // 🌳 Neem
    if (name.includes("azadirachta")) {
      return "Water once per week";
    }

    // 🍈 Fruit plants
    if (name.includes("cucumis") || name.includes("mangifera")) {
      if (season === "Summer") return "Water 3–4 times per week";
      return "Water twice per week";
    }

    // 🌱 Default rule
    if (season === "Summer") return "Water twice per week";
    if (season === "Monsoon") return "Water once per week";
    return "Water once per week";
  }

  if (!plant) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  const currentSeason = getIndianSeason();
  const wateringAdvice = getWateringAdvice(
    plant.scientific_name,
    currentSeason
  );

  return (
    <div className="min-h-screen bg-black flex justify-center p-10">
      <div className="bg-white rounded-2xl w-[750px] overflow-hidden text-black">

        {/* IMAGE */}
        {plant.image ? (
          <img
            src={plant.image}
            alt={plant.common_name || "Plant Image"}
            className="w-full h-[400px] object-cover"
          />
        ) : (
          <div className="h-[400px] flex items-center justify-center bg-gray-200">
            No Image Available
          </div>
        )}

        <div className="p-8">

          {/* TITLE */}
          <h1 className="text-3xl font-bold text-green-600">
            {plant.common_name || "Unknown Plant"}
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-4 text-gray-700 leading-relaxed">
            {plant.description || "No description available."}
          </p>

          {/* FIRST ROW */}
          <div className="grid grid-cols-2 gap-4 mt-6">

            <div className="bg-blue-100 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-700">💧 Watering</h3>
              <p className="mt-1">{plant.watering}</p>
            </div>

            <div className="bg-green-100 p-4 rounded-xl">
              <h3 className="font-semibold text-green-700">🌿 Season</h3>
              <p className="mt-1">Current Season: {plant.season}</p>
            </div>

          </div>

          {/* SECOND ROW */}
          <div className="grid grid-cols-2 gap-4 mt-4">

            <div className="bg-green-200 p-4 rounded-xl">
              <h3 className="font-semibold text-green-800">🌡 Temperature</h3>
              <p className="mt-1">18°C - 26°C</p>
            </div>


            <div className="bg-yellow-200 p-4 rounded-xl">
              <h3 className="font-semibold text-yellow-800">☀ Sunlight</h3>
              <p className="mt-1">Bright indirect light</p>
            </div>

            <div className="bg-purple-200 p-4 rounded-xl">
              <h3 className="font-semibold text-purple-800">🌱 Fertilizer</h3>
              <p className="mt-1">Once a month</p>
            </div>
            <div className="bg-indigo-200 p-4 rounded-xl col-span-2">
              <h3 className="font-semibold text-indigo-800">🌿 Category</h3>
              <p className="mt-1">{plant.category}</p>
            </div>


          </div>


          <div className="mt-6 bg-green-50 p-5 rounded-xl">
            <h3 className="font-semibold text-green-700">🤖 AI Care Summary</h3>
            <p className="mt-2 text-gray-700">{plant.summary}</p>
          </div>
          {/* FAMILY INFO */}
          <div className="mt-6">
            <p>
              <strong>Family:</strong>{" "}
              {typeof plant.family === "object"
                ? plant.family?.name
                : plant.family || "Not available"}
            </p>

            <p>
              <strong>Scientific Name:</strong>{" "}
              {typeof plant.scientific_name === "object"
                ? plant.scientific_name?.name
                : plant.scientific_name || "Not available"}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
