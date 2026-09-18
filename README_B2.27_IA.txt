FINANZAS B2.27 — IA FINANCIERA

Objetivo
--------
Agregar una capa de inteligencia financiera sobre Supabase sin exponer la
clave de OpenAI en el navegador.

Arquitectura
------------
PWA GitHub Pages
   -> Supabase Edge Function `ia-financiera`
      -> OpenAI Responses API
   -> respuesta a la PWA

B2.27 NO ejecuta pagos ni modifica movimientos.

Integración frontend
--------------------
Agregar al index.html, después de los motores existentes:

<script src="b227-ia-financiera.js?v=227.0"></script>

Despliegue de Edge Function
---------------------------
1. Crear:
   supabase/functions/ia-financiera/index.ts

2. Copiar el index.ts de este paquete.

3. Configurar el secreto en Supabase:
   OPENAI_API_KEY

4. Desplegar:
   supabase functions deploy ia-financiera

5. Verificar desde la pestaña "IA Financiera".

Seguridad
---------
NO colocar OPENAI_API_KEY en index.html, app.js, localStorage ni ningún
archivo servido por GitHub Pages. La API key debe permanecer como secreto
del entorno servidor/Edge Function.

Fuente oficial OpenAI:
https://platform.openai.com/docs/quickstart/make-your-first-api-request

Estado
------
Este paquete prepara B2.27. La publicación automática en GitHub está
bloqueada actualmente por un 403 de la integración GitHub.
