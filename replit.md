# RestaurantRush - Restaurant Management System

## Overview

RestaurantRush is a comprehensive full-stack restaurant management application that provides a complete solution for restaurant operations. The system includes customer-facing features like menu browsing, ordering, reservations, and loyalty rewards, along with an AI-powered assistant. It's built with modern web technologies and can integrate with a headless CMS for content management.

## System Architecture

### Monorepo Structure
The application follows a monorepo pattern with clearly separated client and server directories:
- **Frontend**: React application with TypeScript located in `/client`
- **Backend**: Express.js API server with TypeScript located in `/server`  
- **Shared**: Common schema definitions and types in `/shared`
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI components
- **Backend**: Express.js, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (configurable)
- **Authentication**: Session-based authentication with user management
- **State Management**: React Context API with custom hooks
- **Build System**: Vite for frontend, esbuild for backend

## Key Components

### Frontend Architecture
The client application uses a component-based architecture with:
- **Context Providers**: Authentication, Cart, Restaurant, Loyalty, AI Assistant
- **Custom Hooks**: useAuth, useCart, useLoyalty, useAiAssistant, useRestaurant
- **UI Components**: Built on Radix UI primitives with Tailwind CSS styling
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management

### Backend Architecture  
The server follows a RESTful API design with:
- **Route Handlers**: Organized API endpoints for all features
- **Storage Layer**: Abstracted storage interface with PostgreSQL and in-memory implementations
- **Services**: Dedicated services for AI, CMS integration, and notifications
- **Middleware**: CMS integration middleware for content fallback

### Core Features
1. **Menu Management**: Categories, items, modifiers, and featured items
2. **Order System**: Shopping cart, order placement, and tracking
3. **Reservation System**: Table booking with date/time selection
4. **Loyalty Program**: Points system with rewards and redemption
5. **AI Assistant**: Conversational interface for customer support
6. **User Authentication**: Registration, login, and profile management
7. **Queue Management**: Virtual queue system with SMS notifications

## Data Flow

### Database Schema
The application uses a comprehensive schema with the following main entities:
- **Users**: Authentication and profile data with loyalty points
- **Restaurants**: Basic restaurant information and settings  
- **Categories/MenuItems**: Menu structure with modifiers and pricing
- **Orders/OrderItems**: Order processing and item details
- **Reservations**: Table booking system
- **Loyalty System**: Rewards and point tracking
- **AI Conversations**: Chat history and context

### State Management
- **Client State**: Managed through React Context for cart, auth, and UI state
- **Server State**: Cached and synchronized using TanStack Query
- **Local Storage**: Used for cart persistence and user session

### API Design
RESTful endpoints organized by feature:
- `/api/auth/*` - Authentication and user management
- `/api/menu-items` - Menu and category operations  
- `/api/orders` - Order processing and history
- `/api/reservations` - Reservation management
- `/api/loyalty-rewards` - Loyalty program features
- `/api/ai-assistant/*` - AI conversation handling

## External Dependencies

### Required Services
- **PostgreSQL Database**: Primary data storage (configurable via DATABASE_URL)
- **Twilio SMS**: Optional SMS notifications for queue and reservations
- **OpenAI API**: Powers the AI assistant functionality

### Optional Integrations
- **Strapi CMS**: Headless CMS for content management (configurable)
- **Cloudinary/AWS S3**: Media storage for images (configurable)

### CMS Integration
The system supports optional Strapi CMS integration with:
- Content fallback when local data is unavailable
- Caching layer for improved performance  
- Health checks and cache management endpoints
- Configurable priority (CMS-first vs local-first)

## Deployment Strategy

### Development Environment
- Uses Replit with Node.js 20, PostgreSQL 16, and web modules
- Development server runs on port 5000 with hot reloading
- Database migrations handled through Drizzle Kit

### Production Deployment
- Containerized with Docker and docker-compose support
- Build process compiles both frontend and backend
- Health checks configured for monitoring
- Environment-based configuration through .env files

### Build Process
1. Frontend build using Vite (outputs to `dist/public`)
2. Backend build using esbuild (outputs to `dist`)
3. Database schema deployment through Drizzle migrations
4. Static asset serving through Express

### Configuration Management
Extensive environment variable support for:
- Database connections and credentials
- External service API keys and configuration
- CMS integration settings
- Security secrets and tokens

## Recent Changes
- June 14, 2025: Successfully connected PostgreSQL database with comprehensive test data
- Database seeded with Bella Vista Bistro restaurant data, 8 menu items, 3 test users, loyalty rewards
- Completed customer and restaurant owner testing workflows - all features operational
- System verified ready for production use with real data persistence

## Changelog
- June 14, 2025. Initial setup
- June 14, 2025. Database connection and comprehensive testing completed

## User Preferences

Preferred communication style: Simple, everyday language.