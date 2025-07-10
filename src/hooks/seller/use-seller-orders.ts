
import { useState, useEffect } from 'react';
import { Order } from '@/types/order';
import { supabase, checkIfTableExists } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export const useSellerOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats from orders
  const calculateStats = () => {
    // Filter out refunded orders for both sales and orders count calculation
    const validOrders = orders.filter(order => order.status !== 'refunded');
    
    const totalSales = validOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrdersCount = validOrders.length; // Only count non-refunded orders
    
    return {
      totalSales,
      totalOrdersCount,
    };
  };

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if orders table exists with timeout
      let ordersTableExists = false;
      try {
        const checkPromise = checkIfTableExists('orders');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Table check timeout')), 3000)
        );
        
        ordersTableExists = await Promise.race([checkPromise, timeoutPromise]) as boolean;
      } catch (err) {
        console.log('📊 Orders table check timed out or failed, using mock data');
        ordersTableExists = false;
      }
      
      if (!ordersTableExists) {
        console.log('📊 Orders table not available, using mock data');
        // No orders table yet, return mock data for development
        const mockOrders: Order[] = [
          {
            id: "ORD-001",
            customerId: "cust1",
            sellerId: "seller1",
            customerName: "Jane Smith",
            sellerName: "Your Store",
            items: [
              {
                id: "item1",
                plateId: "plate1",
                name: "Chicken Alfredo Pasta",
                price: 12.99,
                quantity: 2,
              },
              {
                id: "item2",
                plateId: "plate2",
                name: "Garden Salad",
                price: 6.99,
                quantity: 1,
              }
            ],
            status: "pending",
            total: 32.97,
            createdAt: "2025-05-17T14:30:00Z",
            updatedAt: "2025-05-17T14:30:00Z",
            scheduledFor: "2025-05-18T18:00:00Z",
            paymentMethod: "card",
            deliveryMethod: "pickup",
          },
          {
            id: "ORD-002",
            customerId: "cust2",
            sellerId: "seller1",
            customerName: "Alex Johnson",
            sellerName: "Your Store",
            items: [
              {
                id: "item3",
                plateId: "plate3",
                name: "Beef Stir Fry",
                price: 14.99,
                quantity: 1,
              }
            ],
            status: "confirmed",
            total: 14.99,
            createdAt: "2025-05-17T10:15:00Z",
            updatedAt: "2025-05-17T10:20:00Z",
            scheduledFor: "2025-05-18T12:30:00Z",
            paymentMethod: "app",
            deliveryMethod: "delivery",
            address: "123 Main St, Apt 4B, Cityville"
          },
          {
            id: "ORD-003",
            customerId: "cust3",
            sellerId: "seller1",
            customerName: "Sam Taylor",
            sellerName: "Your Store",
            items: [
              {
                id: "item4",
                plateId: "plate1",
                name: "Chicken Alfredo Pasta",
                price: 12.99,
                quantity: 3,
              }
            ],
            status: "ready",
            total: 38.97,
            createdAt: "2025-05-16T16:45:00Z",
            updatedAt: "2025-05-17T09:30:00Z",
            scheduledFor: "2025-05-18T17:15:00Z",
            paymentMethod: "cash",
            deliveryMethod: "pickup",
          }
        ];

        setOrders(mockOrders);
        return;
      }

      // Fetch actual orders for this seller
      if (!currentUser) {
        console.log('❌ No current user found');
        setOrders([]);
        return;
      }

      console.log('🔍 Fetching orders for seller:', currentUser.id);
      
      const { data: rawOrders, error: ordersError } = await supabase
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
        .eq('seller_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('❌ Error fetching seller orders:', ordersError);
        throw ordersError;
      }

      console.log('✅ Raw seller orders from database:', rawOrders);

      if (!rawOrders || rawOrders.length === 0) {
        console.log('📦 No orders found for seller');
        setOrders([]);
        return;
      }

      // Transform database orders to match Order interface
      const transformedOrders: Order[] = [];
      
      for (const order of rawOrders) {
        // Fetch customer name from profiles table
        let customerName = 'Unknown Customer';
        try {
          console.log('🔍 Fetching customer name for customer_id:', order.customer_id);
          
          const { data: customerProfile, error: customerError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', order.customer_id)
            .single();
            
          if (customerProfile?.username && !customerError) {
            customerName = customerProfile.username;
            console.log('✅ Found customer name:', customerName);
          } else {
            console.log('⚠️ No customer username found, error:', customerError);
            customerName = `Customer ${order.customer_id.slice(0, 8)}`;
          }
        } catch (err) {
          console.log('❌ Error fetching customer name for order:', order.id, err);
          customerName = `Customer ${order.customer_id.slice(0, 8)}`;
        }

        const transformedOrder: Order = {
          id: order.id,
          customerId: order.customer_id,
          sellerId: order.seller_id,
          customerName: customerName,
          sellerName: "Your Store", // This is the seller viewing their own orders
          items: order.order_items?.map((item: any) => ({
            id: item.id,
            plateId: item.plate_id,
            name: item.plates?.name || 'Unknown Item',
            price: item.unit_price,
            quantity: item.quantity
          })) || [],
          status: order.status,
          total: order.total_amount,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          scheduledFor: order.pickup_time || order.estimated_delivery_time || order.created_at,
          paymentMethod: "card", // Default since we don't store payment method yet
          deliveryMethod: order.delivery_type,
          address: order.delivery_address
        };
        
        transformedOrders.push(transformedOrder);
      }

      console.log('✅ Transformed seller orders:', transformedOrders);
      setOrders(transformedOrders);

    } catch (err) {
      console.error("Error loading orders:", err);
      setError("Failed to load orders data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  const stats = calculateStats();

  return {
    orders,
    isLoading,
    error,
    loadOrders,
    ...stats,
  };
};
