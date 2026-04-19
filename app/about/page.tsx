import Navbar from "../components/Navbar";
export default function About() {
  return (
    <>
    <Navbar />
    <main className="p-10 max-w-4xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold text-green-500">
        About PlantCare
      </h1>

      <p className="text-gray-300">
        PlantCare is a smart plant management platform inspired by apps like
        Plantora. It helps users identify plants, manage care routines, and
        receive timely reminders.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold mb-2">🌿 What we offer</h3>
          <ul className="list-disc ml-5 text-gray-700">
            <li>Plant identification using images</li>
            <li>Watering & fertilizer reminders</li>
            <li>WhatsApp & Email alerts</li>
            <li>Home & agriculture plant care</li>
          </ul>
        </div>

        <img
          src="https://images.unsplash.com/photo-1524594167590-2bb5f3f95f6a"
          className="rounded-xl"
        />
      </div>
    </main>
    </>
  );
}
