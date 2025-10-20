import { sendEmail } from "../utils/send-email/index";

import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
import Stripe from "stripe";
import {
  NotFoundError,
  ValidationError,
} from "../../../../packages/error-handler";
import redis from "../../../../packages/libs/redis";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

//create pament intent

export const createPaymentIntent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const { amount, sellerStripeAccountId, sessionId } = req.body;

  const customerAmount = Math.round(amount * 100);
  const platFormFee = Math.floor(customerAmount * 0.1);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: "usd",
      payment_method_types: ["card"],
      application_fee_amount: platFormFee,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: { sessionId, userId: req.user?.id },
    });
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

//create payment session

export const createPaymentSession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart, selectedAddressId, coupon } = req.body;
    const userId = req.user?.id;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return next(new ValidationError("cart is empty or invalid"));
    }

    const normalizedCart = JSON.stringify(
      cart
        .map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          sale_price: item.sale_price,
          shopId: item.shopId,
          selectedOptions: item.selectedOptions || {},
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
    );

    const keys = await redis.keys("payment-session:*");

    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.userId === userId) {
          const existingCart = JSON.stringify(
            session.cart
              .map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                sale_price: item.sale_price,
                shopId: item.shopId,
                selectedOptions: item.selectedOptions || {},
              }))
              .sort((a: any, b: any) => a.id.localeCompare(b.id))
          );

          if (existingCart === normalizedCart) {
            return res.status(200).json({ sessionId: key.split(":")[1] });
          } else {
            await redis.del(key);
          }
        }
      }
    }

    //fetch sellers and theire stripe accounts

    const uniqueShopIds = [...new Set(cart.map((item: any) => item.shopId))];

    const shops = await prisma.shops.findMany({
      where: {
        id: { in: uniqueShopIds },
      },
      select: {
        id: true,
        sellerId: true,
        sellers: {
          select: {
            stripeId: true,
          },
        },
      },
    });

    const sellerData = shops.map((shop) => ({
      shopId: shop.id,
      sellerId: shop.sellerId,
      stripeAccountId: shop.sellers.stripeId,
    }));

    //calculate total amount

    const totalAmount = cart.reduce((total: number, item: any) => {
      return total + item.sale_price * item.quantity;
    }, 0);

    //create session payload

    const sessionId = crypto.randomUUID();

    const sessionData = {
      userId,
      cart,
      sellers: sellerData,
      totalAmount,
      shippingAddressId: selectedAddressId || null,
      coupon: coupon || null,
    };

    await redis.setex(
      `payment-session:${sessionId}`,
      600,
      JSON.stringify(sessionData)
    );

    res.status(201).json({ sessionId });
  } catch (error) {
    next(error);
  }
};

//verifying payment session

export const verifyPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.query.sessionId as string;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    //fetch session from redis

    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(404).json({ error: "session not found or expired" });
    }

    //parse and return session

    const session = JSON.parse(sessionData);

    res.status(200).json({ success: true, session });
  } catch (error) {
    return next(error);
  }
};

