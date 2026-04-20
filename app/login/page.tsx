"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // ✅ Check if already logged in
  useEffect(() => {
    async function checkLogin() {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.user) {
        router.push("/account");
      }
    }

    checkLogin();
  }, []);

  // 📩 Send OTP
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

    setLoading(true);

    // Format phone number with +91 prefix for API
    const formattedPhone = `+91${phone}`;

    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: formattedPhone }),
    });

    const data = await res.json().catch(() => ({}));

    setLoading(false);
    setOtpSent(true);

    // In local dev, the API returns devOtp so you can test without SMS.
    if (data?.devOtp) {
      setDevOtp(String(data.devOtp));
    } else {
      setDevOtp(null);
    }
  };

  // 🔐 Verify OTP
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      alert("Enter valid 6 digit OTP");
      return;
    }

    // Format phone number with +91 prefix for API (same as used for sending OTP)
    const formattedPhone = `+91${phone}`;

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: formattedPhone,
        otp,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Invalid OTP");
      return;
    }

    // ✅ Login success
    router.push("/account");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      await sendOtp();
    } else {
      await verifyOtp();
    }
  };

  // Handle phone number input - only allow digits and limit to 10 characters
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove all non-digits
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl w-[320px] text-black"
      >
        <h2 className="text-xl font-bold text-green-600 mb-4">
          Login to PlantCare
        </h2>

        {!otpSent ? (
          <>
            <input
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={10}
              pattern="[0-9]{10}"
              inputMode="numeric"
              className="w-full border px-3 py-2 rounded mb-4"
            />

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-full font-semibold"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <p className="text-sm mt-3 text-gray-600">
              OTP based login (WhatsApp / SMS)
            </p>
          </>
        ) : (
          <>
            {devOtp && (
              <p className="text-xs text-gray-600 mb-2">
                Dev OTP: <span className="font-mono">{devOtp}</span>
              </p>
            )}
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-full font-semibold"
            >
              Verify OTP
            </button>
          </>
        )}
      </form>
    </div>
  );
}