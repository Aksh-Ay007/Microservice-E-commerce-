import { PlusCircleIcon, Trash2 } from "lucide-react";
import { Controller, useFieldArray } from "react-hook-form";
import Input from "../input";

const CustomSpecifications = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "custom_specifications",
  });

  return (
    <div>
      <label className="block font-semibold text-gray-300 mb-1">
        CustomSpecifications
      </label>
      <div className="flex flex-col gap-3">
        {fields?.map((item, index) => (
          <div key={item.id} className="flex gap-2 items-center">
            <Controller
              name={`custom_specifications.${index}.name`}
              control={control}
              rules={{ required: "specification name is required" }}
              render={({ field }) => (
                <Input
                  label="specification Name"
                  placeholder="e.g:Ram ,Battery Life"
                  {...field}
                />
              )}
            />

            <Controller
              name={`custom_specifications.${index}.value`}
              control={control}
              rules={{ required: "Value is required" }}
              render={({ field }) => (
                <Input
                  label="Value"
                  placeholder="e.g: 16gb,4000mah"
                  {...field}
                />
              )}
            />

            <button
              type="button"
              className="text-red-500 hover:text-red-700"
              onClick={() => remove(index)}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        <button
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
          onClick={() => append({ name: "", value: "" })}
        >

          <PlusCircleIcon size={20}/>
          Add Specification

        </button>
      </div>

      {errors?.custom_specifications &&(
         <p className='text-red-500 text-xs mt-1'>{errors?.custom_specifications?.message}</p>
      )}

    </div>
  );
};

export default CustomSpecifications;
