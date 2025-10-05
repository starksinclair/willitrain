import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";
import weatherService, { WeatherData } from "../../services/weatherService";

interface Activity {
  id: string;
  name: string;
  description: string;
  image: string;
  weatherConditions: string[];
  gear: string[];
  recommendation: "recommended" | "caution" | "not-recommended";
}

interface GearItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  essential: boolean;
}

export default function ActivityPlannerScreen() {
  const [activityInput, setActivityInput] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 22,
    condition: "partly-cloudy",
    windSpeed: 15,
    precipitation: 20,
    humidity: 65,
    timestamp: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<string>("");

  // Load live weather data on component mount
  useEffect(() => {
    loadLiveWeatherData();
  }, []);

  const loadLiveWeatherData = async () => {
    setIsLoading(true);
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is needed to get current weather data. Using default location.",
          [{ text: "OK" }]
        );
        // Use default location (New York)
        await fetchWeatherForLocation(40.7128, -74.006, "New York, NY");
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get location name
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const locationName = reverseGeocode[0]
        ? `${reverseGeocode[0].city}, ${reverseGeocode[0].region}`
        : "Current Location";

      setLocation(locationName);
      await fetchWeatherForLocation(latitude, longitude, locationName);
    } catch (error) {
      console.error("Error loading weather data:", error);
      Alert.alert(
        "Error",
        "Failed to load weather data. Using default weather.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeatherForLocation = async (
    lat: number,
    lon: number,
    locationName: string
  ) => {
    try {
      const weather = await weatherService.fetchOpenMeteoWeatherData(lat, lon);
      console.log("weather data", weather);
      setWeatherData(weather);
      setLocation(locationName);
    } catch (error) {
      console.error("Error fetching weather:", error);
      throw error;
    }
  };

  // Get activity recommendations based on live weather data
  const getActivityRecommendations = () => {
    return weatherService.getActivityRecommendations(weatherData);
  };

  const activities: Activity[] = [
    {
      id: "hiking",
      name: "Hiking",
      description: "Explore scenic trails",
      image: "hiking",
      weatherConditions: ["clear", "partly-cloudy", "light-rain"],
      gear: ["hiking-boots", "backpack", "water-bottle", "map"],
      recommendation:
        getActivityRecommendations().find((a) => a.activity === "Hiking")
          ?.recommendation || "recommended",
    },
    {
      id: "jogging",
      name: "Jogging",
      description: "Light run around your area",
      image: "jogging",
      weatherConditions: ["clear", "partly-cloudy"],
      gear: ["water-bottle", "light-jacket"],
      recommendation: "recommended",
    },
    {
      id: "gardening",
      name: "Gardening",
      description: "Tend to plants outdoors",
      image: "gardening",
      weatherConditions: ["clear", "partly-cloudy", "light-rain"],
      gear: ["gloves", "hat", "sunscreen"],
      recommendation: "recommended",
    },
    {
      id: "indoor-climbing",
      name: "Indoor Climbing",
      description: "Challenge yourself",
      image: "climbing",
      weatherConditions: ["any"],
      gear: ["climbing-shoes", "harness", "chalk-bag"],
      recommendation: "recommended", // Always recommended since it's indoor
    },
    {
      id: "fishing",
      name: "Fishing",
      description: "Relax by the water",
      image: "fishing",
      weatherConditions: ["clear", "partly-cloudy", "light-wind"],
      gear: ["fishing-rod", "tackle-box", "fishing-license", "cooler"],
      recommendation:
        getActivityRecommendations().find((a) => a.activity === "Fishing")
          ?.recommendation || "caution",
    },
    {
      id: "camping",
      name: "Camping",
      description: "Sleep under the stars",
      image: "camping",
      weatherConditions: ["clear", "partly-cloudy"],
      gear: ["tent", "sleeping-bag", "camping-stove", "lantern"],
      recommendation:
        getActivityRecommendations().find((a) => a.activity === "Camping")
          ?.recommendation || "not-recommended",
    },
  ];

  const gearItems: GearItem[] = [
    {
      id: "map",
      name: "Map",
      icon: "map",
      description: "Navigation and trail guidance",
      essential: true,
    },
    {
      id: "sunscreen",
      name: "Sunscreen",
      icon: "sunny",
      description: "UV protection for outdoor activities",
      essential: true,
    },
    {
      id: "light-jacket",
      name: "Light Jacket",
      icon: "shirt",
      description: "Wind and light rain protection",
      essential: false,
    },
    {
      id: "water-bottle",
      name: "Water Bottle",
      icon: "water",
      description: "Stay hydrated during activities",
      essential: true,
    },
    {
      id: "first-aid",
      name: "First Aid Kit",
      icon: "medical",
      description: "Emergency medical supplies",
      essential: true,
    },
    {
      id: "headlamp",
      name: "Headlamp",
      icon: "flashlight",
      description: "Hands-free lighting",
      essential: false,
    },
  ];

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "recommended":
        return "#4CAF50";
      case "caution":
        return "#FF9800";
      case "not-recommended":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case "recommended":
        return "Recommended";
      case "caution":
        return "Use Caution";
      case "not-recommended":
        return "Not Recommended";
      default:
        return "Unknown";
    }
  };

  const checkActivityFeasibility = () => {
    if (!activityInput.trim()) {
      Alert.alert(
        "Activity Required",
        "Please enter an activity to check feasibility."
      );
      return;
    }

    // Find matching activity
    const matchingActivity = activities.find((activity) =>
      activity.name.toLowerCase().includes(activityInput.toLowerCase())
    );

    if (matchingActivity) {
      setSelectedActivity(matchingActivity);
    } else {
      Alert.alert(
        "Activity Not Found",
        "We couldn't find that specific activity. Try one of our suggested activities below.",
        [{ text: "OK" }]
      );
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "clear":
        return "sunny";
      case "partly-cloudy":
        return "partly-sunny";
      case "cloudy":
        return "cloudy";
      case "rain":
        return "rainy";
      case "snow":
        return "snow";
      default:
        return "partly-sunny";
    }
  };

  const getWeatherDescription = () => {
    const { temperature, condition, windSpeed, precipitation, humidity } =
      weatherData;

    // Condition phrase
    const conditionText =
      condition === "clear"
        ? "clear skies"
        : condition === "partly-cloudy"
          ? "partly cloudy"
          : condition === "cloudy"
            ? "overcast"
            : condition === "rain"
              ? "rainy"
              : condition === "snow"
                ? "snowy"
                : condition;

    // Temperature comfort (F)
    let tempText = "mild";
    if (temperature <= 40) tempText = "cold";
    else if (temperature >= 90) tempText = "very hot";
    else if (temperature >= 75) tempText = "warm";

    // Wind
    let windText = "light winds";
    if (windSpeed >= 40) windText = "strong winds";
    else if (windSpeed >= 20) windText = "breezy";

    // Precipitation
    const precipText =
      precipitation >= 60
        ? "high chance of precipitation"
        : precipitation >= 30
          ? "chance of showers"
          : "low precipitation risk";

    // Humidity
    const humidityText =
      humidity >= 80
        ? "humid"
        : humidity <= 30
          ? "dry"
          : "comfortable humidity";

    return `Currently ${tempText} with ${conditionText}, ${windText}; ${precipText}. ${humidityText}.`;
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Activity Planner
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weather Summary */}
        <View style={styles.weatherSummary}>
          <View style={styles.weatherHeader}>
            <View style={styles.weatherInfo}>
              <Ionicons
                name={getWeatherIcon(weatherData.condition) as any}
                size={32}
                color="#4A90E2"
              />
              <View style={styles.weatherText}>
                <ThemedText style={styles.temperature}>
                  {weatherData.temperature}°F
                </ThemedText>
                <ThemedText style={styles.weatherDescription}>
                  {getWeatherDescription()}
                </ThemedText>
                {location && (
                  <ThemedText style={styles.locationText}>
                    📍 {location}
                  </ThemedText>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={loadLiveWeatherData}
              disabled={isLoading}
            >
              <Ionicons
                name={isLoading ? "refresh" : "refresh-outline"}
                size={20}
                color="#4A90E2"
              />
            </TouchableOpacity>
          </View>
          {isLoading && (
            <ThemedText style={styles.loadingText}>
              Loading live weather data...
            </ThemedText>
          )}
        </View>

        {/* Activity Input Section */}
        {/* <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            What's your plan?
          </ThemedText>
          <TextInput
            style={styles.activityInput}
            placeholder="e.g., Go for a run"
            placeholderTextColor="#666"
            value={activityInput}
            onChangeText={setActivityInput}
          />
          <TouchableOpacity
            style={styles.checkButton}
            onPress={checkActivityFeasibility}
          >
            <ThemedText style={styles.checkButtonText}>
              Check Feasibility
            </ThemedText>
          </TouchableOpacity>
        </View> */}

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            What's your plan?
          </ThemedText>

          <TouchableOpacity
            style={[
              styles.activityInput,
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              },
            ]}
            onPress={() => setShowActivityMenu((s: boolean) => !s)}
          >
            <ThemedText style={{ color: "#fff" }}>
              {selectedActivity?.name || activityInput || "Select an activity"}
            </ThemedText>
            <Ionicons
              name={showActivityMenu ? "chevron-up" : "chevron-down"}
              size={18}
              color="#666"
            />
          </TouchableOpacity>

          {showActivityMenu && (
            <View style={styles.dropdownMenu}>
              {activities.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setActivityInput(a.name);
                    setSelectedActivity(a);
                    setShowActivityMenu(false);
                  }}
                >
                  <ThemedText style={styles.dropdownText}>{a.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.checkButton}
            onPress={checkActivityFeasibility}
          >
            <ThemedText style={styles.checkButtonText}>
              Check Feasibility
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Activity Recommendation */}
        {selectedActivity && (
          <View style={styles.recommendationSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Activity Recommendation
            </ThemedText>
            <View style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <ThemedText style={styles.activityName}>
                  {selectedActivity.name}
                </ThemedText>
                <View
                  style={[
                    styles.recommendationBadge,
                    {
                      backgroundColor: getRecommendationColor(
                        selectedActivity.recommendation
                      ),
                    },
                  ]}
                >
                  <ThemedText style={styles.recommendationText}>
                    {getRecommendationText(selectedActivity.recommendation)}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.activityDescription}>
                {selectedActivity.description}
              </ThemedText>
              <ThemedText style={styles.weatherNote}>
                Based on current weather conditions, this activity is{" "}
                {selectedActivity.recommendation === "recommended"
                  ? "suitable"
                  : selectedActivity.recommendation === "caution"
                    ? "possible with caution"
                    : "not recommended"}{" "}
                for today.
              </ThemedText>
            </View>
          </View>
        )}

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
                onPress={() => setSelectedActivity(activity)}
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

        {/* Gear & Tools */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Gear & Tools
          </ThemedText>
          <View style={styles.gearGrid}>
            {gearItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.gearItem}>
                <View
                  style={[
                    styles.gearIcon,
                    { backgroundColor: item.essential ? "#4A90E2" : "#333" },
                  ]}
                >
                  <Ionicons name={item.icon as any} size={24} color="#fff" />
                </View>
                <ThemedText style={styles.gearName}>{item.name}</ThemedText>
                <ThemedText style={styles.gearDescription}>
                  {item.description}
                </ThemedText>
                {item.essential && (
                  <View style={styles.essentialBadge}>
                    <ThemedText style={styles.essentialText}>
                      Essential
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  weatherSummary: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  weatherHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weatherInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#333",
  },
  locationText: {
    fontSize: 12,
    color: "#4A90E2",
    marginTop: 4,
  },
  loadingText: {
    fontSize: 12,
    color: "#4A90E2",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  weatherText: {
    flex: 1,
  },
  temperature: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  weatherDescription: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
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
  dropdownText: { color: "#fff", fontSize: 16 },
});
