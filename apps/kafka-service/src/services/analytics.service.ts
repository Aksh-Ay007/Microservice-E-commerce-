import prisma from "@packages/libs/prisma";

/**
 * Updates user analytics based on events.
 */
export const updateUserAnalytics = async (event: any) => {
  try {
    if (!event.userId) {
      console.warn("Missing userId in event:", event);
      return;
    }

    // Fetch existing user analytics
    const existingData = await prisma.userAnalytics.findUnique({
      where: { userId: event.userId },
    });

    let updatedActions: any[] = existingData?.actions || [];

    // Check if this action already exists
    const actionExists = updatedActions.some(
      (entry: any) =>
        entry.productId === event.productId && entry.action === event.action
    );

    // Add actions based on event type
    if (event.action === "product_view") {
      updatedActions.push({
        productId: event.productId,
        shopId: event.shopId,
        action: "product_view",
        timestamp: new Date(),
      });
    } else if (
      ["add_to_cart", "add_to_wishlist"].includes(event.action) &&
      !actionExists
    ) {
      updatedActions.push({
        productId: event.productId,
        shopId: event.shopId,
        action: event.action,
        timestamp: new Date(),
      });
    } else if (event.action === "remove_from_cart") {
      updatedActions = updatedActions.filter(
        (entry) =>
          !(
            entry.productId === event.productId &&
            entry.action === "add_to_cart"
          )
      );
    } else if (event.action === "remove_from_wishlist") {
      updatedActions = updatedActions.filter(
        (entry) =>
          !(
            entry.productId === event.productId &&
            entry.action === "add_to_wishlist"
          )
      );
    }

    // Keep last 100 actions only
    if (updatedActions.length > 100) {
      updatedActions = updatedActions.slice(-100);
    }

    const extraFields: Record<string, any> = {};
    if (event.country) extraFields.country = event.country;
    if (event.city) extraFields.city = event.city;
    if (event.device) extraFields.device = event.device;

    // Upsert user analytics
    const result = await prisma.userAnalytics.upsert({
      where: { userId: event.userId },
      update: {
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
      create: {
        userId: event.userId,
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
    });

    console.log("✅ User analytics updated:", result);

    // Update product analytics
    await updateProductAnalytics(event);
  } catch (error) {
    console.error("Error updating user analytics:", error);
  }
};

/**
 * Updates product analytics based on events.
 */
export const updateProductAnalytics = async (event: any) => {
  try {
    if (!event.productId) return;

    const updateFields: any = {};

    if (event.action === "product_view") updateFields.views = { increment: 1 };
    if (event.action === "add_to_cart")
      updateFields.cartAdds = { increment: 1 };
    if (event.action === "remove_from_cart")
      updateFields.cartAdds = { decrement: 1 };
    if (event.action === "add_to_wishlist")
      updateFields.wishListAdds = { increment: 1 };
    if (event.action === "remove_from_wishlist")
      updateFields.wishListAdds = { decrement: 1 };
    if (event.action === "purchase") updateFields.purchases = { increment: 1 };

    const result = await prisma.productAnalytics.upsert({
      where: { productId: event.productId },
      update: {
        lastViewedAt: new Date(),
        ...updateFields,
      },
      create: {
        productId: event.productId,
        shopId: event.shopId || null,
        views: event.action === "product_view" ? 1 : 0,
        cartAdds: event.action === "add_to_cart" ? 1 : 0,
        wishListAdds: event.action === "add_to_wishlist" ? 1 : 0,
        purchases: event.action === "purchase" ? 1 : 0,
        lastViewedAt: new Date(),
      },
    });

    console.log("✅ Product analytics updated:", result);
  } catch (error) {
    console.error("Error updating product analytics:", error);
  }
};
