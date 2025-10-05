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
