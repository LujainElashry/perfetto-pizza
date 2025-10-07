const Pizza = require("../models/Pizza");
const { cloudinary } = require("../config/cloudinary");

// ============================================
//      Get All Pizzas
// ============================================
exports.getAllPizzas = async (req, res, next) => {
  try {
    const pizzas = await Pizza.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pizzas.length,
      data: pizzas,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//      Get Popular Pizzas
// ============================================
exports.getPopularPizzas = async (req, res, next) => {
  try {
    const pizzas = await Pizza.find({ popular: true });

    res.json({
      success: true,
      count: pizzas.length,
      data: pizzas,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//      Get Single Pizza
// ============================================
exports.getPizzaById = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    res.json({
      success: true,
      data: pizza,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//    Create pizza with image (Admin)
// ============================================
exports.createPizza = async (req, res, next) => {
  try {
    const pizzaData = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      quantity: parseInt(req.body.quantity),
      ingredients: req.body.ingredients,
      popular: req.body.popular === "true",
      photoName: req.file ? req.file.path : "images/pizzas/default.jpg",
    };

    const pizza = new Pizza(pizzaData);
    await pizza.save();

    res.status(201).json({
      success: true,
      message: "Pizza created successfully",
      data: pizza,
    });
  } catch (error) {
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Pizza with this name already exists",
      });
    }

    next(error);
  }
};

// ============================================
//    Update pizza (Admin)
// ============================================
exports.updatePizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    pizza.name = req.body.name || pizza.name;
    pizza.price = req.body.price ? parseFloat(req.body.price) : pizza.price;
    pizza.quantity = req.body.quantity
      ? parseInt(req.body.quantity)
      : pizza.quantity;
    pizza.ingredients = req.body.ingredients || pizza.ingredients;
    pizza.popular =
      req.body.popular !== undefined
        ? req.body.popular === "true"
        : pizza.popular;

    if (req.file) {
      if (pizza.photoName && pizza.photoName.includes("cloudinary")) {
        const urlParts = pizza.photoName.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split(".")[0];
        await cloudinary.uploader.destroy(`perfetto-pizzas/${publicId}`);
      }

      pizza.photoName = req.file.path;
    }

    await pizza.save();

    res.json({
      success: true,
      message: "Pizza updated successfully",
      data: pizza,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//    Delete pizza (Admin)
// ============================================
exports.deletePizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    if (pizza.photoName && pizza.photoName.includes("cloudinary")) {
      const urlParts = pizza.photoName.split("/");
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExt.split(".")[0];
      await cloudinary.uploader.destroy(`perfetto-pizzas/${publicId}`);
    }

    await Pizza.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Pizza deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
//    Update Quantity (Admin)
// ============================================
exports.updateQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    const pizza = await Pizza.findByIdAndUpdate(
      req.params.id,
      { quantity, soldOut: quantity === 0 },
      { new: true }
    );

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    res.json({
      success: true,
      message: "Quantity updated successfully",
      data: pizza,
    });
  } catch (error) {
    next(error);
  }
};
