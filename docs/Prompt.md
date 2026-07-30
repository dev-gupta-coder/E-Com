# Prompts — Phase 1 (MERN E-Commerce MVP)

One prompt per step in `docs/BUILD-STEPS.md`. Paste each into the Claude Code extension **one at a time, in order** — don't paste more than one at once, and don't move to the next until the current step is done and you've understood it.

All of these assume `CLAUDE.md` sits at your project root (Claude Code reads it automatically) and the `docs/` folder is in place.

---

## Step 1 — Backend skeleton

```
We're on Step 1 of @docs/BUILD-STEPS.md: set up the backend skeleton.

Init `server/` with package.json (express, mongoose, dotenv, cors, cookie-parser,
bcrypt, jsonwebtoken). Create `config/db.js` (Mongoose connection using MONGO_URI
from env), `app.js` (express app + core middleware: json parser, cookie-parser,
cors), `server.js` (entry point, starts HTTP server), and `.env.example` with
placeholder keys.

Reference @docs/ARCHITECTURE.md §3 for the exact folder structure to follow.

Follow the teaching process in CLAUDE.md: explain what we're building and why
before writing code, scope code only to this step, explain non-obvious lines
after, then stop and wait for my confirmation before moving to Step 2.

Build Step 1 now.
```

---

## Step 2 — Core utils + error handling

```
We're on Step 2 of @docs/BUILD-STEPS.md: core utils and centralized error handling.

Create utils/AppError.js, utils/asyncHandler.js, utils/generateTokens.js, and
middlewares/error.middleware.js, wired as the last app.use() in app.js. Prove
it works with one deliberately-thrown test error that returns a clean
{ success: false, message } response instead of a raw stack trace.

Follow the teaching process in CLAUDE.md. Build Step 2 now, then stop for my
confirmation.
```

---

## Step 3 — User model

```
We're on Step 3 of @docs/BUILD-STEPS.md: the User model.

Build models/user.model.js exactly per the schema and reasoning in
@docs/DATABASE.md §2 — fields, the select:false on password, the pre-save
bcrypt hook with the isModified guard, and the comparePassword instance method.

Follow the teaching process in CLAUDE.md. Build Step 3 now, then stop for my
confirmation.
```

---

## Step 4 — Auth middleware

```
We're on Step 4 of @docs/BUILD-STEPS.md: auth middleware.

Build middlewares/auth.middleware.js with isAuthenticated and isAdmin. Verify
against a quick protected test route that it correctly rejects invalid/missing
tokens and passes valid ones.

Follow the teaching process in CLAUDE.md. Build Step 4 now, then stop for my
confirmation.
```

---

## Step 5 — Auth: full flow

```
We're on Step 5 of @docs/BUILD-STEPS.md: the complete auth flow.

Build validators/auth.validator.js, controllers/auth.controller.js, and
routes/auth.routes.js implementing register, login, refresh, logout, and me —
exactly per the contracts in @docs/API-SPEC.md (Auth section). Confirm the
full register -> login -> protected route -> refresh -> logout flow works
end-to-end via an API client.

Follow the teaching process in CLAUDE.md. Build Step 5 now, then stop for my
confirmation.
```

---

## Step 6 — Product module

```
We're on Step 6 of @docs/BUILD-STEPS.md: the Product module.

Build models/product.model.js (per @docs/DATABASE.md §3),
validators/product.validator.js, controllers/product.controller.js, and
routes/product.routes.js — public list/detail plus admin create/update/delete,
per @docs/API-SPEC.md (Products section).

Follow the teaching process in CLAUDE.md. Build Step 6 now, then stop for my
confirmation.
```

---

## Step 7 — Cart module

```
We're on Step 7 of @docs/BUILD-STEPS.md: the Cart module.

Build models/cart.model.js (per @docs/DATABASE.md §4), controllers/cart.controller.js,
and routes/cart.routes.js — add/update/remove cart items with stock validation,
per @docs/API-SPEC.md (Cart section).

Follow the teaching process in CLAUDE.md. Build Step 7 now, then stop for my
confirmation.
```

---

## Step 8 — Order module

```
We're on Step 8 of @docs/BUILD-STEPS.md: the Order module — the trickiest
backend piece so far.

Build models/order.model.js (per @docs/DATABASE.md §5, including the embedded
shippingAddress), validators/order.validator.js, controllers/order.controller.js,
and routes/order.routes.js. Checkout must read the cart server-side, snapshot
product name/price into order items, recompute the total itself, decrement
stock, and clear the cart — per @docs/API-SPEC.md (Orders section). Flag the
stock-decrement race condition explicitly, even if we're not fully solving it yet.

Follow the teaching process in CLAUDE.md. Build Step 8 now, then stop for my
confirmation.
```

---

## Step 9 — Backend wiring review

```
We're on Step 9 of @docs/BUILD-STEPS.md: backend wiring review — no new
features, just hardening what exists.

Review and finalize: CORS locked to the client origin, cookie settings
(secure, sameSite) correct for production, and confirm .env.example lists
every env var actually used so far. Then walk through the full backend API
end-to-end (all modules) via an API client with no manual DB edits required.

Follow the teaching process in CLAUDE.md. Do Step 9 now, then stop for my
confirmation before we move to the frontend.
```

