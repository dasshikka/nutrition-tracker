import { useState, useEffect } from "react";

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
  "on-target": { label: "On target", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  "close": { label: "Close", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  "below": { label: "Below", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

function Bar({ value, max, color, height = 6 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 99, height, overflow: "hidden", width: "100%" }}>
      <div style={{
        height: "100%", width: `${pct}%`, background: color,
        borderRadius: 99, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)"
      }} />
    </div>
  );
}

export default function App() {
  const [dayType, setDayType] = useState(() => {
    try { return localStorage.getItem("dayType") || null; } catch { return null; }
  });
  const [meals, setMeals] = useState(() => {
    try {
      const saved = localStorage.getItem("meals_apr28");
      return saved ? JSON.parse(saved) : INITIAL_MEALS;
    } catch { return INITIAL_MEALS; }
  });
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("history");
      return saved ? JSON.parse(saved) : PAST_DAYS;
    } catch { return PAST_DAYS; }
  });
  const [form, setForm] = useState({ name: "", kcal: "", protein: "", note: "" });
  const [tab, setTab] = useState("today");
  const [showSummary, setShowSummary] = useState(false);
  const [daySaved, setDaySaved] = useState(() => {
    try { return localStorage.getItem("daySaved_apr28") === "true"; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem("meals_apr28", JSON.stringify(meals)); } catch {}
  }, [meals]);
  useEffect(() => {
    try { localStorage.setItem("history", JSON.stringify(history)); } catch {}
  }, [history]);
  useEffect(() => {
    try { if (dayType) localStorage.setItem("dayType", dayType); } catch {}
  }, [dayType]);

  const totalKcal = meals.reduce((s, m) => s + Number(m.kcal), 0);
  const totalProt = meals.reduce((s, m) => s + Number(m.protein), 0);
  const target = dayType ? TARGETS[dayType] : TARGETS.rest;

  function addMeal() {
    if (!form.name || !form.kcal || !form.protein) return;
    setMeals(prev => [...prev, { id: Date.now(), ...form, kcal: Number(form.kcal), protein: Number(form.protein) }]);
    setForm({ name: "", kcal: "", protein: "", note: "" });
  }

  function removeMeal(id) {
    setMeals(prev => prev.filter(m => m.id !== id));
  }

  function saveDay() {
    const entry = {
      date: "Apr 28",
      calMin: totalKcal - 80,
      calMax: totalKcal + 80,
      protMin: Math.round(totalProt - 5),
      protMax: Math.round(totalProt + 5),
      activity: "kickboxing / rest",
      type: dayType || "rest",
    };
    const exists = history.find(h => h.date === "Apr 28");
    if (exists) {
      setHistory(prev => prev.map(h => h.date === "Apr 28" ? entry : h));
    } else {
      setHistory(prev => [...prev, entry]);
    }
    setDaySaved(true);
    try { localStorage.setItem("daySaved_apr28", "true"); } catch {}
    setShowSummary(true);
  }

  const calPct = Math.min(100, (totalKcal / target.calMax) * 100);
  const protPct = Math.min(100, (totalProt / target.protMax) * 100);
  const calColor = totalKcal >= target.calMin ? "#4ade80" : totalKcal >= target.calMin * 0.88 ? "#fbbf24" : "#f87171";
  const protColor = totalProt >= target.protMin ? "#4ade80" : totalProt >= target.protMin * 0.85 ? "#fbbf24" : "#f87171";

  const styles = {
    root: {
      minHeight: "100vh",
      background: "#0d0d0f",
      color: "#e8e6e1",
      fontFamily: "'DM Sans', sans-serif",
      padding: "0 0 80px",
    },
    header: {
      padding: "28px 20px 0",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      paddingBottom: 0,
    },
    title: {
      fontSize: 13,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "rgba(232,230,225,0.35)",
      marginBottom: 4,
      fontWeight: 500,
    },
    name: {
      fontSize: 22,
      fontWeight: 600,
      color: "#e8e6e1",
      marginBottom: 20,
      fontFamily: "'DM Serif Display', serif",
    },
    tabs: {
      display: "flex",
      gap: 0,
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    tab: (active) => ({
      flex: 1,
      padding: "10px 0",
      fontSize: 13,
      fontWeight: 500,
      background: "none",
      border: "none",
      borderBottom: active ? "2px solid #e8e6e1" : "2px solid transparent",
      color: active ? "#e8e6e1" : "rgba(232,230,225,0.35)",
      cursor: "pointer",
      transition: "all 0.2s",
      letterSpacing: "0.04em",
    }),
    section: { padding: "20px 20px 0" },
    card: {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: "16px",
      marginBottom: 12,
    },
    label: { fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(232,230,225,0.35)", fontWeight: 500 },
    big: { fontSize: 32, fontWeight: 700, fontFamily: "'DM Serif Display', serif", lineHeight: 1 },
    sub: { fontSize: 12, color: "rgba(232,230,225,0.4)", marginTop: 2 },
    row: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    pill: (color, bg) => ({
      fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
      color, background: bg, borderRadius: 99, padding: "3px 10px",
      border: `1px solid ${color}33`,
    }),
    input: {
      width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10, padding: "10px 12px", color: "#e8e6e1", fontSize: 14,
      outline: "none", boxSizing: "border-box", fontFamily: "inherit",
    },
    btn: (variant = "primary") => ({
      padding: variant === "primary" ? "12px 20px" : "8px 14px",
      borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600,
      fontSize: variant === "primary" ? 14 : 12,
      background: variant === "primary" ? "#e8e6e1" : "rgba(255,255,255,0.06)",
      color: variant === "primary" ? "#0d0d0f" : "#e8e6e1",
      fontFamily: "inherit", letterSpacing: "0.02em",
      transition: "opacity 0.15s",
    }),
    mealRow: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
    },
    histRow: {
      display: "grid", gridTemplateColumns: "60px 1fr 80px 70px 80px",
      gap: 8, alignItems: "center", padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12,
    },
    modal: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 99,
      display: "flex", alignItems: "flex-end",
    },
    modalInner: {
      background: "#161618", borderRadius: "20px 20px 0 0", padding: 24,
      width: "100%", borderTop: "1px solid rgba(255,255,255,0.08)",
    },
    typeBtn: (active) => ({
      flex: 1, padding: "14px 10px", borderRadius: 12, border: "none", cursor: "pointer",
      fontWeight: 600, fontSize: 13, fontFamily: "inherit",
      background: active ? "#e8e6e1" : "rgba(255,255,255,0.06)",
      color: active ? "#0d0d0f" : "rgba(232,230,225,0.5)",
      transition: "all 0.2s",
    }),
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      <div style={styles.root}>
        <div style={styles.header}>
          <div style={styles.title}>Daily tracker</div>
          <div style={styles.name}>Dasha's nutrition</div>
          <div style={styles.tabs}>
            {["today", "history"].map(t => (
              <button key={t} style={styles.tab(tab === t)} onClick={() => setTab(t)}>
                {t === "today" ? "Today" : "History"}
              </button>
            ))}
          </div>
        </div>

        {tab === "today" && (
          <div>
            {/* Day type selector */}
            <div style={styles.section}>
              <div style={{ ...styles.label, marginBottom: 10 }}>Today is a...</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={styles.typeBtn(dayType === "rest")} onClick={() => setDayType("rest")}>
                  🧘 Rest day<br /><span style={{ fontWeight: 400, fontSize: 11, opacity: 0.7 }}>1800–1900 kcal</span>
                </button>
                <button style={styles.typeBtn(dayType === "training")} onClick={() => setDayType("training")}>
                  🥊 Training day<br /><span style={{ fontWeight: 400, fontSize: 11, opacity: 0.7 }}>2200–2400 kcal</span>
                </button>
              </div>
            </div>

            {/* Progress */}
            <div style={{ ...styles.section, marginTop: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={styles.card}>
                  <div style={styles.label}>Calories</div>
                  <div style={{ ...styles.big, color: calColor, margin: "8px 0 4px" }}>{totalKcal}</div>
                  <div style={styles.sub}>of {target.calMin}–{target.calMax} kcal</div>
                  <div style={{ marginTop: 10 }}>
                    <Bar value={totalKcal} max={target.calMax} color={calColor} height={5} />
                  </div>
                  <div style={{ ...styles.sub, marginTop: 6 }}>
                    {totalKcal < target.calMin ? `${target.calMin - totalKcal} to go` : "✓ in range"}
                  </div>
                </div>
                <div style={styles.card}>
                  <div style={styles.label}>Protein</div>
                  <div style={{ ...styles.big, color: protColor, margin: "8px 0 4px" }}>{totalProt}g</div>
                  <div style={styles.sub}>of {target.protMin}–{target.protMax}g</div>
                  <div style={{ marginTop: 10 }}>
                    <Bar value={totalProt} max={target.protMax} color={protColor} height={5} />
                  </div>
                  <div style={{ ...styles.sub, marginTop: 6 }}>
                    {totalProt < target.protMin ? `${target.protMin - totalProt}g to go` : "✓ in range"}
                  </div>
                </div>
              </div>
            </div>

            {/* Meals */}
            <div style={{ ...styles.section, marginTop: 8 }}>
              <div style={{ ...styles.label, marginBottom: 12 }}>Meals today</div>
              <div style={styles.card}>
                {meals.map((m, i) => (
                  <div key={m.id} style={{ ...styles.mealRow, borderBottom: i < meals.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                      {m.note && <div style={{ fontSize: 11, color: "rgba(232,230,225,0.35)", marginTop: 2 }}>{m.note}</div>}
                    </div>
                    <div style={{ textAlign: "right", marginRight: 12 }}>
                      <div style={{ fontSize: 12, color: "#fbbf24" }}>{m.kcal} kcal</div>
                      <div style={{ fontSize: 11, color: "#4ade80" }}>{m.protein}g prot</div>
                    </div>
                    <button onClick={() => removeMeal(m.id)} style={{ background: "none", border: "none", color: "rgba(232,230,225,0.2)", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add meal */}
            <div style={{ ...styles.section, marginTop: 8 }}>
              <div style={{ ...styles.label, marginBottom: 12 }}>Add meal</div>
              <div style={styles.card}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input style={styles.input} placeholder="Meal name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input style={styles.input} placeholder="Calories" type="number" value={form.kcal} onChange={e => setForm(f => ({ ...f, kcal: e.target.value }))} />
                    <input style={styles.input} placeholder="Protein (g)" type="number" value={form.protein} onChange={e => setForm(f => ({ ...f, protein: e.target.value }))} />
                  </div>
                  <input style={styles.input} placeholder="Note (optional)" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
                  <button style={styles.btn("primary")} onClick={addMeal}>Add meal</button>
                </div>
              </div>
            </div>

            {/* Save day */}
            <div style={{ ...styles.section, marginTop: 8 }}>
              <button style={{ ...styles.btn("secondary"), width: "100%", padding: "14px" }} onClick={saveDay}>
                {daySaved ? "✓ Day saved — update summary" : "Save today's summary"}
              </button>
            </div>
          </div>
        )}

        {tab === "history" && (
          <div style={styles.section}>
            <div style={{ ...styles.label, marginBottom: 12 }}>Past 7 days</div>
            <div style={styles.card}>
              <div style={{ ...styles.histRow, color: "rgba(232,230,225,0.3)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                <div>Date</div><div>Activity</div><div>Kcal</div><div>Prot</div><div>Status</div>
              </div>
              {history.map((d, i) => {
                const status = getStatus(d.calMin, d.calMax, d.protMin, d.protMax, d.type);
                const sc = statusConfig[status];
                return (
                  <div key={i} style={styles.histRow}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{d.date}</div>
                    <div style={{ color: "rgba(232,230,225,0.55)", fontSize: 11, lineHeight: 1.3 }}>{d.activity}</div>
                    <div style={{ fontSize: 11 }}>{d.calMin}–{d.calMax}</div>
                    <div style={{ fontSize: 11 }}>{d.protMin}–{d.protMax}g</div>
                    <div><span style={styles.pill(sc.color, sc.bg)}>{sc.label}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showSummary && (
          <div style={styles.modal} onClick={() => setShowSummary(false)}>
            <div style={styles.modalInner} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'DM Serif Display', serif", marginBottom: 16 }}>Day summary — Apr 28</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div style={styles.card}>
                  <div style={styles.label}>Calories</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: calColor, marginTop: 4 }}>{totalKcal}</div>
                  <div style={styles.sub}>target {target.calMin}–{target.calMax}</div>
                </div>
                <div style={styles.card}>
                  <div style={styles.label}>Protein</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: protColor, marginTop: 4 }}>{totalProt}g</div>
                  <div style={styles.sub}>target {target.protMin}–{target.protMax}g</div>
                </div>
              </div>
              <div style={{ ...styles.label, marginBottom: 8 }}>{meals.length} meals logged</div>
              <button style={{ ...styles.btn("primary"), width: "100%" }} onClick={() => setShowSummary(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
