# 🛍️ Microservices E-Commerce Platform

A modern, scalable microservices-based e-commerce platform built with Node.js, Next.js, and TypeScript. This project features separate UIs for users, sellers, and admins, with a robust backend architecture utilizing MongoDB, Redis, and Kafka.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Microservices Overview](#-microservices-overview)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### Authentication & Security
- **JWT-based Authentication**: Secure access and refresh tokens with automatic token refresh
- **OTP Verification**: Email-based OTP for registration and password reset
- **Google OAuth**: Social login integration for users
- **Secure Cookies**: HttpOnly, secure cookie management
- **Role-based Access Control**: User, Seller, and Admin roles
- **Password Hashing**: Bcrypt for secure password storage

### User Features
- **Modern UI**: Responsive Next.js frontend with Tailwind CSS
- **User Dashboard**: Profile management, wishlist, cart
- **Order Management**: View and track orders
- **Product Reviews**: Rate and review products
- **Real-time Chat**: Communicate with sellers via WebSocket

### Seller Features
- **Seller Dashboard**: Comprehensive shop management
- **Product Management**: CRUD operations with rich media support
- **Order Processing**: Manage orders and deliveries
- **Analytics**: Track shop performance and sales
- **Stripe Integration**: Payment processing and subscriptions

### Admin Features
- **Admin Dashboard**: Site-wide management
- **User Management**: Monitor and manage users and sellers
- **Category Management**: Configure product categories
- **System Configuration**: Site-wide settings

### Technical Features
- **Microservices Architecture**: Scalable service separation
- **API Gateway**: Centralized routing and load balancing
- **Event-Driven Architecture**: Kafka for asynchronous communication
- **Real-time Logging**: WebSocket-based logging service
- **Automated Testing**: Jest and E2E test setup
- **CI/CD Ready**: GitHub Actions workflows

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (via Prisma ORM)
- **Caching**: Redis
- **Message Queue**: Kafka (KafkaJS)
- **Authentication**: JWT, bcrypt
- **Email**: Nodemailer with EJS templates
- **Payment**: Stripe
- **File Upload**: ImageKit
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **State Management**: Jotai, Zustand
- **Forms**: React Hook Form
- **Data Fetching**: React Query (TanStack Query)
- **Charts**: ApexCharts, Recharts
- **UI Components**: Lucide Icons
- **Real-time**: WebSockets

### DevOps & Tools
- **Monorepo**: Nx Workspace
- **Testing**: Jest, E2E Tests
- **Build Tool**: Webpack, ESBuild
- **Code Quality**: TypeScript strict mode

## 🗺️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   User UI    │  │  Seller UI   │  │   Admin UI   │         │
│  │  (Port 3000) │  │  (Port 3001) │  │  (Port 3002) │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │      API Gateway            │
              │      (Port 8080)            │
              └──────────────┬──────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Auth Service │    │Product Service│    │Seller Service│
│  (Port 6001) │    │  (Port 6002)  │    │  (Port 6004) │
└──────────────┘    └──────────────┘    └──────────────┘
        │                    │                    │
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│Order Service │    │Admin Service │    │Chat Service  │
│  (Port 6003) │    │  (Port 6005)  │    │  (Port 6006) │
└──────────────┘    └──────────────┘    └──────────────┘
        │                    │                    │
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│Logger Service│    │Recommendation│    │  Kafka       │
│  (Port 6008) │    │   Service    │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
        │                                           │
        ▼                                           ▼
┌──────────────┐                          ┌──────────────┐
│   MongoDB    │                          │    Redis     │
└──────────────┘                          └──────────────┘
```

## 📁 Project Structure

```
Microservice-E-commerce/
├── apps/
│   ├── api-gateway/           # Central API routing
│   ├── auth-services/         # Authentication & authorization
│   ├── product-service/       # Product catalog management
│   ├── order-service/         # Order processing & Stripe
│   ├── seller-service/        # Seller operations
│   ├── admin-service/         # Admin operations
│   ├── chatting-service/      # Real-time chat & WebSocket
│   ├── logger-service/        # Application logging
│   ├── recommendation-service/ # ML-based recommendations
│   ├── user-ui/               # User-facing Next.js app
│   ├── seller-ui/             # Seller dashboard Next.js app
│   └── admin-ui/              # Admin dashboard Next.js app
├── packages/
│   ├── error-handler/         # Shared error handling
│   ├── libs/
│   │   ├── prisma/            # Prisma client
│   │   ├── redis/             # Redis client
│   │   ├── imagekit/          # Image upload service
│   │   └── notification-helper/ # Notification utilities
│   ├── middleware/            # Shared middleware
│   │   ├── authorizeRoles/    # RBAC middleware
│   │   ├── isAuthenticated/   # Auth middleware
│   │   └── sellerAuth.middleware/
│   ├── utils/
│   │   ├── kafka/             # Kafka utilities
│   │   └── logs/              # Logging utilities
│   └── components/            # Shared UI components
├── prisma/
│   └── schema.prisma          # Database schema
├── nx.json                    # Nx configuration
├── package.json               # Root dependencies
└── README.md                  # This file
```

## 🧩 Microservices Overview

### 🔐 Auth Service (Port 6001)
- User and Seller registration with OTP verification
- Login with JWT tokens
- Password reset flow
- Token refresh mechanism
- Google OAuth integration
- **API Docs**: `http://localhost:6001/api-docs`

### 📦 Product Service (Port 6002)
- Product CRUD operations
- Category and subcategory management
- Product search and filtering
- Stock management
- Product analytics
- Scheduled jobs for inventory
- **API Docs**: `http://localhost:6002/api-docs`

### 🛒 Order Service (Port 6003)
- Order creation and management
- Stripe payment processing
- Webhook handling for payment events
- Order status tracking
- Discount code application
- Email notifications

### 🏪 Seller Service (Port 6004)
- Shop creation and management
- Seller profile management
- Shop analytics
- Follower management
- Review management

### 👨‍💼 Admin Service (Port 6005)
- User and seller management
- Site configuration
- Category management
- System analytics

### 💬 Chat Service (Port 6006)
- Real-time messaging via WebSocket
- Group and private conversations
- Message persistence
- Online/offline status
- Kafka integration for async messaging

### 📊 Logger Service (Port 6008)
- Application logging via WebSocket
- Kafka consumer for log aggregation
- Real-time log streaming

### 🤖 Recommendation Service
- User behavior analysis
- Product recommendations
- ML-based suggestions

### 🌐 API Gateway (Port 8080)
- Centralized routing
- Rate limiting
- CORS management
- Request/response aggregation
- Load balancing

## ⚙️ Installation & Setup

### Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn**
- **MongoDB** (local or Atlas)
- **Redis** (local or cloud)
- **Kafka** (for event-driven features)
- **Stripe Account** (for payments)
- **ImageKit Account** (for image uploads)

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/Microservice-E-commerce-.git
cd Microservice-E-commerce-
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Prisma**

```bash
npx prisma generate
npx prisma db push
```

4. **Configure environment variables**

Create `.env` files in each service directory or use a centralized `.env` file at the root.

5. **Start infrastructure services**

```bash
# Start MongoDB
mongod

# Start Redis
redis-server

# Start Kafka (if not using Docker)
# Follow Kafka installation guide
```

6. **Build the project**

```bash
npx nx build --all
```

7. **Run all services**

```bash
# Run all microservices and UIs
npm run dev

# Or run specific services
npm run user-ui    # User UI only
npm run seller-ui  # Seller UI only
npm run admin-ui   # Admin UI only
```

### Individual Service Commands

```bash
# Run auth service
npx nx serve auth-services

# Run product service
npx nx serve product-service

# Run order service
npx nx serve order-service

# Similar commands for other services...
```

## 🔑 Environment Variables

### Database
```env
DATABASE_URL="mongodb://localhost:27017/ecommerce"
```

### Redis
```env
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="" # Optional
```

### JWT
```env
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
```

### Email (Nodemailer)
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Stripe
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### ImageKit
```env
IMAGEKIT_PUBLIC_KEY="your-public-key"
IMAGEKIT_PRIVATE_KEY="your-private-key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-id"
```

### Google OAuth
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Kafka
```env
KAFKA_BROKER="localhost:9092"
KAFKA_CLIENT_ID="ecommerce-platform"
```

## 🏃 Running the Application

### Development Mode

```bash
# Terminal 1: Start all services
npm run dev

# The application will be available at:
# - User UI: http://localhost:3000
# - Seller UI: http://localhost:3001
# - Admin UI: http://localhost:3002
# - API Gateway: http://localhost:8080
```

### Production Mode

```bash
# Build all applications
npx nx build --all

# Run production builds
# (Commands vary based on deployment strategy)
```

### Docker Deployment

```bash
# Build Docker images
docker-compose build

# Start all services
docker-compose up

# Stop all services
docker-compose down
```

## 📚 API Documentation

### Swagger Documentation

Access interactive API documentation for services that support Swagger:

- **Auth Service**: http://localhost:6001/api-docs
- **Product Service**: http://localhost:6002/api-docs

### API Endpoints Summary

#### Authentication
- `POST /api/register/user` - User registration
- `POST /api/register/seller` - Seller registration
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `POST /api/refresh-token` - Refresh access token
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password with OTP

#### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product (seller)
- `DELETE /api/products/:id` - Delete product (seller)

#### Orders
- `POST /api/create-order` - Create order (Stripe webhook)
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

#### Chat
- `GET /api/conversations` - Get user conversations
- `POST /api/conversations` - Create conversation
- `POST /api/messages` - Send message

## 🗄️ Database Schema

### Key Models

- **users**: User profiles and authentication
- **sellers**: Seller accounts and shop ownership
- **shops**: Shop information and settings
- **products**: Product catalog with rich metadata
- **orders**: Order management and tracking
- **orderItems**: Individual order line items
- **ratings**: Product reviews and ratings
- **messages**: Real-time chat messages
- **notifications**: User notifications
- **analytics**: User, product, and shop analytics

See `prisma/schema.prisma` for complete schema definition.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific service
npx nx test auth-services

# Run E2E tests
npx nx e2e auth-services-e2e

# Generate coverage report
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write unit tests for new features
- Update API documentation (Swagger)
- Follow the existing code style
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - [GitHub Profile](https://github.com/yourusername)

## 🙏 Acknowledgments

- Nx Team for the excellent monorepo tooling
- Next.js team for the amazing framework
- All the open-source contributors

## 📞 Support

For support, email your-email@example.com or open an issue in this repository.

---

Made with ❤️ using TypeScript, Node.js, and Next.js
