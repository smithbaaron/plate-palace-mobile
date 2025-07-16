import { supabase } from "./supabase";
import { BundleFormValues } from "@/components/seller/PlateFormTypes";

export interface Bundle {
  id: string;
  seller_id: string;
  name: string;
  plate_count: number;
  price: number;
  available_date: string;
  availability_scope: 'day' | 'week';
  created_at: string;
  updated_at: string;
  bundle_plates?: {
    plate_id: string;
    quantity: number;
    plates: {
      id: string;
      name: string;
      price: number;
      size: string;
      image_url?: string;
    };
  }[];
}

export const bundleService = {
  async createBundle(bundleData: {
    name: string;
    plateCount: number;
    price: number;
    availableDate: Date;
    availabilityScope: 'day' | 'week';
    selectedPlateQuantities: { [plateId: string]: number };
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    console.log("Creating bundle with data:", bundleData);

    // Calculate total available plates and maximum possible bundles
    const totalAvailablePlates = Object.values(bundleData.selectedPlateQuantities).reduce((sum, qty) => sum + qty, 0);
    const maxBundles = Math.floor(totalAvailablePlates / bundleData.plateCount);

    console.log(`Bundle can theoretically sell ${maxBundles} bundles (${totalAvailablePlates} total plates ÷ ${bundleData.plateCount} plates per bundle)`);

    // Create the bundle
    const { data: bundle, error: bundleError } = await supabase
      .from('bundles')
      .insert({
        seller_id: user.id,
        name: bundleData.name,
        plate_count: bundleData.plateCount,
        price: bundleData.price,
        available_date: bundleData.availableDate.toISOString().split('T')[0],
        availability_scope: bundleData.availabilityScope,
      })
      .select()
      .single();

    if (bundleError) {
      console.error("Bundle creation error:", bundleError);
      throw new Error(`Failed to create bundle: ${bundleError.message || bundleError.details || 'Unknown database error'}`);
    }

    // Create bundle_plates relationships with actual quantities
    const bundlePlatesData = Object.entries(bundleData.selectedPlateQuantities).map(([plateId, quantity]) => ({
      bundle_id: bundle.id,
      plate_id: plateId,
      quantity: quantity,
    }));

    const { error: bundlePlatesError } = await supabase
      .from('bundle_plates')
      .insert(bundlePlatesData);

    if (bundlePlatesError) {
      console.error("Bundle plates creation error:", bundlePlatesError);
      // Cleanup: delete the bundle if plate relationships failed
      await supabase.from('bundles').delete().eq('id', bundle.id);
      throw new Error(`Failed to create bundle plates: ${bundlePlatesError.message || bundlePlatesError.details || 'Unknown database error'}`);
    }

    return bundle;
  },

  async getBundles() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('bundles')
      .select(`
        *,
        bundle_plates (
          plate_id,
          quantity,
          plates (
            id,
            name,
            price,
            size,
            image_url
          )
        )
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Bundle[];
  },

  async getAvailableBundles() {
    // Get all bundles that are available to customers (public browsing)
    const { data, error } = await supabase
      .from('bundles')
      .select(`
        *,
        bundle_plates (
          plate_id,
          quantity,
          plates (
            id,
            name,
            price,
            size,
            image_url
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching available bundles:', error);
      throw error;
    }
    
    console.log("📦 Raw bundles data:", data);
    return data as Bundle[];
  },

  async deleteBundle(bundleId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('bundles')
      .delete()
      .eq('id', bundleId)
      .eq('seller_id', user.id);

    if (error) throw error;
  },
};