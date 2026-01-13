import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateReviewData {
  productId: string;
  orderId: string;
  rating: number;
}

export const useReviews = () => {
  const queryClient = useQueryClient();

  const createReview = useMutation({
    mutationFn: async (data: CreateReviewData) => {
      // Simuler un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Retourner une réponse fictive
      return {
        success: true,
        review: {
          _id: `review-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
        },
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    isCreatingReview: createReview.isPending,
    createReviewAsync: createReview.mutateAsync,
  };
};
