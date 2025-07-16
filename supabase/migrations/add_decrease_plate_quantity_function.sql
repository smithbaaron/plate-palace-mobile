-- Function to safely decrease plate quantity
CREATE OR REPLACE FUNCTION decrease_plate_quantity(plate_id UUID, quantity_to_decrease INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_quantity INTEGER;
BEGIN
    -- Get current quantity with row locking
    SELECT quantity INTO current_quantity 
    FROM plates 
    WHERE id = plate_id 
    FOR UPDATE;
    
    -- Check if plate exists
    IF current_quantity IS NULL THEN
        RAISE EXCEPTION 'Plate not found with id: %', plate_id;
    END IF;
    
    -- Check if we have enough quantity
    IF current_quantity < quantity_to_decrease THEN
        RAISE EXCEPTION 'Insufficient quantity. Available: %, Requested: %', current_quantity, quantity_to_decrease;
    END IF;
    
    -- Update the quantity
    UPDATE plates 
    SET 
        quantity = quantity - quantity_to_decrease,
        updated_at = NOW()
    WHERE id = plate_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION decrease_plate_quantity(UUID, INTEGER) TO authenticated;