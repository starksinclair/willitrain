# Cursor AI Prompt — Build **WillItRain** (React Native + Tailwind)

## Product Summary
Create **WillItRain**, a student‑friendly mobile app that predicts **likelihood** of adverse weather (very hot, very cold, very windy, very wet, or very uncomfortable) **months ahead** using NASA Earth observation data. Unlike traditional apps limited to 1–2 week forecasts, WillItRain uses long‑term historical NASA datasets to estimate probabilities far in advance.

**Marketing tagline (show on onboarding & Home):**
> *“Traditional apps forecast 1–2 weeks. **We predict months ahead** with NASA‑powered data.”*

## Tech Stack
- **React Native** (Expo preferred)
- **TypeScript**
- **Tailwind via NativeWind** for styling
- **react-navigation** (stack + bottom tabs)
- **react-native-maps** for interactive map + pin + A→B routes (mocked initially)
- **Victory Native** or **react-native-svg** for charts (histogram/bell curve/time series)
- Local **mock services** for data until real API is connected

## App Flow (Screens & Tabs)
### Tabs
1. **Home** (Dashboard)
2. **Map** (Pin drop & A→B Trip Planner)
3. **Activities** (Check feasibility + suggestions & gear links)
4. **Saved** (Saved locations/routes/activities)
5. **About** (NASA data explainer + downloads)

### 1) Home / Dashboard
**Purpose:** Quick, personalized probability view for a chosen location + date.

**UI Elements:**
- Dynamic **background** (color + graphic) based on **temperature bucket**:
  - Hot: warm gradient + sun icon
  - Cold: icy gradient + snowflake
  - Wet: dark/cloudy gradient + animated rain overlay (optional)
  - Windy: pale gradient + moving cloud glyphs
  - Uncomfortable (heat/humidity): sticky gradient + discomfort icon
- Location input (search field) + date picker (day of year)
- Probability cards (e.g., **Rain 72%**, **Extreme Heat 25%**, **Wind >20 mph 15%**)
- Quick chart toggle: histogram/bell curve vs. time‑series (mock with sample data)
- CTA: "Open in Map" and "Check an Activity"
- Footer banner with marketing tagline (see above)

### 2) Map
**Purpose:** Explore by map; **drop a pin** or **plan A→B route** to see probabilities along the way.

**UI Elements:**
- Map with current location button
- **Pin mode**: tap/long‑press to place pin → bottom sheet with probabilities for selected date; button: **Save**
- **Trip mode (A→B)**: inputs with autocomplete (mock), route polyline, segments classified (Dry / Rain / Snow risk)
- Date selector; variable toggles (Temp / Precip / Wind / AQI)
- Legend + export (CSV/JSON) buttons

### 3) Activities
**Purpose:** User enters an activity; app returns **Recommended / Not Recommended** with rationale and **alternatives**.

**UI Elements:**
- Activity input (chips: Hiking, Fishing, Camping, Skiing, Beach Day, Outdoor Run, Picnic)
- Location + date
- Result card with status, reasoning (e.g., “High chance of rain; trails muddy”), and **Suggestions**
- **Gear Links** section (mock URLs): e.g., rain jacket, hiking boots, sunscreen, snow chains
- "Show suitable dates this month" (uses mock data)

### 4) Saved
- Saved places, trips, and activity checks
- Swipe to delete, tap to re‑run query

### 5) About
- Concise explainer: Why NASA data? How probability ≠ forecast
- Link out to data sources (mock)
- Version, credits

## Data Model (Sample / Mock)
```ts
// src/types.ts
export type WeatherBucket = 'very_hot' | 'very_cold' | 'very_windy' | 'very_wet' | 'very_uncomfortable';

export interface ProbabilityResult {
  location: { name: string; lat: number; lon: number };
  dateISO: string; // e.g., 2025-07-20
  probs: {
    very_hot: number;    // 0..1
    very_cold: number;   // 0..1
    very_windy: number;  // 0..1
    very_wet: number;    // 0..1
    very_uncomfortable: number; // 0..1 (heat + humidity)
  };
  summary: {
    tMax90: number;      // P(T > 90°F)
    rainHeavy: number;   // P(rain > threshold)
    wind20: number;      // P(wind > 20 mph)
  };
}

export interface RouteRiskSegment {
  from: { lat: number; lon: number };
  to: { lat: number; lon: number };
  risk: 'snow' | 'rain' | 'clear';
  prob: number; // 0..1
}
```

### Example Mock Payloads
```ts
export const MOCK_RESULT_NYC_JUL20: ProbabilityResult = {
  location: { name: 'New York City, NY', lat: 40.7128, lon: -74.006 },
  dateISO: '2025-07-20',
  probs: { very_hot: 0.25, very_cold: 0.01, very_windy: 0.15, very_wet: 0.72, very_uncomfortable: 0.58 },
  summary: { tMax90: 0.25, rainHeavy: 0.72, wind20: 0.15 }
};

export const MOCK_ROUTE: RouteRiskSegment[] = [
  { from: { lat: 39.7684, lon: -86.1581 }, to: { lat: 41.8781, lon: -87.6298 }, risk: 'rain', prob: 0.6 },
  { from: { lat: 41.8781, lon: -87.6298 }, to: { lat: 43.0389, lon: -87.9065 }, risk: 'snow', prob: 0.35 },
  { from: { lat: 43.0389, lon: -87.9065 }, to: { lat: 44.9778, lon: -93.2650 }, risk: 'clear', prob: 0.2 }
];
```

