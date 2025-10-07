// ----------------------------
// PERFETTO Pizza Server Setup
// ----------------------------
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const helmet = require("helmet");
const errorHandler = require("./middleware/errorHandler");

// ----------------------------
// Load environment variables
// ----------------------------
dotenv.config();

// ----------------------------
// Connect to MongoDB
// ----------------------------
connectDB(); 

// ----------------------------
// Initialize express app
// ----------------------------
const app = express();

// ----------------------------
// 1. Enable CORS (frontend ↔ backend)
// ----------------------------
app.use(
  cors({
    origin:"https://perfetto-pizza.vercel.app",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// ----------------------------
// 2. Parse incoming data
// ----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------------
// 3. Security Middleware
// ----------------------------
app.use(helmet());

// ----------------------------
// 4. Development Request Logger
// ----------------------------
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ----------------------------
// 5. Routes
// ----------------------------
app.use("/pizzas", require("./routes/pizzaRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/orders", require("./routes/orderRoutes"));
app.use("/messages", require("./routes/messageRoutes"));

// ----------------------------
// Root + Health Routes
// ----------------------------
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PERFETTO Pizza API",
    version: "1.0.0",
    endpoints: {
      pizzas: "/pizzas",
      users: "/users",
      admin: "/admin",
      orders: "/orders",
      messages: "/messages",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------
// 404 Handler
// ----------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ----------------------------
// Global Error Handler
// ----------------------------
app.use(errorHandler);

// ----------------------------
// Start Server
// ----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌎 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🍕 PERFETTO Pizza API is ready!`);
});

// ----------------------------
// Handle Unhandled Rejections
// ----------------------------
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});
