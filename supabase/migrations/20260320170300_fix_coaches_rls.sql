-- Fix RLS Update policy for coaches table
DROP POLICY IF EXISTS "Users can update own data" ON public.coaches;

CREATE POLICY "Users can update own data" ON public.coaches
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
