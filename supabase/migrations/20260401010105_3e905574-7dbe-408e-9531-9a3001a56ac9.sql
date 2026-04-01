ALTER TABLE public.tarot_history 
ADD COLUMN IF NOT EXISTS reading_id uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS is_manual_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS click_donate boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS question text;