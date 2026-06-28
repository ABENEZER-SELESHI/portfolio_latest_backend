/**
 * Test contact email delivery. Run: npx tsx scripts/test-email.ts
 */
import { emailService } from "../src/services/email.service";
import { env, isContactEmailConfigured } from "../src/config/env";

async function main() {
  if (!isContactEmailConfigured()) {
    const hint =
      env.EMAIL_TRANSPORT === "smtp"
        ? "Set SMTP_SERVER, SMTP_USERNAME, SMTP_PASSWORD"
        : "Set BREVO_API_KEY (xkeysib-… from Brevo → API keys — not the SMTP key)";
    console.error("Email not configured:", hint);
    process.exit(1);
  }

  console.log("Transport:", env.EMAIL_TRANSPORT);
  console.log("From (verified sender):", env.SMTP_FROM ?? env.CONTACT_RECIPIENT);
  console.log("To:", env.CONTACT_RECIPIENT);

  try {
    await emailService.sendContactEmail({
      name: "Test Visitor",
      email: "visitor@example.com",
      subject: "Test from script",
      message: "If this arrives, delivery works. Check spam folder too.",
      submittedAt: new Date(),
    });
    console.log("\nOK — Brevo accepted the message.");
    console.log("1. Check inbox + spam for", env.CONTACT_RECIPIENT);
    console.log("2. Brevo dashboard → Transactional → Email logs");
  } catch (err) {
    console.error("\nFAILED:", err instanceof Error ? err.message : err);
    console.error("\nFix:");
    console.error("  - API key: Brevo → SMTP & API → API keys (xkeysib-…), set BREVO_API_KEY");
    console.error("  - Sender: Brevo → Senders → verify", env.SMTP_FROM ?? env.CONTACT_RECIPIENT);
    process.exit(1);
  }
}

main();
