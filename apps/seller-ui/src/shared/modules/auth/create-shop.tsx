import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { shopCategories } from '../../../utils/categories';

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };

  const countWords = (text: string) => text.trim().split(/\s+/).length;

  return (
    <div className="text-white">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup new Shop
        </h3>
        {/* Name */}
        <label className="block text-gray-300 mb-1">Name *</label>
        <input
          type="text"
          placeholder="Akshay"
          className="w-full p-3 border border-gray-700 bg-transparent text-white rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           outline-none transition"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
        )}

        {/* Bio */}
        <label className="block text-gray-300 mb-1 mt-3">
          Bio (Max 100 words) *
        </label>

        <input
          type="text"
          placeholder="shp bio.."
          className="w-full p-3 border border-gray-700 bg-transparent text-white rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           outline-none transition"
          {...register("bio", {
            required: "bio is required",

            validate: (value) =>
              countWords(value) <= 100 || "Bio can't exceed 100 words",
          })}
        />

        {errors.bio && (
          <p className="text-red-500 text-sm mt-1">
            {String(errors.bio.message)}
          </p>
        )}

        {/* Address */}
        <label className="block text-gray-300 mb-1">Address *</label>
        <input
          type="text"
          placeholder="shop location.."
          className="w-full p-3 border border-gray-700 bg-transparent text-white rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           outline-none transition"
          {...register("address", { required: "shop Address is required" })}
        />
        {errors.address && (
          <p className="text-red-500 text-sm">
            {String(errors.address.message)}
          </p>
        )}

        {/* shop opening address */}
        <label className="block text-gray-300 mb-1">Opening Hours *</label>
        <input
          type="text"
          placeholder="e.g.,Mon-Fri 9Am-6Am"
          className="w-full p-3 border border-gray-700 bg-transparent text-white rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           outline-none transition"
          {...register("opening_hours", {
            required: "opening hours are required",
          })}
        />
        {errors.opening_hours && (
          <p className="text-red-500 text-sm">
            {String(errors.opening_hours.message)}
          </p>
        )}

        {/* website address */}
        <label className="block text-gray-300 mb-1">Website *</label>
        <input
          type="text"
          placeholder="https://example.com"
          className="w-full p-3 border border-gray-700 bg-transparent text-white rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           outline-none transition"
          {...register("website", {
            pattern: {
              value: /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
              message: "Enter a Invalid URL",
            },
          })}
        />
        {errors.website && (
          <p className="text-red-500 text-sm">
            {String(errors.website.message)}
          </p>
        )}

        {/* categories */}
        <label className="block text-gray-300 mb-1">Category *</label>
        <select
          className="w-full p-2 border border-gray-700 bg-transparent text-white outline-0 rounded-[4px] mb-1"
          {...register("category", {
            required: "Category is required",
          })}
        >
          <option value="">Select a Category</option>
          {shopCategories.map((category) => (
            <option key={category.value} value={category.value} className="bg-black">
              {category.label}
            </option>
          ))}
        </select>

        {errors.category && (
          <p className="text-red-500 text-sm">
            {String(errors.category.message)}
          </p>
        )}

<button  type={"submit"} className='w-full text-lg bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mt-4'>
  Create

</button>

      </form>
    </div>
  );
};

export default CreateShop;
