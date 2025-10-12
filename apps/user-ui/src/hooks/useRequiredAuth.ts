import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useUser from "./useUser";

const useRequireAuth = () => {
  const router = useRouter();

  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);
  return { user, isLoading };
};

export default useRequireAuth;
