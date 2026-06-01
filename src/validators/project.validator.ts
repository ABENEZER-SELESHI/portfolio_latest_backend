import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  technologies: z.array(z.string()).default([]),
  liveUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
  completedAt: z.string().optional(),
  sortOrder: z.number().int().optional().default(0),
});

export const projectQuerySchema = z.object({
  category: z.string().optional(),
  technology: z.string().optional(),
  featured: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
});
