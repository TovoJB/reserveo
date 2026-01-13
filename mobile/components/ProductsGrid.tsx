import FloorPlanModal from "@/components/FloorPlanModal";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProductsGridProps {
  isLoading: boolean;
  isError: boolean;
  products: Product[];
}

const ProductsGrid = ({ products, isLoading, isError }: ProductsGridProps) => {
  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } =
    useWishlist();

  const { isAddingToCart, addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFloorPlan, setShowFloorPlan] = useState(false);

  const handleReserve = (product: Product) => {
    setSelectedProduct(product);
    setShowFloorPlan(true);
  };

  const handleConfirmReservation = (selectedAreas: any[]) => {
    if (!selectedProduct) return;
    
    addToCart(
      { productId: selectedProduct._id, quantity: selectedAreas.length },
      {
        onSuccess: () => {
          Alert.alert("Réservation confirmée", `${selectedAreas.length} zone(s) réservée(s) !`);
          setShowFloorPlan(false);
          setSelectedProduct(null);
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

  const renderProduct = ({ item: product }: { item: Product }) => (
    <TouchableOpacity
      className="bg-surface rounded-3xl overflow-hidden mb-3"
      style={{ width: "48%" }}
      activeOpacity={0.8}
      onPress={() => router.push(`/product/${product._id}`)}
    >
      <View className="relative">
        <Image
          source={{ uri: product.images[0] }}
          className="w-full h-44 bg-background-lighter"
          resizeMode="cover"
        />

        <TouchableOpacity
          className="absolute top-3 right-3 bg-black/30 backdrop-blur-xl p-2 rounded-full"
          activeOpacity={0.7}
          onPress={() => toggleWishlist(product._id)}
          disabled={isAddingToWishlist || isRemovingFromWishlist}
        >
          {isAddingToWishlist || isRemovingFromWishlist ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons
              name={isInWishlist(product._id) ? "heart" : "heart-outline"}
              size={18}
              color={isInWishlist(product._id) ? "#FF6B6B" : "#FFFFFF"}
            />
          )}
        </TouchableOpacity>
      </View>

      <View className="p-3">
        <Text className="text-text-secondary text-xs mb-1">{product.category}</Text>
        <Text className="text-text-primary font-bold text-sm mb-2" numberOfLines={2}>
          {product.name}
        </Text>

        <View className="flex-row items-center mb-2">
          <Ionicons name="star" size={12} color="#FFC107" />
          <Text className="text-text-primary text-xs font-semibold ml-1">
            {product.averageRating.toFixed(1)}
          </Text>
          <Text className="text-text-secondary text-xs ml-1">({product.totalReviews})</Text>
        </View>

        {/* Availability */}
        <View className="flex-row items-center mb-3">
          <View className="flex-row items-center bg-primary/10 px-2 py-1 rounded-full">
            <Ionicons name={getAvailabilityIcon(product.category)} size={14} color="#1DB954" />
            <Text className="text-primary font-semibold text-xs ml-1.5">
              {product.stock} disponible{product.stock > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-primary font-bold text-lg">${product.price.toFixed(2)}</Text>

          <TouchableOpacity
            className="bg-primary rounded-full px-4 py-2 flex-row items-center"
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              handleReserve(product);
            }}
            disabled={product.stock === 0}
          >
            <Ionicons name="calendar-outline" size={16} color="#121212" />
            <Text className="text-background font-bold text-sm ml-1.5">
              Réserver
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text className="text-text-secondary mt-4">Loading products...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="py-20 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text className="text-text-primary font-semibold mt-4">Failed to load products</Text>
        <Text className="text-text-secondary text-sm mt-2">Please try again later</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListEmptyComponent={NoProductsFound}
      />
      {selectedProduct && (
        <FloorPlanModal
          visible={showFloorPlan}
          onClose={() => {
            setShowFloorPlan(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onReserve={handleConfirmReservation}
          isProcessing={isAddingToCart}
        />
      )}
    </>
  );
};

export default ProductsGrid;

function NoProductsFound() {
  return (
    <View className="py-20 items-center justify-center">
      <Ionicons name="search-outline" size={48} color={"#666"} />
      <Text className="text-text-primary font-semibold mt-4">No products found</Text>
      <Text className="text-text-secondary text-sm mt-2">Try adjusting your filters</Text>
    </View>
  );
}
