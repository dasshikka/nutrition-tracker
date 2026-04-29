import { useState, useEffect, useRef } from "react";
import frogImg from "./assets/frog.png";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PAST_DAYS = [
  { date: "Apr 21", calMin: 1436, calMax: 1583, protMin: 71,    protMax: 79,    activity: "3km run",               type: "light"  },
  { date: "Apr 22", calMin: 1417, calMax: 1602, protMin: 100.7, protMax: 108.7, activity: "13,185 steps",           type: "light"  },
  { date: "Apr 23", calMin: 2000, calMax: 2150, protMin: 105,   protMax: 115,   activity: "8k steps + kickboxing",  type: "active" },
  { date: "Apr 24", calMin: 1540, calMax: 1635, protMin: 97.9,  protMax: 107.9, activity: "Beach volleyball",       type: "light"  },
  { date: "Apr 25", calMin: 1915, calMax: 2220, protMin: 105,   protMax: 122,   activity: "5km run + 11k steps",    type: "active" },
  { date: "Apr 26", calMin: 2145, calMax: 2315, protMin: 124,   protMax: 135,   activity: "9,655 steps",            type: "light"  },
  { date: "Apr 27", calMin: 1915, calMax: 2220, protMin: 105,   protMax: 122,   activity: "5km run + 11k steps",    type: "active" },
];

const INITIAL_MEALS = [
  { id: 1, name: "2 soft boiled eggs",         kcal: 140, protein: 12, note: "" },
  { id: 2, name: "Wholegrain bread with seeds", kcal: 110, protein: 4,  note: "" },
  { id: 3, name: "Fresh orange juice 300ml",    kcal: 120, protein: 2,  note: "" },
  { id: 4, name: "Shrimp dish (350g)",          kcal: 470, protein: 34, note: "" },
];

const SAVED_FOODS = [
  { name: "2 soft boiled eggs",         kcal: 140, protein: 12 },
  { name: "Wholegrain bread (1 slice)",  kcal: 110, protein: 4  },
  { name: "Greek yogurt 150g",           kcal: 90,  protein: 13 },
  { name: "Chicken breast 100g",         kcal: 165, protein: 31 },
  { name: "Shrimp 100g",                kcal: 99,  protein: 24 },
  { name: "Cottage cheese 100g",         kcal: 98,  protein: 11 },
];

const DEFAULT_SAVED_ACTIVITIES = [
  { id: "kb1h",   name: "Kickboxing 1h",      kcal: 480 },
  { id: "run5",   name: "Running 5km",         kcal: 300 },
  { id: "walk10", name: "Walking 10k steps",   kcal: 350 },
  { id: "jj1h",   name: "Jiu-jitsu 1h",       kcal: 420 },
  { id: "yoga",   name: "Yoga 45min",          kcal: 180 },
];

const DEFAULT_TARGETS = {
  light:  { calMin: 1800, calMax: 1900, protMin: 90,  protMax: 120 },
  active: { calMin: 2200, calMax: 2400, protMin: 90,  protMax: 120 },
};

// ─── MOOD ─────────────────────────────────────────────────────────────────────

function getFrogMood(kcal, prot, calMin, protMin) {
  const avg = (Math.min(1, kcal / calMin) + Math.min(1, prot / protMin)) / 2;
  if (avg >= 0.85) return "satisfied";
  if (avg >= 0.50) return "attentive";
  return "neutral";
}

// Updated microcopy — shorter, softer
const MOOD_LINE = {
  neutral:   "steady today",
  attentive: "quiet progress",
  satisfied: "well done today",
};

// ─── STATUS ───────────────────────────────────────────────────────────────────

function getStatus(calMin, calMax, protMin, protMax, type) {
  const t = DEFAULT_TARGETS[type] || DEFAULT_TARGETS.light;
  if (calMax >= t.calMin && calMin <= t.calMax && protMax >= t.protMin) return "on-target";
  if (calMax >= t.calMin * 0.88 && protMax >= t.protMin * 0.85)        return "close";
  return "below";
}

const statusConfig = {
  "on-target": { label: "balanced", color: "#5a7a00", bg: "#f2f8e0" },
  "close":     { label: "close",    color: "#7a6200", bg: "#faf4dc" },
  "below":     { label: "building", color: "#7a4a30", bg: "#faede6" },
};

// ─── FOOD API ─────────────────────────────────────────────────────────────────

async function analyzeFood({ text, imageBase64, imageType }) {
  const content = [];
  if (imageBase64) content.push({ type: "image", source: { type: "base64", media_type: imageType, data: imageBase64 } });
  const prompt = imageBase64
    ? `Analyze this meal photo. Estimate calories and protein. Respond ONLY with valid JSON: {"name":"meal name","kcal":number,"protein":number,"note":"brief description"}`
    : `Food: "${text}". Estimate calories and protein for a standard portion. Respond ONLY with valid JSON: {"name":"${text}","kcal":number,"protein":number,"note":"brief note"}`;
  content.push({ type: "text", text: prompt });
  const res  = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 200, messages: [{ role: "user", content }] }),
  });
  const data = await res.json();
  const raw  = data.content?.find(b => b.type === "text")?.text || "{}";
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

// ─── RING with percentage ─────────────────────────────────────────────────────

