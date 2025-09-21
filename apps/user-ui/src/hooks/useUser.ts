
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosinstance";

//fetch user data from API

const fetchUser = async () => {
  try {
    const response = await axiosInstance.get("/api/logged-in-user");
    return response.data.user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
};

const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return { user, isLoading, isError, refetch, error };
};

export default useUser;
