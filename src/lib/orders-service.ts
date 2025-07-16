import { supabase } from './supabase';
import { Order } from '@/types/order';
import { bundleService } from './bundles-service';

export const getCustomerOrders = async (customerId: string): Promise<Order[]> => {
  try {
    console.log('🔍 Fetching orders for customer:', customerId);
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          plate_id,
          quantity,
          unit_price,
          subtotal,
          plates (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching orders:', error);
      throw error;
    }

    console.log('✅ Raw orders from database:', orders);

    if (!orders || orders.length === 0) {
      console.log('📦 No orders found for customer');
      return [];
    }

    // Transform database orders to match Order interface
    const transformedOrders: Order[] = [];
    
    for (const order of orders) {
      // Fetch seller profile separately since we can't join directly
      let sellerName = 'Unknown Seller';
      try {
        const { data: sellerProfile } = await supabase
          .from('seller_profiles')
          .select('business_name')
          .eq('user_id', order.seller_id)
          .single();
        
        if (sellerProfile) {
          sellerName = sellerProfile.business_name;
        }
      } catch (error) {
        console.warn('Could not fetch seller profile:', error);
      }
      
      const items = (order.order_items || []).map(item => ({
        id: item.id,
        plateId: item.plate_id,
        name: item.plates?.name || 'Unknown Item',
        price: parseFloat(item.unit_price),
        quantity: item.quantity,
        imageUrl: item.plates?.image_url || 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80', // Fallback image
      }));

      transformedOrders.push({
        id: order.id,
        customerId: order.customer_id,
        sellerId: order.seller_id,
        customerName: 'Customer', // We don't have this in the database yet
        sellerName,
        items,
        status: order.status as any, // Map database status to our enum
        total: parseFloat(order.total_amount),
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        scheduledFor: order.pickup_time || order.estimated_delivery_time || order.created_at,
        paymentMethod: 'card', // Default for now
        deliveryMethod: order.delivery_type as 'pickup' | 'delivery',
        address: order.delivery_address,
      });
    }

    console.log('✅ Transformed orders:', transformedOrders);
    return transformedOrders;
  } catch (error) {
    console.error('❌ Error in getCustomerOrders:', error);
    throw error;
  }
};

