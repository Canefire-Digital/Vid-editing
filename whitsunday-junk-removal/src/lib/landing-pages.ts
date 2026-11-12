/**
 * Suburb and service landing pages. Each one is a real page at /{slug} with
 * its own title, copy, FAQ and schema, sharing the calculator and quote form.
 * Keep the local details true — update them when something changes on the ground.
 */

export const AREAS = [
  "Airlie Beach",
  "Cannonvale",
  "Jubilee Pocket",
  "Cannon Valley",
  "Mandalay",
  "Shute Harbour",
  "Woodwark",
  "Riordanvale",
  "Gunyarra",
  "Proserpine",
  "Conway Beach",
  "Hydeaway Bay",
  "Dingo Beach",
  "Bowen",
];

export type Faq = { q: string; a: string };

export type LandingPage = {
  slug: string;
  kind: "area" | "service";
  /** Short name for menus and link lists */
  navLabel: string;
  /** <title> — keep under ~60 characters */
  title: string;
  /** meta description — keep under ~155 characters */
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  /** Three quick proof points under the intro */
  points: string[];
  sections: { heading: string; body: string[] }[];
  /** "Common jobs" chips — also seed the calculator conversation */
  commonJobs: string[];
  faqs: Faq[];
  /** For area pages: the town used in schema areaServed */
  place?: string;
  /** Service pages: the schema serviceType */
  serviceType?: string;
};

const PRICE_FAQ: Faq = {
  q: "How much does junk removal cost?",
  a: "By how much of our 12×6 ft cage trailer you fill: quarter, half, three-quarter or full load, with fixed prices for each. Tip fees for things the council charges extra for (mattresses, fridges, tyres) are added at cost and shown before you book. Use the calculator on this page for an instant estimate — we confirm the exact price on site before we lift anything.",
};
const ACCESS_FAQ: Faq = {
  q: "Do I need to be there?",
  a: "Not if we can get to the items. Leave a gate or garage open, or give us a lockbox code, and we'll send before and after photos when it's done.",
};
const CANT_TAKE_FAQ: Faq = {
  q: "What can't you take?",
  a: "Asbestos, chemicals, liquid paint, gas bottles, car batteries and medical waste. Everything else household, garden and light reno is fine — if you're not sure, ask and we'll point you to the right place.",
};