//create order

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stripeSignature = req.headers["stripe-signature"];

    if (!stripeSignature) {
      return res.status(400).send("stripe signature is missing");
    }

    const rawBody = (req as any).rawBody;
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Handle successful payment
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;

      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        console.warn("Session not found or expired:", sessionId);
        return res
          .status(200)
          .send("Session not found, skipping order creation");
      }

      const { cart, totalAmount, shippingAddressId, coupon } =
        JSON.parse(sessionData);

      const user = await prisma.users.findUnique({ where: { id: userId } });
      const name = user?.name!;
      const email = user?.email!;

      // Group items by shop
      const shopGrouped = cart.reduce((acc: any, item: any) => {
        if (!acc[item.shopId]) acc[item.shopId] = [];
        acc[item.shopId].push(item);
        return acc;
      }, {});

      // Process each shop order
      for (const shopId in shopGrouped) {
        const orderItems = shopGrouped[shopId];
        let orderTotal = orderItems.reduce(
          (sum: number, p: any) => sum + p.quantity * p.sale_price,
          0
        );

        // Apply coupon discount if applicable
        if (
          coupon &&
          coupon.discountedProductId &&
          orderItems.some((item: any) => item.id === coupon.discountedProductId)
        ) {
          const discountedItem = orderItems.find(
            (item: any) => item.id === coupon.discountedProductId
          );

          if (discountedItem) {
            const discount =
              coupon.discountPercent > 0
                ? (discountedItem.sale_price *
                    discountedItem.quantity *
                    coupon.discountPercent) /
                  100
                : coupon.discountAmount;
            orderTotal -= discount;
          }
        }

        // Create Order
        await prisma.orders.create({
          data: {
            userId,
            shopId,
            total: orderTotal,
            status: "Paid",
            shippingAddressId: shippingAddressId || null,
            couponCode: coupon?.code || null,
            discountAmount: coupon?.discountAmount || 0,
            items: {
              create: orderItems.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.sale_price,
                selectedOptions: item.selectedOptions,
              })),
            },
          },
        });

        // Update product stock and analytics
        for (const item of orderItems) {
          const { id: productId, quantity } = item;

          await prisma.products.update({
            where: { id: productId },
            data: {
              stock: { decrement: quantity },
              totalSales: { increment: quantity },
            },
          });

          await prisma.productAnalytics.upsert({
            where: { productId },
            create: {
              productId,
              shopId,
              purchases: quantity,
              lastViewedAt: new Date(),
            },
            update: {
              purchases: { increment: quantity },
            },
          });

          // Update user analytics
          const existingAnalytics = await prisma.userAnalytics.findUnique({
            where: { userId },
          });

          const newAction = {
            productId,
            shopId,
            action: "purchase",
            timestamp: new Date(),
          };

          const currentActions = Array.isArray(existingAnalytics?.actions)
            ? (existingAnalytics.actions as Prisma.JsonArray)
            : [];

          if (existingAnalytics) {
            await prisma.userAnalytics.update({
              where: { userId },
              data: {
                lastVisited: new Date(),
                actions: [...currentActions, newAction],
              },
            });
          } else {
            await prisma.userAnalytics.create({
              data: {
                userId,
                lastVisited: new Date(),
                actions: [newAction],
              },
            });
          }
        }
      }

      // Send order confirmation email
      await sendEmail(
        email,
        "MicroMart Order Confirmation",
        "order-confirmation",
        {
          name,
          cart,
          totalAmount:
            coupon?.discountAmount > 0
              ? totalAmount - coupon.discountAmount
              : totalAmount,
          trackingUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/${sessionId}`,
        }
      );

      // Create notifications for sellers
      const createdShopIds = Object.keys(shopGrouped);
      const sellerShops = await prisma.shops.findMany({
        where: { id: { in: createdShopIds } },
        select: { id: true, sellerId: true, name: true },
      });

      for (const shop of sellerShops) {
        const firstProduct = shopGrouped[shop.id][0];
        const productTitle = firstProduct.title || "new-item";

        await prisma.notifications.create({
          data: {
            title: "New Order Received",
            message: `You have a new order for ${productTitle} in your shop.`,
            creatorId: userId,
            receiverId: shop.sellerId,
            redirect_link: `${process.env.SELLER_FRONTEND_URL || 'http://localhost:3001'}/order/${sessionId}`,
          },
        });
      }

      // Create notification for admin
      await prisma.notifications.create({
        data: {
          title: "Platform Order Alert",
          message: `A new order has been created by ${name}.`,
          creatorId: userId,
          receiverId: "admin",
          redirect_link: `${process.env.ADMIN_FRONTEND_URL || 'http://localhost:3002'}/order/${sessionId}`,
        },
      });

      // Clean up Redis session
      await redis.del(sessionKey);
    }

    // ✅ Respond OK to Stripe
    res.status(200).send({ received: true });
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return next(error);
  }
};

//get sellers orders

//get sellers orders

export const getSellerOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shop = await prisma.shops.findUnique({
      where: {
        sellerId: req.seller.id,
      },
    });

    // ✅ Fix: Check if shop exists before querying orders
    if (!shop) {
      return next(new NotFoundError("Shop not found for this seller"));
    }

    const orders = await prisma.orders.findMany({
      where: { shopId: shop.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        items: true, // Include order items if needed
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    next(error);
  }
};

export const getOrderDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;

    const order = await prisma.orders.findUnique({
      where: { id: orderId },

      include: {
        items: true,
      },
    });

    if (!order) {
      return next(new NotFoundError("Order not found with this id!"));
    }

    const shippingAddress = order.shippingAddressId
      ? await prisma.address.findUnique({
          where: { id: order.shippingAddressId },
        })
      : null;

    const coupon = order.couponCode
      ? await prisma?.discount_codes.findUnique({
          where: { discountCode: order.couponCode },
        })
      : null;

    const productIds = order.items.map((item) => item.productId);

    const products = await prisma.products.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        title: true,
        images: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const items = order.items.map((item) => ({
      ...item,
      selectedOptions: item.selectedOptions,
      product: productMap.get(item.productId) || null,
    }));

    res.status(200).json({
      success: true,
      order: {
        ...order,
        items,
        shippingAddress,
        couponCode: coupon,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus } = req.body;

    if (!orderId || !deliveryStatus) {
      return res
        .status(400)
        .json({ error: "orderId and deliveryStatus are required" });
    }

    const allowedStatuses = [
      "Ordered",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];

    if (!allowedStatuses.includes(deliveryStatus)) {
      return next(new ValidationError("Invalid delivery status"));
    }

    const existingOrder = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return next(new NotFoundError("Order not found with this id!"));
    }

    const updateOrder = await prisma.orders.update({
      where: { id: orderId },
      data: { deliveryStatus, updatedAt: new Date() },
    });

    res.status(200).json({
      success: true,
      order: updateOrder,
    });
  } catch (error) {
    next(error);
  }
};

//verify coupon code

export const verifyCouponCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponCode, cart } = req.body;

    if (!couponCode || !cart || cart.length === 0) {
      return next(new ValidationError("coupon code and cart are required"));
    }

    //fetch discount code

    const discount = await prisma.discount_codes.findUnique({
      where: { discountCode: couponCode },
    });

    if (!discount) {
      return next(new ValidationError("Invalid coupon code"));
    }

    //find matching product that include this discount code

    const matchingProduct = cart.find((item: any) =>
      item.discount_codes?.some((d: any) => d === discount.id)
    );

    if (!matchingProduct) {
      return res.status(200).json({
        success: false,
        discount: 0,
        discountAmount: 0,
        message: "No matching product in cart for this coupon",
      });
    }

    let discountAmount = 0;

    const price = matchingProduct.sale_price * matchingProduct.quantity;

    if (discount.discountType === "percentage") {
      discountAmount = (price * discount.discountValue) / 100;
    } else if (discount.discountType === "flat") {
      discountAmount = discount.discountValue;
    }

    //prevent discount from being greater than total price

    discountAmount = Math.min(discountAmount, price);

    res.status(200).json({
      valid: true,
      discount: discount.discountValue,
      discountAmount: discountAmount.toFixed(2),
      discountedProductId: matchingProduct.id,
      message: "Discount applied to 1 eligible product ",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.orders.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

//getAdmin getUserOrders

export const getAdminOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.orders.findMany({
      include: {
        user: true,
        shop: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({ success: true, orders });

  } catch (error) {
    next(error);
  }
};
