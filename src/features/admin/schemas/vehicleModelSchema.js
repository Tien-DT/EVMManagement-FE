import { z } from "zod";

export const vehicleModelSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  launchDate: z.any().optional(),
  description: z.string().optional(),
  status: z.boolean().default(true),
  ranking: z.number().int().min(0).max(2).default(0),
});

export default vehicleModelSchema;


