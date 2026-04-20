import Navbar from "../components/Navbar";

export default function About() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-6 py-12">

          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
              <span className="text-6xl">🌱</span>
            </div>
            <h1 className="text-5xl font-bold text-green-800 mb-4">
              About PlantCare
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transform your plant care routine with our comprehensive platform.
              Inspired by innovative apps like Plantora, we help you nurture
              your green friends with personalized reminders and expert guidance.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-green-100">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-green-700 mb-3">
                Plant Search
              </h3>
              <p className="text-gray-600">
                Search through our comprehensive plant database to find detailed
                care information for your favorite plants and discover new ones.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-blue-100">
              <div className="text-4xl mb-4">💧</div>
              <h3 className="text-2xl font-bold text-blue-700 mb-3">
                Smart Reminders
              </h3>
              <p className="text-gray-600">
                Set personalized watering, feeding, and sunlight reminders
                tailored to each plant's specific care requirements.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-yellow-100">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-yellow-700 mb-3">
                Instant Alerts
              </h3>
              <p className="text-gray-600">
                Receive WhatsApp and email notifications to never miss a watering
                or fertilizing session again.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-purple-100">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="text-2xl font-bold text-purple-700 mb-3">
                Care Guides
              </h3>
              <p className="text-gray-600">
                Access detailed care guides for home plants, including watering
                schedules, sunlight requirements, and feeding tips.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-red-100">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-red-700 mb-3">
                Daily Tasks
              </h3>
              <p className="text-gray-600">
                Track your daily plant care activities with an intuitive dashboard
                showing today's watering, feeding, and sunlight tasks.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-indigo-100">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-2xl font-bold text-indigo-700 mb-3">
                User Accounts
              </h3>
              <p className="text-gray-600">
                Create personalized accounts to manage your plant collection,
                save reminders, and track your gardening progress.
              </p>
            </div>

          </div>

          {/* Image Section */}
          <div className="bg-white rounded-3xl p-8 shadow-xl mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Grow Your Green Family
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Whether you're a beginner gardener or an experienced
                  horticulturist, PlantCare adapts to your needs. Our platform
                  supports home plant care with personalized reminders and
                  comprehensive care guides to ensure every plant thrives.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                    🌱 Beginner Friendly
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                    📱 Mobile Alerts
                  </div>
                  <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-semibold">
                    📅 Daily Tracking
                  </div>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/plant-bg.jpg"
                  alt="Beautiful garden"
                  className="rounded-2xl shadow-lg w-full h-80 object-cover"
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-4 shadow-lg">
                  <span className="text-2xl">✨</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Plant Care?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of plant enthusiasts who have revolutionized their
              gardening experience with PlantCare.
            </p>
            <button className="bg-white text-green-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg">
              Get Started Today
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
