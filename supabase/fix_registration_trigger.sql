-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================

-- 1. Create the function that will handle the insertion
CREATE OR REPLACE FUNCTION public.handle_new_coach()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.coaches (id, nombre, email, equipo)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre', 'Nuevo Entrenador'),
    new.email,
    new.raw_user_meta_data->>'equipo'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on the auth.users table
-- We drop it first if it exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_coach();

-- 3. Update the RLS to be even more permissive for the creation phase
-- though the trigger handles most cases, we keep these for manual updates
DROP POLICY IF EXISTS "Enable insert for authenticated users with their own uid" ON public.coaches;
CREATE POLICY "Enable insert for authenticated users with their own uid" ON public.coaches FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
