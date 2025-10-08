"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

const ShippingAddressSection = () => {
  const [showModal, setShowModal] = useState(false);

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
      Zip: "",
      Country: "India",
      isDefault: false,
    },
  });

  return <div>ShippingAddressSection</div>;
};

export default ShippingAddressSection;
