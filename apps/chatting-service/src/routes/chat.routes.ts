import express from "express";
import { isSeller } from "../../../../packages/middleware/authorizeRoles";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { isSellerAuthenticated } from "../../../../packages/middleware/sellerAuth.middleware";
import {
  fetchMessages,
  fetchSellerMessages,
  getSellerConversations,
  getUserConversations,
  newConversation,
} from "../controllers/chatting.controllers";

const router = express.Router();

router.post("/create-user-conversationGroup", isAuthenticated, newConversation);

router.get("/get-user-conversations", isAuthenticated, getUserConversations);

router.get(
  "/get-seller-conversations",
  isSellerAuthenticated,
  isSeller,
  getSellerConversations
);

router.get("/get-messages/:conversationId", isAuthenticated, fetchMessages);

router.get(
  "/get-seller-messages/:conversationId",
  isSellerAuthenticated,
  isSeller,
  fetchSellerMessages
);

export default router;
