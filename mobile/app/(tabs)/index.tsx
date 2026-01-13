import InvitationModal from "@/components/InvitationModal";
import ProductsGrid from "@/components/ProductsGrid";
import SafeScreen from "@/components/SafeScreen";
import useProducts from "@/hooks/useProducts";

import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const CATEGORIES = [
  { name: "All", icon: "grid-outline" as const },
  { name: "Coworking Space", image: require("@/assets/images/coworking.png") },
  { name: "Event Hall", image: require("@/assets/images/event.png") },
  { name: "Airbnb", image: require("@/assets/images/books.png") },
  { name: "Hotel Room", image: require("@/assets/images/books.png") },
  { name: "Meeting Room", image: require("@/assets/images/sports.png") },
  { name: "FabLab", image: require("@/assets/images/books.png") },
];

const AreasScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [invitationModalVisible, setInvitationModalVisible] = useState(false);

  const { data: products, isLoading, isError } = useProducts();

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // filtering by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // filtering by searh query
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View className="px-6 pb-4 pt-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-text-primary text-3xl font-bold tracking-tight">Areas</Text>
              <Text className="text-text-secondary text-sm mt-1">Browse all areas</Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="bg-surface/50 p-3 rounded-full"
                activeOpacity={0.7}
                onPress={() => setInvitationModalVisible(true)}
              >
                <Ionicons name="qr-code" size={22} color={"#fff"} />
              </TouchableOpacity>
              <TouchableOpacity className="bg-surface/50 p-3 rounded-full" activeOpacity={0.7}>
                <Ionicons name="notifications-outline" size={22} color={"#fff"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* SEARCH BAR */}
          <View className="bg-surface flex-row items-center px-5 py-4 rounded-2xl">
            <Ionicons color={"#666"} size={22} name="search" />
            <TextInput
              placeholder="Search for areas"
              placeholderTextColor={"#666"}
              className="flex-1 ml-3 text-base text-text-primary"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* CATEGORY FILTER */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.name;
              return (
                <TouchableOpacity
                  key={category.name}
                  onPress={() => setSelectedCategory(category.name)}
                  className={`mr-3 rounded-2xl size-20 overflow-hidden items-center justify-center ${isSelected ? "bg-primary" : "bg-surface"}`}
                >
                  {category.icon ? (
                    <Ionicons
                      name={category.icon}
                      size={36}
                      color={isSelected ? "#121212" : "#fff"}
                    />
                  ) : (
                    <Image source={category.image} className="size-12" resizeMode="contain" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-lg font-bold">
              {selectedCategory === "All" ? "All Areas" : selectedCategory}
            </Text>
            <Text className="text-text-secondary text-sm">{filteredProducts.length} items</Text>
          </View>

          {/* PRODUCTS GRID */}
          <ProductsGrid products={filteredProducts} isLoading={isLoading} isError={isError} />
        </View>
      </ScrollView>

      <InvitationModal
        visible={invitationModalVisible}
        onClose={() => setInvitationModalVisible(false)}
        onCodeSubmit={(code) => {
          // Simuler la validation du code d'invitation
          Alert.alert(
            "Code validé",
            `Code d'invitation "${code}" accepté ! Vous avez maintenant accès à cet événement.`,
            [{ text: "OK", onPress: () => setInvitationModalVisible(false) }]
          );
        }}
      />
    </SafeScreen>
  );
};

export default AreasScreen;
