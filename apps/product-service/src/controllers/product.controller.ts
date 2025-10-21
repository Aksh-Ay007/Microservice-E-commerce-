import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "../../../../packages/error-handler";
import { imagekit } from "./../../../../packages/libs/imagekit/index";

interface EventRequest extends Request {
  seller: {
    id: string;
    shop: {
      id: string;
    };
  };
  body: {
    productId: string; // NEW: Add this line
    title: string;
    short_description: string;
    detailed_description?: string;
    warranty?: string;
    custom_specifications?: any;
    slug: string;
    tags: string[] | string;
    cash_on_delivery?: string;
    brand?: string;
    video_url?: string;
    category: string;
    colors?: string[];
    sizes?: string[];
    discountCodes?: string[];
    stock: string | number;
    sale_price: string | number;
    regular_price: string | number;
    subCategory: string;
    customProperties?: any;
    images?: Array<{ fileId: string; file_url: string }>;
    starting_date: string;
    ending_date: string;
  };
  params: {
    eventId: string;
    slug: string;
  };
}

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();
    if (!config) {
      return res.status(404).json({ message: "Categories not found" });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

//create discount codes

export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: {
        discountCode,
      },
    });

    if (isDiscountCodeExist) {
      return next(
        new ValidationError(
          "Discount code already available please use a differnt code!"
        )
      );
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id,
      },
    });

    res.status(201).json({
      success: true,
      discount_code,
    });
  } catch (error) {
    return next(error);
  }
};

//get discount code
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.seller || !req.seller.id) {
      return next(new AuthError("Unauthorized access. Seller not found"));
    }

    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
    });

    res.status(201).json({
      success: true,
      discount_codes,
    });
  } catch (error) {
    return next(error);
  }
};

//delete discountCodes

export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: {
        id: true,
        sellerId: true,
      },
    });

    if (!discountCode) {
      return next(new NotFoundError("Discount code not found"));
    }

    if (discountCode.sellerId !== sellerId) {
      // return next(new NotFoundError("Unauthorized access!"));
      return next(new AuthError("Unauthorized access!"));
    }

    await prisma.discount_codes.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Discount code deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//upload product image

export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;

    const response = await imagekit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: "/products",
    });

    res.status(201).json({
      file_url: response.url,
      fileId: response.fileId,
    });
  } catch (error) {
    next(error);
  }
};

//delete product image

export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;

    const response = await imagekit.deleteFile(fileId);

    res.status(201).json({
      success: true,
      message: "Image deleted successfully",
      response,
    });
  } catch (error) {
    next(error);
  }
};

//create Product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties = {},
      images = [],
    } = req.body;

    if (
      !title ||
      !short_description ||
      !slug ||
      !category ||
      !subCategory ||
      !stock ||
      !sale_price ||
      !tags ||
      !regular_price ||
      !images
    ) {
      return next(new ValidationError("Please fill all required fields!"));
    }

    if (!req.seller.id) {
      return next(
        new AuthError("Only seller can create products!..Unauthorized access!")
      );
    }

    const slugChecking = await prisma.products.findUnique({
      where: {
        slug,
      },
    });

    if (slugChecking) {
      return next(
        new ValidationError("Slug already exist! Please use a different slug")
      );
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId: req?.seller?.shop?.id!,
        tags: Array.isArray(tags) ? tags : tags.split(","),
        brand,
        video_url,
        category,
        subCategory,
        colors: colors || [],
        discount_codes: (discountCodes || []).map((codeId: string) => codeId),
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        custom_properties: customProperties || {},
        custom_specifications: custom_specifications || {},
        images: {
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((img: any) => ({
              file_id: img.fileId,
              url: img.file_url,
            })),
        },
      },
      include: { images: true },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      newProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        shopId: req?.seller?.shop?.id,
      },
      include: { images: true },
    });

    res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

//delete product