function Ring({ value, max, color, trackColor, size = 84 }) {
  const r      = 34;
  const circ   = 2 * Math.PI * r;
  const pct    = Math.min(1, value / max);
  const filled = pct * circ;
  const pctLabel = Math.round(pct * 100) + "%";
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
      <circle cx="40" cy="40" r={r} fill="none" stroke={trackColor} strokeWidth="6.5" strokeLinecap="round" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6.5"
        strokeDasharray={`${filled} ${circ}`} strokeDashoffset={circ / 4}
        strokeLinecap="round" transform="rotate(-90 40 40)"
        style={{ transition: "stroke-dasharray 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
      {/* Subtle percentage — very small, secondary */}
      <text x="40" y="44" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="9" fontWeight="400" fill={color} opacity="0.55">{pctLabel}</text>
    </svg>
  );
}

// ─── FROG AREA ────────────────────────────────────────────────────────────────
// Real image embedded. IMAGE SWAP: replace src with frogImages[mood] when mood assets ready.

function FrogArea({ mood }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      {/* Character zone: 90px wide, fills vertical space, sits bottom-left */}
      <img
        src={frogImg}
        alt=""
        style={{ width: 90, height: 130, objectFit: "contain", objectPosition: "bottom center", display: "block", marginBottom: 6, opacity: 0.92 }}
      />
      <div style={{ fontSize: 11, color: "#9aa0b8", fontFamily: "DM Sans,sans-serif", fontWeight: 400, lineHeight: 1.4, letterSpacing: "0.01em" }}>
        {MOOD_LINE[mood]}
      </div>
    </div>
  );
}

