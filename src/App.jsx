import { useState, useEffect, useRef } from "react";

// ─── FROG IMAGE (base64 embedded — swap with mood-specific assets later) ──────
// ─── FROG STATE IMAGES — mapped by calorie percentage ────────────────────────
// Files must exist at /frogs/ in the deployed app's public folder
const FROG_IMAGES = {
  sleeping: "/frogs/frog_state_sleep.png",
  coffee:   "/frogs/frog_state_coffee.png",
  neutral:  "/frogs/frog_state_neutral.png",
  relaxed:  "/frogs/frog_state_relaxed.png",
  full:     "/frogs/frog_state_full.png",
};

// Select correct frog asset by calorie % consumed
function getFrogAsset(caloriePercent, isSleeping) {
  if (isSleeping) return FROG_IMAGES.sleeping;
  if (caloriePercent < 1)  return FROG_IMAGES.sleeping;
  if (caloriePercent < 25) return FROG_IMAGES.coffee;
  if (caloriePercent < 60) return FROG_IMAGES.neutral;
  if (caloriePercent < 95) return FROG_IMAGES.relaxed;
  return FROG_IMAGES.full;
}

const _UNUSED = "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";

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

// Search synonyms — maps alternate terms to canonical food names
const FOOD_SYNONYMS = {
  "curd": "Cottage cheese", "quark": "Cottage cheese",
  "yoghurt": "Greek yogurt", "skyr": "Greek yogurt",
  "poultry": "Chicken breast", "turkey breast": "Turkey breast",
  "tuna fish": "Tuna in water", "canned tuna": "Tuna in water",
  "salmon": "Salmon fillet", "fish": "Salmon fillet",
  "prawns": "Shrimp", "prawn": "Shrimp",
  "ground beef": "Beef mince lean", "minced beef": "Beef mince lean",
  "tofu": "Tofu firm", "soy": "Tofu firm",
  "buckwheat": "Buckwheat cooked", "kasha": "Buckwheat cooked",
  "porridge": "Oats", "oatmeal": "Oats",
  "pasta": "Pasta cooked", "noodles": "Pasta cooked", "spaghetti": "Pasta cooked",
  "potato": "Boiled potato", "potatoes": "Boiled potato",
  "sweet potato": "Sweet potato baked", "yam": "Sweet potato baked",
  "black beans": "Black beans cooked", "kidney beans": "Kidney beans cooked",
  "chickpea": "Chickpeas cooked", "hummus": "Hummus",
  "avocado": "Avocado", "avo": "Avocado",
  "peanut butter": "Peanut butter", "pb": "Peanut butter",
  "almond": "Almonds", "nuts": "Almonds",
  "walnuts": "Walnuts", "cashew": "Cashews",
  "olive oil": "Olive oil", "butter": "Butter",
  "milk": "Milk whole", "skim milk": "Milk skimmed",
  "protein shake": "Whey protein shake", "whey": "Whey protein shake",
  "cappuccino": "Cappuccino", "latte": "Latte",
  "coffee": "Espresso", "espresso": "Espresso",
  "oj": "Orange juice", "juice": "Orange juice",
  "sushi roll": "Sushi roll", "sushi": "Sushi roll",
  "kebab": "Chicken kebab", "shawarma": "Chicken shawarma",
  "pizza": "Pizza slice", "burger": "Beef burger",
};

