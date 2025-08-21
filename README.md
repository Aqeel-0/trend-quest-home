# ShopCompare - Price Comparison Platform

A modern e-commerce price comparison platform built with React, TypeScript, and Supabase. Compare prices across multiple stores and find the best deals on your favorite products.

## Features

- 🔍 **Product Search**: Search across thousands of products with real-time results
- 💰 **Price Comparison**: Compare prices from multiple retailers in one place  
- 📱 **Responsive Design**: Fully responsive design for desktop and mobile
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 🏷️ **Category Browse**: Browse products by categories
- ⭐ **Product Reviews**: View ratings and reviews for products
- 🛍️ **Product Details**: Detailed product pages with specifications and images

## Supabase Integration ✅

The application is fully integrated with Supabase for:

- **Database**: Product catalog, categories, brands, listings, and variants
- **Real-time API**: RESTful API for all product operations  
- **Custom Hooks**: React hooks for data fetching with caching
- **Type Safety**: Auto-generated TypeScript types from database schema

### Database Schema

- `brands` - Product brands and manufacturers
- `categories` - Product categories with hierarchical structure  
- `products` - Product information and specifications
- `product_variants` - Product variations (color, size, etc.)
- `listings` - Price listings from different retailers

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (Database, Auth, API)
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: TanStack React Query  
- **Routing**: React Router DOM
- **UI Components**: Radix UI primitives

## Project info

**URL**: https://lovable.dev/projects/14db4297-1c2e-44a8-8835-ebc25332e419

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/14db4297-1c2e-44a8-8835-ebc25332e419) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/14db4297-1c2e-44a8-8835-ebc25332e419) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
