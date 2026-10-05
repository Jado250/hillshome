import nodemailer from "nodemailer";
import type { ServiceRequest } from "@prisma/client";

function enabled() {
  return process.env.EMAIL_ENABLED === "true" && !!process.env.EMAIL_SERVER_HOST;
}

function transport() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
    auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD },
  });
}

export async function notifyRequestReceived(req: ServiceRequest) {
  if (!enabled()) return;
  const t = transport();
  const from = process.env.EMAIL_FROM;
  await t.sendMail({
    from, to: req.email,
    subject: `We received your request ${req.reference}`,
    text: `Hello ${req.customerName},\n\nWe received your request. Your reference number is ${req.reference}.\nOur team will review it and contact you. This is not a confirmation of service.\n\nHillshome Tours Company LTD`,
  });
  if (process.env.ADMIN_NOTIFY_EMAIL) {
    await t.sendMail({
      from, to: process.env.ADMIN_NOTIFY_EMAIL,
      subject: `New request ${req.reference}`,
      text: `New request ${req.reference} from ${req.customerName} (${req.phone}).`,
    });
  }
}