export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return next(new ValidationError("Product not found"));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized access!"));
    }

    if (product.isDeleted) {
      return next(new ValidationError("Product is already in deleted state"));
    }

    const deletedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 1000),
      },
    });
    res.status(200).json({
      success: true,
      message:
        "Product is schedule for deletion in 24 hours. You can restore it within this period.",
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    next(error);
  }
};

//restore deleted product
export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });
    if (!product) {
      return next(new ValidationError("Product not found"));
    }
    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized access!"));
    }
    if (!product.isDeleted) {
      return res.status(400).json({
        message: "Product is not in deleted state",
      });
    }

    await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
    res.status(200).json({
      success: true,
      message: "Product restored successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error restoring product",
      error,
    });
  }
};

export const getStripeAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({ message: "Seller ID is required" });
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: { stripeId: true },
    });

    if (!seller?.stripeId) {
      return next(
        new NotFoundError("Stripe account not found for this seller")
      );
    }

    return res.status(200).json({
      stripeAccountId: seller.stripeId,
    });
  } catch (error) {
    next(error);
  }
};

//get all Products

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type;

    const skip = (page - 1) * limit;

    const baseFilter: Prisma.productsWhereInput = {
      isDeleted: false,
      status: "Active",
    };

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === "latest" ? { createdAt: "desc" } : { totalSales: "desc" };

    const [products, total, top10Products] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: { images: true, Shop: true },
        where: baseFilter,
        orderBy,
      }),

      prisma.products.count({ where: baseFilter }),

      prisma.products.findMany({
        take: 10,
        where: baseFilter,
        orderBy,
      }),
    ]);

    res.status(200).json({
      products,
      top10By: type === "latest" ? "latest" : "topSales",
      top10Products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GetAllProducts Error:", error);
    next(error);
  }
};

//get all events

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const skip = (page - 1) * limit;

    const baseFilter = {
      AND: [
        {
          starting_date: {
            not: null,
          },
        },
        {
          ending_date: {
            not: null,
          },
        },
      ],
    };

    const [events, total, top10BySales] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: { images: true, Shop: true },
        where: baseFilter,
        orderBy: { totalSales: "desc" },
      }),

      prisma.products.count({ where: baseFilter }),

      prisma.products.findMany({
        take: 10,
        where: baseFilter,
        orderBy: { totalSales: "desc" },
      }),
    ]);

    res.status(200).json({
      events,
      top10BySales,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error });
  }
};

//get product details

export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await prisma.products.findUnique({
      where: { slug: req.params.slug! },
      include: { images: true, Shop: true },
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    return next(error);
  }
};

//get filtered products

export const getFilteredProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 10000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
    };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: { images: true, Shop: true },
      }),
      prisma.products.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

//get filtered offers

export const getFilteredEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 10000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      NOT: {
        starting_date: null,
      },
    };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: { images: true, Shop: true },
      }),
      prisma.products.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

//get filtered shops

export const getFilteredShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (categories && String(categories).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (countries && String(countries).length > 0) {
      filters.country = {
        in: Array.isArray(countries) ? countries : String(countries).split(","),
      };
    }

    const [shops, total] = await Promise.all([
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: { sellers: true, followers: true, products: true },
      }),
      prisma.shops.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      shops,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

//serach products

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const products = await prisma.products.findMany({
      where: {
        isDeleted: false,
        status: "Active",
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            short_description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ products });
  } catch (error) {
    return next(error);
  }
};

//top shop

export const topShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //aggreagate total sales per shop from orders

    const topShopsData = await prisma.orders.groupBy({
      by: ["shopId"],
      _sum: {
        total: true,
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: 10,
    });

    //fetch corresponding shop details

    const shopIds = topShopsData.map((item) => item.shopId);

    const shops = await prisma.shops.findMany({
      where: {
        id: { in: shopIds },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        coverBanner: true,
        address: true,
        ratings: true,
        followers: true,
        category: true,
      },
    });

    //merge sales with shop data

    const enrichedShops = shops.map((shop) => {
      const salesData = topShopsData.find((data) => data.shopId === shop.id);

      return {
        ...shop,
        totalSales: salesData?._sum.total || 0,
      };
    });

    const top10Shops = enrichedShops
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    return res.status(200).json({ shops: top10Shops });
  } catch (error) {
    console.log(error, "top shop error");

    return next(error);
  }
};

