const User = require("../models/User");
const Pizza = require("../models/Pizza");
const Order = require("../models/Order");

// ============================================
//         Get all users (Admin)
// ============================================
exports.getAllUsers = async (req, res, next) => {
  try {
    // Only return non-deleted users
    const users = await User.find({ role: "user", isDeleted: { $ne: true } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get all users error:", error);
    next(error);
  }
};

// ============================================
//          Delete user (Admin)
// ============================================
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin users",
      });
    }

    user.isDeleted = true;
    await user.save();

    res.json({
      success: true,
      message: "User hidden (soft deleted) successfully",
    });
  } catch (error) {
    console.error("Soft delete user error:", error);
    next(error);
  }
};

// ============================================
//      Get dashboard statistics (Admin)
// ============================================
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalPizzas = await Pizza.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const totalUsers = await User.countDocuments({
      role: "user",
      isDeleted: { $ne: true }, // ✅ Exclude deleted users
    });

    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      data: {
        totalPizzas,
        totalOrders,
        pendingOrders,
        totalUsers,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    next(error);
  }
};
