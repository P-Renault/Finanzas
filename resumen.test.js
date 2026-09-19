ARCHIVO: resumen.test.js
LENGUAJE: JavaScript ES2022 / Jest
EXTENSIÓN DE IMPLEMENTACIÓN: .js
EXTENSIÓN DE ENTREGA: .txt

// Pruebas unitarias mínimas del motor.
// Integrar con el framework de pruebas existente.

test('margen cero cuando la liquidez protegida está bajo la reserva', () => {
  const result = DailySpendingMarginEngine.calculate({
    protectedLiquidity: 10000,
    minimumReserve: 20000,
    discretionarySpent: 0
  });
  expect(result.maximum).toBe(0);
});

test('70% activa estado preventivo', () => {
  const result = DailySpendingMarginEngine.calculate({
    protectedLiquidity: 100000,
    minimumReserve: 0,
    discretionarySpent: 70000
  });
  expect(result.status).toBe('PREVENTIVE');
});

test('80% activa precaución', () => {
  const result = DailySpendingMarginEngine.calculate({
    protectedLiquidity: 100000,
    minimumReserve: 0,
    discretionarySpent: 80000
  });
  expect(result.status).toBe('CAUTION');
});

test('90% activa estado crítico', () => {
  const result = DailySpendingMarginEngine.calculate({
    protectedLiquidity: 100000,
    minimumReserve: 0,
    discretionarySpent: 90000
  });
  expect(result.status).toBe('CRITICAL');
});

test('100% alcanza el límite sin bloquear el registro', () => {
  const result = DailySpendingMarginEngine.calculate({
    protectedLiquidity: 100000,
    minimumReserve: 0,
    discretionarySpent: 100000
  });
  expect(result.status).toBe('LIMIT_REACHED');
  expect(result.remaining).toBe(0);
});

test('exceso queda identificado', () => {
  const result = DailySpendingMarginEngine.calculate({
    protectedLiquidity: 100000,
    minimumReserve: 0,
    discretionarySpent: 120000
  });
  expect(result.excess).toBe(20000);
});

test('alerta predictiva', () => {
  const result = DailySpendingMarginEngine.calculate({
    protectedLiquidity: 100000,
    minimumReserve: 0,
    discretionarySpent: 65000,
    projectedSpendRatePerHour: 20000,
    remainingHours: 2
  });
  expect(result.projectedConsumedPct).toBe(105);
  expect(result.status).toBe('CRITICAL');
});
