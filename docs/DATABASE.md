# Database Design — MERN E-Commerce (MVP)

## 1. Design Principles

- **Embed** data that is always accessed together with its parent and doesn't grow unbounded (e.g. order line items inside the Order document).
- **Reference** data that is independently large, queried on its own, or can change ownership (e.g. a Product referenced by ObjectId from Cart/Order, never embedded as a live copy).
- Schemas are kept deliberately flat for MVP — no product variants, no polymorphic categories. Adding that later means extending, not rewriting, if we get the embed/reference calls right now.

---

## 2. User

| Field | Type | Notes |
|---|---|---|
| name | String, required | |
| email | String, required, unique, lowercase, **indexed** | Login looks this up on every request — without an index, Mongo does a full collection scan as users grow. Unique index also blocks duplicate accounts at the DB level, not just app logic. |
| password | String, required, `select: false` | `select: false` means a normal `User.find()` never returns the hash unless explicitly requested with `.select('+password')`. Prevents an easy mistake: forgetting to strip the hash before sending a user object to the client. |
| role | String, enum `['customer', 'admin']`, default `'customer'` | Fixed enum for MVP — no dynamic roles yet. |
| timestamps | — | `createdAt`/`updatedAt` auto-managed by Mongoose. |

**Mongoose hook:** `pre('save')` — hash the password with bcrypt, but only `if (this.isModified('password'))`.
Why the `isModified` check matters: without it, every save on a user document (even just updating their name) re-hashes the already-hashed password, corrupting it and locking them out permanently. This is a real, common bug.

**Instance method:** `comparePassword(candidate)` using `bcrypt.compare`.
Why a method on the model instead of calling bcrypt directly in the controller: the controller shouldn't need to know *how* passwords are verified — it just asks the model "does this match," keeping bcrypt as an implementation detail that can change later without touching every controller that checks a password.

---

## 3. Product

| Field | Type | Notes |
|---|---|---|
| name | String, required | |
| description | String, required | |
| price | Number, required, min 0 | See note below on money-as-Number. |
| category | String, enum (fixed list, e.g. `electronics, clothing, home, books, other`) | Fixed for MVP — dynamic category management is a Phase 2 concern. |
| stock | Number, required, min 0, default 0 | |
| images | [String] | Cloudinary URLs. |
| createdBy | ObjectId, ref `User` | The admin who created it — useful for audit even with a single-admin MVP. |
| timestamps | — | |

**Money-as-Number gotcha (real production lesson, not a nitpick):** floating point numbers have precision issues (`0.1 + 0.2 !== 0.3`). For MVP we're using `Number` for simplicity, but serious payment systems store money as an integer count of the smallest unit (paise, cents) specifically to avoid float rounding errors compounding across thousands of transactions. Worth knowing now even if we don't refactor for it yet.

**Planned index (add when we build the filter feature, not before):** compound index on `category + price` if "filter by category, sort by price" turns out to be a common query pattern.

---

## 4. Cart

| Field | Type | Notes |
|---|---|---|
| user | ObjectId, ref `User`, required, **unique** | One cart per user — the unique index enforces this at the DB level, not just in application logic. |
| items | `[{ product: ObjectId ref Product, quantity: Number, min: 1 }]` | |
| timestamps | — | |

**Why the cart does NOT snapshot price:** a cart is *shopping intent*, not a financial record. If a product's price changes while sitting in someone's cart, showing the live price (and re-validating stock) at checkout is the correct, expected behavior — you've likely seen "price changed since you added this" on real stores. This is different from an Order, below, which must never silently change.

---

## 5. Order

| Field | Type | Notes |
|---|---|---|
| user | ObjectId, ref `User`, required | |
| items | `[{ product: ObjectId ref Product, name: String, price: Number, quantity: Number }]` | `name` and `price` are **copied** (snapshotted) at order time — not just a live reference. |
| shippingAddress | Embedded subdocument: `{ fullName, phone, addressLine1, addressLine2, city, state, pincode }` | Embedded, not referenced — it's a one-time snapshot of where this specific order was shipped, not a reusable "saved addresses" feature (that's Phase 2). |
| totalAmount | Number, required | |
| paymentMethod | String, enum `['COD']`, default `'COD'` | Real gateways (Razorpay) added in Phase 2. |
| status | String, enum `['placed', 'cancelled']`, default `'placed'` | Shipped/delivered states are Phase 2, once we add order tracking. |
| timestamps | — | |

**Why snapshot name/price into the order, instead of populating from Product at read time:** if an admin edits or deletes that product six months later, the customer's order history — and any dispute or invoice — must still show exactly what they paid, at exactly that price, on that day. `populate()` would silently show *today's* (possibly changed or now-nonexistent) product data instead of history. This is a hard requirement, not a style choice — order records are effectively legal/financial documents.

---

## 6. Relationships

```
User  1 ─── 1  Cart
User  1 ─── N  Order
Product 1 ─── N  CartItem      (live reference — always reflects current product)
Product ~~~~~ N  OrderItem     (snapshotted — frozen at time of purchase, reference kept only for admin traceability)
```

---

## 7. Indexes Summary

| Collection | Index | Reason |
|---|---|---|
| User | `email` (unique) | Fast login lookup + hard block on duplicate accounts |
| Cart | `user` (unique) | Enforces one cart per user at the DB level |
| Product | `category` (planned) | Added when we build the category filter feature — not created prematurely |

---

## 8. Deliberately NOT Modeled in MVP

- **Product variants** (size/color) — flat schema for now.
- **Soft deletes** (`isDeleted` flag on Product) — Phase 2, if order-history integrity needs more than snapshotting alone provides.
- **Saved/multiple addresses** — MVP only stores the address used for that one order, embedded in the Order itself.
