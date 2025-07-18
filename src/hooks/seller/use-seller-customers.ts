import { useState, useEffect } from 'react';
import { supabase, checkIfTableExists } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  isFollowing: boolean;
  orderCount: number;
}

export const useSellerCustomers = () => {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!currentUser) {
        console.log('❌ No current user found');
        setCustomers([]);
        return;
      }

      // Check if required tables exist
      let ordersTableExists = false;
      let customerProfilesTableExists = false;
      
      try {
        const [ordersCheck, customerProfilesCheck] = await Promise.all([
          checkIfTableExists('orders'),
          checkIfTableExists('customer_profiles')
        ]);
        ordersTableExists = ordersCheck;
        customerProfilesTableExists = customerProfilesCheck;
      } catch (err) {
        console.log('📊 Table check failed, using mock data');
      }

      if (!ordersTableExists && !customerProfilesTableExists) {
        console.log('📊 Required tables not available, using mock data');
        // Mock customers data
        const mockCustomers: Customer[] = [
          {
            id: "cust1",
            name: "Jane Smith",
            email: "jane@example.com",
            totalOrders: 5,
            totalSpent: 127.45,
            lastOrderDate: "2025-07-14T10:30:00Z",
            isFollowing: true,
            orderCount: 5
          },
          {
            id: "cust2",
            name: "Alex Johnson",
            email: "alex@example.com",
            totalOrders: 3,
            totalSpent: 89.97,
            lastOrderDate: "2025-07-13T15:20:00Z",
            isFollowing: false,
            orderCount: 3
          },
          {
            id: "cust3",
            name: "Sam Taylor",
            email: "sam@example.com",
            totalOrders: 2,
            totalSpent: 58.94,
            lastOrderDate: "2025-07-12T18:45:00Z",
            isFollowing: true,
            orderCount: 2
          }
        ];
        setCustomers(mockCustomers);
        return;
      }

      console.log('🔍 Fetching customers for seller:', currentUser.id);
      
      // Get customers from orders
      const customersFromOrders = new Map<string, Customer>();
      
      if (ordersTableExists) {
        // First get orders for this seller
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('customer_id, total_amount, created_at, status')
          .eq('seller_id', currentUser.id)
          .neq('status', 'cancelled');

        if (ordersError) {
          console.error('❌ Error fetching orders:', ordersError);
        } else if (orders) {
          // Get unique customer IDs
          const customerIds = [...new Set(orders.map(order => order.customer_id))];
          
          // Get customer profiles with their real information
          const { data: customerProfiles, error: customerProfilesError } = await supabase
            .from('customer_profiles')
            .select('user_id, full_name, email, phone, followed_sellers')
            .in('user_id', customerIds);

          console.log('🔍 Customer profiles with real data:', customerProfiles);
          console.log('🔍 Customer IDs to lookup:', customerIds);

          if (customerProfilesError) {
            console.error('❌ Error fetching customer profiles:', customerProfilesError);
            // Fallback to basic profiles if customer_profiles fails
            const { data: basicProfiles } = await supabase
              .from('profiles')
              .select('id, username')
              .in('id', customerIds);
            console.log('🔍 Fallback to basic profiles:', basicProfiles);
          }

          // Process orders with real customer data from customer_profiles
          orders.forEach(order => {
            const customerId = order.customer_id;
            const customerProfile = customerProfiles?.find(cp => cp.user_id === customerId);
            const customerName = customerProfile?.full_name || `Customer ${customerId.slice(0, 8)}`;
            const customerEmail = customerProfile?.email || `customer${customerId.slice(0, 8)}@example.com`;
            
            if (customersFromOrders.has(customerId)) {
              const existing = customersFromOrders.get(customerId)!;
              existing.totalOrders += 1;
              existing.orderCount += 1;
              existing.totalSpent += parseFloat(order.total_amount);
              if (new Date(order.created_at) > new Date(existing.lastOrderDate)) {
                existing.lastOrderDate = order.created_at;
              }
            } else {
              customersFromOrders.set(customerId, {
                id: customerId,
                name: customerName,
                email: customerEmail,
                totalOrders: 1,
                orderCount: 1,
                totalSpent: parseFloat(order.total_amount),
                lastOrderDate: order.created_at,
                isFollowing: false // Will be updated below
              });
            }
          });
        }
      }

      // Get followers from customer_profiles
      if (customerProfilesTableExists) {
        const { data: followers, error: followersError } = await supabase
          .from('customer_profiles')
          .select('user_id, followed_sellers, full_name, email, phone')
          .contains('followed_sellers', [currentUser.id]);

        if (followersError) {
          console.error('❌ Error fetching followers:', followersError);
        } else if (followers) {
          followers.forEach(follower => {
            const customerId = follower.user_id;
            const customerName = follower.full_name || `Customer ${customerId.slice(0, 8)}`;
            const customerEmail = follower.email || `customer${customerId.slice(0, 8)}@example.com`;
            
            if (customersFromOrders.has(customerId)) {
              customersFromOrders.get(customerId)!.isFollowing = true;
            } else {
              // Follower without orders
              customersFromOrders.set(customerId, {
                id: customerId,
                name: customerName,
                email: customerEmail,
                totalOrders: 0,
                orderCount: 0,
                totalSpent: 0,
                lastOrderDate: '',
                isFollowing: true
              });
            }
          });
        }
      }

      const finalCustomers = Array.from(customersFromOrders.values())
        .sort((a, b) => {
          // Sort by: followers first, then by total spent, then by last order date
          if (a.isFollowing && !b.isFollowing) return -1;
          if (!a.isFollowing && b.isFollowing) return 1;
          if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent;
          return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
        });

      console.log('✅ Final customers list:', finalCustomers);
      setCustomers(finalCustomers);

    } catch (err) {
      console.error("Error loading customers:", err);
      setError("Failed to load customers data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [currentUser]);

  return {
    customers,
    isLoading,
    error,
    loadCustomers,
  };
};