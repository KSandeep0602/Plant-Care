import "./globals.css";
import Navbar from "./components/Navbar";
import { ReminderProvider } from "./context/ReminderContext";
import "@/app/lib/whatsappCron";

export const metadata = {
  title: "PlantCare",
  description: "Plant care reminders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReminderProvider>
          <Navbar />
          {children}
        </ReminderProvider>
      </body>
    </html>
  );
}