export const createEvent = async (
  req: EventRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      productId, // NEW: The product to create event for
      title,
      short_description,
      detailed_description,
      slug,
      tags,
      category,
      stock,
      sale_price,
      regular_price,
      subCategory,
      starting_date,
      ending_date,
      warranty,
      custom_specifications = {},
      cash_on_delivery,
      brand,
      video_url,
      colors = [],
      sizes = [],
      discountCodes = [],
      customProperties = {},
      images = [],
    } = req.body;

    // 1. Validation
    if (
      !productId ||
      !title ||
      !short_description ||
      !slug ||
      !category ||
      !subCategory ||
      !stock ||
      !sale_price ||
      !tags ||
      !regular_price ||
      !starting_date ||
      !ending_date
    ) {
      return next(
        new ValidationError(
          "Please fill all required fields, including product selection and event dates!"
        )
      );
    }

    // 2. Authorization
    if (!req.seller?.shop?.id) {
      return next(
        new AuthError(
          "Only a shop owner can create events! Unauthorized access."
        )
      );
    }

    // 3. Verify product exists and belongs to seller
    const originalProduct = await prisma.products.findFirst({
      where: {
        id: productId,
        shopId: req.seller.shop.id,
        isDeleted: false,
      },
      include: { images: true },
    });

    if (!originalProduct) {
      return next(
        new NotFoundError("Product not found or doesn't belong to your shop")
      );
    }

    // 4. Slug Check
    const slugChecking = await prisma.products.findUnique({
      where: { slug },
    });
    if (slugChecking) {
      return next(
        new ValidationError("Slug already exists! Please use a different slug.")
      );
    }

    // 5. Use product images if no images provided
    const eventImages =
      images.length > 0
        ? images
        : originalProduct.images.map((img) => ({
            fileId: img.file_id,
            file_url: img.url,
          }));

    // 6. Create Event (as a new product with event dates)
    const newEvent = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description:
          detailed_description || originalProduct.detailed_description,
        warranty: warranty || originalProduct.warranty,
        cashOnDelivery: cash_on_delivery || originalProduct.cashOnDelivery,
        slug,
        shopId: req.seller.shop.id,
        tags: Array.isArray(tags)
          ? tags
          : String(tags)
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
        brand: brand || originalProduct.brand,
        video_url: video_url || originalProduct.video_url,
        category,
        subCategory,
        colors: colors.length > 0 ? colors : originalProduct.colors,
        discount_codes: discountCodes,
        sizes: sizes.length > 0 ? sizes : originalProduct.sizes,
        stock: parseInt(String(stock)),
        sale_price: parseFloat(String(sale_price)),
        regular_price: parseFloat(String(regular_price)),
        custom_properties: customProperties,
        custom_specifications: custom_specifications,
        starting_date: new Date(starting_date),
        ending_date: new Date(ending_date),
        images: {
          create: eventImages
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((img: any) => ({
              file_id: img.fileId,
              url: img.file_url,
            })),
        },
      },
      include: { images: true },
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      newEvent,
      originalProduct: {
        id: originalProduct.id,
        title: originalProduct.title,
      },
    });
  } catch (error) {
    next(error);
  }
};


