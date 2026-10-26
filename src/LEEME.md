# Pilares (código fuente)

- `src/pilares.js` tiene todo lo nuevo: pilares, objetivos, notas (escritas y por voz), Métodos Harada, progreso y avisos.
- Después de editarlo, corré `node scripts/build.cjs` para copiarlo dentro de `rumbo.html` (entre las marcas `<PILARES>`).
- Los datos nuevos se guardan en la clave `pilares` y se sincronizan con Firebase como el resto.
- Avisos con la app cerrada: `.github/workflows/avisos.yml` corre `scripts/avisos.mjs` cada 15 minutos.
  Necesita los secretos `FIREBASE_SERVICE_ACCOUNT` y `VAPID_PRIVATE` en GitHub (Settings > Secrets and variables > Actions).
