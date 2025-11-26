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

## Tech Stack

- **Backend Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet.js, CORS, Rate Limiting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd backend-javascript
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Copy `.env.example` to `.env` and update the values:

**Linux/Mac:**
```bash
cp .env.example .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Windows (Command Prompt):**
```cmd
copy .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
API_URL=http://localhost:3000
```

**Environment Variables:**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode: `development` or `production`
- `MONGODB_URI` - MongoDB connection string
  - Local: `mongodb://localhost:27017/ecommerce`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- `API_URL` - Base URL for API (used in Swagger docs)

4. Seed the database (optional)
```bash
npm run seed
```

5. Start the server
```bash
npm run dev    # Development mode with nodemon
npm start      # Production mode
```

## API Documentation

Once the server is running, access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

## API Endpoints

### Voucher Management

- `POST /api/voucher` - Create a new voucher
- `GET /api/voucher` - Get all vouchers (optional `?isActive=true` filter)
- `GET /api/voucher/:id` - Get voucher by ID
- `PUT /api/voucher/:id` - Update voucher
- `DELETE /api/voucher/:id` - Delete voucher

### Promotion Management

- `POST /api/promotions` - Create a new promotion
- `GET /api/promotions` - Get all promotions (optional `?isActive=true` filter)
- `GET /api/promotions/:id` - Get promotion by ID
- `PUT /api/promotions/:id` - Update promotion
- `DELETE /api/promotions/:id` - Delete promotion

### Order Management

- `POST /api/orders/apply-discount` - Create order with applied discounts
- `GET /api/orders` - Get all orders
- `GET /api/orders/user/:userId` - Get orders for a specific user
- `GET /api/orders/:id` - Get order by ID

### Health Check

- `GET /health` - Server health check

## Business Logic

### Voucher Rules
- Voucher code can be auto-generated or user-defined
- Discount type: percentage (max 100%) or fixed amount
- Minimum order value validation
- Expiration date must be in the future
- Usage limit enforcement

### Promotion Rules
- Promotion code can be auto-generated or user-defined
- Discount type: percentage (max 100%) or fixed amount
- Eligible products/categories validation
- Expiration date must be in the future
- Usage limit enforcement

### Discount Application Rules
- Maximum discount capped at 50% of order total
- Same voucher/promotion cannot be used twice in one order
- Duplicate promotion codes are not allowed
- Vouchers must meet minimum order value requirement
- Promotions only apply to eligible products/categories
- All discounts are proportionally adjusted if total exceeds 50% cap

## Database Schema

### Voucher
- `code` (String, unique, indexed)
- `discountType` (String: 'percentage' or 'fixed')
- `discountValue` (Number)
- `expirationDate` (Date, indexed)
- `usageLimit` (Number)
- `usedCount` (Number, default: 0)
- `minOrderValue` (Number, default: 0)
- `isActive` (Boolean, default: true, indexed)

### Promotion
- `code` (String, unique, indexed)
- `eligibleCategories` (Array of ObjectIds, ref: Category, indexed)
- `eligibleItems` (Array of ObjectIds, ref: Product, indexed)
- `discountType` (String: 'percentage' or 'fixed')
- `discountValue` (Number)
- `expirationDate` (Date)
- `usageLimit` (Number)
- `usedCount` (Number, default: 0)
- `isActive` (Boolean, default: true)

### Order
- `userId` (ObjectId, indexed)
- `items` (Array of objects with productId, category, price, quantity)
- `totalAmount` (Number)
- `discountApplied` (Number)
- `finalAmount` (Number)
- `appliedVoucher` (Object with voucherId, code, discountAmount)
- `appliedPromotions` (Array of objects with promotionId, code, discountAmount)

## Project Structure

```
src/
├── config/          # Configuration files (database, swagger, seed)
├── controllers/     # Request/response handlers
├── docs/            # Swagger schemas
├── middleware/      # Validators and error handler
│   └── validators/  # Organized validation rules
├── models/          # Mongoose schemas
├── repositories/    # Data access layer
├── routes/          # Express routes
├── services/        # Business logic layer
└── server.js        # Application entry point
```

## Error Handling

The API uses a centralized error handling system:
- Custom `AppError` class for operational errors
- Global error handler middleware
- Consistent error response format
- Try-catch blocks in all service methods

## Rate Limiting

API requests are rate-limited to 100 requests per 15 minutes per IP address.

## Testing

Run tests with:
```bash
npm test
```

## Deployment

### MongoDB Atlas Setup
1. Create a free MongoDB Atlas account
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Deploy to Vercel

**Prerequisites:**
- Vercel account (sign up at [vercel.com](https://vercel.com))
- MongoDB Atlas connection string
- GitHub repository (optional, but recommended)

**Steps:**

1. **Install Vercel CLI** (optional, for local testing):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository or upload your code
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Set Environment Variables:**
   In Vercel dashboard, go to Project Settings → Environment Variables and add:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `NODE_ENV` - Set to `production`
   - `API_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your API will be available at `https://your-app.vercel.app`

**Deploy via CLI:**
```bash
vercel login
vercel
```

**Important Notes:**
- The `api/index.js` file is the entry point for Vercel serverless functions
- Database connections are handled automatically with connection pooling
- All routes are automatically routed through the Express app
- Swagger documentation will be available at `/api-docs`

### Deploy to Render/Heroku
1. Push code to GitHub
2. Connect repository to Render/Heroku
3. Set environment variables
4. Deploy

## License

ISC

