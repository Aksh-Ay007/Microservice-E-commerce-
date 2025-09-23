import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import Input from "../input";

const CustomProperties = ({ control, errors }: any) => {
  const [properties, setProperties] = useState<
    { label: string; values: string[]; newValue?: string }[]
  >([]);

  const [newLabel, setNewLabel] = useState("");

  return (
    <div>
      <div className="flex flex-col gap-3">
        <Controller
          name="customProperties"
          control={control}
          render={({ field }) => {
            // ✅ useEffect must be at top-level, not inside render
            useEffect(() => {
              field.onChange(properties);
            }, [properties]);

            const addProperty = () => {
              if (!newLabel.trim()) return;
              setProperties([
                ...properties,
                { label: newLabel, values: [], newValue: "" },
              ]);
              setNewLabel("");
            };

            const addValue = (index: number) => {
              const updated = [...properties];
              const val = updated[index].newValue?.trim();
              if (!val) return;

              updated[index].values.push(val);
              updated[index].newValue = "";
              setProperties(updated);
            };

            const removeProperty = (index: number) => {
              setProperties(properties.filter((_, i) => i !== index));
            };

            const updateNewValue = (index: number, val: string) => {
              const updated = [...properties];
              updated[index].newValue = val;
              setProperties(updated);
            };

            return (
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Custom Properties
                </label>

                <div className="flex flex-col gap-3">
                  {/* Existing properties */}
                  {properties.map((property, index) => (
                    <div
                      key={index}
                      className="border border-gray-700 p-3 rounded-lg bg-gray-900"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          {property.label}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeProperty(index)}
                        >
                          <X size={18} className="text-red-500" />
                        </button>
                      </div>

                      {/* Add value */}
                      <div className="flex items-center mt-2 gap-2">
                        <input
                          type="text"
                          className="border outline-none border-gray-700 bg-gray-800 p-2 rounded-md text-white w-full"
                          placeholder="Enter value.."
                          value={property.newValue || ""}
                          onChange={(e) =>
                            updateNewValue(index, e.target.value)
                          }
                        />
                        <button
                          type="button"
                          className="px-3 py-1 bg-blue-500 text-white rounded-md"
                          onClick={() => addValue(index)}
                        >
                          Add
                        </button>
                      </div>

                      {/* Show values */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {property.values.map((value, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Add new property */}
                  <div className="flex items-center mt-1 gap-2">
                    <Input
                      placeholder="Enter property label (e.g., Material, Color, Warranty)"
                      value={newLabel}
                      onChange={(e: any) => setNewLabel(e.target.value)}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 bg-blue-500 text-white rounded-md flex items-center"
                      onClick={addProperty}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {errors?.customProperties && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors?.customProperties?.message as string}
                  </p>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default CustomProperties;
