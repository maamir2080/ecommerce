const { OrderService } = require('../services/order.service');
const { asyncHandler } = require('../middleware/errorHandler');

class OrderController {
  static applyDiscounts = asyncHandler(async (req, res) => {
    const order = await OrderService.applyDiscounts(req.body);
    
    const response = {
      success: true,
      message: 'Order created with discounts applied successfully',
      data: order
    };
    
    res.status(201).json(response);
  });

  static getUserOrders = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    
    const orders = await OrderService.getUserOrders(userId);
    
    const response = {
      success: true,
      message: 'Orders retrieved successfully',
      data: orders
    };
    
    res.status(200).json(response);
  });

  static getOrderById = asyncHandler(async (req, res) => {
    const order = await OrderService.getOrderById(req.params.id);
    
    const response = {
      success: true,
      message: 'Order retrieved successfully',
      data: order
    };
    
    res.status(200).json(response);
  });

  static getAllOrders = asyncHandler(async (req, res) => {
    const orders = await OrderService.getAllOrders();
    
    const response = {
      success: true,
      message: 'All orders retrieved successfully',
      data: orders
    };
    
    res.status(200).json(response);
  });
}

module.exports = { OrderController };


