
CREATE TABLE public.tarot_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_name TEXT NOT NULL,
  card_name_cn TEXT NOT NULL,
  is_reversed BOOLEAN NOT NULL DEFAULT false,
  spread_type TEXT NOT NULL DEFAULT 'trinity',
  position_label TEXT,
  city_alias TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tarot_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert tarot history"
  ON public.tarot_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read tarot history"
  ON public.tarot_history FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_tarot_history_created_at ON public.tarot_history (created_at DESC);
CREATE INDEX idx_tarot_history_card_name ON public.tarot_history (card_name);

ALTER PUBLICATION supabase_realtime ADD TABLE public.tarot_history;
