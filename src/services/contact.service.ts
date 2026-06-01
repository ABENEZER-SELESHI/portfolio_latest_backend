import { contactRepository } from "../repositories/contact.repository";
import { emailService } from "./email.service";
import { sanitizePlainText } from "../utils/sanitize";
import { AppError, NotFoundError } from "../utils/errors";

export class ContactService {
  async submit(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    honeypot?: string;
  }) {
    if (data.honeypot) {
      throw new AppError("Spam detected", 400);
    }

    const payload = {
      name: sanitizePlainText(data.name),
      email: sanitizePlainText(data.email),
      subject: sanitizePlainText(data.subject),
      message: sanitizePlainText(data.message),
    };

    const message = await contactRepository.create(payload);
    const submittedAt = message.submittedAt;

    try {
      await emailService.sendContactEmail({ ...payload, submittedAt });
    } catch {
      throw new AppError("Failed to send message. Please try again later.", 500);
    }

    return { id: message.id, submittedAt };
  }

  async list() {
    return contactRepository.findMany();
  }

  async markRead(id: string) {
    const msg = await contactRepository.findById(id);
    if (!msg) throw new NotFoundError("Message not found");
    return contactRepository.markRead(id);
  }

  async remove(id: string) {
    const msg = await contactRepository.findById(id);
    if (!msg) throw new NotFoundError("Message not found");
    return contactRepository.softDelete(id);
  }
}

export const contactService = new ContactService();
