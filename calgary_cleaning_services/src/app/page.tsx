import { BookingProvider } from "@/components/BookingContext";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { OrderForm } from "@/components/OrderForm";
import { Pricing } from "@/components/Pricing";
import { Reviews } from "@/components/Reviews";
import { Services } from "@/components/Services";

export default function Home() {
  return (
    <BookingProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-navy focus:px-5 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <Services />
        <Pricing />
        <Reviews />
        <OrderForm />
      </main>
      <Contact />
    </BookingProvider>
  );
}
