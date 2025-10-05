import * as Location from "expo-location";
import { AppleMaps } from "expo-maps";
import { useEffect, useRef, useState } from "react";
import { Modal, Platform, Text, View } from "react-native";

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

export default function MapPicker({
  visible,
  onClose,
  onConfirm,
  initialCoords,
}: Props) {
  const mapRef = useRef<AppleMaps.View>(null);
  const [pin, setPin] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialCoords ?? null);

  // Ask permission + center on user (first open only)
  useEffect(() => {
    (async () => {
      if (!visible) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      if (!initialCoords) {
        const here = await Location.getCurrentPositionAsync({});
        const camera: Partial<AppleMaps.Camera> = {
          center: {
            latitude: here.coords.latitude,
            longitude: here.coords.longitude,
          },
          zoom: 11,
        };
        mapRef.current?.animateCamera(camera as AppleMaps.Camera, {
          duration: 500,
        });
      }
    })();
  }, [visible]);

  const handleLongPress = (e: MapPressEvent) => {
    setPin(e.nativeEvent.coordinate);
  };

  const handleConfirm = async () => {
    if (!pin) return;
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
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {Platform.OS === "ios" ? (
        <AppleMaps.View
          ref={mapRef}
          style={{ flex: 1 }}
          onLongPress={handleLongPress}
          initialCamera={{
            center: initialCoords ?? { latitude: 39.7684, longitude: -86.1581 }, // Indy fallback
            zoom: 8,
          }}
        />
      ) : (
        <View>
          <Text>Map</Text>
        </View>
      )}
    </Modal>
  );
}
