# 🏗️ CMS Setup Guide for RestaurantRush

This guide will help you set up Strapi CMS for restaurant owners to manage their content.

## 📋 Quick Setup

### 1. Create Strapi CMS Instance

```bash
# From the project root directory
npx create-strapi-app@latest cms --quickstart --skip-cloud
cd cms
```

### 2. Configure Content Types

Create the following content types in Strapi admin panel:

#### Restaurant Profile
- name (Text, Required)
- description (Rich Text)
- address (Text, Required)
- phone (Text, Required)
- email (Email, Required)
- website (Text)
- logo (Media, Single)
- images (Media, Multiple)
- opening_hours (JSON)
- cuisine_types (Text, Multiple)
- price_range (Enumeration: $, $$, $$$, $$$$)
- features (Text, Multiple)

#### Menu Categories
- name (Text, Required)
- description (Rich Text)
- display_order (Number)
- is_active (Boolean, Default: true)
- restaurant (Relation: Restaurant)

#### Menu Items
- name (Text, Required)
- description (Rich Text, Required)
- price (Decimal, Required)
- images (Media, Multiple)
- category (Relation: Menu Category)
- allergens (Text, Multiple)
- dietary_info (Text, Multiple)
- ingredients (Text, Multiple)
- prep_time (Number)
- calories (Number)
- is_featured (Boolean)
- is_available (Boolean, Default: true)

#### AI Knowledge Base
- restaurant (Relation: Restaurant)
- faq_data (JSON)
- policies (JSON)
- brand_voice (Rich Text)
- special_instructions (Rich Text)
- common_responses (JSON)

### 3. Configure API Integration

Add environment variables to your main app:

```bash
# In your main .env file
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_strapi_api_token
```

### 4. Start Both Services

```bash
# Terminal 1: Start main app
./start-app.sh

# Terminal 2: Start Strapi CMS
cd cms && npm run develop
```

## 🚀 Production Deployment

### Railway Deployment
1. Deploy main app to Railway
2. Deploy Strapi to separate Railway service
3. Connect with environment variables

### Vercel + Railway
1. Deploy main app to Vercel
2. Deploy Strapi to Railway
3. Configure CORS and API tokens

See full deployment instructions in main README.md