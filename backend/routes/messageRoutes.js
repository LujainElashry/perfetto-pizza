const express = require("express");
const messageRouter = express.Router();
const messageController = require("../controllers/messageController");
const { userAuth, adminAuth } = require("../middleware/auth");
const { body } = require("express-validator");

const validateMessage = [
  body("subject").trim().notEmpty().withMessage("Subject is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
];

// User routes
messageRouter.post(
  "/",
  userAuth,
  validateMessage,
  messageController.createMessage
);
messageRouter.get("/my-messages", userAuth, messageController.getUserMessages);
messageRouter.get("/unread-count", userAuth, messageController.getUnreadCount);
messageRouter.get("/:id", userAuth, messageController.getMessageById);
messageRouter.post("/:id/reply", userAuth, messageController.replyToMessage);

// Admin routes
messageRouter.get("/", adminAuth, messageController.getAllMessages);
messageRouter.get("/admin/unread-count", adminAuth, messageController.getAdminUnreadCount);
messageRouter.post("/:id/admin-reply", adminAuth, messageController.adminReply);
messageRouter.patch(
  "/:id/status",
  adminAuth,
  messageController.updateMessageStatus
);

module.exports = messageRouter;