const FOOD_LIBRARY = [
  // ── EGGS & DAIRY ──────────────────────────────────────────────────────────
  { name: "Soft boiled egg",       unit: "1 egg",          kcal: 70,  protein: 6  },
  { name: "Scrambled eggs",        unit: "2 eggs",          kcal: 180, protein: 13 },
  { name: "Omelette plain",        unit: "2 eggs",          kcal: 190, protein: 14 },
  { name: "Greek yogurt",          unit: "150g",            kcal: 90,  protein: 13 },
  { name: "Plain yogurt",          unit: "150g",            kcal: 95,  protein: 6  },
  { name: "Cottage cheese",        unit: "100g",            kcal: 98,  protein: 11 },
  { name: "Ricotta",               unit: "100g",            kcal: 174, protein: 11 },
  { name: "Milk whole",            unit: "200ml",           kcal: 130, protein: 7  },
  { name: "Milk skimmed",          unit: "200ml",           kcal: 70,  protein: 7  },
  { name: "Cheddar cheese",        unit: "30g slice",       kcal: 120, protein: 7  },
  { name: "Mozzarella",            unit: "50g",             kcal: 140, protein: 9  },
  { name: "Feta cheese",           unit: "30g",             kcal: 80,  protein: 4  },
  { name: "Sour cream",            unit: "2 tbsp",          kcal: 60,  protein: 1  },
  { name: "Butter",                unit: "10g",             kcal: 74,  protein: 0  },

  // ── PROTEINS ──────────────────────────────────────────────────────────────
  { name: "Chicken breast",        unit: "100g cooked",     kcal: 165, protein: 31 },
  { name: "Chicken thigh",         unit: "100g cooked",     kcal: 210, protein: 26 },
  { name: "Turkey breast",         unit: "100g cooked",     kcal: 155, protein: 30 },
  { name: "Salmon fillet",         unit: "150g",            kcal: 280, protein: 38 },
  { name: "Tuna in water",         unit: "100g drained",    kcal: 110, protein: 25 },
  { name: "Mackerel",              unit: "100g",            kcal: 230, protein: 19 },
  { name: "Cod fillet",            unit: "100g",            kcal: 90,  protein: 20 },
  { name: "Shrimp",                unit: "100g",            kcal: 99,  protein: 24 },
  { name: "Beef mince lean",       unit: "100g cooked",     kcal: 215, protein: 26 },
  { name: "Beef steak",            unit: "150g",            kcal: 280, protein: 38 },
  { name: "Pork loin",             unit: "100g cooked",     kcal: 195, protein: 27 },
  { name: "Bacon rasher",          unit: "2 rashers",       kcal: 130, protein: 9  },
  { name: "Tofu firm",             unit: "100g",            kcal: 80,  protein: 9  },
  { name: "Tempeh",                unit: "100g",            kcal: 195, protein: 19 },
  { name: "Edamame",               unit: "100g shelled",    kcal: 120, protein: 11 },
  { name: "Whey protein shake",    unit: "1 scoop 30g",     kcal: 120, protein: 24 },
  { name: "Protein bar",           unit: "1 bar ~60g",      kcal: 210, protein: 20 },

  // ── GRAINS & CARBS ────────────────────────────────────────────────────────
  { name: "White rice",            unit: "100g cooked",     kcal: 130, protein: 3  },
  { name: "Brown rice",            unit: "100g cooked",     kcal: 120, protein: 3  },
  { name: "Buckwheat cooked",      unit: "100g",            kcal: 92,  protein: 3  },
  { name: "Quinoa cooked",         unit: "100g",            kcal: 120, protein: 4  },
  { name: "Oats",                  unit: "50g dry",         kcal: 190, protein: 6  },
  { name: "Pasta cooked",          unit: "150g",            kcal: 220, protein: 8  },
  { name: "Wholegrain bread",      unit: "1 slice",         kcal: 110, protein: 4  },
  { name: "White bread",           unit: "1 slice",         kcal: 95,  protein: 3  },
  { name: "Sourdough bread",       unit: "1 slice",         kcal: 100, protein: 4  },
  { name: "Bagel",                 unit: "1 medium",        kcal: 245, protein: 9  },
  { name: "Wrap tortilla",         unit: "1 medium",        kcal: 180, protein: 5  },
  { name: "Boiled potato",         unit: "150g",            kcal: 120, protein: 3  },
  { name: "Sweet potato baked",    unit: "150g",            kcal: 135, protein: 2  },
  { name: "Granola",               unit: "50g",             kcal: 230, protein: 5  },
  { name: "Cornflakes",            unit: "40g",             kcal: 150, protein: 3  },

  // ── LEGUMES ───────────────────────────────────────────────────────────────
  { name: "Lentils cooked",        unit: "100g",            kcal: 116, protein: 9  },
  { name: "Chickpeas cooked",      unit: "100g",            kcal: 164, protein: 9  },
  { name: "Black beans cooked",    unit: "100g",            kcal: 132, protein: 9  },
  { name: "Kidney beans cooked",   unit: "100g",            kcal: 127, protein: 9  },
  { name: "Hummus",                unit: "3 tbsp",          kcal: 120, protein: 4  },

  // ── VEGETABLES ────────────────────────────────────────────────────────────
  { name: "Broccoli",              unit: "100g steamed",    kcal: 35,  protein: 3  },
  { name: "Spinach",               unit: "80g raw",         kcal: 18,  protein: 2  },
  { name: "Mixed salad leaves",    unit: "60g",             kcal: 12,  protein: 1  },
  { name: "Cherry tomatoes",       unit: "100g",            kcal: 18,  protein: 1  },
  { name: "Cucumber",              unit: "100g",            kcal: 15,  protein: 1  },
  { name: "Bell pepper",           unit: "1 medium",        kcal: 30,  protein: 1  },
  { name: "Courgette",             unit: "100g",            kcal: 17,  protein: 1  },
  { name: "Carrot",                unit: "1 medium",        kcal: 35,  protein: 1  },
  { name: "Corn on cob",           unit: "1 ear",           kcal: 90,  protein: 3  },
  { name: "Mushrooms",             unit: "100g raw",        kcal: 22,  protein: 3  },
  { name: "Asparagus",             unit: "100g",            kcal: 20,  protein: 2  },
  { name: "Kale",                  unit: "80g raw",         kcal: 35,  protein: 2  },
  { name: "Onion",                 unit: "1 medium",        kcal: 45,  protein: 1  },
  { name: "Garlic",                unit: "2 cloves",        kcal: 9,   protein: 0  },

  // ── FRUITS ────────────────────────────────────────────────────────────────
  { name: "Banana",                unit: "1 medium",        kcal: 105, protein: 1  },
  { name: "Apple",                 unit: "1 medium",        kcal: 80,  protein: 0  },
  { name: "Orange",                unit: "1 medium",        kcal: 65,  protein: 1  },
  { name: "Strawberries",          unit: "150g",            kcal: 48,  protein: 1  },
  { name: "Blueberries",           unit: "100g",            kcal: 57,  protein: 1  },
  { name: "Mango",                 unit: "150g",            kcal: 99,  protein: 1  },
  { name: "Watermelon",            unit: "200g",            kcal: 60,  protein: 1  },
  { name: "Grapes",                unit: "150g",            kcal: 104, protein: 1  },
  { name: "Pear",                  unit: "1 medium",        kcal: 80,  protein: 0  },
  { name: "Kiwi",                  unit: "1 fruit",         kcal: 42,  protein: 1  },
  { name: "Pineapple",             unit: "100g",            kcal: 50,  protein: 1  },
  { name: "Avocado",               unit: "½ fruit",         kcal: 120, protein: 2  },

  // ── FATS & OILS ───────────────────────────────────────────────────────────
  { name: "Olive oil",             unit: "1 tbsp",          kcal: 120, protein: 0  },
  { name: "Coconut oil",           unit: "1 tbsp",          kcal: 120, protein: 0  },
  { name: "Peanut butter",         unit: "2 tbsp",          kcal: 190, protein: 8  },
  { name: "Almond butter",         unit: "2 tbsp",          kcal: 200, protein: 7  },
  { name: "Almonds",               unit: "30g",             kcal: 175, protein: 6  },
  { name: "Walnuts",               unit: "30g",             kcal: 195, protein: 5  },
  { name: "Cashews",               unit: "30g",             kcal: 165, protein: 5  },
  { name: "Mixed nuts",            unit: "30g",             kcal: 180, protein: 5  },
  { name: "Chia seeds",            unit: "1 tbsp",          kcal: 58,  protein: 2  },
  { name: "Flaxseeds",             unit: "1 tbsp",          kcal: 55,  protein: 2  },

  // ── SNACKS & EXTRAS ───────────────────────────────────────────────────────
  { name: "Dark chocolate",        unit: "30g",             kcal: 170, protein: 2  },
  { name: "Honey",                 unit: "1 tbsp",          kcal: 64,  protein: 0  },
  { name: "Jam",                   unit: "1 tbsp",          kcal: 55,  protein: 0  },
  { name: "Cream cheese",          unit: "2 tbsp",          kcal: 100, protein: 2  },
  { name: "Mayonnaise",            unit: "1 tbsp",          kcal: 94,  protein: 0  },
  { name: "Ketchup",               unit: "1 tbsp",          kcal: 20,  protein: 0  },
  { name: "Protein bar",           unit: "1 bar ~60g",      kcal: 210, protein: 20 },
  { name: "Rice cakes",            unit: "2 cakes",         kcal: 70,  protein: 1  },

  // ── DRINKS ────────────────────────────────────────────────────────────────
  { name: "Espresso",              unit: "1 shot",          kcal: 5,   protein: 0  },
  { name: "Cappuccino",            unit: "standard cup",    kcal: 80,  protein: 4  },
  { name: "Latte",                 unit: "standard cup",    kcal: 120, protein: 6  },
  { name: "Flat white",            unit: "standard cup",    kcal: 90,  protein: 5  },
  { name: "Oat milk latte",        unit: "standard cup",    kcal: 130, protein: 3  },
  { name: "Orange juice",          unit: "200ml",           kcal: 88,  protein: 1  },
  { name: "Apple juice",           unit: "200ml",           kcal: 94,  protein: 0  },
  { name: "Smoothie fruit",        unit: "300ml",           kcal: 160, protein: 2  },
  { name: "Protein smoothie",      unit: "300ml",           kcal: 280, protein: 28 },
  { name: "Sparkling water",       unit: "500ml",           kcal: 0,   protein: 0  },
  { name: "Green tea",             unit: "250ml",           kcal: 2,   protein: 0  },
  { name: "Beer",                  unit: "330ml",           kcal: 150, protein: 1  },
  { name: "Wine red",              unit: "150ml glass",     kcal: 125, protein: 0  },
  { name: "Wine white",            unit: "150ml glass",     kcal: 120, protein: 0  },

  // ── COMMON MEALS & READY FOODS ────────────────────────────────────────────
  { name: "Sushi roll",            unit: "6 pieces",        kcal: 300, protein: 10 },
  { name: "Chicken kebab",         unit: "1 serving",       kcal: 450, protein: 35 },
  { name: "Chicken shawarma",      unit: "1 wrap",          kcal: 490, protein: 30 },
  { name: "Pizza slice",           unit: "1 slice ~120g",   kcal: 285, protein: 12 },
  { name: "Beef burger",           unit: "1 medium",        kcal: 490, protein: 28 },
  { name: "Chicken burger",        unit: "1 medium",        kcal: 430, protein: 30 },
  { name: "Caesar salad",          unit: "1 serving 250g",  kcal: 310, protein: 20 },
  { name: "Chicken Caesar wrap",   unit: "1 wrap",          kcal: 420, protein: 28 },
  { name: "Bowl of soup",          unit: "300ml",           kcal: 150, protein: 6  },
  { name: "Chicken soup",          unit: "300ml",           kcal: 180, protein: 14 },
  { name: "Pasta bolognese",       unit: "350g portion",    kcal: 480, protein: 26 },
  { name: "Risotto",               unit: "300g portion",    kcal: 420, protein: 12 },
  { name: "Fried rice",            unit: "300g portion",    kcal: 420, protein: 10 },
  { name: "Stir fry chicken",      unit: "350g portion",    kcal: 380, protein: 32 },
  { name: "Omelette with veg",     unit: "2 eggs + veg",    kcal: 220, protein: 15 },
  { name: "Pancakes",              unit: "3 medium",        kcal: 320, protein: 9  },
  { name: "Granola with yogurt",   unit: "bowl",            kcal: 350, protein: 14 },
  { name: "Avocado toast",         unit: "1 slice",         kcal: 220, protein: 5  },
  { name: "Eggs on toast",         unit: "2 eggs + 1 slice",kcal: 290, protein: 18 },
  { name: "Sandwich chicken",      unit: "1 sandwich",      kcal: 380, protein: 28 },
  { name: "Sandwich tuna",         unit: "1 sandwich",      kcal: 360, protein: 26 },
  { name: "Baked salmon + rice",   unit: "1 portion",       kcal: 480, protein: 42 },
  { name: "Grilled chicken salad", unit: "1 bowl",          kcal: 320, protein: 34 },
  { name: "Greek salad",           unit: "1 bowl",          kcal: 200, protein: 7  },
  { name: "Miso soup",             unit: "1 bowl",          kcal: 40,  protein: 3  },
  { name: "Protein oats",          unit: "bowl",            kcal: 360, protein: 28 },
  { name: "Cottage cheese bowl",   unit: "200g + toppings", kcal: 250, protein: 24 },
];

const DEFAULT_SAVED_ACTIVITIES = [
  { id: "kb1h",   name: "Kickboxing 1h",      kcal: 480 },
  { id: "run5",   name: "Running 5km",         kcal: 300 },
  { id: "walk10", name: "Walking 10k steps",   kcal: 350 },
  { id: "jj1h",   name: "Jiu-jitsu 1h",       kcal: 420 },
  { id: "yoga",   name: "Yoga 45min",          kcal: 180 },
];

// Default personal calorie goal — overridden by customTargets.calMax
const DEFAULT_GOAL_KCAL = 1900;
const DEFAULT_PROT_MAX  = 120;

