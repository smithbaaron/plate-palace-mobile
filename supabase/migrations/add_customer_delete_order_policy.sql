-- Allow customers to delete their own orders (only cancelled ones)
CREATE POLICY "Customers can delete their own cancelled orders" ON orders
  FOR DELETE
  USING (
    auth.uid() = customer_id AND status = 'cancelled'
  );

-- Also allow customers to delete order items for their cancelled orders
CREATE POLICY "Customers can delete order items for their cancelled orders" ON order_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid() 
      AND orders.status = 'cancelled'
    )
  );