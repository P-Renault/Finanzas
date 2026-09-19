ARCHIVO: supabase_finanzas.js
LENGUAJE: JavaScript ES2022 + Supabase
EXTENSIÓN DE IMPLEMENTACIÓN: .js
EXTENSIÓN DE ENTREGA: .txt

// Adaptador de datos.
// Sustituir la URL/clave y nombres de RPC según el proyecto real.
// No colocar claves service_role en frontend.

window.FinanceRepository = (() => {
  async function loadSummaryContext() {
    // Preferir una RPC/vista consolidada cuando exista.
    if (window.supabaseClient) {
      const { data, error } = await window.supabaseClient
        .rpc('get_financial_summary_context');

      if (!error && data) return data;
      if (error) console.warn('RPC de resumen no disponible:', error.message);
    }

    // Contrato mínimo para desarrollo/integración.
    return {
      today: new Date().toISOString().slice(0, 10),
      initialBalance: 0,
      minimumReserve: 0,
      safetyBufferPct: 10,
      incomes: [],
      expenses: [],
      obligations: [],
      calendar: {},
      marginInput: {
        protectedLiquidity: 0,
        minimumReserve: 0,
        discretionarySpent: 0,
        safetyBufferPct: 10,
        projectedSpendRatePerHour: 0,
        remainingHours: 0
      }
    };
  }

  return { loadSummaryContext };
})();
