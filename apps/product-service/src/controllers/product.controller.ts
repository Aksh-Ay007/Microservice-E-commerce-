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
    starting_date: string; // Crucial for defining an event
    ending_date: string; // Crucial for defining an event
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
      return next(new NotFoundError("Unauthorized access!"));
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
      title, short_description, detailed_description, slug, tags, category,
      stock, sale_price, regular_price, subCategory, starting_date, ending_date,
      // Destructure other optional fields with defaults to satisfy the products model
      warranty, custom_specifications = {}, cash_on_delivery, brand, video_url,
      colors = [], sizes = [], discountCodes = [], customProperties = {},
      images = [], // Pass empty array if not used by the frontend
    } = req.body;

    // 1. Validation: Ensure all event-specific fields and base product fields are present
    if (
      !title || !short_description || !slug || !category || !subCategory ||
      !stock || !sale_price || !tags || !regular_price ||
      !starting_date || !ending_date // Crucial checks for an Event
    ) {
      return next(new ValidationError("Please fill all required fields, including event start and end dates!"));
    }

    // 2. Authorization & Slug Check
    if (!req.seller?.shop?.id) {
      return next(new AuthError("Only a shop owner can create events! Unauthorized access."));
    }
    const slugChecking = await prisma.products.findUnique({
      where: { slug },
    });
    if (slugChecking) {
      return next(new ValidationError("Slug already exists! Please use a different slug."));
    }

    // 3. Create Event-Product
    const newEvent = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId: req.seller.shop.id,
        tags: Array.isArray(tags) ? tags : String(tags).split(",").map(t => t.trim()).filter(Boolean),
        brand,
        video_url,
        category,
        subCategory,
        colors: colors,
        discount_codes: discountCodes,
        sizes: sizes,
        stock: parseInt(String(stock)),
        sale_price: parseFloat(String(sale_price)),
        regular_price: parseFloat(String(regular_price)),
        custom_properties: customProperties,
        custom_specifications: custom_specifications,
        starting_date: new Date(starting_date), // Persist event dates
        ending_date: new Date(ending_date),     // Persist event dates
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
      message: "Event created successfully",
      newEvent,
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
          ending_date: true // Used to verify it's an event
      },
    });

    // 1. Validation: Check if event exists AND has event dates
    if (!event || !event.starting_date || !event.ending_date) {
      return next(new NotFoundError("Event not found or invalid type."));
    }

    // 2. Authorization: Check shop ownership
    if (event.shopId !== shopId) {
      return next(new AuthError("Unauthorized access! Event belongs to a different shop."));
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
