#!/usr/bin/env node
'use strict';
const fs = require('fs');

function read(p){ return fs.readFileSync(p,'utf8'); }
function write(p,c){ fs.writeFileSync(p,c,'utf8'); }
function replaceOrFail(c,re,repl,label){
  const n=c.replace(re,repl);
  if(n===c) throw new Error('No se encontró el bloque esperado: '+label);
  return n;
}

let p='index.html';
let c=read(p);

for(const id of [
  'b23243PerformancePanel',
  'b23245-observability-panel',
  'b23246-maintenance-panel',
  'b23247-mobile-ux-panel',
  'b23248-qa-panel',
  'b23249-security-panel',
  'b23250-errors-panel'
]){
  c=c.replace(new RegExp(`<section\\s+id=["']${id}["'][\\s\\S]*?<\\/section>\\s*`,'i'),'');
}

for(const id of [
  'b23247-mobile-ux-css',
  'b23248-qa-css',
  'b23249-security-css',
  'b23250-errors-css'
]){
  c=c.replace(new RegExp(`<style\\s+id=["']${id}["'][\\s\\S]*?<\\/style>\\s*`,'i'),'');
}

for(const src of [
 'B232.43-rendimiento-ux.js?v=232.43',
 'B232.45-observabilidad-segura.js?v=232.45.3',
 'B232.46-mantenimiento-financiero.js?v=232.46.4',
 'B232.47-ux-movil.js?v=232.47.1',
 'B232.48.3-qa-runtime.js?v=232.48.3',
 'B232.49-security-audit.js?v=232.49.2',
 'B232.51.4-runtime-diagnostics.js?v=232.51.4'
]){
  const esc=src.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  c=c.replace(new RegExp(`<script\\s+src=["']${esc}["']><\\/script>\\s*`,'i'),'');
}

if(!c.includes('id="ccf-release-footer"')){
 const footer=`
<footer id="ccf-release-footer" aria-label="Versión del sistema">
  <span>CCF · Último paquete: <strong>B2.30.2 · Release de producción</strong></span>
</footer>
<style id="ccf-release-footer-style">
#ccf-release-footer{margin:24px 12px 16px;padding:10px 12px;text-align:center;border-top:1px solid #e5e7eb;color:#64748b;font:600 11px/1.4 system-ui,sans-serif}
#ccf-release-footer strong{color:#334155}
</style>
`;
 c=replaceOrFail(c,/<\/main>\s*<!-- =============================================================\s*CORE/i,
   `</main>${footer}\n<!-- =============================================================\n     CORE`,
   'punto de inserción del footer');
}
write(p,c);

// B231.0: eliminar indicador técnico flotante.
p='b231.0-adaptador-deudas-v2.js'; c=read(p);
c=c.replace(/\n\s*\/\* ------------------------------------------------------------\s*\n\s*INDICADOR VISUAL NO INTRUSIVO[\s\S]*?\n\s*console\.log\(\s*'\[B231\.0\] Adaptador Deudas V2 activo\.'\s*\);\s*/,"\n");
write(p,c);

// B232.65: eliminar footer técnico.
p='B232.65-menu-principal.js'; c=read(p);
let s=c.indexOf("function footer(){var f=$('b23260-footer')");
if(s>=0){let e=c.indexOf("function boot(){",s); if(e<0) throw new Error('B232.65: boot no encontrado'); c=c.slice(0,s)+c.slice(e); c=c.replace("function boot(){enforce();footer();","function boot(){enforce();");}
write(p,c);

// B232.66: eliminar footer técnico.
p='B232.66-ABONO-LIQUIDEZ.js'; c=read(p);
c=c.replace(/function footer\(\)\{[\s\S]*?\}\s*if\(document\.readyState==='loading'\)document\.addEventListener\('DOMContentLoaded',footer,\{once:true\}\);else footer\(\);/,"");
write(p,c);

// B232.67: eliminar footer técnico.
p='B232.67-MOVIMIENTOS-LIQUIDEZ.js'; c=read(p);
s=c.indexOf("function footer(){");
if(s>=0){let e=c.indexOf("footer();",s); if(e<0) throw new Error('B232.67: footer() no encontrado'); c=c.slice(0,s)+c.slice(e+"footer();".length);}
write(p,c);

// B232.69: eliminar footer técnico del portal/auth.
p='B232.69-AUTH.js'; c=read(p);
c=c.replace(/\n\s*const footer = document\.createElement\('div'\);[\s\S]*?document\.body\.appendChild\(footer\);\n/,"\n");
write(p,c);

// B232.74: eliminar badge técnico de sesión.
p='B232.74-AUTH-SESSION-PERSISTENCE.js'; c=read(p);
s=c.indexOf("  function ensureFooter()");
if(s>=0){let e=c.indexOf("  function exposeSessionApi()",s); if(e<0) throw new Error('B232.74: exposeSessionApi no encontrado'); c=c.slice(0,s)+c.slice(e);}
write(p,c);

// B232.73: eliminar badge técnico del puente Auth.
p='B232.73-AUTH-CORE-BRIDGE.js'; c=read(p);
c=c.replace(/\n\s*const footer = document\.getElementById\('b23269-footer'\);\n\s*if \(footer\) footer\.textContent = VERSION;\n[\s\S]*?\n\s*\}\n\s*\n\s*function getClient\(\)/,"\n  function getClient()");
write(p,c);

console.log('CCF B2.30.3 cleanup aplicado correctamente.');
