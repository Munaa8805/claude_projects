"use client";

import { MotionConfig } from "motion/react";
import { createContext, useContext, useState } from "react";
import type { Frequency, HomeSize, ServiceId } from "@/lib/data";

type Draft = { service: ServiceId; size: HomeSize; frequency: Frequency };

const Ctx = createContext<{
  draft: Draft;
  setDraft: (d: Partial<Draft>) => void;
} | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [draft, set] = useState<Draft>({
    service: "standard",
    size: "two",
    frequency: "biweekly",
  });
  const setDraft = (d: Partial<Draft>) => set((prev) => ({ ...prev, ...d }));
  return (
    <MotionConfig reducedMotion="user">
      <Ctx.Provider value={{ draft, setDraft }}>{children}</Ctx.Provider>
    </MotionConfig>
  );
}

export function useBooking() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useBooking must be used inside BookingProvider");
  return v;
}

/** Fill the booking form with a choice and scroll to it. */
export function useBookNow() {
  const { setDraft } = useBooking();
  return (d: Partial<Draft>) => {
    setDraft(d);
    document.getElementById("book")?.scrollIntoView();
    window.setTimeout(() => document.getElementById("book-start")?.focus({ preventScroll: true }), 600);
  };
}
