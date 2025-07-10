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
        ),
        seller_profiles!orders_seller_id_fkey (
          business_name
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
    const transformedOrders: Order[] = orders.map(order => {
      const items = (order.order_items || []).map(item => ({
        id: item.id,
        plateId: item.plate_id,
        name: item.plates?.name || 'Unknown Item',
        price: parseFloat(item.unit_price),
        quantity: item.quantity,
      }));

      return {
        id: order.id,
        customerId: order.customer_id,
        sellerId: order.seller_id,
        customerName: 'Customer', // We don't have this in the database yet
        sellerName: order.seller_profiles?.business_name || 'Unknown Seller',
        items,
        status: order.status as any, // Map database status to our enum
        total: parseFloat(order.total_amount),
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        scheduledFor: order.pickup_time || order.estimated_delivery_time || order.created_at,
        paymentMethod: 'card', // Default for now
        deliveryMethod: order.delivery_type as 'pickup' | 'delivery',
        address: order.delivery_address,
      };
    });

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