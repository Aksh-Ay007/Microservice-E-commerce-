import { PlusCircleIcon, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import Input from "../input";

const CustomProperties = ({ control, errors }: any) => {
  const [properties, setProperties] = useState<
    { label: string; values: string[] }[]
  >([]);

  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  return (
    <div>
      <div className="flex flex-col gap-3">
        <Controller
          name="customProperties"
          control={control}
          render={({ field }) => {
            useEffect(() => {
              field.onChange(properties);
            }, [properties]);



            const addProperty = () => {
              if (!newLabel.trim()) return;
              setProperties([...properties, { label: newLabel, values: [] }]);
              setNewLabel("");
            };

           const addValue=(index:number)=>{
            if(!newValue.trim()) return;

            const updatedProperties = [...properties];
            updatedProperties[index].values.push(newValue);
            setProperties(updatedProperties);
            setNewValue("");
           }


           const removeProperty=(index:number)=>{

            setProperties(properties.filter((_,i)=>i!==index))

           }



            return (

               <div className='mt-2'>
                <label className='block font-semibold text-gray-300 mb-1'>Custom Properties</label>

                <div className='flex flex-col gap-3'>

                  {/* Exisiting propertiess */}

                {properties.map((property,index)=>(

                   <div key={index} className='border border-gray-700 p-3 rounded-lg bg-gray-900'>
                     <div className='flex items-center justify-between'>
                      <span className='text-white font-medium'>{property.label}</span>

                      <button type="button" onClick={()=>removeProperty(index)}>
                       <X size={18} className='text-red-500'/>

                      </button>
                     </div>

                     {/*Add value to Property  */}

                     <div className='flex items-center mt-2 gap-2'>

                        <input type="text"
                      className='border outline-none border-gray-700 bg-gray-800 p-2 rounded-md text-white w-full'
                      placeholder='Enter value..'
                      value={newValue}
                      onChange={(e)=>setNewValue(e.target.value)}


                        />

                        <button type="button" className='px-3 py-1 bg-blue-500 text-white rounded-md' onClick={()=>addValue(index)}>Add</button>



                     </div>

                     {/* show values */}

                     <div className='flex flex-wrap gap-2 mt-2'>

                        {property.values.map((value,i)=>(

                           <span></span>
                        ))}


                     </div>




                   </div>
                ))}


                </div>

               </div>


            );
          }}
        />

        <Controller
          name={`custom_specifications.${index}.value`}
          control={control}
          rules={{ required: "Value is required" }}
          render={({ field }) => (
            <Input label="Value" placeholder="e.g: 16gb,4000mah" {...field} />
          )}
        />

        <button
          type="button"
          className="text-red-500 hover:text-red-700"
          onClick={() => remove(index)}
        >
          <Trash2 size={20} />
        </button>

        <button
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
          onClick={() => append({ name: "", value: "" })}
        >
          <PlusCircleIcon size={20} />
          Add Specification
        </button>
      </div>

      {errors?.custom_specifications && (
        <p className="text-red-500 text-xs mt-1">
          {errors?.custom_specifications?.message}
        </p>
      )}
    </div>
  );
};

export default CustomProperties;
