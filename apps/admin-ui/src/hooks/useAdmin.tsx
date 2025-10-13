import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import axiosInstance from "../utils/axiosinstance";

//fetch user data from API

const fetchAdmin = async () => {
  const response = await axiosInstance.get("/api/logged-in-admin");
  return response.data.user;
};

const useAdmin = () => {
  const {
    data: admin,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin"],
    queryFn: () => fetchAdmin(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  const history = useRouter();

  useEffect(() => {
    if (!isLoading && !admin) {
      history.push("/");
    }
  }, [admin, isLoading]);

  return { admin, isLoading, isError, refetch };
};

export default useAdmin;
