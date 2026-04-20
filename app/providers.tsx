"use client";

import { ReminderProvider } from "./context/ReminderContext";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReminderProvider>
      <div className="flex-1">{children}</div>
    </ReminderProvider>
  );
}
