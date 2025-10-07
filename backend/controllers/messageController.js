const Message = require("../models/Message");

// ============================================
//          Create Message (user)
// ============================================
exports.createMessage = async (req, res, next) => {
  try {
    const { subject, message } = req.body;

    const newMessage = new Message({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      subject,
      message,
      unreadByAdmin: true,
      unreadByUser: false,
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//          Get User's Messages (user)
// ============================================
exports.getUserMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//          Get User's Message (user) By Id
// ============================================
exports.getMessageById = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (
      message.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (req.user.role === "admin") {
      message.unreadByAdmin = false;
    } else {
      message.unreadByUser = false;
    }

    await message.save();

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//          Reply To Message (user)
// ============================================
exports.replyToMessage = async (req, res, next) => {
  try {
    const { message: replyMessage } = req.body;
    const messageDoc = await Message.findById(req.params.id);

    if (!messageDoc) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check ownership
    if (messageDoc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    messageDoc.replies.push({
      message: replyMessage,
      isAdmin: false,
      senderName: req.user.name,
    });

    // Mark as unread by admin
    messageDoc.unreadByAdmin = true;
    messageDoc.unreadByUser = false;

    await messageDoc.save();

    res.json({
      success: true,
      message: "Reply sent successfully",
      data: messageDoc,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//          Get Admin's Messages (Admin)
// ============================================
exports.getAllMessages = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    // Fetch messages with populated user, excluding soft-deleted users
    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "name email isDeleted",
        match: { isDeleted: false }, // Only include messages from active users
      });

    // Remove messages from deleted users
    messages = messages.filter((message) => message.userId !== null);

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//          Reply to Message (Admin)
// ============================================
exports.adminReply = async (req, res, next) => {
  try {
    const { message: replyMessage } = req.body;
    const messageDoc = await Message.findById(req.params.id);

    if (!messageDoc) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    messageDoc.replies.push({
      message: replyMessage,
      isAdmin: true,
      senderName: "Admin",
    });

    messageDoc.status = "replied";
    // Mark as unread by user, read by admin
    messageDoc.unreadByUser = true;
    messageDoc.unreadByAdmin = false;

    await messageDoc.save();

    res.json({
      success: true,
      message: "Reply sent successfully",
      data: messageDoc,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//          Update Message Status (Admin)
// ============================================
exports.updateMessageStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status, unreadByAdmin: false },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.json({
      success: true,
      message: "Status updated successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//          Get unread count (User)
// ============================================
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      userId: req.user._id,
      unreadByUser: true,
    });

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//          Get unread count (Admin)
// ============================================
exports.getAdminUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      unreadByAdmin: true,
    });

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};
