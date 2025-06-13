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

### Cloud Deployment

The application can be deployed to various platforms:

#### Vercel (Recommended for Frontend)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist/public`

#### Heroku (Full-stack)
1. Create a Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy via Git push

#### Railway/Render
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Environment Variables

For production deployment, configure:

```bash
PORT=5001
NODE_ENV=production
DATABASE_URL=postgresql://...
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

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