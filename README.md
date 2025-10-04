---

## 🚀 Features

- **Authentication Microservice**: User & seller registration, login, JWT, OTP, password reset, secure cookies, refresh tokens.
- **User & Seller UI**: Modern Next.js frontends for both users and sellers, with multi-step signup, login, forgot password, and profile flows.
- **API Gateway**: Centralized routing and aggregation for microservices.
- **Prisma ORM + MongoDB**: Flexible, scalable data modeling for users, sellers, shops, reviews, and images.
- **Redis**: Fast, reliable OTP and request tracking.
- **Robust Error Handling**: Centralized error middleware and shared error utilities.
- **Monorepo with Nx**: Unified development, builds, and testing for all services and UIs.
- **Swagger Docs**: Auto-generated API documentation for auth-services.
- **Testing**: Jest and E2E test setup for reliability.
- **CI/CD**: GitHub Actions workflows for continuous integration.
- **Tailwind CSS**: Utility-first CSS for rapid UI development.
- **Google Auth**: Social login for users.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, MongoDB, Redis, JWT, bcrypt, Nodemailer, Swagger, EJS.
- **Frontend**: React, Next.js, Tailwind CSS, React Query, React Hook Form, Axios, Lucide Icons, Google Auth.
- **Monorepo Tooling**: Nx, TypeScript project references, Jest, GitHub Actions.
- **Testing**: Jest, E2E tests.
- **Docs**: Swagger (OpenAPI).

---

## 🧩 Detailed Module Overview

### Auth Microservice (`apps/auth-services`)

- **Controllers**: All authentication logic in `src/controllers/auth.controller.ts` (register, login, OTP, password reset, refresh tokens, etc.)
- **Helpers**: `src/utils/auth.helper.ts` for validation, OTP, and security logic.
- **Email Templates**: EJS templates for OTP and password reset emails.
- **Swagger Docs**: `src/swagger.js` and `src/swagger.json` for API documentation.
- **Routes**: `src/routes/auth.router.ts` for all auth endpoints.
- **Dockerfile**: For containerized deployment.

#### Key Flows:

- **User Registration**: Validates input, checks for existing user, sends OTP, tracks OTP requests, and creates user after OTP verification.
- **Seller Registration**: Similar to user, but with additional fields (phone, country).
- **Login**: Validates credentials, issues JWT access and refresh tokens, sets secure cookies.
- **Password Reset**: Handles forgot password, OTP verification, and password update.
- **Token Refresh**: Securely refreshes access tokens using refresh tokens.

### User UI (`apps/user-ui`)

- **Pages**: Login, signup (with OTP), forgot password, profile, wishlist, cart.
- **Hooks**: `src/hooks/useUser.ts` for fetching and caching user data.
- **Utils**: `src/utils/axiosinstance.ts` for API calls with automatic token refresh.
- **Widgets**: `src/shared/widgets/header/` for dynamic header and sticky navigation.
- **Components**: Google login button, OTP input, etc.
- **Tailwind CSS**: For modern, responsive UI.
- **React Query**: For data fetching and caching.
- **React Hook Form**: For robust form validation and UX.

#### Key Flows:

- **Signup**: Multi-step with OTP, password visibility toggle, Google signup.
- **Login**: Email/password, Google login, "Remember Me", error handling.
- **Forgot Password**: Email submission, OTP verification, password reset.
- **Header**: Dynamic user info, profile link, wishlist/cart, sticky navigation.

### Seller UI (`apps/seller-ui`)

- **Pages**: Multi-step signup (with OTP), login, shop setup, bank connection, dashboard.
- **Form Validation**: Country/phone validation, OTP resend with timer.
- **Modern UX**: Styled with Tailwind CSS, React Query, React Hook Form.

### API Gateway (`apps/api-gateway`)

- **Express-based**: Central entry point for all microservices.
- **Proxying**: Forwards requests to appropriate services.
- **Assets**: Static assets and main entry.

### Shared Packages

- **error-handler**: Custom error classes and Express error middleware.
- **libs/prisma**: Prisma client and schema.
- **libs/redis**: Redis client and helpers.
- **middleware**: Shared Express middleware (e.g., authentication).

### Database Models (`prisma/schema.prisma`)

- **users**: id, name, email, password, avatar, following, reviews, timestamps.
- **sellers**: id, name, email, phone, country, password, stripeId, shop, timestamps.
- **shops**: id, name, bio, category, avatar, address, ratings, reviews, sellerId, timestamps.
- **shopReviews**: id, userId, rating, review, shopId, timestamps.
- **images**: id, file_id, url, userId, shopId.

---

