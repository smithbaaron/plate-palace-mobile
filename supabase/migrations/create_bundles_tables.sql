
-- Add new columns to plates table for bundle availability
ALTER TABLE public.plates 
ADD COLUMN IF NOT EXISTS is_single boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_bundle boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

-- Create bundles table
CREATE TABLE IF NOT EXISTS public.bundles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    plate_count integer NOT NULL,
    price numeric(10,2) NOT NULL,
    available_date date NOT NULL,
    availability_scope text CHECK (availability_scope IN ('day', 'week')) NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create bundle_plates junction table
CREATE TABLE IF NOT EXISTS public.bundle_plates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    bundle_id uuid REFERENCES public.bundles(id) ON DELETE CASCADE,
    plate_id uuid REFERENCES public.plates(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE (bundle_id, plate_id)
);

-- Enable RLS on new tables
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_plates ENABLE ROW LEVEL SECURITY;

-- Create policies for bundles table
CREATE POLICY "Sellers can read their own bundles" 
ON public.bundles
FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert their own bundles" 
ON public.bundles
FOR INSERT
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own bundles" 
ON public.bundles
FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own bundles" 
ON public.bundles
FOR DELETE
USING (auth.uid() = seller_id);

CREATE POLICY "Customers can view bundles" 
ON public.bundles
FOR SELECT
USING (true);

-- Create policies for bundle_plates table
CREATE POLICY "Sellers can manage bundle_plates for their bundles" 
ON public.bundle_plates
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.bundles 
        WHERE bundles.id = bundle_plates.bundle_id 
        AND bundles.seller_id = auth.uid()
    )
);

CREATE POLICY "Anyone can view bundle_plates" 
ON public.bundle_plates
FOR SELECT
USING (true);

-- Add updated_at trigger for bundles
CREATE TRIGGER bundles_updated_at
BEFORE UPDATE ON public.bundles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
