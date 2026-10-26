// Envía las notificaciones push de Rumbo. Lo corre GitHub Actions cada 15 minutos
// (.github/workflows/avisos.yml), gratis. Necesita estos secretos del repositorio:
//   FIREBASE_SERVICE_ACCOUNT  JSON de la cuenta de servicio de becker-sync
//   VAPID_PRIVATE             clave privada para firmar los push
// La clave pública está en scripts/vapid-public.txt (también va dentro de la app).
import { readFileSync } from "node:fs";
import admin from "firebase-admin";
import webpush from "web-push";

if (!process.env.FIREBASE_SERVICE_ACCOUNT || !process.env.VAPID_PRIVATE) {
  console.log("Faltan los secretos FIREBASE_SERVICE_ACCOUNT y/o VAPID_PRIVATE: no se envía nada.");
  process.exit(0);
}
const VAPID_PUBLIC = readFileSync(new URL("./vapid-public.txt", import.meta.url), "utf8").trim();
webpush.setVapidDetails("mailto:beckerlastrelaureano@gmail.com", VAPID_PUBLIC, process.env.VAPID_PRIVATE);
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();

const PILLARS = { mental: "Mental", espiritual: "Espiritual", fisico: "Físico", social: "Social-Afectivo", academico: "Académico", marca: "Marca Personal" };
const VENTANA_MIN = 60; // si el aviso se demora (GitHub a veces atrasa), igual se manda dentro de esta ventana

// Fecha y hora "de pared" en la zona horaria del usuario.
function localNow(tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  const date = `${p.year}-${p.month}-${p.day}`;
  const d = new Date(`${date}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7; // 0 = lunes
  const monday = new Date(d.getTime() - dow * 864e5).toISOString().slice(0, 10);
  return { date, minutes: Number(p.hour) * 60 + Number(p.minute), sunday: dow === 6, week: "S" + monday, month: date.slice(0, 7) };
}
const toMin = (hm) => { const [h, m] = hm.split(":").map(Number); return h * 60 + m; };
const done = (o, v) => (o.target > 1 ? (Number(v) || 0) >= o.target : Boolean(v));

async function sendAll(devices, payload) {
  let ok = 0;
  for (const [key, d] of Object.entries(devices || {})) {
    try { await webpush.sendNotification(d.sub, JSON.stringify(payload), { TTL: 3600 }); ok++; }
    catch (e) { console.log(`  dispositivo ${key}: ${e.statusCode || e.message}`); }
  }
  return ok;
}

const users = await db.collection("usuarios").listDocuments();
for (const u of users) {
  const snap = await u.collection("rumbo").doc("pilares").get();
  if (!snap.exists) continue;
  let data = snap.get("value");
  try { data = typeof data === "string" ? JSON.parse(data) : data; } catch { continue; }
  const n = data && data.notify;
  if (!n || !n.enabled || !n.devices || !Object.keys(n.devices).length) continue;

  const now = localNow(n.tz || "America/Argentina/Buenos_Aires");
  const stateRef = db.collection("rumbo_push").doc(u.id);
  const sent = (await stateRef.get()).data() || {};
  const mark = {};

  for (const t of n.times || []) {
    const id = `${now.date}_${t}`;
    if (sent[id] || now.minutes < toMin(t) || now.minutes > toMin(t) + VENTANA_MIN) continue;
    mark[id] = true;
    const vals = (data.progress || {})[now.date] || {};
    for (const [pid, name] of Object.entries(PILLARS)) {
      if (n.pillars && n.pillars[pid] === false) continue;
      const faltan = (data.objectives || []).filter((o) => o.pillar === pid && o.period === "diario" && !done(o, vals[o.id])).map((o) => o.text);
      if (!faltan.length) continue;
      const ok = await sendAll(n.devices, { title: `Pilar ${name}: te faltan ${faltan.length}`, body: faltan.slice(0, 4).join(" · "), tag: `rumbo-${pid}-${t}` });
      console.log(`${u.id} ${t} ${name}: ${faltan.length} pendientes, enviado a ${ok}`);
    }
  }

  const weeklyId = `${now.date}_semanal`;
  if (n.weekly !== false && now.sunday && now.minutes >= toMin("21:00") && !sent[weeklyId]) {
    mark[weeklyId] = true;
    const parts = Object.entries(PILLARS).map(([pid, name]) => {
      const list = (data.objectives || []).filter((o) => o.pillar === pid && o.period === "semanal");
      const vals = (data.progress || {})[now.week] || {};
      if (!list.length) return null;
      return `${name}: ${list.filter((o) => done(o, vals[o.id])).length}/${list.length}`;
    }).filter(Boolean);
    const ok = await sendAll(n.devices, { title: "Resumen semanal de tus pilares", body: parts.join(" · ") || "Cargá objetivos semanales para ver tu resumen.", tag: "rumbo-resumen" });
    console.log(`${u.id} resumen semanal enviado a ${ok}`);
  }

  if (Object.keys(mark).length) await stateRef.set(mark, { merge: true });
}
console.log("Listo.");
process.exit(0);
