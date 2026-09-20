(function(){
'use strict';
if(window.B23247MobileUX)return;
var VERSION='232.47.1';
function update(){
 var p=document.getElementById('b23247-mobile-ux-panel');
 if(!p)return;
 var w=window.innerWidth||0, m=w<=720;
 var s=document.getElementById('b23247-status');
 var d=document.getElementById('b23247-device');
 var x=document.getElementById('b23247-detail');
 if(s)s.textContent=m?'ACTIVO · MODO MÓVIL':'ACTIVO · MODO ESCRITORIO';
 if(d)d.textContent=w+' px · '+(m?'optimización táctil activa':'vista amplia');
 if(x)x.textContent=m?'Botones ≥44 px · campos ≥16 px · navegación horizontal · tablas desplazables.':'Mejoras móviles disponibles sin alterar la lógica financiera.';
 window.B23247MobileUX.lastReport={version:VERSION,viewportWidth:w,mobile:m,timestamp:new Date().toISOString()};
}
window.B23247MobileUX={version:VERSION,update:update,getLastReport:function(){return window.B23247MobileUX.lastReport||null;}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update,{once:true});else update();
window.addEventListener('resize',update,{passive:true});
})();