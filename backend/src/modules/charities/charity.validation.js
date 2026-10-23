
import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => value === "" || /^https?:\/\/\S+$/i.test(value),
    "Enter a valid HTTP or HTTPS URL"
  )
  .optional();

const charityFields = {
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(60),
  description: z.string().trim().min(10).max(3000),
  website: optionalUrl,
  imageUrl: optionalUrl,
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
};

export const createCharitySchema = z.object({
  body: z.object(charityFields),
  params: z.object({}),
  query: z.object({}),
});

export const updateCharitySchema = z.object({
  body: z.object(charityFields).partial().refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update"
  ),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid charity ID"),
  }),
  query: z.object({}),
});


export const charityIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid charity ID"),
  }),
  query: z.object({}),
});


export const listCharitiesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    search: z.string().trim().max(100).optional(),
    category: z.string().trim().max(60).optional(),
    featured: z.enum(["true", "false"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});
