import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export interface ContactEmailPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Date;
}

export class EmailService {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  });

  async sendContactEmail(payload: ContactEmailPayload): Promise<void> {
    if (!env.SMTP_HOST) {
      logger.warn("SMTP not configured; contact email skipped", payload);
      return;
    }

    await this.transporter.sendMail({
      from: env.SMTP_USER ?? env.CONTACT_RECIPIENT,
      to: env.CONTACT_RECIPIENT,
      replyTo: payload.email,
      subject: `[Portfolio Contact] ${payload.subject}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${payload.name}</p>
        <p><strong>Email:</strong> ${payload.email}</p>
        <p><strong>Subject:</strong> ${payload.subject}</p>
        <p><strong>Submitted:</strong> ${payload.submittedAt.toISOString()}</p>
        <hr />
        <p>${payload.message.replace(/\n/g, "<br />")}</p>
      `,
    });
  }
}

export const emailService = new EmailService();
