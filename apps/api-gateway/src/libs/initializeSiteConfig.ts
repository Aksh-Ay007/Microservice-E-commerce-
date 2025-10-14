import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();

    if (!existingConfig) {
      const subCategories = {
        Electronics: ["Mobiles", "Laptops", "Accessories", "Gaming"],
        Fashion: ["Men", "Women", "Kids", "Footwear"],
        "Home & Kitchen": ["Furniture", "Appliances", "Decor"],
        "Sports & Fitness": ["Gym Equipment", "Outdoor Sports", "Wearables"],
      };

      await prisma.site_config.create({
        data: {
          categories: [
            "Electronics",
            "Fashion",
            "Home & Kitchen",
            "Sports & Fitness",
          ],
          subCategories,
          logo: "https://ik.imagekit.io/AkshayMicroMart/photo/micromartLogo.png?updatedAt=1759960829231",
          banner:
            "https://ik.imagekit.io/AkshayMicroMart/photo/purchasing-shop-buying-selling-teade.jpg?updatedAt=1760433499210",
        },
      });

      console.log("✅ Site configuration initialized successfully!");
    } else {
      console.log("ℹ️ Site configuration already exists.");
    }
  } catch (error) {
    console.error("❌ Error initializing site configuration:", error);
  } finally {
    await prisma.$disconnect();
  }
};

export default initializeSiteConfig;
