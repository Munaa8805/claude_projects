"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { contact } from "@/lib/data";

const links = [
  ["Services", "#services"],
  ["Prices", "#prices"],
  ["Reviews", "#reviews"],
  ["Contact", "#contact"],
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${
        scrolled || open ? "bg-snow/90 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : ""
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8" aria-label="Main">
        <a href="#top" aria-label="Chinook Clean Co., back to top">
          <Logo />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="text-[15px] font-medium text-navy-soft hover:text-navy">
              {label}
            </a>
          ))}
          <a href={contact.phoneHref} className="text-[15px] font-semibold text-navy">
            {contact.phone}
          </a>
          <a
            href="#book"
            className="rounded-full bg-navy px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-sky"
          >
            Book a clean
          </a>
        </div>

        <button
          className="-mr-2 grid size-11 place-items-center rounded-full md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="relative block h-3 w-6">
            <span className={`absolute left-0 h-0.5 w-6 bg-navy transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 h-0.5 w-6 bg-navy transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
          </span>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 pb-6">
              {links.map(([label, href]) => (
                <a key={href} href={href} onClick={() => setOpen(false)} className="py-3 text-2xl font-semibold">
                  {label}
                </a>
              ))}
              <a
                href="#book"
                onClick={() => setOpen(false)}
                className="mt-3 rounded-full bg-navy px-5 py-3.5 text-center font-semibold text-white"
              >
                Book a clean
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
