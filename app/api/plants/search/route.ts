import { NextResponse } from "next/server";

const API_KEY = process.env.TREFLE_API_KEY!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ plants: [] });
  }

  try {
    const response = await fetch(
      `https://trefle.io/api/v1/plants/search?token=${API_KEY}&q=${query}`
    );

    const data = await response.json();

    const plants =
      data.data?.map((plant: any) => ({
        id: plant.id,
        name: plant.common_name || plant.scientific_name,
        scientific_name: plant.scientific_name,
        image:
          plant.image_url || "/no-image.jpg",
      })) || [];

    return NextResponse.json({ plants });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ plants: [] });
  }
}
