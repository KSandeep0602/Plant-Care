"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar"

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
        setName(data.user.name || "");
        setDob(data.user.dob || "");
      }
    }

    fetchUser();
  }, []);

  const saveProfile = async () => {
    const res = await fetch("/api/auth/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, dob }),
    });

    const data = await res.json();

    if (res.ok) {
      setUser(data.user);
      setEditing(false);
      alert("Profile updated ✅");
    } else {
      alert("Error updating profile");
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout");
    router.push("/login");
  };

  if (!user) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-6 py-12">

          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-6">
              <span className="text-6xl">👤</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              My Account
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your profile and plant care preferences
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Profile Information
              </h2>
              <p className="text-green-100">
                Your personal details and account settings
              </p>
            </div>

            <div className="p-8">
              {!editing ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">📱</span>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Phone Number
                        </h3>
                      </div>
                      <p className="text-gray-600 text-lg">{user.phone}</p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">👤</span>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Full Name
                        </h3>
                      </div>
                      <p className="text-gray-600 text-lg">
                        {user.name || "Not set"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">🎂</span>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Date of Birth
                        </h3>
                      </div>
                      <p className="text-gray-600 text-lg">
                        {user.dob || "Not set"}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-center mb-3">
                        <span className="text-2xl mr-3">🌱</span>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Member Since
                        </h3>
                      </div>
                      <p className="text-gray-600 text-lg">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center pt-6">
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex items-center">
                      <span className="text-yellow-600 text-xl mr-2">⚠️</span>
                      <p className="text-yellow-800 font-medium">
                        You're editing your profile information
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        📝 Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        🎂 Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={saveProfile}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Account Actions
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <div className="text-center">
                  <span className="text-4xl mb-4 block">🌱</span>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    My Plants
                  </h3>
                  <p className="text-blue-600 mb-4">
                    View and manage your plant collection
                  </p>
                  <button
                    onClick={() => router.push('/')}
                    className="bg-blue-500 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors duration-300"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                <div className="text-center">
                  <span className="text-4xl mb-4 block">🚪</span>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Sign Out
                  </h3>
                  <p className="text-red-600 mb-4">
                    Securely log out of your account
                  </p>
                  <button
                    onClick={logout}
                    className="bg-red-500 text-white px-6 py-2 rounded-full font-medium hover:bg-red-600 transition-colors duration-300"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}