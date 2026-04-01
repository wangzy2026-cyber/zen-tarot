
ALTER TABLE public.tarot_history ADD COLUMN IF NOT EXISTS user_id text;
ALTER TABLE public.tarot_history ADD COLUMN IF NOT EXISTS reading_text text;
CREATE INDEX IF NOT EXISTS idx_tarot_history_user_id ON public.tarot_history (user_id);
CREATE INDEX IF NOT EXISTS idx_tarot_history_reading_id ON public.tarot_history (reading_id);
