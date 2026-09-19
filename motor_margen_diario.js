/* Daily Spending Margin Engine — v5.0.0 */
window.DailySpendingMarginEngine = (() => {
  function calculate(input) {
    const protectedLiquidity = Number(input?.protectedLiquidity || 0);
    const minimumReserve = Number(input?.minimumReserve || 0);
    const spent = Math.max(0, Number(input?.discretionarySpent || 0));
    const safety = Number(input?.safetyBufferPct ?? 10);

    const maximum = Math.max(
      0,
      protectedLiquidity - minimumReserve
    );

    const sustainable = maximum;
    const recommended = Math.max(
      0,
      maximum * (1 - safety / 100)
    );

    const remaining = Math.max(0, maximum - spent);

    const consumedPct =
      maximum > 0 ? (spent / maximum) * 100 : 0;

    const hourlyRate = Math.max(
      0,
      Number(input?.projectedSpendRatePerHour || 0)
    );

    const hoursRemaining = Math.max(
      0,
      Number(input?.remainingHours || 0)
    );

    const projectedEndSpend =
      spent + hourlyRate * hoursRemaining;

    const projectedConsumedPct =
      maximum > 0
        ? (projectedEndSpend / maximum) * 100
        : 0;

    return {
      maximum,
      sustainable,
      recommended,
      spent,
      remaining,
      consumedPct,
      projectedConsumedPct,
      excess: Math.max(0, spent - maximum),
      limitReached: maximum > 0 && spent >= maximum,
      status: resolveStatus(consumedPct, projectedConsumedPct, maximum)
    };
  }

  function resolveStatus(actual, projected, maximum) {
    if (maximum <= 0) return 'NO_MARGIN';
    if (actual >= 100) return 'LIMIT_REACHED';
    if (actual >= 90 || projected >= 100) return 'CRITICAL';
    if (actual >= 80 || projected >= 90) return 'CAUTION';
    if (actual >= 70 || projected >= 80) return 'PREVENTIVE';
    return 'NORMAL';
  }

  return { calculate };
})();
