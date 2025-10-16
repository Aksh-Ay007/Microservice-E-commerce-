import { Metadata } from "next";
import axiosInstance from "../../../../utils/axiosinstance";
import SellerProfile from "../../../../shared/modules/seller/seller-profile";

// ✅ Corrected spelling
async function fetchSellerDetails(id: string) {
  const res = await axiosInstance.get(`/seller/api/get-seller/${id}`);

  return res.data;
}

// ✅ Dynamic metadata generator
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params; // ✅ Await params before use
  const data = await fetchSellerDetails(id);

  const shop = data?.shop;

  return {
    title: `${shop?.name || "Seller"} | MicroMart Marketplace`,
    description:
      shop?.bio ||
      "Explore a wide range of products from various sellers on MicroMart Marketplace. Shop now for the best deals and quality items!",
    openGraph: {
      title: `${shop?.name || "Seller"} | MicroMart Marketplace`,
      description:
        shop?.bio ||
        "Explore products and services from trusted sellers on MicroMart Marketplace.",
      type: "website",
      images: [
        {
          url:
            shop?.avatar ||
            "https://ik.imagekit.io/AkshayMicroMart/photo/selleravatar.jpg",
          width: 800,
          height: 600,
          alt: shop?.name || "MicroMart Marketplace",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${shop?.name || "Seller"} | MicroMart Marketplace`,
      description:
        shop?.bio ||
        "Explore products and services from trusted sellers on MicroMart Marketplace.",
      images: [
        shop?.avatar ||
          "https://ik.imagekit.io/AkshayMicroMart/photo/selleravatar.jpg",
      ],
    },
  };
}

// ✅ Page component
const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params; // ✅ Await params here too
  const data = await fetchSellerDetails(id);

  if (!data || !data.shop) {
    return (
      <div className="p-10 text-center text-gray-600">
        Seller not found or data unavailable.
      </div>
    );
  }

  return (
    <div>
      <SellerProfile shop={data.shop} followersCount={data.followersCount} />
    </div>
  );
};

export default Page;
