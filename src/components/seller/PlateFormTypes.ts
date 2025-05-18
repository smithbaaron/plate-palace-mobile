
import { z } from "zod";

// Define plate sizes
export type PlateSize = "S" | "M" | "L";

// Define the form schema with validation rules
export const formSchema = z.object({
  name: z.string().min(3, { message: "Plate name must be at least 3 characters" }),
  quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1" }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than 0" }),
  nutritionalInfo: z.string().optional(),
  availableDate: z.date({
    required_error: "Available date is required",
  }).refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: "Date cannot be in the past",
  }),
  imageUrl: z.string().optional(),
  size: z.enum(["S", "M", "L"]).default("M"),
});

export type Plate = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  nutritionalInfo?: string;
  availableDate: Date;
  imageUrl?: string;
  soldCount: number;
  size: PlateSize;
};

export type PlateFormValues = z.infer<typeof formSchema>;
