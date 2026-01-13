import { getInitialCart, mockProducts } from "@/lib/mockData";
import { Cart, CartItem } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useCart = () => {
  const queryClient = useQueryClient();

  const {
    data: cart,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      // Simuler un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getInitialCart();
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const currentCart = queryClient.getQueryData<Cart>(["cart"]) || getInitialCart();
      const product = mockProducts.find((p) => p._id === productId);
      
      if (!product) {
        throw new Error("Product not found");
      }

      const existingItemIndex = currentCart.items.findIndex(
        (item) => item.product._id === productId
      );

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        newItems = [...currentCart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + (quantity || 1),
        };
      } else {
        newItems = [
          ...currentCart.items,
          {
            _id: `cart-item-${Date.now()}`,
            product,
            quantity: quantity || 1,
          },
        ];
      }

      const updatedCart: Cart = {
        ...currentCart,
        items: newItems,
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(["cart"], updatedCart);
      return updatedCart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const currentCart = queryClient.getQueryData<Cart>(["cart"]) || getInitialCart();
      
      const newItems = currentCart.items.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      );

      const updatedCart: Cart = {
        ...currentCart,
        items: newItems,
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(["cart"], updatedCart);
      return updatedCart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const currentCart = queryClient.getQueryData<Cart>(["cart"]) || getInitialCart();
      
      const newItems = currentCart.items.filter((item) => item.product._id !== productId);

      const updatedCart: Cart = {
        ...currentCart,
        items: newItems,
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(["cart"], updatedCart);
      return updatedCart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const updatedCart = getInitialCart();
      queryClient.setQueryData(["cart"], updatedCart);
      return updatedCart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const cartTotal =
    cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) ?? 0;

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return {
    cart,
    isLoading,
    isError,
    cartTotal,
    cartItemCount,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
    isClearing: clearCartMutation.isPending,
  };
};
export default useCart;
