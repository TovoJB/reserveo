import { mockAddresses } from "@/lib/mockData";
import { Address } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAddresses = () => {
  const queryClient = useQueryClient();

  const {
    data: addresses,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      // Simuler un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockAddresses;
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (addressData: Omit<Address, "_id">) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const currentAddresses = queryClient.getQueryData<Address[]>(["addresses"]) || mockAddresses;
      
      const newAddress: Address = {
        ...addressData,
        _id: `addr-${Date.now()}`,
      };

      const updatedAddresses = [...currentAddresses, newAddress];
      queryClient.setQueryData(["addresses"], updatedAddresses);
      return updatedAddresses;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({
      addressId,
      addressData,
    }: {
      addressId: string;
      addressData: Partial<Address>;
    }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const currentAddresses = queryClient.getQueryData<Address[]>(["addresses"]) || mockAddresses;
      
      const updatedAddresses = currentAddresses.map((addr) =>
        addr._id === addressId ? { ...addr, ...addressData } : addr
      );

      queryClient.setQueryData(["addresses"], updatedAddresses);
      return updatedAddresses;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const currentAddresses = queryClient.getQueryData<Address[]>(["addresses"]) || mockAddresses;
      
      const updatedAddresses = currentAddresses.filter((addr) => addr._id !== addressId);
      queryClient.setQueryData(["addresses"], updatedAddresses);
      return updatedAddresses;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  return {
    addresses: addresses || [],
    isLoading,
    isError,
    addAddress: addAddressMutation.mutate,
    updateAddress: updateAddressMutation.mutate,
    deleteAddress: deleteAddressMutation.mutate,
    isAddingAddress: addAddressMutation.isPending,
    isUpdatingAddress: updateAddressMutation.isPending,
    isDeletingAddress: deleteAddressMutation.isPending,
  };
};
