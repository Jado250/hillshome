import { PrismaClient, RequestKind } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const categories = [
  { slug: "transport", name: "Transport", kind: RequestKind.BOOKING, sortOrder: 1,
    shortDescription: "Passenger and corporate transport.",
    description: "Reliable passenger transport for individuals, groups and organisations.",
    services: [
      { slug: "urban-suburban-bus", name: "Urban & Suburban Bus Transport", available: true },
      { slug: "motorcycle-transport", name: "Motorcycle Transport", available: true },
      { slug: "passenger-vehicles", name: "Passenger Transport by Vehicles", available: true },
      { slug: "corporate-shuttle", name: "Corporate Shuttle Services", available: true },
      // Not confirmed as operational: kept hidden until the company confirms.
      { slug: "tramway-trolley-bus", name: "Tramway & Trolley Bus Services", available: false, published: false },
    ] },
  { slug: "construction", name: "Construction & Building", kind: RequestKind.QUOTATION, sortOrder: 2,
    shortDescription: "Residential and commercial building projects.",
    description: "Construction and building services, from site clearing to completion.",
    services: [
      { slug: "residential-construction", name: "Residential construction" },
      { slug: "single-family-housing", name: "Single-family housing" },
      { slug: "multi-family-housing", name: "Multi-family housing" },
      { slug: "site-clearing", name: "Site clearing" },
      { slug: "building-completion", name: "Building completion" },
      { slug: "post-construction-cleaning", name: "Post-construction cleaning" },
      { slug: "commercial-construction", name: "Commercial building construction" },
    ] },
  { slug: "cleaning-maintenance", name: "Cleaning & Maintenance", kind: RequestKind.QUOTATION, sortOrder: 3,
    shortDescription: "Cleaning and facility upkeep.",
    description: "Cleaning, building maintenance and facility care.",
    services: [
      { slug: "general-building-cleaning", name: "General building cleaning" },
      { slug: "new-building-cleaning", name: "Cleaning of newly constructed buildings" },
      { slug: "building-maintenance", name: "Building maintenance" },
      { slug: "facility-maintenance", name: "Facility maintenance" },
      { slug: "equipment-facility-care", name: "Equipment/facility care" },
    ] },
  { slug: "it-digital", name: "IT & Digital", kind: RequestKind.QUOTATION, sortOrder: 4,
    shortDescription: "Websites, support, security and cloud.",
    description: "Technology services for businesses and organisations.",
    services: [
      { slug: "website-development", name: "Website development" },
      { slug: "it-consulting", name: "IT consulting" },
      { slug: "technical-support", name: "Technical support" },
      { slug: "cybersecurity", name: "Cybersecurity solutions" },
      { slug: "cloud-services", name: "Cloud services" },
      { slug: "hosting", name: "Hosting" },
    ] },
  { slug: "multimedia", name: "Multimedia", kind: RequestKind.QUOTATION, sortOrder: 5,
    shortDescription: "Photo, video and brand design.",
    description: "Photography, video production and design services.",
    services: [
      { slug: "video-editing", name: "Video editing" },
      { slug: "post-production", name: "Post-production" },
      { slug: "live-streaming", name: "Live streaming" },
      { slug: "corporate-photography", name: "Corporate photography" },
      { slug: "portrait-photography", name: "Portrait photography" },
      { slug: "real-estate-photography", name: "Real estate photography" },
      { slug: "architectural-photography", name: "Architectural photography" },
      { slug: "photo-editing", name: "Photo editing" },
      { slug: "photo-retouching", name: "Photo retouching" },
      { slug: "logo-design", name: "Logo design" },
      { slug: "brand-identity", name: "Brand identity design" },
    ] },
  { slug: "tours", name: "Tours & Tourism", kind: RequestKind.BOOKING, sortOrder: 6,
    shortDescription: "Guided tours and travel requests.",
    description: "Browse available tours and send a booking request.",
    services: [] },
] as const;

