import "./globals.css"

import Providers from "./providers";
import Footer from "./components/Footer";

export const metadata = {
  title: 'PlantCare',
  description: 'Smart AI Plant Care System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  )
}