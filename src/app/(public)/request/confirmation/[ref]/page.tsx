import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Request received", robots: { index: false } };

export default async function Confirmation({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const safe = /^HS-REQ-\d{6}$/.test(ref) ? ref : null;
  return (
    <div className="container-x max-w-xl py-20 text-center">
      <h1 className="text-3xl font-semibold">Your request has been received</h1>
      {safe && (
        <p className="mt-6">Reference number
          <span className="mt-1 block font-display text-4xl font-semibold text-navy-900">{safe}</span>
        </p>
      )}
      <p className="mt-6">Our team will review your request and contact you. This is not yet a confirmed booking. Keep your reference number for follow-up.</p>
      <Link href="/" className="btn-navy mt-8">Back to home</Link>
    </div>
  );
}
