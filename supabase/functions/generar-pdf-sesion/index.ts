import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '').split(',').map(o => o.trim()).filter(Boolean);

function getCorsHeaders(requestOrigin: string | null) {
    const origin = requestOrigin && (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(requestOrigin))
        ? requestOrigin
        : ALLOWED_ORIGINS[0] ?? '';
    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Vary': 'Origin',
    };
}

serve(async (req) => {
    const corsHeaders = getCorsHeaders(req.headers.get('Origin'));
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Unauthenticated')

        // Validate user
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
        if (authError || !user) throw authError || new Error('Unauthenticated')

        const { sesion_id } = await req.json()
        if (!sesion_id) throw new Error('Missing sesion_id')

        // Fetch session data with hierarchy
        const { data: sesion, error: fetchError } = await supabaseClient
            .from('sesiones')
            .select(`
        *,
        microciclo:microciclos (
          nombre,
          mesociclo:mesociclos (
            nombre,
            macrociclo:macrociclos (
              nombre,
              temporada:temporadas (
                temporada,
                equipo
              )
            )
          )
        ),
        ejercicios:sesiones_ejercicios (
          orden,
          minutos,
          numero_jugadores,
          series,
          notas_sesion,
          ejercicio:ejercicios (*)
        ),
        coach:coaches (
          nombre,
          equipo
        )
      `)
            .eq('id', sesion_id)
            .single()

        if (fetchError || !sesion) throw fetchError || new Error('Session not found')

        // Check ownership
        if (sesion.coach_id !== user.id) throw new Error('Unauthorized access')

        const micro = sesion.microciclo;
        const meso = micro?.mesociclo;
        const macro = meso?.macrociclo;
        const temp = macro?.temporada;

        // Helper: escape HTML special chars
        const h = (v: any) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Derived values
        const fecha = new Date(sesion.fecha);
        const formattedDate = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' });
        const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
        const sortedEjercicios = [...sesion.ejercicios].sort((a: any, b: any) => a.orden - b.orden);
        const totalMinutos = sortedEjercicios.reduce((acc: number, se: any) => acc + (se.minutos || se.ejercicio?.duracion_minutos || 0), 0);
        const sessionLabel = micro?.nombre ? h(micro.nombre) : 'S1';

        const exerciseRows = sortedEjercicios.map((se: any, idx: number) => {
            const ex = se.ejercicio;
            const titulo = h(ex.titulo || '');
            const notas = se.notas_sesion ? ` - ${h(se.notas_sesion)}` : '';
            const descripcion = h(ex.descripcion || '');
            const minutos = se.minutos || ex.duracion_minutos || '';
            return `
            <tr>
                <td style="font-weight:bold; white-space:nowrap">${h(`E${se.orden || idx + 1}`)}</td>
                <td>${h(ex.trabajo || '')}</td>
                <td>${h(ex.tipo_tarea || '')}</td>
                <td>${h(ex.componente_juego || '')}</td>
                <td style="text-align:center">${h(ex.trabajo_fisico_integrado || '')}</td>
                <td style="text-align:center">${h(ex.sistema_juego || '')}</td>
                <td style="text-align:center">${h(ex.dificultad || '')}</td>
                <td style="text-align:center">${h(ex.etapa_sesion || '')}</td>
                <td style="text-align:center">${h(se.numero_jugadores || ex.n_jugadores || '')}</td>
            </tr>
            <tr>
                <td colspan="9" style="padding:8px 10px; border-top:none">
                    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px">
                        <strong style="font-size:10px">${titulo}${notas}</strong>
                        <span style="font-size:9px; white-space:nowrap; margin-left:12px">${minutos ? minutos + ' Minutos' : ''}</span>
                    </div>
                    <div style="font-size:9px; line-height:1.5; margin-bottom:6px">${descripcion}</div>
                    <div style="min-height:65px"></div>
                    <div style="border-top:1px solid #555; width:45%; margin-top:4px"></div>
                </td>
            </tr>`;
        }).join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sesión de Entrenamiento</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: Arial, Helvetica, sans-serif;
            background: white;
            color: #111;
            font-size: 10px;
        }
        @media screen { body { padding: 20px; max-width: 960px; margin: 0 auto; } }
        @media print {
            body { padding: 0; }
            @page { size: A4; margin: 12mm; }
        }

        /* HEADER TABLE */
        .hdr { width:100%; border-collapse:collapse; border:1px solid #333; }
        .hdr td { border:1px solid #333; padding:4px 8px; vertical-align:middle; }
        .logo-cell {
            text-align:center; padding:10px 14px; min-width:110px;
            font-size:0; line-height:1;
        }
        .logo-line1 { display:block; font-size:10px; font-weight:900; letter-spacing:1px; }
        .logo-dot   { display:block; font-size:20px; font-weight:900; letter-spacing:-1px; margin-top:2px; }
        .hdr-main-title { font-weight:bold; font-size:13px; letter-spacing:0.3px; }
        .session-num-cell {
            text-align:center; font-size:28px; font-weight:900;
            padding:6px 14px; white-space:nowrap;
        }
        .lbl { font-size:9px; color:#444; }

        /* SECTION TITLE */
        .sec-title { font-weight:bold; font-size:11px; margin:10px 0 0; padding-bottom:2px; }

        /* MAIN TABLE */
        .tbl { width:100%; border-collapse:collapse; table-layout:fixed; }
        .tbl th {
            border:1px solid #333; padding:4px 4px;
            font-size:9px; font-weight:bold; text-align:left; background:white;
        }
        .tbl td { border:1px solid #333; padding:3px 4px; font-size:9px; vertical-align:middle; }
        /* Remove top border from content rows so info+content look like one block */
        .tbl tr.content-row td { border-top:none; }

        /* PORTEROS */
        .porteros { background:#000; color:#fff; text-align:center; font-weight:bold; font-size:12px; padding:7px; margin-top:4px; }
    </style>
</head>
<body>

<!-- ===== HEADER ===== -->
<table class="hdr">
    <tr>
        <td rowspan="3" class="logo-cell">
            <span class="logo-line1">PISTA5</span>
            <span class="logo-dot">&#9679;</span>
        </td>
        <td class="hdr-main-title" style="width:200px">SESIÓN DE ENTRENAMIENTO</td>
        <td colspan="2">TEMPORADA &nbsp;<strong>${h(temp?.temporada || '--')}</strong></td>
        <td><span class="lbl">Hora</span> <strong>--</strong></td>
        <td rowspan="3" class="session-num-cell">${sessionLabel}</td>
    </tr>
    <tr>
        <td>${h(temp?.equipo || sesion.coach?.equipo || '--')}</td>
        <td><span class="lbl">Macrociclo</span></td>
        <td><strong>${h(macro?.nombre || '--')}</strong></td>
        <td><span class="lbl">Fecha</span> <strong>${h(formattedDate)}</strong></td>
    </tr>
    <tr>
        <td>${h(sesion.lugar || '--')}</td>
        <td><span class="lbl">Microciclo</span></td>
        <td><strong>${h(meso?.nombre || '--')}</strong></td>
        <td>
            <span class="lbl">Día</span> <strong>${h(diaSemana)}</strong>
            &nbsp;&nbsp;
            <span class="lbl">Minutos</span> <strong>${totalMinutos}'</strong>
        </td>
    </tr>
</table>

<!-- ===== CONTENIDOS ===== -->
<div class="sec-title">CONTENIDOS DE LA SESIÓN</div>

<!-- ===== EXERCISES TABLE ===== -->
<table class="tbl">
    <colgroup>
        <col style="width:42px">
        <col style="width:88px">
        <col style="width:108px">
        <col>
        <col style="width:68px">
        <col style="width:68px">
        <col style="width:44px">
        <col style="width:44px">
        <col style="width:36px">
    </colgroup>
    <thead>
        <tr>
            <th>Nº</th>
            <th>Trabajo</th>
            <th>Tipo de Trabajo</th>
            <th>Procedimiento Táctico</th>
            <th style="text-align:center">Físico Integrado</th>
            <th style="text-align:center">Sistema de Juego</th>
            <th style="text-align:center">Físico</th>
            <th style="text-align:center">Dif.</th>
            <th style="text-align:center">Jug.</th>
        </tr>
    </thead>
    <tbody>
        ${exerciseRows}
    </tbody>
</table>

${sesion.observaciones ? `
<div style="margin-top:12px; font-size:9px">
    <strong>Observaciones:</strong>
    <span style="white-space:pre-wrap"> ${h(sesion.observaciones)}</span>
</div>` : ''}

<!-- ===== PORTEROS ===== -->
<div class="porteros">EJERCICIOS PARA PORTEROS</div>

</body>
</html>
    `;

        return new Response(html, {
            headers: { ...corsHeaders, 'Content-Type': 'text/html' },
            status: 200,
        })

    } catch (error: any) {
        const isClientError = ['Unauthenticated', 'Unauthorized access', 'Missing sesion_id', 'Session not found'].includes(error.message);
        const status = isClientError ? (error.message === 'Unauthenticated' || error.message === 'Unauthorized access' ? 401 : 400) : 500;
        const message = isClientError ? error.message : 'Internal server error';
        return new Response(message, {
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
            status,
        })
    }
})
