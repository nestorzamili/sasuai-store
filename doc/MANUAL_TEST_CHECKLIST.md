# Manual Test Checklist - Sasuai Store

This document provides a comprehensive manual testing checklist for the Sasuai Store application, covering flow from Authentication to the Final Transaction process.

## 1. Authentication Module

**Base Endpoint**: `/api/auth` (Better-Auth)

| Test Case ID | Feature | Description | Positive Case | Negative Case | Endpoint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | **Sign Up** | Register a new user account. | **Input**: Valid name, unique email, strong password.<br>**Result**: account created, verification email sent (if enabled), 200 OK. | **Input**: Existing email or short password.<br>**Result**: 400 Bad Request, "Email already in use" or validation error. | `POST /api/auth/sign-up` |
| **AUTH-02** | **Sign In** | Authenticate an existing user. | **Input**: Valid email & password.<br>**Result**: Session token set (cookie), redirect to dashboard, 200 OK. | **Input**: Wrong password or non-existent email.<br>**Result**: 401/400 Error, "Invalid credentials". | `POST /api/auth/sign-in` |
| **AUTH-03** | **Email Verification** | Verify email address from link. | **Action**: Click link from email.<br>**Result**: Email marked verified, access to protected routes. | **Action**: Use expired or invalid token.<br>**Result**: Error page or "Invalid token" message. | `/api/auth/verify-email` |
| **AUTH-04** | **Forgot Password** | Request password reset link. | **Input**: Registered email.<br>**Result**: Email sent with reset link. | **Input**: Unregistered email.<br>**Result**: Generic success message (security) or error (depending on config). | `POST /api/auth/forget-password` |
| **AUTH-05** | **Reset Password** | Set new password using token. | **Input**: Valid token, new strong password.<br>**Result**: Password updated, user can login with new credentials. | **Input**: Expired token or weak password.<br>**Result**: Validation error or "Token expired". | `POST /api/auth/reset-password` |
| **AUTH-06** | **Session** | Check session persistence | **Action**: Refresh page.<br>**Result**: User remains logged in. | **Action**: Manipulate cookie.<br>**Result**: Session invalid, redirected to login. | `GET /api/auth/session` |
| **AUTH-07** | **Sign Out** | Terminate session. | **Action**: Click Logout.<br>**Result**: Cookie cleared, redirected to login page. | N/A | `POST /api/auth/sign-out` |

---

## 2. User Management Module

**Context**: Admin Dashboard (`/users`)

| Test Case ID | Feature | Description | Positive Case | Negative Case | Endpoint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **USER-01** | **List Users** | View table of registered users. | **Action**: User with 'admin' role accesses page.<br>**Result**: Table loads with user data. | **Action**: Non-admin user tries to access.<br>**Result**: 403 Forbidden or Redirect to home. | `GET /api/users` (or Server Action) |
| **USER-02** | **Update Role** | Change a user's role (e.g., user to admin). | **Input**: Select new role for a user.<br>**Result**: Role updated, permissions reflect immediately/refresh. | **Input**: Try to demote self if only admin (logic dependent). | `PATCH /api/users/[id]/role` |
| **USER-03** | **Edit Profile** | Update user details. | **Input**: Valid name update.<br>**Result**: Data saved. | **Input**: Invalid email format.<br>**Result**: Validation error. | `PATCH /api/users/[id]` |

---

## 3. Product & Inventory Module

**Context**: Product Dashboard (`/products`)

| Test Case ID | Feature | Description | Positive Case | Negative Case | Endpoint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PROD-01** | **List Products** | View all products. | **Result**: List returns with pricing, stock, name. | N/A | `GET /api/products` |
| **PROD-02** | **Update Stock** | Manage inventory levels. | **Input**: Add 10 to stock.<br>**Result**: New stock count reflects in DB and UI. | **Input**: Negative stock value.<br>**Result**: Validation error. | `PATCH /api/products/[id]` |

---

## 4. Member Management

**Context**: Member Dashboard (`/members`)

| Test Case ID | Feature | Description | Positive Case | Negative Case | Endpoint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MEM-01** | **Member Status** | Check active/banned status. | **Result**: Active member can earn points. | **Result**: Banned member rejected at transaction. | `GET /api/members/[id]` |

---

