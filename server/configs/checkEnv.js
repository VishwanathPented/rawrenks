const REQUIRED = [
  "MONGODB_URI",
  "JWT_SECRET",
  "SELLER_EMAIL",
  "SELLER_PASSWORD",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_EMAIL",
];

export function checkEnv() {
  const missing = [];
  for (const key of REQUIRED) {
    const v = process.env[key];
    if (!v || v.startsWith("FILL_ME")) missing.push(key);
  }
  if (missing.length === 0) {
    console.log("[env] all required variables are set ✓");
  } else {
    console.warn(
      "[env] " + missing.length + " variable(s) still unset:\n  " +
      missing.join("\n  ") +
      "\n  → server will boot but routes needing these will fail until you fill server/.env"
    );
  }
}
