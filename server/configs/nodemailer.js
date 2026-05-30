import nodemailer from "nodemailer";

let cached = null;

export function getTransporter() {
  if (cached) return cached;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || SMTP_HOST.startsWith("FILL_ME") || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP credentials not configured. Fill server/.env first.");
  }
  cached = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return cached;
}
