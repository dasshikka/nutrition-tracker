import { useState, useEffect, useRef } from "react";

const PAST_DAYS = [
  { date: "Apr 21", calMin: 1436, calMax: 1583, protMin: 71, protMax: 79, activity: "3km run", type: "rest" },
  { date: "Apr 22", calMin: 1417, calMax: 1602, protMin: 100.7, protMax: 108.7, activity: "13,185 steps", type: "rest" },
  { date: "Apr 23", calMin: 2000, calMax: 2150, protMin: 105, protMax: 115, activity: "8k steps + 1h kickboxing", type: "training" },
  { date: "Apr 24", calMin: 1540, calMax: 1635, protMin: 97.9, protMax: 107.9, activity: "Beach volleyball", type: "rest" },
  { date: "Apr 25", calMin: 1915, calMax: 2220, protMin: 105, protMax: 122, activity: "5km run + 11k steps", type: "training" },
  { date: "Apr 26", calMin: 2145, calMax: 2315, protMin: 124, protMax: 135, activity: "9,655 steps", type: "rest" },
  { date: "Apr 27", calMin: 1915, calMax: 2220, protMin: 105, protMax: 122, activity: "5km run + 11k steps", type: "training" },
];

const INITIAL_MEALS = [
  { id: 1, name: "2 soft boiled eggs", kcal: 140, protein: 12, note: "" },
  { id: 2, name: "Wholegrain bread with seeds", kcal: 110, protein: 4, note: "" },
  { id: 3, name: "Fresh orange juice 300ml", kcal: 120, protein: 2, note: "" },
  { id: 4, name: "Shrimp dish (350g)", kcal: 470, protein: 34, note: "" },
];

const FAVORITES = [
  { name: "2 soft boiled eggs", kcal: 140, protein: 12 },
  { name: "Wholegrain bread (1 slice)", kcal: 110, protein: 4 },
  { name: "Greek yogurt 150g", kcal: 90, protein: 13 },
  { name: "Chicken breast 100g", kcal: 165, protein: 31 },
  { name: "Shrimp 100g", kcal: 99, protein: 24 },
  { name: "Cottage cheese 100g", kcal: 98, protein: 11 },
];

const TARGETS = {
  rest: { calMin: 1800, calMax: 1900, protMin: 90, protMax: 120 },
  training: { calMin: 2200, calMax: 2400, protMin: 90, protMax: 120 },
};

function getStatus(calMin, calMax, protMin, protMax, type) {
  const t = TARGETS[type] || TARGETS.rest;
  const calOk = calMax >= t.calMin && calMin <= t.calMax;
  const protOk = protMax >= t.protMin;
  const calClose = calMax >= t.calMin * 0.88;
  const protClose = protMax >= t.protMin * 0.85;
  if (calOk && protOk) return "on-target";
  if (calClose && protClose) return "close";
  return "below";
}

const statusConfig = {
  "on-target": { label: "On target", color: "#16a34a", bg: "#dcfce7" },
  "close": { label: "Close", color: "#b45309", bg: "#fef3c7" },
  "below": { label: "Below", color: "#dc2626", bg: "#fee2e2" },
};

async function analyzeFood({ text, imageBase64, imageType, grams }) {
  const content = [];
  if (imageBase64) {
    content.push({ type: "image", source: { type: "base64", media_type: imageType, data: imageBase64 } });
  }
  const gramsNote = grams ? ` The portion size is ${grams}g.` : "";
  const prompt = imageBase64
    ? `Analyze this meal photo. Estimate the calories and protein for what you see.${gramsNote} Respond ONLY with valid JSON: {"name":"meal name","kcal":number,"protein":number,"note":"brief description"}`
    : `Food: "${text}".${gramsNote} Estimate calories and protein. Respond ONLY with valid JSON: {"name":"${text}","kcal":number,"protein":number,"note":"brief estimate note"}`;
  content.push({ type: "text", text: prompt });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{ role: "user", content }],
    }),
  });
  const data = await res.json();
  const raw = data.content?.find(b => b.type === "text")?.text || "{}";
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

