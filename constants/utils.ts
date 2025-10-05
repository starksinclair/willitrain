import { WeatherCondition } from "../type/types";

// --- Async Storage helpers for Saved Queries ---
import AsyncStorage from "@react-native-async-storage/async-storage";

export const toPercent = (count: number, total: number) => {
  if (total === 0) {
    return 0;
  }
  const rawPercentage = (100 * count) / total;
  return Math.round(Math.min(100, Math.max(0, rawPercentage)));
};
export const getAverage = (data: number[]) => {
  return data.reduce((a, b) => a + b, 0) / data.length;
};

export const buildWeatherDataFromHistory = (
  tempsF: number[],
  precIn: number[],
  windMph: number[],
  snowDepthIn: number[]
) => {
  const N = Math.min(
    tempsF.length,
    precIn.length,
    windMph.length,
    snowDepthIn.length
  );
  const snowDepthAverage = getAverage(snowDepthIn);
  const temperatureAverage = getAverage(tempsF);
  const precipitationAverage = getAverage(precIn);
  const windSpeedAverage = getAverage(windMph);
  const pctRain = toPercent(precipitationAverage, N);
  const pctSnow = toPercent(snowDepthAverage, N);
  //   const pctSunny = toPercent(temperatureAverage, N);
  const pctWindy = toPercent(windSpeedAverage, N);

  return [
    // {
    //   id: "sunny",
    //   label: "Sunny",
    //   probability: pctSunny,
    //   icon: "partly-sunny",
    //   color: "#FF6B35",

    // },
    {
      id: "rain",
      label: "Rain",
      probability: pctRain,
      icon: "rainy",
      color: "#4A90E2",
      temperature: temperatureAverage,
      highTemp: Math.max(...tempsF),
      lowTemp: Math.min(...tempsF),
    },
    {
      id: "snow",
      label: "Snow",
      probability: pctSnow,
      icon: "snow",
      color: "#87CEEB",
    },
    {
      id: "wind",
      label: "Wind",
      probability: pctWindy,
      icon: "leaf",
      color: "#32CD32",
    },
  ] as WeatherCondition[];
};

// TODO: fix this
export const getTemperatureColor = (temp: number) => {
  if (!temp) return { color: "#666", label: "Unknown" };
  if (temp >= 75) return { color: "#FF6B35", label: "Sunny", icon: "sunny" }; // Hot - Orange
  if (temp >= 60)
    return { color: "#FFD23F", label: "Warm", icon: "partly-sunny" }; // Warm - Yellow
  if (temp >= 40) return { color: "#4ECDC4", label: "Cool", icon: "cool" }; // Cool - Teal
  return { color: "#4A90E2", label: "Cold", icon: "snow" }; // Cold - Blue
};

export const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case "rain":
      return "rainy";
    case "snow":
      return "snow";
    case "hail":
      return "snow";
    case "wind":
      return "leaf";
    case "thunderstorm":
      return "thunderstorm";
    default:
      return "partly-sunny";
  }
};

export type SavedQuery = {
  id: string;
  location: string;
  date: string;
  time: string;
  lat: string;
  lon: string;
  conditions: string[];
  temperature?: number;
  weatherIcon?: string;
};

const SAVED_QUERIES_KEY = "@willitrain:savedQueries";

export async function getSavedQueries(): Promise<SavedQuery[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_QUERIES_KEY);
    return raw ? (JSON.parse(raw) as SavedQuery[]) : [];
  } catch {
    return [];
  }
}

export async function addSavedQuery(q: SavedQuery): Promise<void> {
  const list = await getSavedQueries();
  list.unshift(q);
  await AsyncStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify(list));
}

export async function deleteSavedQuery(id: string): Promise<void> {
  const list = await getSavedQueries();
  await AsyncStorage.setItem(
    SAVED_QUERIES_KEY,
    JSON.stringify(list.filter((q) => q.id !== id))
  );
}
