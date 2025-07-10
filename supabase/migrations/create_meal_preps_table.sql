-- Create meal_preps table
CREATE TABLE IF NOT EXISTS public.meal_preps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    nutritional_info text,
    available_date timestamptz NOT NULL,
    prep_time_hours integer DEFAULT 24,
    image_url text,
    sold_count integer DEFAULT 0,
    delivery_available boolean DEFAULT false,
    pickup_available boolean DEFAULT true,
    pickup_time text,
    estimated_delivery_time text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meal_preps ENABLE ROW LEVEL SECURITY;

-- Create policy for sellers to read their own meal preps
CREATE POLICY "Sellers can read their own meal preps" 
ON public.meal_preps
FOR SELECT
USING (auth.uid() = seller_id);

-- Create policy for sellers to insert their own meal preps
CREATE POLICY "Sellers can insert their own meal preps" 
ON public.meal_preps
FOR INSERT
WITH CHECK (auth.uid() = seller_id);

-- Create policy for sellers to update their own meal preps
CREATE POLICY "Sellers can update their own meal preps" 
ON public.meal_preps
FOR UPDATE
USING (auth.uid() = seller_id);

-- Create policy for sellers to delete their own meal preps
CREATE POLICY "Sellers can delete their own meal preps" 
ON public.meal_preps
FOR DELETE
USING (auth.uid() = seller_id);

-- Create policy for customers to view meal preps
CREATE POLICY "Customers can view meal preps" 
ON public.meal_preps
FOR SELECT
USING (true);

-- Add updated_at trigger
CREATE TRIGGER meal_preps_updated_at
BEFORE UPDATE ON public.meal_preps
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();