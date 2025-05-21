
import { supabase } from './supabase';
import { Plate } from '@/components/seller/AddSinglePlateForm';
import { dbPlateToPlate } from './plates-service';

// Service functions for customer interactions with plates
export const customerPlatesService = {
  // Get all available plates (for today and future)
  getAvailablePlates: async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('plates')
        .select('*, profiles:seller_id(username)')
        .gte('available_date', today.toISOString())
        .gt('quantity', 0) // Only show plates with available quantity
        .order('available_date', { ascending: true });
        
      if (error) throw error;
      
      // Convert DB plates to frontend plates with seller info
      return data.map(plate => {
        const frontendPlate = dbPlateToPlate(plate);
        return {
          ...frontendPlate,
          seller: plate.profiles?.username || 'Unknown Seller',
          sellerUsername: plate.profiles?.username || 'unknown'
        };
      });
    } catch (error) {
      console.error('Error fetching available plates:', error);
      throw error;
    }
  },
  
  // Get a specific plate by ID
  getPlateById: async (plateId: string) => {
    try {
      const { data, error } = await supabase
        .from('plates')
        .select('*, profiles:seller_id(username)')
        .eq('id', plateId)
        .single();
        
      if (error) throw error;
      
      if (!data) {
        throw new Error('Plate not found');
      }
      
      // Convert DB plate to frontend plate with seller info
      const frontendPlate = dbPlateToPlate(data);
      return {
        ...frontendPlate,
        seller: data.profiles?.username || 'Unknown Seller',
        sellerUsername: data.profiles?.username || 'unknown'
      };
    } catch (error) {
      console.error('Error fetching plate by ID:', error);
      throw error;
    }
  }
};
