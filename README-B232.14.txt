MEJORA DE INTEGRABILIDAD CALENDARIO — B232.14

Esta versión NO es otro runtime hotfix.
Es una corrección de arquitectura:

app.js = propietario de navegación.
B232 = propietario de la representación del calendario.

Se elimina la dependencia accidental de las flechas para disparar B232.
La estructura superior visual se aproxima deliberadamente a la vista inicial
del calendario legacy, pero conserva los cuadros y motores informativos B232.

Aplicación:
1. Aplicar PATCH-1-app.js.txt.
2. Aplicar PATCH-2-b232.txt.
3. Aplicar PATCH-3-b219.txt.
4. Publicar en Punto-referencia.
5. Limpiar caché/PWA.
6. Ejecutar QA-B232.14.txt.

La validación final es visual y funcional.
