import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sesión - ${sesion.objetivos || 'Fútbol Sala'}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; background-color: #09090b; color: #fafafa; margin: 0; padding: 40px; }
        .container { max-width: 1000px; margin: 0 auto; background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: 900; color: #10b981; font-style: italic; }
        .title { font-size: 32px; font-weight: 800; margin-top: 10px; }
        .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
        .info-item { display: flex; flex-direction: column; }
        .info-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #71717a; letter-spacing: 0.05em; }
        .info-value { font-size: 14px; font-weight: 600; }
        .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #10b981; margin: 30px 0 10px 0; border-bottom: 1px solid #27272a; padding-bottom: 5px; }
        .general-data { display: grid; grid-template-columns: 2fr 1fr; gap: 40px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
        th { text-align: left; padding: 12px 8px; background: #27272a; color: #fafafa; border: 1px solid #3f3f46; font-weight: 700; text-transform: uppercase; font-size: 9px; }
        td { padding: 10px 8px; border: 1px solid #27272a; border-bottom: 1px solid #3f3f46; }
        .badge { background: #14532d; color: #4ade80; padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 9px; }
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #71717a; }
        @media print {
            body { background: white; color: black; padding: 0; }
            .container { border: none; padding: 20px; border-radius: 0; background: white; }
            th { background: #f4f4f5; color: black; border: 1px solid #e4e4e7; }
            td { border: 1px solid #e4e4e7; }
            .logo, .title, .section-title { color: #059669; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <div class="logo">PISTA5</div>
                <div class="title">${sesion.objetivos || 'Plan de Entrenamiento'}</div>
            </div>
            <div style="text-align: right">
                <div style="font-weight: 800; font-size: 18px;">${new Date(sesion.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <div style="color: #71717a">${sesion.lugar || ''}</div>
            </div>
        </div>

        <div class="info-grid">
            <div class="info-item"><span class="info-label">Temporada</span><span class="info-value">${temp?.temporada || '--'}</span></div>
            <div class="info-item"><span class="info-label">Macrociclo</span><span class="info-value">${macro?.nombre || '--'}</span></div>
            <div class="info-item"><span class="info-label">Mesociclo</span><span class="info-value">${meso?.nombre || '--'}</span></div>
            <div class="info-item"><span class="info-label">Microciclo</span><span class="info-value">${micro?.nombre || '--'}</span></div>
        </div>

        <div class="general-data">
            <div>
                <div class="section-title">Objetivos y Contenidos</div>
                <div style="font-size: 14px; line-height: 1.6">${sesion.feedback_tactico || sesion.objetivos || 'Sin descripción detallada.'}</div>
            </div>
            <div style="background: #09090b; padding: 20px; border-radius: 8px; border: 1px solid #27272a;">
                <div class="info-item" style="margin-bottom: 20px;"><span class="info-label">Equipo / Pista</span><span class="info-value" style="color: #10b981">${temp?.equipo || sesion.coach?.equipo || '--'}</span></div>
                <div class="info-item" style="margin-bottom: 20px;"><span class="info-label">Material</span><span class="info-value">${sesion.material || 'Estándar'}</span></div>
                <div class="info-item"><span class="info-label">Entrenador</span><span class="info-value">${sesion.coach?.nombre || '--'}</span></div>
            </div>
        </div>

        <div class="section-title">Ejercicios de la Sesión</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 20px">Nº</th>
                    <th style="width: 180px">Ejercicio</th>
                    <th>Trabajo</th>
                    <th>Tipo</th>
                    <th>Compo.</th>
                    <th>Físico</th>
                    <th>Sist.</th>
                    <th style="width: 25px">Dif.</th>
                    <th style="width: 25px">Min.</th>
                    <th style="width: 25px">Jug.</th>
                </tr>
            </thead>
            <tbody>
                ${sesion.ejercicios.sort((a: any, b: any) => a.orden - b.orden).map((se: any, idx: number) => `
                    <tr>
                        <td style="font-weight: 800">${se.orden || (idx + 1)}</td>
                        <td>
                            <div style="font-weight: 700; color: #10b981">${se.ejercicio.titulo}</div>
                            ${se.notas_sesion ? `<div style="font-size: 9px; color: #71717a; margin-top: 4px; font-style: italic">${se.notas_sesion}</div>` : ''}
                        </td>
                        <td>${se.ejercicio.trabajo || '--'}</td>
                        <td><span class="badge">${se.ejercicio.tipo_tarea || '--'}</span></td>
                        <td>${se.ejercicio.componente_juego || '--'}</td>
                        <td>${se.ejercicio.trabajo_fisico_integrado || '--'}</td>
                        <td>${se.ejercicio.sistema_juego || '--'}</td>
                        <td style="text-align: center">${se.ejercicio.dificultad || '--'}</td>
                        <td style="text-align: center; font-weight: 800">${se.minutos || se.ejercicio.duracion_minutos || '--'}</td>
                        <td style="text-align: center">${se.numero_jugadores || se.ejercicio.n_jugadores || '--'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        ${sesion.observaciones ? `
            <div class="section-title">Anotaciones Adicionales</div>
            <div style="font-size: 12px; color: #a1a1aa; white-space: pre-wrap;">${sesion.observaciones}</div>
        ` : ''}

        <div class="footer">
            Generado automáticamente por Pista5 • El asistente del entrenador de fútbol sala
        </div>
    </div>
</body>
</html>
    `;

        return new Response(html, {
            headers: { ...corsHeaders, 'Content-Type': 'text/html' },
            status: 200,
        })

    } catch (error: any) {
        console.error(error);
        return new Response(error.message, {
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
            status: 400,
        })
    }
})
