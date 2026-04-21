import { NextResponse } from "next/server";
import { categoryCare, specificCare } from "@/data/plantCare";

const API_KEY = process.env.TREFLE_API_KEY!;

// Local plant database with comprehensive information
const localPlants = [
  {
    id: "grape",
    name: "Grape Vine",
    scientific_name: "Vitis vinifera",
    description: "Grapes are delicious fruits that grow on vines. They come in various colors including green, red, and purple. Grapes are used for eating fresh, making wine, juice, and raisins.",
    image: "/plants/grape.jpg",
    category: "outdoor",
    difficulty: "medium",
    sunlight: "Full sunlight (6-8 hours daily)",
    watering: "Regular watering, keep soil moist but not waterlogged",
    temperature: "15°C - 30°C",
    fertilizer: "Balanced fertilizer every 4-6 weeks during growing season"
  },
  {
    id: "neem",
    name: "Neem",
    scientific_name: "Azadirachta indica",
    description: "Neem is a powerful medicinal plant widely used in Ayurveda. It has antibacterial, antifungal, and antiviral properties. Neem helps in skin care, immunity boosting, and natural pest control.",
    image: "/plants/neem.jpg",
    category: "outdoor",
    difficulty: "easy",
    sunlight: "Full sunlight",
    watering: "Twice a week",
    temperature: "20°C - 35°C",
    fertilizer: "Once a month"
  },
  {
    id: "tulsi",
    name: "Tulsi (Holy Basil)",
    scientific_name: "Ocimum sanctum",
    description: "Tulsi (Holy Basil) is a sacred plant known for improving immunity, reducing stress, and treating respiratory problems. It requires regular sunlight and moderate watering.",
    image: "/plants/tulsi.jpg",
    category: "outdoor",
    difficulty: "easy",
    sunlight: "Full sunlight",
    watering: "Daily light watering",
    temperature: "20°C - 35°C",
    fertilizer: "Organic compost monthly"
  },
  {
    id: "money-plant",
    name: "Money Plant",
    scientific_name: "Epipremnum aureum",
    description: "Money Plant is a low-maintenance indoor plant believed to bring good luck and purify air. It grows well in water or soil and needs indirect sunlight.",
    image: "/plants/money-plant.jpg",
    category: "indoor",
    difficulty: "easy",
    sunlight: "Bright indirect light",
    watering: "Every 5-7 days",
    temperature: "18°C - 30°C",
    fertilizer: "Every 2-3 months"
  },
  {
    id: "aloe-vera",
    name: "Aloe Vera",
    scientific_name: "Aloe barbadensis miller",
    description: "Aloe Vera is a succulent plant known for its healing properties. The gel inside its leaves is used for skin care, burns, and digestive health.",
    image: "/plants/aloe-vera.jpg",
    category: "succulent",
    difficulty: "easy",
    sunlight: "Direct sunlight",
    watering: "Once every 10-14 days",
    temperature: "18°C - 30°C",
    fertilizer: "Rarely (3-4 months)"
  },
  {
    id: "rose",
    name: "Rose",
    scientific_name: "Rosa",
    description: "Roses are beautiful flowering plants known for their fragrant flowers. They come in many colors and varieties, symbolizing love and beauty.",
    image: "/plants/rose.jpg",
    category: "flowering",
    difficulty: "medium",
    sunlight: "Full sunlight",
    watering: "2-3 times per week",
    temperature: "15°C - 28°C",
    fertilizer: "Every 2 weeks during blooming"
  },
  {
    id: "basil",
    name: "Basil",
    scientific_name: "Ocimum basilicum",
    description: "Basil is an aromatic herb used in cooking. It has a strong, pungent flavor and is commonly used in Italian and Thai cuisine.",
    image: "/plants/basil.jpg",
    category: "herb",
    difficulty: "easy",
    sunlight: "Full sunlight",
    watering: "Daily light watering",
    temperature: "20°C - 30°C",
    fertilizer: "Every 2-3 weeks"
  }
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ plants: [] });
  }

  try {
    // First, search in local plants database
    const localResults = localPlants.filter(plant =>
      plant.name.toLowerCase().includes(query.toLowerCase()) ||
      plant.scientific_name.toLowerCase().includes(query.toLowerCase()) ||
      plant.id.toLowerCase().includes(query.toLowerCase())
    );

    // If we have local results, return them
    if (localResults.length > 0) {
      return NextResponse.json({ plants: localResults });
    }

    // If no local results, try Trefle API
    const response = await fetch(
      `https://trefle.io/api/v1/plants/search?token=${API_KEY}&q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      return NextResponse.json({ plants: [] });
    }

    const data = await response.json();

    // Enhance Trefle data with care information
    const plants = data.data?.map((plant: any) => {
      const plantName = plant.common_name || plant.scientific_name;
      const careInfo = specificCare[plantName?.toLowerCase()] ||
                      categoryCare[plant.category] ||
                      categoryCare['outdoor'];

      return {
        id: plant.id,
        name: plantName,
        scientific_name: plant.scientific_name,
        description: plant.description || `${plantName} is a beautiful plant that requires proper care to thrive.`,
        image: plant.image_url || "/no-image.jpg",
        category: plant.category || "outdoor",
        difficulty: careInfo ? "medium" : "easy",
        sunlight: careInfo?.sunlight || "Full sunlight",
        watering: careInfo?.watering || "Regular watering",
        temperature: careInfo?.temperature || "20°C - 30°C",
        fertilizer: careInfo?.fertilizer || "Every 4-6 weeks"
      };
    }) || [];

    return NextResponse.json({ plants });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ plants: [] });
  }
}
