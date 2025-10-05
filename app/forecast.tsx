import { useGetWeatherData } from "@/api/api";
import {
  addSavedQuery,
  buildWeatherDataFromHistory,
  getAverage,
  getTemperatureColor,
  getWeatherIcon,
} from "@/constants/utils";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../components/themed-text";
import { ThemedView } from "../components/themed-view";
import { TimeSeriesData, WeatherCondition, WeatherData } from "../type/types";

const { width } = Dimensions.get("window");

// --- helpers: percent & rules ---

export default function ForecastScreen() {
  const params = useLocalSearchParams<{
    location: string;
    date: string;
    lat: string;
    lon: string;
  }>();
  const {
    data,
    isLoading: isLoadingWeatherData,
    error,
  } = useGetWeatherData(
    "20200101",
    "20250101",
    params.lat,
    params.lon,
    "T2M,WS2M,PRECTOTCORR,SNODP"
  );
  const [weatherData, setWeatherData] = useState<WeatherCondition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const requestedDate = new Date(params.date)
    .toISOString()
    .split("T")[0]
    .replace(/-/g, "");
  const getValuesForToday = (data: WeatherData) => {
    if (!data)
      return {
        dates: [],
        snowDepthData: [],
        temperatureData: [],
        precipitationData: [],
        windSpeedData: [],
      };
    const snowDepthData = data?.properties.parameter.SNODP as TimeSeriesData;
    const temperatureData = data?.properties.parameter.T2M as TimeSeriesData;
    const precipitationData = data?.properties.parameter
      .PRECTOTCORR as TimeSeriesData;
    const windSpeedData = data?.properties.parameter.WS2M as TimeSeriesData;
    const currentMonthDay = requestedDate.substring(4, 8); // Extracts "MMDD" from "YYYYMMDD"

    const filteredSnowDepthData = (data: TimeSeriesData) => {
      return Object?.keys(data || {})
        .filter((key) => key.substring(4, 8) === currentMonthDay)
        .map((key) => data[key as keyof TimeSeriesData]);
    };
    const filteredDates = (data: TimeSeriesData) => {
      return Object?.keys(data || {})
        .filter((key) => key.substring(4, 8) === currentMonthDay)
        .map((key) => key);
    };

    return {
      dates: filteredDates(temperatureData),
      snowDepthData: filteredSnowDepthData(snowDepthData),
      temperatureData: filteredSnowDepthData(temperatureData),
      precipitationData: filteredSnowDepthData(precipitationData),
      windSpeedData: filteredSnowDepthData(windSpeedData),
    };
  };
  const {
    dates,
    snowDepthData,
    temperatureData,
    precipitationData,
    windSpeedData,
  } = getValuesForToday(data as WeatherData);

  useEffect(() => {
    if (!data || temperatureData.length === 0) {
      return; // Skip computation if data isn't ready yet
    }

    const timer = setTimeout(() => {
      const computed = buildWeatherDataFromHistory(
        temperatureData, // °F
        precipitationData, // %
        windSpeedData, // m/s (WS2M)
        snowDepthData // inches (SNODP)
      );
      setWeatherData(computed);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [data, temperatureData, precipitationData, windSpeedData, snowDepthData]);

  // ---- activity + clothing helpers ----
  type Recommendation = "ideal" | "okay" | "avoid";

  type Activity = {
    id: string;
    name: string;
    description: string;
    image: string;
    recommendation: Recommendation;
  };

  type ClothingItem = {
    id: string;
    name: string;
    description: string;
    icon: string;
    essential?: boolean;
  };

  const getRecommendationColor = (r: Recommendation) => {
    if (r === "ideal") return "#4CAF50"; // green
    if (r === "okay") return "#FFC107"; // amber
    return "#FF5252"; // red
  };

  const getRecommendationText = (r: Recommendation) => {
    if (r === "ideal") return "Great day for it";
    if (r === "okay") return "Possible with precautions";
    return "Better to skip";
  };

  const buildActivityRecommendation = (
    base: Pick<Activity, "id" | "name" | "description" | "image">
  ): Activity => {
    const sunny = weatherData.find((c: WeatherCondition) => c.id === "sunny");
    const rain = weatherData.find((c: WeatherCondition) => c.id === "rain");
    const snow = weatherData.find((c: WeatherCondition) => c.id === "snow");
    const wind = weatherData.find((c: WeatherCondition) => c.id === "wind");

    const temp = Math.round(sunny?.temperature ?? 60);
    const rainPct = rain?.probability ?? 0;
    const snowPct = snow?.probability ?? 0;
    const windPct = wind?.probability ?? 0;

    let recommendation: Recommendation = "okay";

    const pleasantTemp = temp >= 55 && temp <= 80;
    const tolerableTemp = temp >= 40 && temp <= 90;

    // Base rule by conditions
    if (pleasantTemp && rainPct < 30 && snowPct < 10 && windPct < 30) {
      recommendation = "ideal";
    } else if (tolerableTemp && rainPct < 60 && snowPct < 30) {
      recommendation = "okay";
    } else {
      recommendation = "avoid";
    }

    // Activity-specific adjustments
    if (base.id === "climbing") {
      if (windPct >= 25 || rainPct >= 40) recommendation = "avoid";
    }
    if (base.id === "gardening") {
      if (rainPct >= 10 && rainPct <= 40 && snowPct < 10 && tolerableTemp) {
        recommendation = recommendation === "avoid" ? "okay" : recommendation;
      }
    }
    if (base.id === "fishing") {
      if (rainPct >= 10 && rainPct <= 50 && snowPct < 20) {
        if (recommendation !== "avoid") recommendation = "ideal";
      }
    }

    return { ...base, recommendation };
  };

  const activities: Activity[] = [
    {
      id: "hiking",
      name: "Hiking",
      description: "Explore scenic trails",
      image: "hiking",
    },
    {
      id: "jogging",
      name: "Jogging",
      description: "Go for a run",
      image: "jogging",
    },
    {
      id: "gardening",
      name: "Gardening",
      description: "Tend to plants",
      image: "gardening",
    },
    {
      id: "climbing",
      name: "Climbing",
      description: "Hit the crag or gym",
      image: "climbing",
    },
    {
      id: "fishing",
      name: "Fishing",
      description: "Cast a line",
      image: "fishing",
    },
    {
      id: "cycling",
      name: "Cycling",
      description: "Ride your favorite route",
      image: "cycling",
    },
    {
      id: "picnic",
      name: "Picnic",
      description: "Relax outdoors",
      image: "picnic",
    },
    {
      id: "photography",
      name: "Photography",
      description: "Capture the day",
      image: "photography",
    },
  ].map(buildActivityRecommendation);

  const buildClothingRecommendations = (): ClothingItem[] => {
    const sunny = weatherData.find((c: WeatherCondition) => c.id === "sunny");
    const rain = weatherData.find((c: WeatherCondition) => c.id === "rain");
    const snow = weatherData.find((c: WeatherCondition) => c.id === "snow");

    const temp = Math.round(sunny?.temperature ?? 60);
    const rainPct = rain?.probability ?? 0;
    const snowPct = snow?.probability ?? 0;

    const items: ClothingItem[] = [];

    // Temperature-based layers
    if (temp < 40) {
      items.push(
        {
          id: "base-thermal",
          name: "Thermal base layer",
          description: "Moisture-wicking top and bottoms",
          icon: "thermometer",
          essential: true,
        },
        {
          id: "insulated-jacket",
          name: "Insulated jacket",
          description: "Down or synthetic insulation",
          icon: "snow",
          essential: true,
        },
        {
          id: "beanie-gloves",
          name: "Beanie & gloves",
          description: "Keep extremities warm",
          icon: "snow",
        }
      );
    } else if (temp < 60) {
      items.push(
        {
          id: "midlayer",
          name: "Light jacket/hoodie",
          description: "Fleece or softshell",
          icon: "shirt",
          essential: true,
        },
        {
          id: "long-pants",
          name: "Long pants",
          description: "Comfortable, breathable fabric",
          icon: "walk",
        }
      );
    } else if (temp <= 75) {
      items.push(
        {
          id: "tee",
          name: "T-shirt",
          description: "Breathable top",
          icon: "shirt",
          essential: true,
        },
        {
          id: "option-layer",
          name: "Light long-sleeve (optional)",
          description: "For shade or breeze",
          icon: "shirt",
        }
      );
    } else {
      items.push(
        {
          id: "sun-top",
          name: "Breathable top",
          description: "Lightweight, sweat-wicking",
          icon: "sunny",
          essential: true,
        },
        {
          id: "shorts",
          name: "Shorts",
          description: "Stay cool and mobile",
          icon: "walk",
        },
        {
          id: "sun-protection",
          name: "Hat & sunscreen",
          description: "Protect from strong sun",
          icon: "sunny",
        }
      );
    }

    // Precipitation adjustments
    if (rainPct >= 40) {
      items.push(
        {
          id: "rain-jacket",
          name: "Rain jacket",
          description: "Waterproof (e.g., Gore-Tex)",
          icon: "rainy",
          essential: true,
        },
        {
          id: "waterproof-footwear",
          name: "Waterproof footwear",
          description: "Keep feet dry",
          icon: "umbrella",
        }
      );
    }

    if (snowPct >= 30) {
      items.push(
        {
          id: "heavy-coat",
          name: "Heavy coat",
          description: "Insulated & wind-resistant",
          icon: "snow",
          essential: true,
        },
        {
          id: "insulated-boots",
          name: "Insulated boots",
          description: "Traction for snow/ice",
          icon: "snow",
        }
      );
    }

    return items;
  };

  const clothing = buildClothingRecommendations();

  const buildCsvString = () => {
    const sunny = weatherData.find((c: WeatherCondition) => c.id === "sunny");
    const rain = weatherData.find((c: WeatherCondition) => c.id === "rain");
    const snow = weatherData.find((c: WeatherCondition) => c.id === "snow");
    const wind = weatherData.find((c: WeatherCondition) => c.id === "wind");

    const N = temperatureData.length;
    const avgTemp = N > 0 ? getAverage(temperatureData) : 0;
    const avgPrecip = N > 0 ? getAverage(precipitationData) : 0;
    const avgWind = N > 0 ? getAverage(windSpeedData) : 0;
    const avgSnow = N > 0 ? getAverage(snowDepthData) : 0;

    const sunnyPct = sunny?.probability ?? 0;
    const rainPct = rain?.probability ?? 0;
    const snowPct = snow?.probability ?? 0;
    const windPct = wind?.probability ?? 0;

    // Header row
    const header = [
      "date",
      "temperature",
      "precipitation",
      "snow_depth",
      "wind_speed",
    ];
    // Data rows per date
    const dataRows = dates.map((d, i) => [
      d,
      temperatureData[i] != null ? String(temperatureData[i]) : "",
      precipitationData[i] != null ? String(precipitationData[i]) : "",
      snowDepthData[i] != null ? String(snowDepthData[i]) : "",
      windSpeedData[i] != null ? String(windSpeedData[i]) : "",
    ]);

    const avgRow = [
      "Average",
      String(avgTemp.toFixed(2)),
      String(avgPrecip.toFixed(2)),
      String(avgSnow.toFixed(2)),
      String(avgWind.toFixed(2)),
    ];
    const pctRow = [
      "Percentages",
      "", // temperature has no percentage meaning here
      String(rainPct),
      String(snowPct),
      String(windPct),
    ];
    const unitRow = ["Parameters", "F", "in", "in", "mph"];

    const rows = [header, ...dataRows, avgRow, pctRow, unitRow];
    return rows.map((r) => r.join(",")).join("\n");
  };

  const handleDownloadData = async () => {
    try {
      const csv = buildCsvString();
      console.log(csv);
      const fileName = `forecast_summary_${new Date().toDateString()}.csv`;
      const fileUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Share.share({
        url: fileUri,
        message: "Export WillItRain data",
        title: "Export WillItRain data",
      });
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to create CSV");
    }
  };

  // Build a dynamic, human-friendly summary from computed probabilities
  const buildSummaryText = () => {
    const sunny = weatherData.find((c: WeatherCondition) => c.id === "sunny");
    const rain = weatherData.find((c: WeatherCondition) => c.id === "rain");
    const snow = weatherData.find((c: WeatherCondition) => c.id === "snow");
    const wind = weatherData.find((c: WeatherCondition) => c.id === "wind");

    const avg = Math.round(sunny?.temperature ?? 0);
    const hi = Math.round(sunny?.highTemp ?? avg);
    const lo = Math.round(sunny?.lowTemp ?? avg);

    const rainPct = rain?.probability ?? 0;
    const snowPct = snow?.probability ?? 0;
    const windPct = wind?.probability ?? 0;

    // Determine headline condition
    const entries = [
      { id: "sunny", pct: sunny?.probability ?? 0, label: "sunny/clear" },
      { id: "rain", pct: rainPct, label: "rain" },
      { id: "snow", pct: snowPct, label: "snow" },
      { id: "wind", pct: windPct, label: "windy" },
    ];
    const primary = entries.sort((a, b) => b.pct - a.pct)[0];

    const parts: string[] = [];
    parts.push(`Likely ${primary.label}`);
    if (rainPct >= 10) parts.push(`${rainPct}% chance of rain`);
    if (snowPct >= 10) parts.push(`${snowPct}% chance of snow`);
    if (windPct >= 20) parts.push(`${windPct}% chance of windy conditions`);

    const headline = parts.join(", ");
    return `${headline}. Average around ${avg}°F (H:${hi}°F / L:${lo}°F). Plan activities accordingly.`;
  };

  if (isLoading || isLoadingWeatherData) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            Weather Forecast
          </ThemedText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>
            Loading weather data...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }
  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={{ color: "#fff" }}>{error.message}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Weather Forecast
        </ThemedText>
        <TouchableOpacity
          onPress={async () => {
            try {
              const temp = weatherData?.[0]?.temperature;
              const icon = getWeatherIcon(
                (weatherData?.[0]?.id as string) || "partly-sunny"
              );
              await addSavedQuery({
                id: String(Date.now()),
                location: params.location || "",
                date: params.date || new Date().toISOString().split("T")[0],
                time: new Date().toLocaleTimeString(),
                conditions: weatherData.map((w: WeatherCondition) => w.id),
                temperature:
                  typeof temp === "number" ? Math.round(temp) : undefined,
                weatherIcon: icon,
                lat: params.lat || "",
                lon: params.lon || "",
              });
              Alert.alert("Saved", "Forecast saved to history.");
            } catch (e: any) {
              Alert.alert("Error", e?.message || "Failed to save");
            }
          }}
          style={styles.saveButton}
        >
          <Ionicons name="bookmark" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location and Temperature Display */}
        <View style={styles.weatherHeader}>
          <View
            style={[
              styles.temperatureCard,
              {
                backgroundColor: getTemperatureColor(weatherData[0].temperature)
                  .color,
              },
            ]}
          >
            <Ionicons
              name={getTemperatureColor(weatherData[0].temperature).icon as any}
              size={30}
              color="#fff"
            />
            <Text style={styles.temperatureText}>
              {weatherData[0].temperature.toFixed(0)}°F
            </Text>
            <ThemedText style={styles.weatherCondition}>
              {getTemperatureColor(weatherData[0].temperature).label}
            </ThemedText>
            <ThemedText style={styles.temperatureRange}>
              H:{weatherData[0].highTemp.toFixed(0)}°F L:
              {weatherData[0].lowTemp.toFixed(0)}°F
            </ThemedText>
          </View>
        </View>

        {/* Location Info */}
        <View style={styles.locationInfo}>
          <ThemedText style={styles.locationName}>
            {params.location || "New York"}
          </ThemedText>
          <ThemedText style={styles.locationDate}>
            {params.date || new Date().toLocaleDateString()}
          </ThemedText>
        </View>

        {/* Weather Conditions */}
        <View style={styles.conditionsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Likelihood of Conditions
          </ThemedText>

          <View style={styles.conditionsList}>
            {weatherData.map((condition: WeatherCondition) => (
              <View key={condition.id} style={styles.conditionItem}>
                <View style={styles.conditionHeader}>
                  <View style={styles.conditionInfo}>
                    <Ionicons
                      name={getWeatherIcon(condition.id) as any}
                      size={24}
                      color={condition.color}
                    />
                    <ThemedText style={styles.conditionLabel}>
                      {condition.label}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.conditionProbability}>
                    {condition.probability}%
                  </ThemedText>
                </View>

                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${condition.probability}%`,
                        backgroundColor: condition.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
        {/* Suggested Activities */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Suggested Activities
          </ThemedText>
          <View style={styles.activitiesGrid}>
            {activities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={styles.activityCard}
                // onPress={() => setSelectedActivity(activity)}
              >
                <View style={styles.activityImage}>
                  <Ionicons
                    name={
                      activity.image === "hiking"
                        ? "walk"
                        : activity.image === "jogging"
                          ? "walk"
                          : activity.image === "gardening"
                            ? "leaf"
                            : activity.image === "climbing"
                              ? "fitness"
                              : activity.image === "fishing"
                                ? "fish"
                                : activity.image === "cycling"
                                  ? "bicycle"
                                  : activity.image === "picnic"
                                    ? "restaurant"
                                    : activity.image === "photography"
                                      ? "camera"
                                      : "flashlight"
                    }
                    size={40}
                    color="#4A90E2"
                  />
                </View>
                <ThemedText style={styles.activityCardName}>
                  {activity.name}
                </ThemedText>
                <ThemedText style={styles.activityCardDescription}>
                  {activity.description}
                </ThemedText>
                <View
                  style={[
                    styles.activityRecommendation,
                    {
                      backgroundColor:
                        getRecommendationColor(activity.recommendation) + "20",
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.activityRecommendationText,
                      {
                        color: getRecommendationColor(activity.recommendation),
                      },
                    ]}
                  >
                    {getRecommendationText(activity.recommendation)}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* What to Wear */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            What to Wear
          </ThemedText>
          <View style={styles.gearGrid}>
            {clothing.map((g) => (
              <View key={g.id} style={styles.gearItem}>
                <View style={[styles.gearIcon, { backgroundColor: "#333" }]}>
                  <Ionicons name={g.icon as any} size={28} color="#4A90E2" />
                </View>
                <ThemedText style={styles.gearName}>{g.name}</ThemedText>
                <ThemedText style={styles.gearDescription}>
                  {g.description}
                </ThemedText>
                {g.essential ? (
                  <View style={styles.essentialBadge}>
                    <Text style={styles.essentialText}>ESSENTIAL</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Weather Summary
          </ThemedText>
          <View style={styles.summaryCard}>
            <ThemedText style={styles.summaryText}>
              {buildSummaryText()}
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownloadData}
        >
          <Ionicons name="download" size={20} color="#fff" />
          <ThemedText style={styles.downloadButtonText}>
            Download Data
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  saveButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#ccc",
  },
  weatherHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  temperatureCard: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 60,
    borderRadius: 20,
    width: width - 40,
  },
  temperatureText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  weatherCondition: {
    fontSize: 20,
    color: "#fff",
    marginTop: 5,
  },
  temperatureRange: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 5,
  },
  locationInfo: {
    alignItems: "center",
    marginBottom: 30,
  },
  locationName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  locationDate: {
    fontSize: 16,
    color: "#ccc",
    marginTop: 5,
  },
  conditionsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  conditionsList: {
    gap: 16,
  },
  conditionItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
  },
  conditionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  conditionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  conditionLabel: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  conditionProbability: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  additionalInfo: {
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
  },
  summaryText: {
    fontSize: 16,
    color: "#ccc",
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  downloadButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  section: {
    marginBottom: 32,
  },
  activityInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 12,
  },
  checkButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  checkButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  recommendationSection: {
    marginBottom: 32,
  },
  recommendationCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  activityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  recommendationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  activityDescription: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 8,
  },
  weatherNote: {
    fontSize: 14,
    color: "#4A90E2",
    fontStyle: "italic",
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  activityCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    alignItems: "center",
  },
  activityImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  activityCardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  activityCardDescription: {
    fontSize: 12,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 8,
  },
  activityRecommendation: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activityRecommendationText: {
    fontSize: 10,
    fontWeight: "600",
  },
  gearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gearItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    width: "30%",
    alignItems: "center",
    position: "relative",
  },
  gearIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  gearName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  gearDescription: {
    fontSize: 10,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 14,
  },
  essentialBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  essentialText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  dropdownMenu: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
});
