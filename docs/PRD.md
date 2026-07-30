# Product Requirements Document — MERN E-Commerce (MVP)

**Project type:** Learning-focused solo build
**Author:** Dev
**Status:** Phase 1 (MVP)
**Last updated:** 2026-07-26

---

## 1. Purpose

Build a production-style e-commerce platform using the MERN stack, scoped down to a **shippable MVP** first. This is not a toy CRUD app — folder structure, error handling, auth, and data modeling should reflect how a real product team would build it, just without every module a full marketplace would eventually need.

Secondary purpose: this project is a teaching vehicle. Every module built should leave Dev able to explain *why* it exists, not just that it works.

---

## 2. Goals

- Ship a working store: user can register/login, browse products, add to cart, and place an order.
- Establish patterns (auth, error handling, API structure, schema design) that Phase 2 features can be added to *without* a rewrite.
- Keep the codebase small enough that Dev can hold the entire request-flow in his head at any point.

## 3. Non-Goals (explicitly out of scope for MVP)

These are real features, deliberately deferred to Phase 2 so MVP stays finishable:

- Product reviews & ratings
- Admin analytics dashboard
- Wishlist
- Coupons / discounts
- Multi-vendor / seller accounts
- Order tracking, shipping status, courier integration
- Email notifications (order confirmation, password reset via email)
- Advanced search/filter (facets, autocomplete)
- Inventory-level stock alerts

---

## 4. User Roles (MVP)

| Role | Capabilities |
|---|---|
| **Guest** | Browse products, view product detail. Cannot checkout. |
| **Customer** | Everything a guest can do + register/login, manage cart, place orders, view own order history. |
| **Admin** | Login (no separate signup flow), create/edit/delete products, view all orders (read-only in MVP — no status updates yet, that's Phase 2). |

No seller role in MVP. Only two real roles: `customer`, `admin` — stored as an enum on the User model.

---

## 5. Core Features & Requirements

### 5.1 Authentication
- Email + password registration and login.
- Passwords hashed with bcrypt — never stored or logged in plaintext.
- JWT-based auth: short-lived **access token** + long-lived **refresh token**.
- Both tokens delivered via **httpOnly, secure cookies** (not localStorage) — mitigates XSS token theft.
- Refresh endpoint to silently reissue access tokens.
- Logout clears cookies server-side.
- Route protection middleware: `isAuthenticated`, `isAdmin`.

### 5.2 Product Catalog
- Public endpoints: list products (with pagination), get single product by ID.
- Fields: name, description, price, category (fixed enum for MVP — no dynamic category management yet), stock quantity, images (Cloudinary URLs).
- Admin-only endpoints: create, update, delete product.
- Basic filtering: by category, by price range. (Full search/facets deferred.)

### 5.3 Cart
- Cart tied to logged-in user (guest cart is Phase 2 — for MVP, cart requires login).
- Add item, update quantity, remove item, view cart.
- **Price snapshot at add-time is NOT used in MVP** — cart always reflects live product price, recalculated at checkout. (We'll discuss the tradeoff here — it's a real design decision, not a shortcut.)
- Stock validation: cannot add more than available stock.

### 5.4 Checkout & Orders
- Checkout creates an Order from the current cart contents.
- Order stores a **snapshot** of product name/price/quantity at time of purchase (orders must never change if the product is edited/deleted later — this one *does* need snapshotting, unlike the cart).
- Payment: MVP ships with **Cash on Delivery (COD)** only. Real payment gateway (Razorpay) integration is the first Phase 2 item, kept separate so auth/order plumbing is solid before adding money-movement complexity.
- On successful order: cart is cleared, stock is decremented.
- Stock decrement must be safe against race conditions (two users buying the last unit) — this will be a dedicated lesson when we get there.
- Customer can view their own order history. Admin can view all orders (read-only).

---

## 6. Data Entities (high-level — full schema comes in DATABASE.md, not here)

- **User** — email, password hash, name, role (`customer` | `admin`), timestamps.
- **Product** — name, description, price, category, stock, images[], createdBy (admin ref).
- **Cart** — user ref, items[] (product ref + quantity).
- **Order** — user ref, items[] (snapshotted name/price/qty), total, status (`placed` | `cancelled` for MVP — no shipped/delivered states yet), paymentMethod (`COD`), createdAt.

---

## 7. Non-Functional Requirements

- **Security:** helmet, CORS locked to frontend origin, rate limiting on auth routes, input validation on every mutating endpoint.
- **Error handling:** centralized Express error-handling middleware; no raw stack traces sent to client in production.
- **Validation:** request body validation at the route/controller boundary (library choice — e.g. `zod` or `express-validator` — is something we'll pick together when we get there, with reasons).
- **Environment config:** `.env` for secrets (Mongo URI, JWT secrets, Cloudinary keys), never committed to Git.
- **Consistency:** REST conventions — proper HTTP methods/status codes, plural resource names (`/api/products`, not `/api/getProducts`).

---

## 8. Definition of Done (MVP)

A customer can, end-to-end, without touching the database directly:
1. Register and log in.
2. Browse products and view a product detail page.
3. Add items to cart, adjust quantities.
4. Check out and place a COD order.
5. See that order in their order history.

An admin can, end-to-end:
1. Log in.
2. Create, edit, and delete a product.
3. View the list of all orders placed.

If all of the above works with proper auth guards, validation, and no plaintext secrets in the repo — MVP is done.

---

## 9. Phase 2 (parking lot, not designed yet)

Razorpay integration, reviews, admin analytics, wishlist, coupons, multi-vendor, shipping/order-status tracking, email notifications, advanced search. These will each get their own design pass when we get there — not designed now to avoid over-engineering the MVP schema prematurely.

## 10. Known Limitations (MVP, deliberately deferred)

- **Checkout is not wrapped in a real MongoDB transaction.** Stock decrements per item are individually atomic (safe against concurrent overselling — verified at Step 8), but if the Node process crashes between one item's successful decrement and either a later item's failure or the compensating rollback completing, that stock stays permanently decremented for an order that was never created. A real fix wraps every checkout write (stock decrements, `Order.create`, cart clear) in `session.withTransaction(...)` — deferred because it requires threading a session through every operation plus MongoDB's retry-on-transient-error pattern, which is more than this MVP step calls for. Not blocked by infrastructure — Atlas free tier is a replica set and already supports transactions.