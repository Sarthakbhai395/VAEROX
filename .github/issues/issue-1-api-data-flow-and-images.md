# Audit & Refactor: End-to-End API Flow (User & Seller) and Dynamic Product Images

## Description
Analyze and audit the end-to-end API flow for both users and sellers to verify that data is correctly fetched, stored, and displayed in real time without lag or caching inconsistencies. Additionally, ensure that dynamic product images are propagated across all checkout stages instead of static/dummy placeholders.

## Tasks & Requirements

### 1. End-to-End API Audit
- [ ] **User APIs**: Verify that cart operations (`CartContext`), wishlist toggles (`WishlistContext`), and order transactions correctly persist to MongoDB in real time.
- [ ] **Seller APIs**: Verify that product creation, inventory adjustments, and analytics updates correctly update database records and reflect immediately on dashboards.
- [ ] **Error Handling & DB Integrity**: Ensure mongoose model validations catch edge cases and return clean, standard HTTP status codes.

### 2. Dynamic Product Image Propagation
- [ ] **Catalog & Lists**: Ensure `ProductCard` renders actual stored product image paths from backend uploads instead of placeholder images.
- [ ] **Cart & Wishlist**: Ensure `CartItem` and `WishlistItem` components dynamically fetch and display the specific product variant image.
- [ ] **Checkout & Payment**: Propagate the selected product image path to the checkout page and Razorpay payment details screen.

## Acceptance Criteria
- No dummy/placeholder images are displayed for created products.
- Frontend context states are perfectly synchronized with MongoDB database updates.
