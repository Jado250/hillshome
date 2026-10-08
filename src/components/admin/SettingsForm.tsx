"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  parseTestimonials, parseFaq, parseSocialLinks,
} from "@/lib/settings/text";

type Initial = {
  companyName: string; phone: string; email: string; address: string; whatsapp: string;
  mdEmail: string; mdPhone: string; itEmail: string; itPhone: string;
  socialLinks: string;
  aboutIntro: string; mission: string; vision: string; values: string; whyChoose: string;
  testimonials: string; faq: string;
};

export function SettingsForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setMsg("");
    const fd = new FormData(e.currentTarget);
    const social = parseSocialLinks(String(fd.get("socialLinks") ?? ""));
    if (!social.ok) { setBusy(false); setMsg(social.error); return; }
    const testimonials = parseTestimonials(String(fd.get("testimonials") ?? ""));
    if (!testimonials.ok) { setBusy(false); setMsg(testimonials.error); return; }
    const faq = parseFaq(String(fd.get("faq") ?? ""));
    if (!faq.ok) { setBusy(false); setMsg(faq.error); return; }
    const lines = (v: unknown) => String(v ?? "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const body = {
      "company.name": String(fd.get("companyName") ?? ""),
      "contact.phone": String(fd.get("phone") ?? ""),
      "contact.email": String(fd.get("email") ?? ""),
      "contact.address": String(fd.get("address") ?? ""),
      "contact.whatsapp": String(fd.get("whatsapp") ?? ""),
      "contact.md.email": String(fd.get("mdEmail") ?? ""),
      "contact.md.phone": String(fd.get("mdPhone") ?? ""),
      "contact.it.email": String(fd.get("itEmail") ?? ""),
      "contact.it.phone": String(fd.get("itPhone") ?? ""),
      "social.links": social.value,
      "about.intro": String(fd.get("aboutIntro") ?? ""),
      "about.mission": String(fd.get("mission") ?? ""),
      "about.vision": String(fd.get("vision") ?? ""),
      "about.values": lines(fd.get("values")),
      "home.whyChoose": lines(fd.get("whyChoose")),
      "home.testimonials": testimonials.value,
      "home.faq": faq.value,
    };
    const res = await fetch("/api/admin/settings", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) { setMsg("Settings saved."); router.refresh(); }
    else setMsg((await res.json().catch(() => null))?.error ?? "Could not save.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-3xl space-y-4 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="companyName">Company name</label><input id="companyName" name="companyName" defaultValue={initial.companyName} className="input" /></div>
        <div><label className="label" htmlFor="phone">Phone</label><input id="phone" name="phone" defaultValue={initial.phone} className="input" /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" defaultValue={initial.email} className="input" /></div>
        <div><label className="label" htmlFor="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp" defaultValue={initial.whatsapp} className="input" /></div>
      </div>
      <div><label className="label" htmlFor="address">Address</label><input id="address" name="address" defaultValue={initial.address} className="input" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="mdEmail">Managing Director — email</label><input id="mdEmail" name="mdEmail" type="email" defaultValue={initial.mdEmail} className="input" /></div>
        <div><label className="label" htmlFor="mdPhone">Managing Director — phone (call & WhatsApp)</label><input id="mdPhone" name="mdPhone" defaultValue={initial.mdPhone} className="input" /></div>
        <div><label className="label" htmlFor="itEmail">IT Officer — email</label><input id="itEmail" name="itEmail" type="email" defaultValue={initial.itEmail} className="input" /></div>
        <div><label className="label" htmlFor="itPhone">IT Officer — phone (call & WhatsApp)</label><input id="itPhone" name="itPhone" defaultValue={initial.itPhone} className="input" /></div>
      </div>
      <div><label className="label" htmlFor="socialLinks">Social links (one per line: Label | link)</label><textarea id="socialLinks" name="socialLinks" rows={4} defaultValue={initial.socialLinks} className="input" placeholder={"Facebook | https://facebook.com/…"} /></div>
      <div><label className="label" htmlFor="aboutIntro">About intro</label><textarea id="aboutIntro" name="aboutIntro" rows={3} defaultValue={initial.aboutIntro} className="input" /></div>
      <div><label className="label" htmlFor="mission">Mission</label><textarea id="mission" name="mission" rows={2} defaultValue={initial.mission} className="input" /></div>
      <div><label className="label" htmlFor="vision">Vision</label><textarea id="vision" name="vision" rows={2} defaultValue={initial.vision} className="input" /></div>
      <div><label className="label" htmlFor="values">Values (one per line)</label><textarea id="values" name="values" rows={3} defaultValue={initial.values} className="input" /></div>
      <div><label className="label" htmlFor="whyChoose">Why choose us (one per line)</label><textarea id="whyChoose" name="whyChoose" rows={4} defaultValue={initial.whyChoose} className="input" /></div>
      <div><label className="label" htmlFor="testimonials">Testimonials (one per line: Name | Role | What they said)</label><textarea id="testimonials" name="testimonials" rows={5} defaultValue={initial.testimonials} className="input" placeholder={"Aline Uwase | HR Manager, Kigali | Great service and on time."} /></div>
      <div><label className="label" htmlFor="faq">FAQ (one per line: Question | Answer)</label><textarea id="faq" name="faq" rows={5} defaultValue={initial.faq} className="input" placeholder={"How do I request a service? | Pick a service and fill in the form."} /></div>
      <div className="flex items-center gap-4">
        <button disabled={busy} className="btn-navy disabled:opacity-60">{busy ? "Saving…" : "Save settings"}</button>
        {msg && <p role="status" className="text-sm">{msg}</p>}
      </div>
    </form>
  );
}