export const LANDING_PAGES: LandingPage[] = [
  // ───────────────────────── Areas ─────────────────────────
  {
    slug: "rubbish-removal-airlie-beach",
    kind: "area",
    navLabel: "Airlie Beach",
    place: "Airlie Beach",
    title: "Rubbish Removal Airlie Beach | Same-Visit Junk Removal",
    description:
      "Junk and rubbish removal in Airlie Beach: holiday apartments, hillside homes and Main Street businesses. Fixed load prices, we do the lifting, gone the same visit.",
    eyebrow: "Airlie Beach · Jubilee Pocket · Shute Harbour · Mandalay",
    h1: "Rubbish removal in Airlie Beach",
    intro:
      "Airlie's steep blocks, tight driveways and apartment complexes are exactly why people call us instead of hiring a trailer. We carry everything out, from the top floor or the bottom of the hill, and it's gone in the one visit.",
    points: ["Apartments, body-corporate complexes and holiday lets", "We handle stairs, lifts and tight access", "Before and after photos for owners and managers"],
    sections: [
      {
        heading: "Holiday lets and apartment turnovers",
        body: [
          "A lot of our Airlie Beach work is furniture swaps for holiday apartments: old lounges, beds and outdoor settings out, new ones in. We work around check-out and check-in times and keep common areas clean, so the body corporate never hears about it.",
          "Property managers can set up an account so each job is one invoice with photos attached, no cash on the day.",
        ],
      },
      {
        heading: "Hillside homes and tricky access",
        body: [
          "If your place is up one of the hills off Shute Harbour Road or Waterson Way, you already know a skip bin won't fit and the council won't come up the driveway. Our crew carries items down to the trailer by hand; price is by what fills the trailer, not by how many stairs we climb.",
          "Tell us about the access in the quote form (steep driveway, no parking, gated complex) so we bring the right number of hands.",
        ],
      },
      {
        heading: "Where it goes",
        body: [
          "General waste from Airlie goes to the council's Kelsey Creek landfill outside Proserpine, where we're weighed in and charged per tonne. Scrap metal and e-waste are dropped free, and we pass that saving on, which is why a load of old appliances costs less than a load of soft furniture.",
        ],
      },
    ],
    commonJobs: ["Holiday-let furniture swap", "Apartment move-out", "Balcony and courtyard clear", "Old mattresses and bases", "Office or shop clean-out on Main Street"],
    faqs: [
      PRICE_FAQ,
      { q: "Can you get a trailer into my complex?", a: "Usually. Most Airlie complexes have a loading bay or visitor parking we can use for twenty minutes. If not, we park on the street and carry — it doesn't change the price." },
      ACCESS_FAQ,
      CANT_TAKE_FAQ,
    ],
  },
  {
    slug: "rubbish-removal-cannonvale",
    kind: "area",
    navLabel: "Cannonvale",
    place: "Cannonvale",
    title: "Rubbish Removal Cannonvale | Household & Garden Junk",
    description:
      "Rubbish and junk removal in Cannonvale and Cannon Valley: garage clear-outs, green waste, old furniture and whitegoods. Fixed load pricing from $180, we do the lifting.",
    eyebrow: "Cannonvale · Cannon Valley · Woodwark · Riordanvale",
    h1: "Rubbish removal in Cannonvale",
    intro:
      "Cannonvale is where most of the Whitsundays actually lives, and most of our jobs are the everyday kind: a garage that's finally getting sorted, a yard after a big prune, a house being cleared before new tenants. Fixed load prices, no quotes to chase, no trailer to hire.",
    points: ["Family homes, units and the newer estates", "Green waste, garage junk, old appliances", "Book around school runs and work hours"],
    sections: [
      {
        heading: "Garage and shed clear-outs",
        body: [
          "The classic Cannonvale job: a double garage that hasn't fitted a car in years. We sort as we load, so scrap metal and e-waste (which the tip takes for free) stay separate from general waste you pay per tonne for. Most garages are a half to full trailer load.",
          "Not sure how much there is? Add things up in the calculator below or just send a couple of photos through the quote form.",
        ],
      },
      {
        heading: "Garden and storm clean-ups",
        body: [
          "Palm fronds, hedge trimmings and branches after a blow go to the tip as green waste, which is charged at a fraction of the general-waste rate. If the pile is mostly green, your price drops accordingly. We take tree stumps and anything over 300 mm thick too, just tell us so we can price it right.",
        ],
      },
      {
        heading: "Pre-sale and pre-tenancy clears",
        body: [
          "Selling or re-letting a Cannonvale house? We clear the leftovers before the cleaners and photographers come through, and we can leave a before and after record for the agent. Real estate agencies can run jobs on account.",
        ],
      },
    ],
    commonJobs: ["Garage clear-out", "Green waste after pruning", "Old fridge, washer and dryer", "Moving-out leftovers", "Kids' trampoline and play gear"],
    faqs: [
      PRICE_FAQ,
      { q: "Is green waste cheaper?", a: "Yes. The council charges green waste at a much lower rate per tonne than general waste, so a trailer of palm fronds costs noticeably less than a trailer of furniture. Keep green waste separate if you can and we'll price it that way." },
      ACCESS_FAQ,
      CANT_TAKE_FAQ,
    ],
  },
  {
    slug: "rubbish-removal-proserpine",
    kind: "area",
    navLabel: "Proserpine",
    place: "Proserpine",
    title: "Rubbish Removal Proserpine | Local Junk & Shed Clear-Outs",
    description:
      "Junk removal in Proserpine and surrounds: old Queenslanders, rural blocks, sheds and estates. We load, haul to Kelsey Creek and take care of the tip fees.",
    eyebrow: "Proserpine · Gunyarra · Conway Beach · Kelsey Creek",
    h1: "Rubbish removal in Proserpine",
    intro:
      "Proserpine jobs tend to be bigger: older homes with decades in the shed, acreage blocks with a junk pile out the back, estates being settled. Being a few minutes from the Kelsey Creek landfill means multi-trailer jobs here are quick and keep costs down.",
    points: ["Sheds, acreage piles and estate clear-outs", "Minutes from the Kelsey Creek landfill", "We separate metal and green waste to lower the tip bill"],
    sections: [
      {
        heading: "Big clear-outs, done in a day",
        body: [
          "Because the tip is so close, we can run two or three trailer loads from a Proserpine property in a morning. You pay per load plus the actual tip fees, and we show you the tally as we go. Scrap metal, old machinery and steel are free at the gate, so an old-shed job is often cheaper than it looks.",
        ],
      },
      {
        heading: "Deceased estates and downsizing",
        body: [
          "Many Proserpine families call us when a parent's home needs clearing. We take it at your pace: you flag what stays, we handle the rest respectfully, and we can split the job over a couple of visits if that's easier. Read more on our deceased estate clear-out page.",
        ],
      },
      {
        heading: "Rural and semi-rural blocks",
        body: [
          "Long driveways and no neighbours are a plus for us: we can bring the trailer right to the pile. For larger farm clean-ups (fencing wire, old troughs, machinery) send photos and we'll quote it as a job rather than by the load.",
        ],
      },
    ],
    commonJobs: ["Old shed contents", "Estate house clear", "Yard junk pile", "Old whitegoods and steel", "Pre-sale tidy for an older home"],
    faqs: [
      PRICE_FAQ,
      { q: "Do you charge travel to Proserpine?", a: "No. Proserpine is in our normal service area and prices are the same as Airlie and Cannonvale." },
      { q: "Can you take sheds full of mixed stuff?", a: "Yes, that's most of what we do here. We sort as we load so the free streams (metal, e-waste) and the cheap stream (green waste) don't get weighed in as general waste." },
      CANT_TAKE_FAQ,
    ],
  },
  {
    slug: "rubbish-removal-bowen",
    kind: "area",
    navLabel: "Bowen",
    place: "Bowen",
    title: "Rubbish Removal Bowen | Junk Removal by Arrangement",
    description:
      "Junk and rubbish removal in Bowen, Queens Beach and surrounds by arrangement. Full-load jobs and multi-trailer clear-outs, fixed pricing plus tip fees at cost.",
    eyebrow: "Bowen · Queens Beach · Horseshoe Bay · Merinda",
    h1: "Rubbish removal in Bowen",
    intro:
      "We're based in the Whitsundays and run up to Bowen for bigger jobs: full trailer loads, house clears and commercial clean-outs. Because of the drive, we group Bowen jobs together, so tell us your timing and we'll fit you into the next run.",
    points: ["Full-load and multi-load jobs", "Tip fees at council rates", "Book ahead for the next Bowen run"],
    sections: [
      {
        heading: "How Bowen jobs work",
        body: [
          "Send photos or use the calculator, and we'll confirm the price and a date. For loads under a full trailer we may suggest waiting until we have another Bowen job the same day, which keeps your price at the standard rate. Urgent single small loads can be done but may carry a travel charge, which we'll tell you up front.",
        ],
      },
      {
        heading: "Farm, shed and house clear-outs",
        body: [
          "Bowen's older homes and rural properties produce the same kind of jobs as Proserpine: sheds, estates, yard piles. Scrap metal is free at the tip and we keep it separate so you don't pay general-waste rates on steel.",
        ],
      },
    ],
    commonJobs: ["Whole-house clear", "Shed and yard pile", "Holiday-house furniture swap", "Commercial clean-out"],
    faqs: [
      { q: "Is there a travel charge for Bowen?", a: "Full-load and multi-load jobs are at our standard prices. For small loads we'll either fit you into an existing Bowen run at the standard price, or quote a travel charge up front if you need it done sooner." },
      PRICE_FAQ,
      ACCESS_FAQ,
      CANT_TAKE_FAQ,
    ],
  },

  // ───────────────────────── Services ─────────────────────────
  {
    slug: "end-of-lease-cleanouts",
    kind: "service",
    navLabel: "End-of-lease cleanouts",
    serviceType: "End of lease rubbish removal",
    title: "End-of-Lease & Vacate Cleanouts | Whitsunday Junk Removal",
    description:
      "Tenant left furniture behind? Vacate cleanouts for property managers and tenants across Airlie Beach, Cannonvale and Proserpine. On account, with photos for the file.",
    eyebrow: "For property managers, landlords and tenants",
    h1: "End-of-lease and vacate cleanouts",
    intro:
      "When a tenancy ends with a house full of leftovers, every day it sits empty costs money. We clear abandoned furniture, rubbish and garden waste so the cleaners can get in and the property can go back on the market.",
    points: ["14-day account terms for agencies", "Before and after photos for bond paperwork", "Key and lockbox access, no need to meet us"],
    sections: [
      {
        heading: "For property managers",
        body: [
          "Email or text us the address, access details and anything that must stay. We clear it, photograph each room before and after, and send one invoice per job referenced to the property. No cash, no paying on the spot. Set up an agency account once and every job after that is a two-line message.",
          "If the landlord wants items kept (whitegoods, blinds, outdoor furniture) say so and we'll leave them in place.",
        ],
      },
      {
        heading: "For tenants moving out",
        body: [
          "Moving and realising half of it isn't coming with you? We'll take the old couch, the mattress, the broken bookshelf and the garage pile in one visit, usually the day before your clean. Book in the calculator below or send photos for a quote.",
        ],
      },
      {
        heading: "What it costs",
        body: [
          "The same fixed load prices as any job, plus council tip fees at cost. A typical two-bedroom vacate with a couch, bed, mattress and bags of leftovers is a half to three-quarter load. Mattresses carry a per-item tip fee, which we show up front.",
        ],
      },
    ],
    commonJobs: ["Abandoned furniture after a tenancy", "Mattresses and bed bases", "Garage and under-house leftovers", "Holiday-let turnover", "Office vacate"],
    faqs: [
      { q: "Can you invoice the agency rather than the tenant?", a: "Yes. Agencies and landlords can be set up on account with 14-day terms and invoices emailed to your accounts team." },
      { q: "Do you provide photos?", a: "Every job: before and after shots of each area we clear, sent with the invoice. Handy for bond claims and owner updates." },
      PRICE_FAQ,
      CANT_TAKE_FAQ,
    ],
  },
  {
    slug: "deceased-estate-cleanouts",
    kind: "service",
    navLabel: "Deceased estates",
    serviceType: "Deceased estate clearance",
    title: "Deceased Estate Clear-Outs | Whitsunday Junk Removal",
    description:
      "Respectful deceased estate and downsizing clear-outs across the Whitsundays. We work at your pace, set aside what matters, and handle the rest.",
    eyebrow: "Estates, downsizing and aged-care moves",
    h1: "Deceased estate and downsizing clear-outs",
    intro:
      "Clearing a family home is hard enough without doing the lifting too. We help families across the Whitsundays sort a house out gently: you decide what stays, we handle the rest, and nothing goes until you say so.",
    points: ["Work at your pace, over one visit or several", "Anything you flag is set aside, not loaded", "Usable items separated from rubbish where we can"],
    sections: [
      {
        heading: "How we approach it",
        body: [
          "We start with a walk-through, with you or with whoever is handling the estate. Keepers get a sticker or a room of their own; everything else we load. If you'd rather not be there, we can photograph rooms before we start and send them through so there are no surprises.",
          "For out-of-town families managing an estate in Proserpine, Cannonvale or Airlie remotely, we can be your hands on the ground: clear the house, send photos, invoice by email.",
        ],
      },
      {
        heading: "Downsizing and aged-care moves",
        body: [
          "Moving a parent into a smaller place or into care usually means decades of possessions and a deadline. We clear what isn't moving, in the order you choose, and can coordinate with the removalist so the house is empty for handover.",
        ],
      },
      {
        heading: "Costs",
        body: [
          "The same fixed load prices as every job, with tip fees at cost. Whole-house clears are usually two to three trailer loads, and we'll give you a total before we start rather than a running meter. Metal, appliances and e-waste are free at the council tip, which keeps the price down on a house full of furniture.",
        ],
      },
    ],
    commonJobs: ["Whole-house clear", "Furniture and bedding", "Shed and garage contents", "Books, papers and boxes", "Garden and outdoor items"],
    faqs: [
      { q: "Can you do it while we're interstate?", a: "Yes. With a key or lockbox code and a phone call or two, we can clear the house and send you photos at each stage. Payment by bank transfer against an emailed invoice." },
      { q: "Will you sort out what's valuable?", a: "We'll flag anything that looks like it should be looked at twice (documents, jewellery, photos), and set aside whatever you tell us to. We're not valuers, so for furniture or collectables of value, have someone look before we come." },
      PRICE_FAQ,
      CANT_TAKE_FAQ,
    ],
  },
  {
    slug: "green-waste-removal",
    kind: "service",
    navLabel: "Green waste & storm clean-up",
    serviceType: "Green waste removal",
    title: "Green Waste Removal & Storm Clean-Up | Whitsundays",
    description:
      "Palm fronds, branches, hedge trimmings and storm debris removed across Airlie Beach, Cannonvale and Proserpine. Cheaper tip rates for green waste, passed on to you.",
    eyebrow: "Yard clean-ups · Palm fronds · Cyclone-season debris",
    h1: "Green waste removal and storm clean-ups",
    intro:
      "In the Whitsundays the garden never stops. Palms drop fronds year round, hedges get away over the wet, and when a blow comes through there's a yard full of branches. We load it, haul it and take care of the tip.",
    points: ["Green waste is charged at a lower tip rate than general waste", "Fronds, branches, trimmings, stumps and logs", "Fast turnaround after storms"],
    sections: [
      {
        heading: "Why green waste costs less",
        body: [
          "The council charges green waste at a much lower rate per tonne than general rubbish, and we pass that straight through. A full trailer of fronds and trimmings is one of the cheapest loads we do. Keep the green pile separate from household rubbish and the saving shows up in your price.",
          "Tree stumps and branches thicker than 300 mm go in a different council category at a higher rate, so tell us if there are any and we'll price them properly.",
        ],
      },
      {
        heading: "Storm and cyclone-season clean-ups",
        body: [
          "After wind and rain events between November and April we prioritise clean-up jobs. Pile the debris somewhere the trailer can reach (driveway or front yard is ideal), send a photo, and we'll get you on the list. Larger clean-ups may be two or three loads; we'll tell you up front.",
        ],
      },
      {
        heading: "Regular garden pick-ups",
        body: [
          "Gardeners and body corporates can book recurring pick-ups so trimmings never pile up. One invoice a month, on account.",
        ],
      },
    ],
    commonJobs: ["Palm fronds and seed pods", "Hedge and tree trimmings", "Storm debris", "Stumps and logs", "Old pots, soil bags and garden junk"],
    faqs: [
      { q: "Can you take soil, rocks or turf?", a: "Small amounts mixed with green waste are fine. Bulk soil, rubble and rock are heavy and charged differently at the tip, so send photos and we'll quote it as a load." },
      { q: "Do you cut trees or prune?", a: "No, we're removal only. Have your gardener or arborist do the cutting; we'll take the pile away the same day or the next." },
      PRICE_FAQ,
      CANT_TAKE_FAQ,
    ],
  },
];

export const AREA_PAGES = LANDING_PAGES.filter((p) => p.kind === "area");
export const SERVICE_PAGES = LANDING_PAGES.filter((p) => p.kind === "service");

export function findLandingPage(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug);
}
