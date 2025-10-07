const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

// Admin routes
adminRouter.get('/users', adminAuth, adminController.getAllUsers);
adminRouter.delete('/users/:id', adminAuth, adminController.deleteUser);
adminRouter.get('/stats', adminAuth, adminController.getDashboardStats);

module.exports = adminRouter;