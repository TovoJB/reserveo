import FloorPlanModal from "@/components/FloorPlanModal";
import SafeScreen from "@/components/SafeScreen";
import useCart from "@/hooks/useCart";
import { useProduct } from "@/hooks/useProduct";
import useWishlist from "@/hooks/useWishlist";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isError, isLoading } = useProduct(id);
  const { addToCart, isAddingToCart } = useCart();

  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } =
    useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFloorPlan, setShowFloorPlan] = useState(false);

  const handleReserve = () => {
    if (!product) return;
    setShowFloorPlan(true);
  };

  const handleConfirmReservation = (selectedAreas: any[]) => {
    if (!product) return;

    addToCart(
      { productId: product._id, quantity: selectedAreas.length },
      {
        onSuccess: () => {
          Alert.alert("Réservation confirmée", `${selectedAreas.length} zone(s) réservée(s) !`);
          setShowFloorPlan(false);
        },
        onError: (error: any) => {
          Alert.alert("Erreur", error?.response?.data?.error || "Échec de la réservation");
        },
      }
    );
  };

  const getAvailabilityIcon = (category: string) => {
    if (category.toLowerCase().includes("coworking")) return "desktop-outline";
    if (category.toLowerCase().includes("event") || category.toLowerCase().includes("hall"))
      return "restaurant-outline";
    if (category.toLowerCase().includes("meeting")) return "business-outline";
    if (category.toLowerCase().includes("airbnb")) return "home-outline";
    if (category.toLowerCase().includes("hotel")) return "bed-outline";
    return "cube-outline";
  };

  if (isLoading) return <LoadingUI />;
  if (isError || !product) return <ErrorUI />;

  const inStock = product.stock > 0;

  return (
    <SafeScreen>
      {/* HEADER */}
      <View className="absolute top-0 left-0 right-0 z-10 px-6 pt-20 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          className="bg-black/50 backdrop-blur-xl w-12 h-12 rounded-full items-center justify-center"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          className={`w-12 h-12 rounded-full items-center justify-center ${isInWishlist(product._id) ? "bg-primary" : "bg-black/50 backdrop-blur-xl"
            }`}
          onPress={() => toggleWishlist(product._id)}
          disabled={isAddingToWishlist || isRemovingFromWishlist}
          activeOpacity={0.7}
        >
          {isAddingToWishlist || isRemovingFromWishlist ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons
              name={isInWishlist(product._id) ? "heart" : "heart-outline"}
              size={24}
              color={isInWishlist(product._id) ? "#121212" : "#FFFFFF"}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        *
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {product.images.map((image: string, index: number) => (
              <View key={index} style={{ width }}>
                <Image source={image} style={{ width, height: 400 }} contentFit="cover" />
              </View>
            ))}
          </ScrollView>


          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
            {product.images.map((_: any, index: number) => (
              <View
                key={index}
                className={`h-2 rounded-full ${index === selectedImageIndex ? "bg-primary w-6" : "bg-white/50 w-2"
                  }`}
              />
            ))}
          </View>
        </View>


        <View className="p-6">

          <View className="flex-row items-center mb-3">
            <View className="bg-primary/20 px-3 py-1 rounded-full">
              <Text className="text-primary text-xs font-bold">{product.category}</Text>
            </View>
          </View>


          <Text className="text-text-primary text-3xl font-bold mb-3">{product.name}</Text>

          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center bg-surface px-3 py-2 rounded-full">
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text className="text-text-primary font-bold ml-1 mr-2">
                {product.averageRating.toFixed(1)}
              </Text>
              <Text className="text-text-secondary text-sm">({product.totalReviews} reviews)</Text>
            </View>
            {inStock ? (
              <View className="ml-3 flex-row items-center bg-primary/10 px-3 py-1.5 rounded-full">
                <Ionicons name={getAvailabilityIcon(product.category)} size={16} color="#1DB954" />
                <Text className="text-primary font-semibold text-sm ml-2">
                  {product.stock} disponible{product.stock > 1 ? "s" : ""}
                </Text>
              </View>
            ) : (
              <View className="ml-3 flex-row items-center">
                <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                <Text className="text-red-500 font-semibold text-sm">Complet</Text>
              </View>
            )}
          </View>


          <View className="flex-row items-center mb-6">
            <Text className="text-primary text-4xl font-bold">${product.price.toFixed(2)}</Text>
          </View>


          <View className="mb-6">
            <Text className="text-text-primary text-lg font-bold mb-3">Disponibilité</Text>

            <View className="bg-surface rounded-2xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name={getAvailabilityIcon(product.category)} size={24} color="#1DB954" />
                  <View className="ml-3">
                    <Text className="text-text-primary font-semibold text-base">
                      {product.stock} {product.category.toLowerCase().includes("coworking") ? "bureaux" :
                        product.category.toLowerCase().includes("event") || product.category.toLowerCase().includes("hall") ? "tables" :
                          product.category.toLowerCase().includes("meeting") ? "salles" : "unités"} disponibles
                    </Text>
                    <Text className="text-text-secondary text-sm mt-1">
                      Sélectionnez vos places sur le plan
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>


          <View className="mb-8">
            <Text className="text-text-primary text-lg font-bold mb-3">Description</Text>
            <Text className="text-text-secondary text-base leading-6">{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-surface px-6 py-4 pb-8">
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <Text className="text-text-secondary text-sm mb-1">À partir de</Text>
            <Text className="text-primary text-2xl font-bold">
              ${product.price.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            className={`rounded-2xl px-8 py-4 flex-row items-center ${!inStock ? "bg-surface" : "bg-primary"
              }`}
            activeOpacity={0.8}
            onPress={handleReserve}
            disabled={!inStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color="#121212" />
            ) : (
              <>
                <Ionicons name="calendar" size={24} color={!inStock ? "#666" : "#121212"} />
                <Text
                  className={`font-bold text-lg ml-2 ${!inStock ? "text-text-secondary" : "text-background"
                    }`}
                >
                  {!inStock ? "Complet" : "Réserver"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {product && (
        <FloorPlanModal
          visible={showFloorPlan}
          onClose={() => setShowFloorPlan(false)}
          product={product}
          onReserve={handleConfirmReservation}
          isProcessing={isAddingToCart}
        />
      )}
    </SafeScreen>
  );
};

export default ProductDetailScreen;

function ErrorUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text className="text-text-primary font-semibold text-xl mt-4">Product not found</Text>
        <Text className="text-text-secondary text-center mt-2">
          This product may have been removed or doesn&apos;t exist
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-2xl px-6 py-3 mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-background font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

function LoadingUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1DB954" />
        <Text className="text-text-secondary mt-4">Loading product...</Text>
      </View>
    </SafeScreen>
  );
}
