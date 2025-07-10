-- Create delivery_addresses table
CREATE TABLE IF NOT EXISTS public.delivery_addresses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL, -- e.g., "Home", "Work", "Mom's house"
    street_address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    country text DEFAULT 'United States',
    delivery_instructions text,
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;

-- Create policy for customers to manage their own delivery addresses
CREATE POLICY "Customers can manage their own delivery addresses" 
ON public.delivery_addresses
FOR ALL
USING (auth.uid() = customer_id)
WITH CHECK (auth.uid() = customer_id);

-- Add updated_at trigger
CREATE TRIGGER delivery_addresses_updated_at
BEFORE UPDATE ON public.delivery_addresses
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create index for faster lookups
CREATE INDEX idx_delivery_addresses_customer_id ON public.delivery_addresses(customer_id);
CREATE INDEX idx_delivery_addresses_default ON public.delivery_addresses(customer_id, is_default) WHERE is_default = true;