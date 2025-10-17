import { Metadata } from "next";
import axiosInstance from "../../../../utils/axiosinstance";
import SellerProfile from "../../../../shared/modules/seller/seller-profile";

async function fetchSellerDetails(id: string) {
  const res = await axiosInstance.get(`/seller/api/get-seller/${id}`);
  return res.data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const data = await fetchSellerDetails(id);
    const shop = data?.shop;

    // ✅ Access avatar and banner URLs from the nested objects
    const avatarUrl =
      data?.avatarUrl ||
      shop?.avatar?.url ||
      "https://ik.imagekit.io/AkshayMicroMart/photo/selleravatar.jpg";
    const bannerUrl =
      data?.bannerUrl ||
      shop?.coverBanner?.url ||
      "https://ik.imagekit.io/AkshayMicroMart/photo/sellerbanner.jpg";

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
            url: avatarUrl,
            width: 1200,
            height: 630,
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
        images: [avatarUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Seller | MicroMart Marketplace",
      description: "Explore products from sellers on MicroMart Marketplace",
    };
  }
}

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const data = await fetchSellerDetails(id);

  if (!data || !data.shop) {
    return (
      <div className="p-10 text-center text-gray-600">
        Seller not found or data unavailable.
      </div>
    );
  }

  // ✅ Use bannerUrl in the component
  return (
    <div>
      <SellerProfile
        shop={data.shop}
        followersCount={data.followersCount}
        avatarUrl={data.avatarUrl}
        bannerUrl={data.bannerUrl}
      />
    </div>
  );
};

export default Page;
