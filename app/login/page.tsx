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
    if (!phone) {
      alert("Enter phone number");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
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

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
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
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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