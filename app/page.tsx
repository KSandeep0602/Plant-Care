"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();

  // Handle phone number input - only allow digits and limit to 10 characters
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      await sendOtp();
    } else {
      await verifyOtp();
    }
  };

  const sendOtp = async () => {
    // Validate phone number format
    if (!phone) {
      alert("Please enter your phone number");
      return;
    }

    if (phone.length !== 10) {
      alert("Please enter exactly 10 digits");
      return;
    }

    // Additional validation - ensure all characters are digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      alert("Phone number can only contain digits");
      return;
    }

    // Format phone number with +91 prefix for API
    const formattedPhone = `+91${phone}`;

    await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: formattedPhone }),
    });

    setOtpSent(true);
  };

  const verifyOtp = async () => {
    // Format phone number with +91 prefix for API (same as used for sending OTP)
    const formattedPhone = `+91${phone}`;

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: formattedPhone, otp }),
    });

    const data = await res.json();

    if (data.success) {
      router.push("/home"); // ✅ redirect after login
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex bg-black text-white">

      {/* LEFT SIDE */}
      <div className="w-1/2 relative hidden md:flex items-center justify-center">
        <img
          src="/plant-bg.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        <div className="relative p-10 max-w-md">
          <h1 className="text-4xl font-bold mb-6">Our Project</h1>

          <p className="text-gray-300 mb-6">
            Welcome to the Smart AI Plant Care System – a platform that helps
            monitor and manage plants efficiently using smart technology.
          </p>

          <ul className="space-y-3 text-gray-300">
            <li>✔ Real-time plant monitoring</li>
            <li>✔ Smart watering alerts</li>
            <li>✔ AI-based plant care</li>
          </ul>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-[350px]">

          <h2 className="text-3xl font-bold mb-2">Log in</h2>
          <p className="text-gray-400 mb-6">
            Welcome Back! Please log in to your account.
          </p>

          <input
            type="tel"
            placeholder="Enter 10-digit phone number"
            value={phone}
            onChange={handlePhoneChange}
            maxLength={10}
            pattern="[0-9]{10}"
            inputMode="numeric"
            className="w-full p-3 mb-4 bg-gray-800 rounded"
          />

          {otpSent && (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 mb-4 bg-gray-800 rounded"
            />
          )}

          {!otpSent ? (
            <button
              type="submit"
              className="w-full bg-blue-600 py-3 rounded"
            >
              Send OTP
            </button>
          ) : (
            <button
              type="submit"
              className="w-full bg-blue-600 py-3 rounded"
            >
              Submit
            </button>
          )}

        </form>
      </div>
    </div>
  );
}