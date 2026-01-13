import { mockProducts } from "@/lib/mockData";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useProduct = (productId: string) => {
  const result = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: async () => {
      // Simuler un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 300));
      const product = mockProducts.find((p) => p._id === productId);
      if (!product) {
        throw new Error("Product not found");
      }
      return product;
    },
    enabled: !!productId,
  });

  return result;
};
