const { OrderService } = require('../services/order.service');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

class OrderController {
  static applyDiscounts = asyncHandler(async (req, res) => {
    try {
      const order = await OrderService.applyDiscounts(req.body);
      
      const response = {
        success: true,
        message: 'Order created with discounts applied successfully',
        data: order
      };
      
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to apply discounts: ${error.message}`, 500);
    }
  });

  static getUserOrders = asyncHandler(async (req, res) => {
    try {
      const userId = req.params.userId;
      
      const orders = await OrderService.getUserOrders(userId);
      
      const response = {
        success: true,
        message: 'Orders retrieved successfully',
        data: orders
      };
      
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to retrieve user orders: ${error.message}`, 500);
    }
  });

  static getOrderById = asyncHandler(async (req, res) => {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      
      const response = {
        success: true,
        message: 'Order retrieved successfully',
        data: order
      };
      
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to retrieve order: ${error.message}`, 500);
    }
  });

  static getAllOrders = asyncHandler(async (req, res) => {
    try {
      const orders = await OrderService.getAllOrders();
      
      const response = {
        success: true,
        message: 'All orders retrieved successfully',
        data: orders
      };
      
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to retrieve orders: ${error.message}`, 500);
    }
  });
}

module.exports = { OrderController };