function Bar({ value, max, color, trackColor }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ background: trackColor, borderRadius: 99, height: 7, overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

function Spinner() {
  return <div style={{ display: "inline-block", width: 15, height: 15, border: "2px solid rgba(120,80,50,0.2)", borderTop: "2px solid #78503a", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />;
}

export default function App() {
  const [dayType, setDayType] = useState(() => { try { return localStorage.getItem("dayType_v3") || null; } catch { return null; } });
  const [meals, setMeals] = useState(() => { try { const s = localStorage.getItem("meals_apr28_v3"); return s ? JSON.parse(s) : INITIAL_MEALS; } catch { return INITIAL_MEALS; } });
  const [history, setHistory] = useState(() => { try { const s = localStorage.getItem("history_v3"); return s ? JSON.parse(s) : PAST_DAYS; } catch { return PAST_DAYS; } });
  const [tab, setTab] = useState("today");
  const [addMode, setAddMode] = useState(null);
  const [query, setQuery] = useState("");
  const [grams, setGrams] = useState(100);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoData, setPhotoData] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [daySaved, setDaySaved] = useState(false);
  const [favGrams, setFavGrams] = useState({});
  const fileRef = useRef();

  useEffect(() => { try { localStorage.setItem("meals_apr28_v3", JSON.stringify(meals)); } catch {} }, [meals]);
  useEffect(() => { try { localStorage.setItem("history_v3", JSON.stringify(history)); } catch {} }, [history]);
  useEffect(() => { try { if (dayType) localStorage.setItem("dayType_v3", dayType); } catch {} }, [dayType]);

  const totalKcal = Math.round(meals.reduce((s, m) => s + Number(m.kcal), 0));
  const totalProt = Math.round(meals.reduce((s, m) => s + Number(m.protein), 0));
  const target = dayType ? TARGETS[dayType] : TARGETS.rest;

  const calOk = totalKcal >= target.calMin;
  const protOk = totalProt >= target.protMin;
  const calColor = calOk ? "#16a34a" : totalKcal >= target.calMin * 0.88 ? "#d97706" : "#dc2626";
  const protColor = protOk ? "#16a34a" : totalProt >= target.protMin * 0.85 ? "#d97706" : "#dc2626";
  const calTrack = calOk ? "#dcfce7" : totalKcal >= target.calMin * 0.88 ? "#fef3c7" : "#fee2e2";
  const protTrack = protOk ? "#dcfce7" : totalProt >= target.protMin * 0.85 ? "#fef3c7" : "#fee2e2";

  async function handleAnalyzeText() {
    if (!query.trim()) return;
    setLoading(true); setError(""); setPreview(null);
    try {
      const result = await analyzeFood({ text: query, grams: grams !== 100 ? grams : null });
      setPreview({ ...result, baseKcal: result.kcal, baseProt: result.protein, baseGrams: grams });
    } catch { setError("Couldn't analyze — try again"); }
    setLoading(false);
  }

  async function handleAnalyzePhoto() {
    if (!photoData) return;
    setLoading(true); setError(""); setPreview(null);
    try {
      const result = await analyzeFood({ imageBase64: photoData.base64, imageType: photoData.type, grams: grams !== 100 ? grams : null });
      setPreview({ ...result, baseKcal: result.kcal, baseProt: result.protein, baseGrams: grams || 100 });
    } catch { setError("Couldn't analyze photo — try again"); }
    setLoading(false);
  }

  function handleGramsChange(val) {
    setGrams(val);
    if (preview?.baseGrams) {
      const ratio = val / preview.baseGrams;
      setPreview(p => ({ ...p, kcal: Math.round(p.baseKcal * ratio), protein: Math.round(p.baseProt * ratio * 10) / 10 }));
    }
  }

  function addPreview() {
    if (!preview) return;
    setMeals(p => [...p, { id: Date.now(), name: preview.name, kcal: preview.kcal, protein: preview.protein, note: preview.note || "" }]);
    setPreview(null); setQuery(""); setPhotoData(null); setAddMode(null); setGrams(100);
    setTab("today");
  }

  function addFavorite(fav) {
    const g = favGrams[fav.name] || 100;
    const ratio = g / 100;
    setMeals(p => [...p, { id: Date.now(), name: fav.name + (g !== 100 ? ` (${g}g)` : ""), kcal: Math.round(fav.kcal * ratio), protein: Math.round(fav.protein * ratio * 10) / 10, note: "" }]);
  }

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      setPhotoData({ base64: dataUrl.split(",")[1], type: file.type, url: dataUrl });
      setPreview(null); setError("");
    };
    reader.readAsDataURL(file);
  }

  function removeMeal(id) { setMeals(p => p.filter(m => m.id !== id)); }

  function saveDay() {
    const entry = { date: "Apr 28", calMin: totalKcal - 80, calMax: totalKcal + 80, protMin: totalProt - 5, protMax: totalProt + 5, activity: dayType === "training" ? "kickboxing" : "rest day", type: dayType || "rest" };
    setHistory(p => { const ex = p.find(h => h.date === "Apr 28"); return ex ? p.map(h => h.date === "Apr 28" ? entry : h) : [...p, entry]; });
    setDaySaved(true); setShowSummary(true);
  }

  // Design tokens — warm light theme
  const c = {
    bg: "#faf8f5",
    bgCard: "#ffffff",
    bgMuted: "#f3ede6",
    border: "#e8e0d6",
    borderLight: "#f0e8df",
    text: "#2c1f14",
    textMuted: "#9c8374",
    textLight: "#c4b5a8",
    accent: "#78503a",
    accentBg: "#f5ede8",
    tabActive: "#2c1f14",
    tabInactive: "#c4b5a8",
  };

  const S = {
    root: { minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'Lora', serif", paddingBottom: 80 },
    header: { background: c.bgCard, borderBottom: `1px solid ${c.border}`, padding: "24px 20px 0" },
    eyebrow: { fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: c.textLight, fontWeight: 600, marginBottom: 3, fontFamily: "'DM Sans', sans-serif" },
    title: { fontSize: 26, fontWeight: 700, color: c.text, marginBottom: 18, lineHeight: 1.1 },
    tabs: { display: "flex", marginTop: 0 },
    tab: (a) => ({ flex: 1, padding: "11px 0", fontSize: 12, fontWeight: 600, background: "none", border: "none", borderBottom: a ? `2px solid ${c.accent}` : `2px solid transparent`, color: a ? c.accent : c.tabInactive, cursor: "pointer", letterSpacing: "0.05em", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }),
    sec: { padding: "18px 16px 0" },
    label: { fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: c.textLight, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" },
    card: { background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: "0 1px 3px rgba(120,80,58,0.06)" },
    cardMuted: { background: c.bgMuted, border: `1px solid ${c.borderLight}`, borderRadius: 16, padding: 16, marginBottom: 12 },
    big: { fontSize: 34, fontWeight: 700, lineHeight: 1, fontFamily: "'Lora', serif" },
    sub: { fontSize: 11, color: c.textMuted, marginTop: 3, fontFamily: "'DM Sans', sans-serif" },
    input: { width: "100%", background: c.bgMuted, border: `1px solid ${c.border}`, borderRadius: 10, padding: "11px 13px", color: c.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" },
    btn: (v = "primary", disabled) => ({
      padding: v === "primary" ? "12px 20px" : "9px 14px",
      borderRadius: 10, border: "none", cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: 600, fontSize: v === "primary" ? 14 : 12,
      background: v === "primary" ? (disabled ? "#e8e0d6" : c.accent) : c.bgMuted,
      color: v === "primary" ? (disabled ? c.textLight : "#fff") : c.accent,
      fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em",
      boxShadow: v === "primary" && !disabled ? "0 2px 8px rgba(120,80,58,0.25)" : "none",
    }),
    modeBtn: (a) => ({ flex: 1, padding: "10px 6px", borderRadius: 10, border: `1.5px solid ${a ? c.accent : c.border}`, background: a ? c.accentBg : c.bgCard, color: a ? c.accent : c.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }),
    typeBtn: (a) => ({ flex: 1, padding: "14px 10px", borderRadius: 14, border: `1.5px solid ${a ? c.accent : c.border}`, cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif", background: a ? c.accent : c.bgCard, color: a ? "#fff" : c.textMuted, transition: "all 0.2s", boxShadow: a ? "0 2px 8px rgba(120,80,58,0.2)" : "none" }),
    pill: (color, bg) => ({ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color, background: bg, borderRadius: 99, padding: "3px 9px", fontFamily: "'DM Sans', sans-serif" }),
    histRow: { display: "grid", gridTemplateColumns: "58px 1fr 80px 60px 72px", gap: 6, alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${c.borderLight}`, fontSize: 11, fontFamily: "'DM Sans', sans-serif" },
    modal: { position: "fixed", inset: 0, background: "rgba(44,31,20,0.5)", zIndex: 99, display: "flex", alignItems: "flex-end" },
    modalInner: { background: c.bgCard, borderRadius: "20px 20px 0 0", padding: 24, width: "100%", borderTop: `1px solid ${c.border}`, boxSizing: "border-box", boxShadow: "0 -4px 24px rgba(120,80,58,0.12)" },
    previewCard: { background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: 14, marginTop: 12 },
    slider: { width: "100%", accentColor: c.accent, marginTop: 6 },
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { -webkit-tap-highlight-color: transparent; }`}</style>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={S.root}>

        {/* HEADER */}
        <div style={S.header}>
          <div style={S.eyebrow}>Daily tracker</div>
          <div style={S.title}>Dasha's nutrition</div>
          <div style={S.tabs}>
            {[["today", "Today"], ["add", "+ Add meal"], ["history", "History"]].map(([key, label]) => (
              <button key={key} style={S.tab(tab === key)} onClick={() => setTab(key)}>{label}</button>
            ))}
          </div>
        </div>

        {/* TODAY */}
        {tab === "today" && (
          <div>
            <div style={S.sec}>
              <div style={{ ...S.label, marginBottom: 10 }}>Today is a...</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={S.typeBtn(dayType === "rest")} onClick={() => setDayType("rest")}>
                  🧘 Rest day<br /><span style={{ fontWeight: 400, fontSize: 11, opacity: 0.7 }}>1800–1900 kcal</span>
                </button>
                <button style={S.typeBtn(dayType === "training")} onClick={() => setDayType("training")}>
                  🥊 Training day<br /><span style={{ fontWeight: 400, fontSize: 11, opacity: 0.7 }}>2200–2400 kcal</span>
                </button>
              </div>
            </div>

            <div style={{ ...S.sec, marginTop: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={S.card}>
                  <div style={S.label}>Calories</div>
                  <div style={{ ...S.big, color: calColor, margin: "8px 0 4px" }}>{totalKcal}</div>
                  <div style={S.sub}>of {target.calMin}–{target.calMax}</div>
                  <div style={{ marginTop: 10 }}><Bar value={totalKcal} max={target.calMax} color={calColor} trackColor={calTrack} /></div>
                  <div style={{ ...S.sub, marginTop: 6 }}>{totalKcal < target.calMin ? `${target.calMin - totalKcal} kcal to go` : "✓ in range"}</div>
                </div>
                <div style={S.card}>
                  <div style={S.label}>Protein</div>
                  <div style={{ ...S.big, color: protColor, margin: "8px 0 4px" }}>{totalProt}g</div>
                  <div style={S.sub}>of {target.protMin}–{target.protMax}g</div>
                  <div style={{ marginTop: 10 }}><Bar value={totalProt} max={target.protMax} color={protColor} trackColor={protTrack} /></div>
                  <div style={{ ...S.sub, marginTop: 6 }}>{totalProt < target.protMin ? `${target.protMin - totalProt}g to go` : "✓ in range"}</div>
                </div>
              </div>
            </div>

            <div style={{ ...S.sec, marginTop: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={S.label}>Meals today</div>
                <div style={{ ...S.label, color: c.textMuted }}>{meals.length} items</div>
              </div>
              <div style={S.card}>
                {meals.length === 0 && <div style={{ ...S.sub, textAlign: "center", padding: "12px 0" }}>No meals logged yet</div>}
                {meals.map((m, i) => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", padding: "11px 0", borderBottom: i < meals.length - 1 ? `1px solid ${c.borderLight}` : "none" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", color: c.text }}>{m.name}</div>
                      {m.note && <div style={{ ...S.sub, marginTop: 2 }}>{m.note}</div>}
                    </div>
                    <div style={{ textAlign: "right", marginRight: 10 }}>
                      <div style={{ fontSize: 12, color: "#b45309", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{m.kcal} kcal</div>
                      <div style={{ fontSize: 11, color: "#16a34a", fontFamily: "'DM Sans', sans-serif" }}>{m.protein}g protein</div>
                    </div>
                    <button onClick={() => removeMeal(m.id)} style={{ background: "none", border: "none", color: c.textLight, cursor: "pointer", fontSize: 20, padding: "0 2px", lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
              <button style={{ ...S.btn("secondary"), width: "100%", padding: 14 }} onClick={saveDay}>
                {daySaved ? "✓ Update today's summary" : "Save today's summary"}
              </button>
            </div>
          </div>
        )}

        {/* ADD MEAL */}
        {tab === "add" && (
          <div style={S.sec}>
            <div style={{ ...S.label, marginBottom: 12 }}>How to add?</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <button style={S.modeBtn(addMode === "text")} onClick={() => { setAddMode("text"); setPreview(null); setError(""); }}>✏️ Describe</button>
              <button style={S.modeBtn(addMode === "photo")} onClick={() => { setAddMode("photo"); setPreview(null); setError(""); }}>📸 Photo</button>
              <button style={S.modeBtn(addMode === "favorites")} onClick={() => { setAddMode("favorites"); setPreview(null); setError(""); }}>⭐ Favorites</button>
            </div>

            {/* TEXT */}
            {addMode === "text" && (
              <div style={S.card}>
                <div style={{ ...S.label, marginBottom: 10 }}>Describe your meal</div>
                <input style={S.input} placeholder="e.g. grilled salmon 200g with rice" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAnalyzeText()} />
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={S.label}>Portion size</div>
                    <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: c.accent }}>{grams}g</div>
                  </div>
                  <input type="range" min={50} max={600} step={10} value={grams} onChange={e => { setGrams(Number(e.target.value)); }} style={S.slider} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={S.sub}>50g</span><span style={S.sub}>600g</span></div>
                </div>
                <button style={{ ...S.btn("primary", loading || !query.trim()), width: "100%", marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleAnalyzeText} disabled={loading || !query.trim()}>
                  {loading ? <><Spinner /> Analyzing...</> : "Ask Claude to estimate"}
                </button>
                {error && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}>{error}</div>}
                {preview && (
                  <div style={S.previewCard}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, fontFamily: "'DM Sans', sans-serif", color: c.text }}>{preview.name}</div>
                    <div style={{ display: "flex", gap: 20, marginBottom: 6 }}>
                      <div><span style={{ color: "#b45309", fontWeight: 700, fontSize: 20, fontFamily: "'Lora', serif" }}>{preview.kcal}</span> <span style={S.sub}>kcal</span></div>
                      <div><span style={{ color: "#16a34a", fontWeight: 700, fontSize: 20, fontFamily: "'Lora', serif" }}>{preview.protein}g</span> <span style={S.sub}>protein</span></div>
                    </div>
                    {preview.note && <div style={{ ...S.sub, marginBottom: 10 }}>{preview.note}</div>}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={S.label}>Adjust portion</div>
                        <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: c.accent }}>{grams}g</div>
                      </div>
                      <input type="range" min={50} max={600} step={10} value={grams} onChange={e => handleGramsChange(Number(e.target.value))} style={S.slider} />
                    </div>
                    <button style={{ ...S.btn("primary"), width: "100%", marginTop: 12 }} onClick={addPreview}>Add to today →</button>
                  </div>
                )}
              </div>
            )}

            {/* PHOTO */}
            {addMode === "photo" && (
              <div style={S.card}>
                <div style={{ ...S.label, marginBottom: 10 }}>Upload a photo of your meal</div>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handlePhotoUpload} />
                {!photoData ? (
                  <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${c.border}`, borderRadius: 12, padding: "36px 20px", textAlign: "center", cursor: "pointer", background: c.bgMuted }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
                    <div style={{ fontSize: 13, color: c.textMuted, fontFamily: "'DM Sans', sans-serif" }}>Tap to take or upload a photo</div>
                  </div>
                ) : (
                  <div>
                    <img src={photoData.url} alt="meal" style={{ width: "100%", borderRadius: 12, maxHeight: 230, objectFit: "cover" }} />
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button style={{ ...S.btn("secondary"), flex: 1 }} onClick={() => { setPhotoData(null); setPreview(null); }}>Remove</button>
                      <button style={{ ...S.btn("primary", loading), flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={handleAnalyzePhoto} disabled={loading}>
                        {loading ? <><Spinner /> Analyzing...</> : "Analyze with Claude"}
                      </button>
                    </div>
                  </div>
                )}
                {error && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}>{error}</div>}
                {preview && (
                  <div style={S.previewCard}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>{preview.name}</div>
                    <div style={{ display: "flex", gap: 20, marginBottom: 6 }}>
                      <div><span style={{ color: "#b45309", fontWeight: 700, fontSize: 20, fontFamily: "'Lora', serif" }}>{preview.kcal}</span> <span style={S.sub}>kcal</span></div>
                      <div><span style={{ color: "#16a34a", fontWeight: 700, fontSize: 20, fontFamily: "'Lora', serif" }}>{preview.protein}g</span> <span style={S.sub}>protein</span></div>
                    </div>
                    {preview.note && <div style={{ ...S.sub, marginBottom: 10 }}>{preview.note}</div>}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div style={S.label}>Adjust portion</div>
                        <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: c.accent }}>{grams}g</div>
                      </div>
                      <input type="range" min={50} max={600} step={10} value={grams} onChange={e => handleGramsChange(Number(e.target.value))} style={S.slider} />
                    </div>
                    <button style={{ ...S.btn("primary"), width: "100%", marginTop: 12 }} onClick={addPreview}>Add to today →</button>
                  </div>
                )}
              </div>
            )}

            {/* FAVORITES */}
            {addMode === "favorites" && (
              <div style={S.card}>
                <div style={{ ...S.label, marginBottom: 14 }}>Your frequent foods</div>
                {FAVORITES.map((fav, i) => (
                  <div key={i} style={{ padding: "12px 0", borderBottom: i < FAVORITES.length - 1 ? `1px solid ${c.borderLight}` : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", color: c.text }}>{fav.name}</div>
                        <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>
                          {Math.round(fav.kcal * (favGrams[fav.name] || 100) / 100)} kcal · {Math.round(fav.protein * (favGrams[fav.name] || 100) / 100 * 10) / 10}g protein
                        </div>
                      </div>
                      <button style={S.btn("secondary")} onClick={() => addFavorite(fav)}>Add</button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="range" min={30} max={400} step={10} value={favGrams[fav.name] || 100} onChange={e => setFavGrams(p => ({ ...p, [fav.name]: Number(e.target.value) }))} style={{ ...S.slider, flex: 1 }} />
                      <div style={{ fontSize: 12, fontWeight: 600, minWidth: 38, textAlign: "right", fontFamily: "'DM Sans', sans-serif", color: c.accent }}>{favGrams[fav.name] || 100}g</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <div style={S.sec}>
            <div style={{ ...S.label, marginBottom: 12 }}>Past days</div>
            <div style={S.card}>
              <div style={{ ...S.histRow, color: c.textLight, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                <div>Date</div><div>Activity</div><div>Kcal</div><div>Prot</div><div>Status</div>
              </div>
              {history.map((d, i) => {
                const status = getStatus(d.calMin, d.calMax, d.protMin, d.protMax, d.type);
                const sc = statusConfig[status];
                return (
                  <div key={i} style={{ ...S.histRow, color: c.text }}>
                    <div style={{ fontWeight: 600 }}>{d.date}</div>
                    <div style={{ color: c.textMuted, lineHeight: 1.3 }}>{d.activity}</div>
                    <div>{d.calMin}–{d.calMax}</div>
                    <div>{d.protMin}–{d.protMax}g</div>
                    <div><span style={S.pill(sc.color, sc.bg)}>{sc.label}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUMMARY MODAL */}
        {showSummary && (
          <div style={S.modal} onClick={() => setShowSummary(false)}>
            <div style={S.modalInner} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Lora', serif", marginBottom: 4, color: c.text }}>Day summary</div>
              <div style={{ ...S.sub, marginBottom: 16 }}>Apr 28 · {meals.length} meals logged</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div style={S.cardMuted}>
                  <div style={S.label}>Calories</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: calColor, marginTop: 4, fontFamily: "'Lora', serif" }}>{totalKcal}</div>
                  <div style={S.sub}>target {target.calMin}–{target.calMax}</div>
                </div>
                <div style={S.cardMuted}>
                  <div style={S.label}>Protein</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: protColor, marginTop: 4, fontFamily: "'Lora', serif" }}>{totalProt}g</div>
                  <div style={S.sub}>target {target.protMin}–{target.protMax}g</div>
                </div>
              </div>
              <button style={{ ...S.btn("primary"), width: "100%" }} onClick={() => setShowSummary(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
