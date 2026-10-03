CCF · SEO PRODUCCIÓN 1.0

Base objetivo:
Backup-2.9-adaptación-móvil

Archivos:
1. robots.txt -> raíz del repositorio.
2. sitemap.xml -> raíz del repositorio.
3. SEO-HEAD-BLOCK.html -> bloque que debe quedar dentro de <head> de index.html.

En index.html:
- Reemplazar los metadatos/título SEO antiguos por SEO-HEAD-BLOCK.html.
- Mantener intactos todos los scripts, estilos, autenticación, calendario y módulos.
- No cargar este bloque como archivo externo: debe quedar dentro del <head>.

No se modifica Supabase ni la lógica de la aplicación.

Después de publicar:
https://controlfinanciero.cl/
https://controlfinanciero.cl/robots.txt
https://controlfinanciero.cl/sitemap.xml

Siguiente etapa:
Google Search Console -> añadir propiedad de dominio controlfinanciero.cl -> enviar sitemap.xml.
