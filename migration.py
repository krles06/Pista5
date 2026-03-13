import pandas as pd
import numpy as np
import os
from supabase import create_client, Client
import uuid
from datetime import datetime

# ==============================================================================
# CONFIGURACIÓN
# ==============================================================================
SUPABASE_URL = "TU_URL_DE_SUPABASE"
SUPABASE_KEY = "TU_SERVICE_ROLE_KEY"  # Usa la Service Role Key para ignorar RLS en la migración
COACH_ID = "TU_COACH_UUID"          # El UUID del coach en la tabla public.coaches
CSV_DIR = "./datos_access"           # Carpeta donde están los CSV exportados

# Mapeo de nombres de archivos CSV a tablas de Supabase
# Asegúrate de exportar tus tablas de Access con estos nombres exactos o actualiza el mapa.
TABLE_MAPPING = {
    'temporadas': 'TEMPORADAS.csv',
    'macrociclos': 'MACROCICLOS.csv',
    'mesociclos': 'MESOCICLOS.csv',
    'microciclos': 'MICROCICLOS.csv',
    'sesiones': 'SESIONES.csv',
    'ejercicios': 'EJERCICIOS.csv',
    'ejercicios_porteros': 'EJERCICIOS_PORTEROS.csv',
    'jugadores': 'JUGADORES.csv',
    'sesiones_ejercicios': 'SESIONES_EJERCICIOS.csv',
    'sesiones_porteros': 'SESIONES_PORTEROS.csv'
}

# Diccionario para guardar el mapeo entre IDs antiguos (Access) e IDs nuevos (UUID Supabase)
id_maps = {
    'temporadas': {},
    'macrociclos': {},
    'mesociclos': {},
    'microciclos': {},
    'sesiones': {},
    'ejercicios': {},
    'ejercicios_porteros': {},
    'jugadores': {}
}

# ==============================================================================
# CLIENTE SUPABASE
# ==============================================================================
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==============================================================================
# UTILIDADES
# ==============================================================================
def load_csv(table_name):
    filename = TABLE_MAPPING.get(table_name)
    if not filename: return None
    path = os.path.join(CSV_DIR, filename)
    if not os.path.exists(path):
        print(f"⚠️ Archivo no encontrado: {path}")
        return None
    return pd.read_csv(path)

def clean_data(df):
    # Convertir NaNs a None para Supabase
    df = df.replace({np.nan: None})
    return df

def migrate_table(table_name, target_table, column_map, fk_map=None):
    print(f"🚀 Migrando {table_name}...")
    df = load_csv(table_name)
    if df is None: return

    df = clean_data(df)
    
    rows_to_insert = []
    
    for _, row in df.iterrows():
        # Generar nuevo UUID
        new_id = str(uuid.uuid4())
        old_id = row.get('ID') or row.get('Id') # Ajusta según el nombre de la PK en Access
        
        # Guardar mapeo de IDs
        if old_id is not None:
            id_maps[table_name][old_id] = new_id
            
        data = {
            'id': new_id,
            'coach_id': COACH_ID
        }
        
        # Mapear columnas directas
        for acc_col, sb_col in column_map.items():
            val = row.get(acc_col)
            # Manejo de booleanos (Access usa -1 para True, 0 para False)
            if isinstance(val, (int, float)) and acc_col.startswith('Es'):
                val = True if val == -1 else False
            data[sb_col] = val

        # Resolver llaves foráneas
        if fk_map:
            for fk_col, (source_table, acc_fk_field) in fk_map.items():
                old_fk = row.get(acc_fk_field)
                data[fk_col] = id_maps[source_table].get(old_fk)

        rows_to_insert.append(data)

    # Insertar en bloques para evitar límites de payload
    batch_size = 50
    for i in range(0, len(rows_to_insert), batch_size):
        batch = rows_to_insert[i:i + batch_size]
        try:
            supabase.table(target_table).insert(batch).execute()
        except Exception as e:
            print(f"❌ Error en bloque {i}: {e}")

    print(f"✅ {len(rows_to_insert)} registros migrados a {target_table}.")

# ==============================================================================
# FLUJO DE MIGRACIÓN
# ==============================================================================

