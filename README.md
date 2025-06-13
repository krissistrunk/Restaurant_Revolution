# 🍽️ RestaurantRush

A comprehensive full-stack restaurant management application built with React, TypeScript, Express, and modern web technologies.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Functionality
- 🍽️ **Interactive Menu System** - Browse categories, view detailed menu items with images and descriptions
- 🛒 **Order Management** - Place orders, track status, and view order history
- 📅 **Reservation System** - Book tables with date, time, and party size selection
- 🎫 **Virtual Queue** - Join waiting lists with real-time position tracking
- ⭐ **Review System** - Rate and review dining experiences
- 🏆 **Loyalty Program** - Earn and track loyalty points with rewards

### User Experience
- 👤 **User Authentication** - Secure registration and login system
- 📊 **Personal Dashboard** - View order history, loyalty points, and statistics
- 🎯 **Personalized Recommendations** - AI-powered menu suggestions based on preferences
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🔔 **SMS Notifications** - Real-time updates for queue status and reservations

### Admin Features
- 📈 **Analytics Dashboard** - Track orders, revenue, and customer insights
- 🍴 **Menu Management** - Add, edit, and organize menu items and categories
- 📋 **Order Tracking** - Manage incoming orders and update statuses
- 👥 **Customer Management** - View customer profiles and order history

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide Icons** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **Drizzle ORM** - Modern TypeScript ORM
- **PostgreSQL** - Primary database (with in-memory fallback)
- **Zod** - Schema validation library

### Development Tools
- **ESBuild** - Fast JavaScript bundler
- **TSX** - TypeScript execution environment
- **Drizzle Kit** - Database migration tool

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **PostgreSQL** (optional - uses in-memory storage by default)

## 🚀 Installation

### Option 1: Quick Start (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/krissistrunk/Restaurant_Rush.git
   cd Restaurant_Rush
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   ./start-app.sh
   ```

4. **Open your browser**
   ```
   http://localhost:5001
   ```

### Option 2: Development Setup

1. **Clone and install** (same as above)
   ```bash
   git clone https://github.com/krissistrunk/Restaurant_Rush.git
   cd Restaurant_Rush
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **In a separate terminal, start the backend**
   ```bash
   npm run server
   ```

4. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5001`

### Option 3: Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🎯 Usage

### Getting Started

1. **Create an Account**
   - Click "Sign Up" on the homepage
   - Fill in your details (username, email, password, name)
   - Login with your new credentials

2. **Explore the Menu**
   - Browse categories (Appetizers, Main Course, Pasta, etc.)
   - View detailed item descriptions and prices
   - Check out featured items

3. **Place an Order**
   - Add items to your cart
   - Review your order and total
   - Confirm and track your order status
   - Earn loyalty points automatically

4. **Make a Reservation**
   - Select date and time
   - Choose party size
   - Add special requests in notes
   - Receive confirmation

5. **Join the Virtual Queue**
   - Add your party to the waiting list
   - Get estimated wait times
   - Receive SMS notifications when ready

6. **Leave Reviews**
   - Rate your dining experience (1-5 stars)
   - Write detailed comments
   - Help other customers make decisions

### User Dashboard

Access your personal dashboard to:
- View order history and spending statistics
- Track loyalty points and available rewards
- Manage reservations and queue entries
- Update profile information and preferences
- View personalized menu recommendations

## 📚 API Documentation

### Base URL
```
http://localhost:5001/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "name": "string",
  "email": "string",
  "phone": "string" (optional)
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

#### Get User Profile
```http
GET /auth/user?userId=1
```

### Restaurant & Menu Endpoints

#### Get Restaurant Info
```http
GET /restaurant
GET /restaurants/:id
```

#### Get Menu Categories
```http
GET /categories?restaurantId=1
```

#### Get Menu Items
```http
GET /menu-items?restaurantId=1&categoryId=1
GET /featured-items?restaurantId=1
```

### Order Endpoints

#### Create Order
```http
POST /orders
Content-Type: application/json

{
  "order": {
    "userId": 1,
    "restaurantId": 1,
    "totalPrice": 25.99,
    "status": "pending"
  },
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "price": 12.99
    }
  ]
}
```

#### Get User Orders
```http
GET /orders?userId=1
```

### Reservation Endpoints

#### Create Reservation
```http
POST /reservations
Content-Type: application/json

{
  "userId": 1,
  "restaurantId": 1,
  "date": "2024-12-25",
  "time": "19:00",
  "partySize": 4,
  "specialRequests": "Window table please"
}
```

#### Get User Reservations
```http
GET /user-reservations?userId=1
```

### Queue Endpoints

#### Join Queue
```http
POST /queue-entries
Content-Type: application/json

{
  "userId": 1,
  "restaurantId": 1,
  "partySize": 2,
  "phone": "555-123-4567"
}
```

