import { mockProducts } from "@/lib/mockData";
import { useQuery } from "@tanstack/react-query";

const useProducts = () => {
  const result = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // Simuler un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockProducts;
    },
  });

  return result;
};

export default useProducts;
