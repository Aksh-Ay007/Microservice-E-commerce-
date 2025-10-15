import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "../../../../packages/error-handler";
import redis from "../../../../packages/libs/redis";
import {
  clearUnseenCount,
  getUnseenCount,
} from "../../../../packages/libs/redis/message.redis";

export const newConversation = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    const userId = req.user.id;

    if (!sellerId) {
      return next(new ValidationError("sellerId is required"));
    }

    const existingGroup = await prisma.conversationGroup.findFirst({
      where: {
        isGroup: false,
        participantIds: {
          hasEvery: [userId, sellerId],
        },
      },
    });

    if (existingGroup) {
      return res
        .status(200)
        .json({ conversation: existingGroup, isNew: false });
    }

    // Create new conversation group
    const newGroup = await prisma.conversationGroup.create({
      data: {
        isGroup: false,
        creatorId: userId,
        participantIds: [userId, sellerId],
      },
    });

    // Fixed: Properly set userId and sellerId in separate records
    await prisma.participant.createMany({
      data: [
        {
          conversationId: newGroup.id,
          userId: userId,
          sellerId: null,
        },
        {
          conversationId: newGroup.id,
          userId: null,
          sellerId: sellerId,
        },
      ],
    });

    res.status(201).json({ conversation: newGroup, isNew: true });
  } catch (error) {
    next(error);
  }
};

export const getUserConversations = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversationGroup.findMany({
      where: {
        OR: [
          {
            participantIds: {
              has: userId,
            },
          },
          {
            creatorId: userId,
          },
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const responseData = await Promise.all(
      conversations.map(async (group: any) => {
        const sellerParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: group.id,
            sellerId: { not: null },
          },
        });

        let seller = null;
        if (sellerParticipant?.sellerId) {
          seller = await prisma.sellers.findUnique({
            where: { id: sellerParticipant.sellerId },
            include: { shop: true },
          });
        }

        const lastMessage = await prisma.message.findFirst({
          where: { conversationId: group.id },
          orderBy: { createdAt: "desc" },
        });

        let isOnline = false;

        if (sellerParticipant?.sellerId) {
          const redisKey = `online:seller:${sellerParticipant.sellerId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }

        const unreadCount = await getUnseenCount("user", group.id);

        return {
          conversationId: group.id,
          seller: {
            id: seller?.id || null,
            name: seller?.shop?.name || "Unknown",
            isOnline,
            avatar: seller?.shop?.avatar || null,
          },
          lastMessage:
            lastMessage?.content || "say something to start the conversation",
          lastMessageAt: lastMessage?.createdAt || group.updatedAt,
          unreadCount,
        };
      })
    );

    res.status(200).json({ conversations: responseData });
  } catch (error) {
    return next(error);
  }
};

export const getSellerConversations = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;

    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          has: sellerId,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const responseData = await Promise.all(
      conversations.map(async (group: any) => {
        const userParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: group.id,
            userId: { not: null },
          },
        });

        let user = null;
        if (userParticipant?.userId) {
          user = await prisma.users.findUnique({
            where: { id: userParticipant.userId },
            include: { avatar: true },
          });
        }

        const lastMessage = await prisma.message.findFirst({
          where: { conversationId: group.id },
          orderBy: { createdAt: "desc" },
        });

        let isOnline = false;

        if (userParticipant?.userId) {
          const redisKey = `online:user:user_${userParticipant.userId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }

        const unreadCount = await getUnseenCount("seller", group.id);

        return {
          conversationId: group.id,
          user: {
            id: user?.id || null,
            name: user?.name || "Unknown",
            avatar: user?.avatar || null,
            isOnline,
          },
          lastMessage:
            lastMessage?.content || "say something to start the conversation",
          lastMessageAt: lastMessage?.createdAt || group.updatedAt,
          unreadCount,
        };
      })
    );

    res.status(200).json({ conversations: responseData });
  } catch (error) {
    return next(error);
  }
};

export const fetchMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;

    if (!conversationId) {
      return next(new ValidationError("conversationId is required"));
    }

    const conversation = await prisma.conversationGroup.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return next(new NotFoundError("Conversation not found"));
    }

    const hasAccess = conversation.participantIds.includes(userId);

    if (!hasAccess) {
      return next(new AuthError("You do not have access to this conversation"));
    }

    await clearUnseenCount("user", conversationId);

    const sellerParticipant = await prisma.participant.findFirst({
      where: {
        conversationId: conversationId,
        sellerId: { not: null },
      },
    });

    let seller = null;
    let isOnline = false;

    if (sellerParticipant?.sellerId) {
      seller = await prisma.sellers.findUnique({
        where: { id: sellerParticipant.sellerId },
        include: { shop: true },
      });

      const redisKey = `online:seller:${sellerParticipant.sellerId}`;
      const redisResult = await redis.get(redisKey);
      isOnline = !!redisResult;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json({
      messages,
      seller: {
        id: seller?.id || null,
        name: seller?.shop?.name || "Unknown",
        isOnline,
        avatar: seller?.shop?.avatar || null,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    return next(error);
  }
};

export const fetchSellerMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;

    if (!conversationId) {
      return next(new ValidationError("conversationId is required"));
    }

    const conversation = await prisma.conversationGroup.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return next(new NotFoundError("Conversation not found"));
    }

    if (!conversation.participantIds.includes(sellerId)) {
      return next(new AuthError("You do not have access to this conversation"));
    }

    await clearUnseenCount("seller", conversationId);

    const userParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId: { not: null },
      },
    });

    let user = null;
    let isOnline = false;

    if (userParticipant?.userId) {
      user = await prisma.users.findUnique({
        where: { id: userParticipant.userId },
        include: { avatar: true },
      });
      const redisKey = `online:user:user_${userParticipant.userId}`;
      const redisResult = await redis.get(redisKey);
      isOnline = !!redisResult;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json({
      messages,
      user: {
        id: user?.id || null,
        name: user?.name || "Unknown",
        avatar: user?.avatar || null,
        isOnline,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    return next(error);
  }
};