// ----------------------------------------------------------------------
// GET SHOP EVENTS (filters products model)
// ----------------------------------------------------------------------
export const getShopEvents = async (
  req: EventRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.seller?.shop?.id) {
      return next(new AuthError("Unauthorized access. Shop not found."));
    }

    // Filters: Get products from the shop that have both dates defined
    const events = await prisma.products.findMany({
      where: {
        shopId: req.seller.shop.id,
        starting_date: { not: null },
        ending_date: { not: null },
      },
      include: { images: true },
    });

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------------------------
// DELETE EVENT (marks product as deleted and verifies it's an event)
// ----------------------------------------------------------------------
export const deleteEvent = async (
  req: EventRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { eventId } = req.params;
    const shopId = req.seller?.shop?.id;

    const event = await prisma.products.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        shopId: true,
        isDeleted: true,
        starting_date: true,
        ending_date: true, // Used to verify it's an event
      },
    });

    // 1. Validation: Check if event exists AND has event dates
    if (!event || !event.starting_date || !event.ending_date) {
      return next(new NotFoundError("Event not found or invalid type."));
    }

    // 2. Authorization: Check shop ownership
    if (event.shopId !== shopId) {
      return next(
        new AuthError("Unauthorized access! Event belongs to a different shop.")
      );
    }

    // 3. Soft Delete
    const deletedEvent = await prisma.products.update({
      where: { id: eventId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    res.status(200).json({
      success: true,
      message: "Event is scheduled for deletion in 24 hours.",
      deletedAt: deletedEvent.deletedAt,
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------------------------
// GET EVENT DETAILS (gets single event by slug and verifies it's an event)
// ----------------------------------------------------------------------
export const getEventDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = await prisma.products.findUnique({
      where: {
        slug: req.params.slug!,
        // Filter to ensure it is treated as an event
        starting_date: { not: null },
        ending_date: { not: null },
      },
      include: { images: true, Shop: true },
    });

    if (!event) {
      return next(new NotFoundError("Event not found."));
    }

    return res.status(200).json({ success: true, event });
  } catch (error) {
    return next(error);
  }
};

// ==================== RATING FUNCTIONS ====================

// Create Rating
export const createRating = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, rating, review, title, orderId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AuthError("User authentication required"));
    }

    if (!productId || !rating || rating < 1 || rating > 5) {
      return next(
        new ValidationError("Product ID and valid rating (1-5) are required")
      );
    }

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return next(new NotFoundError("Product not found"));
    }

    // Check if user already rated this product
    const existingRating = await prisma.ratings.findFirst({
      where: { productId, userId },
    });

    if (existingRating) {
      return next(new ValidationError("You have already rated this product"));
    }

    // Create new rating (no images)
    const newRating = await prisma.ratings.create({
      data: {
        productId,
        userId,
        rating: parseInt(rating),
        review: review || "",
        title: title || "",
        images: [], // Empty array, no images
        orderId: orderId || null,
        isVerified: !!orderId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update product rating stats
    await updateProductRatingStats(productId);

    res.status(201).json({
      success: true,
      message: "Rating submitted successfully",
      rating: newRating,
    });
  } catch (error) {
    next(error);
  }
};

// Get Product Ratings
export const getProductRatings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const rating = req.query.rating
      ? parseInt(req.query.rating as string)
      : undefined;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    const skip = (page - 1) * limit;

    const whereClause: any = { productId };
    if (rating) {
      whereClause.rating = rating;
    }

    const [ratings, total] = await Promise.all([
      prisma.ratings.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.ratings.count({ where: whereClause }),
    ]);

    res.status(200).json({
      success: true,
      ratings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Rating Statistics
export const getRatingStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    const stats = await prisma.ratings.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { rating: true },
    });

    const totalRatings = await prisma.ratings.count({
      where: { productId },
    });

    const averageResult = await prisma.ratings.aggregate({
      where: { productId },
      _avg: { rating: true },
    });

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    stats.forEach((stat) => {
      ratingDistribution[stat.rating as keyof typeof ratingDistribution] =
        stat._count.rating;
    });

    res.status(200).json({
      success: true,
      totalRatings,
      averageRating: averageResult._avg.rating || 0,
      ratingDistribution,
    });
  } catch (error) {
    next(error);
  }
};

