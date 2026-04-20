"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handlePopupClick = (item: string) => {
    alert(`🚧 ${item} - Coming Soon!\n\nThis feature is currently under development. Please check back later for updates.`);
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-white font-bold text-lg mb-2">🌱 PlantPal</h3>
            <p className="text-sm">Smart AI-powered plant care assistant</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/home" className="hover:text-green-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-green-400 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="/search" className="hover:text-green-400 transition-colors">
                  Search Plants
                </a>
              </li>
              <li>
                <a href="/reminders" className="hover:text-green-400 transition-colors">
                  Reminders
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/account" className="hover:text-green-400 transition-colors">
                  My Account
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-green-400 transition-colors">
                  Login
                </a>
              </li>
              <li>
                <button
                  onClick={() => handlePopupClick("Sign Up")}
                  className="hover:text-green-400 transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold mb-3">More</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handlePopupClick("Privacy Policy")}
                  className="hover:text-green-400 transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePopupClick("Terms of Service")}
                  className="hover:text-green-400 transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => handlePopupClick("Contact Us")}
                  className="hover:text-green-400 transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-800 mb-6" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            © {currentYear} PlantPal. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <button
              onClick={() => handlePopupClick("Twitter")}
              className="hover:text-green-400 transition-colors cursor-pointer"
            >
              Twitter
            </button>
            <button
              onClick={() => handlePopupClick("Facebook")}
              className="hover:text-green-400 transition-colors cursor-pointer"
            >
              Facebook
            </button>
            <button
              onClick={() => handlePopupClick("Instagram")}
              className="hover:text-green-400 transition-colors cursor-pointer"
            >
              Instagram
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}