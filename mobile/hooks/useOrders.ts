import { mockOrders } from "@/lib/mockData";
import { Order } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useOrders = () => {
  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      // Simuler un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockOrders;
    },
  });
};
