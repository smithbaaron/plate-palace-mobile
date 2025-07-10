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
    
    // Define start of yesterday to show plates from yesterday onwards
    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1); // Go back 1 day
    startOfYesterday.setHours(0, 0, 0, 0); // Set to midnight
    const yesterdayDate = startOfYesterday.toISOString();
    console.log("📅 Start of yesterday for filtering:", yesterdayDate);
    
    // First, let's check ALL plates without filters to see what's in the database
    const { data: allPlates, error: allPlatesError } = await supabase
      .from('plates')
      .select('*');
    
    console.log("🍽️ ALL plates in database (no filters):", allPlates);
    
    // Let's examine each plate in detail
    if (allPlates && allPlates.length > 0) {
      allPlates.forEach((plate, index) => {
        console.log(`🔍 Plate ${index + 1} details:`, {
          id: plate.id,
          name: plate.name,
          quantity: plate.quantity,
          available_date: plate.available_date,
          seller_id: plate.seller_id
        });
        console.log(`📊 Plate ${index + 1} filter check:`, {
          quantityCheck: `${plate.quantity} > 0 = ${plate.quantity > 0}`,
          availableDateCheck: `${plate.available_date} >= ${yesterdayDate} = ${plate.available_date >= yesterdayDate}`
        });
      });
    }
    
    if (allPlatesError) {
      console.error("❌ Error fetching all plates:", allPlatesError);
    }
    
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
      .gte('available_date', yesterdayDate) // Only show plates from yesterday onwards
      .order('available_date', { ascending: true });
    
    console.log("🍽️ Plates after applying filters (quantity > 0, available_date >= now):", data);

    if (error) {
      console.error('❌ Error fetching available plates:', error);
      throw error;
    }

    console.log("🍽️ Raw plates data from database:", data);

    // Transform the data to match our CustomerPlate type
    const plates: CustomerPlate[] = (data || []).map(plate => {
      console.log("🔍 Processing plate:", plate);
      
      // Check if seller_profiles data exists
      if (!plate.seller_profiles || plate.seller_profiles.length === 0) {
        console.error("❌ No seller profile found for plate:", plate.id);
        return null;
      }
      
      return {
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
      };
    }).filter(plate => plate !== null); // Remove null entries

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
    
    // Let's first check what's in the table with detailed error info
    const { data: allData, error: countError } = await supabase
      .from('seller_profiles')
      .select('*');
    
    console.log("📊 ALL seller_profiles in database:", allData);
    console.log("📊 Count of seller profiles:", allData?.length || 0);
    
    if (countError) {
      console.error("❌ Error checking seller_profiles:", countError);
      console.error("❌ Error details:", countError.details);
      console.error("❌ Error hint:", countError.hint);
      console.error("❌ Error code:", countError.code);
    }
    
    // Test a simple count query
    const { count, error: countOnlyError } = await supabase
      .from('seller_profiles')
      .select('*', { count: 'exact', head: true });
    
    console.log("📊 Direct count query result:", count);
    if (countOnlyError) {
      console.error("❌ Count query error:", countOnlyError);
    }
    
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
    console.log(`🔍 Fetching plates for seller: ${sellerId}`);
    
    // First, let's check ALL plates for this seller without filters
    const { data: allSellerPlates, error: allError } = await supabase
      .from('plates')
      .select('*')
      .eq('seller_id', sellerId);
    
    console.log(`🍽️ ALL plates for seller ${sellerId} (no filters):`, allSellerPlates);
    
    // Let's examine each plate in detail
    if (allSellerPlates && allSellerPlates.length > 0) {
      // Define start of yesterday to show plates from yesterday onwards
      const startOfYesterday = new Date();
      startOfYesterday.setDate(startOfYesterday.getDate() - 1); // Go back 1 day
      startOfYesterday.setHours(0, 0, 0, 0); // Set to midnight
      const yesterdayDate = startOfYesterday.toISOString();
      console.log("📅 Start of yesterday for filtering:", yesterdayDate);
      
      allSellerPlates.forEach((plate, index) => {
        console.log(`🔍 Seller Plate ${index + 1} details:`, {
          id: plate.id,
          name: plate.name,
          quantity: plate.quantity,
          available_date: plate.available_date,
          seller_id: plate.seller_id
        });
        console.log(`📊 Seller Plate ${index + 1} filter check:`, {
          quantityCheck: `${plate.quantity} > 0 = ${plate.quantity > 0}`,
          availableDateCheck: `${plate.available_date} >= ${yesterdayDate} = ${plate.available_date >= yesterdayDate}`
        });
      });
    }
    
    if (allError) {
      console.error("❌ Error fetching all seller plates:", allError);
    }
    
    // Define start of yesterday for the actual query
    const startOfYesterday = new Date();
    startOfYesterday.setDate(startOfYesterday.getDate() - 1); // Go back 1 day
    startOfYesterday.setHours(0, 0, 0, 0); // Set to midnight
    const yesterdayDate = startOfYesterday.toISOString();
    
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
      .gte('available_date', yesterdayDate)
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