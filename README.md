# 🍗 Chick Central - Food Ordering Website

A modern, full-featured food ordering website for Chick Central - specializing in flavored chicken wings and fun bites.

## 📍 Location & Hours

**Location:** Taguig, Manila, Philippines  
**Operating Hours:** 7:00 AM - 12:00 AM (Daily)

## 🌟 Features

### Customer Features
- **Browse Menu** - View all menu items organized by category
- **Flavor Selection** - Choose from 8 delicious flavors for wings
- **Add-ons** - Extra rice, drinks, and sides
- **Shopping Cart** - Full cart management with quantity controls
- **Multiple Service Types**:
  - 🪑 Dine-in (party size selection)
  - 🥡 Pickup (time selection)
  - 🛵 Delivery (address entry)
- **GCash Payment** - QR code payment integration
- **Messenger Checkout** - Send orders via Facebook Messenger

### Admin Dashboard
- **Menu Management** - Add, edit, delete menu items
- **Category Management** - Organize menu categories
- **Flavor Variations** - Manage flavor options with images
- **Add-ons Management** - Configure additional items
- **Image Upload** - Upload images for menu items and flavors
- **Site Settings** - Update logo, name, and description

## 🚀 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📋 Menu Categories

- 🍚 Fun Bites (with rice)
- 🐔 Fun Bites (ala carte)
- 🟡 Jumbo Wings
- 🐔 Junior Wings
- 🍜 Side Dishes & Add-ons

## 🎨 Flavors

8 signature flavors available:
- 🔥 Buffalo Blaze
- 🍯 Soy Garlic Glaze
- 🧈 Honey Butter Bliss
- 🧀 Garlic Parmesan Charm
- ❄️ Snow Cheese Magic
- 🥢 Teriyaki Twist
- 🌶️ Yangneum Heat
- 🍖 BBQ Buzz

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account

### Environment Variables
Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Database Setup
1. Create a Supabase project
2. Run migrations in `supabase/migrations/` folder
3. Import complete menu from `RESTORE_CHICK_CENTRAL_COMPLETE.sql` in Supabase SQL Editor

## 📱 Usage

### Customer Access
- Visit website homepage
- Browse menu and add items to cart
- Proceed to checkout
- Fill in details (name, contact, service type)
- Complete payment via GCash
- Send order through Messenger

### Admin Access
- Navigate to `/admin`
- Manage menu items, categories, and settings
- Upload images for products
- Update flavor variations

## 🔧 Admin Dashboard

Access at: `your-website.com/admin`

Features:
- ➕ Add new menu items
- ✏️ Edit existing items
- 🗑️ Delete items
- 📁 Manage categories
- 🖼️ Upload images
- ⚙️ Site settings

## 💳 Payment

**GCash Integration:**
- QR code payment display
- InstaPay support
- Receipt screenshot verification
- Messenger order confirmation

## 📦 Project Structure

```
src/
├── components/        # React components
│   ├── AdminDashboard.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Menu.tsx
│   └── ...
├── hooks/            # Custom React hooks
├── lib/              # Supabase client
├── types/            # TypeScript types
└── utils/            # Utility functions

public/
├── images/
│   ├── flavors/      # Flavor images
│   ├── payment-qr/   # GCash QR code
│   └── posters/      # Promotional posters

supabase/
└── migrations/       # Database migrations
```

## 🎯 Key Files

- `RESTORE_CHICK_CENTRAL_COMPLETE.sql` - Complete menu restoration script (20 items, all flavors, 30pcs options)
- `.env` - Environment variables (not in git)
- `vercel.json` - Vercel deployment config

## 🚀 Deployment

### Vercel
1. Connect GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Environment Variables in Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📝 License

Private project for Chick Central.

## 🤝 Support

For issues or questions, contact the development team.

---

**Made with ❤️ for Chick Central** 🍗
