-- Apply once in the Supabase SQL Editor for the project in js/cloud-config.js.
-- Saves are private to the authenticated Supabase user. Wallet identities must
-- first be verified by Supabase Auth using Sign-In with Ethereum (SIWE).

CREATE TABLE IF NOT EXISTS public.player_saves (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upgrade the earlier prototype schema without deleting existing save rows.
ALTER TABLE public.player_saves
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE public.player_saves
  SET created_at = COALESCE(updated_at, NOW())
  WHERE created_at IS NULL;
UPDATE public.player_saves SET revision = 1 WHERE revision IS NULL;
UPDATE public.player_saves
  SET updated_at = COALESCE(created_at, NOW())
  WHERE updated_at IS NULL;
ALTER TABLE public.player_saves ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE public.player_saves ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.player_saves ALTER COLUMN revision SET DEFAULT 1;
ALTER TABLE public.player_saves ALTER COLUMN revision SET NOT NULL;
ALTER TABLE public.player_saves ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE public.player_saves ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE public.player_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own save" ON public.player_saves;
DROP POLICY IF EXISTS "Users can upsert own save" ON public.player_saves;
DROP POLICY IF EXISTS "Wallet saves access" ON public.player_saves;
DROP POLICY IF EXISTS "Players read their own save" ON public.player_saves;
DROP POLICY IF EXISTS "Players insert their own save" ON public.player_saves;
DROP POLICY IF EXISTS "Players update their own save" ON public.player_saves;

CREATE POLICY "Players read their own save"
  ON public.player_saves FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

REVOKE ALL ON public.player_saves FROM anon, authenticated;
GRANT SELECT ON public.player_saves TO authenticated;

CREATE OR REPLACE FUNCTION public.save_player_save(
  p_payload JSONB,
  p_expected_revision INTEGER
)
RETURNS TABLE(payload JSONB, revision INTEGER, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;
  IF p_expected_revision IS NULL OR p_expected_revision < 0 THEN
    RAISE EXCEPTION 'Invalid save revision' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(p_payload) IS DISTINCT FROM 'object'
     OR p_payload->>'version' IS DISTINCT FROM '4'
     OR jsonb_typeof(p_payload->'player') IS DISTINCT FROM 'object'
     OR octet_length(p_payload::text) > 524288 THEN
    RAISE EXCEPTION 'Invalid save payload' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
    INSERT INTO public.player_saves AS saved (user_id, payload, revision, created_at, updated_at)
    VALUES (current_user_id, p_payload, 1, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE
      SET payload = EXCLUDED.payload,
          revision = saved.revision + 1,
          updated_at = NOW()
      WHERE saved.revision = p_expected_revision
    RETURNING saved.payload, saved.revision, saved.updated_at;
END;
$$;

REVOKE ALL ON FUNCTION public.save_player_save(JSONB, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_player_save(JSONB, INTEGER) TO authenticated;