// Targets are computed dynamically from goal:
// calm  = goal kcal
// active = goal kcal + 500
function buildTargets(goalKcal, protMax) {
  return {
    calm:     { calMin: Math.round(goalKcal * 0.97), calMax: goalKcal,         protMin: Math.round(protMax * 0.75), protMax },
    active:   { calMin: Math.round(goalKcal * 0.97), calMax: goalKcal + 500,   protMin: Math.round(protMax * 0.75), protMax },
    training: { calMin: Math.round(goalKcal * 0.97), calMax: goalKcal + 800,   protMin: Math.round(protMax * 0.75), protMax },
  };
}

// ─── MOOD ─────────────────────────────────────────────────────────────────────

function getFrogMood(kcal, prot, calMin, protMin) {
  const calPct  = Math.min(1, kcal / calMin);
  const protPct = Math.min(1, prot / protMin);
  const avg = (calPct + protPct) / 2;
  if (avg >= 0.85) return "satisfied";
  // Protein specifically hit — quiet proud state
  if (protPct >= 1 && calPct < 0.85) return "protein";
  if (avg >= 0.50) return "attentive";
  return "neutral";
}

// Updated microcopy — shorter, softer
const MOOD_LINE = {
  sleeping:  "resting for now.",
  neutral:   "steady today",
  attentive: "quiet progress",
  protein:   "protein reached today",
  satisfied: "well done today",
};

// ─── STATUS ───────────────────────────────────────────────────────────────────

function getStatus(calMin, calMax, protMin, protMax, type) {
  const targets = buildTargets(DEFAULT_GOAL_KCAL, DEFAULT_PROT_MAX);
  const t = targets[type] || targets.calm;
  if (calMax >= t.calMin && calMin <= t.calMax && protMax >= t.protMin) return "on-target";
  if (calMax >= t.calMin * 0.88 && protMax >= t.protMin * 0.85)        return "close";
  return "below";
}

