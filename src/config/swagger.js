const swaggerJsdoc = require('swagger-jsdoc');
const schemas = require('./swagger.schemas');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ecommerce Voucher & Promotion Management API',
      version: '1.0.0',
      description: `
# Ecommerce Voucher & Promotion Management API

A comprehensive RESTful API for managing vouchers, promotions, and orders with advanced discount application logic.

## Features

- **Voucher Management**: Create, read, update, and delete vouchers with flexible discount rules
- **Promotion Management**: Manage promotions with eligibility criteria for specific products or categories
- **Order Processing**: Apply vouchers and promotions to orders with automatic validation and discount calculation
- **Business Rules Enforcement**: 
  - Maximum discount cap (50% of order total)
  - Usage limit enforcement
  - Minimum order value validation
  - Expiration date checking
  - Duplicate prevention

## Base URL

The API is available at: \`${process.env.API_URL || 'http://localhost:3000'}\`

## Authentication

Currently, the API is publicly accessible. Future versions may include JWT-based authentication.

## Rate Limiting

API requests are rate-limited to 100 requests per 15 minutes per IP address.

## Response Format

All API responses follow a consistent format:

\`\`\`json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
\`\`\`

Error responses:

\`\`\`json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (development only)"
}
\`\`\`
      `,
      contact: {
        name: 'API Support Team',
        email: 'support@ecommerce-api.com',
        url: 'https://github.com/your-repo'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      },
      termsOfService: 'https://example.com/terms'
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
        variables: {}
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check and server status endpoints'
      },
      {
        name: 'Vouchers',
        description: 'Voucher management operations - Create, read, update, and delete vouchers'
      },
      {
        name: 'Promotions',
        description: 'Promotion management operations - Create, read, update, and delete promotions'
      },
      {
        name: 'Orders',
        description: 'Order management operations - Create orders with discount application and retrieve order information'
      }
    ],
    components: {
      schemas,
      responses: {
        BadRequest: {
          description: 'Bad request - Validation error or invalid input',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error - Business rule violation or server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        TooManyRequests: {
          description: 'Too many requests - Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };

