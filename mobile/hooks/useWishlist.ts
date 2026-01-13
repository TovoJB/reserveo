import { mockProducts } from "@/lib/mockData";
import { Product } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useWishlist = () => {
  const queryClient = useQueryClient();

  const {
    data: wishlist,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      // Simuler un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Retourner une wishlist vide initialement
      return [] as Product[];
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const currentWishlist = queryClient.getQueryData<Product[]>(["wishlist"]) || [];
      const product = mockProducts.find((p) => p._id === productId);
      
      if (!product) {
        throw new Error("Product not found");
      }

      if (currentWishlist.some((p) => p._id === productId)) {
        return currentWishlist;
      }

      const updatedWishlist = [...currentWishlist, product];
      queryClient.setQueryData(["wishlist"], updatedWishlist);
      return updatedWishlist;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const currentWishlist = queryClient.getQueryData<Product[]>(["wishlist"]) || [];
      
      const updatedWishlist = currentWishlist.filter((p) => p._id !== productId);
      queryClient.setQueryData(["wishlist"], updatedWishlist);
      return updatedWishlist;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const isInWishlist = (productId: string) => {
    return wishlist?.some((product) => product._id === productId) ?? false;
  };

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      addToWishlistMutation.mutate(productId);
    }
  };

  return {
    wishlist: wishlist || [],
    isLoading,
    isError,
    wishlistCount: wishlist?.length || 0,
    isInWishlist,
    toggleWishlist,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    isAddingToWishlist: addToWishlistMutation.isPending,
    isRemovingFromWishlist: removeFromWishlistMutation.isPending,
  };
};

export default useWishlist;
