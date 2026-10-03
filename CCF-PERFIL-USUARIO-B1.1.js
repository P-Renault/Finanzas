/* =========================================================
   CCF PERFIL USUARIO · B1.1
   Perfil: foto, nombre, apellido, dirección, teléfono y ocupación.
   Integración compatible con CCF-MOBILE-B4.3 / B4.3.10.
   ========================================================= */
(() => {
  "use strict";

  if (window.__CCF_PERFIL_USUARIO_B11__) return;
  window.__CCF_PERFIL_USUARIO_B11__ = true;

  const SUPABASE_URL = "https://xgxvdbgmwvncmfdcxgsf9.supabase.co";
  const SUPABASE_KEY = "sb_publishable_fJqOSLC7dhYKttuU1uAvcQ_AX-aH4PB";

  let client = null;
  let currentUser = null;

  function getClient() {
    return window.supabaseClient ||
      window.__B23273_CLIENT__ ||
      window.__B23270_CLIENT__ ||
      window.__B23269_CLIENT__ ||
      window.db ||
      null;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initials(nombre, apellido) {
    const a = String(nombre || "").trim().charAt(0);
    const b = String(apellido || "").trim().charAt(0);
    return (a + b || "US").toUpperCase();
  }

  /* Convierte cualquier formato habitual de teléfono chileno
     almacenado anteriormente a los 8 dígitos posteriores a +56 9. */
  function normalizePhoneDigits(value) {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.startsWith("00569")) digits = digits.slice(5);
    else if (digits.startsWith("569")) digits = digits.slice(3);
    else if (digits.startsWith("56") && digits.length >= 10) digits = digits.slice(2);
    else if (digits.startsWith("9") && digits.length === 9) digits = digits.slice(1);
    return digits.slice(-8);
  }

  function fullPhone() {
    const input = document.getElementById("ccf-profile-telefono-numero");
    const digits = normalizePhoneDigits(input?.value || "");
    return digits ? `+569${digits}` : "";
  }

  function injectStyles() {
    if (document.getElementById("ccf-profile-styles")) return;

    const style = document.createElement("style");
    style.id = "ccf-profile-styles";
    style.textContent = `
      #ccf-profile-button {
        display:inline-flex;align-items:center;gap:8px;
        border:1px solid rgba(127,127,127,.28);background:transparent;
        color:inherit;cursor:pointer;border-radius:10px;padding:7px 11px;font:inherit;
      }
      #ccf-profile-button:hover{background:rgba(127,127,127,.10)}
      .ccf-profile-mini-avatar{
        width:30px;height:30px;border-radius:50%;object-fit:cover;
        display:grid;place-items:center;background:#e5e7eb;color:#374151;
        font-weight:700;font-size:12px;overflow:hidden
      }
      .ccf-profile-mini-avatar img{width:100%;height:100%;object-fit:cover}
      #ccf-profile-overlay{
        position:fixed;inset:0;z-index:99999;display:none;align-items:center;
        justify-content:center;padding:18px;background:rgba(0,0,0,.58)
      }
      #ccf-profile-overlay.ccf-open{display:flex}
      #ccf-profile-card{
        width:min(620px,100%);max-height:min(760px,92vh);overflow:auto;
        background:#fff;color:#111827;border-radius:18px;
        box-shadow:0 24px 70px rgba(0,0,0,.28);padding:24px
      }
      .ccf-profile-head{
        display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:18px
      }
      .ccf-profile-head h2{margin:0 0 5px;font-size:22px}
      .ccf-profile-head p{margin:0;color:#6b7280;font-size:13px}
      .ccf-profile-close{
        border:0;background:#f3f4f6;border-radius:10px;width:36px;height:36px;
        cursor:pointer;font-size:20px
      }
      .ccf-profile-avatar-wrap{display:flex;align-items:center;gap:16px;margin:8px 0 22px}
      .ccf-profile-avatar{
        width:82px;height:82px;border-radius:50%;object-fit:cover;display:grid;
        place-items:center;background:#e5e7eb;color:#374151;font-size:25px;
        font-weight:700;overflow:hidden;flex:none
      }
      .ccf-profile-avatar img{width:100%;height:100%;object-fit:cover}
      .ccf-profile-upload label{
        display:inline-block;cursor:pointer;border:1px solid #d1d5db;
        border-radius:9px;padding:8px 12px;font-size:13px
      }
      .ccf-profile-upload input{display:none}
      .ccf-profile-upload small{display:block;color:#6b7280;margin-top:5px}
      .ccf-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .ccf-profile-field{display:flex;flex-direction:column;gap:6px}
      .ccf-profile-field.full{grid-column:1/-1}
      .ccf-profile-field label{font-size:13px;font-weight:600;color:#374151}
      .ccf-profile-field input{
        width:100%;box-sizing:border-box;border:1px solid #d1d5db;border-radius:9px;
        padding:11px 12px;font:inherit;background:#fff
      }
      .ccf-profile-field input:focus{
        outline:none;border-color:#6b7280;box-shadow:0 0 0 3px rgba(107,114,128,.12)
      }
      .ccf-phone-group{display:grid;grid-template-columns:96px 1fr;gap:8px}
      .ccf-phone-prefix{
        display:flex;align-items:center;justify-content:center;
        border:1px solid #d1d5db;border-radius:9px;background:#f3f4f6;
        color:#374151;font-weight:600;white-space:nowrap
      }
      .ccf-profile-actions{
        display:flex;justify-content:flex-end;gap:9px;margin-top:22px
      }
      .ccf-profile-actions button{
        border:0;border-radius:9px;padding:10px 16px;cursor:pointer;font:inherit
      }
      #ccf-profile-cancel{background:#f3f4f6;color:#374151}
      #ccf-profile-save{background:#111827;color:#fff}
      #ccf-profile-save:disabled{opacity:.55;cursor:wait}
      #ccf-profile-status{min-height:20px;margin-top:10px;font-size:13px;color:#6b7280}
      #ccf-profile-status.ccf-error{color:#991b1b}
      #ccf-profile-status.ccf-success{color:#166534}
      @media(max-width:720px){
        #ccf-profile-button .ccf-profile-button-label{display:none}
        #ccf-profile-overlay{padding:0;align-items:flex-end}
        #ccf-profile-card{
          width:100%;max-height:94vh;border-radius:22px 22px 0 0;padding:20px 18px
        }
        .ccf-profile-grid{grid-template-columns:1fr}
        .ccf-profile-field.full{grid-column:auto}
        .ccf-profile-actions{
          position:sticky;bottom:0;background:#fff;padding-top:10px
        }
      }
    `;
    document.head.appendChild(style);
  }

  function buildModal() {
    if (document.getElementById("ccf-profile-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "ccf-profile-overlay";
    overlay.innerHTML = `
      <div id="ccf-profile-card" role="dialog" aria-modal="true" aria-labelledby="ccf-profile-title">
        <div class="ccf-profile-head">
          <div>
            <h2 id="ccf-profile-title">Mi perfil</h2>
            <p>Actualiza tus datos personales.</p>
          </div>
          <button type="button" class="ccf-profile-close" id="ccf-profile-close" aria-label="Cerrar">×</button>
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
            <div class="ccf-profile-field">
              <label for="ccf-profile-nombre">Nombre *</label>
              <input id="ccf-profile-nombre" maxlength="100" required autocomplete="given-name">
            </div>
            <div class="ccf-profile-field">
              <label for="ccf-profile-apellido">Apellido *</label>
              <input id="ccf-profile-apellido" maxlength="100" required autocomplete="family-name">
            </div>
            <div class="ccf-profile-field full">
              <label for="ccf-profile-direccion">Dirección</label>
              <input id="ccf-profile-direccion" maxlength="255" autocomplete="street-address">
            </div>
            <div class="ccf-profile-field full">
              <label>Teléfono</label>
              <div class="ccf-phone-group">
                <div class="ccf-phone-prefix" aria-label="Código de país y prefijo">+56 9</div>
                <input
                  id="ccf-profile-telefono-numero"
                  inputmode="numeric"
                  maxlength="8"
                  pattern="[0-9]{8}"
                  placeholder="12345678"
                  autocomplete="tel-national"
                  aria-label="Número de teléfono"
                >
              </div>
            </div>
            <div class="ccf-profile-field full">
              <label for="ccf-profile-ocupacion">Ocupación</label>
              <input id="ccf-profile-ocupacion" maxlength="150" autocomplete="organization-title">
            </div>
          </div>
          <div id="ccf-profile-status"></div>
          <div class="ccf-profile-actions">
            <button type="button" id="ccf-profile-cancel">Cancelar</button>
            <button type="submit" id="ccf-profile-save">Guardar cambios</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("ccf-profile-close").onclick = closeModal;
    document.getElementById("ccf-profile-cancel").onclick = closeModal;

    overlay.addEventListener("click", e => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeModal();
    });

    document.getElementById("ccf-profile-file").addEventListener("change", previewImage);

    document.getElementById("ccf-profile-telefono-numero").addEventListener("input", e => {
      e.target.value = String(e.target.value || "").replace(/\D/g, "").slice(0, 8);
    });

    document.getElementById("ccf-profile-form").addEventListener("submit", saveProfile);
  }

  function addButton() {
    if (document.getElementById("ccf-profile-button")) return;
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "ccf-profile-button";
    btn.innerHTML = `
      <span class="ccf-profile-mini-avatar" id="ccf-profile-mini-avatar">US</span>
      <span class="ccf-profile-button-label">Mi perfil</span>
    `;
    btn.addEventListener("click", openModal);

    const logout = document.getElementById("logoutBtn");
    if (logout && logout.parentNode === topbar) topbar.insertBefore(btn, logout);
    else topbar.appendChild(btn);
  }

  function setAvatar(url, nombre, apellido) {
    const text = initials(nombre, apellido);
    const big = document.getElementById("ccf-profile-avatar");
    const mini = document.getElementById("ccf-profile-mini-avatar");

    if (big) big.innerHTML = url ? `<img src="${escapeHtml(url)}" alt="Foto de perfil">` : text;
    if (mini) mini.innerHTML = url ? `<img src="${escapeHtml(url)}" alt="Foto de perfil">` : text;
  }

  async function getUser() {
    client = getClient();
    if (!client) return null;
    const result = await client.auth.getUser();
    if (result.error) return null;
    currentUser = result.data.user || null;
    return currentUser;
  }

  async function loadProfile() {
    const user = await getUser();
    if (!user) {
      setStatus("No hay una sesión iniciada.", "error");
      return;
    }

    const { data, error } = await client
      .from("profiles")
      .select("id,nombre,apellido,direccion,telefono,ocupacion,avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[CCF PERFIL] Error cargando perfil:", error);
      setStatus("No fue posible cargar el perfil.", "error");
      return;
    }

    const p = data || {};
    document.getElementById("ccf-profile-nombre").value = p.nombre || "";
    document.getElementById("ccf-profile-apellido").value = p.apellido || "";
    document.getElementById("ccf-profile-direccion").value = p.direccion || "";
    document.getElementById("ccf-profile-telefono-numero").value = normalizePhoneDigits(p.telefono || "");
    document.getElementById("ccf-profile-ocupacion").value = p.ocupacion || "";
    setAvatar(p.avatar_url || "", p.nombre || "", p.apellido || "");
    setStatus("");
  }

  function setStatus(message, type = "") {
    const el = document.getElementById("ccf-profile-status");
    if (!el) return;
    el.textContent = message || "";
    el.className = type ? `ccf-${type}` : "";
  }

  function previewImage(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      e.target.value = "";
      setStatus("Formato no permitido. Usa JPG, PNG o WebP.", "error");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      e.target.value = "";
      setStatus("La imagen supera el máximo de 3 MB.", "error");
      return;
    }

    const url = URL.createObjectURL(file);
    const nombre = document.getElementById("ccf-profile-nombre").value;
    const apellido = document.getElementById("ccf-profile-apellido").value;
    setAvatar(url, nombre, apellido);
    setStatus("Foto seleccionada. Guarda los cambios para subirla.");
  }

  async function uploadAvatar(file, userId) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await client.storage.from("avatars").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type
    });

    if (error) throw error;

    const { data } = client.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  }

  async function saveProfile(e) {
    e.preventDefault();

    const user = await getUser();
    if (!user) {
      setStatus("La sesión no está disponible.", "error");
      return;
    }

    const nombre = document.getElementById("ccf-profile-nombre").value.trim();
    const apellido = document.getElementById("ccf-profile-apellido").value.trim();
    const direccion = document.getElementById("ccf-profile-direccion").value.trim();
    const telefono = fullPhone();
    const telefonoDigits = normalizePhoneDigits(
      document.getElementById("ccf-profile-telefono-numero").value
    );
    const ocupacion = document.getElementById("ccf-profile-ocupacion").value.trim();
    const file = document.getElementById("ccf-profile-file").files[0];
    const saveBtn = document.getElementById("ccf-profile-save");

    if (!nombre || !apellido) {
      setStatus("Nombre y apellido son obligatorios.", "error");
      return;
    }

    if (telefonoDigits && telefonoDigits.length !== 8) {
      setStatus("Ingresa los 8 dígitos del número móvil.", "error");
      return;
    }

    saveBtn.disabled = true;
    setStatus("Guardando...");

    try {
      /* Primero guardamos los datos de texto. Así una eventual regla RLS
         del Storage no impide guardar nombre, dirección, teléfono u ocupación. */
      const payload = {
        id: user.id,
        nombre,
        apellido,
        direccion,
        telefono: telefono || null,
        ocupacion
      };

      const { data: saved, error: profileError } = await client
        .from("profiles")
        .upsert(payload, { onConflict: "id" })
        .select("id,nombre,apellido,direccion,telefono,ocupacion,avatar_url")
        .maybeSingle();

      if (profileError) {
        console.error("[CCF PERFIL] Error guardando profiles:", profileError);
        setStatus(
          `No fue posible guardar el perfil: ${profileError.message || "error de permisos en profiles"}`,
          "error"
        );
        return;
      }

      let avatarUrl = saved?.avatar_url || "";

      /* La foto se procesa después de que los datos personales ya quedaron
         guardados. Si Storage falla, informamos específicamente el problema. */
      if (file) {
        try {
          avatarUrl = await uploadAvatar(file, user.id);

          const { error: avatarDbError } = await client
            .from("profiles")
            .update({ avatar_url: avatarUrl })
            .eq("id", user.id);

          if (avatarDbError) throw avatarDbError;
        } catch (avatarError) {
          console.error("[CCF PERFIL] Error guardando avatar:", avatarError);
          setAvatar("", nombre, apellido);
          setStatus(
            "Datos guardados correctamente, pero la foto no pudo almacenarse. Revisa los permisos del bucket avatars.",
            "error"
          );
          return;
        }
      }

      setAvatar(avatarUrl, nombre, apellido);
      setStatus("Perfil guardado correctamente.", "success");
      document.getElementById("ccf-profile-file").value = "";

      setTimeout(closeModal, 650);
    } catch (err) {
      console.error("[CCF PERFIL] Error inesperado:", err);
      setStatus("Ocurrió un error inesperado al guardar el perfil.", "error");
    } finally {
      saveBtn.disabled = false;
    }
  }

  async function openModal() {
    buildModal();
    document.getElementById("ccf-profile-overlay").classList.add("ccf-open");
    await loadProfile();
  }

  function closeModal() {
    const overlay = document.getElementById("ccf-profile-overlay");
    if (overlay) overlay.classList.remove("ccf-open");
  }

  function boot() {
    injectStyles();
    buildModal();
    addButton();
    client = getClient();

    if (client?.auth?.onAuthStateChange) {
      client.auth.onAuthStateChange((_event, session) => {
        currentUser = session?.user || null;
      });
    }
  }

  function waitForApp() {
    if (document.body && document.querySelector(".topbar")) {
      boot();
      return;
    }
    setTimeout(waitForApp, 250);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForApp, { once: true });
  } else {
    waitForApp();
  }
})();
