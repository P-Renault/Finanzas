let db=null;
const $=id=>document.getElementById(id);
const CLP=n=>new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP",maximumFractionDigits:0}).format(Number(n)||0);
const today=()=>new Date().toISOString().slice(0,10);
$("movFecha").value=today(); $("futureFecha").value=today(); $("savingFecha").value=today();

function setMsg(id,msg){$(id).textContent=msg}
function configLoad(){ $("supabaseUrl").value=localStorage.getItem("sf_url")||""; $("supabaseKey").value=localStorage.getItem("sf_key")||""; }
async function connect(){
  const url=$("supabaseUrl").value.trim(), key=$("supabaseKey").value.trim();
  if(!url||!key) return setMsg("configMsg","Completa ambos campos.");
  try{
    db=window.supabase.createClient(url,key);
    const {error}=await db.from("movimientos").select("id").limit(1);
    if(error) throw error;
    localStorage.setItem("sf_url",url); localStorage.setItem("sf_key",key);
    $("configPanel").classList.add("hidden"); $("app").classList.remove("hidden"); $("logoutBtn").classList.remove("hidden");
    await refresh();
  }catch(e){setMsg("configMsg","No se pudo conectar. Revisa la URL, la clave y que hayas ejecutado el SQL.");}
}
$("saveConfig").onclick=connect;
$("logoutBtn").onclick=()=>{localStorage.removeItem("sf_url");localStorage.removeItem("sf_key");location.reload()};

document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active")); b.classList.add("active");
  document.querySelectorAll(".tab").forEach(x=>x.classList.add("hidden")); $(b.dataset.tab).classList.remove("hidden");
});

$("movForm").onsubmit=async e=>{
 e.preventDefault(); setMsg("movMsg","Guardando...");
 const {error}=await db.from("movimientos").insert({tipo:$("movTipo").value,fecha:$("movFecha").value,monto:Number($("movMonto").value),categoria:$("movCategoria").value,descripcion:$("movDescripcion").value});
 setMsg("movMsg",error?error.message:"Movimiento guardado."); if(!error){e.target.reset();$("movFecha").value=today();await refresh();}
};

$("futureForm").onsubmit=async e=>{
 e.preventDefault(); setMsg("futureMsg","Guardando...");
 const {error}=await db.from("compromisos").insert({concepto:$("futureConcepto").value,fecha_vencimiento:$("futureFecha").value,monto:Number($("futureMonto").value),categoria:$("futureCategoria").value,periodicidad:$("futureRecurrence").value,notas:$("futureNotas").value,estado:"pendiente"});
 setMsg("futureMsg",error?error.message:"Compromiso creado."); if(!error){e.target.reset();$("futureFecha").value=today();await refresh();}
};

$("savingForm").onsubmit=async e=>{
 e.preventDefault(); setMsg("savingMsg","Guardando...");
 const {error}=await db.from("ahorro").insert({tipo:$("savingTipo").value,fecha:$("savingFecha").value,monto:Number($("savingMonto").value),descripcion:$("savingDescripcion").value});
 setMsg("savingMsg",error?error.message:"Movimiento de ahorro guardado."); if(!error){e.target.reset();$("savingFecha").value=today();await refresh();}
};

async function refresh(){
 const [{data:mov,error:merr},{data:future,error:ferr},{data:sav,error:serr}]=await Promise.all([
  db.from("movimientos").select("*").order("fecha",{ascending:false}).order("created_at",{ascending:false}),
  db.from("compromisos").select("*").order("fecha_vencimiento",{ascending:true}),
  db.from("ahorro").select("*").order("fecha",{ascending:false})
 ]);
 if(merr||ferr||serr){console.error(merr||ferr||serr);return}
 renderMov(mov||[]); renderFuture(future||[]); renderSaving(sav||[]); renderDashboard(mov||[],future||[],sav||[]);
}
function renderMov(rows){$("movimientosLista").innerHTML=rows.length?rows.map(r=>`<div class="row"><div><b>${r.tipo==="ingreso"?"Ingreso":"Gasto"} · ${r.categoria||"Sin categoría"}</b><div>${r.descripcion||""}<br><small>${r.fecha}</small></div></div><strong>${r.tipo==="gasto"?"-":"+"}${CLP(r.monto)}</strong></div>`).join(""):"<p class='muted'>Sin movimientos.</p>"}
function renderFuture(rows){
 const t=today(); $("futurosLista").innerHTML=rows.length?rows.map(r=>{
  const overdue=r.estado==="pendiente"&&r.fecha_vencimiento<t;
  return `<div class="row"><div><b>${r.concepto}</b><div>${r.categoria||""} · ${r.periodicidad}</div><small>${r.fecha_vencimiento} ${overdue?"· VENCIDO":""}</small></div><div><strong>${CLP(r.monto)}</strong><br><button onclick="markPaid('${r.id}')" class="${r.estado==='pagado'?'paid':''}">${r.estado==="pagado"?"Pagado":"Marcar pagado"}</button></div></div>`
 }).join(""):"<p class='muted'>No hay compromisos.</p>"
}
async function markPaid(id){const {error}=await db.from("compromisos").update({estado:"pagado"}).eq("id",id);if(!error)refresh();}
function renderSaving(rows){let total=rows.reduce((s,r)=>s+(r.tipo==="aporte"?Number(r.monto):-Number(r.monto)),0);$("savingBalance").textContent=CLP(total)}
function renderDashboard(mov,fut,sav){
 const d=new Date(), y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), prefix=`${y}-${m}`;
 const inc=mov.filter(r=>r.tipo==="ingreso"&&r.fecha.startsWith(prefix)).reduce((s,r)=>s+Number(r.monto),0);
 const exp=mov.filter(r=>r.tipo==="gasto"&&r.fecha.startsWith(prefix)).reduce((s,r)=>s+Number(r.monto),0);
 const allInc=mov.filter(r=>r.tipo==="ingreso").reduce((s,r)=>s+Number(r.monto),0);
 const allExp=mov.filter(r=>r.tipo==="gasto").reduce((s,r)=>s+Number(r.monto),0);
 const committed=fut.filter(r=>r.estado==="pendiente").reduce((s,r)=>s+Number(r.monto),0);
 const ahorro=sav.reduce((s,r)=>s+(r.tipo==="aporte"?Number(r.monto):-Number(r.monto)),0);
 $("saldo").textContent=CLP(allInc-allExp); $("ingresosMes").textContent=CLP(inc); $("gastosMes").textContent=CLP(exp);
 $("comprometido").textContent=CLP(committed); $("proyectado").textContent=CLP(allInc-allExp-committed); $("ahorroTotal").textContent=CLP(ahorro);
 const pending=fut.filter(r=>r.estado==="pendiente").slice(0,8);
 $("proximosPagos").innerHTML=pending.length?pending.map(r=>`<div class="row"><span>${r.concepto}<br><small>${r.fecha_vencimiento}</small></span><strong>${CLP(r.monto)}</strong></div>`).join(""):"<p class='muted'>No tienes pagos pendientes.</p>";
}
configLoad();
if(localStorage.getItem("sf_url")&&localStorage.getItem("sf_key")) connect();
