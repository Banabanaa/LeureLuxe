# 👜 Leure Luxe

**Leure Luxe** from designer handbags to statement jewelry and fashion must-haves, each item at Leure Luxe is carefully selected to ensure quality, authenticity, and value. We are a curated accessories shop that offers a wide selection of premium, preloved, and on-sale pieces from selected brands. Our preloved collection gives iconic items a second life—making luxury more sustainable and accessible.

**Leure Luxe** offers a premium selection of:

- Belts  
- Handbags  
- Jewelry  
- Scarves  
- Sunglasses  
- Wallets  
- Watches  

Our catalog includes both brand-new and **preloved** luxury items from trusted brands. Every piece is handpicked to ensure **authenticity**, **style**, and **value**. By giving iconic pieces a second life, Leure Luxe promotes a more **sustainable** approach to fashion.

---

## ✨ Features

- ✅ Authenticated user accounts (via Clerk)
- 🛍️ Add to cart, wishlist, and secure checkout (via Stripe)
- 💬 Real-time content management for products, categories, and brands (via Sanity CMS)
- 🌐 Responsive, SEO-friendly frontend built with Next.js and Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend

- **React** – Component-based UI
- **Next.js** – Framework with SSR, API routes, and optimizations
- **TypeScript** – Type-safe development
- **Tailwind CSS** – Utility-first styling
- **Clerk** – Authentication and user session management

### Backend & CMS

- **Sanity** – Headless CMS for structured content and real-time updates
- **Stripe** – Secure payment processing
- **Node.js** – Server-side logic via Next.js API routes

---

## 📦 Dependencies

Before running the project, make sure the following packages are installed:

### Core

```bash
npm install react react-dom next typescript tailwindcss postcss autoprefixer
```

### Clerk (Authentication)

```bash
npm install @clerk/clerk-react @clerk/nextjs
```

### Stripe (Payments)

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### Sanity (CMS Integration)

```bash
npm install @sanity/client groq
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Banabanaa/LeureLuxe.git
cd leure-luxe
```

### 2. Install All Dependencies

```bash
npm install
```

### 3. Create `.env.local` File

Create a `.env.local` file in the root directory to store your environment variables:

```bash
touch .env.local
```

Then add the following keys (replace with your actual credentials):

```env
# Clerk
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Sanity
SANITY_PROJECT_ID=your_sanity_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token
```

> Tip: You may want to include a `.env.example` file in the repo to guide future developers.

### 4. Start the Development Server

```bash
npm run dev
```

Then open your browser and go to:  
[http://localhost:3000](http://localhost:3000)

---

## 🧪 Sanity Studio (Optional CMS Panel)

If you also manage the Sanity Studio for content editing, navigate into your `/sanity` folder and run:

```bash
sanity dev
```

Make sure to log in using your Sanity.io account.

---

## 💬 Support

If you encounter any issues or have questions about the project, feel free to contact me via email: imbmillosa@gmail.com.

---