## ⚙️ Setup & Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/E-commerceProject-Microservice.git
   cd E-commerceProject-Microservice
   ```

<<<<<<< SEARCH

🛠️ Project Workflow
User/Seller visits UI (Next.js)
Can register, login, or reset password.
Registration
User/Seller submits registration form.
Auth Service validates data, checks for existing user, sends OTP via email.
User/Seller enters OTP to verify.
On success, account is created in MongoDB via Prisma.
Login
User/Seller submits credentials.
Auth Service validates, issues JWT access and refresh tokens, sets cookies.
UI stores session, fetches user data via /api/logged-in-user.
Password Reset
User/Seller requests password reset.
Auth Service sends OTP to email.
User/Seller verifies OTP, sets new password.
Token Refresh
If access token expires, UI uses refresh token to get a new one (handled by axios interceptor).
API Gateway
Routes requests to appropriate microservices (auth, user, seller, etc.).
Shared Packages
Error handling, Prisma, Redis, and middleware are reused across services.
CI/CD
GitHub Actions run tests and build on push/PR.

flowchart TD
subgraph Frontend
A1[User UI (Next.js)]
A2[Seller UI (Next.js)]
end
subgraph Gateway
B[API Gateway (Express)]
end
subgraph Services
C[Auth Service (Express, Prisma, Redis)]
D[Other Microservices]
end
subgraph DB
E[(MongoDB)]
F[(Redis)]
end

    A1 -- "API Calls" --> B
    A2 -- "API Calls" --> B
    B -- "Auth, User, Seller" --> C
    B -- "Other APIs" --> D
    C -- "ORM" --> E
    C -- "OTP, Rate Limit" --> F

=======

## 🛠️ Project Workflow

The workflow below describes the high-level user and system interactions in the E-commerce microservices platform. Each step is designed to ensure security, scalability, and a seamless user experience.

1. **User/Seller visits UI (Next.js)**

   - Users and sellers can register, login, or reset their password from the respective Next.js frontends.

2. **Registration**

   - User/Seller submits the registration form.
   - Auth Service validates the data, checks for existing accounts, and sends an OTP via email.
   - User/Seller enters the OTP to verify their account.
   - On successful verification, the account is created in MongoDB via Prisma.

3. **Login**

   - User/Seller submits their credentials.
   - Auth Service validates the credentials, issues JWT access and refresh tokens, and sets secure cookies.
   - The UI stores the session and fetches user data via `/api/logged-in-user`.

4. **Password Reset**

   - User/Seller requests a password reset.
   - Auth Service sends an OTP to the registered email.
   - User/Seller verifies the OTP and sets a new password.

5. **Token Refresh**

   - If the access token expires, the UI uses the refresh token to obtain a new one (handled automatically by the axios interceptor).

6. **API Gateway**

   - Routes requests to the appropriate microservices (auth, user, seller, etc.).

7. **Shared Packages**

   - Error handling, Prisma, Redis, and middleware are reused across all services for consistency and maintainability.

8. **CI/CD**
   - GitHub Actions run tests and build processes on every push or pull request to ensure code quality and reliability.

---

## 🗺️ System Architecture Diagram

```mermaid
flowchart TD
    subgraph Frontend
        A1[User UI (Next.js)]
        A2[Seller UI (Next.js)]
    end
    subgraph Gateway
        B[API Gateway (Express)]
    end
    subgraph Services
        C[Auth Service (Express, Prisma, Redis)]
        D[Other Microservices]
    end
    subgraph DB
        E[(MongoDB)]
        F[(Redis)]
    end

    A1 -- "API Calls" --> B
    A2 -- "API Calls" --> B
    B -- "Auth, User, Seller" --> C
    B -- "Other APIs" --> D
    C -- "ORM" --> E
    C -- "OTP, Rate Limit" --> F




    ///common error


1. Your first error
Failed to clean up the workspace data directory.
Error: EBUSY: resource busy or locked


This happens when some process (like the Nx daemon, Node process, or your editor) is still holding a lock on .nx/workspace-data/...db.


solution


✅ Fix:

Stop all Node processes:

npx nx reset --force
taskkill /F /IM node.exe


Then retry:

npx nx reset


If you want to support time-limited products in the future, add the date filter only when you actually have products with dates set:

const now = new Date();
const baseFilter: Prisma.productsWhereInput = {
  isDeleted: false,
  status: "Active",
  // Only add date logic when needed
  OR: [
    { starting_date: null, ending_date: null },
    { starting_date: { lte: now }, ending_date: { gte: now } },
  ],
};




<!-- nx erroor -->

<!-- isuueee -->
npx nx g @nx/express:app apps/kafka-service


 NX   The name should match the pattern "(?:^@[a-zA-Z0-9-*~][a-zA-Z0-9-*._~]*\/[a-zA-Z0-9-~][a-zA-Z0-9-._~]*|^[a-zA-Z][^:]*)$". The provided value "@./kafka-service-e2e" does not match.

Pass --verbose to see the stacktrace.




solution
npx nx g @nx/express:app kafka-service --directory=apps/kafka-service --e2eTestRunner=none
```
