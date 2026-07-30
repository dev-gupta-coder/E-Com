# Build Steps — Phase 1 (MVP)

Build strictly in this order. Each step should be fully working (and, where possible, manually testable) before moving to the next. Do not jump ahead.

---

## Backend

### Step 1 — Backend skeleton
- Init `server/` with `package.json`, install express, mongoose, dotenv, cors, cookie-parser, bcrypt, jsonwebtoken
- `config/db.js` — MongoDB connection
- `app.js` — express app, core middleware wiring (json parser, cookie-parser, cors)
- `server.js` — entry point, starts HTTP server
- `.env.example` with placeholder keys
- **Done when:** server boots and connects to MongoDB Atlas with no errors

### Step 2 — Core utils + error handling
- `utils/AppError.js`, `utils/asyncHandler.js`, `utils/generateTokens.js`
- `middlewares/error.middleware.js`, wired as the last `app.use()` in `app.js`
- **Done when:** a deliberately-thrown test error returns a clean `{ success: false, message }` response instead of a raw stack trace

### Step 3 — User model
- `models/user.model.js` per `@docs/DATABASE.md` — schema, pre-save bcrypt hook, `comparePassword` method
- **Done when:** a user can be created directly via a script/console with the password stored hashed, not plaintext

### Step 4 — Auth middleware
- `middlewares/auth.middleware.js` — `isAuthenticated`, `isAdmin`
- **Done when:** a protected test route correctly rejects requests with no/invalid token and passes with a valid one

### Step 5 — Auth: full flow
- `validators/auth.validator.js`, `controllers/auth.controller.js`, `routes/auth.routes.js`
- Implements register, login, refresh, logout, me (per `@docs/API-SPEC.md`)
- **Done when:** full register → login → access protected route → refresh → logout flow works end-to-end via Postman/Thunder Client

### Step 6 — Product module
- `models/product.model.js`, `validators/product.validator.js`, `controllers/product.controller.js`, `routes/product.routes.js`
- Public list/detail + admin create/update/delete
- **Done when:** an admin user can CRUD products, and a public request can list/view them without auth

### Step 7 — Cart module
- `models/cart.model.js`, `controllers/cart.controller.js`, `routes/cart.routes.js`
- **Done when:** a logged-in customer can add/update/remove cart items and stock limits are enforced

### Step 8 — Order module
- `models/order.model.js`, `validators/order.validator.js`, `controllers/order.controller.js`, `routes/order.routes.js`
- Checkout logic: server-side price snapshot, stock decrement, cart clearing
- **Done when:** a customer can check out their cart into an order, stock decrements correctly, and the order appears in their order history

### Step 9 — Backend wiring review
- Final CORS config (locked to client origin), cookie settings (`secure`, `sameSite` for production), confirm `.env.example` is complete
- **Done when:** the full backend API works end-to-end via an API client with no manual DB edits required

---

## Frontend

### Step 10 — Frontend skeleton
- Init `client/` with Vite + React, install Tailwind, React Router, Redux Toolkit, Axios
- Set up folder structure per `@docs/ARCHITECTURE.md`
- **Done when:** a blank styled page renders with Tailwind confirmed working

### Step 11 — Axios instance + interceptors
- `api/axiosInstance.js` — base config (`withCredentials: true`), response interceptor for 401 → silent refresh → retry
- **Done when:** an expired access token triggers a silent refresh without the user noticing (tested manually by shortening token expiry temporarily)

### Step 12 — Auth: Redux + pages
- `features/auth/authSlice.js`, `authAPI.js`, `LoginPage.jsx`, `RegisterPage.jsx`, `ProtectedRoute.jsx`, `hooks/useAuth.js`
- **Done when:** a user can register/login through the UI and protected routes correctly redirect when logged out

### Step 13 — Products: Redux + pages
- `features/products/productSlice.js`, `productAPI.js`, `HomePage.jsx`, `ProductDetailPage.jsx`
- **Done when:** products load from the real API and render on the home page and detail page

### Step 14 — Cart: Redux + page
- `features/cart/cartSlice.js`, `cartAPI.js`, `CartPage.jsx`, wire "Add to Cart" into `ProductCard.jsx`
- **Done when:** cart state updates in the UI and persists correctly against the real cart API

### Step 15 — Checkout + Orders: Redux + pages
- `features/orders/orderSlice.js`, `orderAPI.js`, `CheckoutPage.jsx` (shipping address form + place order), `OrderHistoryPage.jsx`
- **Done when:** a full checkout completes and the resulting order shows up in order history

### Step 16 — Admin pages
- `AdminProductsPage.jsx` (CRUD UI), `AdminOrdersPage.jsx` (read-only order list)
- **Done when:** an admin-role user can manage products and view all orders through the UI

### Step 17 — Final wiring
- `Navbar.jsx` (auth state + cart badge), `routes/AppRoutes.jsx`, environment variable wiring for API base URL
- **Done when:** the whole app is navigable end-to-end as a real user would use it

---

## Deployment

### Step 18 — Deploy
- Backend → Render (env vars set), Frontend → Vercel (env var for API URL), DB → MongoDB Atlas
- **Done when:** the deployed app satisfies the Definition of Done in `@docs/PRD.md` §8, live on the internet
