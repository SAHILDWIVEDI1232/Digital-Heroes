
import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID");

export const createDrawSchema = z.object({
  body: z.object({
    month: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be YYYY-MM"),
  }),
});

export const publishDrawSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const drawIdSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const distributeDrawSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});
