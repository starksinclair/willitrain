import { Ionicons } from "@expo/vector-icons"; // Import Ionicons
import * as Location from "expo-location";
import { AppleMaps, GoogleMaps } from "expo-maps";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (coords: {
    latitude: number;
    longitude: number;
    label?: string;
  }) => void;
  initialCoords?: { latitude: number; longitude: number };
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

export default function MapPicker({
  visible,
  onClose,
  onConfirm,
  initialCoords,
}: Props) {
  const mapRef = useRef<any>(null);
  console.log("initialCoords", initialCoords);
  const [pin, setPin] = useState<Coordinate | null>(initialCoords ?? null);
  const [camera, setCamera] = useState<any>(null);
  // Ask permission + center on user (first open only)
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      //   if (!initialCoords) {
      const here = await Location.getCurrentPositionAsync({});
      console.log("here", here);
      const camera = {
        coordinates: {
          latitude: here.coords.latitude,
          longitude: here.coords.longitude,
        },
        zoom: 12,
      };
      setCamera(camera);
      // mapRef.current?.animateCamera(camera, {
      //   duration: 500,
      // });
      //   }
    })();
  }, []);

  const handleMapPress = (e: any) => {
    console.log("handleMapPress", e);
    setPin(e.coordinates);
  };

  const handleConfirm = async () => {
    if (!pin) {
      Alert.alert("Error", "Please select a location");
      return;
    }
    // Try reverse geocoding for a friendly label
    let label: string | undefined;
    try {
      const parts = await Location.reverseGeocodeAsync(pin);
      if (parts?.[0]) {
        const p = parts[0];
        label = [p.name, p.city, p.region, p.country]
          .filter(Boolean)
          .join(", ");
      }
    } catch {}
    onConfirm({ ...pin, label });
    onClose();
  };

  const initialCenter = initialCoords ?? {
    latitude: 40.194146630461205,
    longitude: -85.40122409047746,
  };

  const getInstructionText = () => {
    if (Platform.OS === "ios") {
      return "Tap to drop pin and click on the close button to save";
    } else if (Platform.OS === "android") {
      return "Long press to drop pin and click on the close button to save";
    }
    return "Map not supported";
  };

  const renderMap = () => {
    console.log("camera jdjdjd", camera);
    const commonProps = {
      style: { flex: 1 },
      initialCamera: camera ?? {
        coordinates: initialCenter,
        zoom: 8,
      },
      markers: pin ? [{ coordinates: pin, title: "Selected Location" }] : [],
    };

    if (Platform.OS === "ios") {
      return (
        <AppleMaps.View
          ref={mapRef}
          {...commonProps}
          cameraPosition={camera}
          onMapClick={handleMapPress}
        />
      );
    } else if (Platform.OS === "android") {
      return (
        <GoogleMaps.View
          ref={mapRef}
          {...commonProps}
          onMapLongClick={handleMapPress}
        />
      );
    } else {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Maps are only available on iOS and Android</Text>
        </View>
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        {renderMap()}
        <View style={{ position: "absolute", bottom: 50, alignSelf: "center" }}>
          <Text
            style={{
              color: "white",
              fontSize: 16,
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: 10,
              borderRadius: 5,
            }}
          >
            {getInstructionText()}
          </Text>
        </View>
        {/* Close button */}
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 60,
            left: 20,
            zIndex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: 20,
            padding: 5,
          }}
          onPress={handleConfirm}
        >
          <Ionicons name="close-circle" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
