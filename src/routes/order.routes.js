const { Router } = require('express');
const { OrderController } = require('../controllers/order.controller');
const { validateApplyDiscount, validateUserId, validateOrderId } = require('../middleware/validator');

const router = Router();

/**
 * @swagger
 * /api/orders/apply-discount:
 *   post:
 *     summary: Create an order with applied discounts
 *     description: |
 *       Creates a new order and applies vouchers and/or promotions based on the provided codes.
 *       
 *       **Business Rules:**
 *       - Maximum discount is capped at 50% of order total
 *       - Same voucher/promotion cannot be used twice in one order
 *       - Duplicate promotion codes are not allowed
 *       - Vouchers must meet minimum order value requirement
 *       - Vouchers/promotions must be active and not expired
 *       - Usage limits are enforced
 *       - Promotions only apply to eligible products/categories
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - items
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User MongoDB ObjectId
 *                 example: "507f1f77bcf86cd799439011"
 *               items:
 *                 type: array
 *                 description: Array of order items
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - category
 *                     - price
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: Product MongoDB ObjectId
 *                       example: "507f1f77bcf86cd799439012"
 *                     category:
 *                       type: string
 *                       description: Category ID (for promotion eligibility)
 *                       example: "507f1f77bcf86cd799439013"
 *                     price:
 *                       type: number
 *                       description: Price per unit
 *                       minimum: 0
 *                       example: 100
 *                     quantity:
 *                       type: integer
 *                       description: Quantity of items
 *                       minimum: 1
 *                       example: 2
 *               voucherCode:
 *                 type: string
 *                 description: Voucher code to apply (optional)
 *                 example: "VCH-7CVNLW6P"
 *               promotionCodes:
 *                 type: array
 *                 description: Array of promotion codes to apply (optional)
 *                 items:
 *                   type: string
 *                 example: ["PRM-QNLCX86V"]
 *     responses:
 *       201:
 *         description: Order created with discounts applied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order created with discounts applied successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error (invalid data, missing fields, etc.)
 *       500:
 *         description: Business rule violation (expired voucher, usage limit exceeded, minimum order value not met, etc.)
 */
router.post('/apply-discount', validateApplyDiscount, OrderController.applyDiscounts);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     description: Retrieves all orders in the system (admin endpoint). Includes populated product, voucher, and promotion information.
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of all orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All orders retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 */
router.get('/', OrderController.getAllOrders);

/**
 * @swagger
 * /api/orders/user/{userId}:
 *   get:
 *     summary: Get orders for a specific user
 *     description: Retrieves all orders belonging to a specific user. Includes populated product, voucher, and promotion information.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ObjectId
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: User orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Orders retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid user ID format
 */
router.get(
  '/user/:userId',
  validateUserId,
  OrderController.getUserOrders
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     description: Retrieves a specific order by its MongoDB ObjectId. Includes populated product, voucher, and promotion information.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order MongoDB ObjectId
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid order ID format
 *       404:
 *         description: Order not found
 */
router.get(
  '/:id',
  validateOrderId,
  OrderController.getOrderById
);

module.exports = router;


