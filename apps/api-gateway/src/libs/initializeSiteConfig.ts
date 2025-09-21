import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();

    if (!existingConfig) {
      const subCategories = {
        "Electronics": ["Mobiles", "Laptops", "Accessories", "Gaming"],
        "Fashion": ["Men", "Women", "Kids", "Footwear"],
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
          subCategories: subCategories,
        },
      });

      console.log("Site configuration initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing site configuration:", error);
  }
};

// Export the function if needed
export default initializeSiteConfig;
