-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL,
    plate_id uuid,
    meal_prep_id uuid,
    quantity integer NOT NULL DEFAULT 1,
    unit_price numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT order_items_item_check CHECK (
        (plate_id IS NOT NULL AND meal_prep_id IS NULL) OR 
        (plate_id IS NULL AND meal_prep_id IS NOT NULL)
    ),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_plate FOREIGN KEY (plate_id) REFERENCES public.plates(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_meal_prep FOREIGN KEY (meal_prep_id) REFERENCES public.meal_preps(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policy for customers to view their own order items
CREATE POLICY "Customers can view their own order items" 
ON public.order_items
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND orders.customer_id = auth.uid()
    )
);

-- Create policy for sellers to view order items for their orders
CREATE POLICY "Sellers can view order items for their orders" 
ON public.order_items
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND orders.seller_id = auth.uid()
    )
);

-- Create policy for customers to insert order items
CREATE POLICY "Customers can insert order items" 
ON public.order_items
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND orders.customer_id = auth.uid()
    )
);