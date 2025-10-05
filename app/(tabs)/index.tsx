import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1" style={{ display: "flex", flex: 1 }}>
        <ThemedView style={styles.container}>
          <ScrollView>
            {/* Header with Earth graphic */}
            <View style={styles.header}>
              <View style={styles.earthContainer}>
                <View style={styles.earth} />
                <Image
                  source={require("../../assets/images/icon.png")}
                  style={styles.appLogo}
                />
                <View style={styles.earthGlow} />
              </View>

              <ThemedText type="title" style={styles.appTitle}>
                Will It Rain?
              </ThemedText>
              <ThemedText style={styles.tagline}>
                Predict farther with NASA-powered weather insights and plan your
                activities with confidence using our advanced weather prediction
                system.
              </ThemedText>
            </View>

            {/* Main content */}
            <View style={styles.content}>
              {/* <ThemedText style={styles.description}>
                Get accurate weather forecasts for any location and date range.
                Plan your activities with confidence using our advanced weather
                prediction system.
              </ThemedText> */}

              {/* Action buttons */}
              <View style={styles.buttonContainer}>
                <Link href="/explore" asChild>
                  <TouchableOpacity style={styles.primaryButton}>
                    <Ionicons name="search" size={24} color="white" />
                    <ThemedText style={styles.buttonText}>
                      Start a Query
                    </ThemedText>
                  </TouchableOpacity>
                </Link>

                <Link href="/activity-planner" asChild>
                  <TouchableOpacity style={styles.secondaryButton}>
                    <Ionicons name="calendar" size={20} color="#007AFF" />
                    <ThemedText style={styles.secondaryButtonText}>
                      Plan Activities
                    </ThemedText>
                  </TouchableOpacity>
                </Link>

                <Link href="/saved" asChild>
                  <TouchableOpacity style={styles.secondaryButton}>
                    <Ionicons name="bookmark" size={20} color="#007AFF" />
                    <ThemedText style={styles.secondaryButtonText}>
                      View Saved Queries
                    </ThemedText>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Features */}
              <View style={styles.featuresContainer}>
                <ThemedText type="subtitle" style={styles.featuresTitle}>
                  Features
                </ThemedText>
                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <Ionicons name="location" size={20} color="#007AFF" />
                    <ThemedText style={styles.featureText}>
                      Location-based forecasts
                    </ThemedText>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="calendar" size={20} color="#007AFF" />
                    <ThemedText style={styles.featureText}>
                      Date selection
                    </ThemedText>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="map" size={20} color="#007AFF" />
                    <ThemedText style={styles.featureText}>
                      Interactive maps
                    </ThemedText>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="calendar" size={20} color="#007AFF" />
                    <ThemedText style={styles.featureText}>
                      Activity planning
                    </ThemedText>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="download" size={20} color="#007AFF" />
                    <ThemedText style={styles.featureText}>
                      Download weather data
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </ThemedView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appLogo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    position: "absolute",
    top: 10,
    left: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  earthContainer: {
    position: "relative",
    marginBottom: 30,
  },
  earth: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4A90E2",
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  earthGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(74, 144, 226, 0.3)",
    top: -10,
    left: -10,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  featuresContainer: {
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  featureText: {
    color: "#ccc",
    fontSize: 16,
  },
});
