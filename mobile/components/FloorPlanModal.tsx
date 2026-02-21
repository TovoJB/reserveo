import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring
} from "react-native-reanimated";
import floorPlanData from "../data/floorplan_data.json";
import { InteractiveFloorPlan } from "./InteractiveImageFloorPlan";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SIDEBAR_WIDTH = 300;

// ─── Types ────────────────────────────────────────────────────────────────────
interface SelectableArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  available: boolean;
  capacity: number;
  imageSource?: string;
  price?: string;
}

interface FloorPlanModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product;
  onReserve: (selectedAreas: SelectableArea[]) => void;
  isProcessing?: boolean;
}

// ─── AnimatedListItem ─────────────────────────────────────────────────────────
const AnimatedListItem = ({
  children,
  index,
  isVisible,
}: {
  children: React.ReactNode;
  index: number;
  isVisible: boolean;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const hasAnimated = useSharedValue(false);

  useEffect(() => {
    // Animation d'entrée uniquement lors de l'apparition initiale
    if (isVisible && !hasAnimated.value) {
      opacity.value = withDelay(index * 50, withSpring(1, { damping: 15, stiffness: 100 }));
      translateY.value = withDelay(index * 50, withSpring(0, { damping: 15, stiffness: 100 }));
      hasAnimated.value = true;
    }
  }, [isVisible, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

// ─── AreaCard ─────────────────────────────────────────────────────────────────
// Composant carte extrait pour éviter des closures inline dans le ScrollView
const AreaCard = React.memo(
  ({
    area,
    isSelected,
    isFocused,
    onPress,
    index,
    isVisible,
  }: {
    area: SelectableArea;
    isSelected: boolean;
    isFocused: boolean;
    onPress: (area: SelectableArea) => void;
    index: number;
    isVisible: boolean;
  }) => {
    const handlePress = useCallback(() => onPress(area), [area, onPress]);

    const scaleStyle = useMemo(
      () => ({ transform: isFocused ? [{ scale: 1.05 as number }] : [{ scale: 1 as number }] }),
      [isFocused]
    );

    return (
      <AnimatedListItem index={index} isVisible={isVisible}>
        <Pressable
          onPress={handlePress}
          disabled={!area.available}
          style={({ pressed }) => [
            {
              marginBottom: 14,
              marginHorizontal: 2,
              padding: 16,
              borderRadius: 14,
              borderWidth: 2,
              backgroundColor: !area.available
                ? "rgba(55, 65, 81, 0.3)"
                : isSelected
                  ? "rgba(29, 185, 84, 0.15)"
                  : pressed
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(30, 41, 59, 0.4)",
              borderColor: !area.available
                ? "rgba(75, 85, 99, 0.5)"
                : isSelected
                  ? "#1DB954"
                  : "rgba(99, 75, 75, 0.99)",
              opacity: !area.available ? 0.5 : 1,
              minHeight: 56,
            },
            scaleStyle,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
            {/* Icône siège */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons
                name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={isSelected ? "#1DB954" : "rgba(255,255,255,0.4)"}
              />
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                {area.name}
              </Text>
            </View>
            {/* Prix / statut */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              {area.available ? (
                <Text style={{ color: "#1DB954", fontSize: 13, fontWeight: "700" }}>
                  ${area.price}
                </Text>
              ) : (
                <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                  Occupé
                </Text>
              )}
              {isSelected && (
                <Ionicons name="checkmark-circle" size={18} color="#1DB954" />
              )}
            </View>
          </View>
        </Pressable>
      </AnimatedListItem>
    );
  },
  (prev, next) =>
    prev.isSelected === next.isSelected &&
    prev.isFocused === next.isFocused &&
    prev.isVisible === next.isVisible &&
    prev.area.id === next.area.id
);

// ─── Sidebar animée ───────────────────────────────────────────────────────────
const AnimatedSidebar = ({
  visible,
  children,
}: {
  visible: boolean;
  children: React.ReactNode;
}) => {
  const translateX = useSharedValue(visible ? 0 : -SIDEBAR_WIDTH);

  useEffect(() => {
    translateX.value = withSpring(visible ? 0 : -SIDEBAR_WIDTH, {
      damping: 20,
      stiffness: 140,
    });
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: SIDEBAR_WIDTH,
          zIndex: 10,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// ─── FloorPlanModal ───────────────────────────────────────────────────────────
const FloorPlanModal = ({
  visible,
  onClose,
  product,
  onReserve,
  isProcessing = false,
}: FloorPlanModalProps) => {
  const [selectedAreas, setSelectedAreas] = useState<SelectableArea[]>([]);
  const [focusedArea, setFocusedArea] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Ref pour cleanup du setTimeout
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nettoyage du timer au démontage
  useEffect(() => {
    return () => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    };
  }, []);

  // Données depuis Excalidraw JSON
  const areas = useMemo<SelectableArea[]>(() => {
    return (floorPlanData as any[])
      .filter((el) => el.name !== "Miason" && el.type === "image")
      .map((el) => ({
        id: el.id,
        name: el.name || "Place",
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        available: true,
        capacity: 1,
        imageSource: el.imageSource,
        price: el.price || product.price.toString(),
      }));
  }, [product.price]);

  const availableAreas = useMemo(() => areas.filter((a) => a.available), [areas]);

  // Prix total mémoïsé
  const totalPrice = useMemo(
    () =>
      selectedAreas.reduce(
        (sum, area) => sum + parseFloat(area.price || product.price.toString()),
        0
      ),
    [selectedAreas, product.price]
  );

  // Toggle sélection d'une zone
  const toggleArea = useCallback((area: SelectableArea) => {
    if (!area.available) return;
    setSelectedAreas((prev) => {
      const exists = prev.find((a) => a.id === area.id);
      return exists ? prev.filter((a) => a.id !== area.id) : [...prev, area];
    });
  }, []);

  // Focus sur une zone (avec cleanup timer)
  const focusOnArea = useCallback((area: SelectableArea) => {
    setFocusedArea(area.id);
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    focusTimerRef.current = setTimeout(() => setFocusedArea(null), 2000);
  }, []);

  // Sélection depuis le plan interactif
  const handleElementSelect = useCallback(
    (elementId: string) => {
      const area = areas.find((a) => a.id === elementId);
      if (area) toggleArea(area);
    },
    [areas, toggleArea]
  );

  const handleReserve = useCallback(() => {
    if (selectedAreas.length === 0) {
      Alert.alert("Sélection requise", "Veuillez sélectionner au moins une zone");
      return;
    }
    onReserve(selectedAreas);
  }, [selectedAreas, onReserve]);

  const toggleSidebar = useCallback(() => setShowSidebar((v) => !v), []);

  const selectedIds = useMemo(() => selectedAreas.map((a) => a.id), [selectedAreas]);
  const availableIds = useMemo(() => availableAreas.map((a) => a.id), [availableAreas]);

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0E0E0E" }}>

        {/* ── ZONE PRINCIPALE (plan interactif plein écran) ── */}
        <View style={{ flex: 1 }}>
          <InteractiveFloorPlan
            elements={(floorPlanData as any[]).filter((el) => el.type === "image")}
            selectedIds={selectedIds}
            onSelect={handleElementSelect}
            availableIds={availableIds}
          />
        </View>

        {/* ── SIDEBAR ANIMÉE ── */}
        <AnimatedSidebar visible={showSidebar}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(15, 20, 30, 0.96)",
              borderRightWidth: 1,
              borderRightColor: "rgba(255,255,255,0.07)",
              paddingTop: 56,
              paddingHorizontal: 12,
            }}
          >
            {/* Header sidebar */}
            <View style={{ marginBottom: 16, paddingHorizontal: 4 }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 17,
                  fontWeight: "700",
                  marginBottom: 2,
                }}
                numberOfLines={1}
              >
                {product.name}
              </Text>
              <Text style={{ color: "#1DB954", fontSize: 12, fontWeight: "600" }}>
                {availableAreas.length} disponibles
              </Text>
            </View>

            {/* Liste scrollable */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {areas.map((area, index) => (
                <AreaCard
                  key={area.id}
                  area={area}
                  index={index}
                  isSelected={selectedIds.includes(area.id)}
                  isFocused={focusedArea === area.id}
                  onPress={toggleArea}
                  isVisible={showSidebar}
                />
              ))}
              {/* Espace pour le bouton de réservation */}
              <View style={{ height: 100 }} />
            </ScrollView>
          </View>
        </AnimatedSidebar>

        {/* ── BOUTONS FLOTTANTS ── */}
        <View
          style={{
            position: "absolute",
            top: 52,
            left: showSidebar ? SIDEBAR_WIDTH + 12 : 12,
            flexDirection: "row",
            gap: 8,
            zIndex: 20,
          }}
        >
          {/* Toggle sidebar */}
          <TouchableOpacity
            onPress={toggleSidebar}
            activeOpacity={0.75}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: showSidebar
                ? "rgba(29, 185, 84, 0.9)"
                : "rgba(30,30,30,0.85)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: showSidebar
                ? "rgba(29, 185, 84, 0.5)"
                : "rgba(255,255,255,0.1)",
            }}
          >
            <Ionicons
              name={showSidebar ? "list" : "list-outline"}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>

          {/* Fermer */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.75}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(30,30,30,0.85)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── BOUTON DE RÉSERVATION FLOTTANT ── */}
        {selectedAreas.length > 0 && (
          <View
            style={{
              position: "absolute",
              bottom: 32,
              left: showSidebar ? SIDEBAR_WIDTH + 16 : 16,
              right: 16,
              zIndex: 20,
            }}
          >
            <TouchableOpacity
              onPress={handleReserve}
              activeOpacity={0.85}
              disabled={isProcessing}
              style={{
                backgroundColor: "#1DB954",
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: "#1DB954",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.45,
                shadowRadius: 12,
                elevation: 10,
              }}
            >
              <View>
                <Text style={{ color: "rgba(0,0,0,0.6)", fontSize: 11, fontWeight: "600" }}>
                  {selectedAreas.length} place{selectedAreas.length > 1 ? "s" : ""} sélectionnée{selectedAreas.length > 1 ? "s" : ""}
                </Text>
                <Text style={{ color: "#000", fontSize: 20, fontWeight: "800" }}>
                  ${totalPrice.toFixed(2)}
                </Text>
              </View>

              {isProcessing ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: "rgba(0,0,0,0.12)",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: "#000", fontSize: 15, fontWeight: "800" }}>
                    RÉSERVER
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#000" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

      </GestureHandlerRootView>
    </Modal>
  );
};

export default FloorPlanModal;