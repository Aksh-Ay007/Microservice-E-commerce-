"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { countries } from "../../../configs/countries/countries";
import axiosInstance from "../../../utils/axiosinstance";

const ShippingAddressSection = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: "Home",
      name: "",
      street: "",
      city: "",
      zip: "",
      country: "India",
      isDefault: "false",
    },
  });

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
  }, [showModal]);

  const { mutate: addAddress } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axiosInstance.post("/api/add-address", payload);
      return res.data.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
      reset();
      setShowModal(false);
    },
  });

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["shipping-addresses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses;
    },
  });

  const onSubmit = (data: any) => {
    addAddress({ ...data, isDefault: data?.isDefault === "true" });
  };

  const { mutate: deleteAddress } = useMutation({
    mutationFn: async (addressId: string) => {
      const res = await axiosInstance.delete(
        `/api/delete-address/${addressId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
    },
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Saved Addresses</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {/* Address List */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-600 text-sm shadow-sm">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading addresses...</p>
        ) : !addresses || addresses.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            No saved addresses found.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address: any) => (
              <div
                key={address.id}
                className={`border rounded-md p-4 relative bg-gray-50 hover:bg-white transition ${
                  address.isDefault ? "border-blue-500" : "border-gray-200"
                }`}
              >
                {address.isDefault && (
                  <span className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}

                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 mt-0.5 text-blue-500 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">
                      {address.label} - {address.name}
                    </p>
                    <p className="text-xs sm:text-sm leading-snug">
                      {address.street}, {address.city}, {address.zip},{" "}
                      {address.country}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => deleteAddress(address.id)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative animate-fadeIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Address
            </h3>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3 text-sm text-gray-700"
            >
              {/* Label */}
              <select
                {...register("label")}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>

              {/* Full Name */}
              <input
                placeholder="Full Name"
                {...register("name", { required: "Name is required" })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}

              {/* Street */}
              <input
                placeholder="Street Address"
                {...register("street", { required: "Street is required" })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.street && (
                <p className="text-xs text-red-500">{errors.street.message}</p>
              )}

              {/* City */}
              <input
                placeholder="City"
                {...register("city", { required: "City is required" })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.city && (
                <p className="text-xs text-red-500">{errors.city.message}</p>
              )}

              {/* ZIP */}
              <input
                placeholder="ZIP / Postal Code"
                {...register("zip", { required: "ZIP is required" })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {errors.zip && (
                <p className="text-xs text-red-500">{errors.zip.message}</p>
              )}

              {/* Country */}
              <select
                {...register("country")}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {countries.map((country) => (
                  <option key={country.name} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>

              {/* Default */}
              <select
                {...register("isDefault")}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="true">Set as Default</option>
                <option value="false">Not Default</option>
              </select>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAddressSection;
