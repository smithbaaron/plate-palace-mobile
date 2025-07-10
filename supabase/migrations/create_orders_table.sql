-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    total_amount numeric(10,2) NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')),
    delivery_type text DEFAULT 'pickup' CHECK (delivery_type IN ('pickup', 'delivery')),
    delivery_address text,
    pickup_time timestamptz,
    estimated_delivery_time timestamptz,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for customers to view their own orders
CREATE POLICY "Customers can view their own orders" 
ON public.orders
FOR SELECT
USING (auth.uid() = customer_id);

-- Create policies for sellers to view orders for their plates
CREATE POLICY "Sellers can view orders for their plates" 
ON public.orders
FOR SELECT
USING (auth.uid() = seller_id);

-- Create policy for customers to insert their own orders
CREATE POLICY "Customers can insert their own orders" 
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Create policy for sellers to update order status
CREATE POLICY "Sellers can update order status" 
ON public.orders
FOR UPDATE
USING (auth.uid() = seller_id);

-- Add updated_at trigger
CREATE TRIGGER orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();