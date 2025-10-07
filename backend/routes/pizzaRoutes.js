const express = require('express');
const pizzaRouter = express.Router();
const pizzaController = require('../controllers/pizzaController');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
pizzaRouter.get('/popular', pizzaController.getPopularPizzas);
pizzaRouter.get('/:id', pizzaController.getPizzaById);
pizzaRouter.get('/', pizzaController.getAllPizzas);

// Admin routes
pizzaRouter.post('/createPizza', adminAuth, upload.single('image'), pizzaController.createPizza);
pizzaRouter.put('/:id', adminAuth, upload.single('image'), pizzaController.updatePizza);
pizzaRouter.delete('/:id', adminAuth, pizzaController.deletePizza);
pizzaRouter.patch('/:id/quantity', adminAuth, pizzaController.updateQuantity);

module.exports = pizzaRouter;