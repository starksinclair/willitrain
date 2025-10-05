import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapPicker from "../../components/map-modal";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";

export default function QueryScreen() {
  const [locationName, setLocationName] = useState("");
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [show, setShow] = useState(false);

  const onChange = (event: any, selectedDate: any) => {
    setShow(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const handleGeocode = async () => {
    const q = locationName.trim();
    if (!q) return;
    try {
      const res = await Location.geocodeAsync(q);
      if (res?.[0]) {
        const { latitude, longitude } = res[0];
        setCoords({ latitude, longitude });
        try {
          const rev = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          if (rev?.[0]) {
            const p = rev[0];
            const label = [p.name, p.city, p.region, p.country]
              .filter(Boolean)
              .join(", ");
            if (label) setLocationName(label);
          }
        } catch {}
      } else {
        Alert.alert(
          "Not Found",
          "Could not locate that place. Try a more specific name."
        );
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to look up that place.");
    }
  };

  const handleNext = () => {
    if (!locationName.trim() && !coords && !selectedDate) {
      Alert.alert("Location Required", "Please enter a location and date.");
      return;
    }
    router.push({
      pathname: "/forecast",
      params: {
        location: locationName || "",
        date: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
        lat: coords?.latitude?.toString() || "",
        lon: coords?.longitude?.toString() || "",
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Weather Probability
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Location
          </ThemedText>

          <View style={{ position: "relative" }}>
            <TextInput
              style={styles.input}
              placeholder="Search for a location"
              placeholderTextColor="#666"
              value={locationName}
              onChangeText={setLocationName}
              returnKeyType="search"
              onSubmitEditing={handleGeocode}
            />
            <TouchableOpacity
              style={{ position: "absolute", right: 14, top: 14 }}
              onPress={handleGeocode}
            >
              <Ionicons name="search" size={22} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.locationOptions}>
            <TouchableOpacity
              style={styles.locationOption}
              onPress={() => setMapOpen(true)}
            >
              <Ionicons name="location" size={20} color="#007AFF" />
              <ThemedText style={styles.locationOptionText}>
                Pin on map
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationOption}
              onPress={() =>
                Alert.alert(
                  "Coming soon",
                  "Draw a boundary is under construction."
                )
              }
            >
              <Ionicons name="create" size={20} color="#007AFF" />
              <ThemedText style={styles.locationOptionText}>
                Draw a boundary
              </ThemedText>
            </TouchableOpacity>
          </View>

          {coords && (
            <ThemedText style={{ color: "#ccc", marginTop: 8 }}>
              Selected: {coords.latitude.toFixed(4)},{" "}
              {coords.longitude.toFixed(4)}
            </ThemedText>
          )}
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Date
          </ThemedText>

          <TouchableOpacity style={styles.dateButton} onPress={showDatepicker}>
            <Ionicons name="calendar" size={20} color="#007AFF" />
            <ThemedText style={styles.dateButtonText}>
              {selectedDate
                ? selectedDate.toLocaleDateString()
                : "Select a date or range"}
            </ThemedText>
            <DateTimePicker
              mode="date"
              is24Hour={true}
              testID="dateTimePicker"
              value={selectedDate || new Date()}
              onChange={onChange}
              display="default"
              textColor="#fff"
              themeVariant="dark"
              style={{ color: "#fff" }}
            />
            <Ionicons
              style={{ marginLeft: 12 }}
              name="chevron-down"
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <ThemedText style={styles.nextButtonText}>Next</ThemedText>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Map Picker Modal */}
      <MapPicker
        visible={mapOpen}
        onClose={() => setMapOpen(false)}
        onConfirm={(p) => {
          setCoords({ latitude: p.latitude, longitude: p.longitude });
          if (p.label) setLocationName(p.label);
        }}
        initialCoords={coords ?? undefined}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  placeholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: 20 },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
  locationOptions: { flexDirection: "row", gap: 16, marginTop: 12 },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  locationOptionText: { color: "#007AFF", fontSize: 16 },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  dateButtonText: { flex: 1, fontSize: 16, color: "#fff", marginLeft: 12 },
  bottomContainer: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 20 },
  nextButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
