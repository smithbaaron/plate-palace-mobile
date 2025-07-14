import { supabase } from './supabase';
import { Order } from '@/types/order';

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
            name
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
    
    // First check if the order belongs to the customer and can be cancelled
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, customer_id, status')
      .eq('id', orderId)
      .eq('customer_id', customerId);

    if (fetchError) {
      console.error('❌ Error fetching order:', fetchError);
      throw fetchError;
    }

    console.log('🔍 Found orders for cancellation check:', orders);

    if (!orders || orders.length === 0) {
      throw new Error('Order not found or does not belong to this customer');
    }

    if (orders.length > 1) {
      console.error('⚠️ Multiple orders found with same ID:', orders);
      throw new Error('Multiple orders found - this should not happen');
    }

    const existingOrder = orders[0];

    // Check if order can be cancelled (only allow cancellation for pending/confirmed orders)
    if (!['pending', 'confirmed'].includes(existingOrder.status)) {
      throw new Error(`Cannot cancel order with status: ${existingOrder.status}`);
    }

    // Update order status to cancelled
    const { data: cancelledOrders, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('customer_id', customerId)
      .select();

    if (updateError) {
      console.error('❌ Error cancelling order:', updateError);
      throw updateError;
    }

    console.log('✅ Order cancelled successfully:', cancelledOrders);
    
    if (!cancelledOrders || cancelledOrders.length === 0) {
      throw new Error('Failed to cancel order - no rows updated');
    }
    
    return cancelledOrders[0];
  } catch (error) {
    console.error('❌ Error in cancelOrder:', error);
    throw error;
  }
};