-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER (Improved)
-- ==============================================================================

-- 1. Create/Update the function
CREATE OR REPLACE FUNCTION public.handle_new_coach()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.coaches (id, nombre, email, equipo)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre', 'Nuevo Entrenador'),
    COALESCE(new.email, 'sin-email@pista5.com'),
    new.raw_user_meta_data->>'equipo'
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    email = EXCLUDED.email,
    equipo = EXCLUDED.equipo;
  RETURN new;
END;
$$;

-- 2. Ensure the trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_coach();

-- 3. Verify RLS for selection is correct
DROP POLICY IF EXISTS "Users can view own data" ON public.coaches;
CREATE POLICY "Users can view own data" ON public.coaches FOR SELECT TO authenticated USING (id = auth.uid());
