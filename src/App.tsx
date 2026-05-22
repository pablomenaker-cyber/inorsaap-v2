import { useState, useRef, useEffect } from "react";
// xlsx cargado via CDN en index.html

const SUPA_URL = "https://tsuimfubvaapmatfotin.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzdWltZnVidmFhcG1hdGZvdGluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODkxMzEsImV4cCI6MjA5NDk2NTEzMX0.r3DMVOx5UFZeu02Q6u3p5KhThHPT-Oa7fsJTOge3YX4";
const HEADERS = { "Content-Type": "application/json", apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` };

// ── Supabase helpers ───────────────────────────────────────────
const db = {
  get: async (table, params = "") => {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?${params}`, { headers: HEADERS });
    return r.json();
  },
  post: async (table, body) => {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}`, { method: "POST", headers: { ...HEADERS, Prefer: "return=representation" }, body: JSON.stringify(body) });
    return r.json();
  },
  patch: async (table, match, body) => {
    const r = await fetch(`${SUPA_URL}/rest/v1/${table}?${match}`, { method: "PATCH", headers: { ...HEADERS, Prefer: "return=representation" }, body: JSON.stringify(body) });
    return r.json();
  },
  del: async (table, match) => {
    await fetch(`${SUPA_URL}/rest/v1/${table}?${match}`, { method: "DELETE", headers: HEADERS });
  },
  upload: async (bucket, path, base64, mime) => {
    const blob = await fetch(base64).then(r => r.blob());
    const r = await fetch(`${SUPA_URL}/storage/v1/object/${bucket}/${path}`, { method: "POST", headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": mime }, body: blob });
    const data = await r.json();
    return `${SUPA_URL}/storage/v1/object/public/${bucket}/${path}`;
  }
};

// ── Brand / Styles ─────────────────────────────────────────────
const BRAND = "#3b82f6";
const DARK = "#0f172a";
const CYAN = "#06b6d4";
const SUCCESS = "#10b981";
const WARNING = "#f59e0b";
const s = {
  card: { background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "18px 16px", marginBottom: 12, border: "0.5px solid #e2e8f0" },
  input: { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 15, boxSizing: "border-box", background: "#f8fafc", outline: "none" },
  label: { fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.5px" },
};
const btn = (color = "brand", extra = {}) => ({
  flex: 1, padding: "11px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
  background: color === "brand" ? BRAND : color === "green" ? SUCCESS : color === "red" ? "#ef4444" : color === "blue" ? BRAND : color === "dark" ? DARK : color === "cyan" ? CYAN : "#f1f5f9",
  color: color === "gray" ? "#374151" : "#fff", letterSpacing: "0.2px", ...extra
});

const ZONE_PALETTE = [["#dbeafe","#1e40af"],["#dcfce7","#166534"],["#fef3c7","#92400e"],["#ede9fe","#5b21b6"],["#fce7f3","#9d174d"],["#ffedd5","#9a3412"],["#e0f2fe","#0c4a6e"],["#f0fdf4","#14532d"]];
const zoneColor = (zone, zones) => ZONE_PALETTE[zones.indexOf(zone) % ZONE_PALETTE.length] || ["#f1f5f9","#475569"];
const ZonePill = ({ zone, zones, style = {} }) => {
  if (!zone) return null;
  const [bg, color] = zoneColor(zone, zones);
  return <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px", whiteSpace: "nowrap", ...style }}>{zone}</span>;
};
const roleBadge = (role) => {
  const map = { admin: ["#fef3c7","#92400e","Admin"], visor: ["#ede9fe","#5b21b6","Visor"], chofer: ["#dbeafe","#1e40af","Chofer"] };
  const [bg, color, label] = map[role] || map.chofer;
  return <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "2px 10px" }}>{label}</span>;
};

const InorsaLogo = ({ height = 36, white = false }) => (
  <svg height={height} viewBox="0 0 560 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="4" y="82" fontFamily="Arial Black,sans-serif" fontWeight="900" fontSize="90" fontStyle="italic" fill={white ? "#fff" : DARK} letterSpacing="-2">INORSAPP</text>
    <text x="172" y="102" fontFamily="Arial,sans-serif" fontWeight="400" fontSize="15" fill={white ? "rgba(255,255,255,0.6)" : "#64748b"} letterSpacing="7">INGENIERÍA</text>
    <line x1="4" y1="90" x2="556" y2="90" stroke={white ? "rgba(255,255,255,0.3)" : BRAND} strokeWidth="2.5"/>
  </svg>
);

const UnitCard = ({ unit, style = {} }) => {
  if (!unit) return <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Sin unidad asignada</span>;
  return (
    <div style={{ background: "#f1f7fc", borderRadius: 10, padding: "10px 12px", fontSize: 13, ...style }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>🚛</span>
        <span style={{ fontWeight: 700, color: BRAND, fontSize: 14 }}>{unit.placas}</span>
        {unit.acoplado_placas && <><span style={{ color: "#94a3b8", fontSize: 12 }}>+</span><span style={{ fontWeight: 600, color: "#475569", fontSize: 13 }}>{unit.acoplado_placas}</span></>}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[unit.marca, unit.modelo, unit.anio, unit.color].filter(Boolean).map((v, i) => (
          <span key={i} style={{ fontSize: 12, color: "#64748b" }}>{v}</span>
        ))}
      </div>
    </div>
  );
};

// ── Spinner ────────────────────────────────────────────────────
const Spinner = ({ text = "Cargando..." }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
    <div style={{ width: 40, height: 40, border: `4px solid #e2e8f0`, borderTop: `4px solid ${BRAND}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <p style={{ color: "#64748b", fontSize: 14 }}>{text}</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Notifications Bell ────────────────────────────────────────
