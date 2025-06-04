# Nameker - Professional Name Generator MiniApp

A Telegram MiniApp for generating professional names using AI, with multi-language support and an admin panel.

## Features

- Professional name generation using AI
- Multi-language support (English/Persian)
- Theme support (light/dark)
- User credit system
- Admin panel for system management
- Secure payment integration (Zarinpal, TON)
- JWT-based authentication
- Rate limiting and security features

## Tech Stack

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, TypeScript, Vite
- **UI Framework**: Material-UI
- **State Management**: React Query
- **Internationalization**: i18next
- **API Integration**: OpenAI, Telegram Bot API

## Prerequisites

- Node.js >= 18.0.0
- MongoDB
- Telegram Bot Token
- OpenAI API Key

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
BOT_TOKEN=your_telegram_bot_token
OPENAI_API_KEY=your_openai_api_key
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd src/miniapp && npm install
   cd src/admin && npm install
   ```

## Development

```bash
# Run backend in development mode
npm run dev

# Run MiniApp frontend
npm run client

# Run admin panel
npm run admin
```

## Production Deployment on Railway

1. Fork this repository to your GitHub account.

2. Create a new project on [Railway](https://railway.app):
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your forked repository
   - Click "Deploy Now"

3. Set up environment variables in Railway:
   - Go to your project settings
   - Click on "Variables"
   - Add all required environment variables from `.env.example`

4. Configure MongoDB:
   - Add a MongoDB plugin from Railway
   - Railway will automatically add the `MONGODB_URI` variable

5. Configure the domain:
   - Go to "Settings" > "Domains"
   - Railway will provide a production URL
   - Update your Telegram Bot's WebApp URL with this domain

6. Monitor deployment:
   - Railway will automatically build and deploy your application
   - Check the "Deployments" tab for build status and logs

The application includes:
- Automatic MongoDB connection retry
- Production-optimized logging
- Graceful shutdown handling
- Security headers and CORS configuration
- Rate limiting
- Static file serving for the MiniApp

## API Endpoints

- `/api/auth` - Authentication routes
- `/api/names` - Name generation and management
- `/api/admin` - Admin panel operations
- `/api/payment` - Payment processing
- `/health` - Health check endpoint

## License

ISC

## Author

[Your Name] 


Nameker - Professional Name Generator MiniApp
Project Overview
Nameker is a Telegram MiniApp that provides AI-powered professional name generation services. The application is built with a modern tech stack, featuring both backend and frontend components, and is designed to be deployed on Railway.
Technical Stack
Backend
Runtime: Node.js
Framework: Express.js
Database: MongoDB
Authentication: JWT
Security: Helmet, CORS, Rate Limiting
Logging: Winston
Bot Integration: Telegraf
Frontend
Framework: React with TypeScript
Build Tool: Vite
UI Framework: React Bootstrap
State Management: React Query
Routing: React Router DOM
Internationalization: i18next
Telegram Integration: @twa-dev/sdk
Core Features
1. Name Generation
AI-powered name generation based on categories and descriptions
Support for multiple languages (English/Persian)
Category-based filtering (Business, Product, Brand)
Credit-based usage system
2. User Management
JWT-based authentication using Telegram credentials
User credit system
Subscription management (Free/Premium/Business tiers)
3. Theme Support
Light/Dark/System theme options
Telegram WebApp theme integration
Responsive design
4. Multi-language Support
English and Persian language support
RTL layout support for Persian
Language-specific name generation
5. Payment Integration
Multiple credit package options
Secure payment processing
Credit purchase history

## Project Structure

### Backend (`/src/backend`)
```
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
└── server.js
```

### Frontend (`/src/miniapp`)
```
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── providers/
│   ├── services/
│   └── App.tsx
├── index.html
└── vite.config.ts
```

## Key Components

### 1. Authentication System
- Implemented in `AuthProvider.tsx`
- Handles Telegram WebApp authentication
- Manages JWT tokens and user sessions

### 2. Theme Management
- Implemented in `ThemeProvider.tsx`
- Syncs with Telegram WebApp theme
- Persists user theme preferences

### 3. Layout Component
- Responsive navigation
- Dynamic Telegram MainButton integration
- Footer with copyright information

### 4. Core Pages
- **Generator**: Name generation interface
- **History**: Past generations history
- **Payment**: Credit purchase interface
- **Settings**: User preferences management

## Security Features
1. Helmet.js for security headers
2. Rate limiting for API endpoints
3. CORS configuration for production
4. JWT-based authentication
5. Environment variable management
6. Secure payment processing

## Production Readiness
1. Configured for Railway deployment
2. Production build optimization
3. Error handling and logging
4. Health check endpoint
5. Graceful shutdown handling
6. Static file serving
7. PWA support

## Development Features
1. Hot module replacement
2. TypeScript support
3. Source maps
4. Code splitting
5. Development proxy configuration
6. ESLint and Prettier integration

## Deployment Configuration
- Procfile for Railway deployment
- Environment variable templates
- Build scripts in package.json
- MongoDB integration setup
- Domain configuration support

## Current Status
The project is fully structured and implemented with all core features. It includes:
1. Complete backend API implementation
2. Functional frontend components
3. Authentication and authorization
4. Theme and language support
5. Payment integration
6. Production-ready configuration

## Next Steps
1. Deploy to Railway
2. Set up monitoring and analytics
3. Implement user feedback system
4. Add more language options
5. Expand name generation categories
6. Implement caching for better performance

This project demonstrates a well-structured, production-ready Telegram MiniApp with modern development practices, security considerations, and user-friendly features. The codebase is maintainable, scalable, and follows best practices for both frontend and backend development.  