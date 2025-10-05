import {
  SavedQuery,
  deleteSavedQuery,
  getSavedQueries,
  getTemperatureColor,
  getWeatherIcon,
} from "@/constants/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";

export default function SavedScreen() {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSaved = async () => {
    setIsLoading(true);
    const list = await getSavedQueries();
    setSavedQueries(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleQueryPress = (query: SavedQuery) => {
    // Navigate to forecast with saved query data
    router.push({
      pathname: "/forecast",
      params: {
        location: query.location,
        date: query.date,
        lat: query.lat,
        lon: query.lon,
      },
    });
  };

  const handleDeleteQuery = (queryId: string) => {
    Alert.alert(
      "Delete Query",
      "Are you sure you want to delete this saved query?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSavedQuery(queryId);
            setSavedQueries((prev: SavedQuery[]) =>
              prev.filter((query) => query.id !== queryId)
            );
          },
        },
      ]
    );
  };

  const handleNewQuery = () => {
    router.push("/explore");
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          History
        </ThemedText>
        <TouchableOpacity onPress={loadSaved} style={styles.newQueryButton}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {savedQueries.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={64} color="#666" />
          <ThemedText style={styles.emptyTitle}>No Saved Queries</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Your saved weather queries will appear here
          </ThemedText>
          <TouchableOpacity style={styles.emptyButton} onPress={handleNewQuery}>
            <ThemedText style={styles.emptyButtonText}>
              Create First Query
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.queriesList}>
            {savedQueries.map((query: SavedQuery) => (
              <TouchableOpacity
                key={query.id}
                style={styles.queryItem}
                onPress={() => handleQueryPress(query)}
              >
                <View style={styles.queryHeader}>
                  <View style={styles.queryInfo}>
                    <Ionicons name="location" size={20} color="#007AFF" />
                    <Text numberOfLines={2} style={styles.queryLocation}>
                      {query.location}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteQuery(query.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash" size={18} color="#ff4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.queryDetails}>
                  <View style={styles.queryDateTime}>
                    <Ionicons name="calendar" size={16} color="#666" />
                    <ThemedText style={styles.queryDate}>
                      {query.date}
                    </ThemedText>
                    <ThemedText style={styles.queryTime}>
                      {query.time}
                    </ThemedText>
                  </View>

                  {query.temperature && (
                    <View style={styles.queryTemperature}>
                      <Ionicons
                        name={getWeatherIcon(query.weatherIcon || "") as any}
                        size={20}
                        color={getTemperatureColor(query.temperature).color}
                      />
                      <ThemedText
                        style={[
                          styles.temperatureText,
                          {
                            color: getTemperatureColor(query.temperature).color,
                          },
                        ]}
                      >
                        {query.temperature}°
                      </ThemedText>
                    </View>
                  )}
                </View>

                <View style={styles.queryConditions}>
                  {query.conditions.map((condition: string, index: number) => (
                    <View key={index} style={styles.conditionTag}>
                      <ThemedText style={styles.conditionTagText}>
                        {condition
                          .replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </ThemedText>
                    </View>
                  ))}
                </View>

                <View style={styles.queryFooter}>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  newQueryButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  queriesList: {
    gap: 16,
  },
  queryItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  queryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  queryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  queryLocation: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    maxWidth: "80%",
  },
  deleteButton: {
    padding: 4,
  },
  queryDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  queryDateTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  queryDate: {
    fontSize: 14,
    color: "#ccc",
  },
  queryTime: {
    fontSize: 14,
    color: "#666",
  },
  queryTemperature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  temperatureText: {
    fontSize: 16,
    fontWeight: "600",
  },
  queryConditions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  conditionTag: {
    backgroundColor: "#333",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  conditionTagText: {
    fontSize: 12,
    color: "#ccc",
  },
  queryFooter: {
    alignItems: "flex-end",
  },
});