## Services (Mock Now, Real Later)
```ts
// src/services/probabilityService.ts
import { ProbabilityResult, RouteRiskSegment } from '../types';
import { MOCK_RESULT_NYC_JUL20, MOCK_ROUTE } from '../mocks';

export async function getProbabilityForPoint(lat: number, lon: number, dateISO: string): Promise<ProbabilityResult> {
  // TODO: replace with NASA POWER / Earthdata integration
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_RESULT_NYC_JUL20), 400));
}

export async function getRouteRisk(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
  dateISO: string
): Promise<RouteRiskSegment[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_ROUTE), 400));
}
```

## Dynamic Background Logic
```ts
// src/utils/background.ts
export function backgroundFor(probs: { very_hot: number; very_cold: number; very_wet: number; very_windy: number; very_uncomfortable: number }) {
  // Pick dominant bucket, then map to theme
  const entries = Object.entries(probs).sort((a, b) => b[1] - a[1]);
  const [bucket] = entries[0];
  switch (bucket) {
    case 'very_hot': return { gradient: ['#FF8A00', '#FF3D00'], icon: 'sunny' };
    case 'very_cold': return { gradient: ['#A1C4FD', '#C2E9FB'], icon: 'snowflake' };
    case 'very_wet': return { gradient: ['#4e54c8', '#8f94fb'], icon: 'rain' };
    case 'very_windy': return { gradient: ['#B8C6DB', '#F5F7FA'], icon: 'wind' };
    case 'very_uncomfortable': return { gradient: ['#F7971E', '#FFD200'], icon: 'heat' };
    default: return { gradient: ['#ECE9E6', '#FFFFFF'], icon: 'cloud' };
  }
}
```

## Component Breakdown
- **`<ProbabilityCard />`** — shows title, % value, icon, short explanation
- **`<BackgroundGradient />`** — applies gradient per backgroundFor()
- **`<DateLocationPicker />`** — location search (mock) + date input
- **`<BellCurveChart />`** — histogram from sample data
- **`<MapViewPanel />`** — map with pin drop & bottom sheet
- **`<RoutePlanner />`** — A→B inputs + risk legend + segments
- **`<ActivityCheck />`** — form + result + suggestions + gear links
- **`<GearLinks />`** — list of external links (mock)
- **`<DownloadButtons />`** — CSV/JSON export (mock function)

## Navigation
- **Stack:** Onboarding → Tabs
- **Tabs:** Home, Map, Activities, Saved, About
- From Home → Map (pin focused) or Activities

## Tailwind Design Tokens (NativeWind)
- Hot: `from-[#FF8A00] to-[#FF3D00]`
- Cold: `from-[#A1C4FD] to-[#C2E9FB]`
- Wet: `from-[#4e54c8] to-[#8f94fb]`
- Windy: `from-[#B8C6DB] to-[#F5F7FA]`
- Uncomfortable: `from-[#F7971E] to-[#FFD200]`
- Cards: `rounded-2xl shadow-lg p-4`
- Typography: Large numeric % (`text-4xl font-extrabold`), labels (`text-xs uppercase tracking-widest`)

## Copy / Micro‑UX
- **Home headline:** “Plan smarter, months ahead.”
- **Sub:** “NASA‑powered probabilities for your perfect day.”
- **Buttons:** “Open Map”, “Check Activity”, “Save Spot”
- **Empty states:** “Drop a pin to get probabilities.”

## Activities Logic (Mock)
Rules of thumb (replace with data logic later):
- Hiking: not recommended if `very_wet > 0.6` or `very_hot > 0.7`.
- Fishing: good if `very_wet` between 0.2–0.6 and `very_windy < 0.5`.
- Skiing: good if `very_cold > 0.5` and route risk has ‘snow’ ≥ 0.3.

## Test IDs (for E2E demos)
- `testid-home-prob-rain`
- `testid-map-pin`
- `testid-route-plan`
- `testid-activity-result`

## Acceptance Criteria
- Home shows dynamic background based on mock probs
- Pin drop reveals probability sheet (mock service)
- A→B route shows 2–3 colored segments with risk labels
- Activity check returns status + 2 suggested alternatives + 3 gear links
- About screen displays marketing tagline + NASA explainer

## Nice‑to‑Have (if time)
- Toggle units (°F/°C, mph/m/s)
- Month‑heatmap for a location (twelve cells with dominant risk)
- Offline cache of last viewed results

## Implementation Notes for Cursor
- Generate **Expo** project scaffold with NativeWind preconfigured
- Create screens/components per breakdown above
- Use **mock services** and **sample payloads** included here
- Prefer functional components with hooks (`useEffect`, `useMemo`)
- Keep styles in Tailwind classes; avoid inline StyleSheet unless necessary
- Add icons from `@expo/vector-icons` (Ionicons) matching `backgroundFor().icon`
- Charts can use Victory Native with simple sample arrays

## Sample Gear Links (Mock)
- Rain jacket: https://example.com/rain-jacket
- Hiking boots: https://example.com/hiking-boots
- Sunscreen SPF 50: https://example.com/sunscreen
- Snow chains: https://example.com/snow-chains

---
**Deliverables for this prompt:**
1) Expo RN project (TS) with tabs & navigation
2) Implement Home, Map, Activities, Saved, About screens
3) Dynamic background + probability cards on Home using mock
4) Map pin + bottom sheet + mocked probability fetch
5) Route planner with 2–3 risk segments (color coded)
6) Activity checker with suggestions + gear links
7) About screen with marketing copy and NASA explainer
8) CSV/JSON export stubs

