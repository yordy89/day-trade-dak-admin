# DayTradeDak Admin Dashboard

Professional admin dashboard for the DayTradeDak trading education platform.

## Features

- 📊 **Real-time Analytics Dashboard**
- 👥 **User Management System**
- 💳 **Subscription & Payment Management**
- 📚 **Content Management System**
- 🌍 **Multi-language Support** (English/Spanish)
- 🌓 **Dark/Light Theme**
- 📱 **Fully Responsive Design**
- 🔒 **Secure Authentication**

## Tech Stack

- **Framework**: Next.js 15.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Internationalization**: i18next
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Components**: Headless UI + Custom Components

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the admin dashboard.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/         
│   ├── dashboard/      # Dashboard-specific components
│   ├── layout/         # Layout components
│   └── providers/      # Context providers
├── lib/                # Utilities and configurations
├── locales/           # Translation files
├── store/             # Zustand stores
├── styles/            # Global styles
├── types/             # TypeScript types
└── utils/             # Helper functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm run format:write` - Format code with Prettier

## Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=mongodb://localhost:27017/daytradedak

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# AWS
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

## Key Features

### Dashboard Overview
- Real-time statistics cards
- Revenue and user growth charts
- Recent activity timeline
- Quick action buttons

### User Management
- User list with search and filters
- User details and edit capabilities
- Subscription management per user
- Role-based access control

### Content Management
- Video upload and management
- Course creation and organization
- Content analytics
- Access control by subscription

### Payment Management
- Transaction history
- Subscription analytics
- Payment method management
- BNPL integration monitoring

## Responsive Design

The admin dashboard is fully responsive with breakpoints:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### Mobile Features
- Bottom navigation
- Swipeable cards
- Touch-optimized controls
- Responsive charts

## Security

- JWT authentication
- Role-based access control
- API rate limiting
- HTTPS enforcement
- OWASP compliance

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Proprietary - DayTradeDak © 2025