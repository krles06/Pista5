-- ==============================================================================
-- FIX: CONVERT CATEGORICAL COLUMNS FROM BOOLEAN TO TEXT
-- This migration ensures that exercise library columns can store text values
-- like 'Fuerza', 'Táctico', etc. instead of restricting them to booleans.
-- ==============================================================================

-- 1. Create a helper function to safely convert columns
-- This function checks the type and only converts if it's boolean
CREATE OR REPLACE FUNCTION public.fix_exercise_column_type(tbl text, col text) RETURNS void AS $$
DECLARE
    current_type text;
BEGIN
    SELECT data_type INTO current_type 
    FROM information_schema.columns 
    WHERE table_name = tbl AND column_name = col AND table_schema = 'public';

    IF current_type = 'boolean' THEN
        -- Convert boolean to text. If it was true/false, we convert to 'Sí'/null or just null
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE text USING CASE WHEN %I THEN ''Sí'' ELSE NULL END', tbl, col, col);
    ELSIF current_type IS NULL THEN
        -- Add the column if it doesn't exist
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I text', tbl, col);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Apply fix to 'ejercicios' table
SELECT fix_exercise_column_type('ejercicios', 'tipo_tarea');
SELECT fix_exercise_column_type('ejercicios', 'tipo_trabajo');
SELECT fix_exercise_column_type('ejercicios', 'trabajo');
SELECT fix_exercise_column_type('ejercicios', 'componente_juego');
SELECT fix_exercise_column_type('ejercicios', 'sistema_juego');
SELECT fix_exercise_column_type('ejercicios', 'dificultad');
SELECT fix_exercise_column_type('ejercicios', 'trabajo_fisico_integrado');

-- 3. Apply fix to 'ejercicios_porteros' table (ensuring field names match form expectations)
-- Note: 'ejercicios_porteros' names in schema were tipo_tarea_pt, etc. 
-- If the frontend sends 'tipo_tarea', we should ensure the columns exist with those names.
SELECT fix_exercise_column_type('ejercicios_porteros', 'tipo_tarea');
SELECT fix_exercise_column_type('ejercicios_porteros', 'tipo_trabajo');
SELECT fix_exercise_column_type('ejercicios_porteros', 'trabajo');
SELECT fix_exercise_column_type('ejercicios_porteros', 'componente_juego');
SELECT fix_exercise_column_type('ejercicios_porteros', 'sistema_juego');
SELECT fix_exercise_column_type('ejercicios_porteros', 'dificultad');
SELECT fix_exercise_column_type('ejercicios_porteros', 'trabajo_fisico_integrado');

-- 4. Clean up helper function
DROP FUNCTION public.fix_exercise_column_type(text, text);

-- 5. Verification queries (optional, run these to check)
/*
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ejercicios' 
AND table_schema = 'public'
ORDER BY ordinal_position;
*/
