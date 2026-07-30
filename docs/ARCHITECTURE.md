# Architecture — MERN E-Commerce (MVP)

## 1. System Overview

Two independently deployable pieces talking only over HTTPS:

```
[Browser]
    | HTTPS
    v
[Vercel: React SPA (client)]
    | Axios, withCredentials: true (cookies)
    v
[Render: Express API (server)]
    |                    |
    v                    v
[MongoDB Atlas]     [Cloudinary]
```

The client never talks to MongoDB or Cloudinary directly. Every read/write to the database, and every image upload, is brokered by the server. This is the "client asks, server decides" rule from earlier, made concrete.

---

## 2. Tech Stack Decisions (and why)

| Choice | Why |
|---|---|
| Vite (not CRA) | Native ESM dev server, much faster HMR. CRA is unmaintained. |
| Redux Toolkit (not just Context) | Cart/auth state is read by unrelated components (navbar badge, product card, checkout page). One global store avoids nested-provider prop drilling. Slight overkill at MVP scale, but it's the real pattern used in production frontends — that's the point of building it this way. |
| Axios (not fetch) | Interceptors. This is the deciding factor — we need to auto-attach requests with cookies and auto-retry after a silent token refresh. Doing that with raw fetch means reimplementing what Axios gives free. |
| Tailwind | Utility classes keep styling co-located with markup, no parallel CSS file to keep in sync. |
| Express (not Nest/Fastify) | Matches "real company patterns" without an extra framework abstraction layer on top of a small MVP. |
| Mongoose (not native driver) | Schema validation, hooks (password hashing pre-save), query ergonomics. |

---

## 3. Backend Folder Structure

```
server/
├── src/
│   ├── config/
│   │   ├── db.js               # Mongoose connection setup
│   │   └── cloudinary.js       # Cloudinary SDK config
│   ├── models/
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── cart.model.js
│   │   └── order.model.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   └── order.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   └── order.routes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js    # isAuthenticated, isAdmin
│   │   ├── error.middleware.js   # centralized error handler
│   │   └── validate.middleware.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── product.validator.js
│   │   └── order.validator.js
│   ├── utils/
│   │   ├── AppError.js          # custom error class
│   │   ├── asyncHandler.js      # wraps controllers, forwards errors to next()
│   │   └── generateTokens.js    # JWT sign/verify helpers
│   ├── app.js                   # express app + middleware wiring
│   └── server.js                # entry point, starts HTTP server
├── .env
├── .env.example
└── package.json
```

**Why no `services/` layer yet:** at MVP size, controller → model directly is honest and readable — adding a service layer now would be abstraction with no payoff. We'll introduce one the moment a controller starts orchestrating multiple models in one operation (order creation touching Cart + Product + Order together is the likely first candidate — we'll decide for real when we write it).

---

## 4. Frontend Folder Structure

```
client/
├── src/
│   ├── app/
│   │   └── store.js              # Redux store configuration
│   ├── features/
│   │   ├── auth/
│   │   │   ├── authSlice.js
│   │   │   └── authAPI.js
│   │   ├── products/
│   │   │   ├── productSlice.js
│   │   │   └── productAPI.js
│   │   ├── cart/
│   │   │   ├── cartSlice.js
│   │   │   └── cartAPI.js
│   │   └── orders/
│   │       ├── orderSlice.js
│   │       └── orderAPI.js
│   ├── components/               # shared, "dumb" components
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/                    # route-level components
│   │   ├── HomePage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── OrderHistoryPage.jsx
│   │   └── admin/
│   │       ├── AdminProductsPage.jsx
│   │       └── AdminOrdersPage.jsx
│   ├── api/
│   │   └── axiosInstance.js      # base config + interceptors
│   ├── hooks/
│   │   └── useAuth.js
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── App.jsx
│   └── main.jsx
├── .env
└── package.json
```

**Why "feature folders" (group by feature, not by file type):** in real production frontends, changing or removing "cart" should mean touching one folder — not hunting across separate `reducers/`, `components/`, `api/` directories for every cart-related file.

---

## 5. Request Flow — Worked Example: Add to Cart

1. User clicks "Add to Cart" on `ProductCard.jsx`
2. `onClick` dispatches an async thunk from `cartSlice.js`
3. Thunk calls `cartAPI.js` → Axios `POST /api/cart/items` (`withCredentials: true` so cookies ride along)
4. Request reaches Express → `cart.routes.js`
5. `auth.middleware.js` verifies the access token cookie, attaches `req.user`
6. `validate.middleware.js` checks body shape (`productId`, `quantity`)
7. `cart.controller.js` runs: loads the product, checks stock, upserts the cart item
8. Mongoose writes to MongoDB, returns the updated cart
9. Controller sends `{ success: true, cart }`
10. Axios resolves in the thunk → `cartSlice` reducer updates Redux state
11. Every component subscribed via `useSelector` (e.g. Navbar's cart badge) re-renders automatically

---

## 6. Auth Architecture

- **Access token:** short-lived (~15 min), httpOnly cookie, verified on every protected request.
- **Refresh token:** long-lived (7–30 days), httpOnly cookie, only ever sent to `/api/auth/refresh`.
- **Flow:** login sets both cookies → access token expires → next protected request returns 401 → Axios response interceptor silently calls `/api/auth/refresh` → new access cookie set → original request retried once → if refresh also fails, force logout and redirect to login.

This refresh-and-retry interceptor is one of the trickiest pieces in the whole project — multiple requests can hit 401 at nearly the same moment and each try to trigger a refresh independently if we're not careful. That's a dedicated lesson when we build it, not something to gloss over.

---

## 7. Error Handling Strategy

- `AppError` class: `(message, statusCode)` — thrown from controllers for expected failures (not found, validation, unauthorized).
- `asyncHandler` wraps every controller so we don't write `try/catch` in each one — it forwards rejected promises to `next(err)`.
- A single centralized `error.middleware.js`, registered last in `app.js`, formats every error response consistently: `{ success: false, message }` (stack trace only in dev mode, never in production).

---

## 8. Deployment Architecture

- **Client** → Vercel (static build, `VITE_API_URL` env var pointing at the deployed API).
- **Server** → Render (env vars: `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, Cloudinary keys, `CLIENT_URL` for CORS allowlist).
- **Database** → MongoDB Atlas (free tier is enough for MVP).
- **Images** → Cloudinary (upload flow — signed vs unsigned preset — decided when we build the admin product-image upload feature).
