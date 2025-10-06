import { Metadata } from "next";
import axiosInstance from "../../../../utils/axiosinstance";
import ProductDetails from '../../../../shared/modules/product/product-details';



async function fetchProductDetails(slug: string) {
  const res = await axiosInstance.get(`/product/api/get-product/${slug}`);

  console.log(res.data.product);


  return res.data.product;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await fetchProductDetails(params.slug);
  return {
    title: `${product?.title} | MicroCart MarketPlace`,
    description:
      product?.short_description ||
      "Discover high quality product on MicroCart MarketPlace",

    openGraph: {
      title: product?.title,
      description: product?.short_description || "",
      images: [product?.images?.[0]?.url || "/logo.png"],
      siteName: "MicroCart MarketPlace",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product?.short_description || "",
      images: [product?.images?.[0]?.url || "/logo.png"],
    },
  };
}

const Page = async ({ params }: { params: { slug: string } }) => {
  const productDetails = await fetchProductDetails(params?.slug);


  return <ProductDetails productDetails={productDetails} />;
};

export default Page;
