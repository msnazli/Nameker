# Nameker - Telegram Mini App

A powerful name generation platform built as a Telegram Mini App using modern web technologies and a monorepo architecture.

## 🌟 Overview

Nameker is a sophisticated name generation platform that helps users create unique and meaningful names based on various parameters such as topic, description, language, and style preferences. The platform is integrated with Telegram's Mini App ecosystem and offers a seamless user experience with features like payment integration, multilingual support, and theme customization.

## 🏗️ Project Structure

The project follows a monorepo architecture using Turborepo for efficient workspace management:

```
nameker/
├── packages/
│   ├── admin-panel/     # Admin dashboard for managing the platform
│   ├── admin-api/       # Backend API for admin operations
│   ├── miniapp/         # Telegram Mini App frontend
│   ├── database/        # Shared database schemas and migrations
│   └── shared/          # Shared utilities and types
└── package.json         # Root workspace configuration
```

### Key Components

#### 1. Mini App (packages/miniapp)
- **Core Features**:
  - Name generation with customizable parameters
  - History tracking of generated names
  - User preferences management
  - Payment integration (TON & Zarinpal)
  - Responsive design
  - Dark/Light theme support
  - Multilingual support (English & Persian)

- **Key Pages**:
  - Home: Landing page with feature showcase
  - Generator: Name generation interface
  - History: Past generations list with filters
  - Settings: User preferences
  - Payment: Credit package selection

#### 2. Admin Panel (packages/admin-panel)
- Dashboard for platform management
- User management
- Generation statistics
- Payment tracking
- Content moderation

#### 3. Backend Services
- **Admin API**: RESTful endpoints for admin operations
- **Database**: Prisma-based data management
- **Shared**: Common utilities and type definitions

## 🚀 Technology Stack

### Frontend (Mini App & Admin Panel)
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- i18next for internationalization
- Telegram Web App SDK
- React Query for data fetching
- Zustand for state management

### Backend
- Node.js with Express
- Prisma ORM
- PostgreSQL database
- JWT authentication
- Redis for caching
- WebSocket for real-time features

### DevOps & Tools
- Turborepo for monorepo management
- ESLint & Prettier for code quality
- Jest for testing
- GitHub Actions for CI/CD
- Docker for containerization

## 🛠️ Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/nameker/nameker-miniapp.git
   cd nameker
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env` in each package
   - Configure environment variables:
     - Database connections
     - API keys
     - Telegram Bot token
     - Payment gateway credentials

4. **Database Setup**
   ```bash
   cd packages/database
   npx prisma migrate dev
   ```

5. **Start Development Servers**
   ```bash
   npm run dev
   ```

## 🔐 Security

- JWT-based authentication
- Secure payment processing
- Rate limiting
- Input validation
- XSS protection
- CORS configuration
- Environment variable protection

## 🌍 Internationalization

The platform supports multiple languages with easy addition of new ones:
- English (default)
- Persian (فارسی)
- Extensible language system

## 💳 Payment Integration

- TON Blockchain integration
- Zarinpal payment gateway (for Iranian users)
- Credit package system
- Transaction history
- Automatic credit management

## 🎨 Themes

- Light theme
- Dark theme
- System preference detection
- Customizable color schemes

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop support
- Telegram Mini App UI guidelines compliance

## 🔄 State Management

- Centralized state with Zustand
- Persistent storage
- Real-time synchronization
- Optimistic updates

## 🧪 Testing

- Unit tests with Jest
- Integration tests
- E2E tests with Cypress
- API endpoint testing

## 📈 Performance

- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Bundle size optimization

## 📝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- Frontend Developers
- Backend Developers
- UI/UX Designers
- DevOps Engineers
- QA Engineers

## 📞 Support

For support, please contact us through:
- Telegram: @nameker_support
- Email: support@nameker.com
- GitHub Issues  