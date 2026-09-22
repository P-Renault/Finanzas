/* FINANZAS B232.67 — PROPIETARIO ÚNICO DE MOVIMIENTOS + LIQUIDEZ
   Corrige la ruta legacy de app.js que insertaba movimientos directamente.
   Este puente captura movForm antes de los handlers target y usa los RPC B2.21.
*/
(()=>{'use strict';
const VERSION='B232.67-RELEASE-MOVIMIENTOS-LIQUIDEZ';
if(window.__B23267_RELEASE__)return;
window.__B23267_RELEASE__=true;

const $=id=>document.getElementById(id);
const today=()=>{
 const d=new Date();
 return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
};

function db(){
 if(window.db)return window.db;
 if(window.__db)return window.__db;
 const u=localStorage.getItem('sf_url');
 const k=localStorage.getItem('sf_key');
 if(window.supabase&&u&&k){
   return window.supabase.createClient(u,k,{auth:{persistSession:false,autoRefreshToken:false}});
 }
 return null;
}

function setMsg(v){
 const el=$('movMsg');
 if(el)el.textContent=v;
}

function values(){
 const medium=$('b221Medium')?.value||'efectivo';
 const nature=$('b221Nature')?.value||(
   $('movTipo')?.value==='ingreso'?'ingreso':'gasto'
 );
 return {
   tipo:$('movTipo')?.value||'gasto',
   fecha:$('movFecha')?.value||today(),
   monto:Number($('movMonto')?.value)||0,
   categoria:$('movCategoria')?.value?.trim()||null,
   descripcion:$('movDescripcion')?.value?.trim()||null,
   medio_pago:medium,
   cuenta_id:medium==='cuenta_bancaria'?Number($('b221Account')?.value||0):null,
   naturaleza:nature
 };
}

async function save(e){
 /* Este listener se ejecuta en CAPTURE antes del handler legacy de app.js. */
 e.preventDefault();
 e.stopImmediatePropagation();

 const c=db();
 if(!c){setMsg('Conecta Supabase.');return;}

 const p=values();
 const id=Number($('movId')?.value||0);

 if(!p.monto||p.monto<=0){
   setMsg('Ingresa un monto válido.');
   return;
 }

 if(p.medio_pago==='cuenta_bancaria'&&!p.cuenta_id){
   setMsg('Selecciona la cuenta bancaria.');
   return;
 }

 setMsg(id?'Actualizando movimiento y liquidez…':'Registrando movimiento y actualizando liquidez…');

 let r;

 try{
   if(id){
     r=await c.rpc('actualizar_movimiento_liquidez_v1',{
       p_movimiento_id:id,
       p_tipo:p.tipo,
       p_fecha:p.fecha,
       p_monto:p.monto,
       p_categoria:p.categoria,
       p_descripcion:p.descripcion,
       p_medio_pago:p.medio_pago,
       p_cuenta_id:p.cuenta_id,
       p_naturaleza:p.naturaleza
     });
   }else{
     r=await c.rpc('registrar_movimiento_liquidez_v1',{
       p_tipo:p.tipo,
       p_fecha:p.fecha,
       p_monto:p.monto,
       p_categoria:p.categoria,
       p_descripcion:p.descripcion,
       p_medio_pago:p.medio_pago,
       p_cuenta_id:p.cuenta_id,
       p_naturaleza:p.naturaleza
     });
   }
 }catch(err){
   console.error('[B232.67]',err);
   setMsg('Error: '+(err?.message||String(err)));
   return;
 }

 if(r.error){
   console.error('[B232.67] RPC',r.error);
   setMsg('No se pudo aplicar: '+(r.error.message||r.error.code||'error Supabase'));
   return;
 }

 const applied=Boolean(r.data?.liquidez_aplicada);
 setMsg(
   id
   ? (applied?'Movimiento y liquidez actualizados.':'Movimiento actualizado; fecha futura sin impacto en liquidez.')
   : (applied?'Movimiento registrado y liquidez actualizada.':'Movimiento registrado; fecha futura sin impacto en liquidez.')
 );

 try{
   if(typeof window.resetMov==='function')window.resetMov();
   else{
     $('movForm')?.reset();
     if($('movId'))$('movId').value='';
     if($('movFecha'))$('movFecha').value=today();
   }
   if(typeof window.refresh==='function')await window.refresh();
 }catch(err){
   console.warn('[B232.67] refresh',err);
 }
}

function install(){
 const form=$('movForm');
 if(!form||form.dataset.b23267)return;
 form.dataset.b23267='1';
 form.addEventListener('submit',save,true);
}

function footer(){
 let f=$('b23267-footer');
 if(!f){
   f=document.createElement('footer');
   f.id='b23267-footer';
   f.style.cssText='margin:18px auto 8px;text-align:center;font-size:11px;color:#64748b;padding:8px;border-top:1px solid #e5e7eb;';
   document.body.appendChild(f);
 }
 f.textContent='Paquete desplegado: '+VERSION;
}

function boot(){
 install();
 footer();
 const obs=new MutationObserver(install);
 obs.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')
 document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,250),{once:true});
else setTimeout(boot,250);
})();