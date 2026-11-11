const u = (id: string, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

export const images = {
  hero: u("1581578731548-c64695cc6952", 1200),
  spray: u("1563453392212-326f5e854473", 900),
  gloves: u("1585421514738-01798e348b17", 900),
};

export type ServiceId =
  | "standard"
  | "deep"
  | "move"
  | "reno"
  | "office"
  | "windows";

export type Service = {
  id: ServiceId;
  name: string;
  blurb: string;
  includes: string[];
  from: number;
  image: string;
  alt: string;
  color: string;
};

export const services: Service[] = [
  {
    id: "standard",
    name: "Regular home cleaning",
    blurb:
      "The same cleaner each visit, working from a checklist you can edit. Kitchens, bathrooms, floors, dusting, beds made.",
    includes: ["Kitchen counters & appliance fronts", "Bathrooms scrubbed", "Vacuum & mop every room", "Your own checklist"],
    from: 119,
    image: u("1586023492125-27b2c045efd7"),
    alt: "A bright living room with a yellow armchair and clean wooden floor",
    color: "var(--color-canola)",
  },
  {
    id: "deep",
    name: "Deep clean",
    blurb:
      "Top to bottom, including the places a weekly clean skips: baseboards, inside the oven and fridge, grout, vents and door frames.",
    includes: ["Inside oven & fridge", "Baseboards & door frames", "Grout & shower glass", "Vent covers & light switches"],
    from: 219,
    image: u("1584622650111-993a426fbf0a"),
    alt: "A spotless white bathroom with a glass shower",
    color: "var(--color-river)",
  },
  {
    id: "move",
    name: "Move-in & move-out",
    blurb:
      "Built around Calgary landlord walk-throughs. Empty cupboards, closets and appliances cleaned so you get your damage deposit back.",
    includes: ["Inside every cupboard", "Closets & shelving", "Appliances in and out", "Walls spot-washed"],
    from: 259,
    image: u("1513694203232-719a280e022f"),
    alt: "An empty, freshly cleaned room with a white dresser",
    color: "var(--color-rose)",
  },
  {
    id: "reno",
    name: "After renovation",
    blurb:
      "Drywall dust gets everywhere. We HEPA-vacuum surfaces and vents, wipe every ledge twice and haul the small debris away.",
    includes: ["HEPA dust removal", "Window tracks & sills", "Paint & sticker residue", "Debris bagged and removed"],
    from: 329,
    image: u("1600607687939-ce8a6c25118c"),
    alt: "A newly renovated open-plan living room with wood panelling",
    color: "var(--color-sky)",
  },
  {
    id: "office",
    name: "Office & studio",
    blurb:
      "Evening or weekend cleans for small offices, clinics and studios in the Beltline, downtown and beyond. Monthly invoicing.",
    includes: ["After-hours visits", "Kitchenette & washrooms", "Desks & touchpoints", "Recycling sorted"],
    from: 149,
    image: u("1497366216548-37526070297c"),
    alt: "A long clean office corridor with grey floors",
    color: "var(--color-canola)",
  },
  {
    id: "windows",
    name: "Windows & entryways",
    blurb:
      "Gravel, salt and chinook slush end up by the door all winter. Inside windows, tracks, mats and entry tiles brought back.",
    includes: ["Inside glass & frames", "Tracks vacuumed", "Salt stains lifted", "Mats & tile scrubbed"],
    from: 99,
    image: u("1581578949510-fa7315c4c350"),
    alt: "A cleaner mopping a front entryway near the door",
    color: "var(--color-river)",
  },
];

export const homeSizes = [
  { id: "studio", label: "Studio or 1 bed" },
  { id: "two", label: "2 bedrooms" },
  { id: "three", label: "3 bedrooms" },
  { id: "four", label: "4+ bedrooms" },
] as const;
export type HomeSize = (typeof homeSizes)[number]["id"];

export const frequencies = [
  { id: "once", label: "One time", off: 0 },
  { id: "monthly", label: "Monthly", off: 0.1 },
  { id: "biweekly", label: "Every 2 weeks", off: 0.15 },
  { id: "weekly", label: "Weekly", off: 0.2 },
] as const;
export type Frequency = (typeof frequencies)[number]["id"];

export const plans = [
  {
    id: "standard" as const,
    name: "Regular clean",
    note: "Kitchen, bathrooms, floors, dusting.",
    hours: { studio: "2 hrs", two: "2.5 hrs", three: "3.5 hrs", four: "4.5 hrs" },
    price: { studio: 119, two: 149, three: 189, four: 239 },
    recurring: true,
  },
  {
    id: "deep" as const,
    name: "Deep clean",
    note: "Everything above, plus oven, fridge, baseboards, grout.",
    hours: { studio: "3.5 hrs", two: "4.5 hrs", three: "6 hrs", four: "7.5 hrs" },
    price: { studio: 219, two: 279, three: 349, four: 429 },
    recurring: false,
  },
  {
    id: "move" as const,
    name: "Move-out clean",
    note: "An empty home, every cupboard and appliance.",
    hours: { studio: "4 hrs", two: "5 hrs", three: "6.5 hrs", four: "8 hrs" },
    price: { studio: 259, two: 329, three: 399, four: 489 },
    recurring: false,
  },
];

export const reviews = [
  {
    name: "Priya S.",
    area: "Kensington",
    service: "Every 2 weeks since 2023",
    quote:
      "Same cleaner every other Friday, and she remembers that the dog bed goes back by the window. I come home and the house just breathes again.",
    color: "var(--color-rose)",
  },
  {
    name: "Marc & Elodie",
    area: "Mahogany",
    service: "Move-out clean",
    quote:
      "Our landlord did the walk-through with a white glove, literally. Full deposit back. They even cleaned behind the fridge we forgot we had to pull out.",
    color: "var(--color-sky)",
  },
  {
    name: "Dr. Alan Wu",
    area: "Beltline clinic",
    service: "Office, weekly",
    quote:
      "They come in after we close on Thursdays and the waiting room is ready for Friday. One invoice a month, never a missed visit through two winters.",
    color: "var(--color-river)",
  },
  {
    name: "Teresa O.",
    area: "Tuscany",
    service: "After renovation",
    quote:
      "Three months of basement renovation dust, gone in a day. I didn't know vents could look like that. Worth every dollar.",
    color: "var(--color-canola)",
  },
];

export const areas = {
  NW: ["Kensington", "Tuscany", "Varsity", "Edgemont"],
  NE: ["Bridgeland", "Renfrew", "Saddle Ridge"],
  SW: ["Beltline", "Marda Loop", "Aspen Woods"],
  SE: ["Inglewood", "Mahogany", "Auburn Bay"],
};

export const contact = {
  phone: "(403) 555-0148",
  phoneHref: "tel:+14035550148",
  email: "hello@chinookclean.ca",
  hours: [
    ["Mon–Fri", "7am – 8pm"],
    ["Saturday", "8am – 6pm"],
    ["Sunday", "Office cleans only"],
  ],
};
