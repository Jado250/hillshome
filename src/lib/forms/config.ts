import type { CategorySlug } from "@/lib/validation/requests";

export type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "time" | "number" | "textarea" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
  help?: string;
};

export const commonFields: Field[] = [
  { name: "customerName", label: "Full name", type: "text", required: true },
  { name: "phone", label: "Phone", type: "tel", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "contactMethod", label: "How should we contact you?", type: "select", required: true,
    options: [
      { value: "CALL", label: "Phone call" },
      { value: "WHATSAPP", label: "WhatsApp" },
      { value: "SMS", label: "SMS" },
      { value: "EMAIL", label: "Email" },
    ] },
];

const opts = (...v: string[]) => v.map((x) => ({ value: x, label: x }));

export const categoryFields: Record<CategorySlug, Field[]> = {
  transport: [
    { name: "transportType", label: "Transport type", type: "select", required: true,
      options: opts("Bus", "Motorcycle", "Passenger vehicle", "Corporate shuttle") },
    { name: "pickupLocation", label: "Pickup location", type: "text", required: true },
    { name: "destination", label: "Destination", type: "text", required: true },
    { name: "preferredDate", label: "Travel date", type: "date" },
    { name: "travelTime", label: "Travel time", type: "time" },
    { name: "passengers", label: "Number of passengers", type: "number", required: true },
    { name: "tripType", label: "Trip type", type: "select", required: true,
      options: [{ value: "ONE_WAY", label: "One way" }, { value: "ROUND_TRIP", label: "Round trip" }] },
    { name: "requirements", label: "Special requirements", type: "textarea" },
  ],
  tours: [
    { name: "preferredDate", label: "Preferred date", type: "date" },
    { name: "people", label: "Number of people", type: "number", required: true },
    { name: "requirements", label: "Special requirements", type: "textarea" },
  ],
  construction: [
    { name: "projectType", label: "Project type", type: "select", required: true,
      options: opts("Residential", "Single-family housing", "Multi-family housing", "Commercial building",
        "Site clearing", "Building completion", "Post-construction cleaning") },
    { name: "location", label: "Project location", type: "text" },
    { name: "description", label: "Project description", type: "textarea", required: true },
    { name: "estimatedSize", label: "Estimated size", type: "text", help: "For example 120 m²" },
    { name: "preferredDate", label: "Preferred start date", type: "date" },
    { name: "budget", label: "Budget (optional)", type: "text" },
  ],
  "cleaning-maintenance": [
    { name: "buildingType", label: "Building type", type: "text", required: true },
    { name: "location", label: "Location", type: "text" },
    { name: "serviceType", label: "Cleaning or maintenance type", type: "text", required: true },
    { name: "approximateSize", label: "Approximate size", type: "text" },
    { name: "preferredDate", label: "Preferred date", type: "date" },
    { name: "frequency", label: "Frequency", type: "select", required: true,
      options: [{ value: "ONE_TIME", label: "One time" }, { value: "WEEKLY", label: "Weekly" },
        { value: "MONTHLY", label: "Monthly" }, { value: "OTHER", label: "Other" }] },
    { name: "requirements", label: "Special requirements", type: "textarea" },
  ],
  "it-digital": [
    { name: "itService", label: "IT service", type: "select", required: true,
      options: opts("Website development", "IT consulting", "Technical support", "Cybersecurity",
        "Cloud services", "Hosting") },
    { name: "description", label: "Problem or project description", type: "textarea", required: true,
      help: "Never include passwords, codes or card numbers." },
    { name: "platform", label: "Platform or device", type: "text" },
    { name: "urgency", label: "Urgency", type: "select", required: true,
      options: [{ value: "LOW", label: "Low" }, { value: "NORMAL", label: "Normal" },
        { value: "HIGH", label: "High" }, { value: "URGENT", label: "Urgent" }] },
  ],
  multimedia: [
    { name: "multimediaService", label: "Multimedia service", type: "select", required: true,
      options: opts("Video editing", "Post-production", "Live streaming", "Photography",
        "Photo editing and retouching", "Logo design", "Brand identity design") },
    { name: "preferredDate", label: "Event or project date", type: "date" },
    { name: "location", label: "Location", type: "text" },
    { name: "duration", label: "Duration", type: "text" },
    { name: "deliverables", label: "Required deliverables", type: "textarea", required: true },
    { name: "description", label: "Project description", type: "textarea" },
    { name: "budget", label: "Budget (optional)", type: "text" },
  ],
};

/** Categories where customers may attach photos/documents. */
export const allowsFiles: CategorySlug[] = ["construction", "cleaning-maintenance", "multimedia", "it-digital"];
