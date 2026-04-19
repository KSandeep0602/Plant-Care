// lib/smartWatering.ts

export function getIndianSeason() {
  const month = new Date().getMonth() + 1;

  if (month >= 3 && month <= 6) return "Summer";
  if (month >= 7 && month <= 10) return "Monsoon";
  return "Winter";
}

export function getWateringFrequency(category: string, season: string) {
  if (category === "indoor") {
    if (season === "Summer") return 3;
    if (season === "Monsoon") return 1;
    return 2;
  }

  if (category === "flower") {
    if (season === "Summer") return 4;
    if (season === "Monsoon") return 2;
    return 2;
  }

  if (category === "tree") {
    if (season === "Summer") return 2;
    if (season === "Monsoon") return 1;
    return 1;
  }

  if (category === "fruit") {
    if (season === "Summer") return 3;
    if (season === "Monsoon") return 2;
    return 2;
  }

  return 2; // default
}

export function calculateNextWatering(frequencyPerWeek: number) {
  const today = new Date();
  const daysGap = Math.floor(7 / frequencyPerWeek);
  today.setDate(today.getDate() + daysGap);
  return today;
}