function NotificationsBell({ zones, users }) {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const unread = notifs.filter(n => !n.leida).length;

  useEffect(() => {
    const load = () => db.get("notificaciones", "select=*&order=created_at.desc&limit=30").then(d => setNotifs(Array.isArray(d) ? d : []));
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    await db.patch("notificaciones", `id=eq.${id}`, { leida: true });
    setNotifs(p => p.map(n => n.id === id ? { ...n, leida: true } : n));
  };
  const markAllRead = async () => {
    await Promise.all(notifs.filter(n => !n.leida).map(n => db.patch("notificaciones", `id=eq.${n.id}`, { leida: true })));
    setNotifs(p => p.map(n => ({ ...n, leida: true })));
  };

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#fff", fontSize: 18, position: "relative" }}>
        🔔
        {unread > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#dc2626", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 20, padding: "1px 5px", minWidth: 16, textAlign: "center" }}>{unread}</span>}
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: 44, width: 320, background: "#fff", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", zIndex: 1000, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, color: BRAND, fontSize: 15 }}>Notificaciones</span>
            {unread > 0 && <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", color: BRAND, fontSize: 12, fontWeight: 600 }}>Marcar todas leídas</button>}
          </div>
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {notifs.length === 0
              ? <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Sin notificaciones</div>
              : notifs.map(n => (
                <div key={n.id} onClick={() => markRead(n.id)} style={{ padding: "12px 16px", borderBottom: "1px solid #f8fafc", cursor: "pointer", background: n.leida ? "#fff" : "#f0f7ff", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>📦</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: n.leida ? 400 : 700, color: BRAND, fontSize: 13 }}>{n.titulo}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{n.mensaje}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{new Date(n.created_at).toLocaleString("es-MX")}</div>
                  </div>
                  {!n.leida && <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND, flexShrink: 0, marginTop: 4 }} />}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Signature Pad ──────────────────────────────────────────────
function SignaturePad({ onSave }) {
  const ref = useRef(null); const drawing = useRef(false);
  const pos = (e, c) => { const r = c.getBoundingClientRect(), src = e.touches ? e.touches[0] : e; return { x: src.clientX - r.left, y: src.clientY - r.top }; };
  const start = e => { drawing.current = true; const c = ref.current, ctx = c.getContext("2d"), p = pos(e, c); ctx.beginPath(); ctx.moveTo(p.x, p.y); e.preventDefault(); };
  const move = e => { if (!drawing.current) return; const c = ref.current, ctx = c.getContext("2d"), p = pos(e, c); ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.strokeStyle = BRAND; ctx.lineTo(p.x, p.y); ctx.stroke(); e.preventDefault(); };
  const end = () => { drawing.current = false; };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <canvas ref={ref} width={320} height={110} style={{ border: "1.5px solid #cbd5e1", borderRadius: 8, background: "#f8fafc", touchAction: "none", width: "100%", height: 110 }}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => ref.current.getContext("2d").clearRect(0, 0, 320, 110)} style={btn("gray")}>Limpiar</button>
        <button onClick={() => onSave(ref.current.toDataURL())} style={btn("brand")}>Guardar firma</button>
      </div>
    </div>
  );
}

// ── Excel Export ───────────────────────────────────────────────
function exportExcel(entregas, fecha) {
  const XLSX = window.XLSX;
  if (!XLSX) { alert("Error cargando librería Excel. Recarga la página."); return; }
  const hoy = fecha || new Date().toLocaleDateString("es-MX");
  const rows = entregas.filter(e => e.fecha === hoy).map(e => ({
    "Fecha": e.fecha,
    "Hora": e.hora,
    "Chofer": e.driver_name,
    "Zona": e.driver_zone || "—",
    "Unidad": e.unit_placas || "—",
    "Acoplado": e.unit_acoplado || "—",
    "Folio": e.folio || "—",
    "No. Remisión": e.remision,
    "Producto": e.producto || "—",
    "Cliente": e.destino,
    "Origen": e.origen,
    "Destino": e.destino,
    "Foto": e.foto_url ? "✓" : "—",
    "Firma": e.firma_url ? "✓" : "—",
  }));
  if (rows.length === 0) { alert("No hay entregas para la fecha seleccionada."); return; }
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [10,8,22,20,12,12,16,24,22,22,6,6].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Entregas");
  XLSX.writeFile(wb, `Inorsapp_Entregas_${hoy.replace(/\//g,"-")}.xlsx`);
}

// ── Login ──────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [users, setUsers] = useState([]);
  const [uid, setUid] = useState(""); const [pass, setPass] = useState(""); const [err, setErr] = useState(""); const [loading, setLoading] = useState(true);
  useEffect(() => { db.get("users", "select=*&order=name").then(d => { setUsers(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false)); }, []);
  const login = () => { const u = users.find(u => String(u.id) === String(uid)); if (u && u.password === pass) { setErr(""); onLogin(u); } else setErr("Usuario o contraseña incorrectos"); };
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${DARK}, #1e3a5f)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "40px 28px", width: "100%", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <InorsaLogo height={44} />
          <p style={{ color: "#94a3b8", fontSize: 13, margin: "10px 0 0", letterSpacing: "0.5px" }}>Sistema de registro de entregas</p>
        </div>
        {loading ? <Spinner text="Cargando usuarios..." /> : <>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Usuario</label>
            <select style={s.input} value={uid} onChange={e => setUid(e.target.value)}>
              <option value="">Seleccionar usuario...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}{u.role !== "chofer" ? ` (${u.role === "admin" ? "Admin" : "Visor"})` : ""}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={s.label}>Contraseña</label>
            <input style={s.input} type="password" placeholder="Contraseña" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          {err && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px" }}>{err}</p>}
          <button onClick={login} style={{ ...btn("brand"), width: "100%", padding: "12px 0", fontSize: 16, borderRadius: 10 }}>Ingresar</button>
        </>}
      </div>
    </div>
  );
}

// ── Driver Home ────────────────────────────────────────────────
function DriverHome({ driver, zones, unit, onNew, onLogout }) {
  const [entregas, setEntregas] = useState([]); const [loading, setLoading] = useState(true);
  const hoy = new Date().toLocaleDateString("es-MX");
  useEffect(() => { db.get("entregas", `select=*&driver_id=eq.${driver.id}&order=created_at.desc`).then(d => { setEntregas(Array.isArray(d) ? d : []); setLoading(false); }); }, [driver.id]);
  const hoyList = entregas.filter(e => e.fecha === hoy);
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px 12px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <InorsaLogo height={26} />
        <button onClick={onLogout} style={{ background: "none", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "6px 14px", cursor: "pointer", color: "#64748b", fontSize: 13, fontWeight: 500 }}>Salir</button>
      </div>
      <div style={{ background: `linear-gradient(135deg, ${DARK}, #1e3a5f)`, borderRadius: 20, color: "#fff", marginBottom: 14, padding: "20px 18px" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Hola, {driver.name.split(" ")[0]} 👋</div>
        <div style={{ fontSize: 13, opacity: .6, marginTop: 2 }}>{hoy}</div>
        {driver.zone && <div style={{ marginTop: 10 }}><ZonePill zone={driver.zone} zones={zones} style={{ background: "rgba(6,182,212,0.2)", color: "#67e8f9", border: "0.5px solid rgba(6,182,212,0.3)" }} /></div>}
      </div>
      {unit && <UnitCard unit={unit} style={{ marginBottom: 14 }} />}
      {loading ? <Spinner /> : <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {[["Hoy", hoyList.length], ["Total", entregas.length]].map(([l, v]) => (
            <div key={l} style={{ ...s.card, marginBottom: 0, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: BRAND }}>{v}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>Entregas {l}</div>
            </div>
          ))}
        </div>
        <button onClick={onNew} style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", cursor: "pointer", background: BRAND, color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 20, letterSpacing: "0.3px" }}>+ Nueva entrega</button>
        <h3 style={{ margin: "0 0 10px", color: BRAND, fontSize: 15 }}>Mis entregas de hoy</h3>
        {hoyList.length === 0 ? <div style={{ ...s.card, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Sin entregas registradas hoy</div>
          : hoyList.map(e => (
            <div key={e.id} style={s.card}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: BRAND }}>Rem. {e.remision}</span>
                <span style={{ background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "2px 10px" }}>✓</span>
              </div>
              <div style={{ fontSize: 13, color: "#475569" }}><b>Origen:</b> {e.origen}</div>
              <div style={{ fontSize: 13, color: "#475569" }}><b>Destino:</b> {e.destino}</div>
              <div style={{ fontSize: 13, color: "#475569" }}><b>Cliente:</b> {e.cliente} · {e.hora}</div>
            </div>
          ))}
      </>}
    </div>
  );
}

// ── New Delivery ───────────────────────────────────────────────
function NewDelivery({ driver, origins, destinations, products, unit, onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ origen: "", destino: "", producto: "", remision: "", folio: "", hora: new Date().toTimeString().slice(0, 5), foto: null, firma: null });
  const [signed, setSigned] = useState(false); const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handlePhoto = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => set("foto", ev.target.result); r.readAsDataURL(f); };
  const steps = ["Ruta", "Datos", "Foto", "Firma"];

  useEffect(() => {
    fetch(`${SUPA_URL}/rest/v1/rpc/get_next_folio`, {
      method: "POST",
      headers: { ...HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({})
    }).then(r => r.json()).then(num => {
      const folio = `IN-26-${String(num).padStart(5, "0")}`;
      set("folio", folio);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const ts = Date.now();
      let foto_url = null, firma_url = null;
      if (form.foto) foto_url = await db.upload("inorsapp", `fotos/${driver.id}_${ts}.jpg`, form.foto, "image/jpeg");
      if (form.firma) firma_url = await db.upload("inorsapp", `firmas/${driver.id}_${ts}.png`, form.firma, "image/png");
          const entrega = { driver_id: String(driver.id), driver_name: driver.name, driver_zone: driver.zone || "", unit_placas: unit?.placas || "", unit_acoplado: unit?.acoplado_placas || "", remision: form.remision, cliente: form.cliente, origen: form.origen, destino: form.destino, producto: form.producto, hora: form.hora, fecha: new Date().toLocaleDateString("es-MX"), foto_url, firma_url };
      await db.post("entregas", entrega);
      await db.post("notificaciones", {
        titulo: `Nueva entrega — ${driver.name}`,
        mensaje: `Rem. ${form.remision} · ${form.origen} → ${form.destino} · Cliente: ${form.cliente} · ${form.hora}`,
        entrega_id: entrega.id,
        leida: false
      });
      onSave(entrega);
    } catch (e) { alert("Error al guardar. Verifica tu conexión."); setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: BRAND, fontSize: 22 }}>←</button>
        <InorsaLogo height={24} />
      </div>
      {unit && <UnitCard unit={unit} style={{ marginBottom: 14 }} />}
      <div style={{ display: "flex", gap: 4, marginBottom: 22 }}>
        {steps.map((st, i) => (
          <div key={st} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 4, borderRadius: 2, background: i + 1 <= step ? BRAND : "#e2e8f0", marginBottom: 4 }} />
            <span style={{ fontSize: 11, color: i + 1 <= step ? BRAND : "#94a3b8", fontWeight: i + 1 === step ? 700 : 400 }}>{st}</span>
          </div>
        ))}
      </div>
      {step === 1 && (
        <div style={s.card}>
          <h3 style={{ margin: "0 0 16px", color: BRAND }}>¿De dónde a dónde?</h3>
          <div style={{ marginBottom: 14 }}><label style={s.label}>⛏️ Origen</label><select style={s.input} value={form.origen} onChange={e => set("origen", e.target.value)}><option value="">Seleccionar...</option>{origins.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}</select></div>
          <div style={{ marginBottom: 18 }}><label style={s.label}>🏁 Destino</label><select style={s.input} value={form.destino} onChange={e => set("destino", e.target.value)}><option value="">Seleccionar...</option>{destinations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</select></div>
          <button disabled={!form.origen || !form.destino} onClick={() => setStep(2)} style={{ ...btn("brand"), width: "100%", opacity: (!form.origen || !form.destino) ? 0.5 : 1 }}>Siguiente →</button>
        </div>
      )}
      {step === 2 && (
        <div style={s.card}>
          <h3 style={{ margin: "0 0 4px", color: BRAND }}>Datos de la entrega</h3>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14, padding: "6px 10px", background: "#f8fafc", borderRadius: 8 }}>{form.origen} → {form.destino} · {form.producto}</div>
          <div style={{ marginBottom: 12 }}>
            <label style={s.label}>Folio Inorsapp</label>
            <div style={{ ...s.input, background: "#f1f5f9", color: BRAND, fontWeight: 700, fontSize: 16, letterSpacing: "1px" }}>{form.folio || "Generando..."}</div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={s.label}>Número de remisión</label><input style={s.input} placeholder="Número del banco/mina" value={form.remision} onChange={e => set("remision", e.target.value)} /></div>
          <div style={{ marginBottom: 16 }}><label style={s.label}>Hora de entrega</label><input style={s.input} type="time" value={form.hora} onChange={e => set("hora", e.target.value)} /></div>
          <div style={{ display: "flex", gap: 8 }}><button onClick={() => setStep(1)} style={btn("gray")}>← Atrás</button><button disabled={!form.remision} onClick={() => setStep(3)} style={{ ...btn("brand"), opacity: !form.remision ? 0.5 : 1 }}>Siguiente →</button></div>
        </div>
      )}
      {step === 3 && (
        <div style={s.card}>
          <h3 style={{ margin: "0 0 16px", color: BRAND }}>Foto de la remisión</h3>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />
          {!form.foto ? <div onClick={() => fileRef.current.click()} style={{ border: `2px dashed ${BRAND}`, borderRadius: 12, padding: "40px 20px", textAlign: "center", cursor: "pointer", color: BRAND, opacity: .7 }}><div style={{ fontSize: 36, marginBottom: 8 }}>📷</div><div style={{ fontWeight: 600 }}>Toca para tomar foto</div></div>
            : <div style={{ position: "relative" }}><img src={form.foto} alt="rem" style={{ width: "100%", borderRadius: 10, maxHeight: 220, objectFit: "cover" }} /><button onClick={() => set("foto", null)} style={{ position: "absolute", top: 8, right: 8, background: "#dc2626", color: "#fff", border: "none", borderRadius: 20, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Retomar</button></div>}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}><button onClick={() => setStep(2)} style={btn("gray")}>← Atrás</button><button disabled={!form.foto} onClick={() => setStep(4)} style={{ ...btn("brand"), opacity: !form.foto ? 0.5 : 1 }}>Siguiente →</button></div>
        </div>
      )}
      {step === 4 && (
        <div style={s.card}>
          <h3 style={{ margin: "0 0 16px", color: BRAND }}>Firma del chofer</h3>
          <SignaturePad onSave={sig => { set("firma", sig); setSigned(true); }} />
          {signed && <p style={{ color: "#16a34a", fontSize: 13, marginTop: 8, fontWeight: 600 }}>✓ Firma guardada</p>}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={() => setStep(3)} style={btn("gray")}>← Atrás</button>
            <button disabled={!signed || saving} onClick={handleSave} style={{ ...btn("green"), opacity: (!signed || saving) ? 0.5 : 1 }}>{saving ? "Guardando..." : "✓ Guardar entrega"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Delivery Detail ────────────────────────────────────────────
function DeliveryDetail({ e, zones, onBack }) {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: BRAND, fontSize: 22 }}>←</button>
        <h2 style={{ margin: 0, color: BRAND, fontSize: 18 }}>Detalle de entrega</h2>
      </div>
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, color: BRAND, fontSize: 16 }}>Rem. {e.remision}</span>
          <span style={{ background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "2px 10px" }}>✓ Completado</span>
        </div>
        {e.driver_zone && <div style={{ marginBottom: 10 }}><ZonePill zone={e.driver_zone} zones={zones} /></div>}
        {[["Folio", e.folio || "—"], ["Chofer", e.driver_name], ["Unidad", e.unit_placas || "—"], ["Acoplado", e.unit_acoplado || "—"], ["Fecha", e.fecha], ["Hora", e.hora], ["Producto", e.producto || "—"], ["Origen", e.origen], ["Destino", e.destino], ["Remisión", e.remision]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 8, borderBottom: "1px solid #f1f5f9", padding: "7px 0", fontSize: 14 }}>
            <span style={{ color: "#64748b", minWidth: 70 }}>{k}</span>
            <span style={{ color: BRAND, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>
      {e.foto_url && <div style={s.card}><div style={{ fontWeight: 600, color: BRAND, marginBottom: 10 }}>📷 Foto de remisión</div><img src={e.foto_url} alt="rem" style={{ width: "100%", borderRadius: 10, maxHeight: 300, objectFit: "cover" }} /></div>}
      {e.firma_url && <div style={s.card}><div style={{ fontWeight: 600, color: BRAND, marginBottom: 10 }}>✍️ Firma del chofer</div><img src={e.firma_url} alt="firma" style={{ width: "100%", borderRadius: 8, maxHeight: 130, background: "#f8fafc", objectFit: "contain" }} /></div>}
    </div>
  );
}

// ── Deliveries Panel ───────────────────────────────────────────
function DeliveriesPanel({ zones, users }) {
  const [entregas, setEntregas] = useState([]); const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [filtZone, setFiltZone] = useState(""); const [filtDriver, setFiltDriver] = useState(""); const [filtDate, setFiltDate] = useState("");
  const [excelDate, setExcelDate] = useState("");
  const hoy = new Date().toLocaleDateString("es-MX");
  const choferes = users.filter(u => u.role === "chofer");

  useEffect(() => { db.get("entregas", "select=*&order=created_at.desc").then(d => { setEntregas(Array.isArray(d) ? d : []); setLoading(false); }); }, [deliveryView]);, "select=*&order=created_at.desc").then(d => { setEntregas(Array.isArray(d) ? d : []); setLoading(false); }); }, []);

  if (sel) return <DeliveryDetail e={sel} zones={zones} onBack={() => setSel(null)} />;
  const filtered = entregas.filter(e => (!filtZone || e.driver_zone === filtZone) && (!filtDriver || e.driver_id === filtDriver) && (!filtDate || e.fecha === filtDate));
  const zoneSummary = zones.reduce((acc, z) => { acc[z] = entregas.filter(e => e.driver_zone === z && e.fecha === hoy).length; return acc; }, {});

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "16px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ margin: 0, color: BRAND, fontSize: 17 }}>Entregas en tiempo real</h3>
        <button onClick={() => loading || setLoading(true) || db.get("entregas","select=*&order=created_at.desc").then(d=>{setEntregas(Array.isArray(d)?d:[]);setLoading(false);})} style={{ background: "none", border: `1.5px solid ${BRAND}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: BRAND, fontSize: 13 }}>↻ Actualizar</button>
      </div>

      {/* Zone cards */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        <div onClick={() => setFiltZone("")} style={{ ...s.card, marginBottom: 0, minWidth: 110, cursor: "pointer", textAlign: "center", border: filtZone === "" ? `2px solid ${BRAND}` : "2px solid transparent", flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: BRAND }}>{entregas.filter(e => e.fecha === hoy).length}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Todas</div>
        </div>
        {zones.filter(z => choferes.some(c => c.zone === z)).map(z => {
          const [bg, color] = zoneColor(z, zones);
          return (
            <div key={z} onClick={() => setFiltZone(filtZone === z ? "" : z)} style={{ ...s.card, marginBottom: 0, minWidth: 120, cursor: "pointer", textAlign: "center", border: filtZone === z ? "2px solid " + color : "2px solid transparent", background: filtZone === z ? bg : "#fff", flexShrink: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color }}>{zoneSummary[z] || 0}</div>
              <div style={{ fontSize: 11, color, marginTop: 2, fontWeight: filtZone === z ? 700 : 400 }}>{z}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ ...s.card, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 110 }}><label style={s.label}>Zona</label><select style={s.input} value={filtZone} onChange={e => setFiltZone(e.target.value)}><option value="">Todas</option>{zones.map(z => <option key={z}>{z}</option>)}</select></div>
        <div style={{ flex: 1, minWidth: 110 }}><label style={s.label}>Chofer</label><select style={s.input} value={filtDriver} onChange={e => setFiltDriver(e.target.value)}><option value="">Todos</option>{choferes.filter(c => !filtZone || c.zone === filtZone).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        <div style={{ flex: 1, minWidth: 110 }}><label style={s.label}>Fecha</label><input style={s.input} type="date" onChange={e => { const d = new Date(e.target.value + "T12:00:00"); setFiltDate(d.toLocaleDateString("es-MX")); }} /></div>
        <button onClick={() => { setFiltZone(""); setFiltDriver(""); setFiltDate(""); }} style={{ ...btn("gray"), padding: "10px 14px", flex: "none" }}>Limpiar</button>
      </div>

      {/* Excel export */}
      <div style={{ ...s.card, display: "flex", gap: 10, alignItems: "flex-end", background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
        <div style={{ flex: 1 }}>
          <label style={s.label}>📊 Exportar Excel — selecciona fecha</label>
          <input style={s.input} type="date" value={excelDate} onChange={e => setExcelDate(e.target.value)} />
        </div>
        <button onClick={() => { const fecha = excelDate ? new Date(excelDate + "T12:00:00").toLocaleDateString("es-MX") : hoy; exportExcel(entregas, fecha); }} style={{ ...btn("green"), flex: "none", padding: "10px 18px" }}>⬇ Descargar</button>
      </div>

      {loading ? <Spinner /> : filtered.length === 0
        ? <div style={{ ...s.card, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No hay entregas registradas</div>
        : filtered.map(e => (
          <div key={e.id} style={{ ...s.card, cursor: "pointer" }} onClick={() => setSel(e)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: BRAND, fontSize: 15 }}>Rem. {e.remision}</span>
                  {e.driver_zone && <ZonePill zone={e.driver_zone} zones={zones} />}
                </div>
                <div style={{ fontSize: 13, color: "#475569" }}>{e.driver_name} · {e.hora}</div>
                {e.unit_placas && <div style={{ fontSize: 12, color: "#64748b" }}>🚛 {e.unit_placas}{e.unit_acoplado ? " + " + e.unit_acoplado : ""}</div>}
                <div style={{ fontSize: 13, color: "#475569" }}>{e.origen} → {e.destino}</div>
                <div style={{ fontSize: 13, color: "#475569" }}>Cliente: {e.cliente}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span style={{ background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "2px 10px" }}>✓</span>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>{e.fecha}</div>
                {e.foto_url && <div style={{ fontSize: 11, color: BRAND, marginTop: 2 }}>📷</div>}
                {e.firma_url && <div style={{ fontSize: 11, color: "#7c3aed", marginTop: 2 }}>✍️</div>}
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ── Generic Catalog Panel ──────────────────────────────────────
function CatalogPanel({ title, icon, table, placeholder, hint }) {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState(""); const [err, setErr] = useState("");
  const [confirmDel, setConfirmDel] = useState(null); const [editing, setEditing] = useState(null); const [editVal, setEditVal] = useState("");
  useEffect(() => { db.get(table, "select=*&order=name").then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); }); }, [table]);
  const add = async () => { const v = newItem.trim(); if (!v) { setErr("Escribe un nombre"); return; } if (items.find(i => i.name.toLowerCase() === v.toLowerCase())) { setErr("Ya existe"); return; } const id = table[0] + "_" + Date.now(); const res = await db.post(table, { id, name: v }); setItems(p => [...p, res[0] || { id, name: v }]); setNewItem(""); setErr(""); };
  const saveEdit = async (id) => { const v = editVal.trim(); if (!v) return; await db.patch(table, `id=eq.${id}`, { name: v }); setItems(p => p.map(i => i.id === id ? { ...i, name: v } : i)); setEditing(null); };
  const del = async (id) => { await db.del(table, `id=eq.${id}`); setItems(p => p.filter(i => i.id !== id)); setConfirmDel(null); };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <h3 style={{ margin: 0, color: BRAND, fontSize: 17 }}>{title}</h3>
        <span style={{ marginLeft: "auto", background: "#dbeafe", color: "#1e40af", fontSize: 12, fontWeight: 700, borderRadius: 20, padding: "2px 10px" }}>{items.length}</span>
      </div>
      {hint && <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px", background: "#f1f5f9", borderRadius: 8, padding: "8px 12px" }}>{hint}</p>}
      <div style={{ ...s.card, display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 16 }}>
        <div style={{ flex: 1 }}><label style={s.label}>Nuevo registro</label><input style={s.input} placeholder={placeholder} value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />{err && <p style={{ color: "#dc2626", fontSize: 12, margin: "4px 0 0" }}>{err}</p>}</div>
        <button onClick={add} style={{ ...btn("brand"), flex: "none", padding: "10px 18px" }}>+ Agregar</button>
      </div>
      {loading ? <Spinner /> : items.length === 0 ? <div style={{ ...s.card, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>Sin registros</div>
        : items.map((item, idx) => (
          <div key={item.id} style={{ ...s.card, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>{idx + 1}</div>
            {editing === item.id
              ? <><input style={{ ...s.input, fontSize: 14, padding: "7px 10px" }} value={editVal} onChange={e => setEditVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") saveEdit(item.id); if (e.key === "Escape") setEditing(null); }} autoFocus /><button onClick={() => saveEdit(item.id)} style={{ ...btn("green"), flex: "none", padding: "7px 12px", fontSize: 12 }}>✓</button><button onClick={() => setEditing(null)} style={{ ...btn("gray"), flex: "none", padding: "7px 12px", fontSize: 12 }}>✕</button></>
              : <><span style={{ flex: 1, fontWeight: 600, color: BRAND, fontSize: 14 }}>{item.name}</span>
                <button onClick={() => { setEditing(item.id); setEditVal(item.name); }} style={{ background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: "#64748b", fontSize: 12 }}>Editar</button>
                {confirmDel === item.id
                  ? <div style={{ display: "flex", gap: 6 }}><button onClick={() => del(item.id)} style={{ ...btn("red"), flex: "none", padding: "5px 10px", fontSize: 12 }}>Confirmar</button><button onClick={() => setConfirmDel(null)} style={{ ...btn("gray"), flex: "none", padding: "5px 10px", fontSize: 12 }}>No</button></div>
                  : <button onClick={() => setConfirmDel(item.id)} style={{ background: "none", border: "1.5px solid #fecaca", borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: "#dc2626", fontSize: 12 }}>Eliminar</button>}
              </>}
          </div>
        ))}
    </div>
  );
}

function CatalogsPanel({ products, setProducts }) {
  const [sub, setSub] = useState("origins");
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "16px 12px" }}>
      <div style={{ display: "flex", gap: 0, marginBottom: 18, background: "#f1f5f9", borderRadius: 10, padding: 4 }}>
        {[["origins", "⛏️ Orígenes"], ["destinations", "🏁 Destinos"], ["products", "📦 Productos"]].map(([k, l]) => (
          <button key={k} onClick={() => setSub(k)} style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: sub === k ? 700 : 400, background: sub === k ? "#fff" : "transparent", color: sub === k ? BRAND : "#64748b", fontSize: 13 }}>{l}</button>
        ))}
      </div>
      {sub === "origins" ? <CatalogPanel title="Orígenes" icon="⛏️" table="origins" placeholder="Ej. Mina La Esperanza" hint="Los choferes seleccionarán desde esta lista." />
        : sub === "destinations" ? <CatalogPanel title="Destinos" icon="🏁" table="destinations" placeholder="Ej. Ferretera El Sol" hint="Los choferes seleccionarán desde esta lista." />
        : <CatalogPanel title="Productos" icon="📦" table="products" placeholder="Ej. Grava 3/4" hint="Los choferes seleccionarán el producto que transportan." />}
    </div>
  );
}

// ── Zones Panel ────────────────────────────────────────────────
function ZonesPanel({ zones, setZones }) {
  const [newZone, setNewZone] = useState(""); const [err, setErr] = useState(""); const [confirmDel, setConfirmDel] = useState(null);
  const add = async () => { const z = newZone.trim(); if (!z) { setErr("Escribe el nombre"); return; } if (zones.includes(z)) { setErr("Ya existe"); return; } await db.post("zones", { name: z }); setZones(p => [...p, z]); setNewZone(""); setErr(""); };
  const del = async (z) => { await db.del("zones", `name=eq.${encodeURIComponent(z)}`); setZones(p => p.filter(x => x !== z)); setConfirmDel(null); };
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "16px 12px" }}>
      <h3 style={{ margin: "0 0 14px", color: BRAND, fontSize: 17 }}>Zonas de operación</h3>
      <div style={{ ...s.card, display: "flex", gap: 10, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}><label style={s.label}>Nueva zona</label><input style={s.input} placeholder="Ej. Veracruz Puerto" value={newZone} onChange={e => setNewZone(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />{err && <p style={{ color: "#dc2626", fontSize: 12, margin: "4px 0 0" }}>{err}</p>}</div>
        <button onClick={add} style={{ ...btn("brand"), flex: "none", padding: "10px 16px" }}>+ Agregar</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {zones.map(z => { const [bg, color] = zoneColor(z, zones); return (
          <div key={z} style={{ ...s.card, marginBottom: 0, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: BRAND, fontSize: 14 }}>{z}</span>
            {confirmDel === z ? <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}><button onClick={() => del(z)} style={{ ...btn("red"), flex: "none", padding: "4px 10px", fontSize: 12 }}>Confirmar</button><button onClick={() => setConfirmDel(null)} style={{ ...btn("gray"), flex: "none", padding: "4px 10px", fontSize: 12 }}>No</button></div>
              : <button onClick={() => setConfirmDel(z)} style={{ marginLeft: "auto", background: "none", border: "1.5px solid #fecaca", borderRadius: 8, padding: "4px 10px", cursor: "pointer", color: "#dc2626", fontSize: 12 }}>Eliminar</button>}
          </div>
        );})}
      </div>
    </div>
  );
}

// ── Unit Form ──────────────────────────────────────────────────
function UnitForm({ fo, fn, choferes, err, onCancel, onSave, saveLabel }) {
  return (
    <div style={{ ...s.card, border: `1.5px solid ${BRAND}`, marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ flex: "1 1 45%", minWidth: 120 }}><label style={s.label}>Placas unidad *</label><input style={s.input} placeholder="BJR-1022" value={fo.placas||""} onChange={e => fn("placas", e.target.value)} /></div>
        <div style={{ flex: "1 1 45%", minWidth: 120 }}><label style={s.label}>Placas acoplado</label><input style={s.input} placeholder="TRE-1234" value={fo.acoplado_placas||""} onChange={e => fn("acoplado_placas", e.target.value)} /></div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ flex: "1 1 45%", minWidth: 120 }}><label style={s.label}>Marca</label><input style={s.input} placeholder="Kenworth" value={fo.marca||""} onChange={e => fn("marca", e.target.value)} /></div>
        <div style={{ flex: "1 1 45%", minWidth: 120 }}><label style={s.label}>Modelo</label><input style={s.input} placeholder="T800" value={fo.modelo||""} onChange={e => fn("modelo", e.target.value)} /></div>
        <div style={{ flex: "1 1 45%", minWidth: 120 }}><label style={s.label}>Año</label><input style={s.input} placeholder="2020" value={fo.anio||""} onChange={e => fn("anio", e.target.value)} /></div>
        <div style={{ flex: "1 1 45%", minWidth: 120 }}><label style={s.label}>Color</label><input style={s.input} placeholder="Blanco" value={fo.color||""} onChange={e => fn("color", e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: 14 }}><label style={s.label}>Chofer asignado</label><select style={s.input} value={fo.driver_id||""} onChange={e => fn("driver_id", e.target.value)}><option value="">Sin asignar</option>{choferes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      {err && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 10px" }}>{err}</p>}
      <div style={{ display: "flex", gap: 8 }}><button onClick={onCancel} style={btn("gray")}>Cancelar</button><button onClick={onSave} style={btn("green")}>{saveLabel}</button></div>
    </div>
  );
}

// ── Units Panel ────────────────────────────────────────────────
function UnitsPanel({ users }) {
  const [units, setUnits] = useState([]); const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); const [form, setForm] = useState({ placas: "", acoplado_placas: "", marca: "", modelo: "", anio: "", color: "", driver_id: "" });
  const [err, setErr] = useState(""); const [confirmDel, setConfirmDel] = useState(null); const [editing, setEditing] = useState(null); const [editForm, setEditForm] = useState(null);
  const choferes = users.filter(u => u.role === "chofer");
  useEffect(() => { db.get("units", "select=*&order=placas").then(d => { setUnits(Array.isArray(d) ? d : []); setLoading(false); }); }, []);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const ef = (k, v) => setEditForm(p => ({ ...p, [k]: v }));
  const addUnit = async () => { if (!form.placas.trim()) { setErr("Las placas son requeridas"); return; } const id = "unit_" + Date.now(); const body = { ...form, id, placas: form.placas.trim().toUpperCase(), acoplado_placas: form.acoplado_placas.trim().toUpperCase() }; await db.post("units", body); setUnits(p => [...p, body]); setForm({ placas: "", acoplado_placas: "", marca: "", modelo: "", anio: "", color: "", driver_id: "" }); setShowForm(false); setErr(""); };
  const saveEdit = async (id) => { const body = { ...editForm, placas: editForm.placas.trim().toUpperCase(), acoplado_placas: editForm.acoplado_placas.trim().toUpperCase() }; await db.patch("units", `id=eq.${id}`, body); setUnits(p => p.map(u => u.id === id ? body : u)); setEditing(null); };
  const iRow = (lbl, key, ph, fo, fn) => <div style={{ flex: "1 1 45%", minWidth: 120 }}><label style={s.label}>{lbl}</label><input style={s.input} placeholder={ph} value={fo[key]||""} onChange={e => fn(key, e.target.value)} /></div>;
  const UForm = ({ fo, fn, onCancel, onSave, saveLabel }) => (
    <div style={{ ...s.card, border: `1.5px solid ${BRAND}`, marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>{iRow("Placas unidad *","placas","BJR-1022",fo,fn)}{iRow("Placas acoplado","acoplado_placas","TRE-1234",fo,fn)}</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>{iRow("Marca","marca","Kenworth",fo,fn)}{iRow("Modelo","modelo","T800",fo,fn)}{iRow("Año","anio","2020",fo,fn)}{iRow("Color","color","Blanco",fo,fn)}</div>
      <div style={{ marginBottom: 14 }}><label style={s.label}>Chofer asignado</label><select style={s.input} value={fo.driver_id} onChange={e => fn("driver_id", e.target.value)}><option value="">Sin asignar</option>{choferes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      {err && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 10px" }}>{err}</p>}
      <div style={{ display: "flex", gap: 8 }}><button onClick={onCancel} style={btn("gray")}>Cancelar</button><button onClick={onSave} style={btn("green")}>{saveLabel}</button></div>
    </div>
  );
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "16px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: BRAND, fontSize: 17 }}>Unidades y acoplados</h3>
        <button onClick={() => setShowForm(!showForm)} style={{ ...btn("brand"), flex: "none", padding: "8px 16px", fontSize: 13 }}>{showForm ? "Cancelar" : "+ Nueva unidad"}</button>
      </div>
      {showForm && <UnitForm fo={form} fn={f} choferes={choferes} err={err} onCancel={() => { setShowForm(false); setErr(""); }} onSave={addUnit} saveLabel="✓ Registrar" />}
      {loading ? <Spinner /> : units.length === 0 ? <div style={{ ...s.card, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No hay unidades registradas</div>
        : units.map(unit => {
          const chofer = choferes.find(c => String(c.id) === String(unit.driver_id));
          return editing === unit.id && editForm
            ? <UnitForm key={unit.id} fo={editForm} fn={ef} choferes={choferes} err={err} onCancel={() => { setEditing(null); setEditForm(null); }} onSave={() => saveEdit(unit.id)} saveLabel="✓ Guardar cambios" />
            : (
              <div key={unit.id} style={s.card}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: "#f1f7fc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🚛</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: BRAND, fontSize: 16 }}>{unit.placas}</span>
                      {unit.acoplado_placas && <><span style={{ color: "#94a3b8", fontSize: 13 }}>+ acoplado</span><span style={{ fontWeight: 600, color: "#475569" }}>{unit.acoplado_placas}</span></>}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      {[unit.marca, unit.modelo, unit.anio, unit.color].filter(Boolean).map((v, i) => <span key={i} style={{ fontSize: 12, color: "#64748b", background: "#f1f5f9", borderRadius: 6, padding: "2px 8px" }}>{v}</span>)}
                    </div>
                    <div style={{ fontSize: 13, color: chofer ? "#475569" : "#94a3b8", fontStyle: chofer ? "normal" : "italic" }}>{chofer ? `👤 ${chofer.name}` : "Sin chofer asignado"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => { setEditing(unit.id); setEditForm({ ...unit }); }} style={{ background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#64748b", fontSize: 12 }}>Editar</button>
                    {confirmDel === unit.id
                      ? <div style={{ display: "flex", gap: 4 }}><button onClick={async () => { await db.del("units", `id=eq.${unit.id}`); setUnits(p => p.filter(u => u.id !== unit.id)); setConfirmDel(null); }} style={{ ...btn("red"), flex: "none", padding: "6px 10px", fontSize: 12 }}>Confirmar</button><button onClick={() => setConfirmDel(null)} style={{ ...btn("gray"), flex: "none", padding: "6px 10px", fontSize: 12 }}>No</button></div>
                      : <button onClick={() => setConfirmDel(unit.id)} style={{ background: "none", border: "1.5px solid #fecaca", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#dc2626", fontSize: 12 }}>Eliminar</button>}
                  </div>
                </div>
              </div>
            );
        })}
    </div>
  );
}

// ── Users Panel ────────────────────────────────────────────────
function UsersPanel({ users, setUsers, zones }) {
  const [showForm, setShowForm] = useState(false); const [form, setForm] = useState({ name: "", password: "", role: "chofer", zone: "" });
  const [err, setErr] = useState(""); const [confirmDel, setConfirmDel] = useState(null); const [editZone, setEditZone] = useState(null); const [editZoneVal, setEditZoneVal] = useState("");
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const addUser = async () => {
    if (!form.name.trim() || !form.password.trim()) { setErr("Completa todos los campos"); return; }
    const body = { name: form.name.trim(), password: form.password, role: form.role, zone: form.zone };
    const res = await db.post("users", body);
    setUsers(p => [...p, res[0] || body]); setForm({ name: "", password: "", role: "chofer", zone: "" }); setShowForm(false); setErr("");
  };
  const saveZone = async (id) => { await db.patch("users", `id=eq.${id}`, { zone: editZoneVal }); setUsers(p => p.map(u => u.id === id ? { ...u, zone: editZoneVal } : u)); setEditZone(null); };
  const [editPass, setEditPass] = useState(null); const [newPass, setNewPass] = useState(""); const [passErr, setPassErr] = useState("");
  const savePass = async (id) => {
    if (!newPass.trim() || newPass.trim().length < 4) { setPassErr("Mínimo 4 caracteres"); return; }
    await db.patch("users", `id=eq.${id}`, { password: newPass.trim() });
    setUsers(p => p.map(u => u.id === id ? { ...u, password: newPass.trim() } : u));
    setEditPass(null); setNewPass(""); setPassErr("");
  };
  const delUser = async (id) => { await db.del("users", `id=eq.${id}`); setUsers(p => p.filter(u => u.id !== id)); setConfirmDel(null); };
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "16px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: BRAND, fontSize: 17 }}>Gestión de usuarios</h3>
        <button onClick={() => setShowForm(!showForm)} style={{ ...btn("brand"), flex: "none", padding: "8px 16px", fontSize: 13 }}>{showForm ? "Cancelar" : "+ Nuevo usuario"}</button>
      </div>
      {showForm && (
        <div style={{ ...s.card, border: "1.5px solid #bfdbfe", marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 14px", color: BRAND }}>Nuevo usuario</h4>
          <div style={{ marginBottom: 12 }}><label style={s.label}>Nombre completo</label><input style={s.input} placeholder="Ej. Roberto García" value={form.name} onChange={e => f("name", e.target.value)} /></div>
          <div style={{ marginBottom: 12 }}><label style={s.label}>Contraseña</label><input style={s.input} type="password" value={form.password} onChange={e => f("password", e.target.value)} /></div>
          <div style={{ marginBottom: 12 }}><label style={s.label}>Rol</label><select style={s.input} value={form.role} onChange={e => f("role", e.target.value)}><option value="chofer">Chofer</option><option value="visor">Visor</option><option value="admin">Admin</option></select></div>
          {form.role === "chofer" && <div style={{ marginBottom: 14 }}><label style={s.label}>Zona</label><select style={s.input} value={form.zone} onChange={e => f("zone", e.target.value)}><option value="">Sin zona</option>{zones.map(z => <option key={z}>{z}</option>)}</select></div>}
          {err && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 10px" }}>{err}</p>}
          <div style={{ display: "flex", gap: 8 }}><button onClick={() => { setShowForm(false); setErr(""); }} style={btn("gray")}>Cancelar</button><button onClick={addUser} style={btn("green")}>✓ Crear</button></div>
        </div>
      )}
      {users.map(u => (
        <div key={u.id} style={s.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: u.role === "admin" ? "#fef3c7" : u.role === "visor" ? "#ede9fe" : "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{u.role === "admin" ? "🛡️" : u.role === "visor" ? "👁️" : "🚛"}</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: BRAND, fontSize: 15 }}>{u.name}</div><div style={{ fontSize: 12, color: "#94a3b8" }}>{u.id}</div></div>
            {roleBadge(u.role)}
            {u.id !== "admin" && (confirmDel === u.id
              ? <div style={{ display: "flex", gap: 6 }}><button onClick={() => delUser(u.id)} style={{ ...btn("red"), flex: "none", padding: "6px 12px", fontSize: 12 }}>Confirmar</button><button onClick={() => setConfirmDel(null)} style={{ ...btn("gray"), flex: "none", padding: "6px 12px", fontSize: 12 }}>No</button></div>
              : <button onClick={() => setConfirmDel(u.id)} style={{ background: "none", border: "1.5px solid #fecaca", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>Eliminar</button>)}
          </div>
          {u.role === "chofer" && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#64748b", minWidth: 40 }}>Zona:</span>
              {editZone === u.id
                ? <><select style={{ ...s.input, fontSize: 13, padding: "6px 10px" }} value={editZoneVal} onChange={e => setEditZoneVal(e.target.value)}><option value="">Sin zona</option>{zones.map(z => <option key={z}>{z}</option>)}</select><button onClick={() => saveZone(u.id)} style={{ ...btn("green"), flex: "none", padding: "6px 12px", fontSize: 12 }}>✓</button><button onClick={() => setEditZone(null)} style={{ ...btn("gray"), flex: "none", padding: "6px 12px", fontSize: 12 }}>✕</button></>
                : <>{u.zone ? <ZonePill zone={u.zone} zones={zones} /> : <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Sin zona</span>}<button onClick={() => { setEditZone(u.id); setEditZoneVal(u.zone || ""); }} style={{ marginLeft: 4, background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "4px 10px", cursor: "pointer", color: "#64748b", fontSize: 12 }}>Cambiar</button></>}
            </div>
          )}
          {/* Cambio de contraseña */}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#64748b", minWidth: 40 }}>Pass:</span>
            {editPass === u.id
              ? <div style={{ display: "flex", gap: 6, flex: 1, alignItems: "center", flexWrap: "wrap" }}>
                  <input style={{ ...s.input, fontSize: 13, padding: "6px 10px", flex: 1, minWidth: 120 }} type="password" placeholder="Nueva contraseña" value={newPass} onChange={e => { setNewPass(e.target.value); setPassErr(""); }} />
                  {passErr && <span style={{ fontSize: 11, color: "#dc2626", width: "100%" }}>{passErr}</span>}
                  <button onClick={() => savePass(u.id)} style={{ ...btn("green"), flex: "none", padding: "6px 12px", fontSize: 12 }}>✓</button>
                  <button onClick={() => { setEditPass(null); setNewPass(""); setPassErr(""); }} style={{ ...btn("gray"), flex: "none", padding: "6px 12px", fontSize: 12 }}>✕</button>
                </div>
              : <><span style={{ fontSize: 12, color: "#94a3b8" }}>••••••</span><button onClick={() => { setEditPass(u.id); setNewPass(""); }} style={{ marginLeft: 4, background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "4px 10px", cursor: "pointer", color: "#64748b", fontSize: 12 }}>Cambiar</button></>
            }
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Backoffice Shell ───────────────────────────────────────────
function BackofficeShell({ user, users, setUsers, zones, setZones, products, setProducts, onLogout }) {
  const [tab, setTab] = useState("entregas");
  const [deliveryView, setDeliveryView] = useState("list");
  const tabs = user.role === "admin"
    ? [["entregas","📦 Entregas"],["unidades","🚛 Unidades"],["usuarios","👥 Usuarios"],["zonas","📍 Zonas"],["catalogos","🗂️ Catálogos"]]
    : [["entregas","📦 Entregas"]];

  const handleTabClick = (key) => {
    setTab(key);
    if (key === "entregas") setDeliveryView("list");
  };
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: DARK, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <InorsaLogo height={28} white />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <NotificationsBell />
          <span style={{ background: "rgba(59,130,246,0.25)", color: "#93c5fd", fontSize: 11, borderRadius: 20, padding: "2px 10px", fontWeight: 600 }}>{user.role === "admin" ? "Admin" : "Visor"}</span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{user.name}</span>
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#fff", fontSize: 13 }}>Salir</button>
        </div>
      </div>
      <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", display: "flex", overflowX: "auto" }}>
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => handleTabClick(key)} style={{ padding: "13px 16px", border: "none", background: "none", cursor: "pointer", fontWeight: tab === key ? 700 : 400, color: tab === key ? BRAND : "#94a3b8", borderBottom: tab === key ? `2px solid ${BRAND}` : "2px solid transparent", fontSize: 13, whiteSpace: "nowrap", transition: "color 0.2s" }}>{label}</button>
        ))}
      </div>
      <div>
        {tab === "entregas" && <DeliveriesPanel zones={zones} users={users} deliveryView={deliveryView} setDeliveryView={setDeliveryView} />}
        {tab === "unidades" && user.role === "admin" && <UnitsPanel users={users} />}
        {tab === "usuarios" && user.role === "admin" && <UsersPanel users={users} setUsers={setUsers} zones={zones} />}
        {tab === "zonas" && user.role === "admin" && <ZonesPanel zones={zones} setZones={setZones} />}
        {tab === "catalogos" && user.role === "admin" && <CatalogsPanel products={products} setProducts={setProducts} />}
      </div>
    </div>
  );
}

// ── App Root ───────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [zones, setZones] = useState([]);
  const [units, setUnits] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("home");
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    Promise.all([
      db.get("users", "select=*&order=name"),
      db.get("zones", "select=*&order=name"),
      db.get("units", "select=*&order=placas"),
      db.get("origins", "select=*&order=name"),
      db.get("destinations", "select=*&order=name"),
      db.get("products", "select=*&order=name"),
    ]).then(([u, z, un, o, d, pr]) => {
      console.log("users:", u);
      console.log("zones:", z);
      setUsers(Array.isArray(u) ? u : []);
      setZones(Array.isArray(z) ? z.map(x => x.name) : []);
      setUnits(Array.isArray(un) ? un : []);
      setOrigins(Array.isArray(o) ? o : []);
      setDestinations(Array.isArray(d) ? d : []);
      setProducts(Array.isArray(pr) ? pr : []);
      setAppReady(true);
    }).catch(err => {
      console.error("Error cargando datos:", err);
      setAppReady(true);
    });
  }, []);

  if (!appReady) return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${DARK}, #1e3a5f)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <InorsaLogo height={50} white />
      <Spinner text="Iniciando Inorsapp..." />
    </div>
  );

  if (!session) return <Login onLogin={u => { setSession(u); setView("home"); }} />;

  if (session.role === "chofer") {
    const fresh = users.find(u => u.id === session.id) || session;
    const unit = units.find(u => String(u.driver_id) === String(fresh.id)) || null;
    if (view === "new") return <NewDelivery driver={fresh} origins={origins} destinations={destinations} products={products} unit={unit} onSave={() => setView("home")} onCancel={() => setView("home")} />;
    return <DriverHome driver={fresh} zones={zones} unit={unit} onNew={() => setView("new")} onLogout={() => setSession(null)} />;
  }

  return <BackofficeShell user={session} users={users} setUsers={setUsers} zones={zones} setZones={setZones} products={products} setProducts={setProducts} onLogout={() => setSession(null)} />;
}