def run_migration():
    print("🎬 Iniciando migración masiva (Saltando imágenes)...")

    # 1. TEMPORADAS
    migrate_table(
        'temporadas', 
        'temporadas',
        {
            'Temporada': 'temporada',
            'Equipo': 'equipo',
            'Categoria': 'categoria',
            'F_Inicio': 'fecha_inicio',
            'F_Fin': 'fecha_fin',
            'Objetivos': 'objetivos',
            'Entrenador': 'entrenador'
        }
    )

    # 2. MACROCICLOS
    migrate_table(
        'macrociclos',
        'macrociclos',
        {
            'Nombre': 'nombre',
            'Tipo': 'tipo',
            'F_Inicio': 'fecha_inicio',
            'F_Fin': 'fecha_fin',
            'Objetivos': 'objetivos'
        },
        fk_map={'id_temporada': ('temporadas', 'Id_Temporada')}
    )

    # 3. MESOCICLOS
    migrate_table(
        'mesociclos',
        'mesociclos',
        {
            'Nombre': 'nombre',
            'Tipo': 'tipo',
            'F_Inicio': 'fecha_inicio',
            'F_Fin': 'fecha_fin',
            'Objetivos': 'objetivos'
        },
        fk_map={'id_macrociclo': ('macrociclos', 'Id_Macrociclo')}
    )

    # 4. MICROCICLOS
    migrate_table(
        'microciclos',
        'microciclos',
        {
            'Nombre': 'nombre',
            'Tipo': 'tipo',
            'F_Inicio': 'fecha_inicio',
            'F_Fin': 'fecha_fin',
            'Objetivos': 'objetivos'
        },
        fk_map={'id_mesociclo': ('mesociclos', 'Id_Mesociclo')}
    )

    # 5. EJERCICIOS (Sin Imágenes)
    migrate_table(
        'ejercicios',
        'ejercicios',
        {
            'Nombre': 'nombre',
            'Trabajo': 'trabajo',
            'Tipo_Trabajo': 'tipo_trabajo',
            'Tipo_Tarea': 'tipo_tarea',
            'Componente_Juego': 'componente_juego',
            'Sistema_Juego': 'sistema_juego',
            'Dificultad': 'dificultad',
            'Numero_Jugadores': 'numero_jugadores',
            'Minutos': 'minutos',
            'Descripcion': 'descripcion',
            'Variantes': 'variantes',
            'Fisico_Integrado': 'trabajo_fisico_integrado',
            'Puntuacion_Fisica': 'puntuacion_fisica',
            'Min_Puntuacion': 'minutos_por_puntuacion'
        }
    )

    # 6. SESIONES
    migrate_table(
        'sesiones',
        'sesiones',
        {
            'Fecha': 'fecha',
            'H_Inicio': 'hora_inicio',
            'H_Fin': 'hora_fin',
            'Objetivos': 'objetivos',
            'N_Sesion': 'numero_sesion',
            'Notas': 'notas'
        },
        fk_map={
            'id_temporada': ('temporadas', 'Id_Temporada'),
            'id_microciclo': ('microciclos', 'Id_Microciclo')
        }
    )

    # 7. JUGADORES (Sin Foto)
    migrate_table(
        'jugadores',
        'jugadores',
        {
            'Nombre': 'nombre',
            'Nombre_Completo': 'nombre_completo',
            'Posicion': 'posicion',
            'Pos_Alt': 'posicion_alternativa',
            'Fecha_Nac': 'fecha_nacimiento',
            'Telefono': 'telefono',
            'Poblacion': 'poblacion',
            'Email': 'email'
        },
        fk_map={'id_temporada': ('temporadas', 'Id_Temporada')}
    )

    # 8. MAPPING EJERCICIOS -> SESIONES
    print("🔗 Vinculando Ejercicios a Sesiones...")
    df_rel = load_csv('sesiones_ejercicios')
    if df_rel is not None:
        rel_inserts = []
        for _, row in df_rel.iterrows():
            rel_inserts.append({
                'id_sesion': id_maps['sesiones'].get(row.get('Id_Sesion')),
                'id_ejercicio': id_maps['ejercicios'].get(row.get('Id_Ejercicio')),
                'minutos': row.get('Minutos') or 0,
                'orden': row.get('Orden') or 0
            })
        
        # Limpiar nulos (por si algún ejercicio o sesión no existe)
        rel_inserts = [r for r in rel_inserts if r['id_sesion'] and r['id_ejercicio']]
        
        for i in range(0, len(rel_inserts), 50):
            supabase.table('ejercicios_sesion').insert(rel_inserts[i:i+50]).execute()
        print(f"✅ {len(rel_inserts)} vínculos de ejercicios creados.")

    print("\n🏁 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!")

if __name__ == "__main__":
    if SUPABASE_URL == "TU_URL_DE_SUPABASE":
        print("❌ ERROR: Configura las variables al inicio del script.")
    else:
        run_migration()
