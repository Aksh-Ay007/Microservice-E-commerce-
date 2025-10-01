import Image from 'next/image';
import Link from 'next/link';

const ProductCard = ({
  product,
  isEvent,
}: {
  product: any;
  isEvent?: boolean;
}) => {

   const imageUrl =
     product?.images?.[0]?.url ||
     "https://www.freemockupworld.com/wp-content/uploads/2022/11/Free-Packaging-Product-Box-Mockup-01.jpg";

     console.log(imageUrl,'imageUrl');

  return (
    <div className="w-full min-h-[350px] h-max bg-white rounded-lg relative">
      {isEvent && (
        <div className="absolute top-2 left-2 bg-red-600 text-white  text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          OFFER
        </div>
      )}
      {product?.stock <= 5 && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-slate-700   text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          HURRY! ONLY {product?.stock} LEFT
        </div>
      )}

      <Link href={`/product/${product?.slug}`}>
        <Image
          src={imageUrl}
          alt={product?.title || "Product Image"}
          width={300}
          height={300} // ✅ added height to keep aspect ratio
          className="object-cover rounded-md"
          priority // ✅ only if above the fold
        />

      </Link>
    </div>
  );
};

export default ProductCard;