// Update Rating
export const updateRating = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { rating, review, title, images } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AuthError("User authentication required"));
    }

    const existingRating = await prisma.ratings.findFirst({
      where: { id, userId },
    });

    if (!existingRating) {
      return next(
        new NotFoundError(
          "Rating not found or you are not authorized to update it"
        )
      );
    }

    const updatedRating = await prisma.ratings.update({
      where: { id },
      data: {
        rating: rating ? parseInt(rating) : undefined,
        review: review !== undefined ? review : undefined,
        title: title !== undefined ? title : undefined,
        images: images !== undefined ? images : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update product rating stats
    await updateProductRatingStats(existingRating.productId);

    res.status(200).json({
      success: true,
      message: "Rating updated successfully",
      rating: updatedRating,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Rating
export const deleteRating = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AuthError("User authentication required"));
    }

    const existingRating = await prisma.ratings.findFirst({
      where: { id, userId },
    });

    if (!existingRating) {
      return next(
        new NotFoundError(
          "Rating not found or you are not authorized to delete it"
        )
      );
    }

    const productId = existingRating.productId;
    await prisma.ratings.delete({ where: { id } });

    // Update product rating stats
    await updateProductRatingStats(productId);

    res.status(200).json({
      success: true,
      message: "Rating deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update product rating stats
const updateProductRatingStats = async (productId: string) => {
  try {
    const stats = await prisma.ratings.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.products.update({
      where: { id: productId },
      data: {
        averageRating: stats._avg.rating || 0,
        totalRatings: stats._count.rating || 0,
      },
    });
  } catch (error) {
    console.error("Error updating product rating stats:", error);
  }
};

export const getAvailableCouponsForCart = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart } = req.body as { cart: Array<any> };

    // Return empty if no cart provided
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(200).json({ success: true, coupons: [] });
    }

    // Extract valid product IDs from cart
    const productIds = Array.from(
      new Set(
        cart
          .map((item: any) => item?.id)
          .filter((id: unknown) => typeof id === "string" && !!id)
      )
    );

    if (productIds.length === 0) {
      return res.status(200).json({ success: true, coupons: [] });
    }

    // Fetch products with their discount codes
    const products = await prisma.products.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        title: true,
        discount_codes: true,
        sale_price: true,
      },
    });

    // Collect all unique discount code IDs
    const discountCodeIds = Array.from(
      new Set(
        products.flatMap((p) =>
          Array.isArray(p.discount_codes) ? p.discount_codes : []
        )
      )
    );

    if (discountCodeIds.length === 0) {
      return res.status(200).json({ success: true, coupons: [] });
    }

    // Fetch discount code details
    const discounts = await prisma.discount_codes.findMany({
      where: { id: { in: discountCodeIds } },
      select: {
        id: true,
        public_name: true,
        discountType: true,
        discountValue: true,
        discountCode: true,
      },
    });

    // Map products to their applicable discount codes
    const productIdToTitle = new Map(products.map((p) => [p.id, p.title]));
    const codeIdToProductInfo = new Map<
      string,
      Array<{ id: string; title: string }>
    >(discounts.map((d) => [d.id, []]));

    for (const product of products) {
      const codes = product.discount_codes as string[];
      if (!Array.isArray(codes)) continue;

      for (const codeId of codes) {
        if (!codeIdToProductInfo.has(codeId)) continue;
        const list = codeIdToProductInfo.get(codeId)!;
        list.push({
          id: product.id,
          title: productIdToTitle.get(product.id) || product.id,
        });
      }
    }

    // Format response
    const coupons = discounts.map((d) => ({
      id: d.id,
      publicName: d.public_name,
      discountType: d.discountType,
      discountValue: d.discountValue,
      code: d.discountCode,
      applicableProducts:
        codeIdToProductInfo.get(d.id)?.map((p) => p.title) || [],
    }));

    res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Error fetching available coupons:", error);
    return next(error);
  }
};
