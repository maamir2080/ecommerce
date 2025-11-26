/**
 * Swagger schema definitions
 * These schemas are referenced in the swagger configuration
 */
module.exports = {
  Voucher: {
    type: 'object',
    required: ['code', 'discountType', 'discountValue', 'expirationDate', 'usageLimit'],
    properties: {
      _id: {
        type: 'string',
        description: 'MongoDB ObjectId',
        example: '507f1f77bcf86cd799439011'
      },
      code: {
        type: 'string',
        description: 'Unique voucher code (auto-generated if not provided)',
        example: 'SUMMER2025',
        pattern: '^[A-Z0-9-]+$'
      },
      discountType: {
        type: 'string',
        enum: ['percentage', 'fixed'],
        description: 'Type of discount - percentage or fixed amount',
        example: 'percentage'
      },
      discountValue: {
        type: 'number',
        description: 'Discount value (percentage 0-100 or fixed amount)',
        minimum: 0,
        example: 20
      },
      expirationDate: {
        type: 'string',
        format: 'date-time',
        description: 'Voucher expiration date (ISO 8601 format)',
        example: '2025-12-31T23:59:59.000Z'
      },
      usageLimit: {
        type: 'integer',
        description: 'Maximum number of times the voucher can be used',
        minimum: 1,
        example: 200
      },
      usedCount: {
        type: 'integer',
        description: 'Number of times the voucher has been used',
        minimum: 0,
        default: 0,
        example: 5
      },
      minOrderValue: {
        type: 'number',
        description: 'Minimum order value required to use this voucher',
        minimum: 0,
        default: 0,
        example: 50
      },
      isActive: {
        type: 'boolean',
        description: 'Whether the voucher is currently active',
        default: true,
        example: true
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Voucher creation timestamp',
        example: '2025-11-26T03:25:11.599Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Voucher last update timestamp',
        example: '2025-11-26T03:25:11.599Z'
      }
    },
    example: {
      _id: '507f1f77bcf86cd799439011',
      code: 'SUMMER2025',
      discountType: 'percentage',
      discountValue: 20,
      expirationDate: '2025-12-31T23:59:59.000Z',
      usageLimit: 200,
      usedCount: 15,
      minOrderValue: 50,
      isActive: true,
      createdAt: '2025-11-26T03:25:11.599Z',
      updatedAt: '2025-11-26T03:25:11.599Z'
    }
  },
  Promotion: {
    type: 'object',
    required: ['code', 'discountType', 'discountValue', 'expirationDate', 'usageLimit'],
    properties: {
      _id: {
        type: 'string',
        description: 'MongoDB ObjectId',
        example: '507f1f77bcf86cd799439011'
      },
      code: {
        type: 'string',
        description: 'Unique promotion code (auto-generated if not provided)',
        example: 'PROMO-CAT-1',
        pattern: '^[A-Z0-9-]+$'
      },
      eligibleCategories: {
        type: 'array',
        description: 'Array of category IDs eligible for this promotion (empty = all categories)',
        items: {
          type: 'string',
          description: 'Category MongoDB ObjectId'
        },
        example: ['507f1f77bcf86cd799439013']
      },
      eligibleItems: {
        type: 'array',
        description: 'Array of product IDs eligible for this promotion (empty = all products)',
        items: {
          type: 'string',
          description: 'Product MongoDB ObjectId'
        },
        example: ['507f1f77bcf86cd799439012']
      },
      discountType: {
        type: 'string',
        enum: ['percentage', 'fixed'],
        description: 'Type of discount - percentage or fixed amount',
        example: 'percentage'
      },
      discountValue: {
        type: 'number',
        description: 'Discount value (percentage 0-100 or fixed amount)',
        minimum: 0,
        example: 20
      },
      expirationDate: {
        type: 'string',
        format: 'date-time',
        description: 'Promotion expiration date (ISO 8601 format)',
        example: '2025-12-31T23:59:59.000Z'
      },
      usageLimit: {
        type: 'integer',
        description: 'Maximum number of times the promotion can be used',
        minimum: 1,
        example: 500
      },
      usedCount: {
        type: 'integer',
        description: 'Number of times the promotion has been used',
        minimum: 0,
        default: 0,
        example: 3
      },
      isActive: {
        type: 'boolean',
        description: 'Whether the promotion is currently active',
        default: true,
        example: true
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Promotion creation timestamp',
        example: '2025-11-26T03:25:17.981Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Promotion last update timestamp',
        example: '2025-11-26T03:25:17.981Z'
      }
    },
    example: {
      _id: '507f1f77bcf86cd799439011',
      code: 'PROMO-CAT-1',
      eligibleCategories: ['507f1f77bcf86cd799439013'],
      eligibleItems: ['507f1f77bcf86cd799439012'],
      discountType: 'percentage',
      discountValue: 15,
      expirationDate: '2025-12-31T23:59:59.000Z',
      usageLimit: 500,
      usedCount: 25,
      isActive: true,
      createdAt: '2025-11-26T03:25:17.981Z',
      updatedAt: '2025-11-26T03:25:17.981Z'
    }
  },
  OrderItem: {
    type: 'object',
    required: ['productId', 'category', 'price', 'quantity'],
    properties: {
      productId: {
        type: 'string',
        description: 'Product MongoDB ObjectId',
        example: '507f1f77bcf86cd799439012'
      },
      category: {
        type: 'string',
        description: 'Category ID (for promotion eligibility checking)',
        example: '507f1f77bcf86cd799439013'
      },
      price: {
        type: 'number',
        description: 'Price per unit',
        minimum: 0,
        example: 100
      },
      quantity: {
        type: 'integer',
        description: 'Quantity of items',
        minimum: 1,
        example: 2
      }
    }
  },
  AppliedVoucher: {
    type: 'object',
    properties: {
      voucherId: {
        type: 'string',
        description: 'Voucher MongoDB ObjectId',
        example: '507f1f77bcf86cd799439011'
      },
      code: {
        type: 'string',
        description: 'Voucher code that was applied',
        example: 'VCH-7CVNLW6P'
      },
      discountAmount: {
        type: 'number',
        description: 'Discount amount applied from this voucher',
        example: 20
      }
    }
  },
  AppliedPromotion: {
    type: 'object',
    properties: {
      promotionId: {
        type: 'string',
        description: 'Promotion MongoDB ObjectId',
        example: '507f1f77bcf86cd799439011'
      },
      code: {
        type: 'string',
        description: 'Promotion code that was applied',
        example: 'PRM-QNLCX86V'
      },
      discountAmount: {
        type: 'number',
        description: 'Discount amount applied from this promotion',
        example: 15
      }
    }
  },
  Order: {
    type: 'object',
    required: ['userId', 'items', 'totalAmount'],
    properties: {
      _id: {
        type: 'string',
        description: 'Order MongoDB ObjectId',
        example: '507f1f77bcf86cd799439011'
      },
      userId: {
        type: 'string',
        description: 'User MongoDB ObjectId who placed the order',
        example: '507f1f77bcf86cd799439011'
      },
      items: {
        type: 'array',
        description: 'Array of order items',
        items: {
          $ref: '#/components/schemas/OrderItem'
        }
      },
      totalAmount: {
        type: 'number',
        description: 'Total order amount before discounts',
        minimum: 0,
        example: 200
      },
      discountApplied: {
        type: 'number',
        description: 'Total discount applied (sum of voucher and promotion discounts, capped at 50%)',
        minimum: 0,
        default: 0,
        example: 35
      },
      finalAmount: {
        type: 'number',
        description: 'Final amount after discounts (totalAmount - discountApplied)',
        minimum: 0,
        example: 165
      },
      appliedVoucher: {
        $ref: '#/components/schemas/AppliedVoucher',
        description: 'Applied voucher information (if any)',
        nullable: true
      },
      appliedPromotions: {
        type: 'array',
        description: 'Array of applied promotions (if any)',
        items: {
          $ref: '#/components/schemas/AppliedPromotion'
        },
        default: []
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Order creation timestamp',
        example: '2025-11-26T03:25:28.716Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Order last update timestamp',
        example: '2025-11-26T03:25:28.716Z'
      }
    },
    example: {
      _id: '507f1f77bcf86cd799439011',
      userId: '507f1f77bcf86cd799439011',
      items: [
        {
          productId: '507f1f77bcf86cd799439012',
          category: '507f1f77bcf86cd799439013',
          price: 100,
          quantity: 2
        }
      ],
      totalAmount: 200,
      discountApplied: 35,
      finalAmount: 165,
      appliedVoucher: {
        voucherId: '507f1f77bcf86cd799439011',
        code: 'SUMMER2025',
        discountAmount: 40
      },
      appliedPromotions: [
        {
          promotionId: '507f1f77bcf86cd799439012',
          code: 'PROMO-CAT-1',
          discountAmount: 15
        }
      ],
      createdAt: '2025-11-26T03:25:28.716Z',
      updatedAt: '2025-11-26T03:25:28.716Z'
    }
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      message: {
        type: 'string',
        description: 'Human-readable error message',
        example: 'Validation error: Expiration date must be in the future'
      },
      error: {
        type: 'string',
        description: 'Detailed error information (only in development mode)',
        example: 'Error: Expiration date must be in the future\n    at validate...'
      }
    },
    example: {
      success: false,
      message: 'Voucher not found',
      error: 'Error: Voucher not found\n    at VoucherService.validateVoucher...'
    }
  },
  SuccessResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        description: 'Success message',
        example: 'Operation completed successfully'
      },
      data: {
        type: 'object',
        description: 'Response data (varies by endpoint)'
      }
    }
  }
};

