/* =========================================================
   CCF PERFIL USUARIO · B1.1 · PERSISTENCIA COMPLETA
   ---------------------------------------------------------
   - Nombre, apellido, dirección, teléfono y ocupación.
   - Foto persistente en Storage bucket "avatars".
   - URL persistente en profiles.avatar_url.
   - La foto permanece hasta que el usuario la cambia.
   - No elimina la foto anterior antes de confirmar la nueva.
   ========================================================= */
(() => {
  "use strict";
  if (window.__CCF_PERFIL_USUARIO_B11__) return;
  window.__CCF_PERFIL_USUARIO_B11__ = true;

  let client = null;
  let currentUser = null;
  let originalAvatarUrl = "";

  const getClient = () =>
    window.supabaseClient ||
    window.__B23273_CLIENT__ ||
    window.__B23270_CLIENT__ ||
    window.__B23269_CLIENT__ ||
    window.db ||
    null;

  const esc = v => String(v ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

  const initials = (a,b) =>
    ((String(a||"").trim().charAt(0) + String(b||"").trim().charAt(0)) || "US").toUpperCase();

  function phoneDigits(v) {
    let d = String(v||"").replace(/\D/g,"");
    if (d.startsWith("00569")) d = d.slice(5);
    else if (d.startsWith("569")) d = d.slice(3);
    else if (d.startsWith("56") && d.length >= 10) d = d.slice(2);
    else if (d.startsWith("9") && d.length === 9) d = d.slice(1);
    return d.slice(-8);
  }

  function setStatus(message, type="") {
    const el = document.getElementById("ccf-profile-status");
    if (!el) return;
    el.textContent = message || "";
    el.className = type ? `ccf-${type}` : "";
  }

  function avatar(url, nombre, apellido) {
    const text = initials(nombre, apellido);
    const big = document.getElementById("ccf-profile-avatar");
    const mini = document.getElementById("ccf-profile-mini-avatar");
    if (big) big.innerHTML = url ? `<img src="${esc(url)}" alt="Foto de perfil">` : text;
    if (mini) mini.innerHTML = url ? `<img src="${esc(url)}" alt="Foto de perfil">` : text;
  }

  function injectStyles() {
    if (document.getElementById("ccf-profile-styles")) return;
    const s = document.createElement("style");
    s.id = "ccf-profile-styles";
    s.textContent = `
      #ccf-profile-button{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(127,127,127,.28);background:transparent;color:inherit;cursor:pointer;border-radius:10px;padding:7px 11px;font:inherit}
      .ccf-profile-mini-avatar{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#e5e7eb;color:#374151;font-weight:700;font-size:12px;overflow:hidden}
      .ccf-profile-mini-avatar img,.ccf-profile-avatar img{width:100%;height:100%;object-fit:cover}
      #ccf-profile-overlay{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(8,20,38,.62);backdrop-filter:blur(2px)}
      #ccf-profile-overlay.ccf-open{display:flex}
      #ccf-profile-card{width:min(620px,100%);max-height:min(760px,92vh);overflow:auto;background:#fff;color:#172033;border-radius:20px;box-shadow:0 24px 70px rgba(7,20,40,.30);padding:22px;border:1px solid #e5eaf1}
      .ccf-profile-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:14px;padding-bottom:13px;border-bottom:1px solid #edf1f5}
      .ccf-profile-head h2{margin:0 0 4px;font-size:22px;line-height:1.15;color:#0b1f38;letter-spacing:-.2px}
      .ccf-profile-head p{margin:0;color:#68778a;font-size:13px}
      .ccf-profile-close{border:1px solid #edf0f4;background:#f5f7fa;color:#6b7787;border-radius:10px;width:36px;height:36px;cursor:pointer;font-size:20px}
      .ccf-profile-avatar-wrap{display:flex;align-items:center;gap:14px;margin:2px 0 15px;padding:10px 11px;border-radius:14px;background:#f7f9fc;border:1px solid #edf1f5}
      .ccf-profile-avatar{width:68px;height:68px;border-radius:50%;display:grid;place-items:center;background:#e7ebf1;color:#26364d;font-size:21px;font-weight:700;overflow:hidden;flex:none;border:3px solid #fff;box-shadow:0 2px 8px rgba(15,31,52,.10)}
      .ccf-profile-upload label{display:inline-block;cursor:pointer;border:1px solid #cfd7e2;background:#fff;color:#1b2b41;border-radius:9px;padding:8px 12px;font-size:13px;font-weight:600}
      .ccf-profile-upload input{display:none}.ccf-profile-upload small{display:block;color:#738196;margin-top:5px;font-size:12px}
      .ccf-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ccf-profile-field{display:flex;flex-direction:column;gap:5px}.ccf-profile-field.full{grid-column:1/-1}
      .ccf-profile-field label{font-size:12px;font-weight:700;color:#42536a;letter-spacing:.1px}.ccf-profile-field input{width:100%;box-sizing:border-box;border:1px solid #d7dee8;border-radius:9px;padding:9px 11px;font:inherit;background:#fbfcfe;color:#172033;min-height:40px;outline:none;transition:border-color .15s,box-shadow .15s}
      .ccf-profile-field input:focus{border-color:#173b68;box-shadow:0 0 0 3px rgba(23,59,104,.08);background:#fff}
      .ccf-phone-group{display:grid;grid-template-columns:92px 1fr;gap:8px}.ccf-phone-prefix{display:flex;align-items:center;justify-content:center;border:1px solid #d7dee8;border-radius:9px;background:#f3f5f8;color:#34455b;font-weight:700;min-height:40px}
      .ccf-profile-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;padding-top:11px;border-top:1px solid #edf1f5}
      .ccf-profile-actions button{border:0;border-radius:9px;padding:10px 14px;min-height:42px;cursor:pointer;font:inherit;font-weight:700}
      #ccf-profile-cancel{background:#f2f4f7;color:#425166}#ccf-profile-save{background:#0b1f38;color:#fff;box-shadow:0 2px 5px rgba(11,31,56,.16)}#ccf-profile-save:disabled{opacity:.55;cursor:wait}
      #ccf-profile-status{min-height:18px;margin-top:7px;font-size:12px;line-height:1.35;color:#6b7787}#ccf-profile-status.ccf-error{color:#991b1b}#ccf-profile-status.ccf-success{color:#166534}
      #ccf-profile-card form{margin:0}
      #ccf-profile-card #ccf-profile-mobile-logout{grid-column:1/-1}
      @media(max-width:720px){
        #ccf-profile-button .ccf-profile-button-label{display:none}
        #ccf-profile-overlay{padding:0;align-items:flex-end}
        #ccf-profile-card{width:100%;height:auto;max-height:64dvh;min-height:0;border-radius:22px 22px 0 0;padding:14px 16px 10px;box-shadow:0 -14px 40px rgba(7,20,40,.24)}
        .ccf-profile-head{margin-bottom:8px;padding-bottom:8px}.ccf-profile-head h2{font-size:20px}.ccf-profile-head p{font-size:12px}
        .ccf-profile-close{width:34px;height:34px}
        .ccf-profile-avatar-wrap{gap:12px;margin:0 0 9px;padding:7px 9px}.ccf-profile-avatar{width:56px;height:56px;font-size:18px}
        .ccf-profile-upload label{padding:7px 11px}.ccf-profile-upload small{margin-top:3px;font-size:11px}
        .ccf-profile-grid{grid-template-columns:1fr;gap:7px}.ccf-profile-field.full{grid-column:auto}.ccf-profile-field{gap:3px}.ccf-profile-field label{font-size:11px}
        .ccf-profile-field input{min-height:36px;padding:7px 10px;font-size:15px}.ccf-phone-group{grid-template-columns:86px 1fr;gap:7px}.ccf-phone-prefix{min-height:36px}
        .ccf-profile-actions{position:sticky;bottom:0;grid-template-columns:1fr 1fr;gap:7px;margin:9px -16px 0;padding:8px 16px calc(8px + env(safe-area-inset-bottom));background:rgba(255,255,255,.98);z-index:2}
        .ccf-profile-actions button{min-height:40px;padding:8px 10px;font-size:14px}
        #ccf-profile-card #ccf-profile-mobile-logout{min-height:40px}
      }
    `;
    document.head.appendChild(s);
  }

  function buildModal() {
    if (document.getElementById("ccf-profile-overlay")) return;
    const o = document.createElement("div");
    o.id = "ccf-profile-overlay";
    o.innerHTML = `
      <div id="ccf-profile-card" role="dialog" aria-modal="true">
        <div class="ccf-profile-head">
          <div><h2>Mi perfil</h2><p>Actualiza tus datos personales.</p></div>
          <button type="button" class="ccf-profile-close" id="ccf-profile-close">×</button>
        </div>
        <div class="ccf-profile-avatar-wrap">
          <div class="ccf-profile-avatar" id="ccf-profile-avatar">US</div>
          <div class="ccf-profile-upload">
            <label for="ccf-profile-file">Cambiar foto</label>
            <input id="ccf-profile-file" type="file" accept="image/jpeg,image/png,image/webp">
            <small>JPG, PNG o WebP · máximo 3 MB</small>
          </div>
        </div>
        <form id="ccf-profile-form">
          <div class="ccf-profile-grid">
            <div class="ccf-profile-field"><label>Nombre *</label><input id="ccf-profile-nombre" maxlength="100" required></div>
            <div class="ccf-profile-field"><label>Apellido *</label><input id="ccf-profile-apellido" maxlength="100" required></div>
            <div class="ccf-profile-field full"><label>Dirección</label><input id="ccf-profile-direccion" maxlength="255"></div>
            <div class="ccf-profile-field full"><label>Teléfono</label><div class="ccf-phone-group"><div class="ccf-phone-prefix">+56 9</div><input id="ccf-profile-telefono-numero" inputmode="numeric" maxlength="8" placeholder="12345678"></div></div>
            <div class="ccf-profile-field full"><label>Ocupación</label><input id="ccf-profile-ocupacion" maxlength="150"></div>
          </div>
          <div id="ccf-profile-status"></div>
          <div class="ccf-profile-actions"><button type="button" id="ccf-profile-cancel">Cancelar</button><button type="submit" id="ccf-profile-save">Guardar cambios</button></div>
        </form>
      </div>`;
    document.body.appendChild(o);
    document.getElementById("ccf-profile-close").onclick=closeModal;
    document.getElementById("ccf-profile-cancel").onclick=closeModal;
    o.addEventListener("click",e=>{if(e.target===o)closeModal()});
    document.getElementById("ccf-profile-file").addEventListener("change",previewImage);
    document.getElementById("ccf-profile-telefono-numero").addEventListener("input",e=>e.target.value=String(e.target.value||"").replace(/\D/g,"").slice(0,8));
    document.getElementById("ccf-profile-form").addEventListener("submit",saveProfile);
  }

  function addButton() {
    if (document.getElementById("ccf-profile-button")) return;
    const topbar=document.querySelector(".topbar"); if(!topbar)return;
    const b=document.createElement("button");b.type="button";b.id="ccf-profile-button";
    b.innerHTML=`<span class="ccf-profile-mini-avatar" id="ccf-profile-mini-avatar">US</span><span class="ccf-profile-button-label">Mi perfil</span>`;
    b.onclick=openModal;
    const logout=document.getElementById("logoutBtn");
    if(logout&&logout.parentNode===topbar)topbar.insertBefore(b,logout);else topbar.appendChild(b);
  }

  async function getUser() {
    client=getClient();
    if(!client?.auth?.getUser) return null;
    const r=await client.auth.getUser();
    if(r.error) return null;
    currentUser=r.data.user||null;
    return currentUser;
  }

  async function loadProfile() {
    const user=await getUser();
    if(!user){setStatus("La sesión no está disponible.","error");return;}
    const {data,error}=await client.from("profiles")
      .select("id,nombre,apellido,direccion,telefono,ocupacion,avatar_url")
      .eq("id",user.id).maybeSingle();

    if(error){
      console.error("[CCF PERFIL] Error cargando perfil:",error);
      setStatus(`No fue posible cargar el perfil: ${error.message||"error en profiles"}`,"error");
      return;
    }
    const p=data||{};
    originalAvatarUrl=p.avatar_url||"";
    document.getElementById("ccf-profile-nombre").value=p.nombre||"";
    document.getElementById("ccf-profile-apellido").value=p.apellido||"";
    document.getElementById("ccf-profile-direccion").value=p.direccion||"";
    document.getElementById("ccf-profile-telefono-numero").value=phoneDigits(p.telefono||"");
    document.getElementById("ccf-profile-ocupacion").value=p.ocupacion||"";
    avatar(originalAvatarUrl,p.nombre,p.apellido);
    setStatus("");
  }

  function previewImage(e) {
    const f=e.target.files?.[0];if(!f)return;
    if(!["image/jpeg","image/png","image/webp"].includes(f.type)){e.target.value="";setStatus("Formato no permitido. Usa JPG, PNG o WebP.","error");return;}
    if(f.size>3*1024*1024){e.target.value="";setStatus("La imagen supera el máximo de 3 MB.","error");return;}
    avatar(URL.createObjectURL(f),document.getElementById("ccf-profile-nombre").value,document.getElementById("ccf-profile-apellido").value);
    setStatus("Foto seleccionada. Guarda los cambios para hacerla permanente.");
  }

  async function saveProfile(e) {
    e.preventDefault();
    const user=await getUser();
    if(!user){setStatus("La sesión no está disponible.","error");return;}

    const nombre=document.getElementById("ccf-profile-nombre").value.trim();
    const apellido=document.getElementById("ccf-profile-apellido").value.trim();
    const direccion=document.getElementById("ccf-profile-direccion").value.trim();
    const td=phoneDigits(document.getElementById("ccf-profile-telefono-numero").value);
    const ocupacion=document.getElementById("ccf-profile-ocupacion").value.trim();
    const file=document.getElementById("ccf-profile-file").files[0];
    const btn=document.getElementById("ccf-profile-save");

    if(!nombre||!apellido){setStatus("Nombre y apellido son obligatorios.","error");return;}
    if(td&&td.length!==8){setStatus("Ingresa los 8 dígitos del número móvil.","error");return;}

    btn.disabled=true;setStatus("Guardando información...");
    try {
      /*
       * Primero comprobamos que profiles pueda escribirse.
       * No usamos upsert para evitar que una política de INSERT
       * bloquee una actualización de un perfil ya existente.
       */
      const payload={nombre,apellido,direccion,telefono:td?`+569${td}`:null,ocupacion};
      let {data:existing,error:readError}=await client.from("profiles").select("id,avatar_url").eq("id",user.id).maybeSingle();
      if(readError) throw new Error(`No se pudo consultar profiles: ${readError.message}`);

      let profileError=null;
      if(existing) {
        const r=await client.from("profiles").update(payload).eq("id",user.id);
        profileError=r.error;
      } else {
        const r=await client.from("profiles").insert({id:user.id,...payload});
        profileError=r.error;
      }
      if(profileError) throw new Error(`No se pudo guardar el perfil: ${profileError.message}`);

      /*
       * La foto se sube con una ruta estable por usuario.
       * upsert=true reemplaza la foto cuando el usuario la cambia.
       * Si no se selecciona una foto, se conserva la anterior.
       */
      if(file) {
        const ext=(file.name.split(".").pop()||"jpg").toLowerCase();
        const path=`${user.id}/profile.${ext}`;
        const upload=await client.storage.from("avatars").upload(path,file,{
          cacheControl:"3600",upsert:true,contentType:file.type
        });
        if(upload.error) throw new Error(`No se pudo guardar la foto: ${upload.error.message}`);

        const pub=client.storage.from("avatars").getPublicUrl(path);
        const url=pub?.data?.publicUrl||"";
        if(!url) throw new Error("Storage no devolvió una URL pública para la foto.");

        const {error:avatarError}=await client.from("profiles")
          .update({avatar_url:url}).eq("id",user.id);
        if(avatarError) throw new Error(`Los datos se guardaron, pero no se pudo registrar la foto: ${avatarError.message}`);

        originalAvatarUrl=url;
        avatar(url,nombre,apellido);
        document.getElementById("ccf-profile-file").value="";
      }

      setStatus(file ? "Perfil y foto guardados correctamente." : "Perfil guardado correctamente.","success");
      setTimeout(closeModal,900);
    } catch(err) {
      console.error("[CCF PERFIL] Error guardando perfil:",err);
      setStatus(err.message||"No se puede guardar la información.","error");
    } finally {
      btn.disabled=false;
    }
  }

  async function openModal() {
    buildModal();
    const overlay=document.getElementById("ccf-profile-overlay");
    const card=document.getElementById("ccf-profile-card");
    overlay.classList.add("ccf-open");
    if(card) card.scrollTop=0;
    await loadProfile();
    if(card) card.scrollTop=0;
  }

  function closeModal(){document.getElementById("ccf-profile-overlay")?.classList.remove("ccf-open");}

  function boot(){injectStyles();buildModal();addButton();client=getClient();}
  function wait(){if(document.body&&document.querySelector(".topbar"))boot();else setTimeout(wait,250);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",wait,{once:true});else wait();
})();
