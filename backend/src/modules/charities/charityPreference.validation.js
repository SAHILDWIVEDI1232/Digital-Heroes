
import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid charity ID");

export const updateCharityPreferenceSchema = z.object({
  body: z.object({
    charityId: objectId,
    charityPercentage: z.coerce
      .number()
      .finite()
      .min(10, "Minimum charity contribution is 10%")
      .max(100, "Maximum charity contribution is 100%"),
  }),
});
