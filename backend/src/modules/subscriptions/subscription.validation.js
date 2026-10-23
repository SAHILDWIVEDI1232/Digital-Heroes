import { z } from "zod";

export const checkoutSchema = z.object({
  body: z.object({
    plan: z.enum(["monthly", "yearly"]),
  }),
  params: z.object({}),
  query: z.object({}),
});