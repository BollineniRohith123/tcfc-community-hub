-- Add is_free column to events table
ALTER TABLE public.events 
ADD COLUMN is_free boolean NOT NULL DEFAULT false;

-- Add children_ages column to event_bookings table to track ages of children
ALTER TABLE public.event_bookings 
ADD COLUMN children_ages integer[] DEFAULT ARRAY[]::integer[];

-- Add comment for clarity
COMMENT ON COLUMN public.events.is_free IS 'If true, the event is free and does not require payment';
COMMENT ON COLUMN public.event_bookings.children_ages IS 'Array of ages for each child in the booking';