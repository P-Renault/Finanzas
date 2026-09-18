/* B230 — Inspector de Arquitectura | Control Financiero
 * Solo lectura. No ejecuta INSERT/UPDATE/DELETE.
 * Cargar DESPUÉS de los scripts actuales.
 */
(function () {
  "use strict";

  const B230 = {
    version: "230.0",
    results: {
      environment: {},
      dom: {},
      scripts: [],
      globals: [],
      supabase: {},
      tables: {}
    }
  };

  const $ = (s) => document.querySelector(s);

  const safe = (fn, fallback = null) => {
    try {
      return fn();
    } catch (_) {
      return fallback;
    }
  };

  const esc = (v) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const mark = (ok, label) =>
    `<span class="b230-${ok ? "ok" : "warn"}">${
      ok ? "✓" : "⚠"
    } ${esc(label)}</span>`;

  /* =========================================================
     1. INSPECCIÓN DEL DOM
     ========================================================= */

  function collectDOM() {
    const buttons = [...document.querySelectorAll("[data-tab]")];

    B230.results.dom = {
      title: document.title,

      appVisible:
        !!$("#app") &&
        !$("#app").classList.contains("hidden"),

      configVisible:
        !!$("#configPanel") &&
        !$("#configPanel").classList.contains("hidden"),

      tabs: buttons.map((b) => ({
        id: b.dataset.tab || null,
        text: (b.textContent || "").trim()
      })),

      sections: buttons.map((b) => {
        const id = b.dataset.tab;
        const el = id
          ? document.getElementById(id)
          : null;

        return {
          id,
          exists: !!el,
          hidden: el
            ? el.classList.contains("hidden")
            : null
        };
      })
    };
  }

  /* =========================================================
     2. SCRIPTS CARGADOS
     ========================================================= */

  function collectScripts() {
    B230.results.scripts = [...document.scripts].map(
      (s, i) => ({
        index: i + 1,
        src: s.src || "[inline]"
      })
    );
  }

  /* =========================================================
     3. OBJETOS / FUNCIONES GLOBALES
     ========================================================= */

  function collectGlobals() {
    const names = [
      "supabase",
      "supabaseClient",
      "db",

      "loadData",
      "loadDashboard",
      "loadMovimientos",
      "loadCalendario",
      "loadAhorro",
      "loadDeudas",
      "loadCuentas",
      "loadOperaciones",
      "loadPlanificacion",

      "transferirFondos",

      "B220",
      "B221",
      "B222",
      "B223",
      "B224",
      "B227",
      "B229"
    ];

    B230.results.globals = names.map(
      (name) => ({
        name,
        exists:
          typeof window[name] !== "undefined",
        type:
          typeof window[name]
      })
    );
  }

  /* =========================================================
     4. DETECCIÓN DEL CLIENTE SUPABASE
     ========================================================= */

  function getClient() {
    const candidates = [
      "supabaseClient",
      "db",
      "supabase"
    ];

    for (const name of candidates) {
      const value = safe(
        () => window[name]
      );

      if (
        value &&
        typeof value === "object" &&
        typeof value.from === "function"
      ) {
        return {
          client: value,
          source: name
        };
      }
    }

    return {
      client: null,
      source: null
    };
  }

  function collectSupabase() {
    const {
      client,
      source
    } = getClient();

    B230.results.supabase = {
      sdkLoaded:
        typeof window.supabase !== "undefined",

      clientFound:
        !!client,

      clientSource:
        source,

      clientHasFrom:
        !!client,

      note:
        "B230 realiza únicamente consultas SELECT de diagnóstico."
    };

    return client;
  }

  /* =========================================================
     5. INSPECCIÓN DE TABLAS
     ========================================================= */

  async function inspectTable(
    client,
    table
  ) {
    if (!client) {
      return {
        table,
        status: "SIN_CLIENTE",
        rows: null,
        columns: [],
        error:
          "No se encontró un cliente Supabase accesible."
      };
    }

    try {
      const response =
        await client
          .from(table)
          .select("*")
          .limit(1);

      if (response.error) {
        return {
          table,
          status: "ERROR_SELECT",
          rows: null,
          columns: [],
          error:
            response.error.message ||
            String(response.error)
        };
      }

      const rows =
        Array.isArray(response.data)
          ? response.data
          : [];

      return {
        table,
        status: "OK_SELECT",
        rows: rows.length,
        columns:
          rows.length
            ? Object.keys(rows[0])
            : [],
        error: null
      };

    } catch (error) {
      return {
        table,
        status: "EXCEPTION",
        rows: null,
        columns: [],
        error:
          error?.message ||
          String(error)
      };
    }
  }

  async function inspectTables(
    client
  ) {
    const names = [
      "movimientos",
      "compromisos",
      "ahorro",
      "deudas",
      "cuentas",
      "transferencias_fondos"
    ];

    for (const name of names) {
      B230.results.tables[name] =
        await inspectTable(
          client,
          name
        );
    }
  }

  /* =========================================================
     6. CONSTRUCCIÓN DEL INFORME
     ========================================================= */

  function buildReport() {
    const r =
      B230.results;

    const tableRows =
      Object.values(r.tables)
        .map(
          (t) => `
          <tr>
            <td>${esc(t.table)}</td>

            <td>
              ${esc(t.status)}
            </td>

            <td>
              ${
                t.rows == null
                  ? "—"
                  : t.rows
              }
            </td>

            <td>
              ${esc(
                t.columns.join(", ") ||
                "—"
              )}
            </td>

            <td>
              ${esc(
                t.error || "—"
              )}
            </td>
          </tr>
        `
        )
        .join("");

    const tabRows =
      (r.dom.tabs || [])
        .map((t) => {
          const section =
            (r.dom.sections || [])
              .find(
                (x) =>
                  x.id === t.id
              );

          return `
            <tr>
              <td>
                ${esc(t.id)}
              </td>

              <td>
                ${esc(t.text)}
              </td>

              <td>
                ${mark(
                  !!section?.exists,
                  section?.exists
                    ? "sección encontrada"
                    : "sección no encontrada"
                )}
              </td>
            </tr>
          `;
        })
        .join("");

    const scriptRows =
      r.scripts
        .map(
          (s) =>
            `<li><code>${esc(
              s.src
            )}</code></li>`
        )
        .join("");

    return `
      <div
        class="b230-overlay"
        id="b230Overlay"
      >

        <div class="b230-panel">

          <!-- CABECERA -->

          <div class="b230-head">

            <div>

              <h2>
                B230 · Inspector de Arquitectura
              </h2>

              <small>
                Diagnóstico de solo lectura ·
                v${esc(B230.version)}
              </small>

            </div>

            <button
              id="b230Close"
              type="button"
            >
              Cerrar
            </button>

          </div>


          <!-- ESTADO GENERAL -->

          <div class="b230-grid">

            <div class="b230-card">

              <h3>
                Aplicación
              </h3>

              ${mark(
                r.dom.appVisible,
                r.dom.appVisible
                  ? "Aplicación visible"
                  : "Aplicación no visible"
              )}

              ${mark(
                !!r.dom.tabs?.length,
                `${
                  r.dom.tabs?.length || 0
                } pestañas detectadas`
              )}

            </div>


            <div class="b230-card">

              <h3>
                Supabase
              </h3>

              ${mark(
                r.supabase.sdkLoaded,
                "SDK cargado"
              )}

              ${mark(
                r.supabase.clientFound,
                r.supabase.clientFound
                  ? "Cliente encontrado"
                  : "Cliente no detectado"
              )}

              ${mark(
                r.supabase.clientHasFrom,
                r.supabase.clientHasFrom
                  ? "API .from() disponible"
                  : "API .from() no disponible"
              )}

            </div>

          </div>


          <!-- NAVEGACIÓN -->

          <div class="b230-card">

            <h3>
              Módulos / navegación
            </h3>

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Etiqueta</th>
                  <th>DOM</th>
                </tr>

              </thead>

              <tbody>

                ${
                  tabRows ||
                  `
                    <tr>
                      <td colspan="3">
                        Sin pestañas
                      </td>
                    </tr>
                  `
                }

              </tbody>

            </table>

          </div>


          <!-- SUPABASE -->

          <div class="b230-card">

            <h3>
              Tablas accesibles por SELECT
            </h3>

            <p class="b230-note">

              Un error de SELECT no demuestra
              por sí solo un problema de RLS.
              Puede indicar nombre distinto,
              ausencia de tabla o cliente
              no disponible.

            </p>

            <table>

              <thead>

                <tr>
                  <th>Tabla</th>
                  <th>Estado</th>
                  <th>Filas</th>
                  <th>Columnas detectadas</th>
                  <th>Error</th>
                </tr>

              </thead>

              <tbody>

                ${tableRows}

              </tbody>

            </table>

          </div>


          <!-- SCRIPTS -->

          <div class="b230-card">

            <h3>
              Scripts cargados
            </h3>

            <ol>
              ${scriptRows}
            </ol>

          </div>


          <!-- ACCIONES -->

          <div class="b230-actions">

            <button
              id="b230Copy"
              type="button"
            >
              Copiar informe JSON
            </button>

            <button
              id="b230Refresh"
              type="button"
            >
              Ejecutar nuevamente
            </button>

          </div>


          <!-- JSON -->

          <pre id="b230Json">${
            esc(
              JSON.stringify(
                r,
                null,
                2
              )
            )
          }</pre>

        </div>

      </div>
    `;
  }

  /* =========================================================
     7. ESTILOS DEL INSPECTOR
     ========================================================= */

  function styles() {
    if (
      $("#b230Styles")
    ) {
      return;
    }

    const s =
      document.createElement(
        "style"
      );

    s.id =
      "b230Styles";

    s.textContent = `

      #b230Launch {

        margin-left: 8px;

        padding: 8px 12px;

        border:
          1px solid
          rgba(127,127,127,.35);

        border-radius: 8px;

        background: transparent;

        color: inherit;

        cursor: pointer;
      }


      .b230-overlay {

        position: fixed;

        inset: 0;

        z-index: 99999;

        background:
          rgba(0,0,0,.62);

        overflow: auto;

        padding: 24px;
      }


      .b230-panel {

        max-width: 1100px;

        margin: 0 auto;

        background: #fff;

        color: #111827;

        border-radius: 14px;

        padding: 20px;

        box-shadow:
          0 20px 60px
          rgba(0,0,0,.3);

        font-family:
          system-ui,
          sans-serif;
      }


      .b230-head {

        display: flex;

        justify-content:
          space-between;

        align-items:
          flex-start;

        gap: 16px;

        margin-bottom: 18px;
      }


      .b230-head h2 {

        margin:
          0 0 4px;
      }


      .b230-head button,
      .b230-actions button {

        padding:
          9px 13px;

        border-radius:
          8px;

        border:
          1px solid
          #d1d5db;

        cursor:
          pointer;
      }


      .b230-grid {

        display: grid;

        grid-template-columns:
          repeat(
            2,
            minmax(0,1fr)
          );

        gap: 12px;
      }


      .b230-card {

        border:
          1px solid
          #e5e7eb;

        border-radius:
          10px;

        padding:
          14px;

        margin-bottom:
          12px;

        overflow-x:
          auto;
      }


      .b230-card h3 {

        margin-top:
          0;
      }


      .b230-ok {

        display:
          inline-block;

        margin:
          3px 8px 3px 0;

        color:
          #166534;
      }


      .b230-warn {

        display:
          inline-block;

        margin:
          3px 8px 3px 0;

        color:
          #92400e;
      }


      .b230-note {

        color:
          #4b5563;

        font-size:
          13px;
      }


      .b230-card table {

        width:
          100%;

        border-collapse:
          collapse;

        font-size:
          13px;
      }


      .b230-card th,
      .b230-card td {

        border-bottom:
          1px solid
          #e5e7eb;

        padding:
          8px;

        text-align:
          left;

        vertical-align:
          top;
      }


      .b230-card code {

        word-break:
          break-all;
      }


      .b230-actions {

        display:
          flex;

        gap:
          10px;

        flex-wrap:
          wrap;

        margin:
          14px 0;
      }


      #b230Json {

        max-height:
          360px;

        overflow:
          auto;

        background:
          #111827;

        color:
          #f9fafb;

        padding:
          14px;

        border-radius:
          10px;

        font-size:
          12px;
      }


      @media (max-width: 700px) {

        .b230-grid {

          grid-template-columns:
            1fr;
        }

        .b230-overlay {

          padding:
            10px;
        }

        .b230-panel {

          padding:
            14px;
        }

      }

    `;

    document.head.appendChild(s);
  }

  /* =========================================================
     8. EJECUCIÓN DEL DIAGNÓSTICO
     ========================================================= */

  async function run() {

    collectDOM();

    collectScripts();

    collectGlobals();

    const client =
      collectSupabase();

    await inspectTables(
      client
    );

    B230.results.environment = {

      url:
        location.href,

      host:
        location.host,

      path:
        location.pathname,

      userAgent:
        navigator.userAgent,

      timestamp:
        new Date().toISOString()

    };
  }

  /* =========================================================
     9. MOSTRAR INSPECTOR
     ========================================================= */

  async function show() {

    $("#b230Overlay")?.remove();

    await run();

    document.body.insertAdjacentHTML(
      "beforeend",
      buildReport()
    );

    $("#b230Close")
      ?.addEventListener(
        "click",
        () =>
          $("#b230Overlay")?.remove()
      );

    $("#b230Copy")
      ?.addEventListener(
        "click",
        async () => {

          const txt =
            JSON.stringify(
              B230.results,
              null,
              2
            );

          try {

            await navigator.clipboard
              .writeText(txt);

            $("#b230Copy")
              .textContent =
              "Informe copiado ✓";

          } catch (_) {

            window.prompt(
              "Copia el informe:",
              txt
            );
          }
        }
      );

    $("#b230Refresh")
      ?.addEventListener(
        "click",
        show
      );
  }

  /* =========================================================
     10. INSTALAR BOTÓN
     ========================================================= */

  function install() {

    styles();

    const topbar =
      document.querySelector(
        ".topbar"
      );

    if (
      !topbar ||
      $("#b230Launch")
    ) {
      return;
    }

    const button =
      document.createElement(
        "button"
      );

    button.id =
      "b230Launch";

    button.type =
      "button";

    button.textContent =
      "B230 · Diagnóstico";

    button.title =
      "Inspector de Arquitectura — solo lectura";

    button.addEventListener(
      "click",
      show
    );

    topbar.appendChild(
      button
    );
  }

  /* =========================================================
     11. API PÚBLICA B230
     ========================================================= */

  window.B230Inspector = {

    version:
      B230.version,

    run,

    show,

    getResults:
      () =>
        JSON.parse(
          JSON.stringify(
            B230.results
          )
        )

  };


  /* =========================================================
     12. INICIO
     ========================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      install,
      { once: true }
    );

  } else {

    install();

  }

})();