---

## Step 10 — Frontend skeleton (already scaffolded)

```
We're on Step 10 of @docs/BUILD-STEPS.md: frontend skeleton.

The client/ folder already exists — it was pre-scaffolded with Vite + React +
Tailwind + Redux Toolkit + Axios + React Router, following the folder structure
in @docs/ARCHITECTURE.md §4, with lucide-react and the Inter font already wired
in per @docs/DESIGN-SYSTEM.md.

Run npm install in client/, confirm the dev server boots, and confirm Tailwind
+ Inter font are actually rendering (not just present in config). Don't
recreate any files that already exist — just verify and report what you find.

Follow the teaching process in CLAUDE.md. Do Step 10 now, then stop for my
confirmation.
```

---

## Step 11 — Axios instance + interceptors

```
We're on Step 11 of @docs/BUILD-STEPS.md: Axios interceptors for silent token
refresh.

Build out src/api/axiosInstance.js with a response interceptor: on a 401,
silently call /api/auth/refresh, then retry the original request once; if
refresh also fails, force logout. Explain the race-condition risk (multiple
simultaneous 401s each triggering their own refresh) and how we're guarding
against it.

Follow the teaching process in CLAUDE.md. Build Step 11 now, then stop for my
confirmation.
```

---

## Step 12 — Auth: Redux + pages

```
We're on Step 12 of @docs/BUILD-STEPS.md: auth Redux slice + Login/Register
pages.

Build features/auth/authSlice.js, authAPI.js, real LoginPage.jsx and
RegisterPage.jsx (replacing the stubs), a working ProtectedRoute.jsx, and
hooks/useAuth.js. Apply @docs/DESIGN-SYSTEM.md — decide whether login/signup
is a modal (glass treatment, §2) or a full page (plain form styling, §9), and
explain which you chose and why.

Follow the teaching process in CLAUDE.md, including the UI Review from
@docs/DESIGN-SYSTEM.md §16 after building these pages. Build Step 12 now, then
stop for my confirmation.
```

---

## Step 13 — Products: Redux + pages

```
We're on Step 13 of @docs/BUILD-STEPS.md: products Redux slice + Home/Detail
pages.

Build features/products/productSlice.js, productAPI.js, real HomePage.jsx and
ProductDetailPage.jsx. Product cards follow the exact info hierarchy in
@docs/DESIGN-SYSTEM.md §8 (image -> name -> category -> price -> rating ->
stock -> wishlist -> add to cart) — no glass effect on cards, per §2.

Follow the teaching process in CLAUDE.md, including the UI Review. Build
Step 13 now, then stop for my confirmation.
```

---

## Step 14 — Cart: Redux + page

```
We're on Step 14 of @docs/BUILD-STEPS.md: cart Redux slice + Cart page.

Build features/cart/cartSlice.js, cartAPI.js, real CartPage.jsx, and wire
"Add to Cart" into ProductCard.jsx. If the cart is presented as a drawer, use
the glass treatment from @docs/DESIGN-SYSTEM.md §2; if it's a full page, keep
it flat per the "never glass" list.

Follow the teaching process in CLAUDE.md, including the UI Review. Build
Step 14 now, then stop for my confirmation.
```

---

## Step 15 — Checkout + Orders: Redux + pages

```
We're on Step 15 of @docs/BUILD-STEPS.md: checkout + order history.

Build features/orders/orderSlice.js, orderAPI.js, real CheckoutPage.jsx
(shipping address form + place order button) and OrderHistoryPage.jsx.
Checkout is a form — no glass, per @docs/DESIGN-SYSTEM.md §2 and §9 (all form
states: default/focus/error/disabled/loading/success).

Follow the teaching process in CLAUDE.md, including the UI Review. Build
Step 15 now, then stop for my confirmation.
```

---

## Step 16 — Admin pages

```
We're on Step 16 of @docs/BUILD-STEPS.md: admin pages.

Build real AdminProductsPage.jsx (CRUD UI) and AdminOrdersPage.jsx (read-only
order list). Tables follow @docs/DESIGN-SYSTEM.md §10 (sorting, search,
filter, pagination, sticky header, never glass).

Follow the teaching process in CLAUDE.md, including the UI Review. Build
Step 16 now, then stop for my confirmation.
```

---

## Step 17 — Final wiring

```
We're on Step 17 of @docs/BUILD-STEPS.md: final frontend wiring.

Build the real Navbar.jsx (glass treatment per @docs/DESIGN-SYSTEM.md §2,
showing auth state + cart badge), wire all real routes into AppRoutes.jsx,
and confirm VITE_API_URL is correctly used everywhere. Walk the app
end-to-end as a real user would.

Follow the teaching process in CLAUDE.md, including a final UI Review of the
navbar specifically. Build Step 17 now, then stop for my confirmation.
```

---

## Step 18 — Deploy

```
We're on Step 18 of @docs/BUILD-STEPS.md: deployment.

Walk me through deploying: backend to Render (env vars set), frontend to
Vercel (VITE_API_URL pointing at the deployed backend), database on MongoDB
Atlas. Confirm the deployed app satisfies the Definition of Done in
@docs/PRD.md §8, live on the internet.

Follow the teaching process in CLAUDE.md. Do Step 18 now.
```-