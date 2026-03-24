-- Fix RLS Select policy for coaches table
DROP POLICY IF EXISTS "Users can view own data" ON public.coaches;

CREATE POLICY "Users can view own data" ON public.coaches
  FOR SELECT TO authenticated
  USING (id = auth.uid());
