# Design System — MERN E-Commerce

## 1. Philosophy

Modern, premium, highly readable, production-ready. Reference feel: Apple, Stripe, Linear, Vercel, Shopify, Notion — minimal and professional, never flashy. A user should understand any screen within a few seconds. Usability always wins over visual effect.

---

## 2. Glassmorphism — where and how (hybrid approach)

The app is **not** glassmorphic throughout. Glass is used only on transient/floating UI, never on content the user needs to read carefully.

**Use glass on:**
- Navbar (sticky)
- Notification panel
- User profile dropdown menu
- Search overlay
- Cart drawer
- Sidebar (admin, optional)
- Floating action buttons

**Never use glass on:**
- Product cards
- Product detail page
- Checkout
- Login / Signup pages
- Forms
- Tables (customer or admin)
- Long content pages

**Note (resolved at Step 12):** Login/Signup were originally listed as glass modals here, but `ARCHITECTURE.md` §4 had already placed `LoginPage.jsx`/`RegisterPage.jsx` in `pages/`, not `components/` — a real conflict between the two docs that only surfaced once built. Resolved in favor of full pages: `ProtectedRoute` needs a concrete, bookmarkable `/login` URL regardless of styling, and cart being login-gated (`PRD.md` §5.3) means users already leave their browsing context to authenticate, so a "stay in place" modal wouldn't serve a real flow. A true dismissible login modal remains possible as a deliberate future enhancement, but is new scope, not something implied by the current build.

**Reference Tailwind pattern** — reuse this exact combination everywhere glass is used, so it's visually consistent instead of reinvented per component:

```
Light background behind glass:
bg-white/70 backdrop-blur-md border border-white/40 shadow-sm

Dark background behind glass (hero sections, dark mode):
bg-black/30 backdrop-blur-md border border-white/10
```

`backdrop-blur` has a real rendering cost — keep it to small, mostly-static surfaces (a navbar, a drawer panel), never a scrolling grid of dozens of product cards.

---

## 3. Layout skeleton

Every page follows: **Top Navigation → Page Header → Content Area → Footer** (where applicable). Consistent margins and spacing across every page — no page should feel like it belongs to a different app.

---

## 4. Typography

Font: **Inter** (Google Fonts, variable weight).

| Element | Size / line-height | Weight |
|---|---|---|
| H1 | 32px / 40px | 600 |
| H2 | 24px / 32px | 600 |
| H3 | 18px / 28px | 600 |
| Body | 16px / 24px | 400 |
| Small / caption | 14px / 20px | 400, muted color |

Never go below 14px for user-facing text.

---

## 5. Color palette

Six roles, reused everywhere — no ad hoc colors introduced per page.

| Role | Value | Use |
|---|---|---|
| Neutral background | `#F9FAFB` (gray-50) | Page background |
| Neutral surface | `#FFFFFF` | Cards, panels |
| Neutral border | `#E5E7EB` (gray-200) | Hairlines |
| Neutral text | `#111827` primary / `#6B7280` secondary | Body copy |
| Primary accent | `#4F46E5` (indigo-600) | CTAs, links, active states |
| Success | `#16A34A` (green-600) | Confirmations, in-stock |
| Warning | `#D97706` (amber-600) | Low stock, caution |
| Error | `#DC2626` (red-600) | Validation errors, out-of-stock |
| Info | `#2563EB` (blue-600) | Neutral notices |

These map directly to Tailwind's default palette (`indigo-600`, `green-600`, etc.) — alias `primary` to indigo in `tailwind.config.js` if semantic class names like `bg-primary` are wanted.

---

## 6. Spacing

8px base unit — only ever use 4, 8, 12, 16, 24, 32, 48, 64px (Tailwind's default `p-1`…`p-16` scale already matches this). Never invent an arbitrary spacing value.

---

## 7. Components — baseline rules

- **Buttons:** one style per role (primary filled / secondary outline / ghost text), reused everywhere — never a one-off style per page.
- **Cards:** white surface, `border border-gray-200`, `rounded-xl`, consistent padding (`p-4` or `p-6`), no glass.
- **Inputs:** label above the field (placeholder is example text, not a label substitute), visible focus ring (`focus:ring-2 focus:ring-indigo-500`), error state = red border + explicit message (never color alone).
- **Modals:** glass allowed here (login/signup) per §2.
- **Tables:** sticky header, row hover highlight, generous row padding, no glass.
- **Badges / alerts:** tinted background + matching text color (e.g. `bg-green-50 text-green-700`), never a saturated fill behind body text.

---

## 8. Product card — required info hierarchy

Image → Name → Category → Price → Rating → Stock status → Wishlist button → Add to Cart button, in that order. No glass effect.

---

## 9. Forms

Every field supports: default, focus, error, disabled, loading (submit), success states. Error messages are specific text, never color-only. Always show a real label — placeholder is not a substitute.

---

## 10. Tables

Sorting, search, filter, pagination, sticky header on tall tables, responsive (horizontal scroll or stacked cards on mobile). Never glass.

---

## 11. Animation

Subtle and purposeful only: hover transitions (~150ms), modal/drawer open (~200–250ms ease-out), skeleton loading placeholders during fetch, accordion expand/collapse. No bounce, no exaggerated motion.

---

## 12. Icons

`lucide-react` exclusively — never mix icon libraries. Consistent sizing per context: 16px inline, 20px in buttons, 24px standalone.

---

## 13. Responsive

Mobile-first: build the mobile layout first, then expand with `md:`/`lg:` breakpoints — not the reverse. Every page must work at mobile, tablet, and desktop widths.

---

## 14. Accessibility

Sufficient contrast (the palette above meets WCAG AA for normal text on its paired backgrounds). Full keyboard navigation. Semantic HTML (`<button>`, `<nav>`, `<label>` — not divs pretending to be buttons). Visible focus states always. No interaction that depends only on `:hover` — must also work via focus/tap.

---

## 15. Performance

Compress images before/at upload (Cloudinary transformation params can do this automatically). Lazy-load routes (`React.lazy` + `Suspense`). Lazy-load below-the-fold images (`loading="lazy"`). Memoize only where a real re-render cost is observed — not by default.

---

## 16. UI Review — required after every page or component

Before moving to the next step in `BUILD-STEPS.md`, briefly explain:
- Why this layout was chosen
- Why the spacing works
- Why these colors were selected
- Why each component is placed where it is
- What UX principle is being followed
- What could realistically confuse a user
- One concrete way the page could be improved further

Keep it proportional — a few sentences per point, not an essay. The goal is understanding the reasoning, not a design thesis.