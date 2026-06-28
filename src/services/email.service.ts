import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { env, isBrevoApiConfigured, isContactEmailConfigured, isSmtpConfigured } from "../config/env";
import { logger } from "../utils/logger";
import { sanitizePlainText } from "../utils/sanitize";

export interface ContactEmailPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: Date;
}

interface BrevoApiResponse {
  messageId?: string;
  code?: string;
  message?: string;
}

export class EmailService {
  private getTransporter() {
    const options: SMTPTransport.Options = {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER!,
        pass: env.SMTP_PASS!,
      },
      tls: {
        minVersion: "TLSv1.2",
      },
    };

    return nodemailer.createTransport(options);
  }

  private buildContent(payload: ContactEmailPayload, name: string, visitorEmail: string, subject: string, message: string) {
    const mailSubject = `Portfolio contact from ${name}: ${subject}`;
    const text = [
      `New message from your portfolio contact form`,
      ``,
      `From: ${name}`,
      `Visitor email: ${visitorEmail}`,
      `Subject: ${subject}`,
      `Submitted: ${payload.submittedAt.toISOString()}`,
      ``,
      `--- Message ---`,
      message,
      ``,
      `---`,
      `Reply to this email to respond directly to ${visitorEmail}`,
    ].join("\n");

    const html = `
      <p style="color:#666;font-size:14px;">
        New message from your portfolio contact form.
        <strong>Reply to this email</strong> to reach ${name} at
        <a href="mailto:${visitorEmail}">${visitorEmail}</a>.
      </p>
      <h2>${subject}</h2>
      <table style="margin:16px 0;font-size:14px;">
        <tr><td style="padding:4px 12px 4px 0;"><strong>Name</strong></td><td>${name}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;"><strong>Email</strong></td><td><a href="mailto:${visitorEmail}">${visitorEmail}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;"><strong>Submitted</strong></td><td>${payload.submittedAt.toISOString()}</td></tr>
      </table>
      <hr />
      <p style="white-space:pre-wrap;">${message.replace(/\n/g, "<br />")}</p>
    `;

    return { mailSubject, text, html };
  }

  /** Brevo HTTP API — returns real errors when sender is not verified or mail is blocked */
  private async sendViaBrevoApi(
    payload: ContactEmailPayload,
    name: string,
    visitorEmail: string,
    subject: string,
    message: string,
    smtpFrom: string
  ): Promise<void> {
    const { mailSubject, text, html } = this.buildContent(payload, name, visitorEmail, subject, message);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY!,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: `${name} (Portfolio)`,
          email: smtpFrom,
        },
        to: [{ email: env.CONTACT_RECIPIENT, name: "Abenezer Seleshi" }],
        replyTo: { email: visitorEmail, name },
        subject: mailSubject,
        htmlContent: html,
        textContent: text,
        headers: {
          "X-Mailin-custom": "portfolio-contact",
        },
      }),
    });

    const bodyText = await response.text();
    let body: BrevoApiResponse = {};
    try {
      body = JSON.parse(bodyText) as BrevoApiResponse;
    } catch {
      body = { message: bodyText };
    }

    if (!response.ok) {
      logger.error("Brevo API rejected email", {
        status: response.status,
        body,
        sender: smtpFrom,
        to: env.CONTACT_RECIPIENT,
      });
      throw new Error(
        body.message ?? `Brevo API error ${response.status}: ${bodyText.slice(0, 200)}`
      );
    }

    logger.info("Brevo API accepted email", {
      messageId: body.messageId,
      to: env.CONTACT_RECIPIENT,
      replyTo: visitorEmail,
      hint: "Check Brevo → Transactional → Logs if inbox is empty",
    });
  }

  private async sendViaSmtp(
    payload: ContactEmailPayload,
    name: string,
    visitorEmail: string,
    subject: string,
    message: string,
    smtpFrom: string
  ): Promise<void> {
    const { mailSubject, text, html } = this.buildContent(payload, name, visitorEmail, subject, message);
    const transporter = this.getTransporter();

    const result = await transporter.sendMail({
      envelope: {
        from: smtpFrom,
        to: env.CONTACT_RECIPIENT,
      },
      from: `"${name} (Portfolio)" <${smtpFrom}>`,
      to: env.CONTACT_RECIPIENT,
      replyTo: visitorEmail,
      subject: mailSubject,
      text,
      html,
    });

    logger.info("SMTP handoff to Brevo", {
      messageId: result.messageId,
      response: result.response,
      accepted: result.accepted,
      rejected: result.rejected,
      to: env.CONTACT_RECIPIENT,
      replyTo: visitorEmail,
    });

    if (result.rejected?.length) {
      throw new Error(`SMTP rejected recipients: ${result.rejected.join(", ")}`);
    }
  }

  /** Prefer brevo-api when configured; fall back to SMTP if only SMTP creds exist */
  private resolveTransport(): "brevo-api" | "smtp" {
    if (env.EMAIL_TRANSPORT === "smtp") {
      if (!isSmtpConfigured()) {
        throw new Error("SMTP not configured");
      }
      return "smtp";
    }

    if (isBrevoApiConfigured()) {
      return "brevo-api";
    }

    if (isSmtpConfigured()) {
      logger.warn(
        "EMAIL_TRANSPORT=brevo-api but BREVO_API_KEY is missing; using SMTP. Add BREVO_API_KEY (xkeysib-…) for clearer delivery errors."
      );
      return "smtp";
    }

    throw new Error("Email not configured");
  }

  async sendContactEmail(payload: ContactEmailPayload): Promise<void> {
    if (!isContactEmailConfigured()) {
      logger.error("Contact email not configured", {
        hint: "Set BREVO_API_KEY (brevo-api) or SMTP_SERVER + SMTP_USERNAME + SMTP_PASSWORD",
      });
      throw new Error("Email not configured");
    }

    const smtpFrom = env.SMTP_FROM ?? env.CONTACT_RECIPIENT;
    const name = sanitizePlainText(payload.name);
    const visitorEmail = sanitizePlainText(payload.email).toLowerCase();
    const subject = sanitizePlainText(payload.subject);
    const message = sanitizePlainText(payload.message);

    const transport = this.resolveTransport();

    if (transport === "brevo-api") {
      await this.sendViaBrevoApi(payload, name, visitorEmail, subject, message, smtpFrom);
      return;
    }

    await this.sendViaSmtp(payload, name, visitorEmail, subject, message, smtpFrom);
  }
}

export const emailService = new EmailService();
