
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deliveryZipCodeSchema } from "../utils/validation";

export interface PickupAddress {
  address: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export const useSellerProfile = () => {
  const { currentUser } = useAuth();
  
  // Basic info state
  const [businessName, setBusinessName] = useState(currentUser?.username || "");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Delivery options state
  const [offerPickup, setOfferPickup] = useState(true);
  const [offerDelivery, setOfferDelivery] = useState(false);
  const [pickupAddresses, setPickupAddresses] = useState<PickupAddress[]>([{ 
    address: "", 
    label: "", 
    street: "", 
    city: "", 
    state: "", 
    zipCode: "" 
  }]);
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    businessName: false,
    bio: false,
    phoneNumber: false
  });
  
  // Delivery options validation
  const [deliveryOptionsErrors, setDeliveryOptionsErrors] = useState({
    noOptionSelected: false,
    pickupAddressesEmpty: false
  });
  
  // Form for delivery ZIP codes
  const zipCodeForm = useForm({
    resolver: zodResolver(deliveryZipCodeSchema),
    defaultValues: {
      deliveryZipCodes: ""
    }
  });

  // Load existing profile data if available
  useEffect(() => {
    const loadSellerProfile = async () => {
      if (currentUser?.id) {
        try {
          const { data, error } = await supabase
            .from('seller_profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
            
          if (data && !error) {
            // Populate form with existing data
            setBusinessName(data.business_name || currentUser?.username || "");
            setBio(data.bio || "");
            setPhoneNumber(data.phone_number || "");
            
            // Set delivery options
            setOfferPickup(data.offer_pickup ?? true);
            setOfferDelivery(data.offer_delivery ?? false);
            
            if (data.pickup_addresses && data.pickup_addresses.length > 0) {
              setPickupAddresses(data.pickup_addresses);
            }
            
            if (data.delivery_zip_codes) {
              zipCodeForm.setValue("deliveryZipCodes", data.delivery_zip_codes);
            }
          }
        } catch (err) {
          console.error("Error loading seller profile:", err);
        }
      }
    };
    
    if (currentUser?.id) {
      loadSellerProfile();
    }
  }, [currentUser]);

  return {
    businessName,
    setBusinessName,
    bio,
    setBio,
    phoneNumber,
    setPhoneNumber,
    formErrors,
    setFormErrors,
    offerPickup,
    setOfferPickup,
    offerDelivery,
    setOfferDelivery,
    pickupAddresses,
    setPickupAddresses,
    zipCodeForm,
    deliveryOptionsErrors,
    setDeliveryOptionsErrors
  };
};