#### Get Queue Status
```http
GET /user-queue-entry?userId=1&restaurantId=1
```

### Review Endpoints

#### Create Review
```http
POST /reviews
Content-Type: application/json

{
  "userId": 1,
  "restaurantId": 1,
  "orderId": 1,
  "rating": 5,
  "comment": "Excellent food and service!"
}
```

#### Get Reviews
```http
GET /reviews?restaurantId=1
GET /user-reviews?userId=1
```

### Loyalty & Rewards

#### Get Loyalty Rewards
```http
GET /loyalty-rewards?restaurantId=1
```

#### Get Personalized Recommendations
```http
GET /recommended-menu-items?userId=1&limit=5
```

## 📁 Project Structure

```
RestaurantRush/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   ├── pages/             # Page components
│   │   └── types/             # TypeScript type definitions
│   ├── public/                # Static assets
│   └── package.json
├── server/                     # Backend Express application
│   ├── routes.ts              # API route definitions
│   ├── storage.ts             # In-memory storage implementation
│   ├── pgStorage.ts           # PostgreSQL storage implementation
│   ├── index.ts               # Server entry point
│   ├── dbInit.ts              # Database initialization
│   └── services/              # External services (SMS, AI)
├── shared/                     # Shared code between client/server
│   └── schema.ts              # Database schema and validation
├── dist/                      # Built application files
├── start-app.sh               # Quick start script
├── package.json               # Root package configuration
└── README.md                  # This file
```

## 💻 Development

### Available Scripts

- `npm run dev` - Start development server (frontend only)
- `npm run server` - Start backend server in development mode
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations

### Development Workflow

1. **Make changes** to source files
2. **Test locally** using development servers
3. **Build and test** production build
4. **Commit changes** with descriptive messages
5. **Push to repository**

### Code Style

- Use **TypeScript** for type safety
- Follow **ESLint** rules for code consistency
- Use **Prettier** for code formatting
- Write **descriptive commit messages**
- Add **comments** for complex logic

### Database Setup (Optional)

By default, the application uses in-memory storage for simplicity. To use PostgreSQL:

1. **Install PostgreSQL**
2. **Create a database**
3. **Set environment variables**:
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost:5432/restaurantrush"
   ```
4. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

## 🏗️ CMS Setup (Content Management System)

RestaurantRush includes an integrated CMS system using Strapi for restaurant owners to manage their content.

### Quick CMS Setup

1. **Create Strapi CMS Instance**
   ```bash
   # From the project root directory
   npx create-strapi-app@latest cms --quickstart --skip-cloud
   cd cms
   npm run develop
   ```

2. **Access Strapi Admin**
   - Open `http://localhost:1337/admin`
   - Create your admin account
   - Configure content types (see below)

3. **Configure Content Types**

   Create these content types in Strapi admin panel:

   #### Restaurant Profile
   ```javascript
   {
     name: "Text (Required)",
     description: "Rich Text",
     address: "Text (Required)",
     phone: "Text (Required)", 
     email: "Email (Required)",
     website: "Text",
     logo: "Media (Single)",
     images: "Media (Multiple)",
     opening_hours: "JSON",
     cuisine_types: "Text (Multiple)",
     price_range: "Enumeration ($, $$, $$$, $$$$)",
     features: "Text (Multiple)"
   }
   ```

   #### Menu Categories
   ```javascript
   {
     name: "Text (Required)",
     description: "Rich Text",
     display_order: "Number",
     is_active: "Boolean (Default: true)",
     restaurant: "Relation (Restaurant)"
   }
   ```

   #### Menu Items
   ```javascript
   {
     name: "Text (Required)",
     description: "Rich Text (Required)",
     price: "Decimal (Required)",
     images: "Media (Multiple)",
     category: "Relation (Menu Category)",
     allergens: "Text (Multiple)",
     dietary_info: "Text (Multiple)",
     ingredients: "Text (Multiple)",
     prep_time: "Number",
     calories: "Number",
     is_featured: "Boolean",
     is_available: "Boolean (Default: true)"
   }
   ```

   #### AI Knowledge Base
   ```javascript
   {
     restaurant: "Relation (Restaurant)",
     faq_data: "JSON",
     policies: "JSON", 
     brand_voice: "Rich Text",
     special_instructions: "Rich Text",
     common_responses: "JSON"
   }
   ```

4. **Configure API Permissions**
   - Go to Settings > Users & Permissions > Roles
   - Edit "Public" role
   - Enable find and findOne for all content types

5. **Generate API Token**
   - Go to Settings > API Tokens
   - Create new token with "Read-only" access
   - Copy the token for environment variables

6. **Configure Environment Variables**
   ```bash
   # Add to your main app .env file
   ENABLE_CMS=true
   CMS_FIRST=false  # Set to true to prioritize CMS over local storage
   STRAPI_URL=http://localhost:1337
   STRAPI_API_TOKEN=your_generated_api_token
   CMS_CACHE_TIMEOUT=300000  # 5 minutes cache
   ```

