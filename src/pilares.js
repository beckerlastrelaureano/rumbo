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
    { id: "marca", name: "Marca Personal", color: "#6B9192", icon: "M12 3l2.6 5.6 6 .6-4.5 4 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.5-4 6-.6z" },
    { id: "finanzas", name: "Finanzas", color: "#C49A6C", icon: "M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2M3 10h18M16 14h2" }
  ];
  // Los pilares se pueden agregar, editar y borrar: la lista vive en pilares.pillars y se copia acá.
  var DEFAULT_PILLARS = PILLARS.map((p) => ({ ...p }));
  function syncPillars(list) { PILLARS.splice(0, PILLARS.length, ...(list || DEFAULT_PILLARS).filter((p) => !p.deleted)); }
  var PILLAR_COLORS = ["#8AA3B8", "#A59BBD", "#8FAE9F", "#B98F95", "#B8A27A", "#6B9192", "#C49A6C", "#D9806E", "#7FA9A9", "#9DB37A", "#C7B8E0", "#E0B36B"];
  var PILLAR_ICONS = [
    ["Mente", DEFAULT_PILLARS[0].icon], ["Sol", DEFAULT_PILLARS[1].icon], ["Pesa", DEFAULT_PILLARS[2].icon], ["Coraz\xF3n", DEFAULT_PILLARS[3].icon],
    ["Birrete", DEFAULT_PILLARS[4].icon], ["Estrella", DEFAULT_PILLARS[5].icon], ["Billetera", DEFAULT_PILLARS[6].icon],
    ["Libro", "M4 5a2 2 0 0 1 2-2h6v17H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-6v17h6a2 2 0 0 1 2 2z"],
    ["M\xFAsica", "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0a3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0a3 3 0 0 1 6 0z"],
    ["Hoja", "M5 19c0-8 6-14 15-14c0 9-6 15-14 15M5 19l7-7"],
    ["Valija", "M4 8h16v11H4zM9 8V5h6v3M4 13h16"],
    ["Casa", "M4 11l8-7 8 7v9H4z"],
    ["Mundo", "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"],
    ["Rayo", "M13 2L4 14h7l-1 8 9-12h-7z"]
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
    marca: ["marca", "cliente", "facturar", "factura", "venta", "vender", "podcast", "instagram", "ig ", "seguidores", "contenido", "reel", "app", "p\xE1gina", "pagina", "web", "negocio", "becker", "precio", "idea", "emprend", "posteo", "video"],
    finanzas: ["plata", "dinero", "ahorr", "gasto", "gastar", "presupuesto", "invers", "invert", "deuda", "cuota", "banco", "pagar", "sueldo", "d\xF3lar", "dolar", "tarjeta", "finanza", "cobrar", "alquiler", "iphone"]
  };
  function classifyPillar(text) {
    const t = " " + (text || "").toLowerCase() + " ";
    let best = null, score = 0;
    // Solo los pilares que existen; los que agregues usan sus propias palabras clave y su nombre.
    for (const p of PILLARS) {
      const words = (PILLAR_WORDS[p.id] || []).concat((p.words || []).map((w) => w.toLowerCase()), p.custom ? [p.name.toLowerCase()] : []);
      const s = words.reduce((n, w) => n + (w && t.includes(w) ? 1 : 0), 0);
      if (s > score) { best = p.id; score = s; }
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

  // ── Tareas de la Agenda: entender pilar, tipo (diario/semanal/mensual) y día ──
  // Ej.: "entrenar piernas mañana" → Físico, diario, mañana.
  //      "esta semana llamar a la abuela" → Social-Afectivo, semanal.
  var DIAS_SEMANA = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  // Minúsculas y sin tildes, con el mismo largo que el original (para poder recortar el texto).
  var flat = (s) => (s || "").normalize("NFC").split("").map((c) => c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().charAt(0) || c).join("");
  var addDays = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; };
  function parseTask(raw, now) {
    now = now || /* @__PURE__ */ new Date();
    let text = (raw || "").trim();
    let kind = null, date = null, ref = null, time = null;
    const cut = (re) => {
      const m = re.exec(flat(text));
      if (!m) return null;
      text = (text.slice(0, m.index) + " " + text.slice(m.index + m[0].length)).replace(/\s+/g, " ").trim();
      return m;
    };
    // "mañana" es el día siguiente, salvo "a la mañana" / "por la mañana" (el horario).
    const cutTomorrow = () => {
      const f = flat(text), re = /\bmanana\b/g;
      let x;
      while ((x = re.exec(f))) {
        if (f.slice(Math.max(0, x.index - 3), x.index) === "la ") continue;
        text = (text.slice(0, x.index) + " " + text.slice(x.index + 6)).replace(/\s+/g, " ").trim();
        return true;
      }
      return false;
    };
    let m;
    if (cut(/\b(?:la semana que viene|la (?:pr[o]xima|proxima) semana|(?:la )?semana (?:que viene|proxima))\b/)) { kind = "semanal"; ref = addDays(now, 7); }
    else if (cut(/\b(?:esta semana|en la semana|durante la semana|antes del domingo)\b/)) { kind = "semanal"; ref = now; }
    else if (cut(/\b(?:el mes que viene|el proximo mes|el mes proximo)\b/)) { kind = "mensual"; ref = new Date(now.getFullYear(), now.getMonth() + 1, 1); }
    else if (cut(/\b(?:este mes|en el mes|durante el mes|antes de fin de mes)\b/)) { kind = "mensual"; ref = now; }
    if (!kind) {
      if (cut(/\bpasado manana\b/)) date = addDays(now, 2);
      else if (cut(/\b(?:hoy|esta noche|esta tarde|esta manana)\b/)) date = now;
      else if (cutTomorrow()) date = addDays(now, 1);
      else if ((m = cut(/\b(?:el |este |esta |el proximo |el pr[o]ximo )?(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/))) {
        const want = DIAS_SEMANA.indexOf(m[1]);
        date = addDays(now, (want - weekdayIndex(now) + 7) % 7);
      } else if ((m = cut(/\b(?:el )?(\d{1,2})\s*(?:\/|-|de\s+)(\d{1,2}|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b/))) {
        const mon = /^\d+$/.test(m[2]) ? Number(m[2]) - 1 : (m[2] === "setiembre" ? 8 : MESES.indexOf(m[2]));
        let d = new Date(now.getFullYear(), mon, Number(m[1]));
        if (d < addDays(now, -30)) d = new Date(now.getFullYear() + 1, mon, Number(m[1]));
        if (!isNaN(d)) date = d;
      }
    }
    if ((m = cut(/\b(?:a las|a la)\s+(\d{1,2})(?::(\d{2})|\s*y\s*media)?\s*(?:hs?|horas)?\b|\b(\d{1,2}):(\d{2})\s*(?:hs?)?\b|\b(\d{1,2})\s*hs\b/))) {
      const hh = Number(m[1] || m[3] || m[5]), mm = m[2] || m[4] || (/media/.test(m[0]) ? "30" : "00");
      if (hh < 24) time = `${String(hh).padStart(2, "0")}:${mm}`;
    }
    // Saca muletillas del principio: "tengo que", "hay que", "y", "también"…
    text = text.replace(/^(?:y\s+|tambi[eé]n\s+|despu[eé]s\s+|adem[aá]s\s+|luego\s+)+/i, "").replace(/^(?:tengo que|tenemos que|hay que|debo|deber[ií]a|quiero|necesito|me falta|acordarme de|no olvidarme de)\s+/i, "")
      .replace(/^[,.;:\-\s]+|[,.;:\-\s]+$/g, "").replace(/\s+([,.])/g, "$1");
    if (!text) text = (raw || "").trim();
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if (!kind) kind = "diario";
    const out = { text, kind, time, explicitDate: Boolean(date || ref) };
    if (kind === "diario") out.date = fmtDate(date || now);
    else out.pk = pkey(kind, ref || now);
    out.pillar = classifyPillar(raw);
    return out;
  }
  // Varias tareas en un mismo texto. En voz se separa también por "y", comas, "después"…
  // Si una parte no dice día, usa el de la parte anterior ("mañana gym y después la tesis").
  function splitTasks(raw, voice) {
    const clean = (raw || "").trim();
    if (!clean) return [];
    const pieces = voice ? splitByPillar(clean).map((x) => x.text) : clean.split(/\s*(?:\n|;)\s*/).filter(Boolean);
    const out = [];
    for (const piece of pieces) {
      const t = parseTask(piece);
      const prev = out[out.length - 1];
      if (prev && !t.explicitDate) { t.kind = prev.kind; if (prev.date) { t.date = prev.date; delete t.pk; } else { t.pk = prev.pk; delete t.date; } }
      if (!t.pillar && prev && voice) t.pillar = prev.pillar;
      out.push(t);
    }
    return out;
  }
  var KIND_LABEL = { diario: "Diario", semanal: "Semanal", mensual: "Mensual" };
  function taskWhen(t) {
    if (t.kind === "diario") {
      const today = fmtDate(/* @__PURE__ */ new Date()), man = fmtDate(addDays(/* @__PURE__ */ new Date(), 1));
      const lbl = t.date === today ? "Hoy" : t.date === man ? "Ma\xF1ana" : new Date(t.date + "T12:00").toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
      return lbl + (t.time ? " " + t.time : "");
    }
    if (t.kind === "semanal") return t.pk === pkey("semanal", /* @__PURE__ */ new Date()) ? "Esta semana" : "Semana del " + new Date(t.pk.slice(1) + "T12:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" });
    return t.pk === pkey("mensual", /* @__PURE__ */ new Date()) ? "Este mes" : new Date(t.pk + "-15T12:00").toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  }
  // Tareas que entran en la lista de objetivos de un pilar para el período actual.
  function tasksFor(pil, pillar, period, d) {
    d = d || /* @__PURE__ */ new Date();
    return (pil.data.tasks || []).filter((t) => t.pillar === pillar && t.kind === period && (period === "diario" ? t.date === fmtDate(d) : t.pk === pkey(period, d)));
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
  var HABIT_PILLAR = { salud: "fisico", mente: "mental", espiritualidad: "espiritual", relaciones: "social", productividad: "marca", finanzas: "finanzas" };
  // Pilar de un hábito viejo: el que se le eligió, o el de su categoría, o por su texto.
  var habitPillar = (hb) => { const id = hb.pillar || HABIT_PILLAR[hb.category] || classifyPillar(hb.name); return pillarById(id) ? id : classifyPillar(hb.name) || (PILLARS[0] || {}).id; };
  var PILLAR_HABIT_CAT = { fisico: "salud", mental: "mente", espiritual: "espiritualidad", social: "relaciones", finanzas: "finanzas" };
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
  function usePilares({ loading, habits, logs, disciplina, notes, persistNotes, persistHabits, persistLogs, weekPlan }) {
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
    const latest = React.useRef(null);
    latest.current = data;
    if (data) syncPillars(data.pillars);
    const save = (next) => { latest.current = next; setData(next); setItem("pilares", next); };
    // Migración 2: los hábitos que se habían copiado como objetivos diarios vuelven a ser hábitos
    // (con su pilar y su historial), para que cada pilar tenga su panel de Hábitos sin duplicados.
    useEffect(() => {
      if (!data || data.mig2) return;
      const habIds = new Set((habits || []).map((hb) => hb.id));
      const moved = data.objectives.filter((o) => o.from === "habito" && o.id.startsWith("hab-") && habIds.has(o.id.slice(4)));
      if (moved.length) {
        const nextLogs = { ...logs };
        for (const o of moved) {
          const hid = o.id.slice(4);
          for (const [day, vals] of Object.entries(data.progress)) if (vals && vals[o.id] && /^\d{4}-\d{2}-\d{2}$/.test(day)) nextLogs[day] = { ...(nextLogs[day] || {}), [hid]: true };
        }
        persistLogs(nextLogs);
        persistHabits(habits.map((hb) => { const o = moved.find((x) => x.id === "hab-" + hb.id); return o ? { ...hb, pillar: o.pillar } : hb; }));
      }
      const ids = new Set(moved.map((o) => o.id));
      save({ ...data, mig2: true, objectives: data.objectives.filter((o) => !ids.has(o.id)) });
    }, [data]);
    // Migración 3: las notas y lo cargado en "Semana" pasan a la Agenda como tareas.
    // Las notas originales no se borran (siguen guardadas en "notes"); se copian con ids fijos.
    useEffect(() => {
      if (!data || !data.mig2 || data.mig3) return;
      const tasks = [...(data.tasks || [])];
      const has = new Set(tasks.map((t) => t.id));
      for (const n of notes || []) {
        const id = "nota-" + n.id;
        if (has.has(id)) continue;
        tasks.push({ id, text: n.text, pillar: notePillar(n), kind: "diario", date: fmtDate(new Date(n.createdAt)), done: false, nota: true, audioId: n.audioId || null, voice: Boolean(n.voice), createdAt: new Date(n.createdAt).getTime() });
      }
      const lunes = weekStart(/* @__PURE__ */ new Date());
      DAYS.forEach((dayName, i) => {
        for (const t of (weekPlan || {})[dayName] || []) {
          const id = "sem-" + t.id;
          if (has.has(id) || !t.text) continue;
          tasks.push({ id, text: t.text, pillar: classifyPillar(t.text), kind: "diario", date: fmtDate(addDays(lunes, i)), done: Boolean(t.done), createdAt: Date.now() });
        }
      });
      save({ ...data, mig3: true, tasks });
    }, [data]);
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
      // Tareas de la Agenda (aparecen también en los objetivos del pilar; el tilde es uno solo).
      addTasks(list) {
        const at = Date.now();
        const items = list.filter((t) => t.text && t.text.trim()).map((t, i) => {
          const x = { id: uid(), text: t.text.trim(), pillar: t.pillar || null, kind: t.kind || "diario", done: false, createdAt: at + i };
          if (x.kind === "diario") x.date = t.date || fmtDate(/* @__PURE__ */ new Date()); else x.pk = t.pk || pkey(x.kind, /* @__PURE__ */ new Date());
          if (t.time) x.time = t.time;
          if (t.audioId) x.audioId = t.audioId;
          if (t.voice) x.voice = true;
          return x;
        });
        if (items.length) save({ ...data, tasks: [...(data.tasks || []), ...items] });
        return items;
      },
      // Pilares: agregar o editar (nombre, color, ícono, palabras clave).
      savePillar(p) {
        const d = latest.current, list = d.pillars || DEFAULT_PILLARS;
        const exists = list.some((x) => x.id === p.id);
        save({ ...d, pillars: exists ? list.map((x) => x.id === p.id ? { ...x, ...p } : x) : [...list, p] });
      },
      // Borrar un pilar: sus objetivos, tareas, métodos y hábitos se mueven a otro pilar o se borran.
      deletePillar(id, target) {
        const d = latest.current, cx = api.ctx;
        const list = (d.pillars || DEFAULT_PILLARS).map((x) => x.id === id ? { id, deleted: true } : x);
        const mv = (arr) => target ? arr.map((x) => x.pillar === id ? { ...x, pillar: target } : x) : arr.filter((x) => x.pillar !== id);
        save({ ...d, pillars: list, objectives: mv(d.objectives), tasks: mv(d.tasks || []), harada: mv(d.harada) });
        const habs = cx.habits || [];
        cx.persistHabits(target ? habs.map((hb) => habitPillar(hb) === id ? { ...hb, pillar: target } : hb) : habs.filter((hb) => habitPillar(hb) !== id));
        const goals = cx.goals || [];
        if (goals.some((g) => goalPillar(g) === id)) cx.persistGoals(target ? goals.map((g) => goalPillar(g) === id ? { ...g, pillar: target } : g) : goals.filter((g) => goalPillar(g) !== id));
      },
      // Cursos: progreso, categorías y temas propios (todo en objetos por id, para que la nube los una bien).
      saveCursos(patch) { const d = latest.current; save({ ...d, cursos: { ...(d.cursos || {}), ...patch } }); },
      // Journaling: una entrada por fecha { text, prompt, added, updatedAt }.
      saveJournal(day, patch) { const d = latest.current, j = d.journal || {}; save({ ...d, journal: { ...j, [day]: { ...(j[day] || {}), ...patch, updatedAt: Date.now() } } }); },
      deleteJournal(day) { const d = latest.current; save({ ...d, journal: { ...(d.journal || {}), [day]: { text: "", deleted: true, updatedAt: Date.now() } } }); },
      updateTask(id, patch) { save({ ...data, tasks: (data.tasks || []).map((t) => t.id === id ? { ...t, ...patch } : t) }); },
      toggleTask(id) { save({ ...data, tasks: (data.tasks || []).map((t) => t.id === id ? { ...t, done: !t.done, doneAt: t.done ? null : Date.now() } : t) }); },
      deleteTask(id) { const t = (data.tasks || []).find((x) => x.id === id); if (t && t.audioId && !t.nota) AudioDB.del(t.audioId); save({ ...data, tasks: (data.tasks || []).filter((x) => x.id !== id) }); },
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
    const tasks = tasksFor(pil, pillar, period).sort((a, b) => Number(a.done) - Number(b.done));
    const done = list.filter((x) => x.done).length + tasks.filter((t) => t.done).length;
    const add = () => { if (!text.trim()) return; pil.addObjective(pillar, period, text.trim(), target); setText(""); setTarget(""); };
    const label = period === "diario" ? "hoy" : period === "semanal" ? "esta semana" : "este mes";
    return h("div", null,
      h("p", { style: { ...PLabel, marginBottom: 6 } }, done, "/", list.length + tasks.length, " cumplidos ", label),
      h("div", { style: { ...pCard, padding: "4px 14px" } },
        list.length || tasks.length ? null : h("p", { style: { color: C.textFaint, fontSize: 14, padding: "14px 0" } }, "Sin objetivos todav\xEDa."),
        list.map((x) => h(ObjectiveRow, { key: x.o.id + pkey(period, /* @__PURE__ */ new Date()), pil, item: x, period })),
        tasks.map((t) => h(TaskRow, { key: t.id, pil, t, tag: "Agenda" }))),
      h("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
        h("input", { value: text, onChange: (e) => setText(e.target.value), onKeyDown: (e) => e.key === "Enter" && add(), placeholder: "Nuevo objetivo…", style: pInput }),
        h("input", { value: target, onChange: (e) => setTarget(e.target.value.replace(/\D/g, "")), placeholder: "Meta", inputMode: "numeric", title: "Opcional: cantidad (ej. 4 para “4 veces”)", style: { ...pInput, width: 76 } }),
        h("button", { type: "button", onClick: add, style: pBtn({ background: C.gold, color: C.onAccent, border: "none", padding: "0 16px", fontSize: 20 }) }, "+")),
      h("p", { style: { color: C.textFaint, fontSize: 12, marginTop: 8 } }, period === "diario" ? "Se reinician cada d\xEDa a las 00:00." : period === "semanal" ? "Se reinician cada lunes." : "Se reinician el d\xEDa 1 de cada mes.", " Toc\xE1 el texto para editar, borrar o reordenar."));
  }

  // ── Pantalla de un pilar ─────────────────────────────────────────────────────
  // Cada pilar tiene todo junto, en este orden: Objetivos, Hábitos, Métodos Harada,
  // secciones propias del pilar y Progreso e historial.
  // Las pantallas viejas (Entreno, Nutrición, Finanzas, etc.) se muestran adentro sin su título propio.
  function Embed({ children }) { return React.createElement("div", { className: "rb-embed" }, children); }
  function PSection({ title, color, count, open: startOpen, children }) {
    const h = React.createElement;
    const [open, setOpen] = useState(startOpen !== false);
    return h("section", { style: { marginBottom: 14 } },
      h("button", { type: "button", onClick: () => setOpen(!open), style: { display: "flex", alignItems: "center", gap: 10, width: "100%", background: "transparent", padding: "10px 2px", borderTop: `1px solid ${C.border}` } },
        h("span", { style: { width: 8, height: 8, borderRadius: 99, background: color || C.gold, flex: "none" } }),
        h("span", { style: { ...PLabel, color: C.text, letterSpacing: "0.22em" } }, title),
        count !== void 0 && h("span", { style: { fontSize: 12, color: C.textFaint } }, count),
        h("span", { style: { marginLeft: "auto", color: C.textFaint, fontSize: 18, lineHeight: 1 } }, open ? "−" : "+")),
      open && h("div", { style: { paddingTop: 6 } }, children));
  }
  function PillarHabits({ pil, pillar }) {
    const h = React.createElement;
    const cx = pil.ctx;
    const list = (cx.habits || []).filter((hb) => habitPillar(hb) === pillar);
    const todayLogs = cx.logs[cx.todayKey] || {};
    return h("div", null,
      list.length ? h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 } }, list.map((hb) => h(HabitCard, {
        key: hb.id, habit: hb, done: Boolean(todayLogs[hb.id]), streak: cx.getHabitStreak(hb.id),
        onToggle: () => cx.toggleHabitOnDate(hb.id, cx.todayKey), onEdit: () => cx.editHabit(hb), onDelete: () => cx.deleteHabit(hb.id)
      }))) : h("p", { style: { color: C.textFaint, fontSize: 14 } }, "Sin h\xE1bitos en este pilar."),
      h("button", { type: "button", onClick: () => cx.newHabit(pillar), style: pBtn({ marginTop: 10 }) }, "+ Nuevo h\xE1bito"));
  }
  // Historial: cómo te fue cada día de las últimas 2 semanas con los objetivos diarios y hábitos del pilar.
  function PillarHistory({ pil, pillar }) {
    const h = React.createElement;
    const cx = pil.ctx;
    const st = pillarStats(pil, pillar);
    const p = pillarById(pillar);
    const daily = pil.data.objectives.filter((o) => o.pillar === pillar && o.period === "diario");
    const habs = (cx.habits || []).filter((hb) => habitPillar(hb) === pillar);
    const days = Array.from({ length: 14 }, (_, i) => { const d = /* @__PURE__ */ new Date(); d.setDate(d.getDate() - 13 + i); return d; });
    const dayPct = (d) => {
      const k = fmtDate(d), vals = pil.data.progress[k] || {}, lg = cx.logs[k] || {};
      const total = daily.length + habs.length;
      if (!total) return null;
      return Math.round((daily.filter((o) => objDone(o, vals[o.id])).length + habs.filter((hb) => lg[hb.id]).length) / total * 100);
    };
    const stat = (label, val) => h("div", { style: { ...pCard, padding: "8px", minWidth: 0 } }, h("div", { style: { fontSize: 18, fontWeight: 300, color: C.text } }, val === null ? "—" : val), h("div", { style: { fontSize: 10, color: C.textMuted, lineHeight: 1.2 } }, label));
    const pc = (v) => v === null ? null : v + "%";
    return h("div", null,
      h("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6, marginBottom: 12 } },
        stat("racha (d\xEDas)", st.streak), stat("diarios del mes", pc(st.monthDaily)), stat("semanales", pc(st.week)), stat("mensuales", pc(st.month))),
      h("p", { style: { ...PLabel, marginBottom: 6 } }, "\xDAltimos 14 d\xEDas"),
      h("div", { style: { display: "grid", gridTemplateColumns: "repeat(14, minmax(0, 1fr))", gap: 3, marginBottom: 12 } }, days.map((d) => {
        const v = dayPct(d);
        return h("div", { key: fmtDate(d), title: `${d.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}: ${v === null ? "sin datos" : v + "%"}`, style: { display: "grid", gap: 3, justifyItems: "center" } },
          h("div", { style: { width: "100%", aspectRatio: "1", borderRadius: 4, background: v === null ? C.card2 : withAlpha(p.color, 0.15 + 0.85 * v / 100), border: `1px solid ${C.borderSoft}` } }),
          h("span", { style: { fontSize: 9, color: C.textFaint } }, d.getDate()));
      })),
      habs.length > 0 && h("div", { style: { ...pCard, padding: 10 } }, h("p", { style: { ...PLabel, marginBottom: 8 } }, "Planilla de h\xE1bitos del mes"),
        h(HabitGrid, { habits: habs, logs: cx.logs, year: (/* @__PURE__ */ new Date()).getFullYear(), month: (/* @__PURE__ */ new Date()).getMonth(), onToggle: cx.toggleHabitOnDate })));
  }
  // Metas viejas con fecha límite: cada una aparece en el pilar que le corresponde por su texto.
  var goalPillar = (g) => g.pillar || classifyPillar(g.title) || "mental";
  function PillarGoals({ pil, pillar }) {
    const cx = pil.ctx;
    const mine = (cx.goals || []).filter((g) => goalPillar(g) === pillar);
    const others = (cx.goals || []).filter((g) => goalPillar(g) !== pillar);
    return React.createElement(Embed, null, React.createElement(GoalsView, { goals: mine, onChange: (next) => cx.persistGoals([...others, ...next.map((g) => ({ ...g, pillar: goalPillar(g) === pillar ? pillar : g.pillar }))]) }));
  }
  // Secciones propias de cada pilar (antes estaban sueltas en "Más").
  function PillarExtras({ pil, pillar }) {
    const h = React.createElement;
    const cx = pil.ctx;
    const p = pillarById(pillar);
    const out = [];
    const sec = (key, title, el, open) => out.push(h(PSection, { key, title, color: p.color, open }, h(Embed, null, el)));
    if (pillar === "fisico") {
      sec("entreno", "Entreno", h(WorkoutView, { exercises: cx.exercises, onChangeExercises: cx.persistExercises, workoutLogs: cx.workoutLogs, todayKey: cx.todayKey, onToggle: cx.toggleWorkout }), false);
      sec("nutricion", "Nutrici\xF3n", h(NutritionView, { nutrition: cx.nutrition, onChange: cx.persistNutrition }), false);
    }
    if (pillar === "mental") {
      out.push(h(PSection, { key: "cursos", title: "Cursos", color: p.color, open: true }, h(CoursesPage, { pil })));
      sec("sistemas", "Sistemas de disciplina", h(SystemsView, { data: cx.disciplina, onChange: cx.persistDisciplina, onCreateHabit: cx.createHabitFromSystem, habitNames: cx.existingNames }), false);
      sec("checkin", "C\xF3mo me siento", h(CheckinCard, { checkins: cx.checkins, todayKey: cx.todayKey, onChange: cx.persistCheckins }), false);
    }
    if (pillar === "espiritual" || pillar === "mental") out.push(h(PSection, { key: "journal", title: "Journaling", color: p.color, open: pillar === "espiritual" }, h(JournalPage, { pil })));
    if (pillar === "espiritual") sec("porque", "\xBFPor qu\xE9 madrugar?", h(WhyView, { data: cx.disciplina, onChange: cx.persistDisciplina }), false);
    if (pillar === "finanzas") sec("finanzas", "Ingresos y gastos", h(FinanceView, { finance: cx.finance, onChange: cx.persistFinance, monthKeyPrefix: cx.monthKeyPrefix }), true);
    if ((cx.goals || []).some((g) => goalPillar(g) === pillar)) out.push(h(PSection, { key: "metas", title: "Metas con fecha", color: p.color, open: false }, h(PillarGoals, { pil, pillar })));
    return out;
  }
  function PillarView({ pil, pillar, setTab }) {
    const h = React.createElement;
    const p = pillarById(pillar);
    const [sub, setSub] = useState("diario");
    const [editing, setEditing] = useState(false);
    if (!p) return h("p", { style: { color: C.textMuted } }, "Este pilar ya no existe.");
    const habCount = (pil.ctx.habits || []).filter((hb) => habitPillar(hb) === pillar).length;
    const harCount = pil.data.harada.filter((m) => m.pillar === pillar && !m.archived).length;
    return h("div", { className: "pb-6" },
      h("button", { type: "button", onClick: () => setTab("home"), style: { color: C.textMuted, fontSize: 13, background: "transparent", marginBottom: 10 } }, "← Inicio"),
      h("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 } },
        h("div", { style: { width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: withAlpha(p.color, 0.14), border: `1px solid ${withAlpha(p.color, 0.4)}` } }, h(PIcon, { pillar, size: 24 })),
        h("div", { style: { flex: 1 } }, h("p", { style: PLabel }, "Pilar"), h("h1", { style: { fontFamily: FONT_DISPLAY, fontWeight: 300, fontSize: 28, color: C.text, lineHeight: 1.1 } }, p.name)),
        h("button", { type: "button", onClick: () => setEditing(true), style: pBtn({ padding: "6px 10px", fontSize: 12 }) }, "✎ Editar")),
      editing && h(PillarEditor, { pil, pillar: p, onClose: (deleted) => { setEditing(false); if (deleted === true) setTab("home"); } }),
      h(PSection, { title: "Objetivos", color: p.color },
        h("div", { className: "rb-noscroll", style: { display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" } }, PERIODOS.map(([v, l]) => h("button", {
          key: v, type: "button", onClick: () => setSub(v),
          style: { fontFamily: FONT_BODY, fontSize: 14, padding: "9px 16px", borderRadius: 99, whiteSpace: "nowrap", color: sub === v ? C.text : C.textMuted, background: sub === v ? withAlpha(p.color, 0.2) : "transparent", border: `1px solid ${sub === v ? withAlpha(p.color, 0.6) : C.border}` }
        }, l))),
        h(ObjectiveList, { pil, pillar, period: sub })),
      h(PSection, { title: "H\xE1bitos", color: p.color, count: habCount }, h(PillarHabits, { pil, pillar })),
      h(PSection, { title: "M\xE9todos Harada", color: p.color, count: harCount, open: harCount > 0 }, h(HaradaList, { pil, pillar })),
      h(PillarExtras, { pil, pillar }),
      h(PSection, { title: "Progreso e historial", color: p.color, open: false }, h(PillarHistory, { pil, pillar })));
  }
  // ── Gestión de pilares: agregar, editar (nombre, color, ícono) y borrar ──────
  function PillarEditor({ pil, pillar, onClose, onCreated }) {
    const h = React.createElement;
    const isNew = !pillar;
    const [f, setF] = useState(() => pillar ? { ...pillar, words: (pillar.words || []).join(", ") } : { id: "p" + uid(), name: "", color: PILLAR_COLORS[PILLARS.length % PILLAR_COLORS.length], icon: PILLAR_ICONS[7][1], words: "", custom: true });
    const [del, setDel] = useState(false);
    const [target, setTarget] = useState("");
    const set = (p) => setF({ ...f, ...p });
    const others = PILLARS.filter((x) => x.id !== f.id);
    const counts = pillar ? {
      obj: pil.data.objectives.filter((o) => o.pillar === f.id).length, tareas: (pil.data.tasks || []).filter((t) => t.pillar === f.id).length,
      harada: pil.data.harada.filter((m) => m.pillar === f.id).length, habitos: (pil.ctx.habits || []).filter((hb) => habitPillar(hb) === f.id).length
    } : null;
    const save = () => {
      if (!f.name.trim()) return;
      const p = { id: f.id, name: f.name.trim(), color: f.color, icon: f.icon, words: f.words.split(",").map((w) => w.trim()).filter(Boolean) };
      if (f.custom) p.custom = true;
      pil.savePillar(p);
      onClose();
      if (isNew && onCreated) onCreated(p.id);
    };
    const doDelete = () => {
      if (target === "") return alert("Eleg\xED qu\xE9 hacer con lo que tiene este pilar.");
      const t = target === "__borrar" ? null : target;
      const msg = t ? `Se mueve todo a ${pillarById(t).name} y se borra el pilar ${f.name}.` : `Se borran el pilar ${f.name} y todo lo que tiene (objetivos, tareas, m\xE9todos y h\xE1bitos). No se puede deshacer.`;
      if (!confirm(msg + " \xBFSeguimos?")) return;
      pil.deletePillar(f.id, t);
      onClose(true);
    };
    const lbl = { fontSize: 12, color: C.textMuted, margin: "10px 0 6px" };
    return h("div", { style: { position: "fixed", inset: 0, zIndex: 60, background: "rgba(5,6,8,0.85)", display: "flex", alignItems: "flex-end", justifyContent: "center" }, onClick: (e) => e.target === e.currentTarget && onClose() },
      h("div", { style: { ...pCard, width: "100%", maxWidth: 560, borderRadius: "22px 22px 0 0", padding: "18px 16px calc(18px + env(safe-area-inset-bottom))", maxHeight: "92vh", overflowY: "auto" } },
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, h("p", { style: PLabel }, isNew ? "Nuevo pilar" : "Editar pilar"), h("button", { type: "button", onClick: () => onClose(), style: { color: C.textMuted, fontSize: 22, background: "transparent" } }, "\xD7")),
        h("p", { style: lbl }, "Nombre"),
        h("input", { value: f.name, onChange: (e) => set({ name: e.target.value }), placeholder: "Ej.: Creatividad", style: pInput, autoFocus: isNew }),
        h("p", { style: lbl }, "Color"),
        h("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, PILLAR_COLORS.map((c) => h("button", { key: c, type: "button", onClick: () => set({ color: c }), "aria-label": "Color " + c, style: { width: 30, height: 30, borderRadius: 99, background: c, border: f.color === c ? `3px solid ${C.text}` : `1px solid ${C.border}` } }))),
        h("p", { style: lbl }, "\xCDcono"),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 } }, PILLAR_ICONS.map(([n, d]) => h("button", { key: n, type: "button", onClick: () => set({ icon: d }), title: n, "aria-label": "\xCDcono " + n, style: { aspectRatio: "1", borderRadius: 10, display: "grid", placeItems: "center", background: f.icon === d ? withAlpha(f.color, 0.25) : C.card2, border: `1px solid ${f.icon === d ? f.color : C.border}` } },
          h("svg", { viewBox: "0 0 24 24", width: 20, height: 20, fill: "none", stroke: f.color, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" }, h("path", { d }))))),
        h("p", { style: lbl }, "Palabras clave (opcional, separadas por coma)"),
        h("input", { value: f.words, onChange: (e) => set({ words: e.target.value }), placeholder: "Ej.: dibujar, pintar, escribir canciones", style: pInput }),
        h("p", { style: { fontSize: 11, color: C.textFaint, marginTop: 4 } }, "Rumbo usa estas palabras para mandar solas las tareas a este pilar."),
        h("button", { type: "button", onClick: save, disabled: !f.name.trim(), style: pBtn({ width: "100%", marginTop: 14, padding: "12px", background: f.name.trim() ? C.gold : C.card2, color: f.name.trim() ? C.onAccent : C.textFaint, border: "none" }) }, isNew ? "Crear pilar" : "Guardar cambios"),
        !isNew && h("div", { style: { marginTop: 18, borderTop: `1px solid ${C.border}`, paddingTop: 12 } },
          !del ? h("button", { type: "button", onClick: () => setDel(true), style: pBtn({ color: C.danger }) }, "Eliminar este pilar")
            : h("div", null,
              h("p", { style: { fontSize: 13, color: C.text, marginBottom: 6 } }, "Este pilar tiene ", counts.obj, " objetivos, ", counts.tareas, " tareas, ", counts.harada, " m\xE9todos Harada y ", counts.habitos, " h\xE1bitos. \xBFQu\xE9 hago con eso?"),
              h("select", { value: target, onChange: (e) => setTarget(e.target.value), style: { ...pInput, marginBottom: 8 } },
                h("option", { value: "" }, "Elegir…"), others.map((x) => h("option", { key: x.id, value: x.id }, "Moverlo todo a " + x.name)), h("option", { value: "__borrar" }, "Borrarlo todo")),
              h("div", { style: { display: "flex", gap: 8 } },
                h("button", { type: "button", onClick: doDelete, style: pBtn({ background: C.danger, color: C.bg, border: "none" }) }, "Eliminar pilar"),
                h("button", { type: "button", onClick: () => setDel(false), style: pBtn() }, "Cancelar"))))));
  }
  // Ritual matutino: uno solo, arriba del Inicio. Cerrado muestra un resumen; abierto, el ritual completo.
  function RitualCard({ pil }) {
    const h = React.createElement;
    const cx = pil.ctx;
    const t = cx.ritual[cx.todayKey] || {};
    const [open, setOpen] = useState(false);
    const resumen = [t.mission ? "misi\xF3n ✓" : "sin misi\xF3n", t.sapo ? (t.sapoDone ? "sapo ✓" : "sapo pendiente") : "sin sapo", t.energy ? `energ\xEDa ${t.energy}/5` : null].filter(Boolean).join(" \xB7 ");
    return h("section", { style: { ...pCard, padding: open ? "12px 14px 4px" : "12px 14px", marginBottom: 14 } },
      h("button", { type: "button", onClick: () => setOpen(!open), style: { display: "flex", alignItems: "center", gap: 10, width: "100%", background: "transparent", textAlign: "left" } },
        h("span", { style: { fontSize: 16 } }, "☀"),
        h("div", { style: { flex: 1, minWidth: 0 } }, h("p", { style: PLabel }, "Ritual de hoy"), h("p", { style: { color: C.text, fontSize: 13, marginTop: 2 } }, resumen)),
        h("span", { style: { color: C.textFaint, fontSize: 18 } }, open ? "−" : "+")),
      open && h("div", { style: { marginTop: 10 } }, h(Embed, null, h(RitualView, { ritual: cx.ritual, todayKey: cx.todayKey, onChange: cx.persistRitual, onCompleteSapo: cx.onCompleteSapo }))));
  }
  // ── Agenda: tareas con pilar, tipo y día ─────────────────────────────────────
  var MIC_PATH = "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3";
  function MicButton({ onClick, size, label }) {
    const h = React.createElement;
    return h("button", { type: "button", onClick, "aria-label": label || "Dictar con el micr\xF3fono", title: label || "Dictar con el micr\xF3fono", style: { width: size || 40, height: size || 40, borderRadius: "50%", background: C.gold, color: C.onAccent, display: "grid", placeItems: "center", flex: "none" } },
      h("svg", { viewBox: "0 0 24 24", width: 20, height: 20, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" }, h("path", { d: MIC_PATH })));
  }
  function TaskRow({ pil, t, tag, showWhen }) {
    const h = React.createElement;
    const [edit, setEdit] = useState(false);
    const p = pillarById(t.pillar);
    const color = p ? p.color : C.textFaint;
    if (edit) return h(TaskEditor, { pil, t, onClose: () => setEdit(false) });
    return h("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 2px", borderBottom: `1px solid ${C.borderSoft}` } },
      h("button", { type: "button", onClick: () => pil.toggleTask(t.id), "aria-label": t.done ? "Desmarcar" : "Marcar hecha", style: { width: 24, height: 24, borderRadius: 7, flex: "none", border: `1.5px solid ${color}`, background: t.done ? color : "transparent", color: C.bg, fontSize: 13, fontWeight: 700, display: "grid", placeItems: "center" } }, t.done ? "✓" : ""),
      h("button", { type: "button", onClick: () => setEdit(true), style: { flex: 1, minWidth: 0, textAlign: "left", background: "transparent" } },
        h("div", { style: { color: t.done ? C.textFaint : C.text, fontSize: 15, textDecoration: t.done ? "line-through" : "none", whiteSpace: "pre-wrap", wordBreak: "break-word" } }, t.nota ? "\u{1F4DD} " : "", t.text),
        h("div", { style: { display: "flex", gap: 6, alignItems: "center", marginTop: 2, fontSize: 11, color: C.textFaint, flexWrap: "wrap" } },
          h("span", { style: { width: 7, height: 7, borderRadius: 99, background: color } }), p ? p.name : "Sin pilar",
          showWhen !== false && h("span", null, "\xB7 ", taskWhen(t)), t.kind !== "diario" && showWhen === false && h("span", null, "\xB7 ", KIND_LABEL[t.kind]),
          t.time && showWhen === false && h("span", null, "\xB7 ", t.time), tag && h("span", { style: { border: `1px solid ${C.border}`, borderRadius: 99, padding: "0 6px" } }, tag), t.audioId && h("span", null, "\u{1F399}"))));
  }
  function TaskEditor({ pil, t, onClose }) {
    const h = React.createElement;
    const [f, setF] = useState({ ...t });
    const set = (p) => setF({ ...f, ...p });
    const now = /* @__PURE__ */ new Date();
    const setKind = (kind) => kind === "diario" ? set({ kind, date: f.date || fmtDate(now), pk: void 0 }) : set({ kind, pk: pkey(kind, now), date: void 0 });
    const periodOpts = f.kind === "semanal" ? [[pkey("semanal", now), "Esta semana"], [pkey("semanal", addDays(now, 7)), "La semana que viene"]] : [[pkey("mensual", now), "Este mes"], [pkey("mensual", new Date(now.getFullYear(), now.getMonth() + 1, 1)), "El mes que viene"]];
    if (f.pk && !periodOpts.some(([v]) => v === f.pk)) periodOpts.unshift([f.pk, taskWhen(f)]);
    const sel = { ...pInput, padding: "9px 10px", fontSize: 14, width: "auto", flex: 1, minWidth: 0 };
    return h("div", { style: { ...pCard, padding: 12, margin: "8px 0", display: "grid", gap: 8 } },
      h("textarea", { value: f.text, onChange: (e) => set({ text: e.target.value }), rows: 2, style: pInput, autoFocus: true }),
      h("div", { style: { display: "flex", gap: 8 } },
        h("select", { value: f.pillar || "", onChange: (e) => set({ pillar: e.target.value || null }), style: sel, "aria-label": "Pilar" }, h("option", { value: "" }, "Sin pilar"), PILLARS.map((x) => h("option", { key: x.id, value: x.id }, x.name))),
        h("select", { value: f.kind, onChange: (e) => setKind(e.target.value), style: sel, "aria-label": "Tipo de objetivo" }, PERIODOS.map(([v, l]) => h("option", { key: v, value: v }, l)))),
      h("div", { style: { display: "flex", gap: 8 } },
        f.kind === "diario"
          ? h(React.Fragment, null,
            h("input", { type: "date", value: f.date || "", onChange: (e) => set({ date: e.target.value || fmtDate(now) }), style: sel, "aria-label": "D\xEDa" }),
            h("input", { type: "time", value: f.time || "", onChange: (e) => set({ time: e.target.value || void 0 }), style: { ...sel, flex: "0 0 110px" }, "aria-label": "Hora" }))
          : h("select", { value: f.pk, onChange: (e) => set({ pk: e.target.value }), style: sel }, periodOpts.map(([v, l]) => h("option", { key: v, value: v }, l)))),
      t.audioId && h(NoteAudio, { id: t.audioId, onDelete: () => { AudioDB.del(t.audioId); set({ audioId: null }); } }),
      h("div", { style: { display: "flex", gap: 8 } },
        h("button", { type: "button", onClick: () => { pil.updateTask(t.id, { ...f, text: f.text.trim() || t.text }); onClose(); }, style: pBtn({ background: C.gold, color: C.onAccent, border: "none" }) }, "Guardar"),
        h("button", { type: "button", onClick: onClose, style: pBtn() }, "Cancelar"),
        h("button", { type: "button", onClick: () => { if (confirm("\xBFBorrar esta tarea?")) { pil.deleteTask(t.id); onClose(); } }, style: pBtn({ color: C.danger, marginLeft: "auto" }) }, "Borrar")));
  }
  // Campo grande para cargar tareas rápido: pilar opcional + micrófono adentro del campo.
  function QuickTask({ pil }) {
    const h = React.createElement;
    const [text, setText] = useState("");
    const [pillar, setPillar] = useState("");
    const [last, setLast] = useState(null);
    const save = () => {
      if (!text.trim()) return;
      const g = detectGoal(text);
      if (g && g.text) {
        const gp = pillar || classifyPillar(g.text) || "mental";
        if (confirm(`\xBFCrear el objetivo ${g.period} “${g.text}” en ${pillarById(gp).name}? (si dec\xEDs que no, queda como tarea)`)) { pil.addObjective(gp, g.period, g.text, g.target); setText(""); setLast([{ text: g.text, pillar: gp, kind: g.period, pk: pkey(g.period === "diario" ? "semanal" : g.period, /* @__PURE__ */ new Date()), objective: true }]); return; }
      }
      const items = pil.addTasks(splitTasks(text, false).map((t) => ({ ...t, pillar: pillar || t.pillar })));
      setLast(items);
      setText("");
    };
    return h("div", null,
      h("div", { style: { display: "flex", alignItems: "center", gap: 8, background: C.card2, border: `1px solid ${withAlpha(C.gold, 0.45)}`, borderRadius: 16, padding: "6px 6px 6px 14px" } },
        h("textarea", { value: text, rows: 1, onChange: (e) => setText(e.target.value), onKeyDown: (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); } }, placeholder: "Escrib\xED una tarea…", style: { flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: C.text, fontFamily: FONT_BODY, fontSize: 16, resize: "none", padding: "10px 0", lineHeight: 1.3 } }),
        text.trim() ? h("button", { type: "button", onClick: save, "aria-label": "Agregar tarea", style: { width: 40, height: 40, borderRadius: "50%", background: C.gold, color: C.onAccent, fontSize: 20, flex: "none" } }, "✓") : h(MicButton, { onClick: () => pil.setRecOpen(true) })),
      h("div", { style: { display: "flex", alignItems: "center", gap: 6, marginTop: 8, flexWrap: "wrap" } },
        h("span", { style: { fontSize: 12, color: C.textFaint } }, "Pilar:"),
        h("select", { value: pillar, onChange: (e) => setPillar(e.target.value), style: { ...pInput, width: "auto", padding: "5px 8px", fontSize: 13 }, "aria-label": "Pilar de la tarea" }, h("option", { value: "" }, "Autom\xE1tico"), PILLARS.map((x) => h("option", { key: x.id, value: x.id }, x.name))),
        h("span", { style: { fontSize: 12, color: C.textFaint } }, "\xB7 ej.: “entrenar piernas ma\xF1ana”, “tesis el jueves”, “esta semana llamar a la abuela”")),
      last && last.length > 0 && h("div", { style: { marginTop: 8, fontSize: 12, color: C.textMuted, display: "grid", gap: 2 } }, last.map((t, i) => {
        const p = pillarById(t.pillar);
        return h("div", { key: i }, "✓ ", h("b", { style: { color: C.text, fontWeight: 500 } }, t.text), " → ", p ? p.name : "Sin pilar", " \xB7 ", t.objective ? "objetivo " + t.kind : KIND_LABEL[t.kind] + " \xB7 " + taskWhen(t));
      })));
  }
  function AgendaPage({ pil }) {
    const h = React.createElement;
    const [offset, setOffset] = useState(0);
    const [q, setQ] = useState("");
    const now = /* @__PURE__ */ new Date();
    const lunes = addDays(weekStart(now), offset * 7);
    const tasks = pil.data.tasks || [];
    const today = fmtDate(now);
    const sortT = (a, b) => Number(a.done) - Number(b.done) || (a.time || "99").localeCompare(b.time || "99") || a.createdAt - b.createdAt;
    const wk = pkey("semanal", lunes), mo = pkey("mensual", addDays(lunes, 3));
    const nq = norm(q);
    const box = (key, title, list, sub, hl, cap) => h("div", { key, style: { ...pCard, padding: "10px 14px", marginBottom: 10, borderColor: hl ? withAlpha(C.gold, 0.6) : C.border } },
      h("div", { style: { display: "flex", alignItems: "baseline", gap: 8 } }, h("p", { style: { color: hl ? C.text : C.textMuted, fontSize: 14, fontWeight: 600, textTransform: cap ? "capitalize" : "none" } }, title), sub && h("span", { style: { fontSize: 12, color: C.textFaint } }, sub),
        list.length > 0 && h("span", { style: { marginLeft: "auto", fontSize: 12, color: C.textFaint } }, list.filter((t) => t.done).length, "/", list.length)),
      list.length ? list.map((t) => h(TaskRow, { key: t.id, pil, t, showWhen: false })) : h("p", { style: { fontSize: 13, color: C.textFaint, padding: "6px 0" } }, "Sin tareas."));
    return h("div", { className: "pb-6" },
      h("h1", { style: { fontFamily: FONT_DISPLAY, fontWeight: 300, fontSize: 28, color: C.text, marginBottom: 12 } }, "Agenda"),
      h(QuickTask, { pil }),
      h("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Buscar en tus tareas y notas…", style: { ...pInput, margin: "14px 0", padding: "10px 12px", fontSize: 14 } }),
      nq ? h("div", null, (() => {
        const found = tasks.filter((t) => norm(t.text).includes(nq)).sort((a, b) => b.createdAt - a.createdAt);
        return found.length ? h("div", { style: { ...pCard, padding: "4px 14px" } }, found.map((t) => h(TaskRow, { key: t.id, pil, t }))) : h("p", { style: { color: C.textFaint } }, "No encontr\xE9 nada.");
      })()) : h(React.Fragment, null,
        h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } },
          h("button", { type: "button", onClick: () => setOffset(offset - 1), style: pBtn({ padding: "6px 12px" }), "aria-label": "Semana anterior" }, "‹"),
          h("button", { type: "button", onClick: () => setOffset(0), style: { background: "transparent", color: C.text, fontSize: 14 } }, offset === 0 ? "Esta semana" : "Semana del " + lunes.toLocaleDateString("es-AR", { day: "numeric", month: "short" })),
          h("button", { type: "button", onClick: () => setOffset(offset + 1), style: pBtn({ padding: "6px 12px" }), "aria-label": "Semana siguiente" }, "›")),
        Array.from({ length: 7 }, (_, i) => {
          const d = addDays(lunes, i), k = fmtDate(d);
          const list = tasks.filter((t) => t.kind === "diario" && t.date === k).sort(sortT);
          return box(k, d.toLocaleDateString("es-AR", { weekday: "long" }), list, d.toLocaleDateString("es-AR", { day: "numeric", month: "short" }) + (k === today ? " \xB7 hoy" : ""), k === today, true);
        }),
        box("sem", "Durante la semana", tasks.filter((t) => t.kind === "semanal" && t.pk === wk).sort(sortT), "sin d\xEDa fijo"),
        box("mes", "Este mes", tasks.filter((t) => t.kind === "mensual" && t.pk === mo).sort(sortT), addDays(lunes, 3).toLocaleDateString("es-AR", { month: "long" })),
        h(PSection, { title: "Horario fijo del d\xEDa", open: false }, h(Embed, null, h(AgendaView, { agenda: pil.ctx.agenda, onChange: pil.ctx.persistAgenda })))));
  }
  // ── Journaling (Pilar Espiritual, también desde el Mental) ───────────────────
  var JOURNAL_PROMPTS = [
    "\xBFQu\xE9 aprend\xED hoy?", "\xBFPor qu\xE9 estoy agradecido hoy?", "\xBFQu\xE9 har\xEDa distinto ma\xF1ana?", "\xBFQu\xE9 me dio energ\xEDa hoy y qu\xE9 me la sac\xF3?",
    "\xBFDe qu\xE9 estoy orgulloso hoy?", "\xBFQu\xE9 me preocupa y qu\xE9 parte depende de m\xED?", "\xBFA qui\xE9n ayud\xE9 hoy, o qui\xE9n me ayud\xF3?", "\xBFQu\xE9 h\xE1bito me acerc\xF3 a la persona que quiero ser?",
    "\xBFQu\xE9 estuve evitando y por qu\xE9?", "Si hoy fuera mi \xFAltimo d\xEDa, \xBFqu\xE9 cambiar\xEDa?", "\xBFQu\xE9 momento de hoy quiero recordar?", "\xBFQu\xE9 decisi\xF3n tom\xE9 hoy que mi yo del futuro va a agradecer?"
  ];
  // Frases que suenan a algo pendiente: "tengo que…", "mañana voy a…", "no me tengo que olvidar de…".
  var TODO_RE = /\b(?:tengo que|tenemos que|hay que|debo|deber[ií]a|necesito|no (?:me )?(?:tengo que )?olvidar(?:me)? de|acordarme de|tengo pendiente|me falta|voy a)\b/i;
  function journalTodos(text) {
    return (text || "").split(/[.!?]+\s+|\n+/).map((s) => s.trim()).filter((s) => s.length > 6 && TODO_RE.test(s)).slice(0, 6);
  }
  function JournalPage({ pil }) {
    const h = React.createElement;
    const today = fmtDate(/* @__PURE__ */ new Date());
    const journal = pil.data.journal || {};
    const [day, setDay] = useState(today);
    const entry = journal[day] || {};
    const [text, setText] = useState(entry.text || "");
    const [prompt, setPrompt] = useState(entry.prompt === void 0 ? JOURNAL_PROMPTS[dayOfYear(/* @__PURE__ */ new Date()) % JOURNAL_PROMPTS.length] : entry.prompt);
    const [q, setQ] = useState("");
    const [hidden, setHidden] = useState([]);
    const timer = React.useRef(null);
    useEffect(() => { const e = (pil.data.journal || {})[day] || {}; setText(e.text || ""); setPrompt(e.prompt === void 0 ? (day === today ? JOURNAL_PROMPTS[dayOfYear(/* @__PURE__ */ new Date()) % JOURNAL_PROMPTS.length] : "") : e.prompt); setHidden([]); }, [day]);
    const write = (t, pr) => pil.saveJournal(day, { text: t, prompt: pr === void 0 ? prompt : pr });
    // Guarda solo un ratito después de dejar de escribir (en la notebook lenta no se traba).
    const onType = (t) => { setText(t); clearTimeout(timer.current); timer.current = setTimeout(() => write(t), 700); };
    useEffect(() => () => clearTimeout(timer.current), []);
    const added = entry.added || [];
    const todos = journalTodos(text).filter((s) => !added.includes(s) && !hidden.includes(s));
    const toAgenda = (s) => { pil.addTasks([parseTask(s)]); pil.saveJournal(day, { text, prompt, added: [...added, s] }); };
    const dictate = () => pil.setRecOpen({ mode: "text", onText: (t) => { const next = (text ? text.replace(/\s*$/, "") + (/[.!?]$/.test(text.trim()) ? " " : ". ") : "") + t; setText(next); write(next); } });
    const nq = norm(q);
    const past = Object.entries(journal).filter(([k, e]) => e && e.text && (!nq || norm(e.text + " " + (e.prompt || "")).includes(nq))).sort((a, b) => a[0] < b[0] ? 1 : -1);
    const label = (k) => k === today ? "Hoy" : new Date(k + "T12:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return h("div", null,
      h("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 } },
        h("p", { style: { color: C.text, fontSize: 16, textTransform: "capitalize", flex: 1 } }, label(day)),
        day !== today && h("button", { type: "button", onClick: () => setDay(today), style: pBtn({ padding: "5px 10px", fontSize: 12 }) }, "Ir a hoy")),
      h("div", { className: "rb-noscroll", style: { display: "flex", gap: 6, overflowX: "auto", marginBottom: 10 } },
        [["", "Libre"], ...JOURNAL_PROMPTS.map((x) => [x, x])].map(([v, l]) => h("button", { key: l, type: "button", onClick: () => { setPrompt(v); write(text, v); }, style: { fontFamily: FONT_BODY, fontSize: 12, padding: "6px 12px", borderRadius: 99, whiteSpace: "nowrap", color: prompt === v ? C.text : C.textMuted, background: prompt === v ? withAlpha(C.violet, 0.2) : "transparent", border: `1px solid ${prompt === v ? withAlpha(C.violet, 0.6) : C.border}` } }, l))),
      prompt && h("p", { style: { color: C.violet, fontSize: 15, marginBottom: 8 } }, prompt),
      h("div", { style: { position: "relative" } },
        h("textarea", { value: text, onChange: (e) => onType(e.target.value), onBlur: () => write(text), rows: 8, placeholder: prompt ? "Escrib\xED tu respuesta…" : "Escrib\xED lo que quieras…", style: { ...pInput, lineHeight: 1.5, paddingRight: 56, minHeight: 180 } }),
        h("div", { style: { position: "absolute", right: 8, bottom: 10 } }, h(MicButton, { onClick: dictate, label: "Dictar en el journal" }))),
      h("p", { style: { fontSize: 11, color: C.textFaint, marginTop: 4 } }, "Se guarda solo."),
      todos.length > 0 && h("div", { style: { ...pCard, padding: 12, marginTop: 10, background: withAlpha(C.gold, 0.08) } },
        h("p", { style: { fontSize: 13, color: C.text, marginBottom: 6 } }, "Esto parece algo que ten\xE9s que hacer. \xBFLo paso a la Agenda?"),
        todos.map((s) => { const t = parseTask(s), p = pillarById(t.pillar); return h("div", { key: s, style: { display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderTop: `1px solid ${C.borderSoft}` } },
          h("span", { style: { flex: 1, fontSize: 13, color: C.textMuted } }, t.text, h("span", { style: { display: "block", fontSize: 11, color: C.textFaint } }, p ? p.name : "Sin pilar", " \xB7 ", taskWhen(t))),
          h("button", { type: "button", onClick: () => toAgenda(s), style: pBtn({ padding: "5px 10px", fontSize: 12, background: C.gold, color: C.onAccent, border: "none" }) }, "+ Agenda"),
          h("button", { type: "button", onClick: () => setHidden([...hidden, s]), "aria-label": "No", style: pBtn({ padding: "5px 8px", fontSize: 12 }) }, "✕")); })),
      h("p", { style: { ...PLabel, margin: "18px 0 8px" } }, "Entradas anteriores"),
      h("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Buscar en el journal…", style: { ...pInput, padding: "10px 12px", fontSize: 14, marginBottom: 8 } }),
      past.length === 0 ? h("p", { style: { color: C.textFaint, fontSize: 13 } }, nq ? "No encontr\xE9 nada." : "Todav\xEDa no hay entradas.") : past.slice(0, 60).map(([k, e]) => h("div", { key: k, style: { ...pCard, padding: 12, marginBottom: 8, borderColor: k === day ? withAlpha(C.violet, 0.6) : C.border } },
        h("button", { type: "button", onClick: () => { setDay(k); window.scrollTo({ top: 0, behavior: "smooth" }); }, style: { width: "100%", textAlign: "left", background: "transparent" } },
          h("p", { style: { fontSize: 12, color: C.textMuted, textTransform: "capitalize" } }, label(k), e.prompt ? " \xB7 " + e.prompt : ""),
          h("p", { style: { fontSize: 14, color: C.text, marginTop: 4, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", whiteSpace: "pre-wrap" } }, e.text)),
        h("div", { style: { display: "flex", gap: 6, marginTop: 8 } },
          h("button", { type: "button", onClick: () => { setDay(k); window.scrollTo({ top: 0, behavior: "smooth" }); }, style: pBtn({ padding: "4px 10px", fontSize: 12 }) }, "Leer y editar"),
          h("button", { type: "button", onClick: () => { if (confirm("\xBFBorrar la entrada de " + label(k) + "?")) { pil.deleteJournal(k); if (k === day) setText(""); } }, style: pBtn({ padding: "4px 10px", fontSize: 12, color: C.danger }) }, "Borrar")))));
  }
  // ── Cursos (Pilar Mental) ────────────────────────────────────────────────────
  // Las lecciones están en cursos.json (se baja una vez y queda guardado para usar sin internet).
  // El progreso se guarda en pilares.cursos: terminadas, guardadas, respuestas, categorías y temas propios.
  var COURSE_CATS = [["filosofia", "Filosof\xEDa"], ["psicologia", "Psicolog\xEDa"], ["comunicacion", "Comunicaci\xF3n"], ["liderazgo", "Liderazgo"], ["frecuencias", "Frecuencias y energ\xEDa personal"]];
  var CourseStore = { lessons: null, loading: null, load() { if (this.lessons) return Promise.resolve(this.lessons); if (!this.loading) this.loading = fetch("cursos.json").then((r) => r.json()).then((j) => (this.lessons = j.lessons)).catch((e) => { this.loading = null; throw e; }); return this.loading; } };
  var bookLink = (b) => "https://www.google.com/search?tbm=bks&q=" + encodeURIComponent(b.title + " " + b.author);
  var videoLink = (v) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(v.query || v.title);
  var STOP = new Set("como para pero porque cuando donde sobre entre esto esta este estos estas tiene tengo puedo hacer hace sirve sirven cual cuales quien algo mucho muy mas menos tema leccion".split(" "));
  // "Chat" sin internet: busca en la lección las frases que más se parecen a la pregunta.
  function answerFromLesson(lesson, question) {
    const words = norm(question).split(" ").filter((w) => w.length > 3 && !STOP.has(w));
    const sentences = [...lesson.parts.map((p) => p.p), ...lesson.examples].flatMap((t) => t.split(/(?:[.:;])\s+/)).map((s) => s.trim()).filter((s) => s.length > 20);
    const scored = sentences.map((s) => { const n = norm(s); return { s, score: words.reduce((a, w) => a + (n.includes(w.slice(0, Math.max(4, w.length - 2))) ? 1 : 0), 0) }; }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
    return scored.slice(0, 2).map((x) => x.s.replace(/\.?$/, "."));
  }
  function useCursos(pil) {
    const c = pil.data.cursos || {};
    const set = (patch) => pil.saveCursos(patch);
    const cats = COURSE_CATS.map(([id, name]) => ({ id, name, ...(c.cats || {})[id] })).concat(Object.entries(c.cats || {}).filter(([id, x]) => x.custom).map(([id, x]) => ({ id, ...x }))).filter((x) => !x.hidden);
    return { c, set, cats };
  }
  function CoursesPage({ pil }) {
    const h = React.createElement;
    const [lessons, setLessons] = useState(CourseStore.lessons);
    const [err, setErr] = useState("");
    const [cat, setCat] = useState(null);
    const [open, setOpen] = useState(null);
    const [q, setQ] = useState("");
    const { c, set, cats } = useCursos(pil);
    useEffect(() => { if (!lessons) CourseStore.load().then(setLessons).catch(() => setErr("No pude bajar las lecciones. Revis\xE1 la conexi\xF3n y volv\xE9 a entrar.")); }, []);
    if (err) return h("p", { style: { color: C.danger, fontSize: 13 } }, err);
    if (!lessons) return h("p", { style: { color: C.textFaint, fontSize: 13 } }, "Cargando cursos…");
    const done = c.done || {}, saved = c.saved || {};
    const custom = Object.entries(c.custom || {}).map(([id, x]) => ({ id, ...x })).filter((x) => !x.deleted);
    const visible = lessons.filter((l) => cats.some((k) => k.id === l.cat));
    const openLesson = (id) => { setOpen(id); set({ seen: { ...(c.seen || {}), [id]: Date.now() } }); window.scrollTo({ top: 0, behavior: "smooth" }); };
    const current = open && (lessons.find((l) => l.id === open) || custom.find((x) => x.id === open));
    if (current) return current.parts ? h(LessonView, { pil, lesson: current, onBack: () => setOpen(null) }) : h(CustomTopic, { pil, topic: current, onBack: () => setOpen(null) });
    const teachNew = () => {
      const pool = visible.filter((l) => !done[l.id] && !(c.seen || {})[l.id]);
      const pick = (pool.length ? pool : visible.filter((l) => !done[l.id]));
      const list = pick.length ? pick : visible;
      if (list.length) openLesson(list[Math.floor(Math.random() * list.length)].id);
    };
    const nq = norm(q);
    const found = nq ? visible.filter((l) => norm(l.title + " " + l.parts.map((p) => p.h + " " + p.p).join(" ")).includes(nq) || nq.split(" ").filter((w) => w.length > 3).some((w) => norm(l.title).includes(w))) : [];
    const pending = Object.entries(c.pending || {}).map(([id, x]) => ({ id, ...x })).filter((x) => !x.deleted);
    const lessonRow = (l) => h("button", { key: l.id, type: "button", onClick: () => openLesson(l.id), style: { display: "flex", gap: 10, alignItems: "center", width: "100%", textAlign: "left", background: "transparent", padding: "11px 2px", borderBottom: `1px solid ${C.borderSoft}` } },
      h("span", { style: { width: 22, height: 22, borderRadius: 99, flex: "none", display: "grid", placeItems: "center", fontSize: 12, border: `1.5px solid ${done[l.id] ? C.gold : C.textFaint}`, background: done[l.id] ? C.gold : "transparent", color: C.onAccent } }, done[l.id] ? "✓" : ""),
      h("span", { style: { flex: 1, color: C.text, fontSize: 14 } }, l.title, h("span", { style: { display: "block", fontSize: 11, color: C.textFaint } }, l.minutes ? l.minutes + " min" : "Tema propio", saved[l.id] ? " \xB7 ★ guardada" : "")),
      h("span", { style: { color: C.textFaint } }, "›"));
    if (cat) {
      const k = cats.find((x) => x.id === cat) || { name: "Categor\xEDa" };
      const list = [...visible.filter((l) => l.cat === cat), ...custom.filter((x) => x.cat === cat)];
      return h("div", null,
        h("button", { type: "button", onClick: () => setCat(null), style: { color: C.textMuted, fontSize: 13, background: "transparent", marginBottom: 8 } }, "← Cursos"),
        h("p", { style: { color: C.text, fontSize: 18, marginBottom: 8 } }, k.name),
        h("div", { style: { ...pCard, padding: "2px 12px", marginBottom: 10 } }, list.length ? list.map(lessonRow) : h("p", { style: { color: C.textFaint, fontSize: 13, padding: "12px 0" } }, "Todav\xEDa no hay temas en esta categor\xEDa.")),
        h("button", { type: "button", onClick: () => { const t = prompt("Nombre del tema nuevo:"); if (t && t.trim()) { const id = uid(); set({ custom: { ...(c.custom || {}), [id]: { cat, title: t.trim(), notes: "", createdAt: Date.now() } } }); openLesson(id); } }, style: pBtn() }, "+ Tema propio"));
    }
    const recs = visible.filter((l) => (c.seen || {})[l.id]).sort((a, b) => (c.seen[b.id] || 0) - (c.seen[a.id] || 0));
    const nDone = visible.filter((l) => done[l.id]).length, nSaved = visible.filter((l) => saved[l.id]).length;
    return h("div", null,
      h("button", { type: "button", onClick: teachNew, style: pBtn({ width: "100%", background: C.gold, color: C.onAccent, border: "none", padding: "12px", fontSize: 15, marginBottom: 10 }) }, "✦ Ense\xF1ame algo nuevo"),
      h("div", { style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 6 } },
        h("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Ped\xED una lecci\xF3n sobre cualquier tema…", style: { ...pInput, padding: "10px 12px", fontSize: 14 } }),
        h(MicButton, { onClick: () => pil.setRecOpen({ mode: "text", onText: (t) => setQ(t) }), label: "Dictar el tema" })),
      nq && h("div", { style: { ...pCard, padding: "4px 12px", marginBottom: 10 } },
        found.length ? found.map(lessonRow) : h("div", { style: { padding: "10px 0", fontSize: 13, color: C.textMuted } },
          "Todav\xEDa no tengo una lecci\xF3n sobre “", q, "”. ",
          h("a", { href: videoLink({ query: q }), target: "_blank", rel: "noopener", style: { color: C.gold } }, "Buscar videos en YouTube"), " \xB7 ",
          h("a", { href: bookLink({ title: q, author: "" }), target: "_blank", rel: "noopener", style: { color: C.gold } }, "Buscar libros"),
          h("div", { style: { marginTop: 8 } }, h("button", { type: "button", onClick: () => { const id = uid(); set({ pending: { ...(c.pending || {}), [id]: { text: q.trim(), createdAt: Date.now() } } }); setQ(""); }, style: pBtn({ fontSize: 12, padding: "5px 10px" }) }, "Guardar como tema pendiente")))),
      h("p", { style: { fontSize: 12, color: C.textFaint, margin: "4px 0 12px" } }, nDone, " de ", visible.length, " lecciones terminadas \xB7 ", nSaved, " guardadas para despu\xE9s"),
      cats.map((k) => {
        const list = [...visible.filter((l) => l.cat === k.id), ...custom.filter((x) => x.cat === k.id)];
        const nd = list.filter((l) => done[l.id]).length;
        return h("div", { key: k.id, style: { ...pCard, padding: 12, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 } },
          h("button", { type: "button", onClick: () => setCat(k.id), style: { flex: 1, textAlign: "left", background: "transparent" } },
            h("div", { style: { color: C.text, fontSize: 15 } }, k.name), h("div", { style: { color: C.textFaint, fontSize: 12, marginTop: 2 } }, list.length, " temas \xB7 ", nd, " terminados"), h("div", { style: { marginTop: 6 } }, h(MiniBar, { pct: list.length ? nd / list.length * 100 : 0 }))),
          h("button", { type: "button", onClick: () => { const n = prompt("Nuevo nombre de la categor\xEDa:", k.name); if (n && n.trim()) set({ cats: { ...(c.cats || {}), [k.id]: { ...(c.cats || {})[k.id], name: n.trim() } } }); }, style: pBtn({ padding: "5px 9px", fontSize: 12 }), "aria-label": "Editar categor\xEDa" }, "✎"),
          h("button", { type: "button", onClick: () => { if (confirm(`\xBFBorrar la categor\xEDa “${k.name}”? Tu progreso queda guardado.`)) set({ cats: { ...(c.cats || {}), [k.id]: { ...(c.cats || {})[k.id], name: k.name, hidden: true } } }); }, style: pBtn({ padding: "5px 9px", fontSize: 12, color: C.danger }), "aria-label": "Borrar categor\xEDa" }, "✕"));
      }),
      h("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 } },
        h("button", { type: "button", onClick: () => { const n = prompt("Nombre de la categor\xEDa nueva:"); if (n && n.trim()) set({ cats: { ...(c.cats || {}), [uid()]: { name: n.trim(), custom: true } } }); }, style: pBtn() }, "+ Nueva categor\xEDa"),
        COURSE_CATS.some(([id]) => ((c.cats || {})[id] || {}).hidden) && h("button", { type: "button", onClick: () => { const next = { ...(c.cats || {}) }; COURSE_CATS.forEach(([id]) => { if (next[id]) next[id] = { ...next[id], hidden: false }; }); set({ cats: next }); }, style: pBtn() }, "Recuperar categor\xEDas borradas")),
      pending.length > 0 && h("div", { style: { marginTop: 16 } }, h("p", { style: { ...PLabel, marginBottom: 6 } }, "Temas pendientes"), pending.map((x) => h("div", { key: x.id, style: { display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: C.textMuted, padding: "6px 0", borderBottom: `1px solid ${C.borderSoft}` } },
        h("span", { style: { flex: 1, color: C.text } }, x.text), h("a", { href: videoLink({ query: x.text }), target: "_blank", rel: "noopener", style: { color: C.gold, fontSize: 12 } }, "YouTube"), h("a", { href: bookLink({ title: x.text, author: "" }), target: "_blank", rel: "noopener", style: { color: C.gold, fontSize: 12 } }, "Libros"),
        h("button", { type: "button", onClick: () => set({ pending: { ...(c.pending || {}), [x.id]: { ...x, deleted: true } } }), style: { color: C.textFaint, background: "transparent" }, "aria-label": "Quitar" }, "✕")))),
      recs.length > 0 && h(PSection, { title: "Libros y videos recomendados", open: false }, recs.map((l) => h("div", { key: l.id, style: { padding: "8px 0", borderBottom: `1px solid ${C.borderSoft}`, fontSize: 13 } },
        h("div", { style: { color: C.textFaint, fontSize: 11 } }, l.title),
        h("a", { href: bookLink(l.book), target: "_blank", rel: "noopener", style: { color: C.text, display: "block" } }, "\u{1F4D6} ", l.book.title, " — ", l.book.author),
        h("a", { href: videoLink(l.video), target: "_blank", rel: "noopener", style: { color: C.text, display: "block" } }, "▶ ", l.video.title, " (b\xFAsqueda en YouTube)")))));
  }
  function LessonView({ pil, lesson, onBack }) {
    const h = React.createElement;
    const { c, set } = useCursos(pil);
    const answers = (c.quiz || {})[lesson.id] || {};
    const [ask, setAsk] = useState("");
    const [chat, setChat] = useState([]);
    const [addedEx, setAddedEx] = useState(false);
    const done = Boolean((c.done || {})[lesson.id]), saved = Boolean((c.saved || {})[lesson.id]);
    const toggle = (key, on) => { const m = { ...(c[key] || {}) }; if (on) m[lesson.id] = Date.now(); else delete m[lesson.id]; set({ [key]: m }); };
    const sendAsk = () => {
      if (!ask.trim()) return;
      const found = answerFromLesson(lesson, ask);
      setChat([...chat, { q: ask.trim(), a: found }]);
      setAsk("");
    };
    const card = { ...pCard, padding: 14, marginBottom: 10 };
    return h("div", null,
      h("button", { type: "button", onClick: onBack, style: { color: C.textMuted, fontSize: 13, background: "transparent", marginBottom: 8 } }, "← Cursos"),
      h("p", { style: { ...PLabel, marginBottom: 2 } }, (COURSE_CATS.find(([id]) => id === lesson.cat) || [0, ""])[1], " \xB7 ", lesson.minutes, " min"),
      h("h2", { style: { fontFamily: FONT_DISPLAY, color: C.text, fontSize: 22, fontWeight: 400, lineHeight: 1.25, marginBottom: 12 } }, lesson.title),
      lesson.parts.map((p, i) => h("div", { key: i, style: card }, h("p", { style: { color: C.gold, fontSize: 12, fontWeight: 600, marginBottom: 4 } }, i + 1, ". ", p.h), h("p", { style: { color: C.text, fontSize: 15, lineHeight: 1.55 } }, p.p))),
      h("div", { style: card }, h("p", { style: { color: C.gold, fontSize: 12, fontWeight: 600, marginBottom: 6 } }, "Ejemplos en la vida diaria"), lesson.examples.map((e, i) => h("p", { key: i, style: { color: C.text, fontSize: 14, lineHeight: 1.5, marginBottom: 6 } }, "• ", e))),
      h("div", { style: { ...card, borderColor: withAlpha(C.gold, 0.5), background: withAlpha(C.gold, 0.08) } },
        h("p", { style: { color: C.gold, fontSize: 12, fontWeight: 600, marginBottom: 4 } }, "Ejercicio para hoy"),
        h("p", { style: { color: C.text, fontSize: 14, lineHeight: 1.5, marginBottom: 8 } }, lesson.exercise),
        h("button", { type: "button", disabled: addedEx, onClick: () => { pil.addTasks([{ text: lesson.exercise, pillar: "mental", kind: "diario", date: fmtDate(/* @__PURE__ */ new Date()) }]); setAddedEx(true); }, style: pBtn({ background: addedEx ? C.card2 : C.gold, color: addedEx ? C.textMuted : C.onAccent, border: "none" }) }, addedEx ? "✓ Agregado a tus objetivos de hoy" : "+ Agregar como objetivo de hoy")),
      h("div", { style: card }, h("p", { style: { color: C.gold, fontSize: 12, fontWeight: 600, marginBottom: 8 } }, "\xBFQu\xE9 entendiste?"),
        lesson.quiz.map((qz, i) => h("div", { key: i, style: { marginBottom: 12 } },
          h("p", { style: { color: C.text, fontSize: 14, marginBottom: 6 } }, i + 1, ". ", qz.q),
          qz.options.map((op, j) => {
            const picked = answers[i] === j, answered = answers[i] !== void 0, right = j === qz.a;
            const bg = answered && right ? withAlpha(C.sage, 0.25) : picked ? withAlpha(C.danger, 0.2) : "transparent";
            return h("button", { key: j, type: "button", onClick: () => set({ quiz: { ...(c.quiz || {}), [lesson.id]: { ...answers, [i]: j } } }), style: { display: "block", width: "100%", textAlign: "left", fontSize: 13, color: C.text, background: bg, border: `1px solid ${answered && right ? C.sage : C.border}`, borderRadius: 10, padding: "8px 10px", marginBottom: 5 } }, op, answered && right ? " ✓" : picked ? " ✕" : "");
          }))),
        h("p", { style: { fontSize: 12, color: C.textFaint } }, Object.keys(answers).filter((i) => answers[i] === lesson.quiz[i].a).length, " de ", lesson.quiz.length, " correctas")),
      h("div", { style: card }, h("p", { style: { color: C.gold, fontSize: 12, fontWeight: 600, marginBottom: 6 } }, "Para profundizar"),
        h("a", { href: bookLink(lesson.book), target: "_blank", rel: "noopener", style: { display: "block", color: C.text, fontSize: 14, marginBottom: 6 } }, "\u{1F4D6} Libro: ", h("b", { style: { fontWeight: 600 } }, lesson.book.title), " — ", lesson.book.author),
        h("a", { href: videoLink(lesson.video), target: "_blank", rel: "noopener", style: { display: "block", color: C.text, fontSize: 14 } }, "▶ Video: ", lesson.video.title, h("span", { style: { color: C.textFaint, fontSize: 12 } }, " (abre la b\xFAsqueda en YouTube)"))),
      h("div", { style: card }, h("p", { style: { color: C.gold, fontSize: 12, fontWeight: 600, marginBottom: 4 } }, "Pregunt\xE1 sobre el tema"),
        h("p", { style: { fontSize: 11, color: C.textFaint, marginBottom: 8 } }, "Te respondo con lo que dice la lecci\xF3n. Para ir m\xE1s lejos, te dejo una b\xFAsqueda en Google."),
        chat.map((m, i) => h("div", { key: i, style: { marginBottom: 10 } },
          h("p", { style: { fontSize: 13, color: C.textMuted, textAlign: "right" } }, m.q),
          h("div", { style: { fontSize: 14, color: C.text, background: C.card2, borderRadius: 12, padding: "8px 10px", marginTop: 4 } },
            m.a.length ? m.a.map((s, k) => h("p", { key: k, style: { marginBottom: 4 } }, s)) : h("p", null, "Eso no est\xE1 en esta lecci\xF3n."),
            h("a", { href: "https://www.google.com/search?q=" + encodeURIComponent(lesson.title + " " + m.q), target: "_blank", rel: "noopener", style: { color: C.gold, fontSize: 12 } }, "Buscar m\xE1s en Google →")))),
        h("div", { style: { display: "flex", gap: 8 } },
          h("input", { value: ask, onChange: (e) => setAsk(e.target.value), onKeyDown: (e) => e.key === "Enter" && sendAsk(), placeholder: "Ej.: \xBFc\xF3mo lo aplico al estudio?", style: { ...pInput, padding: "10px 12px", fontSize: 14 } }),
          h("button", { type: "button", onClick: sendAsk, style: pBtn({ background: C.gold, color: C.onAccent, border: "none" }) }, "→"))),
      h("div", { style: { display: "flex", gap: 8, marginTop: 6 } },
        h("button", { type: "button", onClick: () => toggle("done", !done), style: pBtn({ flex: 1, background: done ? C.card2 : C.gold, color: done ? C.text : C.onAccent, border: "none", padding: "12px" }) }, done ? "✓ Terminada" : "Marcar como terminada"),
        h("button", { type: "button", onClick: () => toggle("saved", !saved), style: pBtn({ flex: 1, padding: "12px" }) }, saved ? "★ Guardada" : "☆ Guardar para despu\xE9s")));
  }
  function CustomTopic({ pil, topic, onBack }) {
    const h = React.createElement;
    const { c, set } = useCursos(pil);
    const [notes, setNotes] = useState(topic.notes || "");
    const save = (patch) => set({ custom: { ...(c.custom || {}), [topic.id]: { ...(c.custom || {})[topic.id], ...patch } } });
    const done = Boolean((c.done || {})[topic.id]);
    return h("div", null,
      h("button", { type: "button", onClick: onBack, style: { color: C.textMuted, fontSize: 13, background: "transparent", marginBottom: 8 } }, "← Cursos"),
      h("input", { value: topic.title, onChange: (e) => save({ title: e.target.value }), style: { ...pInput, fontSize: 18, marginBottom: 8 } }),
      h("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), onBlur: () => save({ notes }), rows: 8, placeholder: "Tus apuntes sobre este tema…", style: { ...pInput, lineHeight: 1.5 } }),
      h("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, fontSize: 13 } },
        h("a", { href: videoLink({ query: topic.title }), target: "_blank", rel: "noopener", style: { color: C.gold } }, "▶ Buscar videos"), h("a", { href: bookLink({ title: topic.title, author: "" }), target: "_blank", rel: "noopener", style: { color: C.gold } }, "\u{1F4D6} Buscar libros")),
      h("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
        h("button", { type: "button", onClick: () => { const m = { ...(c.done || {}) }; if (done) delete m[topic.id]; else m[topic.id] = Date.now(); set({ done: m }); }, style: pBtn({ background: done ? C.card2 : C.gold, color: done ? C.text : C.onAccent, border: "none" }) }, done ? "✓ Terminado" : "Marcar como terminado"),
        h("button", { type: "button", onClick: () => { if (confirm("\xBFBorrar este tema?")) { save({ deleted: true }); onBack(); } }, style: pBtn({ color: C.danger }) }, "Borrar tema")));
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
  // Primero el modelo "base" (más preciso); si el dispositivo no puede cargarlo (memoria), el "tiny".
  var WHISPER_MODELS = ["onnx-community/whisper-base", "onnx-community/whisper-tiny"];
  var errText = (e) => String(e && (e.message || e.name) || e).slice(0, 160);
  var WhisperWeb = window.RumboWhisper = {
    pipe: null,
    loading: null,
    model: null,
    listeners: new Set(),
    progress: { status: "idle", pct: 0 },
    emit(p) { this.progress = { ...this.progress, ...p }; this.listeners.forEach((f) => f(this.progress)); },
    load() {
      if (this.pipe) return Promise.resolve(this.pipe);
      if (this.loading) return this.loading;
      this.emit({ status: "loading", pct: 0, error: "" });
      this.loading = (async () => {
        const { pipeline, env } = await import(WHISPER_LIB);
        env.allowLocalModels = false;
        // Un solo hilo: en iPhone y en GitHub Pages no hay multihilo y a veces se cuelga si se intenta.
        try { env.backends.onnx.wasm.numThreads = 1; env.backends.onnx.wasm.proxy = false; } catch (e) {}
        let lastErr;
        const start = localStorage.getItem("rumbo.whisper.tiny") ? 1 : 0;
        for (let i = start; i < WHISPER_MODELS.length; i++) {
          const files = {};
          try {
            this.pipe = await pipeline("automatic-speech-recognition", WHISPER_MODELS[i], {
              dtype: "q8",
              device: "wasm",
              progress_callback: (p) => {
                if (p.status !== "progress" || !p.total) return;
                files[p.file] = [p.loaded, p.total];
                const all = Object.values(files), loaded = all.reduce((a, x) => a + x[0], 0), total = all.reduce((a, x) => a + x[1], 0);
                this.emit({ pct: Math.round(loaded / total * 100) });
              }
            });
            this.model = WHISPER_MODELS[i];
            if (i > 0) localStorage.setItem("rumbo.whisper.tiny", "1");
            this.emit({ status: "ready", pct: 100 });
            return this.pipe;
          } catch (e) { lastErr = e; console.warn("Whisper", WHISPER_MODELS[i], e); }
        }
        throw lastErr;
      })().catch((e) => { this.loading = null; this.emit({ status: "error", error: errText(e) }); throw e; });
      return this.loading;
    },
    // Lleva cualquier audio a 16 kHz mono, como lo pide Whisper.
    async resample(samples, rate) {
      if (rate === 16e3) return samples;
      const off = new OfflineAudioContext(1, Math.max(1, Math.ceil(samples.length * 16e3 / rate)), 16e3);
      const buf = off.createBuffer(1, samples.length, rate);
      buf.getChannelData(0).set(samples);
      const src = off.createBufferSource();
      src.buffer = buf; src.connect(off.destination); src.start();
      return (await off.startRendering()).getChannelData(0);
    },
    // Respaldo: decodificar el archivo grabado (webm/mp4) si no hay audio crudo.
    async decode(blob) {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const ab = await blob.arrayBuffer();
      const buf = await new Promise((ok, fail) => ctx.decodeAudioData(ab, ok, fail));
      if (ctx.close) ctx.close();
      return this.resample(buf.getChannelData(0), buf.sampleRate);
    },
    // pcm = { samples, rate } capturado directo del micrófono (lo más confiable en iPhone), o blob.
    async transcribe(input) {
      const pipe = await this.load();
      const audio = input.samples ? await this.resample(input.samples, input.rate) : await this.decode(input);
      if (audio.length < 16e3 * 0.4) return "";
      this.emit({ status: "working" });
      const out = await pipe(audio, { language: "spanish", task: "transcribe", chunk_length_s: 30, stride_length_s: 5 });
      this.emit({ status: "ready" });
      return collapseRepeats((Array.isArray(out) ? out.map((o) => o.text).join(" ") : out.text) || "");
    }
  };
  // Graba el audio crudo del micrófono (sin pasar por un archivo comprimido).
  // Audio crudo → archivo WAV (16 bits, mono) para poder volver a escucharlo.
  function pcmToWav({ samples, rate }) {
    const step = Math.max(1, Math.floor(rate / 16e3)), n = Math.floor(samples.length / step), sr = Math.round(rate / step);
    const buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    str(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); str(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const x = Math.max(-1, Math.min(1, samples[i * step])); v.setInt16(44 + i * 2, x < 0 ? x * 32768 : x * 32767, true); }
    return new Blob([buf], { type: "audio/wav" });
  }
  // El AudioContext se crea en el toque del usuario (iPhone lo exige) y se pasa acá.
  function startPcmCapture(stream, ctx) {
    const src = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    const chunks = [];
    proc.onaudioprocess = (e) => chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    src.connect(proc); proc.connect(ctx.destination);
    return {
      stop() {
        try { proc.disconnect(); src.disconnect(); } catch (e) {}
        const len = chunks.reduce((n, c) => n + c.length, 0);
        const samples = new Float32Array(len);
        let o = 0; for (const c of chunks) { samples.set(c, o); o += c.length; }
        const rate = ctx.sampleRate;
        if (ctx.close) ctx.close();
        return { samples, rate };
      }
    };
  }
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
  function VoiceRecorder({ pil, onClose, mode, onText }) {
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
    const [stopped, setStopped] = useState(0);
    useEffect(() => {
      if (!stopped) return;
      if (!IS_IOS && ((r.current.finalText || "").trim() || (r.current.liveText || "").trim())) { setAsr("done"); return; }
      let alive = true;
      setAsr("working");
      const pcm = r.current.pcmData && r.current.pcmData.samples.length ? r.current.pcmData : null;
      // El archivo grabado puede tardar un instante en estar listo: se espera solo si hace falta.
      const fileBlob = () => new Promise((ok) => { let n = 0; const t = setInterval(() => { if (r.current.blob || ++n > 20) { clearInterval(t); ok(r.current.blob || null); } }, 100); });
      // Primero el audio crudo del micrófono; si falla, se intenta con el archivo grabado.
      const run = pcm ? WhisperWeb.transcribe(pcm).catch(async (e) => { console.warn("PCM fall\xF3, uso el archivo", e); const b = await fileBlob(); if (!b) throw e; return WhisperWeb.transcribe(b); })
        : fileBlob().then((b) => { if (!b) throw new Error("No se grab\xF3 audio"); return WhisperWeb.transcribe(b); });
      run.then((t) => {
        if (!alive) return;
        setAsr(t ? "done" : "empty");
        if (t && !r.current.edited) { setText(t); analyze(t); }
      }).catch((e) => { if (alive) { setAsr("error"); setErr(errText(e)); } });
      return () => { alive = false; };
    }, [stopped]);
    const start = async () => {
      setErr(""); setLive(""); setSecs(0); setEdited(false); setAsr("idle"); setBlob(null);
      const AC = window.AudioContext || window.webkitAudioContext;
      let ctx = null;
      try { ctx = new AC(); if (ctx.resume) ctx.resume(); } catch (e) { ctx = null; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
        r.current = { finalText: "", stream };
        try { if (ctx) r.current.pcm = startPcmCapture(stream, ctx); } catch (e) { console.warn("PCM", e); }
        // Archivo de audio para volver a escucharlo (opcional: si el navegador no puede, se arma desde el audio crudo).
        try {
          const mime = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || "";
          const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : void 0);
          const chunks = [];
          mr.ondataavailable = (e) => e.data && e.data.size && chunks.push(e.data);
          mr.onstop = () => { const b = new Blob(chunks, { type: mr.mimeType || mime || "audio/mp4" }); if (b.size) { r.current.blob = b; setBlob(b); } };
          mr.start(1000);
          r.current.mr = mr;
        } catch (e) { console.warn("MediaRecorder", e); }
        if (!r.current.pcm && !r.current.mr) throw new Error("Este navegador no permite grabar audio");
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
        if (ctx && ctx.close) ctx.close();
        setErr("No pude usar el micr\xF3fono. En iPhone: Ajustes → Safari → Micr\xF3fono → Permitir. (" + errText(e) + ")");
      }
    };
    const stop = () => {
      const c = r.current;
      if (!c.mr && !c.pcm) return;
      c.recording = false;
      clearInterval(c.tick);
      try { c.rec && c.rec.stop(); } catch (e) {}
      try { c.pcmData = c.pcm ? c.pcm.stop() : null; } catch (e) { c.pcmData = null; }
      try { c.mr && c.mr.state !== "inactive" && c.mr.stop(); } catch (e) {}
      setTimeout(() => { try { c.stream && c.stream.getTracks().forEach((t) => t.stop()); } catch (e) {} }, 300);
      // Sin archivo del grabador: se guarda el audio crudo como WAV para poder escucharlo.
      setTimeout(() => { if (!r.current.blob && c.pcmData && c.pcmData.samples.length) { const w = pcmToWav(c.pcmData); r.current.blob = w; setBlob(w); } }, 1200);
      setStopped((n) => n + 1);
      setTimeout(() => {
        // Mientras Whisper trabaja, se muestra lo que entendió el navegador (si pudo).
        const t = (c.finalText || "").trim() || (c.liveText || "").trim();
        setText(t); analyze(t); setPhase("review");
      }, 300);
    };
    const analyze = (t) => { if (mode === "text") return; setParts(splitTasks(t, true)); const g = detectGoal(t); setGoal(g && g.text ? { ...g, pillar: classifyPillar(g.text) || (splitTasks(t, true)[0] || {}).pillar || null, create: true } : null); };
    // Mantener apretado = grabar mientras se sostiene; un toque = empezar / terminar.
    const onDown = () => { if (phase !== "idle") return; holdTimer.current = setTimeout(() => (holdTimer.current = "hold"), 450); start(); };
    const onUp = () => { if (holdTimer.current === "hold") { holdTimer.current = null; stop(); } else { clearTimeout(holdTimer.current); holdTimer.current = null; } };
    const onClick = () => { if (phase === "rec" && holdTimer.current === null) stop(); };
    const saveAll = async () => { if (mode === "text") { if (text.trim()) onText(text.trim()); return onClose(); }
      const list = parts.filter((p) => p.text.trim());
      if (!list.length && !blob) return onClose();
      let audioId = null;
      if (blob && blob.size) { audioId = uid(); try { await AudioDB.put(audioId, blob); } catch (e) { audioId = null; } }
      pil.addTasks((list.length ? list : [{ ...parseTask("(nota de voz)"), pillar: null }]).map((p, i) => ({ ...p, audioId: i === 0 ? audioId : null, voice: true })));
      if (goal && goal.create && goal.pillar && goal.text) pil.addObjective(goal.pillar, goal.period, goal.text, goal.target);
      onClose();
    };
    useEffect(() => () => { const c = r.current; c.recording = false; clearInterval(c.tick); try { c.rec && c.rec.abort(); } catch (e) {} try { c.mr && c.mr.state !== "inactive" && c.mr.stop(); } catch (e) {} }, []);
    const mm = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
    return h("div", { style: { position: "fixed", inset: 0, zIndex: 60, background: "rgba(5,6,8,0.88)", display: "flex", alignItems: "flex-end", justifyContent: "center" }, onClick: (e) => e.target === e.currentTarget && phase !== "rec" && onClose() },
      h("div", { style: { ...pCard, width: "100%", maxWidth: 560, borderRadius: "22px 22px 0 0", padding: "22px 18px calc(22px + env(safe-area-inset-bottom))", maxHeight: "92vh", overflowY: "auto" } },
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, h("p", { style: PLabel }, mode === "text" ? "Dictar" : "Dictar tareas"), phase !== "rec" && h("button", { type: "button", onClick: onClose, style: { color: C.textMuted, fontSize: 22, background: "transparent" } }, "\xD7")),
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
          asr === "error" && h("div", { style: { fontSize: 12, color: C.danger } }, "No pude transcribir el audio. Escrib\xED el texto (el audio igual se guarda) o toc\xE1 Regrabar.", err && h("div", { style: { color: C.textFaint, marginTop: 4 } }, "Detalle: ", err)),
          asr === "empty" && h("p", { style: { fontSize: 12, color: C.textMuted } }, "No se escuch\xF3 voz en el audio. Habl\xE1 m\xE1s cerca del micr\xF3fono y toc\xE1 Regrabar."),
          h("textarea", { value: text, onChange: (e) => { r.current.edited = true; setEdited(true); setText(e.target.value); analyze(e.target.value); }, rows: 4, placeholder: asr === "working" ? "Esper\xE1 un momento…" : "Escrib\xED lo que dijiste…", style: pInput }),
          parts.length > 0 && h("div", null, h("p", { style: { ...PLabel, letterSpacing: "0.18em", marginBottom: 6 } }, parts.length > 1 ? `Se guardan ${parts.length} tareas en la Agenda` : "Se guarda en la Agenda"),
            parts.map((p, i) => h("div", { key: i, style: { display: "flex", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.borderSoft}` } },
              h(PillarChip, { pillar: p.pillar, onChange: (v) => setParts(parts.map((x, k) => k === i ? { ...x, pillar: v } : x)) }),
              h("span", { style: { color: C.text, fontSize: 14, flex: 1 } }, p.text, h("span", { style: { display: "block", fontSize: 11, color: C.textFaint } }, KIND_LABEL[p.kind], " \xB7 ", taskWhen(p)))))),
          goal && h("label", { style: { display: "flex", gap: 10, alignItems: "flex-start", ...pCard, padding: 12, background: withAlpha(C.gold, 0.1) } },
            h("input", { type: "checkbox", checked: goal.create, onChange: (e) => setGoal({ ...goal, create: e.target.checked }), style: { marginTop: 3 } }),
            h("span", { style: { fontSize: 14, color: C.text } }, `Crear objetivo ${goal.period}: “${goal.text}”`, goal.target > 1 ? ` (meta ${goal.target})` : "", " en ", h(PillarChip, { pillar: goal.pillar, onChange: (v) => setGoal({ ...goal, pillar: v }) }))),
          blob && h("p", { style: { fontSize: 12, color: C.textFaint } }, mode === "text" ? "" : "\u{1F399} El audio queda guardado con la tarea (en este dispositivo)."),
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
      h("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.textMuted, marginBottom: 10 } }, "Pilar de este m\xE9todo:",
        h("select", { value: m.pillar, onChange: (e) => save({ ...m, pillar: e.target.value }), style: { ...pInput, width: "auto", padding: "5px 8px", fontSize: 13 } }, PILLARS.map((x) => h("option", { key: x.id, value: x.id }, x.name)))),
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
  // Progreso del día de un pilar: objetivos diarios + tareas de hoy + hábitos de hoy.
  function pillarToday(pil, pillar) {
    const d = pillarDay(pil, pillar);
    const tk = tasksFor(pil, pillar, "diario");
    const cx = pil.ctx;
    const habs = (cx.habits || []).filter((hb) => habitPillar(hb) === pillar);
    const lg = cx.logs[cx.todayKey] || {};
    return { done: d.done + tk.filter((t) => t.done).length + habs.filter((hb) => lg[hb.id]).length, total: d.total + tk.length + habs.length };
  }
  // ── Inicio: Agenda arriba (campo grande + micrófono) y debajo los pilares ────
  function PillarsHome({ pil, name, greeting, dateLabel, setTab }) {
    const h = React.createElement;
    const [newPillar, setNewPillar] = useState(false);
    const hoy = fmtDate(/* @__PURE__ */ new Date());
    const today = (pil.data.tasks || []).filter((t) => t.kind === "diario" && t.date === hoy).sort((a, b) => Number(a.done) - Number(b.done) || (a.time || "99").localeCompare(b.time || "99"));
    const semana = (pil.data.tasks || []).filter((t) => t.kind === "semanal" && t.pk === pkey("semanal", /* @__PURE__ */ new Date()) && !t.done);
    return h("div", { className: "pb-6" },
      h("p", { style: PLabel }, dateLabel),
      h("h1", { style: { fontFamily: FONT_DISPLAY, color: C.text, fontWeight: 300, fontSize: "clamp(24px, 5vw, 34px)", margin: "2px 0 6px" } }, "Hola se\xF1or ", h("strong", { style: { fontWeight: 600, letterSpacing: "0.06em" } }, "BECKER")),
      pil.ctx.bookQuote && h("p", { style: { color: C.textMuted, fontSize: 13, fontWeight: 300, margin: "0 0 16px", borderLeft: `2px solid ${C.gold}`, paddingLeft: 10 } }, "“", pil.ctx.bookQuote[0], "” ", h("span", { style: { color: C.textFaint } }, "— ", pil.ctx.bookQuote[1])),
      h("section", { style: { ...pCard, padding: 16, marginBottom: 14 } },
        h("p", { style: { ...PLabel, marginBottom: 12 } }, "Agenda de hoy"),
        h(QuickTask, { pil }),
        today.length > 0 && h("div", { style: { marginTop: 10 } }, today.map((t) => h(TaskRow, { key: t.id, pil, t, showWhen: false }))),
        semana.length > 0 && h("div", { style: { marginTop: 10 } }, h("p", { style: { fontSize: 12, color: C.textFaint, margin: "4px 0" } }, "Pendientes de la semana"), semana.map((t) => h(TaskRow, { key: t.id, pil, t, showWhen: false })))),
      h(RitualCard, { pil }),
      h("p", { style: { ...PLabel, margin: "6px 0 10px" } }, "Pilares \xB7 progreso de hoy"),
      h("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 } }, PILLARS.map((p) => {
        const { done, total } = pillarToday(pil, p.id);
        const pct = total ? done / total * 100 : 0;
        return h("button", { key: p.id, type: "button", onClick: () => setTab("p-" + p.id), style: { ...pCard, padding: 14, textAlign: "left", display: "grid", gap: 10, borderColor: withAlpha(p.color, 0.35) } },
          h("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, h(PIcon, { pillar: p.id, size: 22 }), h("span", { style: { color: C.text, fontSize: 14, fontWeight: 500 } }, p.name)),
          h("div", { style: { color: C.text, fontSize: 22, fontWeight: 300 } }, done, "/", total),
          h("div", { style: { fontSize: 11, color: C.textMuted } }, total ? "cumplidos hoy" : "nada para hoy"),
          h("div", { style: { height: 3, background: C.border, borderRadius: 3 } }, h("div", { style: { height: "100%", width: pct + "%", background: p.color, borderRadius: 3 } })));
      }), h("button", { key: "nuevo", type: "button", onClick: () => setNewPillar(true), style: { ...pCard, padding: 14, display: "grid", placeItems: "center", gap: 6, color: C.textMuted, borderStyle: "dashed", minHeight: 120 } },
        h("span", { style: { fontSize: 26, lineHeight: 1 } }, "+"), h("span", { style: { fontSize: 13 } }, "Nuevo pilar"))),
      newPillar && h(PillarEditor, { pil, onClose: () => setNewPillar(false), onCreated: (id) => setTab("p-" + id) }));
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
      }),
      h("div", { style: { marginTop: 18 } }, h(PSection, { title: "Rueda de la vida", open: false }, h(Embed, null, h(WheelView, { wheel: pil.ctx.wheel, onChange: pil.ctx.persistWheel })))));
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
    agenda: "M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4M8 14h3",
    progreso: "M4 20V10M10 20V4M16 20v-7M22 20H2"
  };
  function PillarsBottomBar({ tab, setTab }) {
    const h = React.createElement;
    const active = (id) => tab === id || (id === "home" && tab.startsWith("p-"));
    const item = (id, label) => h("button", { key: id, type: "button", onClick: () => setTab(id), className: "flex flex-col items-center gap-1", style: { minWidth: 56, color: active(id) ? C.text : C.textFaint, fontFamily: FONT_BODY, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", background: "transparent" } },
      h("svg", { viewBox: "0 0 24 24", width: 22, height: 22, fill: "none", stroke: active(id) ? C.gold : "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" }, h("path", { d: NAV_ICONS[id] })), label);
    return h("nav", { className: "sm:hidden fixed left-0 right-0 bottom-0 z-30 flex justify-around items-end", style: { background: "rgba(13,14,16,0.95)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.border}`, padding: "6px 4px calc(8px + env(safe-area-inset-bottom))" } },
      item("home", "Inicio"), item("agenda", "Agenda"), item("progreso", "Progreso"));
  }
