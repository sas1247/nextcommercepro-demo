# NextCommerce Pro

Modern **full-stack Next.js eCommerce template** with Admin Panel, Authentication, Stripe payments, Email system and production-ready architecture.

Built for developers who want to launch an online store quickly.

---

# Features

## Storefront
- Modern responsive storefront
- Product categories
- Product search
- Product pages
- Add to cart
- Wishlist
- Checkout flow
- Discount codes
- Order history
- User accounts

## Admin Panel
- Dashboard analytics
- Product management
- Orders management
- Customer management
- Voucher / coupon system
- Sales reports

## Authentication
- Email/password authentication
- Secure JWT cookies
- Admin role system
- Password reset flow

## Payments
- Stripe Checkout integration
- Secure payment flow
- Order confirmation

## Email system
- Order confirmation emails
- Password reset emails
- Newsletter support

## Marketing
- Newsletter subscribers
- Discount vouchers
- Marketing module

---

# Tech Stack

- **Next.js 16**
- **React 19**
- **Prisma ORM**
- **SQLite (default template DB)**
- **Stripe**
- **JWT authentication**
- **Tailwind CSS**
- **Nodemailer**

---

# Project Structure
src
app
(shop) → storefront pages
admin → admin panel
api → backend routes

lib
prisma.ts
jwt.ts
mailer.ts
password.ts
money.ts

prisma
schema.prisma
seed.js


---

# Installation

## 1 Install dependencies
npm install


---

## 2 Configure environment

Create a `.env` file based on `.env.example`

Example:
DATABASE_URL="file:./dev.db"

JWT_SECRET="change_this_secret"

NEXT_PUBLIC_DEFAULT_CURRENCY="USD"
NEXT_PUBLIC_DEFAULT_LOCALE="en-US"

ADMIN_EMAIL="admin@admin.com"
ADMIN_PASSWORD="Admin123!"

---

## 3 Initialize database

Run Prisma migration and seed demo data:
npx prisma db push
npx prisma db seed

This will create:

- Admin user
- Demo categories
- Demo products

---

## 4 Start development server

This will create:

- Admin user
- Demo categories
- Demo products

---

## 4 Start development server
npm run dev

Open:
http://localhost:3000

---

# Admin Login

Default credentials:
Email: admin@admin.com
Password: Admin123!

Admin panel:
/admin

---

# Stripe Setup

To enable payments:

1. Create a Stripe account
2. Get API keys
3. Add them to `.env`
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

---

# Email Setup

Configure SMTP for emails.

Example:
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

Used for:

- Order confirmation
- Password reset
- Notifications

---

# Database

Default template uses **SQLite** for simplicity.

For production you can easily switch to:

- PostgreSQL
- MySQL
- Supabase
- PlanetScale

Just update:
DATABASE_URL

in `.env`.

---

# Demo Data

The seed script automatically creates:

- 7 categories
- 15 demo products
- 1 admin user

You can edit:
prisma/seed.js

to customize demo data.

---

# Deployment

Recommended platforms:

- Vercel
- Railway
- Render
- DigitalOcean
- AWS

Before deploying:

1️⃣ configure environment variables  
2️⃣ configure Stripe  
3️⃣ configure email

---

# Production Checklist

Before launching a store:

- Change admin credentials
- Configure Stripe
- Configure SMTP
- Set secure JWT_SECRET
- Replace demo products
- Replace demo images

---

# Customization

You can easily modify:

- UI components
- Color scheme
- Product models
- Checkout logic
- Admin dashboard

All code is **fully modular and documented**.

---

# Support

If you have questions or need help integrating the template, feel free to contact.

---

# License

This template is licensed for use in commercial projects.

Resale of the template itself is not permitted.

---

# NextCommerce Pro

A modern **Next.js eCommerce starter kit** designed for developers and startups who want to launch online stores quickly.