export const createOrder = async (orderData: {
  customerId: string;
  sellerId: string;
  items: Array<{
    plateId: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  pickupTime?: string;
  notes?: string;
}) => {
  try {
    console.log('🔍 Creating order:', orderData);

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: orderData.customerId,
        seller_id: orderData.sellerId,
        total_amount: orderData.totalAmount,
        delivery_type: orderData.deliveryType,
        delivery_address: orderData.deliveryAddress,
        pickup_time: orderData.pickupTime,
        notes: orderData.notes,
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error creating order:', orderError);
      throw orderError;
    }

    console.log('✅ Order created:', order);

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      plate_id: item.plateId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.quantity * item.unitPrice,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Error creating order items:', itemsError);
      throw itemsError;
    }

    console.log('✅ Order items created successfully');
    return order;
  } catch (error) {
    console.error('❌ Error in createOrder:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId: string, customerId: string) => {
  try {
    console.log('🚫 Cancelling order:', orderId, 'for customer:', customerId);
    console.log('🔍 Types - orderId:', typeof orderId, 'customerId:', typeof customerId);
    
    // First check if the order belongs to the customer and can be cancelled
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, customer_id, status, seller_id')
      .eq('id', orderId)
      .eq('customer_id', customerId);

    if (fetchError) {
      console.error('❌ Error fetching order:', fetchError);
      throw fetchError;
    }

    console.log('🔍 Found orders for cancellation check:', orders);

    if (!orders || orders.length === 0) {
      // Let's also try to find the order without customer_id filter to see if it exists at all
      const { data: allOrdersWithId } = await supabase
        .from('orders')
        .select('id, customer_id, status')
        .eq('id', orderId);
      
      console.log('🔍 Orders with this ID (any customer):', allOrdersWithId);
      
      if (!allOrdersWithId || allOrdersWithId.length === 0) {
        throw new Error('Order not found with this ID');
      } else {
        throw new Error(`Order found but belongs to different customer. Order customer_id: ${allOrdersWithId[0].customer_id}, Your customer_id: ${customerId}`);
      }
    }

    if (orders.length > 1) {
      console.error('⚠️ Multiple orders found with same ID:', orders);
      throw new Error('Multiple orders found - this should not happen');
    }

    const existingOrder = orders[0];
    console.log('📋 Order details before cancellation:', existingOrder);

    // Check if order can be cancelled (only allow cancellation for pending/confirmed orders)
    if (!['pending', 'confirmed'].includes(existingOrder.status)) {
      throw new Error(`Cannot cancel order with status: ${existingOrder.status}`);
    }

    console.log('🔄 Attempting to update order with:', { orderId, customerId, currentStatus: existingOrder.status });
    
    // Try updating just by order ID since we already verified ownership
    const { data: cancelledOrders, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select();

    console.log('🔄 Update result (without customer_id filter):', { data: cancelledOrders, error: updateError });

    if (updateError) {
      console.error('❌ Error cancelling order:', updateError);
      throw updateError;
    }

    if (!cancelledOrders || cancelledOrders.length === 0) {
      console.log('🔄 Update without customer_id filter also failed, trying with RLS bypass...');
      
      // Let's try to get more information about why the update is failing
      const { data: orderCheck } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId);
      
      console.log('🔍 Full order details for debugging:', orderCheck);
      
      throw new Error('Failed to cancel order - update operation blocked. This might be due to database row-level security policies.');
    }
    
    console.log('✅ Order cancelled successfully:', cancelledOrders);
    return cancelledOrders[0];
  } catch (error) {
    console.error('❌ Error in cancelOrder:', error);
    throw error;
  }
};

export const deleteOrder = async (orderId: string, customerId: string) => {
  try {
    console.log('🗑️ Deleting order:', orderId, 'for customer:', customerId);
    
    // First check if the order exists and belongs to the customer
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, customer_id, status')
      .eq('id', orderId)
      .eq('customer_id', customerId);

    if (fetchError) {
      console.error('❌ Error fetching order for deletion:', fetchError);
      throw fetchError;
    }

    if (!orders || orders.length === 0) {
      throw new Error('Order not found or does not belong to this customer');
    }

    const existingOrder = orders[0];
    
    // Only allow deletion of cancelled orders
    if (existingOrder.status !== 'cancelled') {
      throw new Error('Only cancelled orders can be deleted');
    }

    console.log('🗑️ Deleting order and related items:', existingOrder);

    // Delete order items first (foreign key constraint)
    const { data: deletedItems, error: itemsDeleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId)
      .select();

    if (itemsDeleteError) {
      console.error('❌ Error deleting order items:', itemsDeleteError);
      throw itemsDeleteError;
    }

    console.log('✅ Deleted order items:', deletedItems);

    // Delete the order - try without customer_id filter first since we already validated ownership
    const { data: deletedOrder, error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .select();

    if (deleteError) {
      console.error('❌ Error deleting order:', deleteError);
      throw deleteError;
    }

    if (!deletedOrder || deletedOrder.length === 0) {
      console.error('❌ No rows affected during order deletion. This may be due to RLS policies.');
      // Let's check if the order still exists
      const { data: stillExists } = await supabase
        .from('orders')
        .select('id, status')
        .eq('id', orderId);
      
      console.log('🔍 Order still exists after delete attempt:', stillExists);
      throw new Error('Failed to delete order - no rows affected. This may be due to database permissions.');
    }

    console.log('✅ Order deleted successfully:', deletedOrder);
    return deletedOrder[0];
  } catch (error) {
    console.error('❌ Error in deleteOrder:', error);
    throw error;
  }
};

// New function for creating bundle orders
export const createBundleOrder = async (orderData: {
  customerId: string;
  bundleId: string;
  sellerId: string;
  selectedPlates: { plateId: string; quantity: number }[];
  bundlePrice: number;
  deliveryType: 'pickup' | 'delivery';
}) => {
  try {
    console.log('🛒 Creating bundle order:', orderData);

    // First, check if the bundle is still available
    const isAvailable = await bundleService.checkBundleAvailability(orderData.bundleId);
    if (!isAvailable) {
      throw new Error('Bundle is no longer available for purchase');
    }

    // Create the main order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: orderData.customerId,
        seller_id: orderData.sellerId,
        total_amount: orderData.bundlePrice,
        status: 'pending',
        delivery_type: orderData.deliveryType,
        notes: `Bundle order: ${orderData.bundleId}`,
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error creating order:', orderError);
      throw orderError;
    }

    // Create order items for each selected plate
    const orderItems = orderData.selectedPlates.map(item => ({
      order_id: order.id,
      plate_id: item.plateId,
      quantity: item.quantity,
      unit_price: orderData.bundlePrice / orderData.selectedPlates.reduce((sum, p) => sum + p.quantity, 0), // Distribute bundle price
      subtotal: (orderData.bundlePrice / orderData.selectedPlates.reduce((sum, p) => sum + p.quantity, 0)) * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Error creating order items:', itemsError);
      // Clean up the order if items creation fails
      await supabase.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    // Debug: Check if all plate IDs exist before updating quantities
    console.log('🔍 Checking plate IDs before update:', orderData.selectedPlates.map(p => p.plateId));
    
    // Verify all plate IDs exist in the database first
    const plateIds = orderData.selectedPlates.map(p => p.plateId);
    const { data: existingPlates, error: checkError } = await supabase
      .from('plates')
      .select('id, quantity')
      .in('id', plateIds);
    
    if (checkError) {
      console.error('❌ Error checking plate existence:', checkError);
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Failed to verify plate existence: ${checkError.message}`);
    }
    
    console.log('🔍 Found plates in database:', existingPlates?.map(p => ({ id: p.id, quantity: p.quantity })));
    
    // Check for missing plates
    const missingPlates = plateIds.filter(id => !existingPlates?.find(p => p.id === id));
    if (missingPlates.length > 0) {
      console.error('❌ Missing plates:', missingPlates);
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Plates not found in database: ${missingPlates.join(', ')}`);
    }

    // Update plate quantities directly using SQL instead of RPC function
    for (const selectedPlate of orderData.selectedPlates) {
      const currentPlate = existingPlates?.find(p => p.id === selectedPlate.plateId);
      if (!currentPlate) {
        console.error('❌ Plate not found in verification:', selectedPlate.plateId);
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Plate not found: ${selectedPlate.plateId}`);
      }

      if (currentPlate.quantity < selectedPlate.quantity) {
        console.error('❌ Insufficient quantity:', currentPlate.quantity, 'needed:', selectedPlate.quantity);
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Insufficient quantity for plate ${selectedPlate.plateId}`);
      }

      const newQuantity = currentPlate.quantity - selectedPlate.quantity;
      
      // Direct SQL update instead of RPC function
      const { error: updateError } = await supabase
        .from('plates')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPlate.plateId);

      if (updateError) {
        console.error('⚠️ Error updating plate quantity:', selectedPlate.plateId, updateError);
        // Clean up the order if plate updates fail
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Failed to update plate quantities: ${updateError.message}`);
      }

      console.log(`✅ Updated plate ${selectedPlate.plateId} quantity from ${currentPlate.quantity} to ${newQuantity}`);
    }

    console.log('✅ Bundle order created successfully:', order.id);
    return order;
  } catch (error) {
    console.error('❌ Error in createBundleOrder:', error);
    throw error;
  }
};