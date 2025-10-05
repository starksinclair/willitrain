import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import weatherService from "../services/weatherService";
import { DataProcessor } from "../utils/dataProcessor";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

// Example component showing different ways to fetch JSON data
export default function WeatherDataExample() {
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  // Method 1: Direct import (for static data)
  const loadStaticData = () => {
    try {
      const staticData = require("../data.json");
      setWeatherData([staticData]);
      setSelectedMethod("Static Import");
      Alert.alert("Success", "Static data loaded successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to load static data");
    }
  };

  // Method 2: Using the weather service
  const loadWeatherServiceData = async () => {
    setIsLoading(true);
    setSelectedMethod("Weather Service");
    try {
      const data = await weatherService.fetchLocalWeatherData();
      setWeatherData(data.slice(0, 5)); // Show first 5 records
      Alert.alert("Success", `Loaded ${data.length} weather records!`);
    } catch (error) {
      Alert.alert("Error", "Failed to load weather service data");
    } finally {
      setIsLoading(false);
    }
  };

  // Method 3: Fetch from URL (simulated)
  const loadRemoteData = async () => {
    setIsLoading(true);
    setSelectedMethod("Remote Fetch");
    try {
      // Simulate fetching from a remote URL
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts/1"
      );
      const data = await response.json();
      setWeatherData([data]);
      Alert.alert("Success", "Remote data loaded successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to load remote data");
    } finally {
      setIsLoading(false);
    }
  };

  // Method 4: Process NASA data
  const processNASAData = () => {
    try {
      const rawData = require("../data.json");
      const processedData = DataProcessor.processNASAData(rawData);
      setWeatherData(processedData.slice(0, 5)); // Show first 5 records
      setSelectedMethod("NASA Data Processing");
      Alert.alert(
        "Success",
        `Processed ${processedData.length} NASA weather records!`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to process NASA data");
    }
  };

  // Method 5: Load CSV data
  const loadCSVData = async () => {
    setIsLoading(true);
    setSelectedMethod("CSV Data");
    try {
      const csvData = await weatherService.fetchCSVData();
      setWeatherData(csvData.slice(0, 5)); // Show first 5 records
      Alert.alert("Success", `Loaded ${csvData.length} CSV records!`);
    } catch (error) {
      Alert.alert("Error", "Failed to load CSV data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        JSON Data Fetching Examples
      </ThemedText>

      <View style={styles.methodsContainer}>
        <TouchableOpacity style={styles.methodButton} onPress={loadStaticData}>
          <Ionicons name="document" size={20} color="#007AFF" />
          <ThemedText style={styles.methodText}>Static Import</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.methodButton}
          onPress={loadWeatherServiceData}
        >
          <Ionicons name="cloud" size={20} color="#007AFF" />
          <ThemedText style={styles.methodText}>Weather Service</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.methodButton} onPress={loadRemoteData}>
          <Ionicons name="globe" size={20} color="#007AFF" />
          <ThemedText style={styles.methodText}>Remote Fetch</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.methodButton} onPress={processNASAData}>
          <Ionicons name="rocket" size={20} color="#007AFF" />
          <ThemedText style={styles.methodText}>NASA Data</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.methodButton} onPress={loadCSVData}>
          <Ionicons name="list" size={20} color="#007AFF" />
          <ThemedText style={styles.methodText}>CSV Data</ThemedText>
        </TouchableOpacity>
      </View>

      {selectedMethod && (
        <View style={styles.resultsContainer}>
          <ThemedText style={styles.resultsTitle}>
            Method: {selectedMethod}
          </ThemedText>
          <ThemedText style={styles.resultsSubtitle}>
            Records loaded: {weatherData.length}
          </ThemedText>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      )}

      {weatherData.length > 0 && (
        <View style={styles.dataContainer}>
          <ThemedText style={styles.dataTitle}>Sample Data:</ThemedText>
          {weatherData.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.dataItem}>
              <ThemedText style={styles.dataText}>
                {JSON.stringify(item, null, 2).substring(0, 200)}...
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  methodsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  methodButton: {
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 120,
  },
  methodText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  resultsContainer: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultsTitle: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  resultsSubtitle: {
    color: "#ccc",
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#4A90E2",
    fontSize: 16,
  },
  dataContainer: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 8,
  },
  dataTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  dataItem: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  dataText: {
    color: "#ccc",
    fontSize: 12,
    fontFamily: "monospace",
  },
});

import * as Location from "expo-location";
import { AppleMaps, GoogleMaps } from "expo-maps";
import React, { useMemo } from "react";
import { Platform, ScrollView } from "react-native";
import MapPicker from "../../components/map-modal";
import { buildWeatherDataFromHistory } from "../../constants/utils";
import type {
  WeatherData as NasaWeather,
  TimeSeriesData,
  WeatherCondition,
} from "../../type/types";

type Coordinate = { latitude: number; longitude: number; label?: string };
type WaypointForecast = {
  coord: Coordinate;
  dateKeys: string[];
  temperatureData: number[];
  precipitationData: number[];
  windSpeedData: number[];
  snowDepthData: number[];
  conditions: WeatherCondition[];
};

