import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Request received", robots: { index: false } };

const METHOD_NOTE: Record<string, string> = {
  CALL: "We will call you on the phone number you gave us.",
  WHATSAPP: "We will message you on WhatsApp.",
  SMS: "We will send you an SMS.",
  EMAIL: "We will email you.",
};

export default async function Confirmation({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const safe = /^HS-REQ-\d{6}$/.test(ref) ? ref : null;
  const request = safe ? await db.serviceRequest.findUnique({ where: { reference: safe }, select: { contactMethod: true } }) : null;
  return (
    <div className="container-x max-w-xl py-20 text-center">
      <h1 className="text-3xl font-semibold">Your request has been received</h1>
      {safe && (
        <p className="mt-6">Reference number
          <span className="mt-1 block font-display text-3xl font-semibold text-navy-900 sm:text-4xl">{safe}</span>
        </p>
      )}
      <p className="mt-6">Our team will review your request and contact you. This is not yet a confirmed booking. Keep your reference number for follow-up.</p>
      {request && <p className="mt-3 font-medium">{METHOD_NOTE[request.contactMethod] ?? ""}</p>}
      <Link href="/" className="btn-navy mt-8">Back to home</Link>
    </div>
  );
}
