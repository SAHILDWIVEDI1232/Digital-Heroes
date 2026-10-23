
import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID");

export const winnerIdSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const submitProofSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    proofImageUrl: z.string().url("Valid proof image URL required"),
  }),
});

export const reviewClaimSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    claimStatus: z.enum(["approved", "rejected"]),
  }),
});

export const listWinnersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }).optional(),
});
export const setPrizeAmountSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    prizeAmount: z.coerce.number().finite().positive(),
  }),
});

// export const calculateWinnerSchema = z.object({
//   params: z.object({
//     id: objectId,
//   }),
//   body: z.object({
//     userId: objectId,
//     entryNumbers: z
//       .array(z.coerce.number().int().min(1).max(45))
//       .min(1)
//       .max(45)
//       .refine((numbers) => new Set(numbers).size === numbers.length, {
//         message: "Entry numbers must be unique",
//       }),
//   }),
// });

export const calculateWinnerSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z.object({
    userId: objectId,
  }),
});

export const drawIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID"),
  }),
});

