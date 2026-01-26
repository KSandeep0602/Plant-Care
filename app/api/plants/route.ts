import { NextResponse } from "next/server";

const PLANTS = [
  {
    name: "Neem",
    description: "Neem is a medicinal tree used widely in Ayurveda.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/3b/Azadirachta_indica.JPG",
  },
  {
    name: "Tulsi",
    description: "Tulsi is a sacred medicinal plant in India.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/6c/Ocimum_tenuiflorum2.jpg",
  },
  {
    name: "Aloe Vera",
    description: "Aloe Vera is used for skin care and healing.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/c5/Aloe_vera_flower.JPG",
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase() || "";

  const results = PLANTS.filter((plant) =>
    plant.name.toLowerCase().includes(query)
  );

  return NextResponse.json(results);
}
