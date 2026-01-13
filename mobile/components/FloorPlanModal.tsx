import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SelectableArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  available: boolean;
  capacity: number;
}

interface FloorPlanModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product;
  onReserve: (selectedAreas: SelectableArea[]) => void;
  isProcessing?: boolean;
}

const SIDEBAR_WIDTH = 300;
const PLAN_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;

const FloorPlanModal = ({
  visible,
  onClose,
  product,
  onReserve,
  isProcessing = false,
}: FloorPlanModalProps) => {
  const [selectedAreas, setSelectedAreas] = useState<SelectableArea[]>([]);
  const [focusedArea, setFocusedArea] = useState<string | null>(null);
  
  // Animation pour le zoom et pan
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Générer des zones fictives
  const generateAreas = (): SelectableArea[] => {
    const areas: SelectableArea[] = [];
    const category = product.category.toLowerCase();

    if (category.includes("coworking")) {
      for (let i = 0; i < Math.min(product.stock, 12); i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        areas.push({
          id: `desk-${i + 1}`,
          name: `Bureau ${i + 1}`,
          x: 10 + col * 22,
          y: 20 + row * 25,
          width: 18,
          height: 20,
          available: Math.random() > 0.3,
          capacity: 1,
        });
      }
    } else if (category.includes("event") || category.includes("hall")) {
      for (let i = 0; i < Math.min(product.stock, 8); i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        areas.push({
          id: `table-${i + 1}`,
          name: `Table ${i + 1}`,
          x: 8 + col * 22,
          y: 15 + row * 35,
          width: 20,
          height: 30,
          available: Math.random() > 0.2,
          capacity: 8,
        });
      }
    } else if (category.includes("meeting")) {
      for (let i = 0; i < Math.min(product.stock, 6); i++) {
        const row = Math.floor(i / 3);
        const col = i % 3;
        areas.push({
          id: `room-${i + 1}`,
          name: `Salle ${i + 1}`,
          x: 5 + col * 30,
          y: 10 + row * 40,
          width: 28,
          height: 35,
          available: Math.random() > 0.25,
          capacity: 10,
        });
      }
    } else {
      for (let i = 0; i < Math.min(product.stock, 10); i++) {
        const row = Math.floor(i / 5);
        const col = i % 5;
        areas.push({
          id: `unit-${i + 1}`,
          name: `Unité ${i + 1}`,
          x: 5 + col * 18,
          y: 10 + row * 40,
          width: 16,
          height: 35,
          available: Math.random() > 0.3,
          capacity: category.includes("airbnb") ? 4 : 2,
        });
      }
    }

    return areas;
  };

  const areas = generateAreas();
  const availableAreas = areas.filter((a) => a.available);

  // Basculer la sélection
  const toggleArea = (area: SelectableArea) => {
    if (!area.available) return;

    setSelectedAreas((prev) => {
      const exists = prev.find((a) => a.id === area.id);
      if (exists) {
        return prev.filter((a) => a.id !== area.id);
      } else {
        return [...prev, area];
      }
    });
  };

  // Focuser sur une zone
  const focusOnArea = (area: SelectableArea) => {
    setFocusedArea(area.id);

    // Centrer sur la zone
    const centerX = -(area.x / 100) * PLAN_WIDTH + PLAN_WIDTH / 2;
    const centerY = -(area.y / 100) * SCREEN_HEIGHT + SCREEN_HEIGHT / 2;

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: centerX,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: centerY,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1.5,
        useNativeDriver: true,
      }),
    ]).start();

    // Retirer le focus après 2s
    setTimeout(() => setFocusedArea(null), 2000);
  };

  // Zoom in/out
  const handleZoomIn = () => {
    Animated.spring(scale, {
      toValue: Math.min((scale as any)._value + 0.3, 3),
      useNativeDriver: true,
    }).start();
  };

  const handleZoomOut = () => {
    Animated.spring(scale, {
      toValue: Math.max((scale as any)._value - 0.3, 0.5),
      useNativeDriver: true,
    }).start();
  };

  // Réinitialiser la vue
  const resetView = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  // Pan responder pour déplacer l'image
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const handleReserve = () => {
    if (selectedAreas.length === 0) {
      Alert.alert("Sélection requise", "Veuillez sélectionner au moins une zone");
      return;
    }
    onReserve(selectedAreas);
  };

  const getAreaIcon = (category: string) => {
    if (category.toLowerCase().includes("coworking")) return "desktop-outline";
    if (category.toLowerCase().includes("event") || category.toLowerCase().includes("hall"))
      return "restaurant-outline";
    if (category.toLowerCase().includes("meeting")) return "business-outline";
    return "cube-outline";
  };

  const totalPrice = selectedAreas.reduce((sum) => sum + product.price, 0);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background flex-row">
        {/* PANNEAU LATÉRAL - Liste des places */}
        <View className="bg-surface border-r border-gray-700" style={{ width: SIDEBAR_WIDTH }}>
          {/* Header */}
          <View className="px-4 pt-16 pb-4 border-b border-gray-700">
            <Text className="text-text-primary text-xl font-bold">{product.name}</Text>
            <Text className="text-text-secondary text-xs mt-1">Sélectionnez vos places</Text>

            {/* Stats */}
            <View className="flex-row items-center gap-2 mt-3">
              <View className="bg-primary/20 px-3 py-1.5 rounded-full">
                <Text className="text-primary font-semibold text-xs">
                  {availableAreas.length} dispos
                </Text>
              </View>
              {selectedAreas.length > 0 && (
                <View className="bg-blue-500/20 px-3 py-1.5 rounded-full">
                  <Text className="text-blue-400 font-semibold text-xs">
                    {selectedAreas.length} sélectionné{selectedAreas.length > 1 ? "s" : ""}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Liste scrollable */}
          <ScrollView className="flex-1 px-4 py-3" showsVerticalScrollIndicator={false}>
            {areas.map((area) => {
              const isSelected = selectedAreas.some((a) => a.id === area.id);
              const isFocused = focusedArea === area.id;

              return (
                <TouchableOpacity
                  key={area.id}
                  onPress={() => toggleArea(area)}
                  disabled={!area.available}
                  className={`mb-2 p-3 rounded-xl border-2 ${
                    !area.available
                      ? "bg-gray-700/50 border-gray-600 opacity-50"
                      : isSelected
                        ? "bg-primary/20 border-primary"
                        : "bg-surface border-gray-600"
                  } ${isFocused ? "scale-105" : ""}`}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Ionicons
                          name="location"
                          size={14}
                          color={area.available ? "#1DB954" : "#666"}
                        />
                        <Text
                          className={`font-semibold text-sm ${
                            area.available ? "text-text-primary" : "text-gray-500"
                          }`}
                        >
                          {area.name}
                        </Text>
                        {isSelected && <Ionicons name="checkmark-circle" size={16} color="#1DB954" />}
                      </View>
                      <Text className="text-text-secondary text-xs mt-1">
                        Capacité: {area.capacity} pers.
                      </Text>
                      <Text
                        className={`text-xs mt-1 font-semibold ${
                          area.available ? "text-primary" : "text-red-400"
                        }`}
                      >
                        {area.available ? `$${product.price}` : "Occupé"}
                      </Text>
                    </View>

                    {area.available && (
                      <TouchableOpacity
                        onPress={() => focusOnArea(area)}
                        className="bg-blue-500/20 p-2 rounded-lg ml-2"
                      >
                        <Ionicons name="eye" size={16} color="#3B82F6" />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Légende */}
          <View className="p-4 border-t border-gray-700">
            <Text className="text-text-primary font-bold text-xs mb-2">Légende</Text>
            <View className="gap-1">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-primary/60 rounded mr-2" />
                <Text className="text-text-secondary text-xs">Disponible</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-primary rounded mr-2" />
                <Text className="text-text-secondary text-xs">Sélectionné</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-red-500/30 rounded mr-2" />
                <Text className="text-text-secondary text-xs">Occupé</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ZONE PRINCIPALE - Plan plein écran */}
        <View className="flex-1 bg-background">
          {/* Header avec contrôles */}
          <View className="absolute top-0 left-0 right-0 z-10 bg-background/95 px-4 pt-12 pb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={handleZoomIn}
                className="bg-surface p-2 rounded-lg"
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleZoomOut}
                className="bg-surface p-2 rounded-lg"
              >
                <Ionicons name="remove" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetView}
                className="bg-surface px-3 py-2 rounded-lg"
              >
                <Text className="text-text-primary text-xs font-semibold">Réinitialiser</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={onClose} className="bg-surface p-2 rounded-lg">
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Plan avec zones interactives */}
          <View className="flex-1 items-center justify-center">
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                width: PLAN_WIDTH,
                height: SCREEN_HEIGHT * 0.8,
                transform: [{ scale }, { translateX }, { translateY }],
              }}
            >
              <Image
                source={require("@/assets/images/floorplan.jpg")}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />

              {/* Overlay avec zones */}
              <View className="absolute inset-0">
                {areas.map((area) => {
                  const isSelected = selectedAreas.some((a) => a.id === area.id);
                  const isFocused = focusedArea === area.id;

                  return (
                    <TouchableOpacity
                      key={area.id}
                      onPress={() => toggleArea(area)}
                      disabled={!area.available}
                      style={{
                        position: "absolute",
                        left: `${area.x}%`,
                        top: `${area.y}%`,
                        width: `${area.width}%`,
                        height: `${area.height}%`,
                        backgroundColor: isSelected
                          ? "rgba(29, 185, 84, 0.6)"
                          : area.available
                            ? "rgba(29, 185, 84, 0.2)"
                            : "rgba(239, 68, 68, 0.3)",
                        borderWidth: 2,
                        borderColor: isSelected
                          ? "#1DB954"
                          : area.available
                            ? "rgba(29, 185, 84, 0.5)"
                            : "#EF4444",
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: isFocused ? 1 : 0.9,
                        transform: [{ scale: isFocused ? 1.1 : 1 }],
                      }}
                    >
                      <Ionicons
                        name={getAreaIcon(product.category)}
                        size={18}
                        color={area.available ? "#FFFFFF" : "#999"}
                      />
                      <Text className="text-white font-bold text-xs mt-1">
                        {area.name}
                      </Text>
                      {!area.available && (
                        <Text className="text-red-300 text-xs">Occupé</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </View>

          {/* Bouton flottant de réservation */}
          {selectedAreas.length > 0 && (
            <View className="absolute bottom-6 left-0 right-0 items-center z-20">
              <View className="bg-white rounded-2xl shadow-2xl p-4 flex-row items-center mx-4">
                <View className="flex-1">
                  <Text className="text-gray-600 text-xs">Total sélectionné</Text>
                  <Text className="text-primary text-2xl font-bold">
                    ${totalPrice.toFixed(2)}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {selectedAreas.length} place{selectedAreas.length > 1 ? "s" : ""}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleReserve}
                  disabled={isProcessing}
                  className="bg-primary rounded-xl px-6 py-3 flex-row items-center"
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#121212" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#121212" />
                      <Text className="text-background font-bold text-base ml-2">
                        Réserver ({selectedAreas.length})
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Instructions */}
          {selectedAreas.length === 0 && (
            <View className="absolute bottom-6 left-0 right-0 items-center z-10">
              <View className="bg-surface/90 px-6 py-3 rounded-full mx-4">
                <Text className="text-text-primary text-xs text-center">
                  👆 Cliquez sur le plan ou utilisez la liste
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default FloorPlanModal;