async function main() {
  for (const c of categories) {
    const { services, ...data } = c;
    const cat = await prisma.serviceCategory.upsert({
      where: { slug: c.slug }, update: data, create: data,
    });
    for (const s of services) {
      const sv = s as { slug: string; name: string; available?: boolean; published?: boolean };
      await prisma.service.upsert({
        where: { slug: sv.slug },
        update: {},
        create: { slug: sv.slug, name: sv.name, categoryId: cat.id,
          available: sv.available ?? true, published: sv.published ?? true },
      });
    }
  }

  // Clearly-labelled DEMO tour. Price intentionally null (price on request).
  await prisma.tour.upsert({
    where: { slug: "demo-sample-tour" },
    update: {},
    create: {
      slug: "demo-sample-tour",
      name: "[DEMO] Sample Tour",
      shortDescription: "Demo data. Replace with a real tour from the admin dashboard.",
      description: "This is placeholder content created by the seed script.",
      destination: "Placeholder destination",
      durationDays: 1,
      included: ["Placeholder inclusion"],
      excluded: ["Placeholder exclusion"],
      requirements: [],
      published: true,
      isDemo: true,
    },
  });

  // Demo gallery placeholders (SVG solid-colour images, isDemo labelled).
  const gallery = [
    { categorySlug: "transport", title: "Fleet on the road" },
    { categorySlug: "construction", title: "Residential build" },
    { categorySlug: "cleaning-maintenance", title: "Facility cleaning" },
    { categorySlug: "it-digital", title: "Website project" },
    { categorySlug: "multimedia", title: "Event photography" },
    { categorySlug: "tours", title: "Guided tour group" },
  ];
  for (const g of gallery) {
    const url = `/demo/${g.categorySlug === "cleaning-maintenance" ? "cleaning" : g.categorySlug === "it-digital" ? "it" : g.categorySlug}.svg`;
    const exists = await prisma.galleryItem.findFirst({ where: { url } });
    if (!exists) {
      await prisma.galleryItem.create({
        data: { categorySlug: g.categorySlug, title: g.title, url, alt: `${g.title} (demo)`, isDemo: true },
      });
    }
  }

  // Editable placeholders: never invent company facts.
  const settings: Record<string, unknown> = {
    "company.name": "Hillshome Tours Company LTD",
    "contact.phone": "",
    "contact.email": "",
    "contact.address": "",
    "contact.whatsapp": "",
    "contact.md.email": "siboisaie78@gmail.com",
    "contact.md.phone": "+250788423341",
    "contact.it.email": "lemouardbazatoha@gmail.com",
    "contact.it.phone": "+250785573698",
    "social.links": [
      { label: "Facebook", url: "https://www.facebook.com/share/1cNDUveQhx/" },
      { label: "YouTube", url: "https://youtube.com/@hillshometoursrwanda?si=Iq6F3TqSEeJUKVSk" },
      { label: "X", url: "https://x.com/JodaLavidkuez" },
    ],
    "about.intro": "",
    "about.mission": "",
    "about.vision": "",
    "about.values": [],
    "home.whyChoose": [
      "Transport, construction, cleaning, IT, multimedia and tours under one company",
      "Clear quotations — nothing is confirmed until you approve it",
      "A request reference and status updates you can follow",
    ],
    "home.testimonials": [
      { name: "[Demo] Client", role: "Replace with a real testimonial", quote: "Placeholder testimonial — edit or delete this in Admin → Settings." },
    ],
    "home.faq": [
      { q: "How do I request a service?", a: "Pick a service, fill in the form, and you will receive a reference number. Our team reviews it and gets back to you with a quotation." },
      { q: "Is my booking confirmed immediately?", a: "No. A request starts as pending. We confirm availability, requirements and price before confirming anything." },
      { q: "Do you offer payment options?", a: "Payment integration is planned for a later phase. Details are shared with your quotation." },
    ],
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key }, update: {}, create: { key, value: value as never },
    });
  }
  // Demo-only keys: always refresh so the site shows placeholder FAQ/testimonials until replaced.
  for (const key of ["home.testimonials", "home.faq"] as const) {
    await prisma.siteSetting.upsert({
      where: { key }, update: { value: settings[key] as never },
      create: { key, value: settings[key] as never },
    });
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name: "Super Admin", email, role: "SUPER_ADMIN",
        passwordHash: await argon2.hash(password) },
    });
    console.log(`Super admin ready: ${email}`);
  } else {
    console.log("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set: no admin created.");
  }
}

main().finally(() => prisma.$disconnect());
