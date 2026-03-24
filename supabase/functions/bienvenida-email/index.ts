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
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Unauthenticated');

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        );

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
            authHeader.replace('Bearer ', '')
        );
        if (authError || !user) throw new Error('Unauthenticated');

        const { nombre } = await req.json();
        const resendApiKey = Deno.env.get('RESEND_API_KEY');

        if (!resendApiKey) {
            // No email service configured — skip silently
            return new Response(JSON.stringify({ skipped: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Bienvenido a Pista5</title></head>
<body style="background:#09090b;color:#fafafa;font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto;">
  <h1 style="color:#10b981;font-style:italic;text-transform:uppercase;font-size:32px;margin-bottom:8px;">PISTA5</h1>
  <h2 style="font-size:24px;margin-bottom:16px;">¡Bienvenido, ${nombre || 'entrenador'}!</h2>
  <p style="color:#a1a1aa;line-height:1.6;">Tu cuenta en Pista5 ya está activa. A partir de ahora puedes gestionar tus ejercicios, planificar temporadas y llevar el control de tus jugadores desde cualquier dispositivo.</p>
  <div style="margin:32px 0;padding:24px;background:#18181b;border-radius:12px;border:1px solid #27272a;">
    <p style="margin:0 0 8px;font-weight:bold;">¿Por dónde empezar?</p>
    <ol style="color:#a1a1aa;padding-left:20px;line-height:2;">
      <li>Crea tu primera <strong style="color:#fafafa;">Temporada</strong></li>
      <li>Añade ejercicios a tu <strong style="color:#fafafa;">Biblioteca</strong></li>
      <li>Organiza tus <strong style="color:#fafafa;">Jugadores</strong></li>
      <li>Planifica y diseña tus <strong style="color:#fafafa;">Sesiones</strong></li>
    </ol>
  </div>
  <a href="${Deno.env.get('APP_URL') ?? 'https://pista5.app'}/dashboard" style="display:inline-block;background:#10b981;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Ir a mi cuenta</a>
  <p style="color:#52525b;font-size:12px;margin-top:40px;">Si tienes alguna duda, escríbenos a <a href="mailto:pista5.app@outlook.com" style="color:#10b981;">pista5.app@outlook.com</a></p>
</body>
</html>`;

        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Pista5 <hola@pista5.app>',
                to: [user.email],
                subject: '¡Bienvenido a Pista5! 🎯',
                html: emailHtml,
            }),
        });

        return new Response(JSON.stringify({ sent: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        const isClientError = ['Unauthenticated'].includes(error.message);
        return new Response(
            JSON.stringify({ error: isClientError ? error.message : 'Internal server error' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: isClientError ? 401 : 500,
            }
        );
    }
});
