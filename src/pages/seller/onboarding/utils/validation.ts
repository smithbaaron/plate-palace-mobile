
import { z } from "zod";

// Define the form schemas for better validation
export const basicInfoSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  bio: z.string().min(10, "Please provide a more detailed description (min 10 characters)"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits")
});

export const deliveryZipCodeSchema = z.object({
  deliveryZipCodes: z.string().min(5, "Please specify at least one ZIP code")
    .refine(value => {
      // Check if each ZIP code is valid (simple check for 5 digits)
      const zipCodes = value.split(/[,\s]+/).filter(Boolean);
      return zipCodes.every(zip => /^\d{5}(-\d{4})?$/.test(zip));
    }, "Contains invalid ZIP code(s). Use 5-digit format.")
});

export const validateBasicInfo = (
  businessName: string,
  bio: string,
  phoneNumber: string
) => {
  const errors = {
    businessName: !businessName.trim(),
    bio: !bio.trim() || bio.trim().length < 10,
    phoneNumber: !phoneNumber.trim() || phoneNumber.trim().length < 10
  };
  
  return {
    errors,
    isValid: !Object.values(errors).some(Boolean)
  };
};

export const validateDeliveryOptions = (
  offerPickup: boolean,
  offerDelivery: boolean,
  pickupAddresses: { address: string }[],
  zipCodeFormIsValid: boolean
) => {
  const errors = {
    noOptionSelected: !offerPickup && !offerDelivery,
    pickupAddressesEmpty: offerPickup && pickupAddresses.some(addr => !addr.address.trim()),
  };
  
  // If user offers delivery, validate ZIP codes
  let zipCodesValid = true;
  if (offerDelivery) {
    zipCodesValid = zipCodeFormIsValid;
  }
  
  return {
    errors,
    isValid: !Object.values(errors).some(Boolean) && (!offerDelivery || zipCodesValid)
  };
};
