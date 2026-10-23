import { z } from "zod";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "Invalid calendar date");

export const createScoreSchema = z.object({
  body: z.object({
    score: z.coerce.number().int().min(1).max(45),
    playedAt: dateSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateScoreSchema = z.object({
  body: z.object({
    score: z.coerce.number().int().min(1).max(45),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid score ID"),
  }),
  query: z.object({}),
});

export const scoreIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid score ID"),
  }),
  query: z.object({}),
});