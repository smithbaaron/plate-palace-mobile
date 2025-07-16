-- Final fix for decrease_plate_quantity function with proper permissions
-- Drop and recreate the function with SECURITY DEFINER

DROP FUNCTION IF EXISTS decrease_plate_quantity(UUID, INTEGER);

CREATE OR REPLACE FUNCTION decrease_plate_quantity(plate_id UUID, quantity_to_decrease INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to bypass RLS policies
SET search_path = public
AS $$
DECLARE
    current_quantity INTEGER;
BEGIN
    -- Log the attempt for debugging
    RAISE NOTICE 'Attempting to decrease quantity for plate_id: %, amount: %', plate_id, quantity_to_decrease;
    
    -- Get current quantity with row locking (now runs with elevated privileges)
    SELECT quantity INTO current_quantity 
    FROM plates 
    WHERE id = plate_id 
    FOR UPDATE;
    
    -- Check if plate exists
    IF current_quantity IS NULL THEN
        RAISE EXCEPTION 'Plate not found with id: %', plate_id;
    END IF;
    
    -- Log current quantity
    RAISE NOTICE 'Current quantity for plate %: %', plate_id, current_quantity;
    
    -- Check if we have enough quantity
    IF current_quantity < quantity_to_decrease THEN
        RAISE EXCEPTION 'Insufficient quantity. Available: %, Requested: %', current_quantity, quantity_to_decrease;
    END IF;
    
    -- Update the quantity (now runs with elevated privileges)
    UPDATE plates 
    SET 
        quantity = quantity - quantity_to_decrease,
        updated_at = NOW()
    WHERE id = plate_id;
    
    -- Log success
    RAISE NOTICE 'Successfully decreased quantity for plate % from % to %', plate_id, current_quantity, (current_quantity - quantity_to_decrease);
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error in decrease_plate_quantity: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION decrease_plate_quantity(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION decrease_plate_quantity(UUID, INTEGER) TO anon;