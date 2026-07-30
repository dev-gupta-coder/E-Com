# API Specification — MERN E-Commerce (MVP)

Base URL: `/api`

Cross-cutting rule that applies to every mutating endpoint below: **the server never trusts client-submitted prices or totals.** Checkout, for example, reads the cart and product prices server-side and computes the total itself — a client could otherwise edit the request body and pay ₹1 for anything.

**Response envelope convention:** every successful response also includes `success: true` alongside the data shown below — e.g. `{ success: true, product }` rather than the bare `{ product }`. This was standardized starting at Step 5 (Auth) for consistency across the whole API and the frontend's Axios interceptor. Response shapes below omit `success: true` for brevity, but it's always present unless explicitly noted otherwise.

---

## Auth

### `POST /api/auth/register`
- **Auth:** none
- **Body:** `{ name, email, password }`
- **Response 201:** `{ success: true, user: { id, name, email, role } }` + sets access & refresh cookies
- **Errors:** 400 validation failure, 409 email already registered

### `POST /api/auth/login`
- **Auth:** none
- **Body:** `{ email, password }`
- **Response 200:** `{ success: true, user }` + sets cookies
- **Errors:** 400 validation, 401 invalid credentials

### `POST /api/auth/refresh`
- **Auth:** refresh token cookie required
- **Response 200:** new access token cookie set
- **Errors:** 401 invalid/expired refresh token → client should force logout

### `POST /api/auth/logout`
- **Auth:** access token
- **Response 200:** clears both cookies

### `GET /api/auth/me`
- **Auth:** access token
- **Response 200:** `{ user }`
- **Notes:** called once on app load to hydrate Redux auth state and check "am I already logged in"

---

## Products

### `GET /api/products`
- **Auth:** none (public)
- **Query params:** `page`, `limit`, `category`, `minPrice`, `maxPrice`
- **Response 200:** `{ products: [...], total, page, pages }`

### `GET /api/products/:id`
- **Auth:** none
- **Response 200:** `{ product }`
- **Errors:** 404 not found

### `POST /api/products`
- **Auth:** admin
- **Body:** `{ name, description, price, category, stock, images: [] }`
- **Response 201:** `{ product }`
- **Errors:** 400 validation, 403 not admin

### `PUT /api/products/:id`
- **Auth:** admin
- **Body:** any subset of product fields
- **Response 200:** `{ product }`
- **Errors:** 404 not found, 403 not admin

### `DELETE /api/products/:id`
- **Auth:** admin
- **Response 200:** `{ success: true }`
- **Errors:** 404 not found, 403 not admin

---

## Cart

### `GET /api/cart`
- **Auth:** customer
- **Response 200:** `{ cart: { items: [{ product, quantity }], ... } }` — items populated with live product data (name, price, image, current stock)
- **Notes:** cart is created lazily on first cart-touching request, not at registration

### `POST /api/cart/items`
- **Auth:** customer
- **Body:** `{ productId, quantity }`
- **Behavior:** if the product is already in the cart, **increments** the existing quantity by the given amount (does not overwrite) — distinct from PATCH's set semantics below
- **Response 200:** `{ cart }`
- **Errors:** 400 invalid quantity, 404 product not found (malformed id treated the same as a well-formed-but-nonexistent id, per the Step 6 Products convention), 409 insufficient stock

### `PATCH /api/cart/items/:productId`
- **Auth:** customer
- **Body:** `{ quantity }`
- **Behavior:** sets the quantity to this **absolute** value (not an increment) — standard REST PATCH semantics, and what makes this endpoint meaningfully different from POST above
- **Response 200:** `{ cart }`
- **Errors:** 400 invalid quantity, 404 item not in cart, 409 insufficient stock

### `DELETE /api/cart/items/:productId`
- **Auth:** customer
- **Response 200:** `{ cart }`
- **Behavior:** **idempotent** — deleting an item not currently in the cart still returns 200 (the desired end-state, "item absent," is already true), unlike PATCH which 404s on a missing item since it has nothing to update

---

## Orders

### `POST /api/orders`
- **Auth:** customer
- **Body:** `{ shippingAddress }`
- **Behavior:** server loads the user's cart server-side (never trusts a client-submitted cart or prices), re-validates stock, snapshots product name/price into order items, computes total itself
- **Response 201:** `{ order }`
- **Errors:** 400 empty cart, 409 stock changed since item was added to cart
- **Side effects:** decrements `Product.stock` for each item, clears the user's cart

### `GET /api/orders/my`
- **Auth:** customer
- **Response 200:** `{ orders: [...] }` — only orders belonging to `req.user.id`

### `GET /api/orders`
- **Auth:** admin
- **Query params:** `page`, `limit`
- **Response 200:** `{ orders: [...], total, page, pages }` — all orders across all customers

### `GET /api/orders/:id`
- **Auth:** customer (own order only) or admin (any order)
- **Response 200:** `{ order }`
- **Errors:** 403 if a customer requests someone else's order id, 404 not found