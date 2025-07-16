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

  async checkBundleAvailability(bundleId: string): Promise<boolean> {
    try {
      // Get bundle details
      const bundlesData = await this.getAvailableBundles();
      const bundle = bundlesData.find(b => b.id === bundleId);
      
      if (!bundle) return false;
      
      // Calculate total available plates
      const totalAvailablePlates = bundle.bundle_plates?.reduce((sum, bp) => sum + bp.quantity, 0) || 0;
      
      // Check if we can still make at least one bundle
      return totalAvailablePlates >= bundle.plate_count;
    } catch (error) {
      console.error('Error checking bundle availability:', error);
      return false;
    }
  },

  async updatePlateQuantitiesAfterPurchase(selectedPlates: { plateId: string; quantity: number }[]): Promise<void> {
    try {
      for (const selectedPlate of selectedPlates) {
        // Get current quantity first, then update
        const { data: currentPlate, error: fetchError } = await supabase
          .from('plates')
          .select('quantity')
          .eq('id', selectedPlate.plateId)
          .single();

        if (fetchError || !currentPlate) {
          throw new Error(`Could not find plate ${selectedPlate.plateId}`);
        }

        const newQuantity = currentPlate.quantity - selectedPlate.quantity;
        if (newQuantity < 0) {
          throw new Error(`Insufficient quantity for plate ${selectedPlate.plateId}`);
        }

        // Update with the new quantity
        const { error } = await supabase
          .from('plates')
          .update({ quantity: newQuantity })
          .eq('id', selectedPlate.plateId);

        if (error) {
          console.error('Error updating plate quantity:', error);
          throw new Error(`Failed to update quantity for plate ${selectedPlate.plateId}`);
        }
      }
    } catch (error) {
      console.error('Error updating plate quantities:', error);
      throw error;
    }
  },
};