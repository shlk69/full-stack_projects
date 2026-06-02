import { z } from "zod";

export const verifyCodeValidation = z
  .string()
  .length(6, "Veirfication code must have 6 characters");