7. **Start Both Services**
   ```bash
   # Terminal 1: Start main app
   ./start-app.sh
   
   # Terminal 2: Start Strapi CMS
   cd cms && npm run develop
   ```

### CMS Features

- 📝 **Content Management** - Restaurant owners can update menus, info, and policies
- 🖼️ **Media Library** - Upload and manage images for menu items
- 🔐 **Role-based Access** - Different permission levels for staff
- 🤖 **AI Integration** - Manage AI knowledge base and responses
- 📱 **Real-time Updates** - Changes reflect immediately in the app
- 💾 **Smart Caching** - Optimized performance with automatic cache management

## 🚀 Deployment

### Local Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   ./start-app.sh
   ```

### Production Deployment with CMS

#### Option 1: Railway (Recommended - Full Stack + CMS)

**Deploy Main Application:**
1. Connect your GitHub repository to Railway
2. Configure environment variables:
   ```bash
   PORT=5001
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   STRAPI_URL=https://your-cms-app.railway.app
   STRAPI_API_TOKEN=your_production_api_token
   ENABLE_CMS=true
   ```

**Deploy Strapi CMS:**
1. Create a new Railway service for CMS
2. Deploy from the `/cms` folder
3. Add PostgreSQL database
4. Configure environment variables:
   ```bash
   PORT=1337
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ADMIN_JWT_SECRET=your_jwt_secret
   API_TOKEN_SALT=your_api_token_salt
   APP_KEYS=your_app_keys
   JWT_SECRET=your_jwt_secret
   ```

#### Option 2: Vercel + Railway

**Frontend (Vercel):**
1. Deploy main app to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist/public`
4. Configure environment variables for API endpoints

**Backend + CMS (Railway):**
1. Deploy Express API to Railway
2. Deploy Strapi CMS to separate Railway service
3. Configure database and environment variables

#### Option 3: Heroku (Full Stack)

**Main Application:**
```bash
# Add buildpacks
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set STRAPI_URL=https://your-cms-app.herokuapp.com
heroku config:set STRAPI_API_TOKEN=your_token
heroku config:set ENABLE_CMS=true

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev
```

**Strapi CMS:**
```bash
# Create separate Heroku app for CMS
heroku create your-app-cms
cd cms

# Configure buildpack and database
heroku buildpacks:add heroku/nodejs
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=postgresql://...
```

#### Option 4: Digital Ocean/AWS

**Using Docker Compose:**

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5001:5001"
    environment:
      - STRAPI_URL=http://cms:1337
      - ENABLE_CMS=true
    depends_on:
      - postgres
      - cms

  cms:
    build: ./cms
    ports:
      - "1337:1337"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/strapi
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=restaurantrush
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Environment Variables Reference

**Main Application:**
```bash
# Core
PORT=5001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# CMS Integration
ENABLE_CMS=true
CMS_FIRST=false
STRAPI_URL=https://your-cms-domain.com
STRAPI_API_TOKEN=your_strapi_api_token
CMS_CACHE_TIMEOUT=300000

# External Services
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
OPENAI_API_KEY=your_openai_key
```

**Strapi CMS:**
```bash
# Core
PORT=1337
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/cms_db

# Security
ADMIN_JWT_SECRET=your_admin_jwt_secret
API_TOKEN_SALT=your_api_token_salt
APP_KEYS=key1,key2,key3,key4
JWT_SECRET=your_jwt_secret

# Upload
UPLOAD_PROVIDER=cloudinary  # or aws-s3
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
```

### Deployment Checklist

**Pre-deployment:**
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Strapi content types created
- [ ] API permissions configured
- [ ] Media upload provider configured
- [ ] SSL certificates configured

**Post-deployment:**
- [ ] Create Strapi admin user
- [ ] Import initial content
- [ ] Test all API endpoints
- [ ] Verify CMS integration
- [ ] Set up monitoring and backups

### Performance Optimization

**For Production:**
1. **Enable CMS caching** - Set appropriate cache timeouts
2. **Use CDN** - For media files and static assets
3. **Database optimization** - Index frequently queried fields
4. **Load balancing** - For high traffic scenarios
5. **Monitoring** - Set up error tracking and performance monitoring

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** if applicable
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Issues and Bug Reports

Please use GitHub Issues to report bugs or request features. Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- System information (OS, Node version, etc.)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by real restaurant management needs
- Thanks to all contributors and testers
- Special thanks to the open-source community

## 📞 Support

For support, please:
- Check the documentation above
- Search existing GitHub Issues
- Create a new issue if needed
- Contact the maintainers

---

**Happy coding! 🚀**

*RestaurantRush - Making restaurant management delicious and efficient.*