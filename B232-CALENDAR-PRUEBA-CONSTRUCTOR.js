/*
 * PRUEBA TÉCNICA — IDENTIFICACIÓN DEL CONSTRUCTOR B232
 * Rama objetivo: Backup-2.7-adaptación-móvil
 *
 * Solo para diagnóstico.
 * Inserta una única línea dentro de cada .b232261-card existente.
 * NO modifica Supabase, cálculos ni navegación.
 * ELIMINAR después de la prueba.
 */
(() => {
  'use strict';

  const TEST_TEXT = 'Esto es una prueba y se debe eliminar.';
  const MARK = 'data-b232-constructor-test';

  function inject() {
    document.querySelectorAll('#calendario .b232261-card').forEach(card => {
      if (card.hasAttribute(MARK)) return;

      const line = document.createElement('div');
      line.setAttribute(MARK, 'true');
      line.textContent = TEST_TEXT;
      line.style.cssText = [
        'font-size:12px',
        'font-weight:700',
        'color:#b91c1c',
        'padding:6px 0',
        'margin:0 0 6px'
      ].join(';');

      card.prepend(line);
      card.setAttribute(MARK, 'true');
    });
  }

  inject();

  const observer = new MutationObserver(inject);
  observer.observe(document.getElementById('calendario') || document.body, {
    childList: true,
    subtree: true
  });

  window.__B232_CONSTRUCTOR_TEST__ = {
    text: TEST_TEXT,
    remove() {
      document.querySelectorAll('[data-b232-constructor-test]').forEach(el => el.remove());
      document.querySelectorAll('#calendario .b232261-card[data-b232-constructor-test]').forEach(card => {
        card.removeAttribute(MARK);
      });
      observer.disconnect();
    }
  };
})();
