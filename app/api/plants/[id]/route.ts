import { NextResponse } from "next/server";

const API_KEY = process.env.TREFLE_API_KEY!;

// 🌦 Detect Indian Season
function getIndianSeason() {
  const month = new Date().getMonth() + 1;

  if (month >= 3 && month <= 6) return "Summer";
  if (month >= 7 && month <= 9) return "Monsoon";
  if (month >= 10 && month <= 11) return "Autumn";
  return "Winter";
}

// 🌿 Detect Category from common name
function detectCategory(name: string) {
  const lower = name.toLowerCase();

  if (lower.includes("rose") || lower.includes("jasmine") || lower.includes("lily"))
    return "Flower";

  if (lower.includes("mango") || lower.includes("apple") || lower.includes("banana"))
    return "Fruit";

  if (lower.includes("basil") || lower.includes("tulsi") || lower.includes("mint"))
    return "Herb";

  if (lower.includes("palm") || lower.includes("fern"))
    return "Indoor";

  return "Tree";
}

// 💧 Dynamic Watering Logic
function getWatering(category: string, season: string) {
  if (season === "Summer") return "3 times per week";
  if (season === "Monsoon") return "Once per week";

  if (category === "Herb") return "Twice per week";
  if (category === "Flower") return "Twice per week";
  if (category === "Indoor") return "Once per week";

  return "Once per week";
}

// 🤖 Smart AI Summary Generator
function generateSummary(name: string, category: string, season: string) {
  return `${name} is classified as a ${category} plant. During ${season}, it requires proper sunlight and moderate watering. Ensure well-drained soil and occasional fertilizing for healthy growth. Regular monitoring will help prevent pests and diseases.`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) return NextResponse.json({});

    const res = await fetch(
      `https://trefle.io/api/v1/plants/${id}?token=${API_KEY}`
    );

    const data = await res.json();
    const plant = data?.data;

    if (!plant) return NextResponse.json({});

    const season = getIndianSeason();
    const category = detectCategory(plant.common_name || "");
    const watering = getWatering(category, season);
    const summary = generateSummary(
      plant.common_name || plant.scientific_name,
      category,
      season
    );

    return NextResponse.json({
      id: plant.id,
      common_name: plant.common_name || plant.scientific_name,
      scientific_name: plant.scientific_name,
      family: plant.family,
      image: plant.image_url || null,
      description: plant.observations || "No description available.",
      season,
      category,
      watering,
      summary,
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({});
  }
}
