import nodemailer from "nodemailer";
import type { ContactMethod, ServiceRequest } from "@prisma/client";

function emailEnabled() {
  return process.env.EMAIL_ENABLED === "true" && !!process.env.EMAIL_SERVER_HOST;
}

function smsEnabled() {
  return process.env.SMS_ENABLED === "true" && !!process.env.SMS_API_KEY;
}

function transport() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
    auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD },
  });
}

/** E.164 digits for wa.me / SMS gateways. */
export function phoneDigits(phone: string) {
  return phone.replace(/[^0-9]/g, "");
}

/** One-click staff link that opens a WhatsApp chat with a prefilled message. */
export function whatsAppLink(phone: string, message: string) {
  return `https://wa.me/${phoneDigits(phone)}?text=${encodeURIComponent(message)}`;
}

async function sendMail(to: string, subject: string, text: string) {
  if (!emailEnabled()) return false;
  await transport().sendMail({ from: process.env.EMAIL_FROM, to, subject, text });
  return true;
}

/**
 * Sends an SMS via Africa's Talking (popular in Rwanda).
 * Configure SMS_ENABLED=true, SMS_API_KEY, SMS_USERNAME and SMS_SENDER.
 */
async function sendSms(to: string, message: string) {
  if (!smsEnabled()) return false;
  const params = new URLSearchParams({
    username: process.env.SMS_USERNAME ?? "",
    to: `+${phoneDigits(to)}`,
    message,
    ...(process.env.SMS_SENDER ? { from: process.env.SMS_SENDER } : {}),
  });
  const res = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: { apiKey: process.env.SMS_API_KEY ?? "", "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) throw new Error(`SMS gateway returned ${res.status}`);
  return true;
}

export type CustomerMessage = { subject: string; text: string; short: string };

/**
 * Notifies the customer on their preferred contact method.
 * EMAIL and SMS are sent automatically when configured; for CALL and
 * WHATSAPP the admin dashboard offers one-click call / WhatsApp actions.
 * Returns true when a message was actually dispatched.
 */
export async function notifyCustomer(
  req: Pick<ServiceRequest, "customerName" | "email" | "phone" | "contactMethod" | "reference">,
  msg: CustomerMessage,
): Promise<boolean> {
  const method: ContactMethod = req.contactMethod ?? "EMAIL";
  try {
    if (method === "EMAIL") return await sendMail(req.email, msg.subject, msg.text);
    if (method === "SMS") return await sendSms(req.phone, msg.short);
    return false;
  } catch (e) {
    console.error("notify failed", e);
    return false;
  }
}

const receivedMsg = (req: Pick<ServiceRequest, "customerName" | "reference">): CustomerMessage => ({
  subject: `We received your request ${req.reference}`,
  text: `Hello ${req.customerName},\n\nWe received your request. Your reference number is ${req.reference}.\nOur team will review it and contact you. This is not a confirmation of service.\n\nHillshome Tours Company LTD`,
  short: `Hillshome: we received your request ${req.reference}. Our team will review it and contact you.`,
});

export async function notifyRequestReceived(req: ServiceRequest) {
  await notifyCustomer(req, receivedMsg(req));
  if (emailEnabled() && process.env.ADMIN_NOTIFY_EMAIL) {
    await transport().sendMail({
      from: process.env.EMAIL_FROM, to: process.env.ADMIN_NOTIFY_EMAIL,
      subject: `New request ${req.reference}`,
      text: `New request ${req.reference} from ${req.customerName} (${req.phone}). Prefers: ${req.contactMethod}.`,
    });
  }
}

export async function notifyStatusChanged(req: ServiceRequest, from: string | null, to: string) {
  await notifyCustomer(req, {
    subject: `Update on your request ${req.reference}`,
    text: `Hello ${req.customerName},\n\nYour request ${req.reference} is now: ${to.replace("_", " ")}.${from ? ` (was ${from.replace("_", " ")})` : ""}\n\nHillshome Tours Company LTD`,
    short: `Hillshome: your request ${req.reference} is now ${to.replace("_", " ")}.`,
  });
}

export async function notifyQuoteCreated(req: ServiceRequest, amount: string, currency: string, details: string, validUntil: Date | null) {
  await notifyCustomer(req, {
    subject: `Quotation for your request ${req.reference}`,
    text: `Hello ${req.customerName},\n\nWe prepared a quotation for ${req.reference}:\nAmount: ${currency} ${amount}${validUntil ? `\nValid until: ${validUntil.toDateString()}` : ""}\n\n${details}\n\nHillshome Tours Company LTD`,
    short: `Hillshome: quotation for ${req.reference}: ${currency} ${amount}. Details sent by email or call us.`,
  });
}
