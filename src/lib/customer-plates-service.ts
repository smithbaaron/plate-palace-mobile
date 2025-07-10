import { supabase } from './supabase';

export type CustomerPlate = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  size: string;
  nutritionalInfo?: string;
  availableDate: string;
  quantity: number;
  seller: {
    id: string;
    businessName: string;
    bio?: string;
  };
};

export type CustomerSeller = {
  id: string;
  businessName: string;
  bio?: string;
  phoneNumber?: string;
  plateCount: number;
  rating: number; // This would come from reviews in the future
};

// Fetch all available plates with seller information
export const getAvailablePlates = async (): Promise<CustomerPlate[]> => {
  try {
    console.log("🔍 Fetching plates from database...");
    
    const { data, error } = await supabase
      .from('plates')
      .select(`
        id,
        name,
        price,
        image_url,
        size,
        nutritional_info,
        available_date,
        quantity,
        seller_id,
        seller_profiles!inner (
          id,
          business_name,
          bio
        )
      `)
      .gt('quantity', 0) // Only show plates with available quantity
      .gte('available_date', new Date().toISOString()) // Only show current/future plates
      .order('available_date', { ascending: true });

    if (error) {
      console.error('❌ Error fetching available plates:', error);
      throw error;
    }

    console.log("🍽️ Raw plates data from database:", data);

    // Transform the data to match our CustomerPlate type
    const plates: CustomerPlate[] = (data || []).map(plate => ({
      id: plate.id,
      name: plate.name,
      price: plate.price,
      imageUrl: plate.image_url,
      size: plate.size,
      nutritionalInfo: plate.nutritional_info,
      availableDate: plate.available_date,
      quantity: plate.quantity,
      seller: {
        id: plate.seller_profiles[0].id,
        businessName: plate.seller_profiles[0].business_name,
        bio: plate.seller_profiles[0].bio
      }
    }));

    return plates;
  } catch (error) {
    console.error('Error in getAvailablePlates:', error);
    return [];
  }
};

// Fetch all sellers with their plate counts
export const getAvailableSellers = async (): Promise<CustomerSeller[]> => {
  try {
    console.log("🔍 Fetching seller profiles from database...");
    
    const { data, error } = await supabase
      .from('seller_profiles')
      .select(`
        id,
        business_name,
        bio,
        phone_number,
        plates (id)
      `)
      .order('business_name');

    if (error) {
      console.error('❌ Error fetching available sellers:', error);
      throw error;
    }

    console.log("📊 Raw seller data from database:", data);

    // Transform the data to match our CustomerSeller type
    const sellers: CustomerSeller[] = (data || []).map(seller => {
      console.log(`🏪 Processing seller: ${seller.business_name}`, seller);
      return {
        id: seller.id,
        businessName: seller.business_name,
        bio: seller.bio,
        phoneNumber: seller.phone_number,
        plateCount: seller.plates?.length || 0,
        rating: 4.5 // Default rating - this would come from reviews in the future
      };
    });

    console.log("✅ Transformed sellers:", sellers);
    return sellers;
  } catch (error) {
    console.error('❌ Error in getAvailableSellers:', error);
    return [];
  }
};

// Fetch plates from a specific seller
export const getSellerPlates = async (sellerId: string): Promise<CustomerPlate[]> => {
  try {
    const { data, error } = await supabase
      .from('plates')
      .select(`
        id,
        name,
        price,
        image_url,
        size,
        nutritional_info,
        available_date,
        quantity,
        seller_id,
        seller_profiles!inner (
          id,
          business_name,
          bio
        )
      `)
      .eq('seller_id', sellerId)
      .gt('quantity', 0)
      .gte('available_date', new Date().toISOString())
      .order('available_date', { ascending: true });

    if (error) {
      console.error('Error fetching seller plates:', error);
      throw error;
    }

    const plates: CustomerPlate[] = (data || []).map(plate => ({
      id: plate.id,
      name: plate.name,
      price: plate.price,
      imageUrl: plate.image_url,
      size: plate.size,
      nutritionalInfo: plate.nutritional_info,
      availableDate: plate.available_date,
      quantity: plate.quantity,
      seller: {
        id: plate.seller_profiles[0].id,
        businessName: plate.seller_profiles[0].business_name,
        bio: plate.seller_profiles[0].bio
      }
    }));

    return plates;
  } catch (error) {
    console.error('Error in getSellerPlates:', error);
    return [];
  }
};