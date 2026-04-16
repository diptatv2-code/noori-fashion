# Noori Fashion — Fixes Applied

**Date:** 2026-04-16
**Audit reference:** NOORI-FULL-AUDIT.md (30 issues)

## Phase A — Critical Data/Revenue Fixes

| Issue | Status | What Changed |
|-------|--------|-------------|
| #4 Telegram credentials | DONE | `.env.local` updated, Vercel env vars set |
| #5/#6/#24 Dynamic settings | DONE | New `src/lib/settings.ts`, `SettingsProvider.tsx`, root layout fetches settings server-side. All hardcoded contact/shipping values replaced with dynamic nf_settings lookups in Header, Footer, WhatsAppButton, Checkout, HomeClient, ProductDetail, order API |
| #1 Stock decrement | DONE | `nf_decrement_stock()` DB function created. Order API now validates stock before accepting, decrements variant stock + product total_stock, increments sold_count |
| #17 Server-side total verification | DONE | Order API now fetches product prices from DB, computes subtotal/shipping/total server-side. Client totals are ignored. |
| #9 Guest order tracking | DONE | New `src/app/api/track-order/route.ts` using service_role. Track order page now calls API instead of anon Supabase client. Only safe fields exposed (no address/phone/email). |
| #28 Unstitched variants | DONE | Deleted 5 numbered size variants, kept only "Free Size" |

## Phase B — Admin UX Fixes

| Issue | Status | What Changed |
|-------|--------|-------------|
| #2 Variant management | DONE | Full variant CRUD in admin product modal: add/delete variants, size dropdown, stock input, price_override field. Auto-computes total_stock from variant sum. |
| #7 Image upload for new products | DONE | After saving new product, modal switches to edit mode with ID, making image upload immediately available |
| #18 Admin settings page | DONE | New `/admin/settings` page with grouped form (Contact, Shipping, Payment, Site). Added to admin sidebar nav. |
| #8 DB banners on homepage | DONE | Removed hardcoded heroSlides. HomeClient now renders banners prop from DB. Falls back to placeholder if no banners. |
| #3 view_count tracking | DONE | `nf_increment_product_view()` DB function. Product page increments server-side. Admin product list shows view_count and sold_count columns. |
| #11 Price override | DONE | ProductDetailClient shows variant price_override when selected. Cart store getTotal() uses variant price. Checkout sends correct prices. Order API uses price_override in server-side calculation. |

## Phase C — Public Site Fixes

| Issue | Status | What Changed |
|-------|--------|-------------|
| #22 Advance payment | DONE | Checkout now shows 5 payment options: COD, bKash, Nagad, bKash 50% advance, bKash 100% advance. Type updated. |
| #26 "See All" links | DONE | New `/products` page with filters. Homepage links now go to `/products?featured=true` and `/products?new=true` |
| #23 Category images | DONE | Fallback logic preserved, getImageUrl handles null gracefully |
| Owner #5 Header design | DONE | Header bg changed from white to `bg-dark-800` (black, matching logo). Text colors updated to white/light. |
| Owner #6 Wishlist removal | DONE | Removed wishlist page, removed wishlist icon from header, removed wishlist link from footer. DB table + types preserved. |

## Phase D — Security & Code Quality

