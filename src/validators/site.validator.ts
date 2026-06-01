import { z } from "zod";

export const siteUpdateSchema = z.object({
  heroName: z.string().min(2).optional(),
  heroTitle: z.string().min(2).optional(),
  heroIntro: z.string().optional(),
  aboutBio: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
});
