
-- Create plates table
CREATE TABLE IF NOT EXISTS public.plates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    nutritional_info text,
    available_date timestamptz NOT NULL,
    image_url text,
    sold_count integer DEFAULT 0,
    size text DEFAULT 'M', -- Added size field
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plates ENABLE ROW LEVEL SECURITY;

-- Create policy for sellers to read their own plates
CREATE POLICY "Sellers can read their own plates" 
ON public.plates
FOR SELECT
USING (auth.uid() = seller_id);

-- Create policy for sellers to insert their own plates
CREATE POLICY "Sellers can insert their own plates" 
ON public.plates
FOR INSERT
WITH CHECK (auth.uid() = seller_id);

-- Create policy for sellers to update their own plates
CREATE POLICY "Sellers can update their own plates" 
ON public.plates
FOR UPDATE
USING (auth.uid() = seller_id);

-- Create policy for sellers to delete their own plates
CREATE POLICY "Sellers can delete their own plates" 
ON public.plates
FOR DELETE
USING (auth.uid() = seller_id);

-- Create policy for customers to view plates
CREATE POLICY "Customers can view plates" 
ON public.plates
FOR SELECT
USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plates_updated_at
BEFORE UPDATE ON public.plates
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
