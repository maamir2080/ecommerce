const { Router } = require('express');
const { PromotionController } = require('../controllers/promotion.controller');
const {
  validateCreatePromotion,
  validateUpdatePromotion,
  validatePromotionId
} = require('../middleware/validator');

const router = Router();

/**
 * @swagger
 * /api/promotions:
 *   post:
 *     summary: Create a new promotion
 *     description: Creates a new promotion with discount rules and optional eligibility criteria. If no code is provided, one will be auto-generated.
 *     tags: [Promotions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - discountType
 *               - discountValue
 *               - expirationDate
 *               - usageLimit
 *             properties:
 *               code:
 *                 type: string
 *                 description: Custom promotion code (optional, auto-generated if not provided)
 *                 example: "BLACKFRIDAY2025"
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 description: Type of discount to apply
 *                 example: "fixed"
 *               discountValue:
 *                 type: number
 *                 description: Discount value (percentage or fixed amount)
 *                 minimum: 0
 *                 example: 20
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *                 description: Promotion expiration date (must be in the future)
 *                 example: "2025-12-31T23:59:59.000Z"
 *               usageLimit:
 *                 type: integer
 *                 description: Maximum number of times the promotion can be used
 *                 minimum: 1
 *                 example: 50
 *               eligibleCategories:
 *                 type: array
 *                 description: Array of category IDs that are eligible for this promotion (optional)
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439013"]
 *               eligibleItems:
 *                 type: array
 *                 description: Array of product IDs that are eligible for this promotion (optional)
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439012"]
 *               isActive:
 *                 type: boolean
 *                 description: Whether the promotion is currently active
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Promotion created successfully
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
 *                   example: "Promotion created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error (e.g., duplicate code)
 */
router.post('/', validateCreatePromotion, PromotionController.createPromotion);

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: Get all promotions
 *     description: Retrieves a list of all promotions, optionally filtered by active status. Includes populated category and product information.
 *     tags: [Promotions]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter promotions by active status
 *         example: true
 *     responses:
 *       200:
 *         description: List of promotions retrieved successfully
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
 *                   example: "Promotions retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Promotion'
 */
router.get('/', PromotionController.getPromotions);

/**
 * @swagger
 * /api/promotions/{id}:
 *   get:
 *     summary: Get a promotion by ID
 *     description: Retrieves a specific promotion by its MongoDB ObjectId with populated category and product information
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Promotion MongoDB ObjectId
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Promotion retrieved successfully
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
 *                   example: "Promotion retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Invalid promotion ID format
 *       404:
 *         description: Promotion not found
 */
router.get('/:id', validatePromotionId, PromotionController.getPromotionById);

/**
 * @swagger
 * /api/promotions/{id}:
 *   put:
 *     summary: Update a promotion
 *     description: Updates an existing promotion. Only provided fields will be updated.
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Promotion MongoDB ObjectId
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "UPDATED-PROMO"
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 example: "fixed"
 *               discountValue:
 *                 type: number
 *                 example: 30
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-31T23:59:59.000Z"
 *               usageLimit:
 *                 type: integer
 *                 example: 75
 *               eligibleCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439013"]
 *               eligibleItems:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439012"]
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Promotion updated successfully
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Server error (e.g., duplicate code)
 */
router.put('/:id', validateUpdatePromotion, PromotionController.updatePromotion);

/**
 * @swagger
 * /api/promotions/{id}:
 *   delete:
 *     summary: Delete a promotion
 *     description: Permanently deletes a promotion from the system
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Promotion MongoDB ObjectId
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Promotion deleted successfully
 *       400:
 *         description: Invalid promotion ID format
 *       404:
 *         description: Promotion not found
 */
router.delete('/:id', validatePromotionId, PromotionController.deletePromotion);

module.exports = router;


