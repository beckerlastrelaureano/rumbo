# Pilares (código fuente)

- `src/pilares.js` tiene todo lo de los pilares: objetivos, hábitos por pilar, Agenda semanal con tareas,
  voz, Journaling, Cursos, Métodos Harada, progreso, avisos y la gestión de pilares (agregar, editar, borrar).
- Después de editarlo, corré `node scripts/build.cjs` para copiarlo dentro de `rumbo.html` (entre las marcas `<PILARES>`).
- Los datos nuevos se guardan en la clave `pilares` y se sincronizan con Firebase como el resto:
  `objectives`, `progress`, `tasks` (Agenda), `journal`, `cursos`, `harada`, `pillars`, `notify`.
- Las notas viejas (`notes`) y el planificador viejo (`weekPlan`) no se borran: se copiaron a `tasks` una sola vez.
- Las lecciones de Cursos están en `cursos.json` (se cargan al abrir Cursos y quedan en caché para usar sin internet).
- Avisos con la app cerrada: `.github/workflows/avisos.yml` corre `scripts/avisos.mjs` cada 15 minutos.
  Necesita los secretos `FIREBASE_SERVICE_ACCOUNT` y `VAPID_PRIVATE` en GitHub (Settings > Secrets and variables > Actions).
