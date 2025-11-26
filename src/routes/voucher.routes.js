const { Router } = require('express');
const { VoucherController } = require('../controllers/voucher.controller');
const {
  validateCreateVoucher,
  validateUpdateVoucher,
  validateVoucherId
} = require('../middleware/validator');

const router = Router();

/**
 * @swagger
 * /api/voucher:
 *   post:
 *     summary: Create a new voucher
 *     description: Creates a new voucher with discount rules. If no code is provided, one will be auto-generated.
 *     tags: [Vouchers]
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
 *                 description: Custom voucher code (optional, auto-generated if not provided)
 *                 example: "SUMMER2025"
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 description: Type of discount to apply
 *                 example: "percentage"
 *               discountValue:
 *                 type: number
 *                 description: Discount value (percentage or fixed amount)
 *                 minimum: 0
 *                 example: 10
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *                 description: Voucher expiration date (must be in the future)
 *                 example: "2025-12-31T23:59:59.000Z"
 *               usageLimit:
 *                 type: integer
 *                 description: Maximum number of times the voucher can be used
 *                 minimum: 1
 *                 example: 100
 *               minOrderValue:
 *                 type: number
 *                 description: Minimum order value required to use this voucher
 *                 minimum: 0
 *                 default: 0
 *                 example: 50
 *               isActive:
 *                 type: boolean
 *                 description: Whether the voucher is currently active
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: Voucher created successfully
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
 *                   example: "Voucher created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Voucher'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error (e.g., duplicate code)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validateCreateVoucher, VoucherController.createVoucher);

/**
 * @swagger
 * /api/voucher:
 *   get:
 *     summary: Get all vouchers
 *     description: Retrieves a list of all vouchers, optionally filtered by active status
 *     tags: [Vouchers]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter vouchers by active status
 *         example: true
 *     responses:
 *       200:
 *         description: List of vouchers retrieved successfully
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
 *                   example: "Vouchers retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Voucher'
 */
router.get('/', VoucherController.getVouchers);

/**
 * @swagger
 * /api/voucher/{id}:
 *   get:
 *     summary: Get a voucher by ID
 *     description: Retrieves a specific voucher by its MongoDB ObjectId
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Voucher MongoDB ObjectId
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Voucher retrieved successfully
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
 *                   example: "Voucher retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Voucher'
 *       400:
 *         description: Invalid voucher ID format
 *       404:
 *         description: Voucher not found
 */
router.get('/:id', validateVoucherId, VoucherController.getVoucherById);

/**
 * @swagger
 * /api/voucher/{id}:
 *   put:
 *     summary: Update a voucher
 *     description: Updates an existing voucher. Only provided fields will be updated.
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Voucher MongoDB ObjectId
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
 *                 example: "UPDATED-CODE"
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 example: "percentage"
 *               discountValue:
 *                 type: number
 *                 example: 15
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-31T23:59:59.000Z"
 *               usageLimit:
 *                 type: integer
 *                 example: 150
 *               minOrderValue:
 *                 type: number
 *                 example: 75
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Voucher updated successfully
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
 *                   example: "Voucher updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Voucher'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Voucher not found
 *       500:
 *         description: Server error (e.g., duplicate code)
 */
router.put('/:id', validateUpdateVoucher, VoucherController.updateVoucher);

/**
 * @swagger
 * /api/voucher/{id}:
 *   delete:
 *     summary: Delete a voucher
 *     description: Permanently deletes a voucher from the system
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Voucher MongoDB ObjectId
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Voucher deleted successfully
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
 *                   example: "Voucher deleted successfully"
 *       400:
 *         description: Invalid voucher ID format
 *       404:
 *         description: Voucher not found
 */
router.delete('/:id', validateVoucherId, VoucherController.deleteVoucher);

module.exports = router;


