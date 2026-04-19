"use client";

import { ReminderProvider } from "./context/ReminderContext";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReminderProvider>{children}</ReminderProvider>;
}
