"use client";

import { useQuery } from "@tanstack/react-query";
import Breadcrumbs from "../../../shared/components/breadcrumbs";
import axiosInstance from "../../../utils/axiosinstance";

const Notifications = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/get-all-notifications");
      return res.data.notifications;
    },
  });

  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl font-semibold mb-2">Notifications</h2>
      <Breadcrumbs title="Notifications" />
      {!isLoading && data?.length === 0 && (
        <p className="text-center pt-24 text-white text-sm font-Poppins">
          No Notifications available Yet
        </p>
      )}

      {!isLoading && data?.length > 0 && (
        <div className="w-full text gray 200">
          {data.map((d: any) => (
            <div className="w-full p-4 border-b border-gray-800" key={d.id}>
              <span>{d.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