const statusConfig = {
  "on-target": { label: "balanced", color: "#3d7a4a", bg: "#e2f5e6" },
  "close":     { label: "close",    color: "#7a6520", bg: "#fdf5d6" },
  "below":     { label: "building", color: "#8a5020", bg: "#fde8d4" },
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
  const r         = 34;
  const circ      = 2 * Math.PI * r;
  const pct       = Math.min(1, value / max);
  const filled    = pct * circ;
  const remaining = circ - filled;
  const pctLabel  = Math.round(pct * 100) + "%";
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{ flexShrink: 0 }}>
      {/* Track — full circle, slightly more visible */}
      <circle cx="40" cy="40" r={r} fill="none" stroke={trackColor} strokeWidth="7.5" strokeLinecap="round" />
      {/* Fill — only render when there is actual progress */}
      {pct > 0 && (
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7.5"
          strokeDasharray={`${filled} ${remaining}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
      )}
      {/* Percentage — subtle, centered */}
      <text x="40" y="44" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="9" fontWeight="400" fill={color} opacity="0.55">{pctLabel}</text>
    </svg>
  );
}

// ─── FROG AREA ────────────────────────────────────────────────────────────────
// Frog image chosen by calorie progress state.
// 5 assets must exist at /frogs/ in production.

function FrogArea({ caloriePercent, sleeping }) {
  const src = getFrogAsset(caloriePercent, sleeping);
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-end" }}>
      <img
        src={src}
        alt=""
        style={{ width: 114, maxHeight: 164, height: "auto", objectFit: "contain", objectPosition: "bottom left", display: "block", marginBottom: 4,
          opacity: sleeping ? 0.38 : 0.92,
          filter: sleeping ? "grayscale(0.4)" : "none",
          transition: "opacity 0.6s ease, filter 0.6s ease"
        }}
      />
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

// ─── DATE HELPER ─────────────────────────────────────────────────────────────

function formatDate(d) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); // e.g. "29 Apr"
}

function nextDateLabel(label) {
  // Parse "29 Apr" → advance by one day → format back
  try {
    const [day, mon] = label.split(" ");
    const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    const d = new Date(new Date().getFullYear(), months[mon], Number(day) + 1);
    return formatDate(d);
  } catch { return formatDate(new Date()); }
}

// ─── HERO SUMMARY ────────────────────────────────────────────────────────────

function HeroSummary({ sleeping, totalKcal, totalProt, adjCalMin, adjCalMax, target, calRoomLeft, protRoomLeft, onAdjust, S, c }) {
  const caloriePercent = adjCalMax > 0 ? (totalKcal / adjCalMax) * 100 : 0;
  return (
    <div style={S.hero}>
      <button style={S.heroAdjust} onClick={onAdjust}>adjust →</button>
      <div style={S.heroLeft}><FrogArea caloriePercent={caloriePercent} sleeping={sleeping} /></div>
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
          <Ring value={totalProt} max={target.protMax} color={totalProt >= target.protMin ? "#7aaa00" : c.protein} trackColor={totalProt >= target.protMin ? "#d4f570" : c.protTrack} />
          <div style={S.ringMeta}>
            <div style={S.ringMetaLabel}>Protein</div>
            <div style={{ ...S.ringMetaVal, color: totalProt >= target.protMin ? "#7aaa00" : c.protein }}>{totalProt}g <span style={{ fontSize: 11, fontWeight: 400, color: c.textLight }}>/ {target.protMax}g</span></div>
            <div style={{ ...S.ringMetaSub, color: totalProt >= target.protMin ? "#7aaa00" : c.textLight, fontWeight: totalProt >= target.protMin ? 500 : 400 }}>
              {totalProt >= target.protMin ? "protein reached today" : `${protRoomLeft}g to go`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN TABS ────────────────────────────────────────────────────────────────

function MainTabs({ tab, setTab }) {
  return (
    <>
      <style>{`
        .mainTabs { display: grid; grid-template-columns: repeat(3, 1fr); background: #FFFFFF; border-radius: 16px 16px 0 0; padding: 0 8px; height: 48px; align-items: stretch; overflow: visible; position: relative; margin: 12px 12px 0; box-shadow: 0 1px 6px rgba(100,120,200,0.07); }
        .mainTab  { height: 48px; border: 0; background: transparent; color: #9AA1B8; font-weight: 500; font-size: 13px; border-radius: 0; position: relative; z-index: 1; cursor: pointer; font-family: 'DM Sans', sans-serif; border-bottom: 2px solid transparent; }
        .mainTab.active { background: transparent; color: #1a1f36; font-weight: 700; border-bottom: 2.5px solid #1a1f36; z-index: 3; }
        .mainTab.active::after { display: none; }
      `}</style>
      <div className="mainTabs">
        {[["today","Today"],["add","+ Add"],["history","History"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`mainTab${tab === key ? " active" : ""}`}>{label}</button>
        ))}
      </div>
    </>
  );
}

// ─── DAY MODE SELECTOR ────────────────────────────────────────────────────────

function DayModeSelector({ dayType, setDayType, allTargets, c }) {
  const modes = [
    { key: "calm",     icon: "🌿", label: "Base",     kcal: allTargets.calm.calMax     },
    { key: "active",   icon: "⚡", label: "Active",   kcal: allTargets.active.calMax   },
    { key: "training", icon: "🏃", label: "Training", kcal: allTargets.training.calMax },
  ];
  const idx = modes.findIndex(m => m.key === (dayType || "calm"));
  const thumbPositions = ["0%", "50%", "100%"];
  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ position: "relative", paddingBottom: 20 }}>
        <div style={{ position: "relative", height: 5, background: c.borderLight, borderRadius: 99, margin: "0 14px" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: thumbPositions[idx], background: c.accent, borderRadius: 99, transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)" }} />
          {[0,1,2].map(i => (
            <div key={i} onClick={() => setDayType(modes[i].key)} style={{ position: "absolute", top: "50%", left: i === 0 ? "0%" : i === 1 ? "50%" : "100%", transform: "translate(-50%,-50%)", width: 10, height: 10, borderRadius: "50%", background: i <= idx ? c.accent : c.borderLight, border: `2px solid ${i <= idx ? c.accent : c.border}`, cursor: "pointer", transition: "background 0.25s", zIndex: 1 }} />
          ))}
          <div onClick={e => { const rect = e.currentTarget.parentElement.getBoundingClientRect(); const x = (e.clientX - rect.left) / rect.width; setDayType(modes[x < 0.33 ? 0 : x < 0.67 ? 1 : 2].key); }} style={{ position: "absolute", top: "50%", left: thumbPositions[idx], transform: "translate(-50%,-50%)", width: 16, height: 16, borderRadius: "50%", background: c.bgCard, border: `2px solid ${c.accent}`, boxShadow: "0 1px 4px rgba(100,120,200,0.22)", cursor: "pointer", transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)", zIndex: 2 }} />
        </div>
        <div style={{ position: "absolute", top: -8, left: 0, right: 0, height: 28, cursor: "pointer" }} onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); const x = (e.clientX - rect.left) / rect.width; setDayType(modes[x < 0.33 ? 0 : x < 0.67 ? 1 : 2].key); }} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, padding: "0 4px" }}>
          {modes.map((m, i) => (
            <div key={m.key} onClick={() => setDayType(m.key)} style={{ display: "flex", flexDirection: "column", alignItems: i === 0 ? "flex-start" : i === 1 ? "center" : "flex-end", cursor: "pointer", minWidth: 52 }}>
              <span style={{ fontSize: 11, fontWeight: i === idx ? 600 : 400, color: i === idx ? c.text : c.textLight, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.3 }}>{m.icon} {m.label}</span>
              <span style={{ fontSize: 10, color: i === idx ? c.accent : c.textLight, fontFamily: "'DM Sans',sans-serif", fontWeight: i === idx ? 600 : 400 }}>{m.kcal} kcal</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MEALS LIST ───────────────────────────────────────────────────────────────

function MealsList({ meals, currentDate, activityBurn, onRemove, onCloseDay, onGoAdd, onGoActivity, S, c }) {
  const sectionLabel = { ...S.label, color: c.textMuted };
  return (
    <div>
      <div style={S.sec}>
        <div onClick={onGoActivity} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "2px 0" }}>
          <div style={sectionLabel}>
            Activity today
            {activityBurn > 0 && <span style={{ color: c.accent, fontWeight: 600, marginLeft: 6, textTransform: "none", letterSpacing: 0 }}>{activityBurn} burned today</span>}
          </div>
          <div style={{ fontSize: 11, color: c.textLight }}>adjust →</div>
        </div>
      </div>
      <div style={S.sec}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={sectionLabel}>Meals today · <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{currentDate}</span></div>
          <div style={{ fontSize: 11, color: c.textLight }}>{meals.length} items</div>
        </div>
        <div style={S.card}>
          {meals.length === 0 && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: 12, color: c.textLight, marginBottom: 8 }}>No meals logged yet</div>
              <button onClick={onGoAdd} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: c.accent, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, padding: 0 }}>+ first meal</button>
            </div>
          )}
          {meals.map((m, i) => (
            <div key={m.id} style={{ ...S.mealRow, borderBottom: i < meals.length - 1 ? `1px solid ${c.borderLight}` : "none" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...S.mealName, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                {m.note && <div style={S.mealNote}>{m.note}</div>}
              </div>
              <div style={S.mealNums}>
                <div style={S.mealKcal}>{m.kcal} kcal</div>
                {m.protein > 0 && <div style={S.mealProt}>{m.protein}g prot</div>}
              </div>
              <button onClick={() => onRemove(m.id)} style={S.mealDel}>×</button>
            </div>
          ))}
        </div>
        <button
          style={{ ...S.btn("secondary"), width: "100%", padding: 13, color: "#363d5c", fontWeight: 600, background: "#dfe3f5", fontSize: 13 }}
          onClick={onCloseDay}
        >
          💤 Close today
        </button>
      </div>
    </div>
  );
}

// ─── ADD FOOD PANEL ───────────────────────────────────────────────────────────

function AddFoodPanel({
  foodMethod, setFoodMethod,
  query, setQuery, grams, preview, loading, error,
  onEstimate, onGramsChange, onAddPreview,
  photoData, setPhotoData, fileRef, onPhotoUpload, onAnalyzePhoto,
  savedFoodsCustom, onAddSavedFood, setEditingFood,
  manualSearch, setManualSearch, showSuggestions, setShowSuggestions,
  manualName, setManualName, manualKcal, setManualKcal,
  manualProt, setManualProt, manualNote, setManualNote,
  manualSave, setManualSave, onAddManual,
  S, c,
}) {
  // Chip style — compact action tool feel
  const chip = (active) => ({
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "5px 10px", borderRadius: 99, border: "none", cursor: "pointer",
    fontSize: 12, fontWeight: active ? 600 : 400,
    background: active ? "#e8ecff" : c.bgMuted,
    color: active ? c.accent : c.textMuted,
    fontFamily: "'DM Sans',sans-serif",
    transition: "background 0.12s, color 0.12s",
  });

  return (
    <div>
      {/* ── Default: Describe input always visible ── */}
      {(foodMethod === "write" || foodMethod === "snap" || foodMethod === "manual" || foodMethod === "saved") && (
        <div style={S.card}>

          {/* Describe input — always shown */}
          {foodMethod !== "manual" && foodMethod !== "saved" && foodMethod !== "snap" && (
            <>
              <input style={S.input} placeholder="Describe your meal…" value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && onEstimate()} />
              <button style={{ ...S.btn("primary", loading || !query.trim()), width: "100%", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                onClick={onEstimate} disabled={loading || !query.trim()}>
                {loading ? <><Spinner /> Estimating...</> : "Estimate meal"}
              </button>
              {error && <div style={{ color: c.tomato, fontSize: 12, marginTop: 8 }}>{error}</div>}
              {preview && <PreviewResult preview={preview} grams={grams} onGramsChange={onGramsChange} onAdd={onAddPreview} S={S} c={c} />}
            </>
          )}

          {/* Snap panel */}
          {foodMethod === "snap" && (
            <>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={onPhotoUpload} />
              {!photoData ? (
                <div onClick={() => fileRef.current?.click()} style={{ border: `1px dashed ${c.border}`, borderRadius: 10, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: c.bgMuted }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>📸</div>
                  <div style={{ fontSize: 13, color: c.textMuted }}>Tap to take or upload a photo</div>
                </div>
              ) : (
                <div>
                  <img src={photoData.url} alt="meal" style={{ width: "100%", borderRadius: 10, maxHeight: 190, objectFit: "cover" }} />
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button style={{ ...S.btn("secondary"), flex: 1 }} onClick={() => setPhotoData(null)}>Remove</button>
                    <button style={{ ...S.btn("primary", loading), flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={onAnalyzePhoto} disabled={loading}>
                      {loading ? <><Spinner /> Estimating...</> : "Estimate meal"}
                    </button>
                  </div>
                </div>
              )}
              {error && <div style={{ color: c.tomato, fontSize: 12, marginTop: 8 }}>{error}</div>}
              {preview && <PreviewResult preview={preview} grams={grams} onGramsChange={onGramsChange} onAdd={onAddPreview} S={S} c={c} />}
            </>
          )}

          {/* Manual panel */}
          {foodMethod === "manual" && (() => {
            const q = manualSearch.trim().toLowerCase();
            const suggestions = q.length > 0
              ? (() => { const canonical = FOOD_SYNONYMS[q]; return FOOD_LIBRARY.filter(f => f.name.toLowerCase().includes(q) || (canonical && f.name === canonical)).slice(0, 7); })()
              : [];
            function selectSuggestion(food) {
              setManualName(food.name); setManualKcal(String(food.kcal)); setManualProt(String(food.protein));
              setManualSearch(""); setShowSuggestions(false);
            }
            return (
              <>
                <div style={{ marginBottom: 14, position: "relative" }}>
                  <div style={{ ...S.label, marginBottom: 6 }}>Search food library</div>
                  <input style={S.input} placeholder="e.g. egg, chicken, yogurt…" value={manualSearch}
                    onChange={e => { setManualSearch(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} />
                  {showSuggestions && suggestions.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: c.bgCard, borderRadius: 10, boxShadow: "0 4px 16px rgba(100,120,200,0.12)", zIndex: 10, marginTop: 4, overflow: "hidden" }}>
                      {suggestions.map((food, i) => (
                        <div key={food.name} onMouseDown={() => selectSuggestion(food)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: i < suggestions.length - 1 ? `1px solid ${c.borderLight}` : "none", cursor: "pointer" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{food.name}</div>
                            <div style={{ fontSize: 11, color: c.textLight, marginTop: 1 }}>{food.unit}</div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 11, color: c.accent, fontWeight: 600 }}>{food.kcal} kcal</div>
                            <div style={{ fontSize: 10, color: c.protein }}>{food.protein}g</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ paddingTop: 4, borderTop: `1px solid ${c.borderLight}` }}>
                  <div style={{ marginBottom: 12, marginTop: 12 }}>
                    <div style={{ ...S.label, marginBottom: 6 }}>Meal name</div>
                    <input style={S.input} placeholder="e.g. Chicken salad" value={manualName} onChange={e => setManualName(e.target.value)} />
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...S.label, marginBottom: 6 }}>Calories</div>
                      <input style={S.inputSm} type="number" placeholder="e.g. 420" value={manualKcal} onChange={e => setManualKcal(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...S.label, marginBottom: 6 }}>Protein (g)</div>
                      <input style={S.inputSm} type="number" placeholder="e.g. 32" value={manualProt} onChange={e => setManualProt(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ ...S.label, marginBottom: 6 }}>Note <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional</span></div>
                    <input style={{ ...S.input, fontSize: 13 }} placeholder="e.g. homemade" value={manualNote} onChange={e => setManualNote(e.target.value)} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <button onClick={() => setManualSave(p => !p)} style={{ width: 36, height: 20, borderRadius: 99, border: "none", cursor: "pointer", background: manualSave ? c.accent : c.border, position: "relative", transition: "background 0.18s", flexShrink: 0 }}>
                      <span style={{ position: "absolute", top: 2, left: manualSave ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.18s", display: "block" }} />
                    </button>
                    <div style={{ fontSize: 12, color: c.textMuted }}>Save for later</div>
                  </div>
                  <button style={{ ...S.btn("primary", !manualName.trim() || !manualKcal), width: "100%" }} onClick={onAddManual} disabled={!manualName.trim() || !manualKcal}>Add to today →</button>
                </div>
              </>
            );
          })()}

          {/* Saved panel */}
          {foodMethod === "saved" && (
            <>
              {savedFoodsCustom.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 12, color: c.textLight, marginBottom: 4 }}>No saved foods yet</div>
                  <div style={{ fontSize: 11, color: c.textLight }}>Use Manual → Save for later</div>
                </div>
              ) : savedFoodsCustom.map((food, i) => (
                <div key={food.name + i} style={{ display: "flex", alignItems: "center", padding: "13px 0", gap: 10, borderBottom: i < savedFoodsCustom.length - 1 ? `1px solid ${c.borderLight}` : "none" }}>
                  <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setEditingFood({ food: { ...food }, isCustom: true })}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{food.name}</div>
                    <div style={{ fontSize: 11, color: c.textLight, marginTop: 2 }}>
                      {food.unit && <span style={{ marginRight: 4 }}>{food.unit} ·</span>}
                      <span style={{ color: c.accent, fontWeight: 500 }}>{food.kcal} kcal</span>
                      <span style={{ margin: "0 3px", color: c.borderLight }}>·</span>
                      <span style={{ color: c.protein, fontWeight: 500 }}>{food.protein}g</span>
                    </div>
                  </div>
                  <button style={{ ...S.addBtn, width: 28, height: 28, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 400, borderRadius: 8 }} onClick={() => onAddSavedFood(food)}>+</button>
                </div>
              ))}
            </>
          )}

          {/* Action chips row — always visible at bottom */}
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            <button style={chip(foodMethod === "snap")}    onClick={() => setFoodMethod(foodMethod === "snap"    ? "write" : "snap")}>📷 Snap</button>
            <button style={chip(foodMethod === "manual")}  onClick={() => setFoodMethod(foodMethod === "manual"  ? "write" : "manual")}>⌨ Manual</button>
            <button style={chip(foodMethod === "saved")}   onClick={() => setFoodMethod(foodMethod === "saved"   ? "write" : "saved")}>☆ Saved</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PREVIEW RESULT (shared between Describe + Snap) ─────────────────────────

function PreviewResult({ preview, grams, onGramsChange, onAdd, S, c }) {
  return (
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
        <input type="range" min={50} max={600} step={10} value={grams} onChange={e => onGramsChange(Number(e.target.value))} style={S.slider} />
      </div>
      <button style={{ ...S.btn("primary"), width: "100%", marginTop: 12 }} onClick={onAdd}>Add to today →</button>
    </div>
  );
}

// ─── ADD ACTIVITY PANEL ───────────────────────────────────────────────────────

function AddActivityPanel({ stepsInput, setStepsInput, manualInput, setManualInput, savedActivities, actLog, activityBurn, onAddSteps, onAddManualBurn, onAddSavedActivity, onRemoveActEntry, onNewAct, S, c }) {
  return (
    <div>
      <div style={S.card}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ ...S.label, marginBottom: 6 }}>Steps today</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input style={{ ...S.inputSm, flex: 1 }} type="number" placeholder="e.g. 8,500" value={stepsInput} onChange={e => setStepsInput(e.target.value)} onKeyDown={e => e.key === "Enter" && onAddSteps()} />
            <div style={{ fontSize: 11, color: c.textLight, flexShrink: 0, minWidth: 52 }}>≈ {stepsInput ? Math.round(Number(stepsInput) * 0.04) : 0} kcal</div>
            <button style={{ ...S.addBtn, width: 28, height: 28, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 400, borderRadius: 8 }} onClick={onAddSteps}>+</button>
          </div>
          <div style={{ fontSize: 10, color: c.textLight, marginTop: 4 }}>Replaces previous steps entry</div>
        </div>
        <div style={{ marginBottom: 14, paddingTop: 12, borderTop: `1px solid ${c.borderLight}` }}>
          <div style={{ ...S.label, marginBottom: 6 }}>Manual kcal burn</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input style={{ ...S.inputSm, flex: 1 }} type="number" placeholder="e.g. 350" value={manualInput} onChange={e => setManualInput(e.target.value)} onKeyDown={e => e.key === "Enter" && onAddManualBurn()} />
            <button style={{ ...S.addBtn, width: 28, height: 28, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 400, borderRadius: 8 }} onClick={onAddManualBurn}>+</button>
          </div>
        </div>
        <div style={{ paddingTop: 12, borderTop: `1px solid ${c.borderLight}` }}>
          <div style={{ ...S.label, marginBottom: 10 }}>Saved activities</div>
          {savedActivities.map((a, i) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: i < savedActivities.length - 1 ? `1px solid ${c.borderLight}` : "none", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13, fontWeight: 500, color: c.text }}>{a.name}</div>
              <div style={{ width: 60, textAlign: "right", fontSize: 11, color: c.textLight, flexShrink: 0 }}>+{a.kcal} kcal</div>
              <button style={{ ...S.addBtn, width: 28, height: 28, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 400, borderRadius: 8, flexShrink: 0 }} onClick={() => onAddSavedActivity(a)}>+</button>
            </div>
          ))}
          <button onClick={onNewAct} style={{ marginTop: 12, background: "none", border: "none", cursor: "pointer", color: c.textLight, fontSize: 12, fontFamily: "'DM Sans',sans-serif", padding: 0 }}>+ New activity</button>
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
              <button onClick={() => onRemoveActEntry(e.id)} style={S.mealDel}>×</button>
            </div>
          ))}
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${c.borderLight}`, fontSize: 12, color: c.textMuted }}>
            Total: <span style={{ color: c.accent, fontWeight: 600 }}>{activityBurn} kcal burned</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HISTORY PANEL ────────────────────────────────────────────────────────────

function HistoryPanel({ historyDesc, onRowClick, S, c }) {
  return (
    <div style={S.sec}>
      <div style={{ ...S.label, marginBottom: 10 }}>Past days</div>
      <div style={S.card}>
        <div style={{ display: "grid", gridTemplateColumns: "52px 1fr 70px 52px 60px", gap: 5, alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${c.borderLight}`, fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase", color: c.textLight }}>
          <div>Date</div><div>Activity</div><div>Kcal</div><div>Prot</div><div>Status</div>
        </div>
        {historyDesc.map((d, i) => {
          const sc = statusConfig[getStatus(d.calMin, d.calMax, d.protMin, d.protMax, d.type)];
          return (
            <div key={i} onClick={() => onRowClick(d)} style={{ display: "grid", gridTemplateColumns: "52px 1fr 70px 52px 60px", gap: 5, alignItems: "center", padding: "9px 0", borderBottom: i < historyDesc.length - 1 ? `1px solid ${c.borderLight}` : "none", fontSize: 11, cursor: "pointer", color: c.text }}>
              <div style={{ fontWeight: 500 }}>{d.date}</div>
              <div style={{ color: c.textMuted, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.activity}</div>
              <div style={{ color: c.textMuted }}>{d.calMax}</div>
              <div style={{ color: c.textMuted }}>{d.protMax}g</div>
              <div><span style={S.pill(sc.color, sc.bg)}>{sc.label}</span></div>
            </div>
          );
        })}
      </div>
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
  const [savedFoodsCustom, setSavedFoodsCustom] = useState(() => { try { const s = localStorage.getItem("savedFoodsCustom_v11"); return s ? JSON.parse(s) : []; } catch { return []; } });

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
  const [favQty,       setFavQty]       = useState({});
  const [editingFood,  setEditingFood]  = useState(null); // { food, index, isCustom }

  // Manual entry state
  const [manualName,   setManualName]   = useState("");
  const [manualKcal,   setManualKcal]   = useState("");
  const [manualProt,   setManualProt]   = useState("");
  const [manualNote,   setManualNote]   = useState("");
  const [manualSave,   setManualSave]   = useState(false);
  const [manualSearch, setManualSearch] = useState("");   // library search query
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [actLog,       setActLog]       = useState(() => { try { const s = localStorage.getItem("actLog_v11"); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [stepsInput,   setStepsInput]   = useState("");
  const [manualInput,  setManualInput]  = useState("");
  const [daySaved,     setDaySaved]     = useState(false);
  const [showSummary,  setShowSummary]  = useState(false);

  // Current day tracking — real date label, persisted
  const [currentDate,  setCurrentDate]  = useState(() => {
    try { return localStorage.getItem("currentDate_v11") || formatDate(new Date()); } catch { return formatDate(new Date()); }
  });

  // Sleeping state — true when new day starts before first meal
  const [sleeping,     setSleeping]     = useState(() => {
    try { return localStorage.getItem("sleeping_v11") === "true"; } catch { return false; }
  });

  // History day editor
  const [editingDay,   setEditingDay]   = useState(null); // history entry being edited
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
  useEffect(() => { try { localStorage.setItem("savedFoodsCustom_v11", JSON.stringify(savedFoodsCustom)); } catch {} }, [savedFoodsCustom]);
  useEffect(() => { try { if (dayType)       localStorage.setItem("dayType_v11",  dayType);        } catch {} }, [dayType]);
  useEffect(() => { try { if (customTargets) localStorage.setItem("targets_v11",  JSON.stringify(customTargets)); } catch {} }, [customTargets]);
  useEffect(() => { try { localStorage.setItem("currentDate_v11", currentDate);                    } catch {} }, [currentDate]);
  useEffect(() => { try { localStorage.setItem("sleeping_v11",    String(sleeping));               } catch {} }, [sleeping]);

  const goalKcal   = customTargets?.calMax  || DEFAULT_GOAL_KCAL;
  const goalProt   = customTargets?.protMax || DEFAULT_PROT_MAX;
  const allTargets = buildTargets(goalKcal, goalProt);
  const target = allTargets[dayType || "calm"] || allTargets.calm;
  const activityBurn = actLog.reduce((s, e) => s + e.kcal, 0);
  const adjCalMin    = target.calMin + activityBurn;
  const adjCalMax    = target.calMax + activityBurn;
  const totalKcal    = Math.round(meals.reduce((s, m) => s + Number(m.kcal), 0));
  const totalProt    = Math.round(meals.reduce((s, m) => s + Number(m.protein), 0));
  const mood = sleeping ? "sleeping" : getFrogMood(totalKcal, totalProt, adjCalMin, target.protMin);
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
    setSleeping(false);
    showToast(`Added · ${preview.kcal} kcal · ${preview.protein}g protein`);
    setPreview(null); setQuery(""); setPhotoData(null); setGrams(100); setTab("today");
  }

  function addSavedFood(food) {
    setMeals(p => [...p, { id: Date.now(), name: food.name, kcal: food.kcal, protein: food.protein, note: food.unit || "" }]);
    setSleeping(false);
    showToast(`Added · ${food.kcal} kcal · ${food.protein}g protein`);
  }

  function saveFoodEdit({ original, updated, isCustom }) {
    if (isCustom) {
      setSavedFoodsCustom(p => p.map(f => f.name === original.name ? updated : f));
    }
    // Default SAVED_FOODS are immutable — edit only available for custom
    setEditingFood(null);
  }

  function deleteSavedFood(food) {
    setSavedFoodsCustom(p => p.filter(f => f.name !== food.name));
    setEditingFood(null);
  }

  function addManualEntry() {
    const name = manualName.trim();
    const kcal = Number(manualKcal);
    const prot = Number(manualProt) || 0;
    if (!name || !kcal) return;
    setMeals(p => [...p, { id: Date.now(), name, kcal, protein: prot, note: manualNote.trim() }]);
    setSleeping(false);
    if (manualSave) {
      setSavedFoodsCustom(p => [...p, { name, kcal, protein: prot, unit: "1 serving" }]);
    }
    showToast(`Added · ${kcal} kcal · ${prot}g protein`);
    setManualName(""); setManualKcal(""); setManualProt(""); setManualNote(""); setManualSave(false);
    setTab("today");
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
  function closeDay() {
    // Build history entry with full meals snapshot for future editing
    const entry = {
      date:     currentDate,
      calMin:   Math.max(0, totalKcal - 80),
      calMax:   totalKcal + 80,
      protMin:  Math.max(0, totalProt - 5),
      protMax:  totalProt + 5,
      activity: activityBurn > 0 ? `+${activityBurn} kcal activity` : (dayType === "training" ? "training day" : dayType === "active" ? "active day" : "calm day"),
      type:     dayType || "calm",
      meals:    [...meals],       // snapshot for editing
      actLog:   [...actLog],
    };
    setHistory(p => {
      const ex = p.findIndex(h => h.date === currentDate);
      return ex >= 0 ? p.map((h, i) => i === ex ? entry : h) : [...p, entry];
    });

    // Advance to next day — clear everything, set sleeping
    const nextDate = nextDateLabel(currentDate);
    setCurrentDate(nextDate);
    setMeals([]);
    setActLog([]);
    setDaySaved(false);
    setSleeping(true);
    setShowSummary(true);
  }

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
    protTrack:   "#d8f580",
    calTrack:    "#c8d8ff",
    tomato:      "#F06038",
  };

  const S = {
    root: { minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'DM Sans',sans-serif", paddingBottom: 72 },

    // Logo — quiet modern, elegant lowercase, Cormorant-like feel via Manrope light
    logo: {
      padding: "16px 16px 0",
      fontFamily: "'DynaPuff', sans-serif",
      fontSize: 27,
      fontWeight: 600,
      letterSpacing: "0.01em",
      color: "#6b7080",
    },

    // Hero
    hero: { margin: "10px 12px 0", background: c.bgCard, borderRadius: 18, boxShadow: "0 1px 10px rgba(100,120,200,0.06)", padding: "14px 14px 12px", display: "flex", flexDirection: "row", alignItems: "stretch", minHeight: 160, position: "relative" },
    heroLeft:  { width: "40%", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end" },
    // Rings anchor to bottom — matches frog baseline
    heroRight: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingLeft: 6, paddingBottom: 4 },

    // Visible "adjust →" trigger — top right inside hero, light grey, minimal
    heroAdjust: { position: "absolute", top: 13, right: 14, background: "none", border: "none", cursor: "pointer", fontSize: 10, color: c.textLight, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, padding: 0, letterSpacing: "0.04em" },

    ringRow:       { display: "flex", alignItems: "center", gap: 8, padding: "4px 0" },
    ringGap:       { height: 6 },
    ringMeta:      { display: "flex", flexDirection: "column" },
    // Label sits tight above value — no gap
    ringMetaLabel: { fontSize: 9, fontWeight: 500, color: c.textLight, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.2, marginBottom: 1 },
    // Value is the anchor — clear weight
    ringMetaVal:   { fontSize: 15, fontWeight: 700, fontFamily: "'Manrope',sans-serif", lineHeight: 1.15, letterSpacing: "-0.01em", marginBottom: 4 },
    // Subtext breathes below value
    ringMetaSub:   { fontSize: 10, fontWeight: 400, color: c.textLight, lineHeight: 1.3 },

    // ── TOP NAV (clean rebuild) ───────────────────────────────────────────────

    dayTypeSec: { padding: "12px 12px 0" },

    sec:   { padding: "8px 12px 0" },
    label: { fontSize: 10, letterSpacing: "0.09em", textTransform: "uppercase", color: c.textLight, fontWeight: 500 },
    card:  { background: c.bgCard, borderRadius: 14, padding: "12px 14px", marginBottom: 10, boxShadow: "0 1px 5px rgba(100,120,200,0.05)" },
    cardMuted: { background: c.bgMuted, borderRadius: 14, padding: 13, marginBottom: 10 },
    sub:   { fontSize: 11, color: c.textMuted, marginTop: 2, fontWeight: 400 },

    l1Row: { display: "flex", gap: 0, background: c.bgMuted, borderRadius: 18, padding: "4px", marginBottom: 14 },
    l1Btn: (a) => ({ flex: 1, padding: "8px 0", border: "none", cursor: "pointer", fontSize: 13, fontWeight: a ? 600 : 400, background: a ? "#ffffff" : "transparent", color: a ? c.text : c.textLight, fontFamily: "'DM Sans',sans-serif", borderRadius: a ? 14 : 14, boxShadow: a ? "0 2px 6px rgba(100,120,200,0.12), 0 1px 2px rgba(0,0,0,0.06)" : "none", transition: "background 0.15s, color 0.15s, box-shadow 0.15s" }),

    l2Row: { display: "flex", gap: 0, background: c.bgMuted, borderRadius: 18, padding: "4px", marginBottom: 14 },
    l2Btn: (a) => ({ flex: 1, padding: "7px 0", border: "none", cursor: "pointer", fontSize: 12, fontWeight: a ? 600 : 400, background: a ? "#ffffff" : "transparent", color: a ? c.text : c.textLight, fontFamily: "'DM Sans',sans-serif", borderRadius: a ? 14 : 14, boxShadow: a ? "0 2px 6px rgba(100,120,200,0.12), 0 1px 2px rgba(0,0,0,0.06)" : "none", transition: "background 0.15s, color 0.15s, box-shadow 0.15s" }),

    input:   { width: "100%", background: c.bgMuted, border: "none", borderRadius: 10, padding: "9px 11px", color: c.text, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans',sans-serif" },
    inputSm: { background: c.bgMuted, border: "none", borderRadius: 10, padding: "8px 10px", color: c.text, fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", width: "100%", boxSizing: "border-box" },

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

    // addBtn — radius unified to 8, accent tint bg as token-equivalent
    addBtn: { padding: "5px 11px", borderRadius: 8, border: "none", cursor: "pointer", background: "#e8ecff", color: c.accent, fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 },

    // Meal row — stricter right-side grid alignment
    mealRow:  { display: "flex", alignItems: "center", padding: "6px 0" },
    mealName: { fontSize: 13, fontWeight: 400, color: c.text, lineHeight: 1.3, flex: 1 },
    mealNote: { fontSize: 11, color: c.textLight, marginTop: 1, fontWeight: 400, fontStyle: "italic", opacity: 0.7 },
    // Right block: fixed width for clean vertical alignment
    mealNums: { width: 72, textAlign: "right", marginRight: 8, flexShrink: 0 },
    mealKcal: { fontSize: 12, color: c.accent,  fontWeight: 600, lineHeight: 1.2 },
    mealProt: { fontSize: 11, color: c.protein, fontWeight: 500, lineHeight: 1.2 },
    mealDel:  { background: "none", border: "none", color: "#d8dcea", cursor: "pointer", fontSize: 15, padding: "0 2px", lineHeight: 1, flexShrink: 0 },

    // pill — radius unified to 8 to match button family
    pill:    (color, bg) => ({ fontSize: 10, fontWeight: 500, letterSpacing: "0.02em", color, background: bg, borderRadius: 8, padding: "3px 8px" }),
    histRow: { display: "grid", gridTemplateColumns: "52px 1fr 74px 54px 66px", gap: 5, alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${c.borderLight}`, fontSize: 11 },
    modal:      { position: "fixed", inset: 0, background: "rgba(26,31,54,0.38)", zIndex: 99, display: "flex", alignItems: "flex-end" },
    modalInner: { background: c.bgCard, borderRadius: "18px 18px 0 0", padding: 22, width: "100%", boxSizing: "border-box", boxShadow: "0 -4px 20px rgba(100,120,200,0.09)" },
    // previewCard unified to 14 to match card family
    previewCard: { background: "#f2f4ff", borderRadius: 14, padding: 13, marginTop: 12 },
    slider:  { width: "100%", accentColor: c.accent, marginTop: 5 },
  };

  // remaining = displayed target - consumed — single source of truth
  const calRoomLeft  = Math.max(0, adjCalMax    - totalKcal);
  const protRoomLeft = Math.max(0, target.protMax - totalProt);

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { -webkit-tap-highlight-color: transparent; } input[type=range] { height: 4px; }`}</style>
      <link href="https://fonts.googleapis.com/css2?family=DynaPuff:wght@600&family=Manrope:wght@300;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={S.root}>

        {/* LOGO — quiet, weight 300, wide tracking, lowercase */}
        <div style={S.logo}>Fit frog</div>

        {/* HERO */}
        <HeroSummary
          sleeping={sleeping} totalKcal={totalKcal} totalProt={totalProt}
          adjCalMin={adjCalMin} adjCalMax={adjCalMax} target={target}
          calRoomLeft={calRoomLeft} protRoomLeft={protRoomLeft}
          onAdjust={openTargetEditor} S={S} c={c}
        />

        {/* NAV + CONTENT CARD — tabs on grey tray, active tab merges with white content */}
        <div style={{ margin: "10px 12px 0" }}>
          {/* Grey tray — holds all three tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", background: "#ECEEF5", borderRadius: "16px 16px 0 0", padding: "6px 6px 0", gap: 4 }}>
            {[["today","Today"],["add","+ Add"],["history","History"]].map(([key, label]) => {
              const active = tab === key;
              return (
                <button key={key} onClick={() => setTab(key)} style={{
                  height: 40, border: "none", cursor: "pointer",
                  borderRadius: active ? "12px 12px 0 0" : 10,
                  background: active ? "#FFFFFF" : "transparent",
                  color: active ? "#1a1f36" : "#9AA1B8",
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  fontFamily: "'DM Sans', sans-serif",
                  marginBottom: active ? 0 : 0,
                  transition: "background 0.15s, color 0.15s",
                }}>{label}</button>
              );
            })}
          </div>

          {/* White content surface — flush below active tab */}
          <div style={{ background: "#FFFFFF", borderRadius: "0 0 16px 16px", boxShadow: "0 2px 12px rgba(100,120,200,0.07)", paddingBottom: 4 }}>

        {/* ── TODAY ─────────────────────────────────────────────────────────── */}
        {tab === "today" && (
          <div>
            <DayModeSelector dayType={dayType} setDayType={setDayType} allTargets={allTargets} c={c} />
            <MealsList
              meals={meals} currentDate={currentDate} activityBurn={activityBurn}
              onRemove={removeMeal} onCloseDay={closeDay}
              onGoAdd={() => { setTab("add"); setAddLevel1("food"); setFoodMethod("write"); }}
              onGoActivity={() => { setTab("add"); setAddLevel1("activity"); }}
              S={S} c={c}
            />
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
              <AddFoodPanel
                foodMethod={foodMethod} setFoodMethod={m => { setFoodMethod(m); setPreview(null); setError(""); }}
                query={query} setQuery={setQuery} grams={grams} preview={preview} loading={loading} error={error}
                onEstimate={handleEstimate} onGramsChange={handleGramsChange} onAddPreview={addPreview}
                photoData={photoData} setPhotoData={setPhotoData} fileRef={fileRef}
                onPhotoUpload={handlePhotoUpload} onAnalyzePhoto={handleAnalyzePhoto}
                savedFoodsCustom={savedFoodsCustom} onAddSavedFood={addSavedFood} setEditingFood={setEditingFood}
                manualSearch={manualSearch} setManualSearch={setManualSearch}
                showSuggestions={showSuggestions} setShowSuggestions={setShowSuggestions}
                manualName={manualName} setManualName={setManualName}
                manualKcal={manualKcal} setManualKcal={setManualKcal}
                manualProt={manualProt} setManualProt={setManualProt}
                manualNote={manualNote} setManualNote={setManualNote}
                manualSave={manualSave} setManualSave={setManualSave}
                onAddManual={addManualEntry}
                S={S} c={c}
              />
            )}
            {addLevel1 === "activity" && (
              <AddActivityPanel
                stepsInput={stepsInput} setStepsInput={setStepsInput}
                manualInput={manualInput} setManualInput={setManualInput}
                savedActivities={savedActivities} actLog={actLog} activityBurn={activityBurn}
                onAddSteps={addSteps} onAddManualBurn={addManualBurn}
                onAddSavedActivity={addSavedActivity} onRemoveActEntry={removeActEntry}
                onNewAct={() => setShowNewAct(true)}
                S={S} c={c}
              />
            )}
          </div>
        )}

        {/* ── HISTORY ───────────────────────────────────────────────────────── */}
        {tab === "history" && (
          <HistoryPanel historyDesc={historyDesc} onRowClick={d => setEditingDay({ ...d })} S={S} c={c} />
        )}

          </div>{/* end white content surface */}
        </div>{/* end tray wrapper */}

        {/* ── SUMMARY MODAL — shown after closing a day ─────────────────────── */}
        {showSummary && (
          <div style={S.modal} onClick={() => setShowSummary(false)}>
            <div style={S.modalInner} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Manrope',sans-serif", marginBottom: 3, color: c.text }}>Day closed</div>
              <div style={{ fontSize: 12, color: c.textLight, marginBottom: 14 }}>Saved to history · new day starting</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div style={S.cardMuted}><div style={S.label}>Calories</div><div style={{ fontSize: 24, fontWeight: 800, color: c.accent, marginTop: 4, fontFamily: "'Manrope',sans-serif" }}>{history[history.length - 1]?.calMax || 0}</div></div>
                <div style={S.cardMuted}><div style={S.label}>Protein</div><div style={{ fontSize: 24, fontWeight: 800, color: c.protein, marginTop: 4, fontFamily: "'Manrope',sans-serif" }}>{history[history.length - 1]?.protMax || 0}g</div></div>
              </div>
              <button style={{ ...S.btn("primary"), width: "100%" }} onClick={() => setShowSummary(false)}>Start new day</button>
            </div>
          </div>
        )}

        {/* ── DAY DETAIL MODAL — tap history row ────────────────────────────── */}
        {editingDay && <DayDetailModal
          day={editingDay}
          onClose={() => setEditingDay(null)}
          onUpdate={(updatedDay) => {
            setHistory(p => p.map(h => h.date === updatedDay.date ? updatedDay : h));
            setEditingDay(updatedDay);
          }}
          onRestore={(day) => {
            setMeals(day.meals || []);
            setActLog(day.actLog || []);
            setSleeping(false);
            setCurrentDate(day.date);
            setHistory(p => p.filter(h => h.date !== day.date));
            setEditingDay(null);
            setTab("today");
            showToast(`Restored ${day.date}`);
          }}
          c={c} S={S}
        />}

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

        {/* ── SAVED FOOD EDIT SHEET ─────────────────────────────────────────── */}
        {editingFood && <SavedFoodEditSheet
          food={editingFood.food}
          isCustom={editingFood.isCustom}
          onSave={(updated) => saveFoodEdit({ original: editingFood.food, updated, isCustom: editingFood.isCustom })}
          onDelete={() => deleteSavedFood(editingFood.food)}
          onClose={() => setEditingFood(null)}
          c={c} S={S}
        />}

        <Toast msg={toast} />
      </div>
    </>
  );
}

// ─── DAY DETAIL MODAL ────────────────────────────────────────────────────────

function DayDetailModal({ day, onClose, onUpdate, onRestore, c, S }) {
  const [meals,      setMeals]      = useState(day.meals || []);
  const [actLog,     setActLog]     = useState(day.actLog || []);
  const [addingMeal, setAddingMeal] = useState(false);
  const [newName,    setNewName]    = useState("");
  const [newKcal,    setNewKcal]    = useState("");
  const [newProt,    setNewProt]    = useState("");

  const totalKcal = Math.round(meals.reduce((s, m) => s + Number(m.kcal), 0));
  const totalProt = Math.round(meals.reduce((s, m) => s + Number(m.protein), 0));
  const actBurn   = actLog.reduce((s, e) => s + e.kcal, 0);

  function removeMeal(id) {
    const updated = meals.filter(m => m.id !== id);
    setMeals(updated);
    const tk = Math.round(updated.reduce((s, m) => s + Number(m.kcal), 0));
    const tp = Math.round(updated.reduce((s, m) => s + Number(m.protein), 0));
    onUpdate({ ...day, meals: updated, calMax: tk + 80, calMin: Math.max(0, tk - 80), protMax: tp + 5, protMin: Math.max(0, tp - 5) });
  }

  function addMeal() {
    const name = newName.trim(), kcal = Number(newKcal), prot = Number(newProt) || 0;
    if (!name || !kcal) return;
    const updated = [...meals, { id: Date.now(), name, kcal, protein: prot, note: "" }];
    setMeals(updated);
    const tk = Math.round(updated.reduce((s, m) => s + Number(m.kcal), 0));
    const tp = Math.round(updated.reduce((s, m) => s + Number(m.protein), 0));
    onUpdate({ ...day, meals: updated, calMax: tk + 80, calMin: Math.max(0, tk - 80), protMax: tp + 5, protMin: Math.max(0, tp - 5) });
    setNewName(""); setNewKcal(""); setNewProt(""); setAddingMeal(false);
  }

  function removeActivity(id) {
    const updated = actLog.filter(e => e.id !== id);
    setActLog(updated);
    onUpdate({ ...day, actLog: updated });
  }

  const bl = c.borderLight;

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalInner, maxHeight: "80vh", overflowY: "auto", paddingBottom: 28 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'Manrope',sans-serif", color: c.text }}>{day.date}</div>
            <div style={{ fontSize: 11, color: c.textLight, marginTop: 2 }}>{day.activity}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: c.textLight, fontSize: 20, padding: 0, lineHeight: 1 }}>×</button>
        </div>

        {/* Totals */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div style={S.cardMuted}>
            <div style={S.label}>Calories</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.accent, marginTop: 3, fontFamily: "'Manrope',sans-serif" }}>{totalKcal}</div>
          </div>
          <div style={S.cardMuted}>
            <div style={S.label}>Protein</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.protein, marginTop: 3, fontFamily: "'Manrope',sans-serif" }}>{totalProt}g</div>
          </div>
        </div>

        {/* Meals */}
        <div style={{ ...S.label, marginBottom: 8 }}>
          Meals <span style={{ color: c.textLight, fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 4 }}>· {meals.length}</span>
        </div>
        <div style={S.card}>
          {meals.length === 0 && <div style={{ fontSize: 12, color: c.textLight, padding: "4px 0" }}>No meals recorded</div>}
          {meals.map((m, i) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: i < meals.length - 1 ? `1px solid ${bl}` : "none" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: c.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                {m.note && <div style={{ fontSize: 11, color: c.textLight, marginTop: 1 }}>{m.note}</div>}
              </div>
              <div style={{ width: 72, textAlign: "right", marginRight: 8, flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: c.accent, fontWeight: 600 }}>{m.kcal} kcal</div>
                {m.protein > 0 && <div style={{ fontSize: 11, color: c.protein }}>{m.protein}g</div>}
              </div>
              <button onClick={() => removeMeal(m.id)} style={{ background: "none", border: "none", color: "#d8dcea", cursor: "pointer", fontSize: 15, padding: "0 2px", lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>
          ))}

          {/* Add forgotten meal */}
          {!addingMeal ? (
            <button onClick={() => setAddingMeal(true)} style={{ marginTop: meals.length > 0 ? 10 : 2, background: "none", border: "none", cursor: "pointer", color: c.textLight, fontSize: 12, fontFamily: "'DM Sans',sans-serif", padding: 0 }}>
              + Add forgotten meal
            </button>
          ) : (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${bl}` }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input style={{ ...S.input, fontSize: 13 }} placeholder="Meal name" value={newName} onChange={e => setNewName(e.target.value)} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...S.inputSm, flex: 1 }} type="number" placeholder="Calories" value={newKcal} onChange={e => setNewKcal(e.target.value)} />
                  <input style={{ ...S.inputSm, flex: 1 }} type="number" placeholder="Protein g" value={newProt} onChange={e => setNewProt(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ ...S.btn("secondary"), flex: 1 }} onClick={() => { setAddingMeal(false); setNewName(""); setNewKcal(""); setNewProt(""); }}>Cancel</button>
                  <button style={{ ...S.btn("primary", !newName.trim() || !newKcal), flex: 2 }} onClick={addMeal} disabled={!newName.trim() || !newKcal}>Add</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity log */}
        {actLog.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ ...S.label, marginBottom: 8 }}>Activity</div>
            <div style={S.card}>
              {actLog.map((e, i) => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", padding: "7px 0", borderBottom: i < actLog.length - 1 ? `1px solid ${bl}` : "none" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: c.text }}>{e.name}</div>
                    <div style={{ fontSize: 11, color: c.accent, marginTop: 1 }}>+{e.kcal} kcal</div>
                  </div>
                  <button onClick={() => removeActivity(e.id)} style={{ background: "none", border: "none", color: "#d8dcea", cursor: "pointer", fontSize: 15, padding: "0 2px", lineHeight: 1 }}>×</button>
                </div>
              ))}
              {actBurn > 0 && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${bl}`, fontSize: 11, color: c.textMuted }}>
                  Total: <span style={{ color: c.accent, fontWeight: 600 }}>+{actBurn} kcal</span>
                </div>
              )}
            </div>
          </div>
        )}

        <button style={{ ...S.btn("secondary"), width: "100%", marginBottom: 8 }} onClick={() => onRestore({ ...day, meals, actLog })}>
          Restore to today
        </button>
        <button style={{ ...S.btn("primary"), width: "100%" }} onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

// ─── SAVED FOOD EDIT SHEET ────────────────────────────────────────────────────

function SavedFoodEditSheet({ food, isCustom, onSave, onDelete, onClose, c, S }) {
  const [name,    setName]    = useState(food.name);
  const [unit,    setUnit]    = useState(food.unit || "");
  const [kcal,    setKcal]    = useState(String(food.kcal));
  const [protein, setProtein] = useState(String(food.protein));

  function handleSave() {
    const updated = { ...food, name: name.trim(), unit: unit.trim(), kcal: Number(kcal), protein: Number(protein) };
    if (!updated.name || !updated.kcal) return;
    onSave(updated);
  }

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={{ ...S.modalInner, paddingBottom: 28 }} onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Manrope',sans-serif", color: c.text }}>Edit saved food</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: c.textLight, fontSize: 20, padding: 0, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ ...S.label, marginBottom: 6 }}>Name</div>
          <input style={S.input} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ ...S.label, marginBottom: 6 }}>Base portion</div>
          <input style={S.input} placeholder="e.g. 1 egg, 150g portion" value={unit} onChange={e => setUnit(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <div style={{ ...S.label, marginBottom: 6 }}>Calories</div>
            <input style={S.inputSm} type="number" value={kcal} onChange={e => setKcal(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...S.label, marginBottom: 6 }}>Protein (g)</div>
            <input style={S.inputSm} type="number" value={protein} onChange={e => setProtein(e.target.value)} />
          </div>
        </div>
        <button style={{ ...S.btn("primary", !name.trim() || !kcal), width: "100%", marginBottom: 10 }} onClick={handleSave} disabled={!name.trim() || !kcal}>
          Save changes
        </button>
        <button style={{ ...S.btn("secondary"), width: "100%", color: "#a06060" }} onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