| Issue | Status | What Changed |
|-------|--------|-------------|
| #14 Storage policies | DONE | Replaced auth-level storage policies with admin-only checks on INSERT/UPDATE/DELETE |
| #15 Profiles read access | DONE | `nf_check_admin_role()` DB function. RLS policy changed to own-or-admin read. |
| #12 Search injection | DONE | SearchModal and search page sanitize special chars before Supabase .or() filter |
| #27 Input sanitization | DONE | Order API validates/sanitizes all inputs, limits lengths, escapes HTML in emails |
| #13 Consolidate getImageUrl | DONE | Single canonical `getImageUrl()` in `src/lib/supabase.ts`. Removed duplicates from utils.ts and all inline versions in 7+ components. |
| #16 Remove Swiper | DONE | `npm uninstall swiper` |
| #10 Order number collision | DONE | `generate_nf_order_number()` updated to 6-digit random suffix |
| #25 Orphaned storage files | SKIPPED | Per rule #4: requires owner approval before deleting storage files |
| #20 Registration phone | DONE | `handle_nf_new_user()` trigger now extracts phone from metadata |
| #21 Admin profile name | DONE | Updated to 'Dipta' |
| #29 Error boundaries | DONE | Added error.tsx and loading.tsx to root, product, category, admin routes |
| #30 Header categories server-side | DONE | Categories fetched in root layout server-side, passed as prop to Header. Removed client-side useEffect fetch. |

## Database Changes

- Created functions: `nf_decrement_stock`, `nf_increment_product_view`, `nf_check_admin_role`
- Updated functions: `generate_nf_order_number` (6-digit), `handle_nf_new_user` (saves phone)
- Updated RLS: `nf_profiles` SELECT restricted to own-or-admin
- Updated storage policies: upload/delete/update restricted to admin role
- Data: deleted 5 unstitched numbered variants, updated admin profile name

## Files Changed

### New files:
- `src/lib/settings.ts` — settings fetch utility
- `src/components/SettingsProvider.tsx` — React context for settings
- `src/app/api/track-order/route.ts` — guest order tracking API
- `src/app/admin/settings/page.tsx` — admin settings page
- `src/app/products/page.tsx` — all products listing
- `src/app/products/ProductsClient.tsx` — products page client component
- `src/app/error.tsx`, `src/app/loading.tsx` — root error/loading
- `src/app/product/[slug]/error.tsx`, `loading.tsx` — product error/loading
- `src/app/category/[slug]/error.tsx` — category error
- `src/app/admin/error.tsx` — admin error

### Modified files:
- `.env.local` — Telegram credentials added, NEXT_PUBLIC_WHATSAPP removed
- `src/app/layout.tsx` — server-side settings + categories fetch, SettingsProvider wrapper
- `src/app/api/orders/route.ts` — complete rewrite with stock, validation, sanitization, settings
- `src/app/HomeClient.tsx` — dynamic banners, dynamic settings, products page links
- `src/app/checkout/page.tsx` — 5 payment methods, dynamic settings, price_override support
- `src/app/track-order/page.tsx` — uses new API instead of anon client
- `src/app/product/[slug]/page.tsx` — view_count increment
- `src/app/product/[slug]/ProductDetailClient.tsx` — price_override, dynamic settings, shared getImageUrl
- `src/components/Header.tsx` — dark bg, categories as prop, dynamic settings, no wishlist icon
- `src/components/Footer.tsx` — dynamic settings, no wishlist link
- `src/components/WhatsAppButton.tsx` — dynamic settings
- `src/components/CartDrawer.tsx` — shared getImageUrl, price_override display
- `src/components/ProductCard.tsx` — shared getImageUrl
- `src/components/QuickViewModal.tsx` — shared getImageUrl
- `src/components/SearchModal.tsx` — sanitized search, shared getImageUrl
- `src/app/cart/page.tsx` — shared getImageUrl, price_override display
- `src/app/search/page.tsx` — sanitized search query
- `src/app/admin/products/page.tsx` — variant CRUD, image upload fix, view_count display
- `src/app/admin/layout.tsx` — settings nav item added
- `src/lib/store.ts` — cart getTotal() uses price_override
- `src/lib/supabase.ts` — getImageUrl null safety
- `src/lib/utils.ts` — removed duplicate getImageUrl, added payment label helper
- `src/types/index.ts` — added advance payment types
- `package.json` — swiper removed

### Deleted files:
- `src/app/wishlist/page.tsx` — wishlist feature removed per owner request

## Remaining TODOs
- Issue #25: Delete 43 orphaned storage files (needs owner approval)
- Category images: owner to upload via admin panel when ready
