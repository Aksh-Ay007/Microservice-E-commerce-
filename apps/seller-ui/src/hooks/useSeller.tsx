// File: hooks/useSeller.ts
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosinstance";

//fetch seller data from API
const fetchSeller = async () => {
  try {
    const response = await axiosInstance.get("/api/logged-in-seller");
    console.log(response, "seller ui data from login seller");
    return response.data.seller;
  } catch (error) {
    console.error("Failed to fetch seller:", error);
    throw error;
  }
};

const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
    error,
  } = useQuery({
    queryKey: ["seller"],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5, // Store data for 5 min
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // Only run query if we're likely to have a seller token
    enabled: typeof window !== "undefined",
  });

  return { seller, isLoading, isError, refetch, error };
};

export default useSeller;