function Spinner() {
  return <div style={{ display: "inline-block", width: 13, height: 13, border: "2px solid rgba(140,158,255,0.2)", borderTop: "2px solid #8C9EFF", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />;
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "rgba(26,31,54,0.88)", color: "#fff", borderRadius: 99, padding: "8px 18px", fontSize: 12, fontFamily: "DM Sans,sans-serif", fontWeight: 500, whiteSpace: "nowrap", pointerEvents: "none", zIndex: 200, letterSpacing: "0.01em" }}>
      {msg}
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [dayType,       setDayType]       = useState(() => { try { return localStorage.getItem("dayType_v11")     || null;  } catch { return null; } });
  const [meals,         setMeals]         = useState(() => { try { const s = localStorage.getItem("meals_v11");   return s ? JSON.parse(s) : INITIAL_MEALS; } catch { return INITIAL_MEALS; } });
  const [history,       setHistory]       = useState(() => { try { const s = localStorage.getItem("history_v11"); return s ? JSON.parse(s) : PAST_DAYS;     } catch { return PAST_DAYS;     } });
  const [customTargets, setCustomTargets] = useState(() => { try { const s = localStorage.getItem("targets_v11"); return s ? JSON.parse(s) : null;           } catch { return null; } });
  const [savedActivities, setSavedActivities] = useState(() => { try { const s = localStorage.getItem("savedActs_v11"); return s ? JSON.parse(s) : DEFAULT_SAVED_ACTIVITIES; } catch { return DEFAULT_SAVED_ACTIVITIES; } });

  const [tab,          setTab]          = useState("today");
  const [addLevel1,    setAddLevel1]    = useState("food");
  const [foodMethod,   setFoodMethod]   = useState("write");
  const [query,        setQuery]        = useState("");
  const [grams,        setGrams]        = useState(100);
  const [preview,      setPreview]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [photoData,    setPhotoData]    = useState(null);
  const [expandedFood, setExpandedFood] = useState(null);
  const [favGrams,     setFavGrams]     = useState({});
  const [actLog,       setActLog]       = useState(() => { try { const s = localStorage.getItem("actLog_v11"); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [stepsInput,   setStepsInput]   = useState("");
  const [manualInput,  setManualInput]  = useState("");
  const [showSummary,  setShowSummary]  = useState(false);
  const [daySaved,     setDaySaved]     = useState(false);
  const [showTargetEd, setShowTargetEd] = useState(false);
  const [editCalMax,   setEditCalMax]   = useState("");
  const [editProtMax,  setEditProtMax]  = useState("");
  const [showNewAct,   setShowNewAct]   = useState(false);
  const [newActName,   setNewActName]   = useState("");
  const [newActKcal,   setNewActKcal]   = useState("");
  const [toast,        setToast]        = useState("");
  const toastTimer = useRef(null);
  const fileRef    = useRef();

  useEffect(() => { try { localStorage.setItem("meals_v11",      JSON.stringify(meals));           } catch {} }, [meals]);
  useEffect(() => { try { localStorage.setItem("history_v11",    JSON.stringify(history));         } catch {} }, [history]);
  useEffect(() => { try { localStorage.setItem("actLog_v11",     JSON.stringify(actLog));          } catch {} }, [actLog]);
  useEffect(() => { try { localStorage.setItem("savedActs_v11",  JSON.stringify(savedActivities)); } catch {} }, [savedActivities]);
  useEffect(() => { try { if (dayType)       localStorage.setItem("dayType_v11",  dayType);        } catch {} }, [dayType]);
  useEffect(() => { try { if (customTargets) localStorage.setItem("targets_v11",  JSON.stringify(customTargets)); } catch {} }, [customTargets]);

  const baseTarget   = DEFAULT_TARGETS[dayType || "light"];
  const target = customTargets ? { calMin: Math.round(customTargets.calMax * 0.95), calMax: customTargets.calMax, protMin: Math.round(customTargets.protMax * 0.75), protMax: customTargets.protMax } : baseTarget;
  const activityBurn = actLog.reduce((s, e) => s + e.kcal, 0);
  const adjCalMin    = target.calMin + activityBurn;
  const adjCalMax    = target.calMax + activityBurn;
  const totalKcal    = Math.round(meals.reduce((s, m) => s + Number(m.kcal), 0));
  const totalProt    = Math.round(meals.reduce((s, m) => s + Number(m.protein), 0));
  const mood         = getFrogMood(totalKcal, totalProt, adjCalMin, target.protMin);
  const historyDesc  = [...history].reverse();

  function showToast(msg) { setToast(msg); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(""), 2200); }

  async function handleEstimate() {
    if (!query.trim()) return;
    setLoading(true); setError(""); setPreview(null);
    try { const r = await analyzeFood({ text: query }); setGrams(100); setPreview({ ...r, baseKcal: r.kcal, baseProt: r.protein, baseGrams: 100 }); }
    catch { setError("Couldn't estimate — try again"); }
    setLoading(false);
  }

  async function handleAnalyzePhoto() {
    if (!photoData) return;
    setLoading(true); setError(""); setPreview(null);
    try { const r = await analyzeFood({ imageBase64: photoData.base64, imageType: photoData.type }); setGrams(100); setPreview({ ...r, baseKcal: r.kcal, baseProt: r.protein, baseGrams: 100 }); }
    catch { setError("Couldn't analyze — try again"); }
    setLoading(false);
  }

  function handleGramsChange(val) {
    setGrams(val);
    if (preview?.baseGrams) { const ratio = val / preview.baseGrams; setPreview(p => ({ ...p, kcal: Math.round(p.baseKcal * ratio), protein: Math.round(p.baseProt * ratio * 10) / 10 })); }
  }

  function addPreview() {
    if (!preview) return;
    setMeals(p => [...p, { id: Date.now(), name: preview.name, kcal: preview.kcal, protein: preview.protein, note: "" }]);
    showToast(`Added · ${preview.kcal} kcal · ${preview.protein}g protein`);
    setPreview(null); setQuery(""); setPhotoData(null); setGrams(100); setTab("today");
  }

  function addSavedFood(food) {
    const g = favGrams[food.name] || 100, ratio = g / 100;
    const kcal = Math.round(food.kcal * ratio), prot = Math.round(food.protein * ratio * 10) / 10;
    setMeals(p => [...p, { id: Date.now(), name: food.name + (g !== 100 ? ` (${g}g)` : ""), kcal, protein: prot, note: "" }]);
    showToast(`Added · ${kcal} kcal · ${prot}g protein`);
    setExpandedFood(null);
  }

  function handlePhotoUpload(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setPhotoData({ base64: ev.target.result.split(",")[1], type: file.type, url: ev.target.result }); setPreview(null); setError(""); };
    reader.readAsDataURL(file);
  }

  function removeMeal(id) { setMeals(p => p.filter(m => m.id !== id)); }

  function addSteps() {
    const n = Number(stepsInput); if (!n) return;
    const kcal = Math.round(n * 0.04);
    setActLog(p => [...p.filter(e => e.type !== "steps"), { id: Date.now(), name: `${n.toLocaleString()} steps`, kcal, type: "steps" }]);
    showToast(`Added · ${n.toLocaleString()} steps · +${kcal} kcal`); setStepsInput("");
  }

  function addManualBurn() {
    const n = Number(manualInput); if (!n) return;
    setActLog(p => [...p, { id: Date.now(), name: "Manual burn", kcal: n, type: "manual" }]);
    showToast(`Added · Manual burn · +${n} kcal`); setManualInput("");
  }

  function addSavedActivity(act) {
    setActLog(p => [...p, { id: Date.now(), name: act.name, kcal: act.kcal, type: "saved" }]);
    showToast(`Added · ${act.name} · +${act.kcal} kcal`);
  }

  function removeActEntry(id) { setActLog(p => p.filter(e => e.id !== id)); }

  function openTargetEditor() { setEditCalMax(String(target.calMax)); setEditProtMax(String(target.protMax)); setShowTargetEd(true); }
  function saveTargets() { const cal = Number(editCalMax), prot = Number(editProtMax); if (cal > 0 && prot > 0) setCustomTargets({ calMax: cal, protMax: prot }); setShowTargetEd(false); }
  function saveNewActivity() { const name = newActName.trim(), kcal = Number(newActKcal); if (!name || !kcal) return; setSavedActivities(p => [...p, { id: `c_${Date.now()}`, name, kcal }]); setNewActName(""); setNewActKcal(""); setShowNewAct(false); }
  function saveDay() { const entry = { date: "Apr 28", calMin: totalKcal - 80, calMax: totalKcal + 80, protMin: totalProt - 5, protMax: totalProt + 5, activity: dayType === "active" ? "active day" : "light day", type: dayType || "light" }; setHistory(p => { const ex = p.find(h => h.date === "Apr 28"); return ex ? p.map(h => h.date === "Apr 28" ? entry : h) : [...p, entry]; }); setDaySaved(true); setShowSummary(true); }

  // ── Tokens ────────────────────────────────────────────────────────────────────

  const c = {
    bg:          "#F7F8FC",
    bgCard:      "#FFFFFF",
    bgMuted:     "#F0F2F8",
    border:      "#E6E9F4",
    borderLight: "#EDEEF8",
    text:        "#1a1f36",
    textMuted:   "#6b7080",
    textLight:   "#9aa0b8",
    accent:      "#8C9EFF",
    protein:     "#a8c800",
    protTrack:   "#edffa0",
    calTrack:    "#dce6ff",
    tomato:      "#F06038",
  };

  const S = {
    root: { minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'DM Sans',sans-serif", paddingBottom: 72 },

    // Logo — quiet modern, elegant lowercase, Cormorant-like feel via Manrope light
    logo: {
      padding: "16px 16px 0",
      fontFamily: "'Manrope',sans-serif",
      fontSize: 15,
      fontWeight: 300,
      letterSpacing: "0.18em",
      color: "#6b7080",
      textTransform: "lowercase",
    },

    // Hero
    hero: { margin: "10px 12px 0", background: c.bgCard, borderRadius: 18, boxShadow: "0 1px 10px rgba(100,120,200,0.06)", padding: "14px 14px 14px", display: "flex", flexDirection: "row", alignItems: "stretch", minHeight: 160, position: "relative" },
    heroLeft:  { width: "40%", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end" },
    heroRight: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 6 },

    // Visible "adjust →" trigger — top right inside hero, light grey, minimal
    heroAdjust: { position: "absolute", top: 13, right: 14, background: "none", border: "none", cursor: "pointer", fontSize: 10, color: c.textLight, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, padding: 0, letterSpacing: "0.04em" },

    ringRow:       { display: "flex", alignItems: "center", gap: 8, padding: "5px 0" },
    ringGap:       { height: 5 },
    ringMeta:      { display: "flex", flexDirection: "column", gap: 1 },
    ringMetaLabel: { fontSize: 9, fontWeight: 500, color: c.textLight, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.2 },
    ringMetaVal:   { fontSize: 15, fontWeight: 700, fontFamily: "'Manrope',sans-serif", lineHeight: 1.15, letterSpacing: "-0.01em" },
    ringMetaSub:   { fontSize: 10, fontWeight: 400, color: c.textLight, lineHeight: 1.3, marginTop: 1 },

    navWrap: { margin: "10px 12px 0", background: c.bgMuted, borderRadius: 12, padding: "3px", display: "flex", gap: 2 },
    navBtn: (a) => ({ flex: 1, padding: "8px 0", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: a ? 600 : 400, background: a ? c.bgCard : "transparent", color: a ? c.text : c.textLight, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.01em", boxShadow: a ? "0 1px 3px rgba(100,120,200,0.08)" : "none", transition: "all 0.15s" }),

    dayTypeSec: { padding: "12px 12px 0" },
    // Day mode button — selected state uses gentle border + subtle fill
    typeBtn: (a) => ({
      flex: 1, padding: "10px 10px", borderRadius: 10,
      border: a ? `1.5px solid ${c.accent}` : `1.5px solid transparent`,
      cursor: "pointer", fontWeight: 600, fontSize: 12, fontFamily: "'DM Sans',sans-serif",
      background: a ? "#eef0ff" : c.bgMuted,
      color: a ? c.accent : c.textMuted,
      transition: "all 0.18s",
    }),

    sec:   { padding: "12px 12px 0" },
    label: { fontSize: 10, letterSpacing: "0.09em", textTransform: "uppercase", color: c.textLight, fontWeight: 500 },
    card:  { background: c.bgCard, borderRadius: 14, padding: "12px 14px", marginBottom: 10, boxShadow: "0 1px 5px rgba(100,120,200,0.05)" },
    cardMuted: { background: c.bgMuted, borderRadius: 14, padding: 13, marginBottom: 10 },
    sub:   { fontSize: 11, color: c.textMuted, marginTop: 2, fontWeight: 400 },

    l1Row: { display: "flex", gap: 8, paddingBottom: 12 },
    l1Btn: (a) => ({ flex: 1, padding: "9px 0", borderRadius: 10, border: a ? `1.5px solid ${c.accent}` : "1.5px solid transparent", cursor: "pointer", fontSize: 13, fontWeight: a ? 700 : 500, background: a ? "#eef0ff" : c.bgMuted, color: a ? c.accent : c.textMuted, fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }),

    l2Row: { display: "flex", gap: 0, marginBottom: 14, borderBottom: `1px solid ${c.borderLight}` },
    l2Btn: (a) => ({ padding: "4px 14px 8px", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: a ? 600 : 400, color: a ? c.text : c.textLight, fontFamily: "'DM Sans',sans-serif", borderBottom: a ? `2px solid ${c.accent}` : "2px solid transparent", marginBottom: -1, transition: "all 0.12s" }),

    input:   { width: "100%", background: c.bgMuted, border: "none", borderRadius: 8, padding: "9px 11px", color: c.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif" },
    inputSm: { background: c.bgMuted, border: "none", borderRadius: 8, padding: "8px 10px", color: c.text, fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", width: "100%", boxSizing: "border-box" },

    btn: (v = "primary", disabled) => ({
      padding: v === "primary" ? "11px 18px" : "8px 14px",
      borderRadius: 10, border: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: 600, fontSize: v === "primary" ? 14 : 12,
      background: v === "primary" ? (disabled ? c.bgMuted : c.accent) : c.bgMuted,
      color:      v === "primary" ? (disabled ? c.textLight : "#fff") : c.accent,
      fontFamily: "'DM Sans',sans-serif",
      boxShadow:  v === "primary" && !disabled ? "0 2px 8px rgba(140,158,255,0.25)" : "none",
    }),

    addBtn: { padding: "5px 11px", borderRadius: 7, border: "none", cursor: "pointer", background: c.bgMuted, color: c.accent, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 },

    // Meal row — stricter right-side grid alignment
    mealRow:  { display: "flex", alignItems: "center", padding: "9px 0" },
    mealName: { fontSize: 13, fontWeight: 600, color: c.text, lineHeight: 1.3, flex: 1 },
    mealNote: { fontSize: 11, color: c.textLight, marginTop: 1, fontWeight: 400 },
    // Right block: fixed width for clean vertical alignment
    mealNums: { width: 72, textAlign: "right", marginRight: 8, flexShrink: 0 },
    mealKcal: { fontSize: 12, color: c.accent,  fontWeight: 600, lineHeight: 1.3 },
    mealProt: { fontSize: 11, color: c.protein, fontWeight: 500, lineHeight: 1.3 },
    mealDel:  { background: "none", border: "none", color: "#d8dcea", cursor: "pointer", fontSize: 15, padding: "0 2px", lineHeight: 1, flexShrink: 0 },

    pill:    (color, bg) => ({ fontSize: 10, fontWeight: 500, letterSpacing: "0.02em", color, background: bg, borderRadius: 6, padding: "2px 7px" }),
    histRow: { display: "grid", gridTemplateColumns: "52px 1fr 74px 54px 66px", gap: 5, alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${c.borderLight}`, fontSize: 11 },
    modal:      { position: "fixed", inset: 0, background: "rgba(26,31,54,0.38)", zIndex: 99, display: "flex", alignItems: "flex-end" },
    modalInner: { background: c.bgCard, borderRadius: "18px 18px 0 0", padding: 22, width: "100%", boxSizing: "border-box", boxShadow: "0 -4px 20px rgba(100,120,200,0.09)" },
    previewCard: { background: "#f2f4ff", borderRadius: 12, padding: 13, marginTop: 12 },
    slider:  { width: "100%", accentColor: c.accent, marginTop: 5 },
  };

  const calRoomLeft  = Math.max(0, adjCalMin  - totalKcal);
  const protRoomLeft = Math.max(0, target.protMin - totalProt);

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { -webkit-tap-highlight-color: transparent; } input[type=range] { height: 4px; }`}</style>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={S.root}>

        {/* LOGO — quiet, weight 300, wide tracking, lowercase */}
        <div style={S.logo}>fit frog</div>

        {/* HERO */}
        <div style={S.hero}>

          {/* Visible target adjust trigger — top right, same language as section labels */}
          <button style={S.heroAdjust} onClick={openTargetEditor}>adjust →</button>

          {/* Left: real frog image */}
          <div style={S.heroLeft}>
            <FrogArea mood={mood} />
          </div>

          {/* Right: rings */}
          <div style={S.heroRight}>
            <div style={S.ringRow}>
              <Ring value={totalKcal} max={adjCalMax} color={c.accent} trackColor={c.calTrack} />
              <div style={S.ringMeta}>
                <div style={S.ringMetaLabel}>Calories</div>
                <div style={{ ...S.ringMetaVal, color: c.accent }}>{totalKcal} <span style={{ fontSize: 11, fontWeight: 400, color: c.textLight }}>/ {adjCalMax}</span></div>
                <div style={S.ringMetaSub}>{totalKcal >= adjCalMin ? "in range" : `${calRoomLeft} to go`}</div>
              </div>
            </div>
            <div style={S.ringGap} />
            <div style={S.ringRow}>
              <Ring value={totalProt} max={target.protMax} color={c.protein} trackColor={c.protTrack} />
              <div style={S.ringMeta}>
                <div style={S.ringMetaLabel}>Protein</div>
                <div style={{ ...S.ringMetaVal, color: c.protein }}>{totalProt}g <span style={{ fontSize: 11, fontWeight: 400, color: c.textLight }}>/ {target.protMax}g</span></div>
                <div style={S.ringMetaSub}>{totalProt >= target.protMin ? "in range" : `${protRoomLeft}g to go`}</div>
              </div>
            </div>
          </div>
        </div>

        {/* NAV */}
        <div style={S.navWrap}>
          {[["today","Today"],["add","+ Add"],["history","History"]].map(([key, label]) => (
            <button key={key} style={S.navBtn(tab === key)} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {/* ── TODAY ─────────────────────────────────────────────────────────── */}
        {tab === "today" && (
          <div>
            <div style={S.dayTypeSec}>
              <div style={{ ...S.label, marginBottom: 8 }}>Day mode</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={S.typeBtn(dayType === "light")} onClick={() => setDayType("light")}>🌿 Light day<br /><span style={{ fontWeight: 400, fontSize: 11, opacity: 0.6 }}>1800–1900 kcal</span></button>
                <button style={S.typeBtn(dayType === "active")} onClick={() => setDayType("active")}>⚡ Active day<br /><span style={{ fontWeight: 400, fontSize: 11, opacity: 0.6 }}>2200–2400 kcal</span></button>
              </div>
            </div>

            <div style={S.sec}>
              <div onClick={() => { setTab("add"); setAddLevel1("activity"); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "2px 0" }}>
                <div style={S.label}>
                  Activity today
                  {activityBurn > 0 && <span style={{ color: c.accent, fontWeight: 600, marginLeft: 6, textTransform: "none", letterSpacing: 0 }}>+{activityBurn} kcal</span>}
                </div>
                <div style={{ fontSize: 11, color: c.textLight }}>adjust →</div>
              </div>
            </div>

            <div style={S.sec}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={S.label}>Meals today</div>
                <div style={{ fontSize: 11, color: c.textLight }}>{meals.length} items</div>
              </div>
              <div style={S.card}>
                {meals.length === 0 && <div style={{ fontSize: 12, color: c.textLight, textAlign: "center", padding: "10px 0" }}>No meals logged yet</div>}
                {meals.map((m, i) => (
                  <div key={m.id} style={{ ...S.mealRow, borderBottom: i < meals.length - 1 ? `1px solid ${c.borderLight}` : "none" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...S.mealName, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                      {m.note && <div style={S.mealNote}>{m.note}</div>}
                    </div>
                    {/* Fixed-width right block — strict vertical grid */}
                    <div style={S.mealNums}>
                      <div style={S.mealKcal}>{m.kcal} kcal</div>
                      {m.protein > 0 && <div style={S.mealProt}>{m.protein}g prot</div>}
                    </div>
                    <button onClick={() => removeMeal(m.id)} style={S.mealDel}>×</button>
                  </div>
                ))}
              </div>
              <button style={{ ...S.btn("secondary"), width: "100%", padding: 13 }} onClick={saveDay}>
                {daySaved ? "✓ Day closed" : "Close today"}
              </button>
            </div>
          </div>
        )}

        {/* ── ADD ───────────────────────────────────────────────────────────── */}
        {tab === "add" && (
          <div style={S.sec}>
            <div style={S.l1Row}>
              <button style={S.l1Btn(addLevel1 === "food")}     onClick={() => setAddLevel1("food")}>Food</button>
              <button style={S.l1Btn(addLevel1 === "activity")} onClick={() => setAddLevel1("activity")}>Activity</button>
            </div>

            {addLevel1 === "food" && (
              <div>
                <div style={S.l2Row}>
                  {[["write","Write"],["snap","Snap"],["saved","Saved"]].map(([key, label]) => (
                    <button key={key} style={S.l2Btn(foodMethod === key)} onClick={() => { setFoodMethod(key); setPreview(null); setError(""); }}>{label}</button>
                  ))}
                </div>

                {foodMethod === "write" && (
                  <div style={S.card}>
                    <input style={S.input} placeholder="Describe your meal…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleEstimate()} />
                    <button style={{ ...S.btn("primary", loading || !query.trim()), width: "100%", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleEstimate} disabled={loading || !query.trim()}>
                      {loading ? <><Spinner /> Estimating...</> : "Estimate meal"}
                    </button>
                    {error && <div style={{ color: c.tomato, fontSize: 12, marginTop: 8 }}>{error}</div>}
                    {preview && (
                      <div style={S.previewCard}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: c.text }}>{preview.name}</div>
                        <div style={{ display: "flex", gap: 18, marginBottom: 4 }}>
                          <div><span style={{ color: c.accent, fontWeight: 800, fontSize: 18, fontFamily: "'Manrope',sans-serif" }}>{preview.kcal}</span> <span style={{ fontSize: 11, color: c.textMuted }}>kcal</span></div>
                          <div><span style={{ color: c.protein, fontWeight: 800, fontSize: 18, fontFamily: "'Manrope',sans-serif" }}>{preview.protein}g</span> <span style={{ fontSize: 11, color: c.textMuted }}>protein</span></div>
                        </div>
                        {preview.note && <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 8 }}>{preview.note}</div>}
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <div style={S.label}>Portion</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: c.accent }}>{grams}g</div>
                          </div>
                          <input type="range" min={50} max={600} step={10} value={grams} onChange={e => handleGramsChange(Number(e.target.value))} style={S.slider} />
                        </div>
                        <button style={{ ...S.btn("primary"), width: "100%", marginTop: 12 }} onClick={addPreview}>Add to today →</button>
                      </div>
                    )}
                  </div>
                )}

                {foodMethod === "snap" && (
                  <div style={S.card}>
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handlePhotoUpload} />
                    {!photoData ? (
                      <div onClick={() => fileRef.current?.click()} style={{ border: `1px dashed ${c.border}`, borderRadius: 10, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: c.bgMuted }}>
                        <div style={{ fontSize: 26, marginBottom: 6 }}>📸</div>
                        <div style={{ fontSize: 13, color: c.textMuted }}>Tap to take or upload a photo</div>
                      </div>
                    ) : (
                      <div>
                        <img src={photoData.url} alt="meal" style={{ width: "100%", borderRadius: 10, maxHeight: 190, objectFit: "cover" }} />
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          <button style={{ ...S.btn("secondary"), flex: 1 }} onClick={() => { setPhotoData(null); setPreview(null); }}>Remove</button>
                          <button style={{ ...S.btn("primary", loading), flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleAnalyzePhoto} disabled={loading}>
                            {loading ? <><Spinner /> Estimating...</> : "Estimate meal"}
                          </button>
                        </div>
                      </div>
                    )}
                    {error && <div style={{ color: c.tomato, fontSize: 12, marginTop: 8 }}>{error}</div>}
                    {preview && (
                      <div style={S.previewCard}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: c.text }}>{preview.name}</div>
                        <div style={{ display: "flex", gap: 18, marginBottom: 4 }}>
                          <div><span style={{ color: c.accent, fontWeight: 800, fontSize: 18, fontFamily: "'Manrope',sans-serif" }}>{preview.kcal}</span> <span style={{ fontSize: 11, color: c.textMuted }}>kcal</span></div>
                          <div><span style={{ color: c.protein, fontWeight: 800, fontSize: 18, fontFamily: "'Manrope',sans-serif" }}>{preview.protein}g</span> <span style={{ fontSize: 11, color: c.textMuted }}>protein</span></div>
                        </div>
                        {preview.note && <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 8 }}>{preview.note}</div>}
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <div style={S.label}>Portion</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: c.accent }}>{grams}g</div>
                          </div>
                          <input type="range" min={50} max={600} step={10} value={grams} onChange={e => handleGramsChange(Number(e.target.value))} style={S.slider} />
                        </div>
                        <button style={{ ...S.btn("primary"), width: "100%", marginTop: 12 }} onClick={addPreview}>Add to today →</button>
                      </div>
                    )}
                  </div>
                )}

                {foodMethod === "saved" && (
                  <div style={S.card}>
                    {SAVED_FOODS.map((food, i) => (
                      <div key={food.name} style={{ borderBottom: i < SAVED_FOODS.length - 1 ? `1px solid ${c.borderLight}` : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", padding: "10px 0", gap: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{food.name}</div>
                            <div style={{ fontSize: 11, color: c.textLight, marginTop: 1 }}>
                              {Math.round(food.kcal * (favGrams[food.name] || 100) / 100)} kcal · {Math.round(food.protein * (favGrams[food.name] || 100) / 100 * 10) / 10}g
                              {favGrams[food.name] && favGrams[food.name] !== 100 && <span style={{ color: c.accent, marginLeft: 4 }}>{favGrams[food.name]}g</span>}
                            </div>
                          </div>
                          <button style={{ ...S.addBtn, background: "none", color: c.textLight, fontSize: 11 }} onClick={() => setExpandedFood(expandedFood === food.name ? null : food.name)}>
                            {expandedFood === food.name ? "hide" : "portion"}
                          </button>
                          <button style={S.addBtn} onClick={() => addSavedFood(food)}>+ Add</button>
                        </div>
                        {expandedFood === food.name && (
                          <div style={{ paddingBottom: 10 }}>
                            <input type="range" min={30} max={400} step={10} value={favGrams[food.name] || 100} onChange={e => setFavGrams(p => ({ ...p, [food.name]: Number(e.target.value) }))} style={S.slider} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {addLevel1 === "activity" && (
              <div>
                <div style={S.card}>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ ...S.label, marginBottom: 6 }}>Steps today</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input style={{ ...S.inputSm, flex: 1 }} type="number" placeholder="e.g. 8,500" value={stepsInput} onChange={e => setStepsInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSteps()} />
                      <div style={{ fontSize: 11, color: c.textLight, flexShrink: 0, minWidth: 52 }}>≈ {stepsInput ? Math.round(Number(stepsInput) * 0.04) : 0} kcal</div>
                      <button style={S.addBtn} onClick={addSteps}>+ Add</button>
                    </div>
                    <div style={{ fontSize: 10, color: c.textLight, marginTop: 4 }}>Replaces previous steps entry</div>
                  </div>

                  <div style={{ marginBottom: 14, paddingTop: 12, borderTop: `1px solid ${c.borderLight}` }}>
                    <div style={{ ...S.label, marginBottom: 6 }}>Manual kcal burn</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input style={{ ...S.inputSm, flex: 1 }} type="number" placeholder="e.g. 350" value={manualInput} onChange={e => setManualInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addManualBurn()} />
                      <button style={S.addBtn} onClick={addManualBurn}>+ Add</button>
                    </div>
                  </div>

                  <div style={{ paddingTop: 12, borderTop: `1px solid ${c.borderLight}` }}>
                    <div style={{ ...S.label, marginBottom: 10 }}>Saved activities</div>
                    {savedActivities.map((a, i) => (
                      <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < savedActivities.length - 1 ? `1px solid ${c.borderLight}` : "none" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: c.text }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: c.textLight, marginTop: 1 }}>+{a.kcal} kcal</div>
                        </div>
                        <button style={S.addBtn} onClick={() => addSavedActivity(a)}>+ Add</button>
                      </div>
                    ))}
                    <button onClick={() => setShowNewAct(true)} style={{ marginTop: 12, background: "none", border: "none", cursor: "pointer", color: c.textLight, fontSize: 12, fontFamily: "'DM Sans',sans-serif", padding: 0 }}>+ New activity</button>
                  </div>
                </div>

                {actLog.length > 0 && (
                  <div style={S.card}>
                    <div style={{ ...S.label, marginBottom: 10 }}>Added today</div>
                    {actLog.map((e, i) => (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: i < actLog.length - 1 ? `1px solid ${c.borderLight}` : "none" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: c.text }}>{e.name}</div>
                          <div style={{ fontSize: 11, color: c.accent, marginTop: 1 }}>+{e.kcal} kcal</div>
                        </div>
                        <button onClick={() => removeActEntry(e.id)} style={S.mealDel}>×</button>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${c.borderLight}`, fontSize: 12, color: c.textMuted }}>
                      Total: <span style={{ color: c.accent, fontWeight: 600 }}>+{activityBurn} kcal</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ───────────────────────────────────────────────────────── */}
        {tab === "history" && (
          <div style={S.sec}>
            <div style={{ ...S.label, marginBottom: 10 }}>Past days</div>
            <div style={S.card}>
              <div style={{ ...S.histRow, color: c.textLight, fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase", borderBottom: `1px solid ${c.borderLight}` }}>
                <div>Date</div><div>Activity</div><div>Kcal</div><div>Prot</div><div>Status</div>
              </div>
              {historyDesc.map((d, i) => {
                const sc = statusConfig[getStatus(d.calMin, d.calMax, d.protMin, d.protMax, d.type)];
                return (
                  <div key={i} style={{ ...S.histRow, color: c.text, borderBottom: i < historyDesc.length - 1 ? `1px solid ${c.borderLight}` : "none" }}>
                    <div style={{ fontWeight: 500 }}>{d.date}</div>
                    <div style={{ color: c.textMuted, lineHeight: 1.3 }}>{d.activity}</div>
                    <div style={{ color: c.textMuted }}>{d.calMin}–{d.calMax}</div>
                    <div style={{ color: c.textMuted }}>{d.protMin}–{d.protMax}g</div>
                    <div><span style={S.pill(sc.color, sc.bg)}>{sc.label}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SUMMARY MODAL ─────────────────────────────────────────────────── */}
        {showSummary && (
          <div style={S.modal} onClick={() => setShowSummary(false)}>
            <div style={S.modalInner} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Manrope',sans-serif", marginBottom: 3, color: c.text }}>Day summary</div>
              <div style={{ fontSize: 12, color: c.textLight, marginBottom: 14 }}>Apr 28 · {meals.length} meals</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div style={S.cardMuted}><div style={S.label}>Calories</div><div style={{ fontSize: 24, fontWeight: 800, color: c.accent, marginTop: 4, fontFamily: "'Manrope',sans-serif" }}>{totalKcal}</div><div style={S.sub}>{adjCalMin}–{adjCalMax} target</div></div>
                <div style={S.cardMuted}><div style={S.label}>Protein</div><div style={{ fontSize: 24, fontWeight: 800, color: c.protein, marginTop: 4, fontFamily: "'Manrope',sans-serif" }}>{totalProt}g</div><div style={S.sub}>{target.protMin}–{target.protMax}g target</div></div>
              </div>
              <button style={{ ...S.btn("primary"), width: "100%" }} onClick={() => setShowSummary(false)}>Close</button>
            </div>
          </div>
        )}

        {/* ── TARGET EDITOR MODAL ───────────────────────────────────────────── */}
        {showTargetEd && (
          <div style={S.modal} onClick={() => setShowTargetEd(false)}>
            <div style={S.modalInner} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Manrope',sans-serif", marginBottom: 3, color: c.text }}>Daily targets</div>
              <div style={{ fontSize: 12, color: c.textLight, marginBottom: 18 }}>Override baseline for your goals</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                <div><div style={{ ...S.label, marginBottom: 6 }}>Calories</div><input style={{ ...S.input, fontSize: 15, fontWeight: 600, color: c.accent }} type="number" value={editCalMax} onChange={e => setEditCalMax(e.target.value)} placeholder="e.g. 1900" /></div>
                <div><div style={{ ...S.label, marginBottom: 6 }}>Protein</div><input style={{ ...S.input, fontSize: 15, fontWeight: 600, color: c.protein }} type="number" value={editProtMax} onChange={e => setEditProtMax(e.target.value)} placeholder="e.g. 120" /></div>
              </div>
              {customTargets && <button style={{ ...S.btn("secondary"), width: "100%", marginBottom: 8 }} onClick={() => { setCustomTargets(null); setShowTargetEd(false); }}>Reset to day mode defaults</button>}
              <button style={{ ...S.btn("primary"), width: "100%" }} onClick={saveTargets}>Save</button>
            </div>
          </div>
        )}

        {/* ── NEW ACTIVITY MODAL ────────────────────────────────────────────── */}
        {showNewAct && (
          <div style={S.modal} onClick={() => setShowNewAct(false)}>
            <div style={S.modalInner} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Manrope',sans-serif", marginBottom: 16, color: c.text }}>New activity</div>
              <div style={{ marginBottom: 12 }}><div style={{ ...S.label, marginBottom: 6 }}>Activity name</div><input style={S.input} placeholder="e.g. Pilates 1h" value={newActName} onChange={e => setNewActName(e.target.value)} /></div>
              <div style={{ marginBottom: 18 }}><div style={{ ...S.label, marginBottom: 6 }}>Kcal burn</div><input style={S.input} type="number" placeholder="e.g. 220" value={newActKcal} onChange={e => setNewActKcal(e.target.value)} /></div>
              <button style={{ ...S.btn("primary", !newActName.trim() || !newActKcal), width: "100%" }} onClick={saveNewActivity} disabled={!newActName.trim() || !newActKcal}>Save activity</button>
            </div>
          </div>
        )}

        <Toast msg={toast} />
      </div>
    </>
  );
}
