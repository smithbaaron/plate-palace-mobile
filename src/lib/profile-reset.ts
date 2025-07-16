import { supabase } from './supabase';

/**
 * Reset user profile data to allow them to choose their user type again
 * This is useful when a user was incorrectly assigned a user type
 */
export const resetUserProfile = async (userId: string) => {
  try {
    console.log('🔄 Resetting user profile for:', userId);
    
    // Remove from seller_profiles if exists
    const { error: sellerError } = await supabase
      .from('seller_profiles')
      .delete()
      .eq('user_id', userId);
    
    if (sellerError && sellerError.code !== 'PGRST116') {
      console.log('❌ Error removing seller profile:', sellerError);
    } else {
      console.log('✅ Removed seller profile (if existed)');
    }
    
    // Remove from customer_profiles if exists
    const { error: customerError } = await supabase
      .from('customer_profiles')
      .delete()
      .eq('user_id', userId);
    
    if (customerError && customerError.code !== 'PGRST116') {
      console.log('❌ Error removing customer profile:', customerError);
    } else {
      console.log('✅ Removed customer profile (if existed)');
    }
    
    // Reset in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        user_type: null,
        is_onboarded: false
      })
      .eq('id', userId);
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.log('❌ Error updating profile:', profileError);
    } else {
      console.log('✅ Reset profile table entry');
    }
    
    console.log('✅ User profile reset completed');
    return true;
  } catch (error) {
    console.error('❌ Error resetting user profile:', error);
    return false;
  }
};