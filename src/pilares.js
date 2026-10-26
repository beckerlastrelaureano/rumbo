  // ═══════════════════════════════════════════════════════════════════════════
  // PILARES — Rumbo organizado por 6 pilares: objetivos diarios/semanales/mensuales,
  // notas (escritas y por voz) clasificadas por pilar, Métodos Harada y avisos.
  // Fuente editable: src/pilares.js. Se inserta dentro de rumbo.html con scripts/build.cjs.
  // Datos nuevos en la clave "pilares" (se sincroniza con la nube como el resto).
  // No borra ni modifica datos viejos: hábitos, "disciplina", notas, etc. siguen intactos.
  // ═══════════════════════════════════════════════════════════════════════════
  var PILLARS = [
    { id: "mental", name: "Mental", color: "#8AA3B8", icon: "M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5a3 3 0 0 0 3 4a3 3 0 0 0 5 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5a3 3 0 0 1-3 4a3 3 0 0 1-5 1" },
    { id: "espiritual", name: "Espiritual", color: "#A59BBD", icon: "M12 3v3M5.6 6.6l2 2M18.4 6.6l-2 2M3 15h18M7 15a5 5 0 0 1 10 0M6 19h12" },
    { id: "fisico", name: "F\xEDsico", color: "#8FAE9F", icon: "M6 9v6M18 9v6M3 11v2M21 11v2M6 12h12" },
    { id: "social", name: "Social-Afectivo", color: "#B98F95", icon: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" },
    { id: "academico", name: "Acad\xE9mico", color: "#B8A27A", icon: "M3 9l9-4 9 4-9 4-9-4zM7 11v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4" },
    { id: "marca", name: "Marca Personal", color: "#6B9192", icon: "M12 3l2.6 5.6 6 .6-4.5 4 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.5-4 6-.6z" }
  ];
  var PERIODOS = [["diario", "Diario"], ["semanal", "Semanal"], ["mensual", "Mensual"]];
  var pillarById = (id) => PILLARS.find((p) => p.id === id);
  // Notas viejas sin pilar: se clasifican al mostrarlas (sin modificar el dato guardado).
  var notePillar = (n) => n.pillar === void 0 ? classifyPillar(n.text) : n.pillar;
  // Clave de período: diario "2026-10-25", semanal "S2026-10-19" (lunes), mensual "2026-10".
  // Así los objetivos "se reinician solos": cada período nuevo arranca vacío y el historial queda.
  var pkey = (period, d) => period === "diario" ? fmtDate(d) : periodKey(period, d);
  var objDone = (o, v) => o.target > 1 ? (Number(v) || 0) >= o.target : Boolean(v);

  // ── Clasificación automática por palabras clave ──────────────────────────────
  var PILLAR_WORDS = {
    fisico: ["gym", "gimnasio", "entren", "pierna", "pecho", "espalda", "brazo", "correr", "corr\xED", "pilates", "masaje", "rutina de", "cardio", "dieta", "comida", "comer", "prote\xEDna", "dormir", "sue\xF1o", "f\xEDsic", "peso", "salud", "agua", "estir", "caminar", "nutrici"],
    mental: ["leer", "libro", "lectura", "hojas", "guitarra", "planific", "celular", "celu", "pantalla", "casa", "limpiar", "orden", "mente", "mental", "meditar", "concentr", "foco", "h\xE1bito", "habito", "journal", "aprender"],
    espiritual: ["amanecer", "rezar", "orar", "dios", "gratitud", "agradec", "espiritu", "fe", "silencio", "naturaleza", "prop\xF3sito", "proposito", "alma", "misa", "iglesia", "temprano"],
    social: ["maga", "familia", "mam\xE1", "pap\xE1", "amigo", "amiga", "novia", "pareja", "cita", "salida", "llamar a", "visitar", "abuel", "herman", "momento de valor", "regalo", "cumple"],
    academico: ["tesis", "parcial", "facultad", "facu", "universidad", "estudiar", "estudio", "examen", "final", "materia", "clase de", "secundaria", "pyp", "tumundo", "profesor", "trabajo pr\xE1ctico", "tp ", "escribir"],
    marca: ["marca", "cliente", "facturar", "factura", "venta", "vender", "podcast", "instagram", "ig ", "seguidores", "contenido", "reel", "app", "p\xE1gina", "pagina", "web", "invers", "negocio", "becker", "plata", "dinero", "precio", "idea", "emprend", "posteo", "video"]
  };
  function classifyPillar(text) {
    const t = " " + (text || "").toLowerCase() + " ";
    let best = null, score = 0;
    for (const [id, words] of Object.entries(PILLAR_WORDS)) {
      const s = words.reduce((n, w) => n + (t.includes(w) ? 1 : 0), 0);
      if (s > score) { best = id; score = s; }
    }
    return best;
  }
  // Separa un texto en partes de distintos pilares. Ej.: "mañana entreno piernas y tengo que escribir dos hojas de la tesis".
  function splitByPillar(text) {
    const clean = (text || "").trim();
    if (!clean) return [];
    const parts = clean.split(/(?:[.;!?\n]+|,\s*|\s+y\s+(?:adem[aá]s\s+|tambi[eé]n\s+)?|\s+adem[aá]s\s+|\s+tambi[eé]n\s+)/i).map((s) => s.trim()).filter(Boolean);
    const out = [];
    for (const p of parts) {
      const pil = classifyPillar(p);
      const last = out[out.length - 1];
      if (last && (pil === null || pil === last.pillar || last.pillar === null)) {
        last.text += (/[.!?]$/.test(last.text) ? " " : ", ") + p;
        if (last.pillar === null) last.pillar = pil;
      } else out.push({ text: p, pillar: pil });
    }
    if (out.length <= 1) return [{ text: clean, pillar: classifyPillar(clean) }];
    return out.map((x) => ({ ...x, text: x.text.charAt(0).toUpperCase() + x.text.slice(1) }));
  }
  // "objetivo semanal: entrenar 4 veces" → propone crear el objetivo.
  function detectGoal(text) {
    const m = /objetivo\s+(diario|semanal|mensual)\s*[:,-]?\s*(.*)$/i.exec(text || "");
    if (!m) return null;
    const rest = (m[2] || "").trim().replace(/[.]+$/, "");
    const WORDS = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, veinte: 20 };
    const num = /\b(\d{1,3}|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|veinte)\s*(veces|d[ií]as|horas|hojas|clases|sesiones)\b/i.exec(rest);
    const target = num ? Number(num[1]) || WORDS[num[1].toLowerCase()] || 0 : 0;
    return { period: m[1].toLowerCase(), text: rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : "", target };
  }

  // ── Audios (se guardan en este dispositivo, IndexedDB) ───────────────────────
  var AudioDB = {
    db: null,
    open() {
      if (this.db) return Promise.resolve(this.db);
      return new Promise((ok, fail) => {
        const r = indexedDB.open("rumbo-audios", 1);
        r.onupgradeneeded = () => r.result.createObjectStore("audios");
        r.onsuccess = () => { this.db = r.result; ok(this.db); };
        r.onerror = () => fail(r.error);
      });
    },
    async put(id, blob) { const db = await this.open(); return new Promise((ok, fail) => { const tx = db.transaction("audios", "readwrite"); tx.objectStore("audios").put(blob, id); tx.oncomplete = ok; tx.onerror = () => fail(tx.error); }); },
    async get(id) { const db = await this.open(); return new Promise((ok) => { const r = db.transaction("audios").objectStore("audios").get(id); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); }); },
    async del(id) { const db = await this.open(); return new Promise((ok) => { const tx = db.transaction("audios", "readwrite"); tx.objectStore("audios").delete(id); tx.oncomplete = ok; tx.onerror = ok; }); }
  };

  // ── Datos iniciales y migración desde lo que ya existía ──────────────────────
  var SEED = [
    ["fisico", "semanal", "fis-s1", "Entrenar m\xEDnimo 4 veces", 4], ["fisico", "semanal", "fis-s2", "1 clase de pilates", 1], ["fisico", "semanal", "fis-s3", "1 sesi\xF3n de masajes", 1],
    ["fisico", "mensual", "fis-m1", "20 a 25 d\xEDas de gym", 20], ["fisico", "mensual", "fis-m2", "5 a 7 clases de pilates", 5], ["fisico", "mensual", "fis-m3", "2 clases de masajes", 2],
    ["mental", "diario", "men-d1", "Leer 20 hojas", 0], ["mental", "diario", "men-d2", "Planificar mi d\xEDa", 0], ["mental", "diario", "men-d3", "Tener 3 momentos sin celular (no cuenta leer)", 3], ["mental", "diario", "men-d4", "Anotar mis h\xE1bitos", 0],
    ["mental", "semanal", "men-s1", "3 horas de guitarra", 3], ["mental", "semanal", "men-s2", "1 d\xEDa limpiar toda la casa", 1],
    ["mental", "mensual", "men-m1", "Leer 1 libro", 1], ["mental", "mensual", "men-m2", "12 a 15 horas de guitarra", 12], ["mental", "mensual", "men-m3", "Mantener la casa limpia todas las semanas", 4],
    ["espiritual", "diario", "esp-d1", "Levantarme temprano y ver el amanecer", 0],
    ["social", "semanal", "soc-s1", "5 momentos de valor con Maga", 5],
    ["academico", "semanal", "aca-s1", "1 hora sentarme con la tesis", 1], ["academico", "semanal", "aca-s2", "Planificar pyp y tumundo / secundaria", 1],
    ["academico", "mensual", "aca-m1", "Aprobar todos los parciales", 0], ["academico", "mensual", "aca-m2", "Escribir 10 hojas de la tesis", 10],
    ["marca", "semanal", "mar-s1", "3 d\xEDas m\xEDnimo de trabajo en la marca personal (1/2 hora por d\xEDa): ideas, apps e inversiones", 3],
    ["marca", "mensual", "mar-m1", "Cerrar 3 clientes", 3], ["marca", "mensual", "mar-m2", "Facturar 400 a 500K", 0], ["marca", "mensual", "mar-m3", "Tener p\xE1gina, podcast, Instagram y 3 apps activas", 0],
    ["marca", "mensual", "mar-m4", "Llegar a 200 seguidores en Instagram", 0], ["marca", "mensual", "mar-m5", "Hacer 1 o 2 podcasts", 1]
  ];
  // Objetivos de "disciplina" que equivalen a uno nuevo: se copia su historial de tildes.
  var DISCIPLINA_MAP = { s01: "fis-s1", s05: "soc-s1", s07: "aca-s2", s08: "mar-s1", s10: "men-s1", s11: "men-s2", s12: "aca-s1", m01: "aca-m1", m02: "mar-m2", m03: "men-m1", m04: "mar-m1", m05: "men-m3", m06: "fis-m1", m07: "men-m2", m08: "fis-m3", m09: "fis-m2", m11: "mar-m3", m12: "aca-m2" };
  var DISCIPLINA_SKIP = ["s02", "s03", "s04", "s09", "s06"]; // ya están como diarios / separados en dos
  var HABIT_PILLAR = { salud: "fisico", mente: "mental", espiritualidad: "espiritual", relaciones: "social", productividad: "marca", finanzas: "marca" };
  var norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  // Completa sub-metas y acciones que falten (métodos migrados o de otra versión).
  var fixHarada = (m) => {
    const subs = (m.subs || []).slice(0, 8);
    while (subs.length < 8) subs.push({ id: uid(), text: "", actions: [] });
    return { ...m, subs: subs.map((s) => { const actions = (s.actions || []).slice(0, 8); while (actions.length < 8) actions.push({ id: uid(), text: "", done: false }); return { ...s, actions }; }) };
  };
  var emptyHarada = (pillar, name) => ({ id: uid(), pillar, name: name || "Nuevo m\xE9todo", archived: false, createdAt: Date.now(), goal: "", subs: Array.from({ length: 8 }, (_, i) => ({ id: uid(), text: "", actions: Array.from({ length: 8 }, () => ({ id: uid(), text: "", done: false })) })) });

  function buildPilares(habits, logs, disciplina) {
    const objectives = SEED.map(([pillar, period, id, text, target], i) => ({ id, pillar, period, text, target: target || 0, order: i, createdAt: Date.now() }));
    const progress = {};
    const put = (pk, id, v) => { if (v === void 0 || v === null || v === false || v === 0) return; (progress[pk] = progress[pk] || {})[id] = v; };
    // Disciplina: historial de los equivalentes + objetivos propios que no estaban en la lista.
    const checks = disciplina && disciplina.checks || {};
    for (const period of ["semanal", "mensual"]) {
      for (const x of disciplina && disciplina[period] || []) {
        if (x.parent || DISCIPLINA_SKIP.includes(x.id)) continue;
        let id = DISCIPLINA_MAP[x.id];
        if (!id) {
          id = "dis-" + x.id;
          objectives.push({ id, pillar: classifyPillar(x.text) || "mental", period, text: x.text, target: x.target > 1 ? x.target : 0, order: objectives.length, createdAt: Date.now(), from: "disciplina" });
        }
        for (const [pk, vals] of Object.entries(checks)) if (vals && x.id in vals) put(pk, id, vals[x.id]);
      }
    }
    // Hábitos: pasan a objetivos diarios de su pilar, con todo su historial.
    for (const hb of habits || []) {
      const same = objectives.find((o) => o.period === "diario" && norm(o.text) === norm(hb.name));
      const id = same ? same.id : "hab-" + hb.id;
      if (!same) objectives.push({ id, pillar: HABIT_PILLAR[hb.category] || classifyPillar(hb.name) || "mental", period: "diario", text: hb.name, target: 0, order: objectives.length, createdAt: Date.now(), from: "habito" });
      for (const [day, vals] of Object.entries(logs || {})) if (vals && vals[hb.id]) put(day, id, true);
    }
    // Harada existente: pasa a ser el primer método de su pilar.
    const harada = [];
    const old = disciplina && disciplina.harada;
    if (old && (old.goal || (old.pillars || []).some((p) => p.text))) {
      const m = emptyHarada(classifyPillar(old.goal) || "marca", old.goal ? old.goal.slice(0, 40) : "Mi m\xE9todo");
      m.goal = old.goal || "";
      m.subs = (old.pillars || []).slice(0, 8).map((p) => ({ id: uid(), text: p.text || "", actions: (p.actions || []).slice(0, 8).map((a) => ({ id: uid(), text: a.text || "", done: Boolean(a.done) })) }));
      // Ids fijos: si dos dispositivos migran a la vez, la nube los une sin duplicar.
      const fixed = fixHarada(m);
      harada.push({ ...fixed, id: "harada-migrado", subs: fixed.subs.map((s, i) => ({ ...s, id: `hm-s${i}`, actions: s.actions.map((a, j) => ({ ...a, id: `hm-s${i}a${j}` })) })) });
    }
    return { version: 1, createdAt: Date.now(), objectives, progress, harada, notify: { enabled: false, times: ["12:00", "18:00", "21:00"], pillars: Object.fromEntries(PILLARS.map((p) => [p.id, true])), weekly: true } };
  }

  // ── Estado de pilares (hook usado por App) ───────────────────────────────────
  function usePilares({ loading, habits, logs, disciplina, notes, persistNotes }) {
    const [data, setData] = useState(null);
    const [recOpen, setRecOpen] = useState(false);
    useEffect(() => {
      if (loading || data) return;
      (async () => {
        const saved = await getItem("pilares", null);
        if (saved && saved.version) setData(saved);
        else { const built = buildPilares(habits, logs, disciplina); setData(built); setItem("pilares", built); }
      })();
    }, [loading]);
    // Si otro dispositivo cambió "pilares", la app se recarga desde el módulo de sincronización.
    const save = (next) => { setData(next); setItem("pilares", next); };
    const api = {
      data, recOpen, setRecOpen, notes, persistNotes,
      setValue(objId, period, v, d) {
        const pk = pkey(period, d || /* @__PURE__ */ new Date());
        const cur = data.progress[pk] || {};
        const nextPk = { ...cur };
        if (!v) delete nextPk[objId]; else nextPk[objId] = v;
        save({ ...data, progress: { ...data.progress, [pk]: nextPk } });
      },
      value(objId, period, d) { const pk = pkey(period, d || /* @__PURE__ */ new Date()); return (data.progress[pk] || {})[objId]; },
      saveObjective(o) {
        const exists = data.objectives.some((x) => x.id === o.id);
        save({ ...data, objectives: exists ? data.objectives.map((x) => x.id === o.id ? o : x) : [...data.objectives, { ...o, id: o.id || uid(), order: Date.now(), createdAt: Date.now() }] });
      },
      addObjective(pillar, period, text, target) { api.saveObjective({ pillar, period, text, target: Number(target) || 0 }); },
      deleteObjective(id) { save({ ...data, objectives: data.objectives.filter((x) => x.id !== id) }); },
      move(id, dir) {
        const o = data.objectives.find((x) => x.id === id);
        const list = data.objectives.filter((x) => x.pillar === o.pillar && x.period === o.period).sort((a, b) => a.order - b.order);
        const i = list.findIndex((x) => x.id === id), j = i + dir;
        if (j < 0 || j >= list.length) return;
        const a = list[i], b = list[j];
        save({ ...data, objectives: data.objectives.map((x) => x.id === a.id ? { ...x, order: b.order } : x.id === b.id ? { ...x, order: a.order } : x) });
      },
      saveHarada(m) { const ex = data.harada.some((x) => x.id === m.id); save({ ...data, harada: ex ? data.harada.map((x) => x.id === m.id ? m : x) : [...data.harada, m] }); },
      deleteHarada(id) { save({ ...data, harada: data.harada.filter((x) => x.id !== id) }); },
      setNotify(n) { save({ ...data, notify: { ...data.notify, ...n } }); },
      // Guarda varias notas de una vez (una nota dividida en pilares, o una nota de voz).
      addNotes(items) {
        const at = Date.now();
        const list = items.map((x, i) => ({ id: uid(), text: x.text.trim(), createdAt: new Date(at - i).toISOString(), pillar: x.pillar === void 0 ? classifyPillar(x.text) : x.pillar, ...(x.extra || {}) }));
        persistNotes([...list, ...(notes || [])]);
        return list;
      },
      addNote(text, pillar, extra) { return api.addNotes([{ text, pillar, extra }])[0]; },
      updateNote(id, patch) { persistNotes((notes || []).map((n) => n.id === id ? { ...n, ...patch, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : n)); },
      deleteNote(id) { const n = (notes || []).find((x) => x.id === id); if (n && n.audioId) AudioDB.del(n.audioId); persistNotes((notes || []).filter((x) => x.id !== id)); }
    };
    return api;
  }

  // Objetivos de un pilar y período, ordenados: pendientes primero, cumplidos al final.
  function listFor(pil, pillar, period, d) {
    return pil.data.objectives.filter((o) => o.pillar === pillar && o.period === period).sort((a, b) => a.order - b.order)
      .map((o) => ({ o, v: pil.value(o.id, period, d), done: objDone(o, pil.value(o.id, period, d)) }))
      .sort((a, b) => Number(a.done) - Number(b.done));
  }
  function pillarDay(pil, pillar, d) {
    const list = listFor(pil, pillar, "diario", d);
    return { total: list.length, done: list.filter((x) => x.done).length };
  }
  function pillarStats(pil, pillar) {
    const now = /* @__PURE__ */ new Date();
    const daily = pil.data.objectives.filter((o) => o.pillar === pillar && o.period === "diario");
    const pctDays = (from, to) => {
      if (!daily.length) return null;
      let done = 0, total = 0;
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const vals = pil.data.progress[fmtDate(d)] || {};
        total += daily.length; done += daily.filter((o) => objDone(o, vals[o.id])).length;
      }
      return total ? Math.round(done / total * 100) : 0;
    };
    let streak = 0;
    if (daily.length) {
      const d = new Date(now);
      if (pillarDay(pil, pillar, d).done < daily.length) d.setDate(d.getDate() - 1);
      while (streak < 999) {
        const vals = pil.data.progress[fmtDate(d)] || {};
        if (!daily.every((o) => objDone(o, vals[o.id]))) break;
        streak++; d.setDate(d.getDate() - 1);
      }
    }
    const pctPeriod = (period) => {
      const list = listFor(pil, pillar, period, now);
      return list.length ? Math.round(list.filter((x) => x.done).length / list.length * 100) : null;
    };
    return {
      streak,
      weekDaily: pctDays(weekStart(now), now),
      monthDaily: pctDays(new Date(now.getFullYear(), now.getMonth(), 1), now),
      week: pctPeriod("semanal"),
      month: pctPeriod("mensual")
    };
  }

  // ── Piezas visuales ──────────────────────────────────────────────────────────
  var PLabel = { fontFamily: FONT_BODY, fontSize: 11, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: C.textMuted };
  function PIcon({ pillar, size, color }) {
    const p = pillarById(pillar);
    return React.createElement("svg", { viewBox: "0 0 24 24", width: size || 20, height: size || 20, fill: "none", stroke: color || (p ? p.color : C.textMuted), strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", style: { flex: "none" } }, React.createElement("path", { d: p ? p.icon : "M12 12h.01" }));
  }
  function PillarChip({ pillar, onChange }) {
    const h = React.createElement;
    const p = pillarById(pillar);
    const style = { fontFamily: FONT_BODY, fontSize: 11, padding: "3px 8px 3px 6px", borderRadius: 99, border: `1px solid ${p ? withAlpha(p.color, 0.5) : C.border}`, color: p ? p.color : C.textFaint, background: p ? withAlpha(p.color, 0.1) : "transparent", display: "inline-flex", alignItems: "center", gap: 4 };
    if (!onChange) return h("span", { style }, p && h(PIcon, { pillar, size: 12 }), p ? p.name : "Sin pilar");
    return h("label", { style: { ...style, position: "relative", cursor: "pointer" } }, p && h(PIcon, { pillar, size: 12 }), p ? p.name : "Sin pilar", " ▾",
      h("select", { value: pillar || "", onChange: (e) => onChange(e.target.value || null), style: { position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }, "aria-label": "Cambiar pilar" },
        h("option", { value: "" }, "Sin pilar"), PILLARS.map((x) => h("option", { key: x.id, value: x.id }, x.name))));
  }
  var pBtn = (extra) => ({ fontFamily: FONT_BODY, fontSize: 13, color: C.textMuted, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", ...extra });
  var pInput = { fontFamily: FONT_BODY, background: C.card2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 12, padding: "12px 14px", fontSize: 15, outline: "none", width: "100%" };
  var pCard = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16 };

  // ── Objetivos con tilde / contador ───────────────────────────────────────────
  function ObjectiveRow({ pil, item, period }) {
    const h = React.createElement;
    const { o, v, done } = item;
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(o.text);
    const [target, setTarget] = useState(o.target ? String(o.target) : "");
    const count = Number(v) || 0;
    const tap = () => {
      if (o.target > 1) pil.setValue(o.id, period, count >= o.target ? 0 : count + 1);
      else pil.setValue(o.id, period, done ? 0 : true);
    };
    if (editing) {
      return h("div", { style: { ...pCard, padding: 12, display: "grid", gap: 8 } },
        h("input", { value: text, onChange: (e) => setText(e.target.value), style: pInput, autoFocus: true }),
        h("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
          h("input", { value: target, onChange: (e) => setTarget(e.target.value.replace(/\D/g, "")), placeholder: "Meta (ej. 4)", inputMode: "numeric", style: { ...pInput, width: 120 } }),
          h("button", { type: "button", onClick: () => { pil.saveObjective({ ...o, text: text.trim() || o.text, target: Number(target) || 0 }); setEditing(false); }, style: pBtn({ background: C.gold, color: C.onAccent, border: "none" }) }, "Guardar"),
          h("button", { type: "button", onClick: () => setEditing(false), style: pBtn() }, "Cancelar"),
          h("button", { type: "button", onClick: () => { if (confirm("\xBFBorrar este objetivo?")) pil.deleteObjective(o.id); }, style: pBtn({ color: C.danger, marginLeft: "auto" }) }, "Borrar")),
        h("div", { style: { display: "flex", gap: 8 } },
          h("button", { type: "button", onClick: () => pil.move(o.id, -1), style: pBtn() }, "↑ Subir"),
          h("button", { type: "button", onClick: () => pil.move(o.id, 1), style: pBtn() }, "↓ Bajar")));
    }
    return h("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid ${C.borderSoft}` } },
      o.target > 1
        ? h("button", { type: "button", onClick: tap, onContextMenu: (e) => { e.preventDefault(); pil.setValue(o.id, period, Math.max(0, count - 1)); }, title: "Tocar para sumar 1 (mantener o clic derecho para restar)", style: { minWidth: 52, height: 34, borderRadius: 99, border: `1.5px solid ${done ? C.gold : C.textFaint}`, background: done ? C.gold : "transparent", color: done ? C.onAccent : C.text, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, flex: "none" } }, count, "/", o.target)
        : h("button", { type: "button", onClick: tap, "aria-label": done ? "Desmarcar" : "Marcar cumplido", style: { width: 26, height: 26, borderRadius: "50%", border: `1.5px solid ${done ? C.gold : C.textFaint}`, background: done ? C.gold : "transparent", color: C.onAccent, display: "grid", placeItems: "center", fontSize: 14, flex: "none" } }, done ? "✓" : ""),
      h("button", { type: "button", onClick: () => setEditing(true), style: { flex: 1, textAlign: "left", fontFamily: FONT_BODY, fontSize: 15, color: done ? C.textFaint : C.text, textDecoration: done ? "line-through" : "none", background: "transparent" } }, o.text),
      o.target > 1 && !done && h("button", { type: "button", onClick: tap, style: { ...pBtn({ padding: "6px 10px" }), flex: "none" } }, "+1"));
  }
  function ObjectiveList({ pil, pillar, period }) {
    const h = React.createElement;
    const [text, setText] = useState("");
    const [target, setTarget] = useState("");
    const list = listFor(pil, pillar, period);
    const done = list.filter((x) => x.done).length;
    const add = () => { if (!text.trim()) return; pil.addObjective(pillar, period, text.trim(), target); setText(""); setTarget(""); };
    const label = period === "diario" ? "hoy" : period === "semanal" ? "esta semana" : "este mes";
    return h("div", null,
      h("p", { style: { ...PLabel, marginBottom: 6 } }, done, "/", list.length, " cumplidos ", label),
      h("div", { style: { ...pCard, padding: "4px 14px" } },
        list.length ? list.map((x) => h(ObjectiveRow, { key: x.o.id + pkey(period, /* @__PURE__ */ new Date()), pil, item: x, period })) : h("p", { style: { color: C.textFaint, fontSize: 14, padding: "14px 0" } }, "Sin objetivos todav\xEDa.")),
      h("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
        h("input", { value: text, onChange: (e) => setText(e.target.value), onKeyDown: (e) => e.key === "Enter" && add(), placeholder: "Nuevo objetivo…", style: pInput }),
        h("input", { value: target, onChange: (e) => setTarget(e.target.value.replace(/\D/g, "")), placeholder: "Meta", inputMode: "numeric", title: "Opcional: cantidad (ej. 4 para “4 veces”)", style: { ...pInput, width: 76 } }),
        h("button", { type: "button", onClick: add, style: pBtn({ background: C.gold, color: C.onAccent, border: "none", padding: "0 16px", fontSize: 20 }) }, "+")),
      h("p", { style: { color: C.textFaint, fontSize: 12, marginTop: 8 } }, period === "diario" ? "Se reinician cada d\xEDa a las 00:00." : period === "semanal" ? "Se reinician cada lunes." : "Se reinician el d\xEDa 1 de cada mes.", " Toc\xE1 el texto para editar, borrar o reordenar."));
  }

  // ── Pantalla de un pilar ─────────────────────────────────────────────────────
  var PILLAR_EXTRAS = { fisico: [["entreno", "Entreno"], ["nutricion", "Nutrici\xF3n"]], espiritual: [["ritual", "Ritual"]], marca: [["finanzas", "Finanzas"]], mental: [["inicio", "H\xE1bitos"]] };
  function PillarView({ pil, pillar, setTab }) {
    const h = React.createElement;
    const p = pillarById(pillar);
    const [sub, setSub] = useState("diario");
    const st = pillarStats(pil, pillar);
    const tabs = [...PERIODOS, ["harada", "Harada"]];
    const stat = (label, val) => h("div", { style: { ...pCard, padding: "8px 8px", minWidth: 0 } }, h("div", { style: { fontSize: 18, fontWeight: 300, color: C.text } }, val === null ? "—" : val), h("div", { style: { fontSize: 10, color: C.textMuted, lineHeight: 1.2 } }, label));
    return h("div", { className: "pb-6" },
      h("button", { type: "button", onClick: () => setTab("home"), style: { color: C.textMuted, fontSize: 13, background: "transparent", marginBottom: 10 } }, "← Inicio"),
      h("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 } },
        h("div", { style: { width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: withAlpha(p.color, 0.14), border: `1px solid ${withAlpha(p.color, 0.4)}` } }, h(PIcon, { pillar, size: 24 })),
        h("div", null, h("p", { style: PLabel }, "Pilar"), h("h1", { style: { fontFamily: FONT_DISPLAY, fontWeight: 300, fontSize: 28, color: C.text, lineHeight: 1.1 } }, p.name))),
      h("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6, marginBottom: 14 } },
        stat("racha (d\xEDas)", st.streak), stat("diarios sem.", st.weekDaily === null ? null : st.weekDaily + "%"), stat("semanales", st.week === null ? null : st.week + "%"), stat("mensuales", st.month === null ? null : st.month + "%")),
      (PILLAR_EXTRAS[pillar] || []).length > 0 && h("div", { style: { display: "flex", gap: 8, marginBottom: 14 } }, PILLAR_EXTRAS[pillar].map(([v, l]) => h("button", { key: v, type: "button", onClick: () => setTab(v), style: pBtn({ fontSize: 12 }) }, l, " →"))),
      h("div", { className: "rb-noscroll", style: { display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", position: "sticky", top: 0, zIndex: 5, background: C.bg, padding: "6px 0" } }, tabs.map(([v, l]) => h("button", {
        key: v, type: "button", onClick: () => setSub(v),
        style: { fontFamily: FONT_BODY, fontSize: 14, padding: "9px 16px", borderRadius: 99, whiteSpace: "nowrap", color: sub === v ? C.text : C.textMuted, background: sub === v ? withAlpha(p.color, 0.2) : "transparent", border: `1px solid ${sub === v ? withAlpha(p.color, 0.6) : C.border}` }
      }, l))),
      sub === "harada" ? h(HaradaList, { pil, pillar }) : h(ObjectiveList, { pil, pillar, period: sub }),
      h(PillarNotes, { pil, pillar }));
  }
  function PillarNotes({ pil, pillar }) {
    const h = React.createElement;
    const list = (pil.notes || []).filter((n) => notePillar(n) === pillar).slice(0, 5);
    if (!list.length) return null;
    return h("div", { style: { marginTop: 22 } }, h("p", { style: { ...PLabel, marginBottom: 8 } }, "Notas de este pilar"), list.map((n) => h(NoteItem, { key: n.id, pil, note: n })));
  }

  // ── Notas ────────────────────────────────────────────────────────────────────
  function NoteAudio({ id, onDelete }) {
    const h = React.createElement;
    const [url, setUrl] = useState(null);
    const [missing, setMissing] = useState(false);
    useEffect(() => { let u; AudioDB.get(id).then((b) => { if (b) { u = URL.createObjectURL(b); setUrl(u); } else setMissing(true); }); return () => u && URL.revokeObjectURL(u); }, [id]);
    if (missing) return h("p", { style: { fontSize: 11, color: C.textFaint } }, "\u{1F3A7} Audio guardado en otro dispositivo");
    if (!url) return null;
    return h("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 6 } }, h("audio", { src: url, controls: true, style: { height: 32, maxWidth: "100%" } }), h("button", { type: "button", onClick: onDelete, style: { fontSize: 11, color: C.textFaint, background: "transparent" } }, "Borrar audio"));
  }
  function NoteItem({ pil, note }) {
    const h = React.createElement;
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(note.text);
    const [toGoal, setToGoal] = useState(false);
    const time = new Date(note.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    note = { ...note, pillar: notePillar(note) };
    return h("div", { style: { ...pCard, padding: 12, marginBottom: 8 } },
      h("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" } },
        h(PillarChip, { pillar: note.pillar, onChange: (v) => pil.updateNote(note.id, { pillar: v, pillarManual: true }) }),
        note.audioId && h("span", { style: { fontSize: 11, color: C.textFaint } }, "\u{1F399} voz"),
        h("span", { style: { fontSize: 11, color: C.textFaint, marginLeft: "auto" } }, time)),
      editing
        ? h("div", { style: { display: "grid", gap: 8 } },
          h("textarea", { value: text, onChange: (e) => setText(e.target.value), rows: 3, style: pInput, autoFocus: true }),
          h("div", { style: { display: "flex", gap: 8 } },
            h("button", { type: "button", onClick: () => { pil.updateNote(note.id, { text: text.trim() || note.text }); setEditing(false); }, style: pBtn({ background: C.gold, color: C.onAccent, border: "none" }) }, "Guardar"),
            h("button", { type: "button", onClick: () => setEditing(false), style: pBtn() }, "Cancelar")))
        : h("p", { style: { color: C.text, fontSize: 15, whiteSpace: "pre-wrap" } }, note.text),
      note.audioId && h(NoteAudio, { id: note.audioId, onDelete: () => { AudioDB.del(note.audioId); pil.updateNote(note.id, { audioId: null }); } }),
      !editing && h("div", { style: { display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" } },
        h("button", { type: "button", onClick: () => setEditing(true), style: pBtn({ fontSize: 12, padding: "5px 10px" }) }, "Editar"),
        h("button", { type: "button", onClick: () => setToGoal(!toGoal), style: pBtn({ fontSize: 12, padding: "5px 10px" }) }, "→ Objetivo"),
        h("button", { type: "button", onClick: () => { if (confirm("\xBFBorrar esta nota?")) pil.deleteNote(note.id); }, style: pBtn({ fontSize: 12, padding: "5px 10px", color: C.danger }) }, "Borrar")),
      toGoal && h("div", { style: { display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" } },
        h("span", { style: { fontSize: 12, color: C.textMuted } }, note.pillar ? `Crear en ${pillarById(note.pillar).name} como:` : "Primero eleg\xED un pilar."),
        note.pillar && PERIODOS.map(([v, l]) => h("button", { key: v, type: "button", onClick: () => { pil.addObjective(note.pillar, v, note.text, 0); setToGoal(false); alert(`Listo: objetivo ${l.toLowerCase()} creado en ${pillarById(note.pillar).name}.`); }, style: pBtn({ fontSize: 12, padding: "5px 10px", color: C.text }) }, l))));
  }
  function groupByDate(notes) {
    const out = [];
    const today = fmtDate(/* @__PURE__ */ new Date()), ayer = fmtDate(new Date(Date.now() - 864e5));
    for (const n of notes) {
      const k = fmtDate(new Date(n.createdAt));
      const label = k === today ? "Hoy" : k === ayer ? "Ayer" : new Date(n.createdAt).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
      if (!out.length || out[out.length - 1].k !== k) out.push({ k, label, items: [] });
      out[out.length - 1].items.push(n);
    }
    return out;
  }
  function QuickNote({ pil, big }) {
    const h = React.createElement;
    const [text, setText] = useState("");
    const save = () => {
      if (!text.trim()) return;
      const parts = splitByPillar(text);
      pil.addNotes(parts);
      const g = detectGoal(text);
      if (g && g.text) {
        const pillar = classifyPillar(g.text) || parts[0].pillar;
        if (pillar && confirm(`\xBFCrear el objetivo ${g.period} “${g.text}” en ${pillarById(pillar).name}?`)) pil.addObjective(pillar, g.period, g.text, g.target);
      }
      setText("");
    };
    return h("div", { style: { display: "flex", gap: 10, alignItems: "stretch" } },
      h("div", { style: { flex: 1, display: "flex", gap: 8 } },
        h("input", { value: text, onChange: (e) => setText(e.target.value), onKeyDown: (e) => e.key === "Enter" && save(), placeholder: "Escrib\xED una nota…", style: pInput }),
        h("button", { type: "button", onClick: save, disabled: !text.trim(), "aria-label": "Guardar nota", style: pBtn({ background: text.trim() ? C.gold : C.card2, color: text.trim() ? C.onAccent : C.textFaint, border: "none", padding: "0 14px", fontSize: 18 }) }, "✓")),
      h("button", { type: "button", onClick: () => pil.setRecOpen(true), "aria-label": "Grabar nota de voz", style: { width: big ? 58 : 48, height: big ? 58 : 48, borderRadius: "50%", background: C.gold, color: C.onAccent, display: "grid", placeItems: "center", flex: "none", boxShadow: `0 0 0 6px ${withAlpha(C.gold, 0.15)}` } },
        h("svg", { viewBox: "0 0 24 24", width: 24, height: 24, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" }, h("path", { d: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" }))));
  }
  function NotesPage({ pil }) {
    const h = React.createElement;
    const [q, setQ] = useState("");
    const [f, setF] = useState("todos");
    const nq = norm(q);
    const list = (pil.notes || []).filter((n) => (f === "todos" || (f === "none" ? !notePillar(n) : notePillar(n) === f)) && (!nq || norm(n.text).includes(nq)));
    const chip = (v, l) => h("button", { key: v, type: "button", onClick: () => setF(v), style: { fontFamily: FONT_BODY, fontSize: 12, padding: "6px 12px", borderRadius: 99, whiteSpace: "nowrap", color: f === v ? C.text : C.textMuted, background: f === v ? withAlpha(C.gold, 0.18) : "transparent", border: `1px solid ${f === v ? withAlpha(C.gold, 0.5) : C.border}` } }, l);
    return h("div", { className: "pb-6" },
      h("h1", { style: { fontFamily: FONT_DISPLAY, fontWeight: 300, fontSize: 28, color: C.text, marginBottom: 14 } }, "Notas"),
      h(QuickNote, { pil, big: true }),
      h("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Buscar en tus notas…", style: { ...pInput, marginTop: 14 } }),
      h("div", { className: "rb-noscroll", style: { display: "flex", gap: 6, overflowX: "auto", margin: "12px 0 16px" } }, chip("todos", "Todas"), PILLARS.map((p) => chip(p.id, p.name)), chip("none", "Sin pilar")),
      list.length === 0 ? h("p", { style: { color: C.textFaint } }, "No hay notas.") : groupByDate(list).map((g) => h("div", { key: g.k, style: { marginBottom: 14 } },
        h("p", { style: { ...PLabel, marginBottom: 8, textTransform: "uppercase" } }, g.label),
        g.items.map((n) => h(NoteItem, { key: n.id, pil, note: n })))));
  }

  // ── Whisper dentro del celular/compu (gratis, sin servidor) ──────────────────
  // La primera vez descarga el modelo (~80 MB) y queda guardado en el navegador.
  // Funciona igual en iPhone, Android y PC, aunque el navegador no tenga reconocimiento de voz.
  var WHISPER_LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";
  var WHISPER_MODEL = "onnx-community/whisper-base";
  var WhisperWeb = window.RumboWhisper = {
    pipe: null,
    loading: null,
    listeners: new Set(),
    progress: { status: "idle", pct: 0 },
    emit(p) { this.progress = { ...this.progress, ...p }; this.listeners.forEach((f) => f(this.progress)); },
    load() {
      if (this.pipe) return Promise.resolve(this.pipe);
      if (this.loading) return this.loading;
      this.emit({ status: "loading", pct: 0 });
      const files = {};
      this.loading = import(WHISPER_LIB).then(async ({ pipeline, env }) => {
        env.allowLocalModels = false;
        this.pipe = await pipeline("automatic-speech-recognition", WHISPER_MODEL, {
          dtype: "q8",
          device: "wasm",
          progress_callback: (p) => {
            if (p.status !== "progress" || !p.total) return;
            files[p.file] = [p.loaded, p.total];
            const all = Object.values(files), loaded = all.reduce((a, x) => a + x[0], 0), total = all.reduce((a, x) => a + x[1], 0);
            this.emit({ pct: Math.round(loaded / total * 100) });
          }
        });
        this.emit({ status: "ready", pct: 100 });
        return this.pipe;
      }).catch((e) => { this.loading = null; this.emit({ status: "error", error: String(e && e.message || e) }); throw e; });
      return this.loading;
    },
    // Audio grabado (webm, mp4/m4a de iPhone, etc.) → 16 kHz mono, como lo pide Whisper.
    async decode(blob) {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const ab = await blob.arrayBuffer();
      // Callback y no promesa: Safari viejo solo soporta la forma con callbacks.
      const buf = await new Promise((ok, fail) => ctx.decodeAudioData(ab, ok, fail));
      if (ctx.close) ctx.close();
      const off = new OfflineAudioContext(1, Math.max(1, Math.ceil(buf.duration * 16e3)), 16e3);
      const src = off.createBufferSource();
      src.buffer = buf; src.connect(off.destination); src.start();
      return (await off.startRendering()).getChannelData(0);
    },
    async transcribe(blob) {
      const pipe = await this.load();
      const audio = await this.decode(blob);
      this.emit({ status: "working" });
      const out = await pipe(audio, { language: "spanish", task: "transcribe", chunk_length_s: 30, stride_length_s: 5 });
      this.emit({ status: "ready" });
      return collapseRepeats((Array.isArray(out) ? out.map((o) => o.text).join(" ") : out.text) || "");
    }
  };
  // Whisper a veces repite la misma frase en loop: la dejamos una sola vez.
  // Además corrige palabras tuyas que el modelo chico suele escuchar mal.
  var VOICE_FIXES = [
    [/\bobjetivos? (?:en |e )?(?:manual|semana l|semanales?)\b/gi, "objetivo semanal"], [/\bobjetivos? (?:mens?ual|men sual)\b/gi, "objetivo mensual"], [/\bobjetivos? (?:diarios?|d[ií]a rio)\b/gi, "objetivo diario"],
    [/\bp[ei]l[aá]t[ie]s\b|\bpelatis\b|\bpilate\b/gi, "pilates"], [/\bla ?tesis\b|\blatesis\b|\bla tesi\b/gi, "la tesis"], [/\bentre no\b/gi, "entreno"],
    [/\bmaga\b|\bmagga\b|\bmaja\b/gi, "Maga"], [/\byim\b|\bjim\b|\bgim\b/gi, "gym"], [/\bpodcas\b|\bpodkast\b/gi, "podcast"], [/\binstagra\b/gi, "Instagram"]
  ];
  function collapseRepeats(text) {
    let t = text.replace(/\s+/g, " ").trim();
    for (let n = 1; n <= 20; n++) t = t.replace(new RegExp(`((?:\\S+\\s+){${n - 1}}\\S+?)(?:[\\s,.]+\\1){2,}`, "gi"), "$1");
    for (const [re, to] of VOICE_FIXES) t = t.replace(re, to);
    return t.replace(/^\[.*?\]$/, "").trim();
  }
  // iPhone/iPad: el reconocimiento del navegador es poco confiable, sobre todo con la app instalada.
  var IS_IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function useWhisperProgress() {
    const [p, setP] = useState(WhisperWeb.progress);
    useEffect(() => { WhisperWeb.listeners.add(setP); return () => WhisperWeb.listeners.delete(setP); }, []);
    return p;
  }

  // ── Grabador de notas de voz ────────────────────────────────────────────────
  function VoiceRecorder({ pil, onClose }) {
    const h = React.createElement;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const [phase, setPhase] = useState("idle"); // idle | rec | review
    const [live, setLive] = useState("");
    const [text, setText] = useState("");
    const [parts, setParts] = useState([]);
    const [goal, setGoal] = useState(null);
    const [blob, setBlob] = useState(null);
    const [secs, setSecs] = useState(0);
    const [err, setErr] = useState("");
    const [asr, setAsr] = useState("idle"); // idle | working | done | error
    const [edited, setEdited] = useState(false);
    const wp = useWhisperProgress();
    const r = React.useRef({});
    const holdTimer = React.useRef(null);
    // Precarga Whisper al abrir el grabador: cuando termines de hablar ya está listo.
    // Solo donde hace falta (iPhone o navegadores sin reconocimiento), para no descargar 80 MB de más.
    useEffect(() => { if (IS_IOS || !SR) WhisperWeb.load().catch(() => {}); }, []);
    // Al terminar: si el navegador ya entendió (Android/Chrome/PC), se usa eso, que es más preciso.
    // Si no entendió nada (lo normal en iPhone), Whisper transcribe el audio en el dispositivo.
    useEffect(() => {
      if (!blob || !blob.size) return;
      if (!IS_IOS && ((r.current.finalText || "").trim() || (r.current.liveText || "").trim())) { setAsr("done"); return; }
      let alive = true;
      setAsr("working");
      WhisperWeb.transcribe(blob).then((t) => {
        if (!alive) return;
        setAsr("done");
        if (t && !r.current.edited) { setText(t); analyze(t); }
      }).catch(() => alive && setAsr("error"));
      return () => { alive = false; };
    }, [blob]);
    const start = async () => {
      setErr(""); setLive(""); setSecs(0); setEdited(false); setAsr("idle"); setBlob(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || "";
        const mr = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : void 0);
        const chunks = [];
        mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
        mr.onstop = () => { stream.getTracks().forEach((t) => t.stop()); setBlob(new Blob(chunks, { type: mr.mimeType || "audio/webm" })); };
        mr.start();
        r.current = { mr, finalText: "" };
        if (SR) {
          const rec = new SR();
          rec.lang = "es-AR"; rec.continuous = true; rec.interimResults = true;
          rec.onresult = (ev) => {
            let fin = "", tmp = "";
            for (let i = 0; i < ev.results.length; i++) (ev.results[i].isFinal ? (fin += ev.results[i][0].transcript + " ") : (tmp += ev.results[i][0].transcript));
            r.current.finalText = fin; r.current.liveText = (fin + tmp).trim(); setLive(r.current.liveText);
          };
          rec.onerror = () => {};
          rec.onend = () => { if (r.current.recording) { try { rec.start(); } catch (e) {} } };
          r.current.rec = rec; r.current.recording = true;
          try { rec.start(); } catch (e) {}
        }
        r.current.tick = setInterval(() => setSecs((s) => s + 1), 1000);
        setPhase("rec");
      } catch (e) {
        setErr("No pude usar el micr\xF3fono. Revis\xE1 el permiso del navegador.");
      }
    };
    const stop = () => {
      const c = r.current;
      if (!c.mr) return;
      c.recording = false;
      clearInterval(c.tick);
      try { c.rec && c.rec.stop(); } catch (e) {}
      try { c.mr.state !== "inactive" && c.mr.stop(); } catch (e) {}
      setTimeout(() => {
        // Mientras Whisper trabaja, se muestra lo que entendió el navegador (si pudo).
        const t = (c.finalText || "").trim() || (c.liveText || "").trim();
        setText(t); analyze(t); setPhase("review");
      }, 300);
    };
    const analyze = (t) => { setParts(splitByPillar(t)); const g = detectGoal(t); setGoal(g && g.text ? { ...g, pillar: classifyPillar(g.text) || (splitByPillar(t)[0] || {}).pillar || null, create: true } : null); };
    // Mantener apretado = grabar mientras se sostiene; un toque = empezar / terminar.
    const onDown = () => { if (phase !== "idle") return; holdTimer.current = setTimeout(() => (holdTimer.current = "hold"), 450); start(); };
    const onUp = () => { if (holdTimer.current === "hold") { holdTimer.current = null; stop(); } else { clearTimeout(holdTimer.current); holdTimer.current = null; } };
    const onClick = () => { if (phase === "rec" && holdTimer.current === null) stop(); };
    const saveAll = async () => {
      const list = parts.filter((p) => p.text.trim());
      if (!list.length && !blob) return onClose();
      let audioId = null;
      if (blob && blob.size) { audioId = uid(); try { await AudioDB.put(audioId, blob); } catch (e) { audioId = null; } }
      pil.addNotes((list.length ? list : [{ text: "(nota de voz)", pillar: null }]).map((p, i) => ({ text: p.text, pillar: p.pillar, extra: { audioId: i === 0 ? audioId : null, voice: true } })));
      if (goal && goal.create && goal.pillar && goal.text) pil.addObjective(goal.pillar, goal.period, goal.text, goal.target);
      onClose();
    };
    useEffect(() => () => { const c = r.current; c.recording = false; clearInterval(c.tick); try { c.rec && c.rec.abort(); } catch (e) {} try { c.mr && c.mr.state !== "inactive" && c.mr.stop(); } catch (e) {} }, []);
    const mm = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
    return h("div", { style: { position: "fixed", inset: 0, zIndex: 60, background: "rgba(5,6,8,0.88)", display: "flex", alignItems: "flex-end", justifyContent: "center" }, onClick: (e) => e.target === e.currentTarget && phase !== "rec" && onClose() },
      h("div", { style: { ...pCard, width: "100%", maxWidth: 560, borderRadius: "22px 22px 0 0", padding: "22px 18px calc(22px + env(safe-area-inset-bottom))", maxHeight: "92vh", overflowY: "auto" } },
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, h("p", { style: PLabel }, "Nota de voz"), phase !== "rec" && h("button", { type: "button", onClick: onClose, style: { color: C.textMuted, fontSize: 22, background: "transparent" } }, "\xD7")),
        phase !== "review" && h("div", { style: { display: "grid", justifyItems: "center", gap: 14, padding: "10px 0 6px" } },
          h("p", { style: { color: C.text, minHeight: 48, textAlign: "center", fontSize: 15 } }, phase === "rec" ? live || (SR ? "Te escucho…" : "Grabando…") : "Toc\xE1 para empezar, o manten\xE9 apretado mientras habl\xE1s."),
          h("button", {
            type: "button", onPointerDown: onDown, onPointerUp: onUp, onPointerLeave: onUp, onClick,
            style: { width: 96, height: 96, borderRadius: "50%", background: phase === "rec" ? C.danger : C.gold, color: "#fff", display: "grid", placeItems: "center", boxShadow: `0 0 0 ${phase === "rec" ? 14 : 8}px ${withAlpha(phase === "rec" ? C.danger : C.gold, 0.2)}`, transition: "all .2s", touchAction: "none" }
          }, h("svg", { viewBox: "0 0 24 24", width: 38, height: 38, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" }, h("path", { d: phase === "rec" ? "M8 8h8v8H8z" : "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" }))),
          h("p", { style: { color: C.textMuted, fontSize: 13 } }, phase === "rec" ? `${mm} \xB7 toc\xE1 para terminar` : ""),
          wp.status === "loading" && h("p", { style: { color: C.textFaint, fontSize: 12, textAlign: "center" } }, `Preparando el reconocimiento de voz (solo la primera vez): ${wp.pct || 0}%. Ya pod\xE9s grabar.`),
          err && h("p", { style: { color: C.danger, fontSize: 13 } }, err)),
        phase === "review" && h("div", { style: { display: "grid", gap: 12 } },
          h("p", { style: { ...PLabel, letterSpacing: "0.18em" } }, "Texto (pod\xE9s corregirlo)"),
          asr === "working" && h("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textMuted, ...pCard, padding: "10px 12px", background: withAlpha(C.gold, 0.1) } },
            h("span", { style: { width: 10, height: 10, borderRadius: "50%", background: C.gold, animation: "rbpulse 1s infinite" } }),
            wp.status === "loading" ? `Descargando el reconocimiento de voz: ${wp.pct || 0}% (solo la primera vez)` : "Pasando tu audio a texto…"),
          asr === "error" && h("p", { style: { fontSize: 12, color: C.danger } }, "No pude transcribir el audio en este dispositivo. Escrib\xED el texto; el audio igual se guarda."),
          h("textarea", { value: text, onChange: (e) => { r.current.edited = true; setEdited(true); setText(e.target.value); analyze(e.target.value); }, rows: 4, placeholder: asr === "working" ? "Esper\xE1 un momento…" : "Escrib\xED lo que dijiste…", style: pInput }),
          parts.length > 0 && h("div", null, h("p", { style: { ...PLabel, letterSpacing: "0.18em", marginBottom: 6 } }, parts.length > 1 ? `Se guarda como ${parts.length} notas` : "Se guarda en"),
            parts.map((p, i) => h("div", { key: i, style: { display: "flex", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.borderSoft}` } },
              h(PillarChip, { pillar: p.pillar, onChange: (v) => setParts(parts.map((x, k) => k === i ? { ...x, pillar: v } : x)) }),
              h("span", { style: { color: C.text, fontSize: 14, flex: 1 } }, p.text)))),
          goal && h("label", { style: { display: "flex", gap: 10, alignItems: "flex-start", ...pCard, padding: 12, background: withAlpha(C.gold, 0.1) } },
            h("input", { type: "checkbox", checked: goal.create, onChange: (e) => setGoal({ ...goal, create: e.target.checked }), style: { marginTop: 3 } }),
            h("span", { style: { fontSize: 14, color: C.text } }, `Crear objetivo ${goal.period}: “${goal.text}”`, goal.target > 1 ? ` (meta ${goal.target})` : "", " en ", h(PillarChip, { pillar: goal.pillar, onChange: (v) => setGoal({ ...goal, pillar: v }) }))),
          blob && h("p", { style: { fontSize: 12, color: C.textFaint } }, "\u{1F399} El audio queda guardado con la nota (en este dispositivo)."),
          h("div", { style: { display: "flex", gap: 8 } },
            h("button", { type: "button", onClick: saveAll, disabled: asr === "working" && !text.trim(), style: pBtn({ background: C.gold, color: C.onAccent, border: "none", flex: 1, padding: "12px", opacity: asr === "working" && !text.trim() ? 0.5 : 1 }) }, asr === "working" ? "Guardar (transcribiendo…)" : "Guardar"),
            h("button", { type: "button", onClick: () => { r.current.edited = false; setPhase("idle"); setText(""); setParts([]); setBlob(null); setGoal(null); setAsr("idle"); }, style: pBtn() }, "Regrabar")))));
  }

  // ── Métodos Harada ───────────────────────────────────────────────────────────
  function HaradaList({ pil, pillar }) {
    const h = React.createElement;
    const [open, setOpen] = useState(null);
    const [showArchived, setShowArchived] = useState(false);
    const all = pil.data.harada.filter((m) => m.pillar === pillar);
    const list = all.filter((m) => Boolean(m.archived) === showArchived);
    const current = open && pil.data.harada.find((m) => m.id === open);
    if (current) return h(HaradaEditor, { pil, method: current, onBack: () => setOpen(null) });
    const pct = (m) => { const acts = m.subs.flatMap((s) => s.actions).filter((a) => a.text); return acts.length ? Math.round(acts.filter((a) => a.done).length / acts.length * 100) : 0; };
    return h("div", null,
      h("p", { style: { color: C.textMuted, fontSize: 13, marginBottom: 12 } }, "Una meta central, 8 sub-metas y 8 acciones por cada una (64 en total)."),
      list.map((m) => h("div", { key: m.id, style: { ...pCard, padding: 14, marginBottom: 10 } },
        h("button", { type: "button", onClick: () => setOpen(m.id), style: { textAlign: "left", width: "100%", background: "transparent" } },
          h("div", { style: { color: C.text, fontSize: 16 } }, m.name), h("div", { style: { color: C.textMuted, fontSize: 13, marginTop: 2 } }, m.goal || "Sin meta central", " \xB7 ", pct(m), "% hecho")),
        h("div", { style: { display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" } },
          h("button", { type: "button", onClick: () => { const n = prompt("Nuevo nombre:", m.name); if (n && n.trim()) pil.saveHarada({ ...m, name: n.trim() }); }, style: pBtn({ fontSize: 12, padding: "5px 10px" }) }, "Renombrar"),
          h("button", { type: "button", onClick: () => pil.saveHarada({ ...JSON.parse(JSON.stringify(m)), id: uid(), name: m.name + " (copia)", createdAt: Date.now() }), style: pBtn({ fontSize: 12, padding: "5px 10px" }) }, "Duplicar"),
          h("button", { type: "button", onClick: () => pil.saveHarada({ ...m, archived: !m.archived }), style: pBtn({ fontSize: 12, padding: "5px 10px" }) }, m.archived ? "Desarchivar" : "Archivar"),
          h("button", { type: "button", onClick: () => { if (confirm(`\xBFBorrar “${m.name}”? No se puede deshacer.`)) pil.deleteHarada(m.id); }, style: pBtn({ fontSize: 12, padding: "5px 10px", color: C.danger }) }, "Borrar")))),
      !list.length && h("p", { style: { color: C.textFaint, marginBottom: 12 } }, showArchived ? "No hay m\xE9todos archivados." : "Todav\xEDa no hay m\xE9todos en este pilar."),
      h("div", { style: { display: "flex", gap: 8 } },
        !showArchived && h("button", { type: "button", onClick: () => { const m = emptyHarada(pillar, prompt("Nombre del m\xE9todo:", "Mi m\xE9todo") || "Mi m\xE9todo"); pil.saveHarada(m); setOpen(m.id); }, style: pBtn({ background: C.gold, color: C.onAccent, border: "none" }) }, "+ Nuevo m\xE9todo"),
        all.some((m) => m.archived) && h("button", { type: "button", onClick: () => setShowArchived(!showArchived), style: pBtn() }, showArchived ? "Ver activos" : "Ver archivados")));
  }
  var GRID_POS = [0, 1, 2, 3, 5, 6, 7, 8]; // casillas alrededor del centro en un bloque 3x3
  function HaradaEditor({ pil, method, onBack }) {
    const h = React.createElement;
    const [m, setM] = useState(() => fixHarada(method));
    const [sel, setSel] = useState(0);
    const save = (next) => { setM(next); pil.saveHarada(next); };
    const setSub = (i, patch) => save({ ...m, subs: m.subs.map((s, k) => k === i ? { ...s, ...patch } : s) });
    const setAct = (i, j, patch) => setSub(i, { actions: m.subs[i].actions.map((a, k) => k === j ? { ...a, ...patch } : a) });
    const p = pillarById(m.pillar);
    // Grilla 9x9: bloque central = meta + 8 sub-metas; cada bloque de afuera = una sub-meta + sus 8 acciones.
    const cell = (txt, opts) => h("div", { onClick: opts.onClick, title: txt, style: { aspectRatio: "1", borderRadius: 4, padding: 2, fontSize: 7, lineHeight: 1.15, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", cursor: opts.onClick ? "pointer" : "default", background: opts.bg || C.card2, color: opts.color || C.textMuted, border: opts.ring ? `1.5px solid ${p.color}` : "1px solid transparent", textDecoration: opts.done ? "line-through" : "none" } }, txt);
    const block = (b) => {
      const isCenter = b === 4;
      const si = isCenter ? -1 : GRID_POS.indexOf(b);
      return h("div", { key: b, style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, padding: 2, borderRadius: 6, background: isCenter ? withAlpha(p.color, 0.12) : "transparent" } }, Array.from({ length: 9 }, (_, c) => {
        if (isCenter) {
          if (c === 4) return h(React.Fragment, { key: c }, cell(m.goal || "META", { bg: withAlpha(p.color, 0.45), color: C.text }));
          const k = GRID_POS.indexOf(c);
          return h(React.Fragment, { key: c }, cell(m.subs[k].text || String(k + 1), { bg: withAlpha(p.color, 0.2), color: C.text, onClick: () => setSel(k), ring: sel === k }));
        }
        if (c === 4) return h(React.Fragment, { key: c }, cell(m.subs[si].text || String(si + 1), { bg: withAlpha(p.color, 0.2), color: C.text, onClick: () => setSel(si), ring: sel === si }));
        const a = m.subs[si].actions[GRID_POS.indexOf(c)];
        return h(React.Fragment, { key: c }, cell(a.text, { bg: a.done ? withAlpha(p.color, 0.35) : C.card2, color: a.done ? C.text : C.textMuted, done: a.done, onClick: () => setSel(si) }));
      }));
    };
    const s = m.subs[sel];
    return h("div", null,
      h("button", { type: "button", onClick: onBack, style: { color: C.textMuted, fontSize: 13, background: "transparent", marginBottom: 8 } }, "← M\xE9todos"),
      h("input", { value: m.name, onChange: (e) => save({ ...m, name: e.target.value }), style: { ...pInput, fontSize: 18, marginBottom: 8 } }),
      h("p", { style: { ...PLabel, marginBottom: 4 } }, "Meta central"),
      h("textarea", { value: m.goal, onChange: (e) => save({ ...m, goal: e.target.value }), rows: 2, placeholder: "Ej.: Facturar 500K por mes con mi marca", style: { ...pInput, marginBottom: 12 } }),
      h("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3, maxWidth: 520, margin: "0 auto 14px" } }, Array.from({ length: 9 }, (_, b) => block(b))),
      h("div", { className: "rb-noscroll", style: { display: "flex", gap: 6, overflowX: "auto", marginBottom: 10 } }, m.subs.map((x, i) => h("button", { key: x.id, type: "button", onClick: () => setSel(i), style: { fontFamily: FONT_BODY, fontSize: 12, padding: "6px 12px", borderRadius: 99, whiteSpace: "nowrap", color: sel === i ? C.text : C.textMuted, background: sel === i ? withAlpha(p.color, 0.2) : "transparent", border: `1px solid ${sel === i ? withAlpha(p.color, 0.6) : C.border}` } }, i + 1, ". ", (x.text || "Sub-meta").slice(0, 18)))),
      h("div", { style: { ...pCard, padding: 12 } },
        h("p", { style: { ...PLabel, marginBottom: 4 } }, "Sub-meta ", sel + 1),
        h("input", { value: s.text, onChange: (e) => setSub(sel, { text: e.target.value }), placeholder: "Ej.: Contenido constante", style: { ...pInput, marginBottom: 10 } }),
        s.actions.map((a, j) => h("div", { key: a.id, style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 6 } },
          h("button", { type: "button", onClick: () => setAct(sel, j, { done: !a.done }), "aria-label": "Marcar acci\xF3n", style: { width: 24, height: 24, borderRadius: "50%", flex: "none", border: `1.5px solid ${a.done ? p.color : C.textFaint}`, background: a.done ? p.color : "transparent", color: "#fff", fontSize: 12 } }, a.done ? "✓" : ""),
          h("input", { value: a.text, onChange: (e) => setAct(sel, j, { text: e.target.value }), placeholder: `Acci\xF3n ${j + 1}`, style: { ...pInput, padding: "9px 12px", fontSize: 14, textDecoration: a.done ? "line-through" : "none" } }),
          a.text && h("select", { value: "", onChange: (e) => { if (e.target.value) { pil.addObjective(m.pillar, e.target.value, a.text, 0); alert(`Objetivo ${e.target.value} creado en ${p.name}.`); } }, title: "Convertir en objetivo", style: { ...pInput, width: 54, padding: "8px 4px", fontSize: 12 } },
            h("option", { value: "" }, "→"), h("option", { value: "diario" }, "Diario"), h("option", { value: "semanal" }, "Semanal"))))));
  }

  // ── Inicio: notas arriba + 6 pilares ─────────────────────────────────────────
  function PillarsHome({ pil, name, greeting, dateLabel, setTab }) {
    const h = React.createElement;
    const recent = (pil.notes || []).slice(0, 3);
    return h("div", { className: "pb-6" },
      h("p", { style: PLabel }, dateLabel),
      h("h1", { style: { fontFamily: FONT_DISPLAY, color: C.text, fontWeight: 300, fontSize: "clamp(24px, 5vw, 34px)", margin: "2px 0 16px" } }, greeting, ", ", h("strong", { style: { fontWeight: 600 } }, name)),
      h("section", { style: { ...pCard, padding: 16, marginBottom: 20 } },
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } }, h("p", { style: PLabel }, "Notas"), h("button", { type: "button", onClick: () => setTab("notas2"), style: { color: C.textMuted, fontSize: 12, background: "transparent" } }, "Ver todas →")),
        h(QuickNote, { pil, big: true }),
        recent.length > 0 && h("div", { style: { marginTop: 12 } }, recent.map((n) => h("div", { key: n.id, style: { display: "flex", gap: 8, alignItems: "center", padding: "8px 0", borderTop: `1px solid ${C.borderSoft}` } },
          h(PIcon, { pillar: notePillar(n), size: 16 }), h("span", { style: { color: C.text, fontSize: 14, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, n.text))))),
      h("p", { style: { ...PLabel, marginBottom: 10 } }, "Pilares"),
      h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 } }, PILLARS.map((p) => {
        const d = pillarDay(pil, p.id);
        const week = listFor(pil, p.id, "semanal");
        const useWeek = d.total === 0;
        const done = useWeek ? week.filter((x) => x.done).length : d.done, total = useWeek ? week.length : d.total;
        const pct = total ? done / total * 100 : 0;
        return h("button", { key: p.id, type: "button", onClick: () => setTab("p-" + p.id), style: { ...pCard, padding: 14, textAlign: "left", display: "grid", gap: 10, borderColor: withAlpha(p.color, 0.35) } },
          h("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, h(PIcon, { pillar: p.id, size: 22 }), h("span", { style: { color: C.text, fontSize: 14, fontWeight: 500 } }, p.name)),
          h("div", { style: { color: C.text, fontSize: 22, fontWeight: 300 } }, done, "/", total),
          h("div", { style: { fontSize: 11, color: C.textMuted } }, total ? (useWeek ? "objetivos de la semana" : "objetivos cumplidos hoy") : "sin objetivos"),
          h("div", { style: { height: 3, background: C.border, borderRadius: 3 } }, h("div", { style: { height: "100%", width: pct + "%", background: p.color, borderRadius: 3 } })));
      })),
      h("button", { type: "button", onClick: () => setTab("resumen"), style: { ...pBtn({ marginTop: 18, width: "100%" }) } }, "Ver resumen del d\xEDa (agenda, entreno, finanzas) →"));
  }

  // ── Progreso ─────────────────────────────────────────────────────────────────
  function ProgressPage({ pil, setTab }) {
    const h = React.createElement;
    const pctTxt = (v) => v === null ? "—" : v + "%";
    return h("div", { className: "pb-6" },
      h("h1", { style: { fontFamily: FONT_DISPLAY, fontWeight: 300, fontSize: 28, color: C.text, marginBottom: 14 } }, "Progreso"),
      PILLARS.map((p) => {
        const st = pillarStats(pil, p.id);
        return h("button", { key: p.id, type: "button", onClick: () => setTab("p-" + p.id), style: { ...pCard, padding: 14, marginBottom: 10, width: "100%", textAlign: "left", display: "grid", gap: 8 } },
          h("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, h(PIcon, { pillar: p.id }), h("span", { style: { color: C.text, fontWeight: 500 } }, p.name), h("span", { style: { marginLeft: "auto", color: C.textMuted, fontSize: 12 } }, "\u{1F525} ", st.streak, " d\xEDas")),
          h("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, fontSize: 12, color: C.textMuted } },
            h("div", null, h("div", { style: { color: C.text, fontSize: 16 } }, pctTxt(st.weekDaily)), "diarios sem."),
            h("div", null, h("div", { style: { color: C.text, fontSize: 16 } }, pctTxt(st.monthDaily)), "diarios mes"),
            h("div", null, h("div", { style: { color: C.text, fontSize: 16 } }, pctTxt(st.week)), "semanales"),
            h("div", null, h("div", { style: { color: C.text, fontSize: 16 } }, pctTxt(st.month)), "mensuales")));
      }));
  }

  // ── Notificaciones ───────────────────────────────────────────────────────────
  // Clave pública VAPID (la privada vive solo en los secretos de GitHub para el envío programado).
  var VAPID_PUBLIC = "__VAPID_PUBLIC__";
  function pendingByPillar(pil, enabledPillars) {
    return PILLARS.filter((p) => !enabledPillars || enabledPillars[p.id] !== false)
      .map((p) => ({ p, faltan: listFor(pil, p.id, "diario").filter((x) => !x.done).map((x) => x.o.text) }))
      .filter((x) => x.faltan.length);
  }
  async function showLocal(title, body, tag) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, { body, tag, icon: "icon-192.png", badge: "icon-192.png", data: { url: "./rumbo.html" } });
    } catch (e) { try { new Notification(title, { body }); } catch (e2) {} }
  }
  // Mientras Rumbo está abierto (o en segundo plano en la PC) revisa los horarios y avisa.
  function useLocalReminders(pil) {
    useEffect(() => {
      if (!pil.data) return;
      const check = () => {
        const n = pil.data.notify;
        if (!n || !n.enabled || typeof Notification === "undefined" || Notification.permission !== "granted") return;
        const now = /* @__PURE__ */ new Date(), hm = now.toTimeString().slice(0, 5), today = fmtDate(now);
        for (const t of n.times || []) {
          const key = `rumbo.aviso.${today}.${t}`;
          if (hm < t || localStorage.getItem(key)) continue;
          if (hm > addMinutes(t, 59)) continue;
          localStorage.setItem(key, "1");
          for (const { p, faltan } of pendingByPillar(pil, n.pillars)) showLocal(`Pilar ${p.name}: te faltan ${faltan.length}`, faltan.slice(0, 4).join(" \xB7 "), `rumbo-${p.id}-${t}`);
        }
        if (n.weekly && now.getDay() === 0 && hm >= "21:00" && !localStorage.getItem(`rumbo.resumen.${today}`)) {
          localStorage.setItem(`rumbo.resumen.${today}`, "1");
          const body = PILLARS.map((p) => { const st = pillarStats(pil, p.id); return `${p.name}: ${st.week === null ? (st.weekDaily === null ? "—" : st.weekDaily + "%") : st.week + "%"}`; }).join(" \xB7 ");
          showLocal("Resumen semanal de tus pilares", body, "rumbo-resumen");
        }
      };
      check();
      const i = setInterval(check, 60000);
      return () => clearInterval(i);
    }, [pil.data]);
  }
  var addMinutes = (hm, m) => { const [a, b] = hm.split(":").map(Number); const t = a * 60 + b + m; return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`; };
  function b64ToUint8(b64) { const p = "=".repeat((4 - b64.length % 4) % 4); const s = atob((b64 + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(s, (c) => c.charCodeAt(0)); }
  async function subscribePush() {
    const reg = await navigator.serviceWorker.ready;
    if (!reg.pushManager || VAPID_PUBLIC.startsWith("__")) return null;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(VAPID_PUBLIC) });
    return sub.toJSON();
  }
  function NotifySettings({ pil }) {
    const h = React.createElement;
    const n = pil.data.notify;
    const [msg, setMsg] = useState("");
    const perm = typeof Notification === "undefined" ? "no" : Notification.permission;
    const isIOS = /iphone|ipad/i.test(navigator.userAgent);
    const standalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
    const enable = async () => {
      setMsg("");
      if (typeof Notification === "undefined") return setMsg(isIOS && !standalone ? "En iPhone primero instal\xE1 Rumbo: Compartir → “Agregar a inicio”, y abrilo desde ese \xEDcono." : "Este navegador no permite notificaciones.");
      const p = await Notification.requestPermission();
      if (p !== "granted") return setMsg("No diste permiso. Pod\xE9s activarlo desde los ajustes del navegador.");
      let sub = null;
      try { sub = await subscribePush(); } catch (e) {}
      const devices = { ...(n.devices || {}) };
      if (sub) devices[btoa(sub.endpoint).slice(-24)] = { sub, ua: navigator.userAgent.slice(0, 80), at: Date.now() };
      pil.setNotify({ enabled: true, devices, tz: Intl.DateTimeFormat().resolvedOptions().timeZone });
      showLocal("Rumbo", "Listo: te voy a avisar si te faltan objetivos.", "rumbo-test");
      setMsg(sub ? "Avisos activados en este dispositivo (tambi\xE9n con la app cerrada)." : "Avisos activados mientras Rumbo est\xE9 abierto en este dispositivo.");
    };
    const setTime = (i, v) => pil.setNotify({ times: n.times.map((t, k) => k === i ? v : t) });
    return h("div", { className: "pb-6" },
      h("h1", { style: { fontFamily: FONT_DISPLAY, fontWeight: 300, fontSize: 28, color: C.text, marginBottom: 6 } }, "Avisos"),
      h("p", { style: { color: C.textMuted, fontSize: 14, marginBottom: 16 } }, "Si a cierta hora te faltan objetivos diarios de un pilar, te aviso cu\xE1les. Los domingos a la noche, resumen semanal."),
      h("div", { style: { ...pCard, padding: 14, marginBottom: 14 } },
        h("p", { style: { color: C.text, marginBottom: 8 } }, n.enabled && perm === "granted" ? "✅ Activados" : "Desactivados en este dispositivo"),
        h("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
          h("button", { type: "button", onClick: enable, style: pBtn({ background: C.gold, color: C.onAccent, border: "none" }) }, n.enabled && perm === "granted" ? "Activar tambi\xE9n en este dispositivo" : "Activar avisos"),
          n.enabled && h("button", { type: "button", onClick: () => pil.setNotify({ enabled: false }), style: pBtn() }, "Pausar todos"),
          n.enabled && perm === "granted" && h("button", { type: "button", onClick: () => { const pend = pendingByPillar(pil, n.pillars); showLocal("Prueba de aviso", pend.length ? pend.map((x) => `${x.p.name}: ${x.faltan.length}`).join(" \xB7 ") : "No te falta nada hoy \u{1F44C}", "rumbo-test"); }, style: pBtn() }, "Probar")),
        msg && h("p", { style: { color: C.textMuted, fontSize: 13, marginTop: 8 } }, msg),
        isIOS && !standalone && h("p", { style: { color: C.textFaint, fontSize: 12, marginTop: 8 } }, "iPhone: los avisos solo funcionan con Rumbo instalado en la pantalla de inicio (iOS 16.4 o m\xE1s).")),
      h("p", { style: { ...PLabel, marginBottom: 8 } }, "Horarios"),
      h("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 } }, (n.times || []).map((t, i) => h("div", { key: i, style: { display: "flex", gap: 4 } },
        h("input", { type: "time", value: t, onChange: (e) => setTime(i, e.target.value), style: { ...pInput, width: 120 } }),
        h("button", { type: "button", onClick: () => pil.setNotify({ times: n.times.filter((_, k) => k !== i) }), style: pBtn({ padding: "0 10px" }) }, "\xD7"))),
        h("button", { type: "button", onClick: () => pil.setNotify({ times: [...(n.times || []), "20:00"] }), style: pBtn() }, "+ Horario")),
      h("p", { style: { ...PLabel, marginBottom: 8 } }, "Pilares que avisan"),
      h("div", { style: { ...pCard, padding: "4px 14px", marginBottom: 16 } }, PILLARS.map((p) => h("label", { key: p.id, style: { display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderBottom: `1px solid ${C.borderSoft}`, color: C.text } },
        h(PIcon, { pillar: p.id }), h("span", { style: { flex: 1 } }, p.name),
        h("input", { type: "checkbox", checked: (n.pillars || {})[p.id] !== false, onChange: (e) => pil.setNotify({ pillars: { ...(n.pillars || {}), [p.id]: e.target.checked } }), style: { width: 20, height: 20 } })))),
      h("label", { style: { display: "flex", alignItems: "center", gap: 10, color: C.text, ...pCard, padding: 14 } }, h("input", { type: "checkbox", checked: n.weekly !== false, onChange: (e) => pil.setNotify({ weekly: e.target.checked }), style: { width: 20, height: 20 } }), "Resumen semanal los domingos a las 21:00"));
  }

  // ── Barra inferior con micrófono al centro ───────────────────────────────────
  var NAV_ICONS = {
    home: "M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z",
    notas2: "M6 3h9l3 3v15H6zM9 11h6M9 15h6",
    progreso: "M4 20V10M10 20V4M16 20v-7M22 20H2",
    mas: "M5 12h.01M12 12h.01M19 12h.01"
  };
  function PillarsBottomBar({ tab, setTab, onMic }) {
    const h = React.createElement;
    const sec = sectionOf(tab);
    const active = (id) => id === "mas" ? sec && sec.id === "mas" : tab === id || (id === "home" && tab.startsWith("p-"));
    const item = (id, label) => h("button", { key: id, type: "button", onClick: () => setTab(id === "mas" ? "resumen" : id), className: "flex flex-col items-center gap-1", style: { minWidth: 56, color: active(id) ? C.text : C.textFaint, fontFamily: FONT_BODY, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", background: "transparent" } },
      h("svg", { viewBox: "0 0 24 24", width: 22, height: 22, fill: "none", stroke: active(id) ? C.gold : "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" }, h("path", { d: NAV_ICONS[id] })), label);
    return h("nav", { className: "sm:hidden fixed left-0 right-0 bottom-0 z-30 flex justify-around items-end", style: { background: "rgba(13,14,16,0.95)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.border}`, padding: "6px 4px calc(8px + env(safe-area-inset-bottom))" } },
      item("home", "Inicio"), item("notas2", "Notas"),
      h("button", { type: "button", onClick: onMic, "aria-label": "Nota de voz", style: { width: 58, height: 58, marginTop: -22, borderRadius: "50%", background: C.gold, color: C.onAccent, display: "grid", placeItems: "center", boxShadow: `0 0 0 5px ${C.bg}, 0 6px 18px rgba(0,0,0,.5)` } },
        h("svg", { viewBox: "0 0 24 24", width: 26, height: 26, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" }, h("path", { d: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" }))),
      item("progreso", "Progreso"), item("mas", "M\xE1s"));
  }
