# AgroMarket Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

A modern agricultural marketplace frontend built with Next.js 14, React 18, TypeScript, and Tailwind CSS.

## Features

- 🛒 **Shopping Cart** - Full cart management with backend persistence
- 🔐 **Authentication** - Login/logout with JWT token management
- 📦 **Products** - Browse, search, and filter products by category
- 👨‍🌾 **Sellers** - View seller profiles and their products
- 🗺️ **Geolocation** - Map integration for nearby sellers
- 📊 **Inventory Management** - Create, edit, and manage product listings
- 💳 **Checkout** - Complete order processing
- 📱 **Responsive Design** - Mobile-first UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom wrapper
- **Maps**: Leaflet
- **Code Quality**: Biome (linting & formatting)

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes (internal fallback)
│   │   ├── cart/              # Shopping cart page
│   │   ├── checkout/          # Checkout flow
│   │   ├── inventory/         # Inventory management
│   │   ├── login/             # Authentication
│   │   ├── products/          # Product pages
│   │   ├── sell/              # Create new listings
│   │   ├── sellers/           # Seller profiles
│   │   └── store/             # Main storefront
│   ├── components/
│   │   ├── layout/            # Navbar, layouts
│   │   └── map/               # Map components
│   ├── lib/
│   │   ├── auth/              # Auth context & hooks
│   │   ├── services/          # HTTP services (auth, cart, products)
│   │   ├── server/            # Server-side utilities
│   │   └── store.tsx          # Global state provider
│   └── data/                  # Mock data & types
├── public/                     # Static assets
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun package manager
- Backend API running (default: http://localhost:3001)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd frontend
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: Static API token (if needed for development)
NEXT_PUBLIC_API_TOKEN=
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. **Open the application**

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Backend API Integration

The frontend requires a NestJS backend API. Key endpoints used:

### Authentication
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (optional)

### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Cart
- `GET /cart` - Get user's active cart
- `POST /cart/items` - Add item to cart
- `PATCH /cart/items/:id` - Update cart item quantity
- `DELETE /cart/items/:id` - Remove item from cart
- `DELETE /cart/items` - Clear cart
- `POST /cart/checkout` - Process checkout

### Authentication Flow

1. User logs in via `/login`
2. Backend returns `{ accessToken, user }`
3. Token is stored in `localStorage` as `accessToken`
4. All HTTP requests automatically include `Authorization: Bearer <token>`
5. Cart and protected routes require authentication

## Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production Build
npm run build        # Create optimized production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run Biome linter
npm run format       # Format code with Biome
npm run typecheck    # Run TypeScript compiler check
```

## Deployment

### Deploy on Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/agro-market-front)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Vercel will automatically detect Next.js

3. **Configure environment variables**
   - Add `NEXT_PUBLIC_API_URL` with your production backend URL
   - Add any other required environment variables

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Get a production URL (e.g., `https://your-app.vercel.app`)

5. **Set up automatic deployments**
   - Every push to `main` branch triggers a new deployment
   - Pull requests get preview deployments

### Deploy on Netlify

1. **Build settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Install command: `npm install`

2. **Configure**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

3. **Environment variables**
   - Set `NEXT_PUBLIC_API_URL` in Netlify dashboard

### Deploy with Docker

1. **Create Dockerfile**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

2. **Build and run**

```bash
# Build image
docker build -t agro-market-frontend \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourbackend.com .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourbackend.com \
  agro-market-frontend
```

3. **Docker Compose** (with backend)

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/agro
```

### Deploy on Traditional Hosting (VPS/Shared)

1. **Build the project**

```bash
npm run build
npm run start
```

2. **Use PM2 for process management**

```bash
# Install PM2 globally
npm install -g pm2

# Start the app
pm2 start npm --name "agro-market" -- start

# Save PM2 configuration
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

3. **Configure reverse proxy (Nginx)**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables for Production

```bash
# Required
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Optional
NEXT_PUBLIC_API_TOKEN=              # Static token (not recommended for production)
NEXT_TELEMETRY_DISABLED=1           # Disable Next.js telemetry
NODE_ENV=production                  # Set production mode
```

## Build Optimization

The project is configured for optimal production builds:

- ✅ Automatic code splitting
- ✅ Image optimization with Next.js Image component
- ✅ Font optimization with `next/font`
- ✅ CSS optimization and purging
- ✅ Bundle analysis available with `npm run analyze`
- ✅ TypeScript type checking in CI/CD

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Learn More

To learn more about Next.js and the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework
- [Headless UI](https://headlessui.com/) - unstyled UI components
- [TypeScript](https://www.typescriptlang.org/docs/) - typed JavaScript

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE) - feel free to use this project for learning or commercial purposes.

