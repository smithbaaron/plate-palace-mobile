-- Add RLS policy to allow customers to cancel their own orders
-- This allows customers to update the status of orders where they are the customer

-- Drop existing update policy if it exists (in case we need to replace it)
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;

-- Create a comprehensive update policy for customers
CREATE POLICY "Customers can update their own orders for cancellation" 
ON orders 
FOR UPDATE 
TO authenticated 
USING (customer_id = auth.uid()) 
WITH CHECK (
  customer_id = auth.uid() 
  AND status IN ('pending', 'confirmed') -- Only allow updates for orders that can be cancelled
  AND (
    -- Only allow specific status updates for cancellation
    (OLD.status IN ('pending', 'confirmed') AND NEW.status = 'cancelled')
    OR 
    -- Allow updating the updated_at timestamp
    (OLD.status = NEW.status AND NEW.updated_at IS NOT NULL)
  )
);

-- Also add a general update policy for sellers to manage orders
CREATE POLICY "Sellers can update orders for their plates" 
ON orders 
FOR UPDATE 
TO authenticated 
USING (seller_id = auth.uid()) 
WITH CHECK (seller_id = auth.uid());

-- Ensure RLS is enabled on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Add a comment for documentation
COMMENT ON POLICY "Customers can update their own orders for cancellation" ON orders IS 
'Allows customers to cancel their own pending or confirmed orders by updating status to cancelled';