## 5. Transaction & POS (Final Process)

**Core Feature**: Processing a sale. This is the critical revenue path.
**Endpoint**: `POST /api/transactions`

### Data Structure for Testing
```json
{
  "items": [
    { "productId": "uuid...", "quantity": 1, "discountId": null }
  ],
  "memberId": "optional-uuid",
  "paymentMethod": "CASH", // or QRIS, TRANSFER
  "cashAmount": 100000,
  "globalDiscountCode": null
}
```

| Test Case ID | Feature | Description | Positive Case | Negative Case |
| :--- | :--- | :--- | :--- | :--- |
| **TX-01** | **Basic Sale (Cash)** | Simple transaction, no member. | **Input**: 1 Item (qty 1), Cash Payment >= Total.<br>**Result**: <br>1. Success (201 created)<br>2. Stock reduced by 1<br>3. Change calculated correctly. | **Input**: Cash Amount < Total Amount.<br>**Result**: 400 Bad Request ("Insufficient payment"). |
| **TX-02** | **Member Sale (Points)** | Transaction attached to a member. | **Input**: Valid MemberID attached.<br>**Result**: <br>1. Transaction created.<br>2. Member points increased (if rule enabled).<br>3. Transaction shows up in Member history. | **Input**: Invalid/Banned Member ID.<br>**Result**: 400 Bad Request ("Member not found" or "Member Banned"). |
| **TX-03** | **Inventory Check** | Validate stock limits. | **Input**: Request quantity <= Available Stock.<br>**Result**: Success. | **Input**: Request quantity > Available Stock.<br>**Result**: 400 Error ("Insufficient stock for product X"). |
| **TX-04** | **Discount Application** | Apply product/global discount. | **Input**: Valid Discount ID applied.<br>**Result**: Final total reduced by discount amount effectively. | **Input**: Expired or Invalid Discount.<br>**Result**: Error or Discount ignored (depending on logic). |
| **TX-05** | **Multiple Items** | Cart with mixed items. | **Input**: 3 diff products.<br>**Result**: Total sum correct, all stocks reduced appropriately. | **Input**: One of the items invalid.<br>**Result**: Entire transaction rolls back (Atomic transaction). |
| **TX-06** | **Non-Cash Payment** | QRIS or Debit. | **Input**: Method=QRIS, cashAmount not required (or equals total).<br>**Result**: Success, recorded as QRIS. | **Input**: Missing specific metadata if required.<br>**Result**: Validation error. |

---

## 6. History & Reporting

**Context**: Transaction History (`/transactions`)

| Test Case ID | Feature | Description | Positive Case | Negative Case | Endpoint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **HIST-01** | **View History** | List past transactions. | **Filter**: Date Range = Today.<br>**Result**: Shows TX-01, TX-02 from above. | **Filter**: Future date.<br>**Result**: Empty list. | `GET /api/transactions` |
| **HIST-02** | **Filter Details** | Filter by method or amount. | **Filter**: Payment = CASH, Min = 1000.<br>**Result**: Filtered list matches criteria. | N/A | `GET /api/transactions?minAmount=...` |
| **HIST-03** | **Detail View** | View specific receipt/invoice. | **Action**: Click transaction.<br>**Result**: Shows detailed items, timestamp, and cashier name. | N/A | `GET /api/transactions/[id]` |

## Recommended Manual Testing Flow

1.  **Setup**:
    *   Ensure database is seeded (Products, 1 Admin User, 1 Member).
    *   Log in as Admin.
2.  **Preparation**:
    *   Go to `/products`, note the stock of "Product A" (e.g., 100).
    *   Go to `/members`, note the points of "Member A" (e.g., 0).
3.  **Execute Transaction**:
    *   Call `POST /api/transactions` (via Postman or UI if available).
    *   Payload: Buy 2 "Product A", attach "Member A", Pay "CASH".
4.  **Verification**:
    *   **Response**: Check for `success: true`.
    *   **Stock**: Check `/products`, "Product A" should be 98.
    *   **Points**: Check `/members`, "Member A" should have points > 0.
    *   **History**: Check `/transactions`, new entry should appear at top.
5.  **Negative Test**:
    *   Try to buy 200 "Product A".
    *   Expect: Error message, Stock remains 98.
