import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosinstance";

const fetchLayout = async () => {
  const res = await axiosInstance.get("/api/get-layout");
  return res.data.layout;
};

const useLayout = () => {
  const {
    data: layout,
    isPending: isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["layout"],
    queryFn: fetchLayout,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
  return { layout, isLoading, isError, refetch };
};

export default useLayout;