export default function TripScreen() {
  const [start, setStart] = useState<Coordinate | null>(null);
  const [end, setEnd] = useState<Coordinate | null>(null);
  const [picking, setPicking] = useState<"start" | "end" | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [routeWeather, setRouteWeather] = useState<WaypointForecast[]>([]);
  const [loading, setLoading] = useState(false);

  const canPlan = !!start && !!end;

  const waypoints = useMemo(() => {
    if (!start || !end) return [] as Coordinate[];
    const steps = 6; // includes endpoints
    const points: Coordinate[] = [];
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const lat = start.latitude + (end.latitude - start.latitude) * t;
      const lon = start.longitude + (end.longitude - start.longitude) * t;
      points.push({ latitude: lat, longitude: lon });
    }
    return points;
  }, [start, end]);

  const openPicker = async (which: "start" | "end") => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission",
          "Location permission is needed to pick on map."
        );
      }
    } catch {}
    setPicking(which);
    setIsMapVisible(true);
  };

  const handleConfirmPick = (c: Coordinate) => {
    if (picking === "start") setStart(c);
    if (picking === "end") setEnd(c);
  };

  const planTrip = async () => {
    if (!canPlan) return;
    try {
      setLoading(true);
      const results: WaypointForecast[] = [];
      for (const p of waypoints) {
        const nasa = await fetchNasaWeather(
          String(p.latitude),
          String(p.longitude)
        );
        const today = extractTodaySeries(nasa);
        const conditions = buildWeatherDataFromHistory(
          today.temperatureData,
          today.precipitationData,
          today.windSpeedData,
          today.snowDepthData
        );
        results.push({ coord: p, ...today, conditions });
      }
      setRouteWeather(results);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to fetch trip weather");
    } finally {
      setLoading(false);
    }
  };

  // --- NASA API fetch aligned with api/api.ts ---
  async function fetchNasaWeather(
    latitude: string,
    longitude: string
  ): Promise<NasaWeather> {
    const start = "20200101";
    const end = "20250101";
    const parameters = "T2M,WS2M,PRECTOTCORR,SNODP";
    const apiUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${parameters}&start=${start}&end=${end}&latitude=${latitude}&longitude=${longitude}&format=JSON&community=RE&units=imperial`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`NASA error ${res.status}`);
    return (await res.json()) as NasaWeather;
  }

  // Extract today's series similarly to forecast page
  const extractTodaySeries = (data: NasaWeather) => {
    const now = new Date();
    const currentMonthDay = now
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "")
      .substring(4, 8);
    const snowDepthData = data?.properties.parameter.SNODP as TimeSeriesData;
    const temperatureData = data?.properties.parameter.T2M as TimeSeriesData;
    const precipitationData = data?.properties.parameter
      .PRECTOTCORR as TimeSeriesData;
    const windSpeedData = data?.properties.parameter.WS2M as TimeSeriesData;

    const filterValues = (series: TimeSeriesData) =>
      Object.keys(series || {})
        .filter((k) => k.substring(4, 8) === currentMonthDay)
        .map((k) => series[k as keyof TimeSeriesData] as number);
    const filterDates = (series: TimeSeriesData) =>
      Object.keys(series || {}).filter(
        (k) => k.substring(4, 8) === currentMonthDay
      );

    return {
      dateKeys: filterDates(temperatureData),
      temperatureData: filterValues(temperatureData),
      precipitationData: filterValues(precipitationData),
      windSpeedData: filterValues(windSpeedData),
      snowDepthData: filterValues(snowDepthData),
    };
  };

  const renderMap = () => {
    const markers: any[] = [];
    if (start)
      markers.push({
        coordinates: { latitude: start.latitude, longitude: start.longitude },
        title: "Start",
      });
    if (end)
      markers.push({
        coordinates: { latitude: end.latitude, longitude: end.longitude },
        title: "End",
      });

    const coords = waypoints.map((p) => ({
      latitude: p.latitude,
      longitude: p.longitude,
    }));

    const commonProps: any = {
      style: { height: 240, borderRadius: 12, overflow: "hidden" },
      initialCamera: {
        coordinates: start ?? { latitude: 40.0, longitude: -74.0 },
        zoom: 6,
      },
      markers,
    };

    if (Platform.OS === "ios") {
      return (
        <AppleMaps.View {...commonProps}>
          {coords.length >= 2 && (
            <AppleMaps.Polyline
              coordinates={coords}
              strokeColor="#4A90E2"
              strokeWidth={4}
            />
          )}
          {routeWeather.map((rw, idx) => {
            const sorted = [...rw.conditions].sort(
              (a, b) => (b.probability || 0) - (a.probability || 0)
            );
            const primary = sorted[0];
            return (
              <AppleMaps.Marker
                key={`ios-wp-${idx}`}
                coordinate={{
                  latitude: rw.coord.latitude,
                  longitude: rw.coord.longitude,
                }}
                title={`WP ${idx + 1}`}
              >
                <View
                  style={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    padding: 4,
                    borderRadius: 8,
                  }}
                >
                  <Ionicons
                    name={(primary?.icon as any) || "partly-sunny"}
                    size={16}
                    color={primary?.color || "#fff"}
                  />
                </View>
              </AppleMaps.Marker>
            );
          })}
        </AppleMaps.View>
      );
    }
    if (Platform.OS === "android") {
      return (
        <GoogleMaps.View {...commonProps}>
          {coords.length >= 2 && (
            <GoogleMaps.Polyline
              coordinates={coords}
              strokeColor="#4A90E2"
              strokeWidth={4}
            />
          )}
          {routeWeather.map((rw, idx) => {
            const sorted = [...rw.conditions].sort(
              (a, b) => (b.probability || 0) - (a.probability || 0)
            );
            const primary = sorted[0];
            return (
              <GoogleMaps.Marker
                key={`and-wp-${idx}`}
                coordinate={{
                  latitude: rw.coord.latitude,
                  longitude: rw.coord.longitude,
                }}
                title={`WP ${idx + 1}`}
              >
                <View
                  style={{
                    backgroundColor: "rgba(0,0,0,0.6)",
                    padding: 4,
                    borderRadius: 8,
                  }}
                >
                  <Ionicons
                    name={(primary?.icon as any) || "partly-sunny"}
                    size={16}
                    color={primary?.color || "#fff"}
                  />
                </View>
              </GoogleMaps.Marker>
            );
          })}
        </GoogleMaps.View>
      );
    }
    return <View style={{ height: 240 }} />;
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Trip Planner
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderMap()}
        <View style={styles.pickRow}>
          <TouchableOpacity
            style={styles.pickButton}
            onPress={() => openPicker("start")}
          >
            <Ionicons name="flag" size={18} color="#4A90E2" />
            <ThemedText style={styles.pickText}>
              {start?.label || "Pick Start (A)"}
            </ThemedText>
          </TouchableOpacity>
          <Ionicons name="arrow-forward" size={18} color="#666" />
          <TouchableOpacity
            style={styles.pickButton}
            onPress={() => openPicker("end")}
          >
            <Ionicons name="flag-outline" size={18} color="#FF6D00" />
            <ThemedText style={styles.pickText}>
              {end?.label || "Pick End (B)"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          disabled={!canPlan || loading}
          onPress={planTrip}
          style={[
            styles.planButton,
            { opacity: !canPlan || loading ? 0.6 : 1 },
          ]}
        >
          <Ionicons name="navigate" size={18} color="#fff" />
          <ThemedText style={styles.planButtonText}>
            {loading ? "Planning..." : "Plan Route & Fetch Weather"}
          </ThemedText>
        </TouchableOpacity>

        {routeWeather.length > 0 && (
          <View style={styles.routeList}>
            {routeWeather.map((rw, idx) => {
              const sorted = [...rw.conditions].sort(
                (a, b) => (b.probability || 0) - (a.probability || 0)
              );
              const primary = sorted[0];
              const rain = rw.conditions.find((c) => c.id === "rain");
              const snow = rw.conditions.find((c) => c.id === "snow");
              const wind = rw.conditions.find((c) => c.id === "wind");
              const avgTemp = Math.round((rain?.temperature as number) || 0);
              return (
                <View
                  key={`${rw.coord.latitude}-${rw.coord.longitude}-${idx}`}
                  style={styles.routeItem}
                >
                  <View style={styles.routeItemHeader}>
                    <ThemedText style={styles.routeItemTitle}>
                      Waypoint {idx + 1}
                    </ThemedText>
                    <Ionicons
                      name={(primary?.icon as any) || "partly-sunny"}
                      size={18}
                      color={primary?.color || "#4A90E2"}
                    />
                  </View>
                  <ThemedText style={styles.routeItemMeta}>
                    {rw.coord.latitude.toFixed(3)},{" "}
                    {rw.coord.longitude.toFixed(3)}
                  </ThemedText>
                  <View style={styles.metricsRow}>
                    <ThemedText style={styles.metric}>
                      Avg Temp: {avgTemp}°F
                    </ThemedText>
                    <ThemedText style={styles.metric}>
                      Rain: {rain?.probability ?? 0}%
                    </ThemedText>
                    <ThemedText style={styles.metric}>
                      Snow: {snow?.probability ?? 0}%
                    </ThemedText>
                    <ThemedText style={styles.metric}>
                      Windy: {wind?.probability ?? 0}%
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <MapPicker
        visible={isMapVisible}
        onClose={() => setIsMapVisible(false)}
        onConfirm={handleConfirmPick}
        initialCoords={start ?? undefined}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  content: { flex: 1, paddingHorizontal: 20 },
  pickRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  pickButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
  },
  pickText: { color: "#fff" },
  planButton: {
    marginTop: 8,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  planButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  routeList: { marginTop: 20, gap: 12 },
  routeItem: { backgroundColor: "#1a1a1a", borderRadius: 12, padding: 14 },
  routeItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  routeItemTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  routeItemMeta: { color: "#999", fontSize: 12, marginBottom: 8 },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metric: { color: "#ccc", fontSize: 12 },
});
