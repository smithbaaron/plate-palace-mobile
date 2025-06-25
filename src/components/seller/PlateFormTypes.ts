
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
  isSingle: z.boolean().default(true),
  isBundle: z.boolean().default(false),
  deliveryAvailable: z.boolean().default(false),
  pickupTime: z.string().optional(),
}).refine((data) => data.isSingle || data.isBundle, {
  message: "At least one availability option must be selected",
  path: ["isSingle"], // This will show the error on the isSingle field
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
  isSingle: boolean;
  isBundle: boolean;
  isAvailable: boolean;
  deliveryAvailable?: boolean;
  pickupTime?: string;
};

export type PlateFormValues = z.infer<typeof formSchema>;

// Bundle types
export type Bundle = {
  id: string;
  sellerId: string;
  name: string;
  plateCount: number;
  price: number;
  availableDate: Date;
  availabilityScope: 'day' | 'week';
  createdAt: Date;
};

export type BundleFormValues = {
  name: string;
  plateCount: number;
  price: number;
  availableDate: Date;
  availabilityScope: 'day' | 'week';
  selectedPlateIds: string[];
};

// Order Status Types for Notification System
export type OrderStatus = "pending" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";

export const OrderStatusDisplay: Record<OrderStatus, string> = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready for Pickup/Delivery",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

// Notification Event Types
export type NotificationEvent = 
  | "plate_added" 
  | "order_status_changed"
  | "new_follower"
  | "promotion_launched"
  | "review_received";

export interface NotificationPayload {
  event: NotificationEvent;
  data: Record<string, any>; // Specific data related to the event
  timestamp: number;
  targetUserIds?: string[];
}
